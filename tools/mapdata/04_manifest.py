#!/usr/bin/env python3
"""Trin 4: Kopiér pakker til app/map/pack og skriv manifest.json (størrelser, SHA-256, dækning, kilder, datoer).

Brug: 04_manifest.py <arbejdsmappe> <denmark.osm.pbf> <app/map/pack>
"""
import sys, os, json, hashlib, shutil, datetime
import osmium
from shapely.geometry import shape, mapping

work, pbf, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
minx, miny, maxx, maxy = json.load(open(os.path.join(work, "bbox.json")))["bbox"]
region = shape(json.load(open(os.path.join(work, "region.geojson")))["geometry"]).simplify(0.0004)

hdr = osmium.FileProcessor(pbf).header
osm_ts = hdr.get("osmosis_replication_timestamp") or hdr.get("timestamp") or ""
print("OSM-filens tidsstempel:", osm_ts)

files = [
    ("vec", "djursland-vector.pmtiles", "OSM-vektorfliser (MVT, gzip)", "mvt", [8, 14]),
    ("dem", "djursland-dem.pmtiles", "Højdemodel (Terrarium PNG, 0,25 m kvantisering)", "terrarium", [7, 13]),
    ("search", "djursland-search.json", "Søgeindeks (navne og koordinater)", "json", None),
]
packs = []
for pid, fn, desc, typ, zoom in files:
    src = os.path.join(work, fn); dst = os.path.join(out, fn)
    shutil.copyfile(src, dst)
    data = open(dst, "rb").read()
    packs.append({"id": pid, "file": fn, "description": desc, "type": typ, "zoom": zoom,
                  "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
total = sum(p["bytes"] for p in packs)
now = datetime.datetime.now(datetime.timezone.utc)
manifest = {
    "schema": 1, "id": "djursland", "title": "Djursland – topografisk offlinekort",
    "version": now.strftime("%Y.%m.%d"), "built": now.isoformat(timespec="seconds"),
    "osmDataTimestamp": osm_ts,
    "bbox": [round(minx, 5), round(miny, 5), round(maxx, 5), round(maxy, 5)],
    "region": mapping(region),
    "regionDefinition": "Union af OpenStreetMap-kommunegrænserne for Syddjurs og Norddjurs Kommune (admin_level=7), "
                        "ekskl. Anholt, plus 3 km buffer. Kortets dækning = bbox; regionen vises som kerneområde.",
    "crs": "Kortfliser: Web Mercator (EPSG:3857). Koordinatvisning: WGS84 og ETRS89/UTM32N (EPSG:25832).",
    "packs": packs, "totalBytes": total,
    "vectorMaxZoom": 14, "overzoomNote": "Zoom over 14 forstørrer data fra zoom 14 (ingen ekstra detaljer).",
    "sources": [
        {"id": "osm", "name": "OpenStreetMap-data (udtræk fra download.openstreetmap.fr, Danmark)",
         "licence": "ODbL 1.0 – © OpenStreetMap-bidragydere", "url": "https://www.openstreetmap.org/copyright", "date": osm_ts},
        {"id": "terrain", "name": "Terrain Tiles (Terrarium) fra AWS Open Data Registry – Mapzen-afledt højdemodel",
         "licence": "Åbne data; kræver kildeangivelse (SRTM, EU-DEM/Copernicus m.fl.). Se KILDER.",
         "url": "https://registry.opendata.aws/terrain-tiles/", "date": "hentet " + now.strftime("%Y-%m-%d")},
    ],
}
json.dump(manifest, open(os.path.join(out, "manifest.json"), "w"), ensure_ascii=False, indent=1)
print("manifest skrevet; total", total // 1024, "kB")
for p in packs: print(" ", p["file"], p["bytes"], p["sha256"][:12])
