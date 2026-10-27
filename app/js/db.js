// Lokal lagring: IndexedDB med tre lagre.
//   kv        - indstillinger, bogmærker, noter, nødkontakter, tjeklistefremdrift
//   waypoints - brugerens steder (keyPath: id)
//   packs     - kortpakker som Blob (key: "<pakkenavn>@<version>")
// Alt kaldes defensivt: kan browseren ikke give adgang (privat tilstand, ryddet lager) virker appen videre
// med data i hukommelsen, og brugeren får besked i "Mig"-siden.

const DB_NAME = 'survivalkit';
const DB_VERSION = 1;
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

export async function wipeAll() {
  try {
    const db = await open();
    await Promise.all(['kv', 'waypoints', 'packs'].map((st) => new Promise((res) => {
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
