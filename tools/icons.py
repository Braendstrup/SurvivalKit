#!/usr/bin/env python3
"""Genererer app-ikoner (PNG) ud fra samme motiv som icon.svg: et læskur/telt-trekant med udråbstegn."""
from PIL import Image, ImageDraw
import os
out = os.path.join(os.path.dirname(__file__), "..", "app", "icons")
def make(size, maskable=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    r = 0 if maskable else int(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], r, fill=(31, 74, 56, 255))
    s = size * (0.58 if maskable else 0.66); cx, cy = size / 2, size * 0.53
    pts = [(cx, cy - s * 0.52), (cx + s * 0.55, cy + s * 0.42), (cx - s * 0.55, cy + s * 0.42)]
    d.polygon(pts, outline=(255, 255, 255, 255), width=max(2, int(size * 0.055)))
    w = max(2, int(size * 0.055))
    d.rounded_rectangle([cx - w / 2, cy - s * 0.18, cx + w / 2, cy + s * 0.12], w // 2, fill=(255, 255, 255, 255))
    d.ellipse([cx - w * 0.65, cy + s * 0.2, cx + w * 0.65, cy + s * 0.2 + w * 1.3], fill=(255, 255, 255, 255))
    return img
for n, m in (("icon-192.png", False), ("icon-512.png", False), ("icon-maskable-512.png", True)):
    make(int(n.split("-")[-1].split(".")[0]) if not m else 512, m).save(os.path.join(out, n))
open(os.path.join(out, "icon.svg"), "w").write('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#1f4a38"/><path d="M64 26 100 98H28z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M64 54v22" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="64" cy="88" r="4.5" fill="#fff"/></svg>
''')
print("ikoner skrevet")
