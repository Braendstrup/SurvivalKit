// Geografiske hjælpefunktioner. Ingen eksterne afhængigheder (virker offline).
// Koordinatsystemer:
//   WGS84 (EPSG:4326)       - GPS og kortets koordinater (grader)
//   ETRS89 / UTM32N (25832) - officielt danske kort. For almindelig brug er ETRS89 og WGS84 forskellige
//                             med < 1 m, så samme lon/lat bruges som input til UTM-beregningen.

const A = 6378137.0;
const F = 1 / 298.257222101; // GRS80
const K0 = 0.9996;
const E0 = 500000;
const LON0 = 9 * Math.PI / 180; // UTM zone 32

const N = F / (2 - F);
const A_ = A / (1 + N) * (1 + N * N / 4 + N ** 4 / 64);
const E2 = F * (2 - F);
const E = Math.sqrt(E2);
const ALPHA = [
  N / 2 - 2 * N ** 2 / 3 + 5 * N ** 3 / 16 + 41 * N ** 4 / 180,
  13 * N ** 2 / 48 - 3 * N ** 3 / 5 + 557 * N ** 4 / 1440,
  61 * N ** 3 / 240 - 103 * N ** 4 / 140,
  49561 * N ** 4 / 161280,
];
const BETA = [
  N / 2 - 2 * N ** 2 / 3 + 37 * N ** 3 / 96 - N ** 4 / 360,
  N ** 2 / 48 + N ** 3 / 15 - 437 * N ** 4 / 1440,
  17 * N ** 3 / 480 - 37 * N ** 4 / 840,
  4397 * N ** 4 / 161280,
];

const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;

/** lon/lat (grader) -> {e, n} i EPSG:25832 (meter). */
export function toUTM32(lon, lat) {
  const phi = rad(lat), lam = rad(lon) - LON0;
  const t = Math.sinh(Math.atanh(Math.sin(phi)) - E * Math.atanh(E * Math.sin(phi)));
  const xi = Math.atan2(t, Math.cos(lam));
  const eta = Math.atanh(Math.sin(lam) / Math.sqrt(1 + t * t));
  let x = xi, y = eta;
  for (let j = 1; j <= 4; j++) {
    x += ALPHA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    y += ALPHA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }
  return { e: E0 + K0 * A_ * y, n: K0 * A_ * x };
}

/** {e, n} i EPSG:25832 -> {lon, lat} (grader). */
export function fromUTM32(e, n) {
  const xi = n / (K0 * A_), eta = (e - E0) / (K0 * A_);
  let x = xi, y = eta;
  for (let j = 1; j <= 4; j++) {
    x -= BETA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    y -= BETA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }
  const chi = Math.asin(Math.sin(x) / Math.cosh(y));
  // konformal bredde -> geodætisk bredde
  let phi = chi;
  for (let i = 0; i < 6; i++) {
    phi = Math.asin(Math.tanh(Math.atanh(Math.sin(chi)) + E * Math.atanh(E * Math.sin(phi))));
  }
  const lam = Math.atan2(Math.sinh(y), Math.cos(x));
  return { lon: deg(LON0 + lam), lat: deg(phi) };
}

export function haversine(a, b) {
  const R = 6371008.8;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Kurs fra a til b i grader (0 = geografisk nord). */
export function bearing(a, b) {
  const p1 = rad(a.lat), p2 = rad(b.lat), dl = rad(b.lon - a.lon);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

export function pathLength(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i]);
  return d;
}

export function fmtDist(m) {
  if (!isFinite(m)) return '–';
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(m < 10000 ? 2 : 1).replace('.', ',')} km`;
}

export function fmtDeg(v, pos, neg) {
  const h = v >= 0 ? pos : neg; v = Math.abs(v);
  const d = Math.floor(v), mFull = (v - d) * 60, m = Math.floor(mFull), s = (mFull - m) * 60;
  return `${d}°${String(m).padStart(2, '0')}′${s.toFixed(1).padStart(4, '0').replace('.', ',')}″ ${h}`;
}

/** Koordinattekster til visning: decimal, grader/min/sek og UTM32. */
export function coordTexts(lon, lat) {
  const u = toUTM32(lon, lat);
  return {
    dec: `${lat.toFixed(5).replace('.', ',')}° N, ${lon.toFixed(5).replace('.', ',')}° Ø`,
    dms: `${fmtDeg(lat, 'N', 'S')}  ${fmtDeg(lon, 'Ø', 'V')}`,
    utm: `32U  Ø ${Math.round(u.e)}  N ${Math.round(u.n)}`,
    utmRaw: u,
  };
}

/** Naismiths regel (tommelfingerregel): 5 km/t + 1 min pr. 10 m stigning. Returnerer minutter. */
export function naismith(distM, ascentM) {
  return distM / 1000 / 5 * 60 + ascentM / 10;
}

export function fmtMinutes(min) {
  if (!isFinite(min)) return '–';
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? `${h} t ${m} min` : `${m} min`;
}

// ---- GPX (åbent format) -------------------------------------------------
const esc = (s) => String(s ?? '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));

export function toGPX(waypoints, name = 'Survivalkit waypoints') {
  const wpts = waypoints.map((w) =>
    `  <wpt lat="${w.lat.toFixed(6)}" lon="${w.lon.toFixed(6)}">` +
    (w.ele != null ? `<ele>${Number(w.ele).toFixed(1)}</ele>` : '') +
    (w.time ? `<time>${new Date(w.time).toISOString()}</time>` : '') +
    `<name>${esc(w.name)}</name>` + (w.note ? `<desc>${esc(w.note)}</desc>` : '') + '</wpt>').join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Survivalkit" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${esc(name)}</name></metadata>\n${wpts}\n</gpx>\n`;
}

export function fromGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Filen er ikke gyldig GPX/XML.');
  const out = [];
  for (const el of doc.getElementsByTagName('wpt')) {
    const lat = parseFloat(el.getAttribute('lat')), lon = parseFloat(el.getAttribute('lon'));
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const get = (t) => el.getElementsByTagName(t)[0]?.textContent ?? '';
    const ele = parseFloat(get('ele'));
    const tm = Date.parse(get('time'));
    out.push({ lat, lon, name: get('name') || 'Waypoint', note: get('desc'), ele: isFinite(ele) ? ele : null, time: isFinite(tm) ? tm : Date.now() });
  }
  return out;
}

// ---- Højde fra DEM-fliser (Terrarium-kodning) ------------------------------------
export function lonLatToTilePx(lon, lat, z) {
  const n = 2 ** z;
  const x = (lon + 180) / 360 * n;
  const y = (1 - Math.asinh(Math.tan(rad(lat))) / Math.PI) / 2 * n;
  return { tx: Math.floor(x), ty: Math.floor(y), px: (x - Math.floor(x)) * 256, py: (y - Math.floor(y)) * 256 };
}

export function terrarium(r, g, b) { return r * 256 + g + b / 256 - 32768; }
