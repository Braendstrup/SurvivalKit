#!/usr/bin/env python3
"""Trin 3: Hent Terrarium-højdefliser (AWS Open Data 'Terrain Tiles') for Djursland,
kvantisér dem (mindre filer) og pak dem i PMTiles. Beregn højdekurver (vektor) til trin 2.

Brug: 03_dem.py <arbejdsmappe>
"""
import sys, os, io, json, math, time, concurrent.futures as cf, subprocess
import numpy as np
from PIL import Image

work = sys.argv[1]
minx, miny, maxx, maxy = json.load(open(os.path.join(work, "bbox.json")))["bbox"]
ZMIN, ZMAX = 7, 13
URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
cache = os.path.join(work, "dem_raw"); os.makedirs(cache, exist_ok=True)

def lonlat2tile(lon, lat, z):
    n = 2 ** z
    return (int((lon + 180) / 360 * n),
            int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n))

def tiles_for(z):
    x0, y1 = lonlat2tile(minx, miny, z); x1, y0 = lonlat2tile(maxx, maxy, z)
    return [(z, x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]

def fetch(t):
    z, x, y = t
    p = os.path.join(cache, f"{z}_{x}_{y}.png")
    if os.path.exists(p): return t, open(p, "rb").read()
    for a in range(5):
        r = subprocess.run(["curl", "-sf", "-m", "60", URL.format(z=z, x=x, y=y)], capture_output=True)
        if r.returncode == 0 and r.stdout[:4] == b"\x89PNG":
            open(p, "wb").write(r.stdout); return t, r.stdout
        time.sleep(1 + a)
    raise RuntimeError(f"fejl ved {t}")

all_t = [t for z in range(ZMIN, ZMAX + 1) for t in tiles_for(z)]
print("fliser:", len(all_t), {z: len(tiles_for(z)) for z in range(ZMIN, ZMAX + 1)})
data = {}
with cf.ThreadPoolExecutor(12) as ex:
    for i, (t, b) in enumerate(ex.map(fetch, all_t)):
        data[t] = b
        if i % 100 == 0: print(i, flush=True)

def decode(b):
    a = np.array(Image.open(io.BytesIO(b)).convert("RGB")).astype(np.float64)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

def encode_quant(e, step=0.25):
    q = np.round((e + 32768) / step) * step  # kvantisér til 0,25 m
    v = q
    r = np.floor(v / 256); g = np.floor(v - r * 256); b = np.round((v - r * 256 - g) * 256)
    img = np.stack([r, g, b], -1).clip(0, 255).astype(np.uint8)
    out = io.BytesIO(); Image.fromarray(img, "RGB").save(out, "PNG", optimize=True); return out.getvalue()

from pmtiles.writer import Writer
from pmtiles.tile import zxy_to_tileid, TileType, Compression
out = os.path.join(work, "djursland-dem.pmtiles")
tot = 0
with open(out, "wb") as f:
    w = Writer(f)
    for t in sorted(all_t, key=lambda t: zxy_to_tileid(*t)):
        b = encode_quant(decode(data[t])); tot += len(b)
        w.write_tile(zxy_to_tileid(*t), b)
    w.finalize({"tile_type": TileType.PNG, "tile_compression": Compression.NONE,
                "min_zoom": ZMIN, "max_zoom": ZMAX,
                "min_lon_e7": int(minx * 1e7), "min_lat_e7": int(miny * 1e7),
                "max_lon_e7": int(maxx * 1e7), "max_lat_e7": int(maxy * 1e7),
                "center_zoom": 10, "center_lon_e7": int((minx + maxx) / 2 * 1e7), "center_lat_e7": int((miny + maxy) / 2 * 1e7)},
               {"name": "Djursland DEM (Terrarium, kvantiseret 0,25 m)", "encoding": "terrarium",
                "attribution": "Terrain Tiles (Mapzen/AWS Open Data) - se KILDER"})
print("DEM-pakke:", out, os.path.getsize(out) // 1024, "kB (rå sum", tot // 1024, "kB)")

# --- højdekurver -----------------------------------------------------------------
from scipy.ndimage import gaussian_filter
from skimage import measure
Z = ZMAX
tl = tiles_for(Z); xs = sorted({t[1] for t in tl}); ys = sorted({t[2] for t in tl})
mos = np.full((len(ys) * 256, len(xs) * 256), np.nan)
for t in tl:
    mos[(t[2] - ys[0]) * 256:(t[2] - ys[0] + 1) * 256, (t[1] - xs[0]) * 256:(t[1] - xs[0] + 1) * 256] = decode(data[t])
np.save(os.path.join(work, "dem_z13.npy"), mos.astype(np.float32))
json.dump({"x0": xs[0], "y0": ys[0], "z": Z}, open(os.path.join(work, "dem_z13.json"), "w"))
print("mosaik", mos.shape, "min/max", np.nanmin(mos), np.nanmax(mos))
