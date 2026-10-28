// Lokal lagring: IndexedDB med tre lagre.
//   kv        - indstillinger, bogmærker, noter, nødkontakter, tjeklistefremdrift
//   waypoints - brugerens steder (keyPath: id)
//   packs     - kortpakker som Blob (key: "<pakkenavn>@<version>")
//   tiles     - fliser til selvvalgte kortområder (key: "ofm/z/x/y" | "dem/z/x/y" -> { data, refs: [områdeId] })
//   areas     - selvvalgte kortområder (keyPath: id)
// Alt kaldes defensivt: kan browseren ikke give adgang (privat tilstand, ryddet lager) virker appen videre
// med data i hukommelsen, og brugeren får besked i "Mig"-siden.

const DB_NAME = 'survivalkit';
const DB_VERSION = 2;
let dbp = null;
export const memory = { kv: new Map(), waypoints: new Map(), ok: true, error: null };

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB mangler'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('waypoints')) db.createObjectStore('waypoints', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('packs')) db.createObjectStore('packs');
      if (!db.objectStoreNames.contains('tiles')) db.createObjectStore('tiles');
      if (!db.objectStoreNames.contains('areas')) db.createObjectStore('areas', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('Databasen er blokeret af en anden fane'));
  }).catch((e) => { memory.ok = false; memory.error = e; dbp = null; throw e; });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    let result;
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Transaktion afbrudt'));
    result = fn(t.objectStore(store), t);
  }));
}
const wrap = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

export async function kvGet(key, fallback = null) {
  try {
    const v = await tx('kv', 'readonly', (s) => wrap(s.get(key))).then((p) => p);
    return v === undefined ? fallback : v;
  } catch { return memory.kv.has(key) ? memory.kv.get(key) : fallback; }
}
export async function kvSet(key, value) {
  memory.kv.set(key, value);
  try { await tx('kv', 'readwrite', (s) => { s.put(value, key); }); return true; } catch { return false; }
}
export async function kvDel(key) {
  memory.kv.delete(key);
  try { await tx('kv', 'readwrite', (s) => { s.delete(key); }); } catch { /* ignoreres */ }
}
export async function kvAll() {
  try {
    return await tx('kv', 'readonly', (s) => {
      const keys = wrap(s.getAllKeys()), vals = wrap(s.getAll());
      return Promise.all([keys, vals]).then(([k, v]) => Object.fromEntries(k.map((key, i) => [key, v[i]])));
    });
  } catch { return Object.fromEntries(memory.kv); }
}

export async function wpAll() {
  try { return await tx('waypoints', 'readonly', (s) => wrap(s.getAll())); } catch { return [...memory.waypoints.values()]; }
}
export async function wpPut(w) {
  memory.waypoints.set(w.id, w);
  try { await tx('waypoints', 'readwrite', (s) => { s.put(w); }); return true; } catch { return false; }
}
export async function wpDel(id) {
  memory.waypoints.delete(id);
  try { await tx('waypoints', 'readwrite', (s) => { s.delete(id); }); } catch { /* ignoreres */ }
}

export async function packGet(key) {
  try { return await tx('packs', 'readonly', (s) => wrap(s.get(key))); } catch { return undefined; }
}
export async function packPut(key, blob) {
  // Kaster ved fx QuotaExceededError - kalderen skal håndtere det.
  await tx('packs', 'readwrite', (s) => { s.put(blob, key); });
}
export async function packDel(key) {
  try { await tx('packs', 'readwrite', (s) => { s.delete(key); }); } catch { /* ignoreres */ }
}
export async function packKeys() {
  try { return await tx('packs', 'readonly', (s) => wrap(s.getAllKeys())); } catch { return []; }
}

// ---- fliser og kortområder ------------------------------------------------------------------------------
export async function tileGet(key) { try { return await tx('tiles', 'readonly', (s) => wrap(s.get(key))); } catch { return undefined; } }
export async function tileHas(keys) {
  // Returnerer et Set med de nøgler, der allerede findes (én transaktion)
  return tx('tiles', 'readonly', (s) => Promise.all(keys.map((k) => wrap(s.getKey(k)))).then((r) => new Set(r.filter((k) => k !== undefined))));
}
// Gem flise eller tilføj områdets reference til en eksisterende (kaster ved fx QuotaExceededError)
export async function tileAddRef(key, data, areaId) {
  await tx('tiles', 'readwrite', (s) => {
    const g = s.get(key);
    g.onsuccess = () => { const v = g.result; if (v) { if (!v.refs.includes(areaId)) { v.refs.push(areaId); s.put(v, key); } } else if (data) s.put({ data, refs: [areaId] }, key); };
  });
}
// Fjern områdets reference fra alle fliser; fliser uden referencer slettes. Returnerer antal slettede.
export async function tileReleaseArea(areaId) {
  let n = 0;
  await tx('tiles', 'readwrite', (s) => {
    const c = s.openCursor();
    c.onsuccess = () => {
      const cur = c.result; if (!cur) return;
      const v = cur.value, i = v.refs.indexOf(areaId);
      if (i >= 0) { v.refs.splice(i, 1); if (v.refs.length) cur.update(v); else { cur.delete(); n++; } }
      cur.continue();
    };
  });
  return n;
}
export async function tileKeysWithPrefix(prefix) {
  return tx('tiles', 'readonly', (s) => wrap(s.getAllKeys(IDBKeyRange.bound(prefix, prefix + '\uffff'))));
}
export async function areaAll() { try { return await tx('areas', 'readonly', (s) => wrap(s.getAll())); } catch { return []; } }
export async function areaGet(id) { try { return await tx('areas', 'readonly', (s) => wrap(s.get(id))); } catch { return undefined; } }
export async function areaPut(a) { await tx('areas', 'readwrite', (s) => { s.put(a); }); }
export async function areaDel(id) { try { await tx('areas', 'readwrite', (s) => { s.delete(id); }); } catch { /* ignoreres */ } }

export async function wipeAll() {
  try {
    const db = await open();
    await Promise.all(['kv', 'waypoints', 'packs', 'tiles', 'areas'].map((st) => new Promise((res) => {
      const t = db.transaction(st, 'readwrite'); t.objectStore(st).clear(); t.oncomplete = res; t.onerror = res;
    })));
  } catch { /* ignoreres */ }
  memory.kv.clear(); memory.waypoints.clear();
}

export async function requestPersistence() {
  try { return navigator.storage?.persist ? await navigator.storage.persist() : false; } catch { return false; }
}
export async function storageInfo() {
  try {
    const est = navigator.storage?.estimate ? await navigator.storage.estimate() : null;
    const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : null;
    return { usage: est?.usage ?? null, quota: est?.quota ?? null, persisted };
  } catch { return { usage: null, quota: null, persisted: null }; }
}
