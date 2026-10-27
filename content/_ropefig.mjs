// Lille tegnesystem til skematiske rebtegninger (egne tegninger, ingen tredjepartsbilleder).
// Et reb er en glat kurve gennem punkter. Over/under ved kryds afgøres af regler (eller z-værdier for 3D-kurver):
// efter at alle reb er tegnet, tegnes en lokal "plaster" af det øverste reb med en baggrundsfarvet kant, så krydset ser rigtigt ud.
const STEP = 6;                 // sample-afstand (px)
const SURF = 'var(--surface,#fff)';
export const COL = { a: '#c9572b', b: '#2b6cb0', post: '#9aa0a6', ink: 'currentColor' };

function catmull(pts, closed = false) {
  const out = [];
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const p0 = P[i], p1 = P[i + 1], p2 = P[i + 2], p3 = P[i + 3];
    const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.max(2, Math.ceil(d / STEP));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d2) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d2) * t2 + (-a + 3 * b - 3 * c + d2) * t3);
      const z = (p1[2] != null && p2[2] != null) ? p1[2] + (p2[2] - p1[2]) * t : null;
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), z]);
    }
  }
  if (!closed) { const l = pts[pts.length - 1]; out.push([l[0], l[1], l[2] ?? null]); }
  return out;
}
const d = (pl) => 'M' + pl.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
const arcLen = (pl) => { const a = [0]; for (let i = 1; i < pl.length; i++) a.push(a[i - 1] + Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1])); return a; };

function segInt(a, b, c, e) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [e[0] - c[0], e[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  return (t >= 0 && t < 1 && u >= 0 && u < 1) ? { t, u } : null;
}

/** strands: [{id,col,pts,sw,arrow,dash,z?}] ; rules: [{at:[x,y], top:'id'|'later'|'earlier'}] ; extras: markup strings */
export function drawing({ w, h, strands, rules = [], extras = [], dbg = false }) {
  const S = strands.map((s) => ({ ...s, sw: s.sw || 7, pl: catmull(s.pts, s.closed) }));
  S.forEach((s) => { s.al = arcLen(s.pl); });
  // find crossings
  const X = [];
  for (let i = 0; i < S.length; i++) for (let j = i; j < S.length; j++) {
    const A = S[i], B = S[j];
    for (let ia = 0; ia < A.pl.length - 1; ia++) for (let ib = (i === j ? ia + 2 : 0); ib < B.pl.length - 1; ib++) {
      if (A.dash || B.dash) continue;
      const r = segInt(A.pl[ia], A.pl[ia + 1], B.pl[ib], B.pl[ib + 1]); if (!r) continue;
      const p = [A.pl[ia][0] + (A.pl[ia + 1][0] - A.pl[ia][0]) * r.t, A.pl[ia][1] + (A.pl[ia + 1][1] - A.pl[ia][1]) * r.t];
      const sa = A.al[ia] + (A.al[ia + 1] - A.al[ia]) * r.t, sb = B.al[ib] + (B.al[ib + 1] - B.al[ib]) * r.u;
      if (i === j && Math.abs(sa - sb) < 24) continue;
      const za = A.pl[ia][2] != null ? A.pl[ia][2] + (A.pl[ia + 1][2] - A.pl[ia][2]) * r.t : null;
      const zb = B.pl[ib][2] != null ? B.pl[ib][2] + (B.pl[ib + 1][2] - B.pl[ib][2]) * r.u : null;
      X.push({ p, A: i, sa, B: j, sb, za, zb });
    }
  }
  const patches = [];
  for (const c of X) {
    let top = null;
    const rule = rules.map((r) => ({ r, dd: Math.hypot(r.at[0] - c.p[0], r.at[1] - c.p[1]) })).filter((x) => x.dd < 14).sort((a, b) => a.dd - b.dd)[0]?.r;
    if (rule) {
      if (rule.top === 'later' || rule.top === 'earlier') {
        const aLater = (c.A > c.B) || (c.A === c.B && c.sa > c.sb) || (c.A !== c.B && c.A > c.B);
        const pickA = (rule.top === 'later') === aLater; top = pickA ? 'A' : 'B';
      } else top = S[c.A].id === rule.top ? 'A' : S[c.B].id === rule.top ? 'B' : null;
    }
    if (!top && c.za != null && c.zb != null) top = c.za >= c.zb ? 'A' : 'B';
    if (!top) top = (c.A > c.B || (c.A === c.B && c.sa > c.sb)) ? 'A' : 'B';
    patches.push({ si: top === 'A' ? c.A : c.B, s: top === 'A' ? c.sa : c.sb, p: c.p });
  }
  const rope = (pl, s, extraHalo) => {
    const dash = s.dash ? ` stroke-dasharray="${s.dash}"` : '';
    return (extraHalo ? `<path d="${d(pl)}" fill="none" style="stroke:${SURF}" stroke-width="${s.sw + 6}" stroke-linecap="butt" stroke-linejoin="round"/>` : '') +
      `<path d="${d(pl)}" fill="none" stroke="#1d1d1d" stroke-opacity=".55" stroke-width="${s.sw + 2}" stroke-linecap="round" stroke-linejoin="round"${dash}/>` +
      `<path d="${d(pl)}" fill="none" stroke="${s.col}" stroke-width="${s.sw}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`;
  };
  let svg = '';
  for (const s of S) {
    svg += rope(s.pl, s, false);
  }
  for (const pt of patches) {
    const s = S[pt.si], win = 13;
    const idx = [];
    for (let k = 0; k < s.pl.length; k++) if (Math.abs(s.al[k] - pt.s) <= win) idx.push(k);
    if (idx.length > 1) { const sub = s.pl.slice(idx[0], idx[idx.length - 1] + 1); svg += rope(sub, s, true); }
  }
  for (const s of S) if (s.arrow) {
    const pl = s.pl, e = pl[pl.length - 1]; let k = pl.length - 2; while (k > 0 && Math.hypot(pl[k][0] - e[0], pl[k][1] - e[1]) < 9) k--;
    const a = Math.atan2(e[1] - pl[k][1], e[0] - pl[k][0]), L = 12, W2 = 6;
    const p1 = [e[0] + Math.cos(a) * 3, e[1] + Math.sin(a) * 3], p2 = [p1[0] - L * Math.cos(a) + W2 * Math.sin(a), p1[1] - L * Math.sin(a) - W2 * Math.cos(a)], p3 = [p1[0] - L * Math.cos(a) - W2 * Math.sin(a), p1[1] - L * Math.sin(a) + W2 * Math.cos(a)];
    svg += `<polygon points="${p1.map((v) => v.toFixed(1))} ${p2.map((v) => v.toFixed(1))} ${p3.map((v) => v.toFixed(1))}" fill="currentColor"/>`;
  }
  if (dbg) for (const c of X) svg += `<circle cx="${c.p[0].toFixed(1)}" cy="${c.p[1].toFixed(1)}" r="3" fill="none" stroke="red"/><text x="${(c.p[0] + 4).toFixed(0)}" y="${(c.p[1] - 4).toFixed(0)}" font-size="7" fill="red">${c.p.map((v) => Math.round(v))}</text>`;
  return { svg: svg + extras.join(''), w, h, crossings: X.length };
}

export const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${o.s || 11}" ${o.b ? 'font-weight="700"' : ''} ${o.a ? `text-anchor="${o.a}"` : ''} fill="currentColor" font-family="system-ui,sans-serif">${t}</text>`;
export const NUM = (x, y, n) => `<circle cx="${x}" cy="${y}" r="9" fill="currentColor"/><text x="${x}" y="${y + 4}" font-size="12" font-weight="700" text-anchor="middle" style="fill:var(--surface,#fff)" font-family="system-ui,sans-serif">${n}</text>`;
export const POST = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#8d7757" stroke="#1d1d1d" stroke-opacity=".5"/><path d="M${x + w * 0.3} ${y + 4}V${y + h - 4}M${x + w * 0.65} ${y + 6}V${y + h - 8}" stroke="#1d1d1d" stroke-opacity=".25" fill="none"/>`;

/** Samler flere paneler (hver {title, d}) i ét SVG i et gitter. */
export function sheet(title, panels, cols = 2, pw = 200, ph = 150) {
  const cap = 24, gap = 10, rows = Math.ceil(panels.length / cols);
  const W = cols * pw + (cols - 1) * gap, H = rows * (ph + cap) + (rows - 1) * gap;
  let body = '';
  panels.forEach((p, i) => {
    const cx = (i % cols) * (pw + gap), cy = Math.floor(i / cols) * (ph + cap + gap);
    body += `<g transform="translate(${cx} ${cy})"><rect width="${pw}" height="${ph + cap}" rx="8" fill="none" stroke="currentColor" stroke-opacity=".25"/>` +
      `<svg x="0" y="0" width="${pw}" height="${ph}" viewBox="0 0 ${p.d.w} ${p.d.h}">${p.d.svg}</svg>` +
      `<text x="8" y="${ph + 16}" font-size="11" font-weight="600" fill="currentColor" font-family="system-ui,sans-serif">${p.title}</text></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><title>${title}</title>${body}</svg>`;
}
export function single(title, d, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.w} ${d.h}"><title>${title}</title>${d.svg}${extra}</svg>`;
}
export { catmull };
