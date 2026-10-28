// Selvvalgte kortområder: flisematematik, estimat, download fra OpenFreeMap (vektor) og AWS Terrarium (højde),
// lagring i IndexedDB med referencetælling, navneudtræk til søgning og højdeopslag.
// Vilkår (OpenFreeMap): højst 3.000 fliser eller 50 MB pr. download og højst 4 samtidige forespørgsler.
import * as db from './db.js';
import { readTile, tilePointToLonLat } from './mvt.js';

export const OFM_TILEJSON = 'https://tiles.openfreemap.org/planet';
export const OFM_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
export const DEM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
export const LIMITS = { tiles: 3000, bytes: 50 * 1e6, parallel: 4 };
export const ZOOMS = { vec: [6, 14], dem: [7, 12] };

export class AreaError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

// ---- flisematematik ---------------------------------------------------------------------------------------
const lon2x = (lon, z) => Math.floor((lon + 180) / 360 * 2 ** z);
const lat2y = (lat, z) => Math.floor((1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z);
export function tileRange([w, s, e, n], z) {
  const max = 2 ** z - 1, cl = (v) => Math.min(max, Math.max(0, v));
  return { x0: cl(lon2x(w, z)), x1: cl(lon2x(e, z)), y0: cl(lat2y(n, z)), y1: cl(lat2y(s, z)) };
}
export function countTiles(bbox, [z0, z1]) {
  let n = 0;
  for (let z = z0; z <= z1; z++) { const r = tileRange(bbox, z); n += (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1); }
  return n;
}
export function* tiles(bbox, [z0, z1]) {
  for (let z = z0; z <= z1; z++) { const r = tileRange(bbox, z); for (let x = r.x0; x <= r.x1; x++) for (let y = r.y0; y <= r.y1; y++) yield [z, x, y]; }
}
const url = (tpl, z, x, y) => tpl.replace('{z}', z).replace('{x}', x).replace('{y}', y);

// ---- estimat --------------------------------------------------------------------------------------------------------
let tilejson = null;
export async function ofmTemplate(signal) {
  if (tilejson) return tilejson.tiles[0];
  const r = await fetch(OFM_TILEJSON, { signal });
  if (!r.ok) throw new AreaError('HENT', 'OpenFreeMap svarede ' + r.status);
  tilejson = await r.json();
  return tilejson.tiles[0];
}
export const ofmVersion = (tpl) => (tpl.match(/planet\/([^/]+)\//) || [])[1] || 'ukendt';

/** { vecTiles, demTiles, bytes, ok, reason } – størrelsen anslås ud fra en lille stikprøve af fliser i området */
export async function estimate(bbox, signal) {
  const vecTiles = countTiles(bbox, ZOOMS.vec), demTiles = countTiles(bbox, ZOOMS.dem);
  const res = { vecTiles, demTiles, bytes: null, ok: vecTiles <= LIMITS.tiles, reason: vecTiles > LIMITS.tiles ? 'tiles' : null };
  if (!res.ok) return res;
  const tpl = await ofmTemplate(signal);
  const r14 = tileRange(bbox, 14), r12 = tileRange(bbox, 12);
  const pick = (r, k) => Array.from({ length: k }, (_, i) => [r.x0 + Math.round((r.x1 - r.x0) * ((i * 7 + 3) % 10) / 9), r.y0 + Math.round((r.y1 - r.y0) * ((i * 3 + 1) % 10) / 9)]);
  const size = async (u) => { const b = await (await fetch(u, { signal })).arrayBuffer(); return b.byteLength; };
  const v = await Promise.all(pick(r14, 4).map(([x, y]) => size(url(tpl, 14, x, y)).catch(() => 0)));
  const d = await Promise.all(pick(r12, 2).map(([x, y]) => size(url(DEM_URL, 12, x, y)).catch(() => 0)));
  const avg = (a) => a.reduce((s, x) => s + x, 0) / Math.max(1, a.length);
  const n14 = countTiles(bbox, [14, 14]);
  // lavere zoomniveauer har færre, men tungere fliser: ca. +40 % oven i z14
  res.vecBytes = Math.round(avg(v) * n14 * 1.4);
  res.demBytes = Math.round(avg(d) * demTiles);
  res.bytes = res.vecBytes + res.demBytes;
  if (res.vecBytes > LIMITS.bytes) { res.ok = false; res.reason = 'bytes'; }
  return res;
}

// ---- download -------------------------------------------------------------------------------------------------------
async function maybeGunzip(buf) {
  const u = new Uint8Array(buf);
  if (u[0] !== 0x1f || u[1] !== 0x8b) return buf;
  return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
}

async function pool(items, n, fn, signal) {
  let i = 0;
  const worker = async () => { while (i < items.length) { if (signal?.aborted) throw new AreaError('AFBRUDT', 'Hentning afbrudt – kan genoptages.'); const it = items[i++]; await fn(it); } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
}

/**
 * Henter (eller genoptager) et område. area = { id?, name, bbox }. onProgress({ done, total, bytes, phase }).
 * Området markeres først som klar (ready), når alle fliser er gemt og navneindekset er bygget.
 */
export async function downloadArea(area, onProgress = () => {}, signal) {
  const est = area.estimate || null;
  const info = await db.storageInfo();
  if (est?.bytes && info.quota != null && info.usage != null && info.quota - info.usage < est.bytes * 1.3) throw new AreaError('LAGER', 'For lidt ledig lagerplads til området.');
  if (countTiles(area.bbox, ZOOMS.vec) > LIMITS.tiles) throw new AreaError('STOR', 'Området er for stort (over 3.000 fliser). Zoom ind.');
  try { await navigator.storage?.persist?.(); } catch { /* valgfrit */ }
  const tpl = await ofmTemplate(signal);
  const id = area.id || 'a' + Date.now().toString(36);
  const rec = { id, name: area.name, bbox: area.bbox, zooms: ZOOMS, source: 'OpenFreeMap ' + ofmVersion(tpl), created: area.created || Date.now(), ready: false, bytes: area.bytes || 0, tiles: 0, names: [] };
  await db.areaPut(rec);

  const all = [...[...tiles(area.bbox, ZOOMS.vec)].map((t) => ['ofm', ...t]), ...[...tiles(area.bbox, ZOOMS.dem)].map((t) => ['dem', ...t])];
  const keys = all.map(([k, z, x, y]) => `${k}/${z}/${x}/${y}`);
  const have = await db.tileHas(keys);
  // fliser, der allerede findes (fx fra et overlappende område eller en afbrudt hentning), får blot områdets reference
  for (const k of have) await db.tileAddRef(k, null, id);
  const todo = all.filter((_, i) => !have.has(keys[i]));
  let done = all.length - todo.length, bytes = rec.bytes;
  onProgress({ phase: 'download', done, total: all.length, bytes });
  await pool(todo, LIMITS.parallel, async ([k, z, x, y]) => {
    let r;
    try { r = await fetch(url(k === 'ofm' ? tpl : DEM_URL, z, x, y), { signal }); }
    catch { throw new AreaError(signal?.aborted ? 'AFBRUDT' : 'HENT', signal?.aborted ? 'Hentning afbrudt – kan genoptages.' : 'Netværksfejl – tryk Genoptag, når du har forbindelse.'); }
    let data;
    if (r.status === 404 || r.status === 204) data = new ArrayBuffer(0); // tom flise (fx hav) – gemmes som tom
    else if (!r.ok) throw new AreaError('HENT', `Serveren svarede ${r.status} (${k} ${z}/${x}/${y})`);
    else data = k === 'ofm' ? await maybeGunzip(await r.arrayBuffer()) : await r.arrayBuffer();
    try { await db.tileAddRef(`${k}/${z}/${x}/${y}`, data, id); } catch (e) { throw new AreaError('GEM', 'Kunne ikke gemme på enheden: ' + (e.name || e.message)); }
    done++; bytes += data.byteLength;
    if (done % 8 === 0 || done === all.length) { onProgress({ phase: 'download', done, total: all.length, bytes }); rec.bytes = bytes; }
  }, signal);

  onProgress({ phase: 'names', done, total: all.length, bytes });
  rec.names = await extractNames(area.bbox);
  rec.tiles = all.length; rec.bytes = bytes; rec.ready = true; rec.finished = Date.now();
  await db.areaPut(rec);
  onProgress({ phase: 'done', done, total: all.length, bytes });
  return rec;
}

// ---- navneindeks (samme format som Djursland-søgeindekset: [navn, type, lon, lat]) ------------------------------------
const NAME_LAYERS = ['place', 'poi', 'transportation_name', 'water_name', 'mountain_peak', 'park'];
export function namesFromTile(buf, z, x, y) {
  const t = readTile(buf, NAME_LAYERS), out = [];
  for (const [layer, L] of Object.entries(t)) for (const f of L.features) {
    const name = f.props['name:da'] || f.props['name:latin'] || f.props.name;
    if (!name || f.x == null) continue;
    const [lon, lat] = tilePointToLonLat(z, x, y, f.x, f.y, L.extent);
    const kind = layer === 'place' ? 'place:' + f.props.class : layer === 'mountain_peak' ? 'peak' : layer === 'transportation_name' ? 'road' : layer === 'water_name' ? 'water' : layer === 'park' ? 'protected' : 'poi:' + (f.props.subclass || f.props.class);
    out.push([name, kind, +lon.toFixed(5), +lat.toFixed(5), layer === 'mountain_peak' && f.props.ele != null ? Math.round(f.props.ele) : undefined]);
  }
  return out;
}
async function extractNames(bbox) {
  const seen = new Map();
  for (const [z, x, y] of tiles(bbox, [14, 14])) {
    const t = await db.tileGet(`ofm/${z}/${x}/${y}`);
    if (!t?.data?.byteLength) continue;
    for (const n of namesFromTile(t.data, z, x, y)) {
      const [w, s, e, nn] = bbox; if (n[2] < w || n[2] > e || n[3] < s || n[3] > nn) continue;
      const key = n[0] + '|' + n[1]; if (!seen.has(key)) seen.set(key, n); // én pr. navn/type (veje går over mange fliser)
    }
  }
  return [...seen.values()].map((n) => (n[4] === undefined ? n.slice(0, 4) : n));
}

// ---- håndtering -------------------------------------------------------------------------------------------------------
export const listAreas = async () => (await db.areaAll()).sort((a, b) => b.created - a.created);
export const getArea = (id) => db.areaGet(id);
export async function deleteArea(id) { await db.tileReleaseArea(id); await db.areaDel(id); }

// ---- læsning til kortet ---------------------------------------------------------------------------------------------
export async function tileData(kind, z, x, y) { const t = await db.tileGet(`${kind}/${z}/${x}/${y}`); return t?.data || null; }
