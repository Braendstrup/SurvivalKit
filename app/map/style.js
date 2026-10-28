// MapLibre-stil for det lokale Djursland-kort. Alle ressourcer (fliser, glyphs) hentes fra lokale protokoller/filer.
// Intet i stilen peger på eksterne servere.

export const FONT = { regular: ['OpenSans-Regular'], bold: ['OpenSans-Bold'], italic: ['OpenSans-Italic'] };

export const LIGHT = {
  sea: '#a9d0e6', land: '#f2efe4', farmland: '#f4f0dc', grass: '#dfe9c3', green: '#cfe5b4', forest: '#9fc98b', heath: '#d8c3da',
  scrub: '#bcd69a', wetland: '#c3dfd0', beach: '#f1e1a6', urban: '#dcd6cc', bare: '#d8d0c4', water: '#8ec5e6', waterLine: '#4f9cc8',
  contour: '#a87d48', contourMajor: '#8a5a24', building: '#b9ada0', buildingLine: '#8d8174',
  roadCasing: '#6b6b6b', motorway: '#e8825a', trunk: '#f0a35e', primary: '#f7cf6b', secondary: '#fff1a0', tertiary: '#ffffff', minor: '#ffffff', service: '#f6f6f6',
  track: '#8a6a3a', path: '#b5372b', rail: '#555555', protected: '#2d7a3e', boundary: '#6a2d8f',
  text: '#222', textHalo: '#ffffffd0', water_text: '#1a5f8a', mask: '#1d2a22',
};
export const DARK = {
  sea: '#0e2433', land: '#1a211c', farmland: '#1d2520', grass: '#243126', green: '#26402b', forest: '#1f4a2c', heath: '#3a2f40',
  scrub: '#2e4429', wetland: '#223c33', beach: '#4a4326', urban: '#2e2f2c', bare: '#35322d', water: '#143a52', waterLine: '#2c7aa3',
  contour: '#8f6d42', contourMajor: '#b58a52', building: '#4a4640', buildingLine: '#69635a',
  roadCasing: '#0b0b0b', motorway: '#a8523a', trunk: '#a8703c', primary: '#a88c3e', secondary: '#8b8456', tertiary: '#6b6b66', minor: '#555550', service: '#464642',
  track: '#b08a50', path: '#ff8a7a', rail: '#9a9a9a', protected: '#59c27a', boundary: '#c68cf0',
  text: '#e9efe9', textHalo: '#101814d0', water_text: '#8cc6e8', mask: '#000',
};

export const POI = {
  drinking_water: { code: 'V', label: 'Drikkevand (OSM-markeret – ikke verificeret)', color: '#1565c0' },
  toilets: { code: 'WC', label: 'Toilet', color: '#6d4c41' },
  shelter: { code: 'S', label: 'Shelter / ly (OSM-markeret)', color: '#2e7d32' },
  firepit: { code: 'B', label: 'Bålplads (OSM-markeret – tjek altid forbud)', color: '#d84315' },
  camp_site: { code: 'T', label: 'Campingplads / teltplads', color: '#00796b' },
  parking: { code: 'P', label: 'Parkering', color: '#455a64' },
  hospital: { code: 'H', label: 'Sygehus / akutmodtagelse (tjek aktuel funktion)', color: '#c62828' },
  police: { code: 'Po', label: 'Politistation (tjek åbningstid)', color: '#283593' },
  fire_station: { code: 'Br', label: 'Brandstation', color: '#b71c1c' },
  aed: { code: '♥', label: 'Hjertestarter (OSM-markeret – ikke garanteret tilgængelig)', color: '#ad1457' },
  pharmacy: { code: 'A', label: 'Apotek', color: '#2e7d32' },
  viewpoint: { code: 'U', label: 'Udsigtspunkt', color: '#6a1b9a' },
  picnic: { code: 'M', label: 'Madpakkehus / rasteplads', color: '#558b2f' },
  harbour: { code: 'Hv', label: 'Havn / marina', color: '#0277bd' },
  spring: { code: 'K', label: 'Kilde (ikke nødvendigvis drikkeligt!)', color: '#0097a7' },
  station: { code: 'St', label: 'Station', color: '#37474f' },
  landmark: { code: '◆', label: 'Landemærke (fyr, tårn, mølle)', color: '#795548' },
  ferry: { code: 'F', label: 'Færgeterminal', color: '#0277bd' },
};

/** Tegner små runde ikoner (bogstavkode i farvet cirkel) som ImageData – ingen sprite-filer. */
export function makePoiImages(dark) {
  const out = {};
  const px = 2; // pixelRatio
  for (const [k, v] of Object.entries(POI)) {
    const s = 24 * px;
    const c = new OffscreenCanvas(s, s); const g = c.getContext('2d');
    g.fillStyle = dark ? '#101814' : '#fff'; g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 1, 0, 7); g.fill();
    g.fillStyle = v.color; g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 3.5, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = `bold ${v.code.length > 1 ? 10 * px : 12 * px}px system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(v.code, s / 2, s / 2 + 1);
    out['poi-' + k] = { data: g.getImageData(0, 0, s, s), pixelRatio: px };
  }
  return out;
}

export function buildStyle({ dark = false, bounds, vis = {} } = {}) {
  const c = dark ? DARK : LIGHT;
  const show = (k) => (vis[k] === false ? 'none' : 'visible');
  const ROAD_W = { motorway: 4, trunk: 3.6, primary: 3.2, secondary: 2.8, tertiary: 2.4, minor: 1.8, service: 1.2 };
  const roadClasses = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'];
  const wInterp = (k, m = 1) => ['interpolate', ['exponential', 1.5], ['zoom'], 9, ROAD_W[k] * 0.35 * m, 14, ROAD_W[k] * 1.6 * m, 18, ROAD_W[k] * 6 * m];

  const layers = [
    { id: 'bg', type: 'background', paint: { 'background-color': c.sea } },
    { id: 'land', type: 'fill', source: 'vec', 'source-layer': 'land', paint: { 'fill-color': c.land } },
    ...['farmland', 'grass', 'green', 'urban', 'bare', 'scrub', 'heath', 'wetland', 'beach', 'forest'].map((cl) => ({
      id: 'lu-' + cl, type: 'fill', source: 'vec', 'source-layer': 'landuse', filter: ['==', 'class', cl],
      layout: { visibility: show(cl === 'forest' ? 'forest' : 'landuse') }, paint: { 'fill-color': c[cl], 'fill-opacity': cl === 'wetland' ? 0.85 : 1 },
    })),
    { id: 'hillshade', type: 'hillshade', source: 'dem', layout: { visibility: show('hillshade') },
      paint: { 'hillshade-exaggeration': dark ? 0.35 : 0.5, 'hillshade-shadow-color': dark ? '#000' : '#4a3b2a', 'hillshade-highlight-color': dark ? '#6c7a6f' : '#ffffff', 'hillshade-accent-color': dark ? '#000' : '#6a553d' } },
    { id: 'water', type: 'fill', source: 'vec', 'source-layer': 'water', layout: { visibility: show('water') }, paint: { 'fill-color': c.water } },
    { id: 'waterway', type: 'line', source: 'vec', 'source-layer': 'waterway', layout: { visibility: show('water') },
      paint: { 'line-color': c.waterLine, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 14, ['match', ['get', 'class'], 'river', 3, 'canal', 2.4, 'stream', 1.4, 0.8], 18, 5] } },
    { id: 'protected-fill', type: 'fill', source: 'vec', 'source-layer': 'protected', layout: { visibility: show('protected') }, paint: { 'fill-color': c.protected, 'fill-opacity': 0.07 } },
    { id: 'protected-line', type: 'line', source: 'vec', 'source-layer': 'protected', layout: { visibility: show('protected') },
      paint: { 'line-color': c.protected, 'line-width': 1.6, 'line-dasharray': [4, 2], 'line-opacity': 0.9 } },
    { id: 'contour-minor', type: 'line', source: 'vec', 'source-layer': 'contour', filter: ['==', 'major', 0], minzoom: 12, layout: { visibility: show('contour') },
      paint: { 'line-color': c.contour, 'line-width': 0.6, 'line-opacity': 0.7 } },
    { id: 'contour-major', type: 'line', source: 'vec', 'source-layer': 'contour', filter: ['==', 'major', 1], minzoom: 10, layout: { visibility: show('contour') },
      paint: { 'line-color': c.contourMajor, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 15, 1.4] } },
    { id: 'building', type: 'fill', source: 'vec', 'source-layer': 'building', minzoom: 14, layout: { visibility: show('building') },
      paint: { 'fill-color': c.building, 'fill-outline-color': c.buildingLine } },
    // veje: kasse + fyld
    ...roadClasses.flatMap((k) => [
      { id: `road-case-${k}`, type: 'line', source: 'vec', 'source-layer': 'road', filter: ['all', ['==', 'class', k], ['!=', 'tunnel', 1]], layout: { visibility: show('road'), 'line-cap': 'round', 'line-join': 'round' },
        minzoom: { motorway: 8, trunk: 8, primary: 8, secondary: 9, tertiary: 10, minor: 12, service: 14 }[k],
        paint: { 'line-color': c.roadCasing, 'line-width': wInterp(k, 1.35), 'line-opacity': 0.8 } },
      { id: `road-${k}`, type: 'line', source: 'vec', 'source-layer': 'road', filter: ['all', ['==', 'class', k], ['!=', 'tunnel', 1]], layout: { visibility: show('road'), 'line-cap': 'round', 'line-join': 'round' },
        minzoom: { motorway: 8, trunk: 8, primary: 8, secondary: 9, tertiary: 10, minor: 12, service: 14 }[k],
        paint: { 'line-color': c[k], 'line-width': wInterp(k, 1) } },
    ]),
    { id: 'road-bridge', type: 'line', source: 'vec', 'source-layer': 'road', filter: ['==', 'bridge', 1], minzoom: 13, layout: { visibility: show('road') },
      paint: { 'line-color': c.roadCasing, 'line-gap-width': 2, 'line-width': 1.2 } },
    { id: 'road-track', type: 'line', source: 'vec', 'source-layer': 'road', filter: ['==', 'class', 'track'], minzoom: 12, layout: { visibility: show('path'), 'line-cap': 'butt' },
      paint: { 'line-color': c.track, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 16, 2.4], 'line-dasharray': [4, 2] } },
    { id: 'road-path', type: 'line', source: 'vec', 'source-layer': 'road', filter: ['in', 'class', 'path', 'cycleway'], minzoom: 13, layout: { visibility: show('path') },
      paint: { 'line-color': c.path, 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.9, 17, 2], 'line-dasharray': [1.2, 1.4] } },
    { id: 'road-rail', type: 'line', source: 'vec', 'source-layer': 'road', filter: ['==', 'class', 'rail'], minzoom: 9, layout: { visibility: show('road') },
      paint: { 'line-color': c.rail, 'line-width': 1.4, 'line-dasharray': [3, 3] } },
    { id: 'road-ferry', type: 'line', source: 'vec', 'source-layer': 'road', filter: ['==', 'class', 'ferry'], layout: { visibility: show('road') },
      paint: { 'line-color': c.waterLine, 'line-width': 1.4, 'line-dasharray': [2, 3] } },
    { id: 'boundary', type: 'line', source: 'vec', 'source-layer': 'boundary', layout: { visibility: show('boundary') },
      paint: { 'line-color': c.boundary, 'line-width': 1.4, 'line-dasharray': [6, 3], 'line-opacity': 0.8 } },
    // dækningsmaske uden for det hentede område
    { id: 'coverage-mask', type: 'fill', source: 'coverage', paint: { 'fill-color': c.mask, 'fill-opacity': 0.35 } },
    { id: 'coverage-line', type: 'line', source: 'coverage', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#e53935', 'line-width': 2, 'line-dasharray': [3, 2] } },
    // tekst
    { id: 'lbl-contour', type: 'symbol', source: 'vec', 'source-layer': 'contour', filter: ['==', 'major', 1], minzoom: 13, layout: { visibility: show('contour'), 'symbol-placement': 'line', 'text-field': ['concat', ['to-string', ['get', 'ele']], ' m'], 'text-font': FONT.regular, 'text-size': 10 },
      paint: { 'text-color': c.contourMajor, 'text-halo-color': c.textHalo, 'text-halo-width': 1.2 } },
    { id: 'lbl-water', type: 'symbol', source: 'vec', 'source-layer': 'name_poly', filter: ['==', 'class', 'water'], minzoom: 11, layout: { visibility: show('labels'), 'text-field': ['get', 'name'], 'text-font': FONT.italic, 'text-size': 12, 'text-max-width': 6 },
      paint: { 'text-color': c.water_text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.3 } },
    { id: 'lbl-area', type: 'symbol', source: 'vec', 'source-layer': 'name_poly', filter: ['!=', 'class', 'water'], minzoom: 11, layout: { visibility: show('labels'), 'text-field': ['get', 'name'], 'text-font': FONT.italic, 'text-size': 11, 'text-max-width': 7 },
      paint: { 'text-color': dark ? '#9fe0b0' : '#2a5a33', 'text-halo-color': c.textHalo, 'text-halo-width': 1.3 } },
    { id: 'lbl-road', type: 'symbol', source: 'vec', 'source-layer': 'road', filter: ['all', ['has', 'name'], ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']], minzoom: 13,
      layout: { visibility: show('labels'), 'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FONT.regular, 'text-size': 11 },
      paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.6 } },
    { id: 'poi', type: 'symbol', source: 'vec', 'source-layer': 'poi', layout: { visibility: show('poi'), 'icon-image': ['concat', 'poi-', ['get', 'class']], 'icon-allow-overlap': false, 'icon-size': 0.9,
      'text-field': ['step', ['zoom'], '', 15, ['coalesce', ['get', 'name'], '']], 'text-font': FONT.regular, 'text-size': 10, 'text-offset': [0, 1.2], 'text-anchor': 'top', 'text-optional': true },
      minzoom: 11, paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.3 } },
    { id: 'place-peak', type: 'symbol', source: 'vec', 'source-layer': 'place', filter: ['==', 'class', 'peak'], minzoom: 12,
      layout: { visibility: show('labels'), 'text-field': ['concat', ['coalesce', ['get', 'name'], ''], ['case', ['has', 'ele'], ['concat', ' ', ['get', 'ele'], ' m'], '']], 'text-font': FONT.regular, 'text-size': 11, 'text-optional': true },
      paint: { 'text-color': c.contourMajor, 'text-halo-color': c.textHalo, 'text-halo-width': 1.4 } },
    { id: 'place-small', type: 'symbol', source: 'vec', 'source-layer': 'place', filter: ['all', ['!=', 'class', 'peak'], ['>=', 'rank', 4]], minzoom: 12,
      layout: { visibility: show('labels'), 'text-field': ['get', 'name'], 'text-font': FONT.regular, 'text-size': 11, 'text-optional': true },
      paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.5 } },
    { id: 'place-village', type: 'symbol', source: 'vec', 'source-layer': 'place', filter: ['all', ['!=', 'class', 'peak'], ['==', 'rank', 3]], minzoom: 10,
      layout: { visibility: show('labels'), 'text-field': ['get', 'name'], 'text-font': FONT.bold, 'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 15, 15] },
      paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.6 } },
    { id: 'place-town', type: 'symbol', source: 'vec', 'source-layer': 'place', filter: ['all', ['!=', 'class', 'peak'], ['<=', 'rank', 2]],
      layout: { visibility: show('labels'), 'text-field': ['get', 'name'], 'text-font': FONT.bold, 'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 19] },
      paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 2 } },
  ];

  const empty = { type: 'FeatureCollection', features: [] };
  return {
    version: 8,
    name: 'Djursland offline',
    glyphs: 'djg://{fontstack}/{range}', // lokal protokol (se mapview.js); mangler et interval, returneres tomme glyphs
    sources: {
      vec: { type: 'vector', tiles: ['djv://vec/{z}/{x}/{y}'], minzoom: 8, maxzoom: 14, bounds, attribution: '© OpenStreetMap-bidragydere (ODbL)' },
      dem: { type: 'raster-dem', tiles: ['djv://dem/{z}/{x}/{y}'], tileSize: 256, encoding: 'terrarium', minzoom: 7, maxzoom: 13, attribution: 'Terrain Tiles (SRTM, EU-DEM m.fl.)' },
      coverage: { type: 'geojson', data: empty },
      user: { type: 'geojson', data: empty },
      gps: { type: 'geojson', data: empty },
    },
    layers: [
      ...layers,
      { id: 'user-line', type: 'line', source: 'user', filter: ['==', '$type', 'LineString'], paint: { 'line-color': ['coalesce', ['get', 'color'], '#e91e63'], 'line-width': 4, 'line-opacity': 0.9 } },
      { id: 'user-pt', type: 'circle', source: 'user', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 6, 'circle-color': ['coalesce', ['get', 'color'], '#e91e63'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } },
      { id: 'user-lbl', type: 'symbol', source: 'user', filter: ['all', ['==', '$type', 'Point'], ['has', 'label']], layout: { 'text-field': ['get', 'label'], 'text-font': FONT.bold, 'text-size': 12, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-allow-overlap': true },
        paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 2 } },
      { id: 'gps-acc', type: 'circle', source: 'gps', filter: ['==', 'kind', 'acc'], paint: { 'circle-radius': ['get', 'rpx'], 'circle-color': '#1e88e5', 'circle-opacity': 0.15, 'circle-stroke-color': '#1e88e5', 'circle-stroke-width': 1, 'circle-pitch-alignment': 'map' } },
      { id: 'gps-dot', type: 'circle', source: 'gps', filter: ['==', 'kind', 'pos'], paint: { 'circle-radius': 8, 'circle-color': '#1e88e5', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } },
    ],
  };
}

export function maskGeoJSON(bbox) {
  const [w, s, e, n] = bbox;
  const world = [[w - 8, s - 4], [e + 8, s - 4], [e + 8, n + 4], [w - 8, n + 4], [w - 8, s - 4]];
  const hole = [[w, s], [w, n], [e, n], [e, s], [w, s]];
  return {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [world, hole] } },
      { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[w, s], [e, s], [e, n], [w, n], [w, s]] } },
    ],
  };
}
