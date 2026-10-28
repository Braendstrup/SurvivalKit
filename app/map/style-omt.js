// MapLibre-stil for selvvalgte områder (OpenMapTiles-skema fra OpenFreeMap), i samme farver og signaturer som
// Djursland-kortet. Fliser læses fra lokale protokoller (IndexedDB); intet i stilen peger på eksterne servere.
import { FONT, LIGHT, DARK } from './style.js';

// OpenMapTiles-POI → appens punktsymboler (POI i style.js). Ukendte typer vises ikke.
export const POI_KEY = ['match', ['get', 'subclass'],
  'drinking_water', 'drinking_water', 'toilets', 'toilets', 'shelter', 'shelter', 'camp_site', 'camp_site', 'picnic_site', 'picnic', 'viewpoint', 'viewpoint',
  'hospital', 'hospital', 'police', 'police', 'fire_station', 'fire_station', 'pharmacy', 'pharmacy', 'parking', 'parking', 'ferry_terminal', 'ferry',
  'marina', 'harbour', 'harbour', 'harbour', 'station', 'station', 'halt', 'station', 'lighthouse', 'landmark', 'tower', 'landmark', 'windmill', 'landmark',
  ['match', ['get', 'class'], 'campsite', 'camp_site', 'parking', 'parking', 'hospital', 'hospital', 'police', 'police', 'fire_station', 'fire_station', 'pharmacy', 'pharmacy', 'harbor', 'harbour', 'railway', 'station', 'ferry_terminal', 'ferry', '']];
const SUB = { drinking_water: 'drinking_water', toilets: 'toilets', shelter: 'shelter', camp_site: 'camp_site', picnic_site: 'picnic', viewpoint: 'viewpoint', hospital: 'hospital', police: 'police', fire_station: 'fire_station', pharmacy: 'pharmacy', parking: 'parking', ferry_terminal: 'ferry', marina: 'harbour', harbour: 'harbour', station: 'station', halt: 'station', lighthouse: 'landmark', tower: 'landmark', windmill: 'landmark' };
const CLS = { campsite: 'camp_site', parking: 'parking', hospital: 'hospital', police: 'police', fire_station: 'fire_station', pharmacy: 'pharmacy', harbor: 'harbour', railway: 'station', ferry_terminal: 'ferry' };
export const poiKeyOf = (p) => SUB[p.subclass] || CLS[p.class] || '';

const NAME = ['coalesce', ['get', 'name:da'], ['get', 'name:latin'], ['get', 'name']];

export function buildOmtStyle({ dark = false, bounds, vis = {}, contourUrl, demUrl } = {}) {
  const c = dark ? DARK : LIGHT;
  const show = (k) => (vis[k] === false ? 'none' : 'visible');
  const ROAD_W = { motorway: 4, trunk: 3.6, primary: 3.2, secondary: 2.8, tertiary: 2.4, minor: 1.8, service: 1.2 };
  const roadClasses = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'];
  const MINZ = { motorway: 6, trunk: 6, primary: 8, secondary: 9, tertiary: 10, minor: 12, service: 14 };
  const wInterp = (k, m = 1) => ['interpolate', ['exponential', 1.5], ['zoom'], 9, ROAD_W[k] * 0.35 * m, 14, ROAD_W[k] * 1.6 * m, 18, ROAD_W[k] * 6 * m];
  const notTunnel = ['!=', ['get', 'brunnel'], 'tunnel'];
  const LC = { forest: ['wood', 'forest'], grass: ['grass'], farmland: ['farmland'], wetland: ['wetland'], beach: ['sand'], bare: ['rock', 'ice'], scrub: ['scrub'] };

  const layers = [
    { id: 'bg', type: 'background', paint: { 'background-color': c.land } },
    ...['farmland', 'grass', 'scrub', 'wetland', 'beach', 'bare'].map((k) => ({ id: 'lu-' + k, type: 'fill', source: 'vec', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', LC[k]]], layout: { visibility: show('landuse') }, paint: { 'fill-color': c[k], 'fill-opacity': k === 'wetland' ? 0.85 : 1 } })),
    { id: 'lu-heath', type: 'fill', source: 'vec', 'source-layer': 'landcover', filter: ['==', ['get', 'subclass'], 'heath'], layout: { visibility: show('landuse') }, paint: { 'fill-color': c.heath } },
    { id: 'lu-urban', type: 'fill', source: 'vec', 'source-layer': 'landuse', filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial', 'retail', 'suburb', 'neighbourhood', 'quarter', 'railway', 'garages']]], layout: { visibility: show('landuse') }, paint: { 'fill-color': c.urban } },
    { id: 'lu-green', type: 'fill', source: 'vec', 'source-layer': 'landuse', filter: ['in', ['get', 'class'], ['literal', ['cemetery', 'park', 'playground', 'pitch', 'stadium']]], layout: { visibility: show('landuse') }, paint: { 'fill-color': c.green } },
    { id: 'lu-forest', type: 'fill', source: 'vec', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', LC.forest]], layout: { visibility: show('forest') }, paint: { 'fill-color': c.forest } },
    { id: 'hillshade', type: 'hillshade', source: 'dem', layout: { visibility: show('hillshade') },
      paint: { 'hillshade-exaggeration': dark ? 0.35 : 0.5, 'hillshade-shadow-color': dark ? '#000' : '#4a3b2a', 'hillshade-highlight-color': dark ? '#6c7a6f' : '#ffffff', 'hillshade-accent-color': dark ? '#000' : '#6a553d' } },
    { id: 'water', type: 'fill', source: 'vec', 'source-layer': 'water', layout: { visibility: show('water') }, paint: { 'fill-color': ['match', ['get', 'class'], 'ocean', c.sea, c.water] } },
    { id: 'waterway', type: 'line', source: 'vec', 'source-layer': 'waterway', layout: { visibility: show('water') },
      paint: { 'line-color': c.waterLine, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 14, ['match', ['get', 'class'], 'river', 3, 'canal', 2.4, 'stream', 1.4, 0.8], 18, 5] } },
    { id: 'protected-fill', type: 'fill', source: 'vec', 'source-layer': 'park', layout: { visibility: show('protected') }, paint: { 'fill-color': c.protected, 'fill-opacity': 0.07 } },
    { id: 'protected-line', type: 'line', source: 'vec', 'source-layer': 'park', layout: { visibility: show('protected') }, paint: { 'line-color': c.protected, 'line-width': 1.6, 'line-dasharray': [4, 2], 'line-opacity': 0.9 } },
    { id: 'contour-minor', type: 'line', source: 'contours', 'source-layer': 'contours', filter: ['==', ['get', 'level'], 0], minzoom: 11, layout: { visibility: show('contour') }, paint: { 'line-color': c.contour, 'line-width': 0.6, 'line-opacity': 0.7 } },
    { id: 'contour-major', type: 'line', source: 'contours', 'source-layer': 'contours', filter: ['>', ['get', 'level'], 0], minzoom: 10, layout: { visibility: show('contour') }, paint: { 'line-color': c.contourMajor, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 15, 1.4] } },
    { id: 'building', type: 'fill', source: 'vec', 'source-layer': 'building', minzoom: 14, layout: { visibility: show('building') }, paint: { 'fill-color': c.building, 'fill-outline-color': c.buildingLine } },
    ...roadClasses.flatMap((k) => [
      { id: `road-case-${k}`, type: 'line', source: 'vec', 'source-layer': 'transportation', minzoom: MINZ[k], filter: ['all', ['==', ['get', 'class'], k], notTunnel], layout: { visibility: show('road'), 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.roadCasing, 'line-width': wInterp(k, 1.35), 'line-opacity': 0.8 } },
      { id: `road-${k}`, type: 'line', source: 'vec', 'source-layer': 'transportation', minzoom: MINZ[k], filter: ['all', ['==', ['get', 'class'], k], notTunnel], layout: { visibility: show('road'), 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c[k], 'line-width': wInterp(k, 1) } },
    ]),
    { id: 'road-track', type: 'line', source: 'vec', 'source-layer': 'transportation', minzoom: 12, filter: ['==', ['get', 'class'], 'track'], layout: { visibility: show('path') }, paint: { 'line-color': c.track, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 16, 2.4], 'line-dasharray': [4, 2] } },
    { id: 'road-path', type: 'line', source: 'vec', 'source-layer': 'transportation', minzoom: 13, filter: ['==', ['get', 'class'], 'path'], layout: { visibility: show('path') }, paint: { 'line-color': c.path, 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.9, 17, 2], 'line-dasharray': [1.2, 1.4] } },
    { id: 'road-rail', type: 'line', source: 'vec', 'source-layer': 'transportation', minzoom: 9, filter: ['in', ['get', 'class'], ['literal', ['rail', 'transit']]], layout: { visibility: show('road') }, paint: { 'line-color': c.rail, 'line-width': 1.4, 'line-dasharray': [3, 3] } },
    { id: 'road-ferry', type: 'line', source: 'vec', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'ferry'], layout: { visibility: show('road') }, paint: { 'line-color': c.waterLine, 'line-width': 1.4, 'line-dasharray': [2, 3] } },
    { id: 'boundary', type: 'line', source: 'vec', 'source-layer': 'boundary', filter: ['all', ['<=', ['coalesce', ['get', 'admin_level'], 99], 8], ['!=', ['coalesce', ['get', 'maritime'], 0], 1]], layout: { visibility: show('boundary') }, paint: { 'line-color': c.boundary, 'line-width': ['match', ['coalesce', ['get', 'admin_level'], 99], 2, 2, 1], 'line-dasharray': [6, 3], 'line-opacity': 0.7 } },
    { id: 'coverage-mask', type: 'fill', source: 'coverage', paint: { 'fill-color': c.mask, 'fill-opacity': 0.35 } },
    { id: 'coverage-line', type: 'line', source: 'coverage', filter: ['==', '$type', 'LineString'], paint: { 'line-color': '#e53935', 'line-width': 2, 'line-dasharray': [3, 2] } },
    { id: 'lbl-contour', type: 'symbol', source: 'contours', 'source-layer': 'contours', filter: ['>', ['get', 'level'], 0], minzoom: 13, layout: { visibility: show('contour'), 'symbol-placement': 'line', 'text-field': ['concat', ['to-string', ['get', 'ele']], ' m'], 'text-font': FONT.regular, 'text-size': 10 }, paint: { 'text-color': c.contourMajor, 'text-halo-color': c.textHalo, 'text-halo-width': 1.2 } },
    { id: 'lbl-water', type: 'symbol', source: 'vec', 'source-layer': 'water_name', minzoom: 10, layout: { visibility: show('labels'), 'text-field': NAME, 'text-font': FONT.italic, 'text-size': 12, 'text-max-width': 6 }, paint: { 'text-color': c.water_text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.3 } },
    { id: 'lbl-area', type: 'symbol', source: 'vec', 'source-layer': 'park', minzoom: 11, layout: { visibility: show('labels'), 'text-field': NAME, 'text-font': FONT.italic, 'text-size': 11, 'text-max-width': 7 }, paint: { 'text-color': dark ? '#9fe0b0' : '#2a5a33', 'text-halo-color': c.textHalo, 'text-halo-width': 1.3 } },
    { id: 'lbl-road', type: 'symbol', source: 'vec', 'source-layer': 'transportation_name', minzoom: 13, layout: { visibility: show('labels'), 'symbol-placement': 'line', 'text-field': NAME, 'text-font': FONT.regular, 'text-size': 11 }, paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.6 } },
    { id: 'poi', type: 'symbol', source: 'vec', 'source-layer': 'poi', minzoom: 11, filter: ['!=', POI_KEY, ''],
      layout: { visibility: show('poi'), 'icon-image': ['concat', 'poi-', POI_KEY], 'icon-allow-overlap': false, 'icon-size': 0.9, 'text-field': ['step', ['zoom'], '', 15, ['coalesce', NAME, '']], 'text-font': FONT.regular, 'text-size': 10, 'text-offset': [0, 1.2], 'text-anchor': 'top', 'text-optional': true },
      paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.3 } },
    { id: 'place-peak', type: 'symbol', source: 'vec', 'source-layer': 'mountain_peak', minzoom: 11, layout: { visibility: show('labels'), 'text-field': ['concat', ['coalesce', NAME, ''], ['case', ['has', 'ele'], ['concat', ' ', ['to-string', ['get', 'ele']], ' m'], '']], 'text-font': FONT.regular, 'text-size': 11, 'text-optional': true }, paint: { 'text-color': c.contourMajor, 'text-halo-color': c.textHalo, 'text-halo-width': 1.4 } },
    { id: 'place-small', type: 'symbol', source: 'vec', 'source-layer': 'place', minzoom: 12, filter: ['in', ['get', 'class'], ['literal', ['hamlet', 'isolated_dwelling', 'neighbourhood', 'locality', 'quarter', 'farm']]], layout: { visibility: show('labels'), 'text-field': NAME, 'text-font': FONT.regular, 'text-size': 11, 'text-optional': true }, paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.5 } },
    { id: 'place-village', type: 'symbol', source: 'vec', 'source-layer': 'place', minzoom: 10, filter: ['in', ['get', 'class'], ['literal', ['village', 'suburb']]], layout: { visibility: show('labels'), 'text-field': NAME, 'text-font': FONT.bold, 'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 15, 15] }, paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 1.6 } },
    { id: 'place-town', type: 'symbol', source: 'vec', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]], layout: { visibility: show('labels'), 'text-field': NAME, 'text-font': FONT.bold, 'text-size': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 19] }, paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 2 } },
  ];
  const empty = { type: 'FeatureCollection', features: [] };
  return {
    version: 8, name: 'Område offline', glyphs: 'djg://{fontstack}/{range}',
    sources: {
      vec: { type: 'vector', tiles: ['ofm://{z}/{x}/{y}'], minzoom: 6, maxzoom: 14, bounds, attribution: '© OpenMapTiles © OpenStreetMap-bidragydere (ODbL) · OpenFreeMap' },
      dem: { type: 'raster-dem', tiles: [demUrl], tileSize: 256, encoding: 'terrarium', minzoom: 7, maxzoom: 12, bounds, attribution: 'Terrain Tiles (SRTM, EU-DEM m.fl.)' },
      contours: { type: 'vector', tiles: [contourUrl], minzoom: 10, maxzoom: 15, bounds },
      coverage: { type: 'geojson', data: empty }, user: { type: 'geojson', data: empty }, gps: { type: 'geojson', data: empty },
    },
    layers: [
      ...layers,
      { id: 'user-line', type: 'line', source: 'user', filter: ['==', '$type', 'LineString'], paint: { 'line-color': ['coalesce', ['get', 'color'], '#e91e63'], 'line-width': 4, 'line-opacity': 0.9 } },
      { id: 'user-pt', type: 'circle', source: 'user', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 6, 'circle-color': ['coalesce', ['get', 'color'], '#e91e63'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } },
      { id: 'user-lbl', type: 'symbol', source: 'user', filter: ['all', ['==', '$type', 'Point'], ['has', 'label']], layout: { 'text-field': ['get', 'label'], 'text-font': FONT.bold, 'text-size': 12, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-allow-overlap': true }, paint: { 'text-color': c.text, 'text-halo-color': c.textHalo, 'text-halo-width': 2 } },
      { id: 'gps-acc', type: 'circle', source: 'gps', filter: ['==', 'kind', 'acc'], paint: { 'circle-radius': ['get', 'rpx'], 'circle-color': '#1e88e5', 'circle-opacity': 0.15, 'circle-stroke-color': '#1e88e5', 'circle-stroke-width': 1, 'circle-pitch-alignment': 'map' } },
      { id: 'gps-dot', type: 'circle', source: 'gps', filter: ['==', 'kind', 'pos'], paint: { 'circle-radius': 8, 'circle-color': '#1e88e5', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } },
    ],
  };
}
