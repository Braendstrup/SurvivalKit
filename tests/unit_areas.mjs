// Enhedstests af kortområder: flisematematik og navneudtræk fra rigtige OpenFreeMap-fliser (fixtures).
import { readFileSync } from 'node:fs';
import { countTiles, tileRange, tiles, LIMITS, ZOOMS } from '../app/js/areas.js';
import { readTile, tilePointToLonLat } from '../app/js/mvt.js';
import { namesFromTile } from '../app/js/areas.js';

let fail = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.log('FEJL', m); } };
const fx = (f) => readFileSync(new URL('./fixtures/' + f, import.meta.url));

// flisematematik
const mols = [10.50, 56.18, 10.60, 56.24];
// referenceværdier fra mercantile (Python): tile(10.50, 56.24, 14) = 8669/5082, tile(10.60, 56.18, 14) = 8674/5087
ok(JSON.stringify(tileRange(mols, 14)) === JSON.stringify({ x0: 8669, x1: 8674, y0: 5082, y1: 5087 }), 'tileRange z14: ' + JSON.stringify(tileRange(mols, 14)));
ok(countTiles(mols, [14, 14]) === 36, 'z14-antal ' + countTiles(mols, [14, 14]));
ok(countTiles(mols, ZOOMS.vec) === [...tiles(mols, ZOOMS.vec)].length, 'countTiles = antal i tiles()');
ok(countTiles(mols, ZOOMS.vec) < LIMITS.tiles, 'Mols-område under grænsen');
ok(countTiles([9, 55, 12, 57.5], ZOOMS.vec) > LIMITS.tiles, 'halvdelen af Danmark over grænsen');
ok(countTiles([179.95, 10, 180, 10.01], [3, 3]) === 1 && tileRange([-200, -85, 200, 85], 2).x1 === 3 && tileRange([-200, -85, 200, 85], 2).x0 === 0, 'grænser klemmes');
// et ca. 50 x 50 km område ligger tæt på grænsen (dokumenteret i README)
const big = [10.2, 56.0, 11.0, 56.45]; ok(countTiles(big, ZOOMS.vec) > 1500, '50 km-område: ' + countTiles(big, ZOOMS.vec));

// MVT og flisekoordinater
const t = readTile(fx('ofm/14_8670_5088.pbf'));
ok(['water', 'place', 'poi', 'landcover'].every((l) => t[l]?.features.length), 'lag i flise: ' + Object.keys(t));
const [w, nn] = tilePointToLonLat(14, 8670, 5088, 0, 0, 4096), [e, s] = tilePointToLonLat(14, 8670, 5088, 4096, 4096, 4096);
// mercantile.bounds(8670, 5088, 14) = 10.50293, 56.15779, 10.52490, 56.17002
ok(Math.abs(w - 10.50293) < 1e-5 && Math.abs(e - 10.52490) < 1e-5 && Math.abs(nn - 56.17002) < 1e-5 && Math.abs(s - 56.15779) < 1e-5, `flisehjørner ${w},${nn} – ${e},${s}`);

// navneudtræk (søgeindeks)
const names = namesFromTile(fx('ofm/14_8670_5088.pbf'), 14, 8670, 5088);
const has = (nm, kind) => names.some((x) => x[0] === nm && (!kind || x[1] === kind));
ok(has('Begtrup Vig', 'water') && has('Vænge Sø', 'water') && has('Kongsgårde', 'place:hamlet'), 'navne: ' + names.map((x) => x[0]).join(', '));
// samme koordinater som mapbox-vector-tile (Python): Kongsgårde 10.5202, 56.1458 (stednavne ligger i flisens buffer)
const kg = names.find((x) => x[0] === 'Kongsgårde'); ok(Math.abs(kg[2] - 10.5202) < 1e-4 && Math.abs(kg[3] - 56.1458) < 1e-4, 'Kongsgårde-koordinat ' + kg);
ok(names.every((x) => x[2] > 10.48 && x[2] < 10.55 && x[3] > 56.14 && x[3] < 56.19), 'navnekoordinater inden for flise + buffer');
const z12 = readTile(fx('ofm/12_2167_1272.pbf'));
ok(Object.keys(z12).length > 5, 'z12-flise læses');

console.log(`Kortområder: ${n} kontroller – ${fail ? 'FEJLET (' + fail + ')' : 'OK'}`);
process.exit(fail ? 1 : 0);
