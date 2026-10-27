/* Service worker – genereres af tools/build.mjs (rediger ikke app/sw.js direkte).
   Strategi: hele appen forhåndscaches under et versioneret cachenavn. En ny version installeres i en NY cache; den gamle
   bruges, indtil brugeren accepterer opdateringen. Fejler en fil under installation, afbrydes hele installationen og den
   eksisterende version er uændret (atomisk opdatering). Kortpakkerne ligger i IndexedDB og håndteres af appen selv. */
const VERSION = '0.9.0-549f3536fc';
const CACHE = 'sk-static-' + VERSION;
const PRECACHE = [
 "./",
 "css/app.css",
 "data/content.json",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "icons/icon.svg",
 "index.html",
 "js/app.js",
 "js/db.js",
 "js/geo.js",
 "js/mapview.js",
 "js/packs.js",
 "js/store.js",
 "js/util.js",
 "js/views.js",
 "js/views/arter.js",
 "js/views/gemte.js",
 "js/views/guide.js",
 "js/views/home.js",
 "js/views/nod.js",
 "js/views/search.js",
 "js/views/settings.js",
 "js/views/ui.js",
 "manifest.webmanifest",
 "map/glyphs/OpenSans-Bold/0-255.pbf",
 "map/glyphs/OpenSans-Bold/256-511.pbf",
 "map/glyphs/OpenSans-Bold/8192-8447.pbf",
 "map/glyphs/OpenSans-Italic/0-255.pbf",
 "map/glyphs/OpenSans-Italic/256-511.pbf",
 "map/glyphs/OpenSans-Italic/8192-8447.pbf",
 "map/glyphs/OpenSans-Regular/0-255.pbf",
 "map/glyphs/OpenSans-Regular/256-511.pbf",
 "map/glyphs/OpenSans-Regular/8192-8447.pbf",
 "map/style.js",
 "vendor/maplibre-LICENSE.txt",
 "vendor/maplibre-gl.css",
 "vendor/maplibre-gl.js",
 "vendor/pmtiles.js"
];

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
