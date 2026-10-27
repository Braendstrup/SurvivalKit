#!/usr/bin/env python3
"""Trin 1: Afgræns Djursland ud fra OSM-kommunegrænser (Syddjurs + Norddjurs) og
udtræk et bbox-udsnit af Danmarks-PBF'en til videre behandling.

Brug: 01_extract.py <denmark.osm.pbf> <arbejdsmappe>
"""
import sys, os, json
import osmium
from osmium.osm import NODE, WAY, RELATION
import shapely.wkb as swkb
from shapely.ops import unary_union, transform
from shapely.geometry import box, mapping
from pyproj import Transformer

src, work = sys.argv[1], sys.argv[2]
os.makedirs(work, exist_ok=True)
NAMES = {"Syddjurs Kommune", "Norddjurs Kommune"}

# --- 1a: find kommunerelationer -------------------------------------------------
rel_ids = {}
for r in osmium.FileProcessor(src, RELATION):
    t = r.tags
    if t.get("boundary") == "administrative" and t.get("admin_level") == "7" and t.get("name") in NAMES:
        rel_ids[r.id] = t["name"]
print("kommunerelationer:", rel_ids)
assert len(rel_ids) == 2, "forventede to kommunerelationer"

munic_pbf = os.path.join(work, "municipalities.osm.pbf")
with osmium.BackReferenceWriter(munic_pbf, src, overwrite=True, remove_tags=False) as w:
    for r in osmium.FileProcessor(src, RELATION):
        if r.id in rel_ids:
            w.add_relation(r)

# --- 1b: byg kommunepolygoner --------------------------------------------------
wkb = osmium.geom.WKBFactory()
polys = {}
for a in osmium.FileProcessor(munic_pbf).with_areas():
    if a.is_area() and a.from_way() is False and a.orig_id() in rel_ids:
        polys[rel_ids[a.orig_id()]] = swkb.loads(wkb.create_multipolygon(a), hex=True)
print({k: round(v.area, 4) for k, v in polys.items()})
land = unary_union(list(polys.values()))
parts = list(land.geoms) if land.geom_type == "MultiPolygon" else [land]
# Anholt (Norddjurs Kommune) ligger ~50 km ude i Kattegat og udelades bevidst.
main = [p for p in parts if p.centroid.x < 11.2]
dropped = [p for p in parts if p.centroid.x >= 11.2]
print("dele beholdt:", len(main), "udeladt (Anholt e.l.):", [tuple(round(c, 2) for c in p.centroid.coords[0]) for p in dropped])
region = unary_union(main)

to_utm = Transformer.from_crs(4326, 25832, always_xy=True).transform
to_ll = Transformer.from_crs(25832, 4326, always_xy=True).transform
buf = transform(to_ll, transform(to_utm, region).buffer(3000))
minx, miny, maxx, maxy = buf.bounds
print("bbox (buffer 3 km):", minx, miny, maxx, maxy)
json.dump({"type": "Feature", "properties": {"name": "Djursland (Syddjurs+Norddjurs kommune, ekskl. Anholt)"},
           "geometry": mapping(region)}, open(os.path.join(work, "region.geojson"), "w"))
json.dump({"bbox": [minx, miny, maxx, maxy]}, open(os.path.join(work, "bbox.json"), "w"))

# --- 1c: udtræk bbox ----------------------------------------------------------------
bb = box(minx, miny, maxx, maxy)
out = os.path.join(work, "djursland.osm.pbf")
def inb(lon, lat): return minx <= lon <= maxx and miny <= lat <= maxy
way_ids, node_ids = set(), set()
n_n = n_w = n_r = 0
with osmium.BackReferenceWriter(out, src, overwrite=True, remove_tags=False, relation_depth=1) as w:
    for o in osmium.FileProcessor(src, NODE | WAY | RELATION).with_locations():
        if o.is_node():
            if o.location.valid() and inb(o.location.lon, o.location.lat):
                node_ids.add(o.id); w.add_node(o); n_n += 1
        elif o.is_way():
            nodes = o.nodes; n = len(nodes)
            if n == 0: continue
            step = max(1, n // 24)
            hit = False
            for i in list(range(0, n, step)) + [n - 1]:
                loc = nodes[i].location
                if loc.valid() and inb(loc.lon, loc.lat):
                    hit = True; break
            if hit:
                way_ids.add(o.id); w.add_way(o); n_w += 1
        else:
            if any((m.type == "w" and m.ref in way_ids) or (m.type == "n" and m.ref in node_ids) for m in o.members):
                w.add_relation(o); n_r += 1
print("skrevet: noder", n_n, "veje", n_w, "relationer", n_r)
