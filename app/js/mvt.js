// Minimal Mapbox Vector Tile-læser (kun det, appen behøver): lag, egenskaber og første punkt i geometrien.
// Bruges til at udtrække stednavne fra hentede kortområder til det lokale søgeindeks. Ingen afhængigheder.

class Pbf {
  constructor(buf) { this.b = buf; this.p = 0; }
  varint() { let v = 0, s = 0, b; do { b = this.b[this.p++]; v += (b & 0x7f) * 2 ** s; s += 7; } while (b >= 0x80); return v; }
  svarint() { const v = this.varint(); return v % 2 === 1 ? (v + 1) / -2 : v / 2; }
  bytes() { const n = this.varint(), out = this.b.subarray(this.p, this.p + n); this.p += n; return out; }
  skip(wt) { if (wt === 0) this.varint(); else if (wt === 1) this.p += 8; else if (wt === 2) this.p += this.varint(); else if (wt === 5) this.p += 4; else throw new Error('ukendt wire type ' + wt); }
  each(fn) { while (this.p < this.b.length) { const k = this.varint(), f = Math.floor(k / 8), wt = k & 7; if (fn(f, wt) === false) this.skip(wt); } }
}
const td = new TextDecoder();
const packed = (buf) => { const p = new Pbf(buf), out = []; while (p.p < buf.length) out.push(p.varint()); return out; };

function readValue(buf) {
  const p = new Pbf(buf); let v = null;
  p.each((f, wt) => {
    if (f === 1) v = td.decode(p.bytes());
    else if (f === 2) { v = new DataView(p.b.buffer, p.b.byteOffset + p.p, 4).getFloat32(0, true); p.p += 4; }
    else if (f === 3) { v = new DataView(p.b.buffer, p.b.byteOffset + p.p, 8).getFloat64(0, true); p.p += 8; }
    else if (f === 4 || f === 5) v = p.varint();
    else if (f === 6) v = p.svarint();
    else if (f === 7) v = !!p.varint();
    else return false;
  });
  return v;
}

/** Læser en flise: { lagnavn: { extent, features: [{ type, props, x, y }] } } – x/y er første punkt i flisekoordinater. */
export function readTile(arrayBuffer, wanted = null) {
  const buf = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
  const tile = {}, top = new Pbf(buf);
  top.each((f) => {
    if (f !== 3) return false;
    const lb = top.bytes(), lp = new Pbf(lb);
    let name = '', extent = 4096; const feats = [], keys = [], vals = [];
    lp.each((g) => {
      if (g === 1) name = td.decode(lp.bytes());
      else if (g === 2) feats.push(lp.bytes());
      else if (g === 3) keys.push(td.decode(lp.bytes()));
      else if (g === 4) vals.push(lp.bytes());
      else if (g === 5) extent = lp.varint();
      else return false;
    });
    if (wanted && !wanted.includes(name)) return;
    const values = vals.map(readValue);
    tile[name] = { extent, features: feats.map((fb) => {
      const fp = new Pbf(fb); let tags = [], type = 0, geom = [];
      fp.each((h) => { if (h === 2) tags = packed(fp.bytes()); else if (h === 3) type = fp.varint(); else if (h === 4) geom = packed(fp.bytes()); else return false; });
      const props = {}; for (let i = 0; i + 1 < tags.length; i += 2) props[keys[tags[i]]] = values[tags[i + 1]];
      // første MoveTo
      let x = null, y = null;
      if (geom.length >= 3 && (geom[0] & 7) === 1) { const zz = (n) => (n % 2 === 1 ? (n + 1) / -2 : n / 2); x = zz(geom[1]); y = zz(geom[2]); }
      return { type, props, x, y };
    }) };
  });
  return tile;
}

/** Flisekoordinat (z/x/y + punkt i flisen) → lon/lat */
export function tilePointToLonLat(z, tx, ty, px, py, extent) {
  const n = 2 ** z, X = tx + px / extent, Y = ty + py / extent;
  return [X / n * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * Y / n))) * 180 / Math.PI];
}
