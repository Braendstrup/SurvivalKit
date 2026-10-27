// Enhedstest: UTM32/ETRS89 (egen implementering) mod referenceværdier beregnet med pyproj (EPSG:4326 -> EPSG:25832).
import { toUTM32, fromUTM32, haversine, toGPX, naismith } from '../app/js/geo.js';
import { readFileSync } from 'node:fs';
const ref = JSON.parse(readFileSync(new URL('./geo_reference.json', import.meta.url)));
let fail = 0, n = 0, maxErr = 0;
for (const p of ref) {
  const u = toUTM32(p.lon, p.lat);
  const err = Math.hypot(u.e - p.e, u.n - p.n);
  const back = fromUTM32(p.e, p.n);
  const errBack = haversine({ lon: back.lon, lat: back.lat }, p);
  maxErr = Math.max(maxErr, err, errBack); n++;
  if (err > 0.01 || errBack > 0.01) { fail++; console.log('FEJL', p.navn, err, errBack); }
}
const d = haversine({ lat: 56.4, lon: 10.88 }, { lat: 56.2, lon: 10.68 });
if (Math.abs(naismith(10000, 300) - 150) > 1e-9) { fail++; console.log('FEJL naismith'); }
if (!toGPX([{ lat: 1, lon: 2, name: 'a<b' }]).includes('a&lt;b')) { fail++; console.log('FEJL gpx-escape'); }
console.log(`UTM32-test: ${n} punkter, største afvigelse ${maxErr.toFixed(5)} m, haversine Grenaa-Ebeltoft ca. ${(d / 1000).toFixed(1)} km`);
console.log(fail ? `FEJLET (${fail})` : 'OK');
process.exit(fail ? 1 : 0);
