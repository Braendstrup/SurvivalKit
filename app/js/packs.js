// Kortpakker: hentning (med fremdrift og SHA-256-kontrol), atomisk aktivering, åbning fra IndexedDB.
//
// Princip: en ny version hentes og kontrolleres fuldstændigt og lægges under nye nøgler. Først når ALLE filer er
// godkendt, flyttes pegepinden "packs.active". En afbrudt eller korrupt hentning efterlader derfor altid den
// tidligere brugbare version uændret. Pakkerne ligger som Blob i IndexedDB og læses med blob.slice() (ingen netværk).
import * as db from './db.js';

export const MANIFEST_URL = 'map/pack/manifest.json';
const ACTIVE_KEY = 'packs.active';

export class PackError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

export async function fetchManifest(signal) {
  const r = await fetch(MANIFEST_URL + '?t=' + Date.now(), { cache: 'no-store', signal });
  if (!r.ok) throw new PackError('MANIFEST', `Kunne ikke hente pakkeoversigt (${r.status})`);
  return r.json();
}

export const getActive = () => db.kvGet(ACTIVE_KEY, null);

async function sha256Hex(blob) {
  const buf = await blob.arrayBuffer();
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Henter alle pakker i manifestet. onProgress({file, fileIdx, fileCount, loaded, total, overallLoaded, overallTotal}).
 * Kaster PackError med code: LAGER (for lidt plads), HENT (netværk/HTTP), STOERRELSE, HASH, GEM (lagring fejlede), AFBRUDT.
 */
export async function downloadPacks(manifest, onProgress = () => {}, signal) {
  const total = manifest.packs.reduce((s, p) => s + p.bytes, 0);
  const info = await db.storageInfo();
  if (info.quota != null && info.usage != null) {
    const free = info.quota - info.usage;
    // Download skal ligge i hukommelsen og derefter i IndexedDB: kræv 1,3 x pakkestørrelsen.
    if (free < total * 1.3) {
      throw new PackError('LAGER', `For lidt ledig lagerplads: ${(free / 1048576).toFixed(0)} MB ledig, ${(total * 1.3 / 1048576).toFixed(0)} MB påkrævet.`);
    }
  }
  const staged = [];
  let done = 0;
  try {
    for (const [i, p] of manifest.packs.entries()) {
      const url = 'map/pack/' + p.file;
      let resp;
      try { resp = await fetch(url, { cache: 'no-store', signal }); }
      catch (e) { throw e.name === 'AbortError' ? new PackError('AFBRUDT', 'Hentning afbrudt') : new PackError('HENT', 'Netværksfejl: ' + e.message); }
      if (!resp.ok || !resp.body) throw new PackError('HENT', `Serveren svarede ${resp.status} på ${p.file}`);
      const reader = resp.body.getReader();
      const chunks = []; let loaded = 0;
      try {
        for (;;) {
          const { done: fin, value } = await reader.read();
          if (fin) break;
          chunks.push(value); loaded += value.length;
          onProgress({ file: p.file, fileIdx: i, fileCount: manifest.packs.length, loaded, total: p.bytes, overallLoaded: done + loaded, overallTotal: total });
        }
      } catch (e) { throw e.name === 'AbortError' ? new PackError('AFBRUDT', 'Hentning afbrudt') : new PackError('HENT', 'Hentning blev afbrudt: ' + e.message); }
      if (loaded !== p.bytes) throw new PackError('STOERRELSE', `${p.file}: modtog ${loaded} byte, forventede ${p.bytes}.`);
      const blob = new Blob(chunks, { type: 'application/octet-stream' });
      const hex = await sha256Hex(blob);
      if (hex !== p.sha256) throw new PackError('HASH', `${p.file}: kontrolsum stemmer ikke (filen er beskadiget).`);
      const key = `${p.id}@${manifest.version}`;
      try { await db.packPut(key, blob); } catch (e) { throw new PackError('GEM', `Kunne ikke gemme ${p.file} lokalt: ${e.name || e.message}`); }
      staged.push(key); done += p.bytes;
    }
    const previous = await getActive();
    const files = Object.fromEntries(manifest.packs.map((p) => [p.id, `${p.id}@${manifest.version}`]));
    const ok = await db.kvSet(ACTIVE_KEY, { version: manifest.version, built: manifest.built, files, manifest, activatedAt: Date.now() });
    if (!ok) throw new PackError('GEM', 'Kunne ikke aktivere den nye kortpakke.');
    if (previous?.files) for (const k of Object.values(previous.files)) if (!staged.includes(k)) await db.packDel(k);
    return await getActive();
  } catch (e) {
    for (const k of staged) await db.packDel(k);   // fjern halvfærdig version; den gamle er urørt
    throw e;
  }
}

export async function removePacks() {
  const a = await getActive();
  if (a?.files) for (const k of Object.values(a.files)) await db.packDel(k);
  for (const k of await db.packKeys()) await db.packDel(k);
  await db.kvDel(ACTIVE_KEY);
}

// ---- læsning ------------------------------------------------------------------------------------
class BlobSource {
  constructor(blob, key) { this.blob = blob; this.key = key; }
  getKey() { return this.key; }
  async getBytes(offset, length) { return { data: await this.blob.slice(offset, offset + length).arrayBuffer() }; }
}

let opened = null;
export async function openActive() {
  const active = await getActive();
  if (!active) return null;
  if (opened && opened.version === active.version) return opened;
  if (!globalThis.pmtiles) throw new Error('pmtiles.js er ikke indlæst');
  const blobs = {};
  for (const [id, key] of Object.entries(active.files)) {
    blobs[id] = await db.packGet(key);
    if (!blobs[id]) throw new PackError('MANGLER', `Pakken ${key} mangler i lageret (kan være ryddet af systemet).`);
  }
  const vec = new pmtiles.PMTiles(new BlobSource(blobs.vec, active.files.vec));
  const dem = new pmtiles.PMTiles(new BlobSource(blobs.dem, active.files.dem));
  let search = null;
  if (blobs.search) { try { search = JSON.parse(await blobs.search.text()); } catch { search = null; } }
  opened = { version: active.version, manifest: active.manifest, vec, dem, search };
  return opened;
}
export function closeActive() { opened = null; }

/**
 * Højdeopslag fra Terrarium-fliser (bilineær interpolation). getTile(x, y) → ArrayBuffer (PNG) eller null.
 * Bruges både af Djursland-pakken (z13) og af selvvalgte områder (z12).
 */
export function makeElevation(getTile, z) {
  const cache = new Map();
  const n = 2 ** z;
  const sample = async (tx, ty) => {
    const key = `${tx}/${ty}`;
    let img = cache.get(key);
    if (img === undefined) {
      const data = await getTile(tx, ty);
      if (!data || !data.byteLength) img = null;
      else {
        const bmp = await createImageBitmap(new Blob([data], { type: 'image/png' }), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
        const c = new OffscreenCanvas(256, 256); const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(bmp, 0, 0); img = ctx.getImageData(0, 0, 256, 256).data; bmp.close?.();
      }
      cache.set(key, img); if (cache.size > 12) cache.delete(cache.keys().next().value);
    }
    return img;
  };
  return async (lon, lat) => {
    const fx = (lon + 180) / 360 * n;
    const fy = (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * n;
    const gx = fx * 256 - 0.5, gy = fy * 256 - 0.5;
    const x0 = Math.floor(gx), y0 = Math.floor(gy), ax = gx - x0, ay = gy - y0;
    const px = async (X, Y) => {
      const img = await sample(Math.floor(X / 256), Math.floor(Y / 256));
      if (!img) return null;
      const i = (((Y % 256) + 256) % 256 * 256 + (((X % 256) + 256) % 256)) * 4;
      return img[i] * 256 + img[i + 1] + img[i + 2] / 256 - 32768;
    };
    const v = await Promise.all([px(x0, y0), px(x0 + 1, y0), px(x0, y0 + 1), px(x0 + 1, y0 + 1)]);
    if (v.some((q) => q == null)) return null;
    return (v[0] * (1 - ax) + v[1] * ax) * (1 - ay) + (v[2] * (1 - ax) + v[3] * ax) * ay;
  };
}

/** Højde (m) fra Djursland-pakkens DEM; null hvis ingen data. */
export async function elevationAt(lon, lat) {
  const p = await openActive(); if (!p) return null;
  p.elev ||= makeElevation(async (x, y) => (await p.dem.getZxy(13, x, y))?.data || null, 13);
  return p.elev(lon, lat);
}
