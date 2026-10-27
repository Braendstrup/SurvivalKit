// AI-modeller: katalog, enhedstjek, download (genoptagelig) til OPFS, SHA-256-kontrol og atomisk aktivering.
// Intet hentes, før brugeren selv vælger det. Runtime-filerne (MediaPipe) caches først ved download af en model.
import * as db from '../db.js';
import { Sha256 } from './sha256.js';

const HF = 'https://huggingface.co/litert-community/';
// Størrelse og SHA-256 er fastlåst efter Hugging Face-metadata (lfs oid) 2026-10-27. En ændret fil afvises.
export const CATALOG = [
  { id: 'gemma4-e4b', name: 'Gemma 4 E4B', file: 'gemma-4-E4B-it-web.task', url: HF + 'gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it-web.task', size: 2964324352, sha256: 'f3bd72fc27627be2a2cc6722199a333599590ed0962ee7047b516a506b7bf086', minMemGB: 8, note: 'Bedste svar. Kræver en nyere telefon (ca. 8 GB RAM).' },
  { id: 'gemma4-e2b', name: 'Gemma 4 E2B', file: 'gemma-4-E2B-it-web.task', url: HF + 'gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task', size: 2003697664, sha256: '2cbff161177a4d51c9d04360016185976f504517ba5758cd10c1564e5421c5a5', minMemGB: 4, note: 'Lettere og hurtigere. Til de fleste telefoner med WebGPU.' },
];
export const RUNTIME = { cache: 'sk-ai-mediapipe-0.10.30', files: ['vendor/mediapipe/genai_bundle.mjs', 'vendor/mediapipe/genai_wasm_internal.js', 'vendor/mediapipe/genai_wasm_internal.wasm'] };
export const byId = (id) => CATALOG.find((m) => m.id === id);

export class AiError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

// ---- enhedstjek ------------------------------------------------------------------------------------------------
export async function checkDevice() {
  const r = { builtin: 'unavailable', webgpu: false, memGB: navigator.deviceMemory || null, free: null, opfs: !!navigator.storage?.getDirectory, recommended: null };
  try { if (globalThis.LanguageModel?.availability) r.builtin = await LanguageModel.availability(); } catch { /* ikke understøttet */ }
  try { r.webgpu = !!(navigator.gpu && await navigator.gpu.requestAdapter()); } catch { r.webgpu = false; }
  try { const e = await navigator.storage.estimate(); r.free = e.quota != null ? e.quota - (e.usage || 0) : null; } catch { /* ukendt */ }
  if (r.webgpu && r.opfs) r.recommended = r.memGB != null && r.memGB >= 8 ? 'gemma4-e4b' : 'gemma4-e2b';
  return r;
}
export const fitsStorage = (m, free) => free == null || free >= m.size * 1.3;

// ---- aktiv model -----------------------------------------------------------------------------------------------
// kv 'ai.active' = { id, sha256, time } – sættes først, når filen er hentet og kontrolleret.
export async function getActive() {
  const a = await db.kvGet('ai.active', null);
  if (!a || !byId(a.id)) return null;
  try { const f = await fileHandle(byId(a.id).file); const file = await f.getFile(); if (file.size !== byId(a.id).size) return null; return { ...a, model: byId(a.id) }; } catch { return null; }
}
async function aiDir() { return (await navigator.storage.getDirectory()).getDirectoryHandle('ai', { create: true }); }
async function fileHandle(name, create = false) { return (await aiDir()).getFileHandle(name, { create }); }
export async function openModelFile() { const a = await getActive(); if (!a) throw new AiError('INGEN', 'Ingen model er hentet.'); return (await fileHandle(a.model.file)).getFile(); }

// Delvist hentet fil (til genoptagelse)
export async function partialSize(m) { try { return (await (await fileHandle(m.file + '.part')).getFile()).size; } catch { return 0; } }

// ---- download --------------------------------------------------------------------------------------------------
const CHUNK = 64 * 1048576; // 64 MB pr. range-forespørgsel: en afbrydelse koster højst én bid
export async function downloadModel(id, onProgress = () => {}, signal) {
  const m = byId(id); if (!m) throw new AiError('UKENDT', 'Ukendt model');
  if (!navigator.storage?.getDirectory) throw new AiError('LAGER', 'Browseren understøtter ikke fillager (OPFS), som modellen kræver.');
  const { free } = await checkDevice();
  const have = await partialSize(m);
  if (free != null && free + have < m.size * 1.3) throw new AiError('LAGER', `Ikke nok ledig lagerplads: modellen kræver ca. ${Math.ceil(m.size * 1.3 / 1e9)} GB ledig.`);
  try { await navigator.storage.persist?.(); } catch { /* valgfrit */ }
  // runtime til offlinebrug
  onProgress({ phase: 'runtime', done: 0, total: m.size });
  try { const c = await caches.open(RUNTIME.cache); await c.addAll(RUNTIME.files); } catch (e) { throw new AiError('HENT', 'Kunne ikke hente AI-programfilerne: ' + e.message); }

  const part = await fileHandle(m.file + '.part', true);
  let pos = (await part.getFile()).size;
  if (pos > m.size) { pos = 0; }
  const w = await part.createWritable({ keepExistingData: true });
  try {
    await w.truncate(pos); await w.seek(pos);
    while (pos < m.size) {
      if (signal?.aborted) throw new AiError('AFBRUDT', 'Download afbrudt – kan genoptages.');
      const end = Math.min(pos + CHUNK, m.size) - 1;
      let res;
      try { res = await fetch(m.url, { headers: { Range: `bytes=${pos}-${end}` }, signal, cache: 'no-store' }); }
      catch (e) { throw new AiError(signal?.aborted ? 'AFBRUDT' : 'HENT', signal?.aborted ? 'Download afbrudt – kan genoptages.' : 'Forbindelsen blev afbrudt – tryk for at genoptage.'); }
      if (res.status !== 206 && !(res.status === 200 && pos === 0)) throw new AiError('HENT', 'Serveren svarede ' + res.status);
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read().catch(() => { throw new AiError(signal?.aborted ? 'AFBRUDT' : 'HENT', 'Forbindelsen blev afbrudt – tryk for at genoptage.'); });
        if (done) break;
        await w.write(value); pos += value.length;
        onProgress({ phase: 'download', done: pos, total: m.size });
      }
      if (res.status === 200) break; // serveren ignorerede range og sendte hele filen
    }
  } finally { await w.close(); }

  // kontrol
  const file = await part.getFile();
  if (file.size !== m.size) throw new AiError('STOERRELSE', `Forkert filstørrelse (${file.size} ≠ ${m.size}).`);
  const hex = await hashFile(file, (d) => onProgress({ phase: 'verify', done: d, total: m.size }), signal);
  if (hex !== m.sha256) { await (await aiDir()).removeEntry(m.file + '.part'); throw new AiError('HASH', 'Modelfilen er beskadiget (forkert kontrolsum) og er slettet. Prøv igen.'); }
  // aktivér: flyt/omdøb til endeligt navn, og peg på den
  const dir = await aiDir();
  try { await dir.removeEntry(m.file); } catch { /* fandtes ikke */ }
  if (part.move) await part.move(m.file);
  else { const dst = await (await dir.getFileHandle(m.file, { create: true })).createWritable(); await file.stream().pipeTo(dst); await dir.removeEntry(m.file + '.part'); }
  const prev = await db.kvGet('ai.active', null);
  await db.kvSet('ai.active', { id: m.id, sha256: m.sha256, time: Date.now() });
  if (prev && prev.id !== m.id && byId(prev.id)) { try { await dir.removeEntry(byId(prev.id).file); } catch { /* */ } }
  onProgress({ phase: 'done', done: m.size, total: m.size });
  return m;
}

async function hashFile(file, onProgress, signal) {
  const s = new Sha256(), step = 16 * 1048576;
  for (let o = 0; o < file.size; o += step) {
    if (signal?.aborted) throw new AiError('AFBRUDT', 'Kontrol afbrudt');
    s.update(new Uint8Array(await file.slice(o, o + step).arrayBuffer()));
    onProgress(Math.min(o + step, file.size));
  }
  return s.hex();
}

export async function removeModel() {
  const dir = await aiDir();
  for (const m of CATALOG) for (const n of [m.file, m.file + '.part']) { try { await dir.removeEntry(n); } catch { /* */ } }
  await db.kvDel('ai.active');
  try { await caches.delete(RUNTIME.cache); } catch { /* */ }
}
