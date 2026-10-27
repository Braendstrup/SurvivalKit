/* Service worker – genereres af tools/build.mjs (rediger ikke app/sw.js direkte).
   Strategi: hele appen forhåndscaches under et versioneret cachenavn. En ny version installeres i en NY cache; den gamle
   bruges, indtil brugeren accepterer opdateringen. Fejler en fil under installation, afbrydes hele installationen og den
   eksisterende version er uændret (atomisk opdatering). Kortpakkerne ligger i IndexedDB og håndteres af appen selv. */
const VERSION = '__VERSION__';
const CACHE = 'sk-static-' + VERSION;
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try { await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))); }
    catch (err) { await caches.delete(CACHE); throw err; }
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('sk-static-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/map/pack/')) return;           // store kortpakker: direkte fra netværket (valgfri download)
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const idx = await cache.match('index.html'); if (idx) return idx; }
    try { return await fetch(req); }
    catch {
      if (url.pathname.includes('/map/glyphs/')) return new Response(new ArrayBuffer(0), { status: 200 });
      return new Response('Offline – ressourcen er ikke gemt lokalt.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
