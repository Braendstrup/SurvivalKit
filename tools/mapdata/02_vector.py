#!/usr/bin/env python3
"""Trin 2: OSM-udsnit + højdekurver -> vektorfliser (MVT) i PMTiles + offline søgeindeks.

Brug: 02_vector.py <arbejdsmappe>
Kræver: 01_extract.py og 03_dem.py er kørt.
"""
import sys, os, json, math, gzip, collections
import numpy as np
import osmium
import shapely
import shapely.wkb as swkb
from shapely.geometry import shape, box, LineString, Point, MultiLineString, mapping
from shapely.ops import unary_union, polygonize, transform as stransform
from shapely.strtree import STRtree
from pyproj import Transformer
import mapbox_vector_tile as mvt
from pmtiles.writer import Writer
from pmtiles.tile import zxy_to_tileid, TileType, Compression

work = sys.argv[1]
minx, miny, maxx, maxy = json.load(open(os.path.join(work, "bbox.json")))["bbox"]
region = shape(json.load(open(os.path.join(work, "region.geojson")))["geometry"])
BBOX = box(minx, miny, maxx, maxy)
ZMIN, ZMAX = 8, 14
EXT = 4096
R = 6378137.0
def merc(lon, lat):
    return R * math.radians(lon), R * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
_to_m = Transformer.from_crs(4326, 3857, always_xy=True).transform
def to_m(g): return shapely.transform(g, lambda c: np.column_stack(_to_m(c[:, 0], c[:, 1])))

wkb = osmium.geom.WKBFactory()
def W(b): return swkb.loads(b, hex=True)

# ------------------------------------------------------------------ klassifikation
HW = {"motorway": "motorway", "motorway_link": "motorway", "trunk": "trunk", "trunk_link": "trunk",
      "primary": "primary", "primary_link": "primary", "secondary": "secondary", "secondary_link": "secondary",
      "tertiary": "tertiary", "tertiary_link": "tertiary", "unclassified": "minor", "residential": "minor",
      "living_street": "minor", "service": "service", "track": "track", "path": "path", "footway": "path",
      "bridleway": "path", "cycleway": "cycleway", "pedestrian": "path", "steps": "path"}
ROAD_MINZ = {"motorway": 8, "trunk": 8, "primary": 8, "secondary": 9, "tertiary": 10, "minor": 11,
             "service": 13, "track": 12, "path": 13, "cycleway": 12, "rail": 9, "ferry": 8}
WATERWAY = {"river": "river", "stream": "stream", "canal": "canal", "ditch": "ditch", "drain": "ditch"}

def landuse_class(t):
    lu, nat, lei = t.get("landuse"), t.get("natural"), t.get("leisure")
    if lu == "forest" or nat == "wood": return "forest"
    if nat in ("heath",): return "heath"
    if nat in ("scrub",): return "scrub"
    if nat in ("wetland",): return "wetland"
    if nat in ("beach", "sand", "shingle"): return "beach"
    if lu in ("meadow",) or nat == "grassland": return "grass"
    if lu in ("farmland", "farmyard", "orchard", "vineyard", "greenhouse_horticulture", "allotments"): return "farmland"
    if lu in ("residential", "commercial", "retail", "industrial", "garages", "railway", "education", "institutional"): return "urban"
    if lei in ("park", "garden", "playground", "pitch", "golf_course", "sports_centre", "recreation_ground") or lu in ("recreation_ground", "village_green", "grass", "cemetery"): return "green"
    if lu in ("quarry", "landfill", "construction", "brownfield"): return "bare"
    if nat in ("bare_rock", "scree", "cliff"): return "bare"
    return None

def water_class(t):
    if t.get("natural") == "water" or t.get("waterway") == "riverbank" or t.get("landuse") in ("reservoir", "basin"):
        return t.get("water") or ("river" if t.get("waterway") == "riverbank" else "lake")
    return None

def poi_class(t):
    a, to, le, em, mm, na, ra, hi = (t.get(k) for k in ("amenity", "tourism", "leisure", "emergency", "man_made", "natural", "railway", "historic"))
    if a == "drinking_water": return "drinking_water"
    if mm == "water_tap" and t.get("drinking_water") != "no": return "drinking_water"
    if a == "toilets": return "toilets"
    if a == "shelter" or to == "wilderness_hut": return "shelter"
    if le == "firepit": return "firepit"
    if to in ("camp_site", "caravan_site"): return "camp_site"
    if a == "parking" and t.get("parking") != "street_side" and t.get("access") != "private": return "parking"
    if a == "hospital": return "hospital"
    if a == "police": return "police"
    if a == "fire_station": return "fire_station"
    if em == "defibrillator": return "aed"
    if a == "pharmacy": return "pharmacy"
    if to == "viewpoint": return "viewpoint"
    if to == "picnic_site": return "picnic"
    if le == "marina" or mm == "pier" and t.get("name"): return "harbour"
    if na == "spring": return "spring"
    if ra in ("station", "halt") and t.get("name"): return "station"
    if mm in ("lighthouse", "water_tower", "tower") and t.get("name"): return "landmark"
    if hi == "windmill" and t.get("name"): return "landmark"
    if a == "ferry_terminal": return "ferry"
    return None

PLACE = {"city": 1, "town": 2, "village": 3, "hamlet": 4, "suburb": 4, "island": 3, "islet": 5, "locality": 5, "isolated_dwelling": 6}
PLACE_MINZ = {1: 8, 2: 8, 3: 10, 4: 12, 5: 12, 6: 14}

def clean(d): return {k: v for k, v in d.items() if v not in (None, "")}

# ------------------------------------------------------------------ OSM læsning
feats = collections.defaultdict(list)  # layer -> [(geom_in_mercator, props, minz)]
search = []
coast = []
n_obj = 0

def add(layer, geom, props, minz=ZMIN):
    if geom is None or geom.is_empty: return
    feats[layer].append((geom, clean(props), minz))

def add_search(kind, name, lon, lat, extra=None):
    if name: search.append([name, kind, round(lon, 5), round(lat, 5)] + ([extra] if extra else []))

fp = osmium.FileProcessor(os.path.join(work, "djursland.osm.pbf")).with_areas()
for o in fp:
    n_obj += 1
    t = o.tags
    if len(t) == 0: continue
    if o.is_node():
        if not o.location.valid(): continue
        lon, lat = o.location.lon, o.location.lat
        if not BBOX.contains(Point(lon, lat)): continue
        pt = Point(*merc(lon, lat))
        name = t.get("name")
        pl = t.get("place")
        if pl in PLACE and name:
            r = PLACE[pl]; add("place", pt, {"name": name, "class": pl, "rank": r}, PLACE_MINZ[r])
            add_search("place:" + pl, name, lon, lat)
        elif t.get("natural") == "peak" and name:
            add("place", pt, {"name": name, "class": "peak", "ele": t.get("ele"), "rank": 5}, 12)
            add_search("peak", name, lon, lat, t.get("ele"))
        elif t.get("natural") in ("bay", "cape", "beach", "strait", "point") and name:
            add("place", pt, {"name": name, "class": t["natural"], "rank": 5}, 12)
            add_search("natural:" + t["natural"], name, lon, lat)
        elif t.get("natural") == "peak":
            add("place", pt, {"name": "", "class": "peak", "ele": t.get("ele"), "rank": 6}, 13)
        pc = poi_class(t)
        if pc:
            add("poi", pt, {"class": pc, "name": name, "access": t.get("access"), "ele": t.get("ele"),
                            "note": t.get("description") or t.get("note") or t.get("defibrillator:location") or t.get("opening_hours"),
                            "shelter_type": t.get("shelter_type"), "emergency": t.get("emergency"),
                            "fee": t.get("fee"), "operator": t.get("operator")}, 11 if pc in ("hospital", "police", "fire_station") else 12)
            if name and pc not in ("aed",): add_search("poi:" + pc, name, lon, lat)
    elif o.is_way() and not o.is_closed() or (o.is_way() and (t.get("highway") or t.get("waterway") or t.get("railway") or t.get("natural") == "coastline" or t.get("route") == "ferry")):
        try: ls = W(wkb.create_linestring(o))
        except Exception: continue
        if ls.is_empty: continue
        if t.get("natural") == "coastline":
            coast.append(ls); continue
        hw = t.get("highway")
        cls = None
        if hw in HW: cls = HW[hw]
        elif t.get("railway") in ("rail", "light_rail") and t.get("service") is None: cls = "rail"
        elif t.get("route") == "ferry": cls = "ferry"
        ww = t.get("waterway")
        if cls:
            if t.get("area") == "yes": continue
            if hw in ("footway",) and t.get("footway") in ("sidewalk", "crossing"): continue
            g = to_m(ls)
            add("road", g, {"class": cls, "name": t.get("name"), "ref": t.get("ref"), "surface": t.get("surface"),
                            "bridge": 1 if t.get("bridge") not in (None, "no") else None,
                            "tunnel": 1 if t.get("tunnel") not in (None, "no") else None,
                            "access": t.get("access"), "tracktype": t.get("tracktype")}, ROAD_MINZ.get(cls, 12))
            if t.get("name") and cls not in ("service",):
                c = ls.interpolate(0.5, normalized=True); add_search("road", t["name"], c.x, c.y)
        elif ww in WATERWAY:
            if t.get("tunnel") == "culvert": continue
            add("waterway", to_m(ls), {"class": WATERWAY[ww], "name": t.get("name")}, {"river": 8, "canal": 10, "stream": 11, "ditch": 14}[WATERWAY[ww]])
            if t.get("name"):
                c = ls.interpolate(0.5, normalized=True); add_search("waterway", t["name"], c.x, c.y)
    elif o.is_area():
        try: g = W(wkb.create_multipolygon(o))
        except Exception: continue
        if g.is_empty or not g.is_valid: g = g.buffer(0)
        if g.is_empty: continue
        rp = g.representative_point(); name = t.get("name")
        gm = to_m(g)
        area_m2 = gm.area
        if t.get("building") and t["building"] != "no":
            add("building", gm, {"class": t["building"] if t["building"] in ("house", "apartments", "church", "industrial", "farm") else "yes", "name": name}, 14)
        wc = water_class(t)
        if wc:
            add("water", gm, {"class": wc, "name": name}, 8 if area_m2 > 5e5 else 11)
            if name and area_m2 > 2e4: add_search("water", name, rp.x, rp.y)
        lc = landuse_class(t)
        if lc:
            add("landuse", gm, {"class": lc, "name": name}, 8 if (lc in ("forest", "heath", "urban", "wetland") and area_m2 > 2e5) else 11)
            if name and lc in ("forest", "heath", "wetland", "green", "beach") and area_m2 > 5e4:
                add_search("land:" + lc, name, rp.x, rp.y)
        if t.get("boundary") in ("protected_area", "national_park") or t.get("leisure") == "nature_reserve":
            add("protected", gm, {"name": name, "class": t.get("boundary") or "nature_reserve", "protect_class": t.get("protect_class"),
                                  "title": t.get("protection_title"), "designation": t.get("designation")}, 8)
            if name: add_search("protected", name, rp.x, rp.y)
        pc = poi_class(t)
        if pc:
            add("poi", Point(*merc(rp.x, rp.y)), {"class": pc, "name": name, "access": t.get("access"),
                "note": t.get("description") or t.get("note") or t.get("opening_hours"), "shelter_type": t.get("shelter_type"),
                "emergency": t.get("emergency"), "fee": t.get("fee"), "operator": t.get("operator"), "area": 1},
                11 if pc in ("hospital", "police", "fire_station") else 12)
            if name and pc != "parking": add_search("poi:" + pc, name, rp.x, rp.y)
        if name and (wc or lc in ("forest", "heath", "wetland") or t.get("boundary") in ("protected_area", "national_park") or t.get("leisure") == "nature_reserve") and area_m2 > 1e5:
            kind = "protected" if (t.get("boundary") or t.get("leisure") == "nature_reserve") else ("water" if wc else lc)
            add("name_poly", Point(*merc(rp.x, rp.y)), {"name": name, "class": kind, "area": int(area_m2)}, 10 if area_m2 > 2e6 else 12)
print("OSM-objekter læst:", n_obj, {k: len(v) for k, v in feats.items()}, "kystlinjer:", len(coast))

# ------------------------------------------------------------------ land/hav fra kystlinje
lines = unary_union([c.intersection(BBOX) for c in coast] + [BBOX.exterior])
faces = list(polygonize(lines))
def _is_land(f):
    i = f.intersection(region).area
    return i > 1e-5 or (f.area > 0 and i / f.area > 0.5)  # havflader rammer kun regionen med tynde slivers
land_faces = [f for f in faces if _is_land(f)]
print("kystflader:", len(faces), "land:", len(land_faces), "areal land/andet:", sum(f.area for f in land_faces), BBOX.area)
land = unary_union(land_faces)
add("land", to_m(land), {}, ZMIN)
add("boundary", to_m(region.boundary), {"class": "djursland"}, ZMIN)

# ------------------------------------------------------------------ højdekurver
from scipy.ndimage import gaussian_filter
from skimage import measure
dem = np.load(os.path.join(work, "dem_z13.npy")).astype(np.float64)
dj = json.load(open(os.path.join(work, "dem_z13.json")))
dem = np.where(np.isnan(dem), -9999, dem)
sm = gaussian_filter(dem, 1.2)
land_m = to_m(land)
def px2m(rc):
    x = (dj["x0"] * 256 + rc[:, 1] + 0.5) / (256 * 2 ** dj["z"]); y = (dj["y0"] * 256 + rc[:, 0] + 0.5) / (256 * 2 ** dj["z"])
    return np.column_stack([(x - 0.5) * 2 * math.pi * R, (0.5 - y) * 2 * math.pi * R])
ncont = 0
for lev in range(5, int(sm.max()) + 1, 5):
    for c in measure.find_contours(sm, lev):
        if len(c) < 6: continue
        g = LineString(px2m(c)).simplify(8)
        g = g.intersection(land_m)
        if g.is_empty: continue
        major = lev % 25 == 0
        add("contour", g, {"ele": lev, "major": 1 if major else 0}, 10 if major else 12); ncont += 1
print("højdekurver:", ncont, "max højde i model:", round(float(sm.max()), 1))

# ------------------------------------------------------------------ fliser
def tile_bounds(z, x, y):
    s = 2 * math.pi * R / 2 ** z
    x0 = -math.pi * R + x * s; y1 = math.pi * R - y * s
    return x0, y1 - s, x0 + s, y1

# spatial index pr. lag
idx = {}
for layer, items in feats.items():
    idx[layer] = (STRtree([g for g, _, _ in items]), items)

def tile_xy_range(z):
    s = 2 * math.pi * R / 2 ** z
    bm = to_m(BBOX)
    x0 = int((bm.bounds[0] + math.pi * R) // s); x1 = int((bm.bounds[2] + math.pi * R) // s)
    y0 = int((math.pi * R - bm.bounds[3]) // s); y1 = int((math.pi * R - bm.bounds[1]) // s)
    return range(x0, x1 + 1), range(y0, y1 + 1)

MIN_AREA_PX = 3
def build_tile(z, x, y):
    bx0, by0, bx1, by1 = tile_bounds(z, x, y)
    unit = (bx1 - bx0) / EXT
    pad = unit * 64
    clip = box(bx0 - pad, by0 - pad, bx1 + pad, by1 + pad)
    out = []
    for layer, (tree, items) in idx.items():
        fl = []
        for i in tree.query(clip):
            g, p, mz = items[i]
            if mz > z: continue
            gt = g.geom_type
            if gt in ("Polygon", "MultiPolygon"):
                if g.area < (unit * MIN_AREA_PX * (1 if z >= ZMAX else 2)) ** 2 and layer != "protected": continue
            try:
                c = g.intersection(clip)
            except Exception:
                c = g.buffer(0).intersection(clip)
            if c.is_empty: continue
            if gt != "Point" and z < ZMAX:
                c = c.simplify(unit * 0.8, preserve_topology=True)
                if c.is_empty: continue
            if layer == "poi" or layer == "place" or layer == "name_poly":
                if not clip.contains(g): continue
            fl.append({"geometry": c, "properties": p})
        if fl: out.append({"name": layer, "features": fl})
    if not out: return None
    return gzip.compress(mvt.encode(out, default_options={"quantize_bounds": (bx0, by0, bx1, by1), "extents": EXT, "y_coord_down": False}), 9)

out = os.path.join(work, "djursland-vector.pmtiles")
count = 0; total = 0
tiles = []
for z in range(ZMIN, ZMAX + 1):
    xr, yr = tile_xy_range(z)
    for x in xr:
        for y in yr:
            tiles.append((z, x, y))
tiles.sort(key=lambda t: zxy_to_tileid(*t))
print("fliser at tjekke:", len(tiles), flush=True)
with open(out, "wb") as f:
    w = Writer(f)
    for i, (z, x, y) in enumerate(tiles):
        b = build_tile(z, x, y)
        if b is None: continue
        w.write_tile(zxy_to_tileid(z, x, y), b); count += 1; total += len(b)
        if i % 100 == 0: print(i, z, count, total // 1024, "kB", flush=True)
    w.finalize({"tile_type": TileType.MVT, "tile_compression": Compression.GZIP, "min_zoom": ZMIN, "max_zoom": ZMAX,
                "min_lon_e7": int(minx * 1e7), "min_lat_e7": int(miny * 1e7), "max_lon_e7": int(maxx * 1e7), "max_lat_e7": int(maxy * 1e7),
                "center_zoom": 10, "center_lon_e7": int((minx + maxx) / 2 * 1e7), "center_lat_e7": int((miny + maxy) / 2 * 1e7)},
               {"name": "Djursland OSM vektorfliser", "attribution": "(c) OpenStreetMap-bidragydere (ODbL)",
                "vector_layers": [{"id": k, "fields": {}} for k in feats.keys()]})
print("vektorpakke:", out, os.path.getsize(out) // 1024, "kB,", count, "fliser")

# ------------------------------------------------------------------ søgeindeks
seen = set(); res = []
for e in search:
    # de-duplikér veje/vandløb med samme navn tæt på hinanden (~2 km gitter)
    key = (e[0], e[1], round(e[2] * 50), round(e[3] * 90)) if e[1] in ("road", "waterway") else (e[0], e[1], round(e[2], 4), round(e[3], 4))
    if key in seen: continue
    seen.add(key); res.append(e)
res.sort(key=lambda e: e[0].lower())
json.dump({"fields": ["navn", "type", "lon", "lat", "ekstra"], "items": res}, open(os.path.join(work, "djursland-search.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print("søgeindeks:", len(res), "poster")
