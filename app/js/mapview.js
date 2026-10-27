// Kortside: MapLibre + lokale PMTiles-pakker fra IndexedDB. Ingen eksterne servere bruges til visning.
import { h, inline, fmtDate, fmtMB, uid, download, debounce, norm } from './util.js';
import * as db from './db.js';
import * as packs from './packs.js';
import { coordTexts, haversine, pathLength, fmtDist, naismith, fmtMinutes, toGPX, fromGPX, bearing } from './geo.js';
import { buildStyle, makePoiImages, maskGeoJSON, POI } from '../map/style.js';
import { ic, toast } from './views.js';

const SCRIPTS = ['vendor/pmtiles.js', 'vendor/maplibre-gl.js'];
let libsLoaded = null;
function loadLibs() {
  if (libsLoaded) return libsLoaded;
  if (!document.querySelector('link[data-maplibre]')) document.head.append(h('link', { rel: 'stylesheet', href: 'vendor/maplibre-gl.css', 'data-maplibre': '' }));
  libsLoaded = SCRIPTS.reduce((p, src) => p.then(() => globalThis[src.includes('pmtiles') ? 'pmtiles' : 'maplibregl'] ? null : new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Kunne ikke indlæse ' + src)); document.head.append(s); })), Promise.resolve());
  return libsLoaded;
}

let protocolsAdded = false, flatDem = null;
async function emptyDemTile() {
  if (!flatDem) { const c = new OffscreenCanvas(256, 256); const g = c.getContext('2d'); g.fillStyle = 'rgb(128,0,0)'; g.fillRect(0, 0, 256, 256); flatDem = await (await c.convertToBlob({ type: 'image/png' })).arrayBuffer(); }
  return flatDem.slice(0);
}
function addProtocols() {
  if (protocolsAdded) return; protocolsAdded = true;
  maplibregl.addProtocol('djv', async (p) => {
    const m = p.url.match(/^djv:\/\/(vec|dem)\/(\d+)\/(\d+)\/(\d+)/);
    const pk = await packs.openActive();
    if (!m || !pk) return { data: m && m[1] === 'dem' ? await emptyDemTile() : new ArrayBuffer(0) };
    const t = await pk[m[1]].getZxy(+m[2], +m[3], +m[4]);
    if (t) return { data: t.data.slice(0) };
    return { data: m[1] === 'dem' ? await emptyDemTile() : new ArrayBuffer(0) };
  });
  // glyphs: lokale filer; mangler et tegnområde returneres tomme glyphs i stedet for en fejl
  maplibregl.addProtocol('djg', async (p) => {
    const m = p.url.match(/^djg:\/\/([^/]+)\/(\d+-\d+)/);
    try { const r = await fetch(`map/glyphs/${m[1]}/${m[2]}.pbf`); if (r.ok) return { data: await r.arrayBuffer() }; } catch { /* tom glyph nedenfor */ }
    return { data: new ArrayBuffer(0) };
  });
}

const GROUPS = {
  road: ['road-case-motorway', 'road-case-trunk', 'road-case-primary', 'road-case-secondary', 'road-case-tertiary', 'road-case-minor', 'road-case-service', 'road-motorway', 'road-trunk', 'road-primary', 'road-secondary', 'road-tertiary', 'road-minor', 'road-service', 'road-bridge', 'road-rail', 'road-ferry'],
  path: ['road-track', 'road-path'], forest: ['lu-forest'], landuse: ['lu-farmland', 'lu-grass', 'lu-green', 'lu-urban', 'lu-bare', 'lu-scrub', 'lu-heath', 'lu-wetland', 'lu-beach'],
  water: ['water', 'waterway', 'lbl-water'], contour: ['contour-minor', 'contour-major', 'lbl-contour'], hillshade: ['hillshade'], building: ['building'],
  poi: ['poi'], protected: ['protected-fill', 'protected-line'], labels: ['lbl-area', 'lbl-road', 'place-peak', 'place-small', 'place-village', 'place-town'], boundary: ['boundary'],
};
const GROUP_LABEL = { road: 'Veje og jernbane', path: 'Stier og grusveje', forest: 'Skov', landuse: 'Øvrig arealanvendelse', water: 'Søer og vandløb', contour: 'Højdekurver (5 m / 25 m)', hillshade: 'Skyggerelief (terræn)', building: 'Bygninger (zoom 14+)', poi: 'Punkter (faciliteter)', protected: 'Beskyttede områder (OSM)', labels: 'Navne', boundary: 'Kommunegrænse Djursland' };
const POI_GROUPS = {
  vand: ['Vand (drikkevand, kilder)', ['drinking_water', 'spring']], ly: ['Ly, bål og overnatning', ['shelter', 'firepit', 'camp_site', 'picnic']],
  hjaelp: ['Hjælp (sygehus, politi, brand, hjertestarter, apotek)', ['hospital', 'police', 'fire_station', 'aed', 'pharmacy']],
  fac: ['Faciliteter (toilet, parkering, station, havn)', ['toilets', 'parking', 'station', 'harbour', 'ferry']], se: ['Udsigt og landemærker', ['viewpoint', 'landmark']],
};
const POI_CLASS_GROUP = Object.fromEntries(Object.entries(POI_GROUPS).flatMap(([g, [, cl]]) => cl.map((c) => [c, g])));

const fold = (s) => norm(s).replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'aa');
const isDark = () => { const t = document.documentElement.dataset.theme; return t === 'dark' || t === 'night' || ((!t || t === 'auto') && matchMedia('(prefers-color-scheme: dark)').matches); };
const KIND_LABEL = { 'place:city': 'By', 'place:town': 'By', 'place:village': 'Landsby', 'place:hamlet': 'Bebyggelse', 'place:suburb': 'Bydel', 'place:locality': 'Sted', 'place:island': 'Ø', 'place:islet': 'Holm', peak: 'Højde', road: 'Vej', waterway: 'Vandløb', water: 'Sø/vand', protected: 'Beskyttet område', 'natural:bay': 'Bugt', 'natural:cape': 'Pynt', 'natural:beach': 'Strand', 'land:forest': 'Skov', 'land:heath': 'Hede', 'land:wetland': 'Vådområde', 'land:green': 'Park/grønt', 'land:beach': 'Strand' };
const kindLabel = (k) => KIND_LABEL[k] || (k.startsWith('poi:') ? (POI[k.slice(4)]?.label.split(' (')[0] || 'Punkt') : k);

export async function pageMap(ctx) {
  const root = h('div', { class: 'mapwrap' });
  const state = { cleanup: [], mode: 'none', measure: [], route: [], watch: null, gpsPos: null, wp: [], wpMarkers: [] };
  const cleanup = () => { state.cleanup.forEach((f) => { try { f(); } catch { /* ignoreres */ } }); if (state.watch != null) navigator.geolocation.clearWatch(state.watch); window.__skmap = null; };

  const manifestActive = await packs.getActive();
  if (!manifestActive || ctx.forceDownload) {
    const forced = ctx.forceDownload; ctx.forceDownload = null; root.classList.add('dlmode');
    root.append(downloadCard(root, ctx, async () => { cleanup(); ctx.rerender(); }, false, forced));
    return { node: root, cleanup, fullmap: true };
  }
  try { await loadLibs(); } catch (e) { root.append(h('div', { class: 'card' }, h('p', null, 'Kortbiblioteket kunne ikke indlæses: ' + e.message))); return { node: root, cleanup, fullmap: true }; }
  let pk;
  try { pk = await packs.openActive(); } catch (e) {
    root.classList.add('dlmode');
    root.append(h('div', { class: 'card' }, h('h2', null, 'Kortpakken kan ikke åbnes'), h('p', null, e.message), downloadCard(root, ctx, () => { cleanup(); ctx.rerender(); }, true)));
    return { node: root, cleanup, fullmap: true };
  }
  addProtocols();
  const man = pk.manifest;
  const saved = await db.kvGet('map.state', null);
  const vis = (await db.kvGet('map.vis', {})) || {};
  const poiVis = (await db.kvGet('map.poivis', {})) || {};

  const mapDiv = h('div', { id: 'map' });
  root.append(mapDiv);
  const dark = isDark();
  const map = new maplibregl.Map({
    container: mapDiv, style: buildStyle({ dark, bounds: man.bbox, vis }),
    center: saved?.center || [10.6, 56.3], zoom: saved?.zoom ?? 9.5, bearing: saved?.bearing || 0,
    minZoom: 7, maxZoom: 18.5, maxBounds: [[man.bbox[0] - 1.2, man.bbox[1] - 0.8], [man.bbox[2] + 1.2, man.bbox[3] + 0.8]],
    attributionControl: { compact: true }, pitchWithRotate: false, dragRotate: true, touchPitch: false, fadeDuration: 0,
  });
  window.__skmap = map; // bruges af automatiske tests
  const ro = new ResizeObserver(() => map.resize()); ro.observe(root); state.cleanup.push(() => ro.disconnect());
  requestAnimationFrame(() => map.resize());
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left');
  map.touchZoomRotate.enableRotation();

  const poiFilterUpdate = () => {
    const on = Object.entries(POI_CLASS_GROUP).filter(([, g]) => poiVis[g] !== false).map(([c]) => c);
    map.setFilter('poi', ['in', ['get', 'class'], ['literal', on]]);
  };
  map.once('style.load', () => {
    for (const [k, v] of Object.entries(makePoiImages(dark))) map.addImage(k, v.data, { pixelRatio: v.pixelRatio });
    map.getSource('coverage').setData(maskGeoJSON(man.bbox));
    poiFilterUpdate();
  });
  map.on('error', (e) => { if (e?.error?.message && !/Failed to fetch|aborted/i.test(e.error.message)) console.warn('Kortfejl:', e.error.message); });
  state.cleanup.push(() => map.remove());
  const ready = new Promise((r) => map.once('load', r));
  window.__skmapReady = ready;

  // ---- UI-elementer ------------------------------------------------------------------------------------------------
  const sheetHost = h('div'); const crosshair = h('div', { class: 'crosshair', 'aria-hidden': 'true' });
  const infoCoord = h('span', { class: 'mono', id: 'info-coord' }); const infoElev = h('span', { id: 'info-elev' }); const infoZoom = h('span', { id: 'info-zoom' });
  const infobar = h('div', { class: 'infobar', 'aria-live': 'off' }, h('span', null, 'Midte: ', infoCoord), infoElev, infoZoom);
  const btn = (icon, label, onclick, pressed) => h('button', { class: 'mbtn', 'aria-label': label, title: label, 'aria-pressed': pressed == null ? null : String(pressed), onclick }, typeof icon === 'string' && icon.length < 3 ? icon : ic(icon));
  const northBtn = h('button', { class: 'mbtn', 'aria-label': 'Vend kortet mod nord', title: 'Nord op', onclick: () => map.easeTo({ bearing: 0, duration: 250 }) });
  northBtn.innerHTML = '<svg class="ic compass-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 6 20l6-4 6 4z" fill="currentColor"/><path d="M12 2 6 20l6-4z" fill="#c62828"/></svg>';
  const gpsBtn = btn('locate', 'Vis min position (GPS)', () => toggleGPS(), false);
  const toolBtns = {
    measure: btn('ruler', 'Mål afstand', () => setMode('measure'), false), route: btn('route', 'Planlæg rute', () => setMode('route'), false), wp: btn('pin', 'Waypoints', () => openWaypoints(), false),
  };
  const ui = [
    h('div', { class: 'mapui tl' }, searchBox()),
    h('div', { class: 'mapui tr' }, btn('plus', 'Zoom ind', () => map.zoomIn()), btn('minus', 'Zoom ud', () => map.zoomOut()), northBtn, gpsBtn, btn('layers', 'Lag', () => openLayers()), toolBtns.measure, toolBtns.route, toolBtns.wp, btn('book', 'Signaturforklaring', () => openLegend()), btn('down', 'Kortdata og dækning', () => openData())),
    crosshair, infobar, sheetHost,
  ];
  root.append(...ui);
  const closeSheet = () => sheetHost.replaceChildren();
  // Luk (X) afslutter også en aktiv måle-/rutetilstand, så værktøjsknappen ikke bliver ved med at være markeret
  const closeX = () => { if (state.mode !== 'none') setMode(state.mode); else closeSheet(); document.activeElement?.blur?.(); };
  const sheet = (...kids) => { sheetHost.replaceChildren(h('div', { class: 'sheet', role: 'dialog' }, h('button', { class: 'mbtn close', 'aria-label': 'Luk', onclick: closeX }, ic('x')), ...kids)); };

  // ---- søgning -----------------------------------------------------------------------------------------------------------
  function searchBox() {
    const inp = h('input', { type: 'search', placeholder: 'Søg by, vej, sted … (offline)', 'aria-label': 'Søg på kortet', autocomplete: 'off' });
    const res = h('div', { class: 'mapresults', hidden: true });
    const idx = pk.search?.items || [];
    const folded = idx.map((e) => fold(e[0]));
    inp.addEventListener('input', debounce(() => {
      const q = fold(inp.value.trim());
      if (q.length < 2) { res.hidden = true; return; }
      const hits = [];
      for (let i = 0; i < idx.length && hits.length < 60; i++) if (folded[i].includes(q)) hits.push([i, folded[i].startsWith(q) ? 0 : 1]);
      hits.sort((a, b) => a[1] - b[1]);
      res.replaceChildren(...hits.slice(0, 25).map(([i]) => { const e = idx[i]; return h('button', { onclick: () => { goTo(e[2], e[3], 14.5, e[0]); res.hidden = true; inp.blur(); } }, h('span', null, e[0]), h('small', null, kindLabel(e[1]) + (e[4] ? ' · ' + e[4] + ' m' : ''))); }));
      if (!hits.length) res.replaceChildren(h('button', { disabled: true }, 'Ingen resultater i det hentede område'));
      res.hidden = false;
    }, 120));
    return h('div', null, h('div', { class: 'mapsearch' }, inp), res);
  }
  function goTo(lon, lat, z, label) {
    map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), z), duration: 600 });
    setUser({ marker: { lon, lat, label } });
  }

  // ---- brugerlag (markering, måling, rute, waypoints) -----------------------------------------------------------------
  let marker = null;
  function setUser(o = {}) {
    if (o.marker !== undefined) marker = o.marker;
    const feats = [];
    for (const w of state.wp) feats.push({ type: 'Feature', properties: { label: w.name, color: '#e91e63' }, geometry: { type: 'Point', coordinates: [w.lon, w.lat] } });
    if (marker) feats.push({ type: 'Feature', properties: { label: marker.label || '', color: '#ff6d00' }, geometry: { type: 'Point', coordinates: [marker.lon, marker.lat] } });
    const addLine = (pts, color) => { if (pts.length > 1) feats.push({ type: 'Feature', properties: { color }, geometry: { type: 'LineString', coordinates: pts.map((p) => [p.lon, p.lat]) } }); pts.forEach((p, i) => feats.push({ type: 'Feature', properties: { color, label: i === 0 ? '' : '' }, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } })); };
    addLine(state.measure, '#6a1b9a'); addLine(state.route, '#00838f');
    map.getSource('user')?.setData({ type: 'FeatureCollection', features: feats });
  }
  async function loadWp() { state.wp = (await db.wpAll()).sort((a, b) => b.time - a.time); setUser(); }
  loadWp();

  function setMode(m) {
    state.mode = state.mode === m ? 'none' : m;
    toolBtns.measure.setAttribute('aria-pressed', String(state.mode === 'measure')); toolBtns.route.setAttribute('aria-pressed', String(state.mode === 'route'));
    root.style.cursor = state.mode === 'none' ? '' : 'crosshair';
    if (state.mode === 'measure') openMeasure(); else if (state.mode === 'route') openRoute(); else closeSheet();
  }

  map.on('click', async (e) => {
    const pt = { lon: e.lngLat.lng, lat: e.lngLat.lat };
    if (state.mode === 'measure') { state.measure.push(pt); setUser(); openMeasure(); return; }
    if (state.mode === 'route') { state.route.push(pt); setUser(); openRoute(); return; }
    const f = map.queryRenderedFeatures(e.point, { layers: ['poi'] })[0];
    if (f) return openPoi(f, pt);
    marker = { ...pt, label: '' }; setUser(); openPoint(pt);
  });
  map.on('mousemove', 'poi', () => { map.getCanvas().style.cursor = 'pointer'; }); map.on('mouseleave', 'poi', () => { map.getCanvas().style.cursor = ''; });

  function coordBlock(pt, extra) {
    const t = coordTexts(pt.lon, pt.lat);
    return h('dl', { class: 'kvt' }, h('dt', null, 'WGS84'), h('dd', null, t.dec), h('dt', null, 'Grader/min/sek'), h('dd', null, t.dms), h('dt', null, 'UTM32 / ETRS89'), h('dd', null, t.utm), extra || null);
  }
  async function openPoint(pt) {
    const elevEl = h('dd', null, 'beregner …');
    sheet(h('h2', null, 'Valgt punkt'), coordBlock(pt, [h('dt', null, 'Højde (model)'), elevEl]),
      h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => saveWaypoint(pt) }, ic('pin'), 'Gem som waypoint'), h('button', { class: 'btn secondary', onclick: () => { marker = null; setUser(); closeSheet(); } }, 'Fjern markering')));
    const el = await packs.elevationAt(pt.lon, pt.lat).catch(() => null);
    elevEl.textContent = el == null ? 'ingen højdedata her' : `ca. ${Math.round(el)} m (modelbaseret, usikkerhed typisk flere meter)`;
  }
  function openPoi(f, pt) {
    const p = f.properties, def = POI[p.class] || { label: p.class };
    const coords = f.geometry.coordinates;
    sheet(h('h2', null, p.name || def.label.split(' (')[0]), h('p', null, h('span', { class: 'badge warn' }, 'OSM-markeret – ikke verificeret'), def.label),
      p.note ? h('p', null, 'Note i OSM: ' + p.note) : null, p.shelter_type ? h('p', null, 'Type: ' + p.shelter_type) : null, p.access ? h('p', null, 'Adgang (OSM): ' + p.access) : null,
      h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, 'Tjek på stedet'), h('p', null, 'Kortet dokumenterer ikke, at stedet er åbent, tilgængeligt, i funktion eller egnet til overnatning/drikkevand. Drikkevand fra naturen og ukendte vandposter skal behandles – se vandkapitlet.')),
      coordBlock({ lon: coords[0], lat: coords[1] }),
      h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => saveWaypoint({ lon: coords[0], lat: coords[1] }, p.name || def.label.split(' (')[0]) }, ic('pin'), 'Gem som waypoint')));
  }

  // ---- måling ---------------------------------------------------------------------------------------------------------
  function openMeasure() {
    const d = pathLength(state.measure);
    sheet(h('h2', null, 'Mål afstand'), h('p', null, 'Tryk på kortet for at tilføje punkter. Luftlinje mellem punkterne (ikke stiforløb).'),
      h('p', { class: 'kvt' }, h('strong', null, 'Samlet: '), fmtDist(d), ' · ', state.measure.length, ' punkter'),
      h('div', { class: 'btnrow' }, h('button', { class: 'btn secondary small', onclick: () => { state.measure.pop(); setUser(); openMeasure(); } }, 'Fortryd sidste'), h('button', { class: 'btn secondary small', onclick: () => { state.measure = []; setUser(); openMeasure(); } }, 'Ryd'), h('button', { class: 'btn small', onclick: () => setMode('measure') }, 'Færdig')));
  }

  // ---- rute (rette linjer mellem punkter + Naismith) ---------------------------------------------------------------------
  async function routeStats() {
    const pts = state.route; let ascent = 0, descent = 0; const legs = [];
    for (let i = 1; i < pts.length; i++) {
      const dist = haversine(pts[i - 1], pts[i]);
      const n = Math.max(2, Math.ceil(dist / 60)); let prev = null, a = 0, dsc = 0;
      for (let k = 0; k <= n; k++) {
        const lon = pts[i - 1].lon + (pts[i].lon - pts[i - 1].lon) * k / n, lat = pts[i - 1].lat + (pts[i].lat - pts[i - 1].lat) * k / n;
        const el = await packs.elevationAt(lon, lat).catch(() => null);
        if (el != null && prev != null) { const dz = el - prev; if (dz > 0) a += dz; else dsc -= dz; }
        if (el != null) prev = el;
      }
      legs.push({ dist, a, d: dsc }); ascent += a; descent += dsc;
    }
    return { legs, ascent, descent, dist: pathLength(pts) };
  }
  async function openRoute() {
    const body = h('div', null, h('p', { class: 'muted' }, 'Beregner …'));
    sheet(h('h2', null, 'Enkel ruteplanlægning'), h('p', { class: 'small' }, 'Tryk på kortet for start, mellempunkter og mål. Ruten er rette linjer – den følger ikke stier og tager ikke hensyn til vand, hegn, private arealer eller forbud.'), body);
    if (state.route.length < 2) { body.replaceChildren(h('p', null, 'Tilføj mindst to punkter.'), routeButtons()); return; }
    const s = await routeStats(); const min = naismith(s.dist, s.ascent);
    body.replaceChildren(
      h('div', { class: 'stat' }, h('span', null, 'Længde (luftlinje)'), h('strong', null, fmtDist(s.dist))),
      h('div', { class: 'stat' }, h('span', null, 'Stigning / fald (højdemodel)'), h('strong', null, `${Math.round(s.ascent)} m / ${Math.round(s.descent)} m`)),
      h('div', { class: 'stat' }, h('span', null, 'Gangtid, grov vurdering ', inline('{T}')), h('strong', null, fmtMinutes(min))),
      h('p', { class: 'small muted' }, 'Naismiths regel: 5 km/t + 1 min pr. 10 m stigning. Faktisk tid afhænger af føre, vægt, kondition, lys og vejr – læg margen til. Planlæg altid alternative udgange (veje, bebyggelse) og en afbrydelsestid.'),
      h('div', { class: 'tablewrap' }, h('table', null, h('thead', null, h('tr', null, ['Etape', 'Længde', 'Op/ned', 'Kurs'].map((t) => h('th', null, t)))),
        h('tbody', null, s.legs.map((l, i) => h('tr', null, h('td', null, `${i + 1}→${i + 2}`), h('td', null, fmtDist(l.dist)), h('td', null, `${Math.round(l.a)}/${Math.round(l.d)} m`), h('td', null, Math.round(bearing(state.route[i], state.route[i + 1])) + '° (ret nord)')))))),
      routeButtons());
  }
  function routeButtons() {
    return h('div', { class: 'btnrow' },
      h('button', { class: 'btn secondary small', onclick: () => { state.route.pop(); setUser(); openRoute(); } }, 'Fortryd sidste'), h('button', { class: 'btn secondary small', onclick: () => { state.route = []; setUser(); openRoute(); } }, 'Ryd'),
      h('button', { class: 'btn secondary small', disabled: state.route.length < 2, onclick: async () => { const name = prompt('Navn på rute', 'Rute ' + new Date().toLocaleDateString('da-DK')); if (!name) return; const routes = await db.kvGet('routes', []); routes.push({ id: uid(), name, pts: state.route, time: Date.now() }); await db.kvSet('routes', routes); toast('Rute gemt'); } }, 'Gem rute'),
      h('button', { class: 'btn secondary small', onclick: async () => { const routes = await db.kvGet('routes', []); sheet(h('h2', null, 'Gemte ruter'), routes.length ? h('ul', { class: 'list' }, routes.map((r, i) => h('li', null, h('a', { href: '#', onclick: (e) => { e.preventDefault(); state.route = r.pts; setUser(); state.mode = 'route'; openRoute(); map.fitBounds(r.pts.reduce((b, p) => b.extend([p.lon, p.lat]), new maplibregl.LngLatBounds([r.pts[0].lon, r.pts[0].lat], [r.pts[0].lon, r.pts[0].lat])), { padding: 60 }); } }, h('span', null, r.name, h('small', null, r.pts.length + ' punkter')), h('button', { class: 'btn secondary small', onclick: async (e) => { e.preventDefault(); e.stopPropagation(); routes.splice(i, 1); await db.kvSet('routes', routes); setMode('route'); setMode('route'); } }, 'Slet'))))) : h('p', null, 'Ingen gemte ruter.')); } }, 'Gemte ruter'),
      h('button', { class: 'btn secondary small', disabled: state.route.length < 2, onclick: () => download('rute.gpx', toGPX(state.route.map((p, i) => ({ ...p, name: 'Punkt ' + (i + 1), time: Date.now() })), 'Rute'), 'application/gpx+xml') }, 'Eksportér GPX'),
      h('button', { class: 'btn small', onclick: () => setMode('route') }, 'Færdig'));
  }

  // ---- waypoints -----------------------------------------------------------------------------------------------------------
  async function saveWaypoint(pt, name) {
    const nm = name || prompt('Navn på waypoint', 'Punkt ' + (state.wp.length + 1));
    if (nm == null) return;
    const el = await packs.elevationAt(pt.lon, pt.lat).catch(() => null);
    const w = { id: uid(), name: nm || 'Punkt', lon: pt.lon, lat: pt.lat, ele: el == null ? null : Math.round(el), note: '', time: Date.now() };
    const ok = await db.wpPut(w); await loadWp(); toast(ok ? 'Waypoint gemt lokalt' : 'Kunne ikke gemme permanent – ligger kun midlertidigt');
    if (sheetHost.firstChild) openWaypoints();
  }
  function openWaypoints() {
    const c = map.getCenter();
    sheet(h('h2', null, 'Waypoints (' + state.wp.length + ')'),
      h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => saveWaypoint({ lon: c.lng, lat: c.lat }) }, ic('pin'), 'Gem kortets midte'),
        gpsPosOrNull() ? h('button', { class: 'btn', onclick: () => saveWaypoint(gpsPosOrNull()) }, ic('locate'), 'Gem min position') : null),
      state.wp.length ? h('ul', { class: 'list' }, state.wp.map((w) => h('li', null, h('a', { href: '#', onclick: (e) => { e.preventDefault(); map.flyTo({ center: [w.lon, w.lat], zoom: Math.max(map.getZoom(), 14) }); closeSheet(); } },
        h('span', null, w.name, h('small', null, coordTexts(w.lon, w.lat).dec + (w.ele != null ? ` · ${w.ele} m` : '') + (state.gpsPos ? ` · ${fmtDist(haversine(state.gpsPos, w))} fra dig` : ''))),
        h('button', { class: 'btn secondary small', 'aria-label': 'Slet ' + w.name, onclick: async (e) => { e.preventDefault(); e.stopPropagation(); await db.wpDel(w.id); await loadWp(); openWaypoints(); } }, ic('x'))))))
        : h('p', { class: 'muted' }, 'Ingen waypoints endnu. Tryk på kortet og vælg "Gem som waypoint", eller brug kortets midte.'),
      h('div', { class: 'btnrow' },
        h('button', { class: 'btn secondary small', disabled: !state.wp.length, onclick: () => download('waypoints.gpx', toGPX(state.wp), 'application/gpx+xml') }, ic('down'), 'Eksportér GPX'),
        h('label', { class: 'btn secondary small', style: 'margin:0' }, 'Importér GPX', h('input', { type: 'file', accept: '.gpx,application/gpx+xml,text/xml', hidden: true, onchange: async (e) => {
          try { const list = fromGPX(await e.target.files[0].text()); for (const w of list) await db.wpPut({ id: uid(), ...w }); await loadWp(); toast(list.length + ' waypoints importeret'); openWaypoints(); } catch (err) { toast('Import mislykkedes: ' + err.message); }
        } }))));
  }

  // ---- GPS -------------------------------------------------------------------------------------------------------------------
  const gpsPosOrNull = () => state.gpsPos;
  let first = true, devHeading = null;
  function onDeviceOrientation(ev) { const hd = ev.webkitCompassHeading ?? (ev.absolute && ev.alpha != null ? 360 - ev.alpha : null); if (hd != null) devHeading = Math.round(hd); }
  function toggleGPS() {
    if (state.watch != null) { navigator.geolocation.clearWatch(state.watch); state.watch = null; state.gpsPos = null; map.getSource('gps').setData({ type: 'FeatureCollection', features: [] }); gpsBtn.setAttribute('aria-pressed', 'false'); window.removeEventListener('deviceorientationabsolute', onDeviceOrientation); window.removeEventListener('deviceorientation', onDeviceOrientation); return; }
    if (!('geolocation' in navigator)) return toast('Denne enhed/browser har ingen GPS-funktion');
    gpsBtn.setAttribute('aria-pressed', 'true'); first = true;
    window.addEventListener('deviceorientationabsolute', onDeviceOrientation); window.addEventListener('deviceorientation', onDeviceOrientation);
    state.watch = navigator.geolocation.watchPosition(async (p) => {
      const pos = { lon: p.coords.longitude, lat: p.coords.latitude, acc: p.coords.accuracy, alt: p.coords.altitude, t: p.timestamp };
      state.gpsPos = pos;
      const rpx = pos.acc / (156543.03 * Math.cos(pos.lat * Math.PI / 180) / 2 ** map.getZoom());
      map.getSource('gps').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { kind: 'acc', rpx: Math.max(rpx, 6) }, geometry: { type: 'Point', coordinates: [pos.lon, pos.lat] } }, { type: 'Feature', properties: { kind: 'pos' }, geometry: { type: 'Point', coordinates: [pos.lon, pos.lat] } }] });
      if (first) { first = false; const inside = pos.lon >= man.bbox[0] && pos.lon <= man.bbox[2] && pos.lat >= man.bbox[1] && pos.lat <= man.bbox[3]; map.flyTo({ center: [pos.lon, pos.lat], zoom: Math.max(map.getZoom(), 14) }); if (!inside) toast('Din position er uden for det hentede kortområde'); }
      if (await db.kvGet('lastpos.enabled', false)) await db.kvSet('lastpos', pos);
      const t = coordTexts(pos.lon, pos.lat);
      gpsLine.replaceChildren('Din position: ', h('span', { class: 'mono' }, t.utm), ` · ±${Math.round(pos.acc)} m`, pos.alt != null ? ` · GPS-højde ${Math.round(pos.alt)} m` : '', devHeading != null ? ` · kompas ${devHeading}°` : '');
    }, (err) => {
      gpsBtn.setAttribute('aria-pressed', 'false'); state.watch = null;
      toast(err.code === 1 ? 'GPS afvist: giv tilladelse til placering i browserens indstillinger' : err.code === 2 ? 'Ingen GPS-signal lige nu (prøv udendørs med fri udsigt)' : 'GPS fik timeout');
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 });
  }
  const gpsLine = h('div', { class: 'small', style: 'width:100%' });
  infobar.append(gpsLine);

  // ---- lag, signatur, data ----------------------------------------------------------------------------------------------------
  function openLayers() {
    const saveVis = () => db.kvSet('map.vis', vis);
    sheet(h('h2', null, 'Kortlag'),
      Object.entries(GROUPS).map(([g, ids]) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: vis[g] !== false, onchange: (e) => { vis[g] = e.target.checked; for (const id of ids) map.setLayoutProperty(id, 'visibility', e.target.checked ? 'visible' : 'none'); saveVis(); } }), h('span', null, GROUP_LABEL[g]))),
      h('h3', null, 'Punkter'),
      Object.entries(POI_GROUPS).map(([g, [label]]) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: poiVis[g] !== false, onchange: (e) => { poiVis[g] = e.target.checked; poiFilterUpdate(); db.kvSet('map.poivis', poiVis); } }), h('span', null, label))),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: true, onchange: (e) => { for (const id of ['coverage-mask', 'coverage-line']) map.setLayoutProperty(id, 'visibility', e.target.checked ? 'visible' : 'none'); } }), h('span', null, 'Vis grænse for hentet område (mørkt uden for)')));
  }
  function openLegend() {
    const sw = (color, border) => h('i', { style: `background:${color};${border || ''}` });
    sheet(h('h2', null, 'Signaturforklaring'),
      h('div', { class: 'legend-row' }, sw('#9fc98b'), 'Skov'), h('div', { class: 'legend-row' }, sw('#d8c3da'), 'Hede'), h('div', { class: 'legend-row' }, sw('#c3dfd0'), 'Vådområde/mose'), h('div', { class: 'legend-row' }, sw('#dfe9c3'), 'Eng/græs'), h('div', { class: 'legend-row' }, sw('#f1e1a6'), 'Strand/sand'),
      h('div', { class: 'legend-row' }, sw('#dcd6cc'), 'Bebyggelse'), h('div', { class: 'legend-row' }, sw('#8ec5e6'), 'Sø/vand'),
      h('div', { class: 'legend-row' }, sw('transparent', 'border-top:2px solid #8a5a24;border-radius:0;height:0'), 'Højdekurve (tyk = 25 m, tynd = 5 m; modelbaseret)'),
      h('div', { class: 'legend-row' }, sw('transparent', 'border-top:2px dashed #2d7a3e;border-radius:0;height:0'), 'Beskyttet område (OSM)'), h('div', { class: 'legend-row' }, sw('transparent', 'border-top:2px dashed #6a2d8f;border-radius:0;height:0'), 'Kommunegrænse Djursland'),
      h('div', { class: 'legend-row' }, sw('transparent', 'border-top:3px solid #f7cf6b;border-radius:0;height:0'), 'Vej (farve efter vejklasse)'), h('div', { class: 'legend-row' }, sw('transparent', 'border-top:2px dashed #8a6a3a;border-radius:0;height:0'), 'Grusvej/skovvej'), h('div', { class: 'legend-row' }, sw('transparent', 'border-top:2px dotted #b5372b;border-radius:0;height:0'), 'Sti/cykelsti'),
      h('h3', null, 'Punkter (fra OpenStreetMap, ikke verificeret)'),
      Object.values(POI).map((p) => h('div', { class: 'legend-row' }, h('span', { class: 'poi', style: `background:${p.color}` }, p.code), p.label)),
      h('p', { class: 'small muted' }, 'Manglende symbol betyder ikke, at noget ikke findes: kortet viser kun det, der er registreret i OpenStreetMap. Det angiver aldrig, at et sted er åbent, tilgængeligt, i funktion, lovligt at overnatte eller sikkert at drikke fra.'));
  }
  async function openData() {
    const a = await packs.getActive(); const m = a.manifest;
    const upd = h('p', { class: 'small muted' }, navigator.onLine ? 'Tjekker for opdatering …' : 'Offline – kan ikke tjekke for opdateringer.');
    sheet(h('h2', null, 'Kortdata og dækning'),
      h('div', { class: 'stat' }, h('span', null, 'Kortpakke'), h('strong', null, `${m.title} v${a.version}`)),
      h('div', { class: 'stat' }, h('span', null, 'Hentet lokalt'), h('strong', null, fmtDate(a.activatedAt))),
      h('div', { class: 'stat' }, h('span', null, 'Pakkestørrelse'), h('strong', null, fmtMB(m.totalBytes))),
      h('div', { class: 'stat' }, h('span', null, 'Dækning (WGS84)'), h('strong', null, `${m.bbox[0].toFixed(3)}–${m.bbox[2].toFixed(3)} °Ø, ${m.bbox[1].toFixed(3)}–${m.bbox[3].toFixed(3)} °N`)),
      h('div', { class: 'stat' }, h('span', null, 'Zoomniveauer lokalt'), h('strong', null, 'vektor z8–14, terræn z7–13; zoom 15–18 er forstørrelse')),
      h('div', { class: 'stat' }, h('span', null, 'Ikke hentet'), h('strong', null, 'alt uden for det markerede område (mørkt)')),
      h('p', { class: 'small' }, m.regionDefinition), h('p', { class: 'small' }, 'Kilder: ', m.sources.map((s) => `${s.name} (${s.licence}; ${s.date || ''})`).join(' · ')),
      h('p', { class: 'small muted' }, 'Kendte begrænsninger: højdekurver er afledt af en ca. 10–25 m højdemodel og er ikke landmåling. Stier, bygninger, shelters, vandposter og andre punkter stammer fra frivillige i OpenStreetMap og kan være forældede eller mangle. Anholt er ikke med.'), upd,
      h('div', { class: 'btnrow' }, h('button', { class: 'btn secondary small', onclick: async () => { cleanup(); await packs.removePacks(); packs.closeActive(); ctx.rerender(); } }, 'Slet kortpakke')));
    if (navigator.onLine) packs.fetchManifest().then((nm) => {
      if (nm.version !== a.version || nm.packs.some((p, i) => p.sha256 !== m.packs[i]?.sha256)) upd.replaceChildren('Ny kortpakke tilgængelig (v' + nm.version + '). ', h('button', { class: 'btn small', onclick: () => { cleanup(); ctx.rerender({ forceDownload: nm }); } }, 'Hent opdatering'), ' Den nuværende pakke bevares, indtil den nye er hentet og kontrolleret.');
      else upd.textContent = 'Kortpakken er opdateret.';
    }).catch(() => { upd.textContent = 'Kunne ikke tjekke for opdatering.'; });
  }

  // ---- statuslinje og tilstand ----------------------------------------------------------------------------------------------------
  const updInfo = async () => {
    const c = map.getCenter(); const t = coordTexts(c.lng, c.lat);
    infoCoord.textContent = `${t.utm.replace('32U  ', '')} · ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
    const z = map.getZoom();
    const inside = c.lng >= man.bbox[0] && c.lng <= man.bbox[2] && c.lat >= man.bbox[1] && c.lat <= man.bbox[3];
    infoZoom.textContent = `zoom ${z.toFixed(1)}${z > 14 ? ' (forstørret)' : ''}${inside ? '' : ' · UDEN FOR HENTET OMRÅDE'}`;
    infoZoom.style.fontWeight = inside ? '' : '700';
    const el = inside ? await packs.elevationAt(c.lng, c.lat).catch(() => null) : null;
    infoElev.textContent = el == null ? (inside ? 'højde: ingen data' : '') : `højde ≈ ${Math.round(el)} m`;
  };
  const updDeb = debounce(updInfo, 150);
  map.on('move', () => { northBtn.firstChild.style.transform = `rotate(${-map.getBearing()}deg)`; updDeb(); });
  map.on('moveend', debounce(() => { const c = map.getCenter(); db.kvSet('map.state', { center: [c.lng, c.lat], zoom: map.getZoom(), bearing: map.getBearing() }); }, 500));
  ready.then(updInfo);

  // genvej ind på kortet fra andre sider: #/kort?lon=..&lat=..
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  if (q.has('lon') && q.has('lat')) ready.then(() => goTo(+q.get('lon'), +q.get('lat'), +(q.get('z') || 14), q.get('n') || ''));

  // dækningsadvarsel hvis kortets midte er uden for pakken
  return { node: root, cleanup, fullmap: true };
}

// ---- download-kort (første gang / opdatering) ---------------------------------------------------------------------------------------
function downloadCard(root, ctx, onDone, compact = false, forcedManifest = null) {
  const card = h('div', { class: 'card', style: 'margin:1rem' });
  const status = h('div'); const bar = h('div', { class: 'progress', hidden: true }, h('i')); const lab = h('p', { class: 'small muted' });
  let ac = null;
  const startBtn = h('button', { class: 'btn' }, ic('down'), 'Hent kortpakke');
  const cancel = h('button', { class: 'btn secondary', hidden: true }, 'Annuller');
  card.append(compact ? null : h('h2', null, 'Offlinekort over Djursland'),
    h('p', null, 'Kortet skal hentes én gang, mens du har internet. Derefter virker det helt uden netforbindelse. Den nuværende version bevares, hvis en hentning afbrydes.'),
    status, bar, lab, h('div', { class: 'btnrow' }, startBtn, cancel, forcedManifest ? h('a', { class: 'btn secondary', href: '#/kort', onclick: (e) => { e.preventDefault(); ctx.rerender(); } }, 'Tilbage til kortet (nuværende pakke)') : null));
  (async () => {
    let man; try { man = forcedManifest || await packs.fetchManifest(); } catch {
      status.replaceChildren(h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, 'Ingen forbindelse'), h('p', null, 'Kortpakken kan kun hentes online. Åbn siden igen, når du har internet (Wi-Fi anbefales).')));
      startBtn.disabled = true; return;
    }
    status.replaceChildren(h('dl', { class: 'kvt' }, h('dt', null, 'Version'), h('dd', null, man.version), h('dt', null, 'Størrelse'), h('dd', null, fmtMB(man.totalBytes) + ' (kræver ca. ' + fmtMB(man.totalBytes * 1.3) + ' ledig plads)'),
      h('dt', null, 'Dækning'), h('dd', null, 'Syddjurs og Norddjurs (Djursland) + 3 km: ' + man.bbox.join(', ')), h('dt', null, 'Indhold'), h('dd', null, 'OSM-vektorfliser z8–14, højdemodel, skyggerelief, højdekurver, søgeindeks (' + man.packs.length + ' filer)'),
      h('dt', null, 'Licens'), h('dd', null, 'OpenStreetMap-data (ODbL) og åbne højdedata; se Kilder.')));
    startBtn.onclick = async () => {
      ac = new AbortController(); startBtn.disabled = true; cancel.hidden = false; bar.hidden = false; await db.requestPersistence();
      cancel.onclick = () => ac.abort();
      try {
        await packs.downloadPacks(man, (p) => { bar.firstChild.style.width = (p.overallLoaded / p.overallTotal * 100) + '%'; lab.textContent = `${p.file}: ${fmtMB(p.overallLoaded)} af ${fmtMB(p.overallTotal)} (fil ${p.fileIdx + 1}/${p.fileCount})`; }, ac.signal);
        toast('Kortpakke hentet og kontrolleret ✓'); onDone();
      } catch (e) {
        const msg = { LAGER: 'Ikke nok lagerplads. Frigør plads på enheden og prøv igen.', HASH: 'Filen var beskadiget under overførslen (kontrolsum stemte ikke). Prøv igen.', AFBRUDT: 'Hentningen blev annulleret. Intet er ændret.', HENT: 'Netværksfejl under hentning. Intet er ændret – prøv igen.', STOERRELSE: 'Filen blev ikke hentet fuldstændigt. Prøv igen.', GEM: 'Kunne ikke gemme på enheden (lager fuldt eller blokeret).' }[e.code] || ('Fejl: ' + e.message);
        status.append(h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Hentning mislykkedes'), h('p', null, msg), e.message ? h('p', { class: 'small' }, e.message) : null));
        startBtn.disabled = false; cancel.hidden = true; bar.hidden = true;
      }
    };
  })();
  return card;
}
