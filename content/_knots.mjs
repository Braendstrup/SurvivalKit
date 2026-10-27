// Skematiske knobtegninger. Genereres programmatisk (se _ropefig.mjs). Alle er EGNE tegninger.
import { drawing, sheet, single, T, NUM, POST, COL, catmull } from './_ropefig.mjs';

const A = COL.a, B = COL.b;
const W = 200, H = 150;
const D = (strands, rules = [], extras = [], dbg = false) => drawing({ w: W, h: H, strands, rules, extras, dbg });

// ---------------------------------------------------------------------------------------------------------------
// Pælestik (bowline). Geometrien følger den almindelige "kanin"-metode: hul i den faste part, tampen op gennem hullet
// nedefra, bag om den faste part, og ned gennem hullet igen.
function bowline(stage, dbg) {
  const S = [[96, 4], [90, 36], [86, 66], [86, 84], [94, 98], [114, 101], [134, 94], [139, 80], [130, 68], [112, 64], [92, 66], [78, 76], [72, 98], [68, 124], [78, 142], [100, 146]];
  const Tp = [[100, 146], [124, 140], [128, 118], [124, 98], [120, 78], [118, 56], [112, 36], [96, 26], [80, 28], [71, 38], [70, 50], [82, 58], [98, 66], [108, 80], [110, 98], [111, 114], [112, 128]];
  const cut = { 1: 4, 2: 8, 3: 11, 4: Tp.length }[stage];
  const t1 = stage === 1 ? [[100, 146], [124, 140], [130, 118], [140, 100], [148, 78], [150, 60]] : Tp.slice(0, cut);
  const strands = [{ id: 's', col: A, pts: S }, { id: 't', col: B, pts: t1, arrow: stage < 4 }];
  const rules = [
    { at: [118, 100], top: 's' },        // tampen går UNDER hullets nederste del
    { at: [86, 33], top: 's' },          // tampen går BAG den faste part
    { at: [111, 99], top: 's' },         // ned gennem hullet: under nederste del
  ];
  return D(strands, rules, [], dbg);
}
export function bowlineFigs(dbg = false) {
  const cap = ['1  Lav et hul (løkke) i den faste part', '2  Tampen op gennem hullet nedefra', '3  Bag om den faste part', '4  Ned i hullet igen – stram'];
  const panels = [1, 2, 3, 4].map((s) => ({ title: cap[s - 1], d: bowline(s, dbg) }));
  const fin = bowline(4, dbg);
  const lab = [T(150, 20, 'fast part', { s: 10 }), T(8, 136, 'øje', { s: 10, b: true }), T(138, 130, 'tamp', { s: 10 })].join('');
  return {
    'knob-paelestik-trin': { svg: sheet('Pælestik – fire trin (skematisk)', panels), caption: 'Pælestik i fire trin (skematisk tegning – øv med rigtigt reb ved siden af).' },
    'knob-paelestik': { svg: single('Færdigt pælestik (skematisk)', { ...fin, svg: fin.svg + lab }), caption: 'Færdigt pælestik: øjet i bunden, tampen inde i øjet, parallelt med øjets side (skematisk).' },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Råbåndsknob: to sammenlåste bugter; hver ende ligger på samme side som sin egen faste part (ellers er det en grandmother).
function reefFinal(dbg) {
  const a = [[8, 46], [112, 46], [148, 68], [112, 90], [8, 90]];
  const b = [[252, 74], [138, 74], [104, 94], [138, 114], [252, 114]];
  return drawing({ w: 260, h: 150, strands: [{ id: 'a', col: A, pts: a }, { id: 'b', col: B, pts: b }], rules: [{ at: [108, 90], top: 'a' }, { at: [146, 74], top: 'b' }], extras: [T(8, 36, 'venstre ende + fast part', { s: 9 }), T(252, 134, 'højre ende + fast part', { s: 9, a: 'end' })], dbg });
}
export function reefFigs(dbg = false) {
  const p1 = D([{ id: 'a', col: A, pts: [[10, 100], [80, 90], [130, 72], [150, 62]] }, { id: 'b', col: B, pts: [[190, 100], [120, 90], [70, 70], [48, 58]] }], [{ at: [100, 80], top: 'b' }], [T(10, 118, 'venstre', { s: 10 }), T(190, 118, 'højre', { s: 10, a: 'end' })], dbg);
  const half = D([{ id: 'b', col: B, pts: [[192, 62], [100, 62], [76, 84], [100, 108], [192, 108]] }, { id: 'a', col: A, pts: [[8, 85], [60, 85], [100, 85], [150, 85]], arrow: true }], [{ at: [77, 85], top: 'a' }], [], dbg);
  const p3 = D([{ id: 'a', col: A, pts: [[8, 46], [98, 46], [128, 66], [98, 86], [8, 86]] }, { id: 'b', col: B, pts: [[192, 72], [112, 72], [86, 92], [112, 112], [192, 112]] }], [{ at: [90, 86], top: 'a' }, { at: [126, 72], top: 'b' }], [], dbg);
  const panels = [
    { title: '1  Højre ende over venstre', d: p1 },
    { title: '2  Rund om og op = halvt knob', d: half },
    { title: '3  Nu venstre over højre – igen rund', d: p3 },
  ];
  const fin = reefFinal(dbg);
  return {
    'knob-raabaand-trin': { svg: sheet('Råbåndsknob – trin (skematisk)', panels, 3, 200, 150), caption: 'Råbåndsknob: to halve knob efter hinanden, første højre-over-venstre, derefter venstre-over-højre (skematisk).' },
    'knob-raabaand': { svg: single('Færdigt råbåndsknob (skematisk)', fin), caption: 'Færdigt råbåndsknob: to sammenlåste bugter. Hver ende ligger på samme side som sin egen faste part.' },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Ottetalsknob (figure-eight): rigtig matematisk figur-otte-knude (4_1) med 4 kryds, åbnet til et reb med to ender.
function eightPts() {
  const pts = []; const N = 120, t0 = 0.55, span = 2 * Math.PI - 0.34;
  for (let i = 0; i <= N; i++) {
    const t = t0 + span * i / N;
    const r = 2 + Math.cos(2 * t);
    pts.push([100 + 30 * r * Math.cos(3 * t), 76 + 21 * r * Math.sin(3 * t), 40 * Math.sin(4 * t)]);
  }
  return pts;
}
export function eightFigs(dbg = false) {
  const pts = eightPts();
  const first = pts.slice(0, 61), second = pts.slice(60);
  // forlæng enderne lidt
  const ext = (p, q) => [p[0] + (p[0] - q[0]) * 1.2, p[1] + (p[1] - q[1]) * 1.2, p[2]];
  const s1 = [ext(pts[0], pts[3]), ...first], s2 = [...second, ext(pts[pts.length - 1], pts[pts.length - 4])];
  const full = drawing({ w: W, h: H, strands: [{ id: 'a', col: A, pts: s1, z: true }, { id: 'b', col: B, pts: s2, z: true }], extras: [T(6, 14, 'fast part', { s: 10 }), T(194, 144, 'tamp', { s: 10, a: 'end' })], dbg });
  const part = (n, label) => drawing({ w: W, h: H, strands: [{ id: 'a', col: A, pts: s1 }, { id: 'b', col: B, pts: s2.slice(0, n), arrow: true }], dbg });
  const m = s2.length;
  const panels = [
    { title: '1  Lav en bugt (løkke) – tampen over', d: D([{ id: 'a', col: A, pts: [[40, 4], [60, 40], [100, 70], [130, 60], [126, 36], [96, 38], [80, 70], [70, 110], [90, 140]] }, { id: 'b', col: B, pts: [[90, 140], [110, 128], [118, 100]], arrow: true }], [{ at: [90, 52], top: 'b' }], [], dbg) },
    { title: '2  Tampen rundt bag den faste part', d: part(Math.floor(m * 0.5)) },
    { title: '3  Tampen ned gennem løkken', d: part(Math.floor(m * 0.8)) },
    { title: '4  Færdigt ottetal – stram', d: full },
  ];
  return {
    'knob-ottetal-trin': { svg: sheet('Ottetalsknob – trin (skematisk)', panels), caption: 'Ottetalsknob: rebets vej gennem knobet, trin for trin (skematisk).' },
    'knob-ottetal': { svg: single('Færdigt ottetalsknob', full), caption: 'Færdigt ottetalsknob: fire kryds, der skifter over/under langs rebet (alternerende). Stopperknob i enden af et reb.' },
  };
}


// ---------------------------------------------------------------------------------------------------------------
// Flagknob (skødestik): tykt reb A danner en bugt; tyndt reb B op gennem bugten, bag om begge ben og under sig selv.
export function flagFigs(dbg = false) {
  const a = [[8, 50], [110, 50], [145, 75], [110, 100], [8, 100]];
  const bFull = [[192, 126], [130, 120], [96, 108], [80, 76], [80, 36], [100, 24], [140, 24], [168, 56], [166, 96], [150, 126], [138, 142]];
  const rules = [{ at: [92, 100], top: 'a' }, { at: [80, 50], top: 'b' }, { at: [156, 123], top: 'b0' }];
  const mk = (n, arrow) => D([{ id: 'a', col: A, pts: a, sw: 10 }, { id: 'b0', col: B, pts: bFull.slice(0, 3), sw: 5 }, { id: 'b', col: B, pts: bFull.slice(2, n), sw: 5, arrow }], rules, [], dbg);
  const panels = [
    { title: '1  Tykt reb: lav en bugt', d: D([{ id: 'a', col: A, pts: a, sw: 10 }, { id: 'b', col: B, pts: bFull.slice(0, 2), sw: 5, arrow: true }], [], [], dbg) },
    { title: '2  Tyndt reb op gennem bugten', d: mk(5, true) },
    { title: '3  Bag om begge ben af bugten', d: mk(8, true) },
    { title: '4  Ind under sig selv – stram', d: mk(11, false) },
  ];
  const fin = mk(11, false);
  return {
    'knob-flagknob-trin': { svg: sheet('Flagknob – trin (skematisk)', panels), caption: 'Flagknob (skødestik) i fire trin. Skematisk tegning: tykt reb orange, tyndt reb blåt.' },
    'knob-flagknob': { svg: single('Færdigt flagknob (skematisk)', { ...fin, svg: fin.svg + T(8, 40, 'tykt reb (bugt)', { s: 10 }) + T(192, 142, 'tyndt reb', { s: 10, a: 'end' }) }), caption: 'Flagknob: det tynde reb går op gennem bugten, rundt om begge ben og ind under sig selv. Begge frie ender bør ligge på samme side.' },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Kædestik: rækken af sammenlåste løkker (kan trækkes ud ved at hive i enden).
export function chainFigs(dbg = false) {
  const loop = (cx, id) => ({ id, col: A, closed: true, pts: [[cx - 28, 75], [cx - 18, 58], [cx, 54], [cx + 18, 58], [cx + 28, 75], [cx + 18, 92], [cx, 96], [cx - 18, 92]], sw: 6 });
  const mk = (n) => { const st = [], rules = []; for (let i = 0; i < n; i++) { st.push(loop(40 + i * 36, 'l' + i)); rules.push({ at: [40 + i * 36 - 14, 60], top: 'later' }, { at: [40 + i * 36 - 14, 90], top: 'earlier' }); } return D(st, rules, [], dbg); };
  const panels = [
    { title: '1  Lav en bugt og læg den som en løkke', d: mk(1) }, { title: '2  Træk en ny bugt gennem løkken', d: mk(2) },
    { title: '3  Gentag – hver løkke låser den forrige', d: mk(4) }, { title: '4  Enden gennem sidste løkke låser rækken', d: mk(5) },
  ];
  return {
    'knob-kaedestik-trin': { svg: sheet('Kædestik – trin (skematisk)', panels), caption: 'Kædestik: en række sammenlåste løkker. Slip enden og hiv i den for at løse rækken.' },
    'knob-kaedestik': { svg: single('Kædestik (skematisk)', { ...mk(5), w: 200, h: 150 }), caption: 'Kædestik (daisy chain): en kort kæde af løkker til midlertidig opbevaring af reb.' },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Hitches om pæl / stamme: skematiske sekvenser (pile og nummererede omgange). De viser rækkefølge og retning,
// ikke alle kryds i detaljen – følg teksten og øv med rigtigt reb.
function postPanel(kind, step, dbg) {
  const post = POST(86, 8, 30, 134);
  const ex = [post];
  const mkLine = (pts, o = {}) => ({ id: o.id || 'r', col: o.col || A, pts, sw: 6, ...o });
  if (kind === 'halv') {
    const base = [mkLine([[8, 30], [60, 36], [84, 40]], { id: 's' })];
    const f1 = mkLine([[84, 40], [100, 46], [118, 54]], { id: 'f1' });
    const back = mkLine([[118, 54], [128, 66], [100, 76], [78, 78]], { id: 'bk', dash: '4 4' });
    const f2 = mkLine([[78, 78], [100, 88], [118, 98]], { id: 'f2', col: B });
    const tail = mkLine([[118, 98], [134, 106], [160, 118]], { id: 't', col: B, arrow: step === 4 });
    if (step === 1) return D([...base, f1, mkLine([[118, 54], [132, 62], [140, 70]], { id: 'x', arrow: true })], [], ex.concat([NUM(150, 40, 1)]), dbg);
    if (step === 2) return D([...base, f1, back, mkLine([[78, 78], [90, 84]], { id: 'x2', arrow: true, col: B })], [], ex.concat([NUM(150, 40, 2), T(130, 82, 'bag pælen', { s: 9 })]), dbg);
    if (step === 3) return D([...base, f1, back, f2, mkLine([[118, 98], [128, 104]], { id: 'x3', arrow: true, col: B })], [{ at: [100, 88], top: 'f2' }], ex.concat([NUM(150, 40, 3), T(124, 126, 'kryds over 1. omgang', { s: 9 })]), dbg);
    return D([...base, f1, back, f2, tail], [], ex.concat([NUM(150, 40, 4), T(8, 20, 'fast part', { s: 9 }), T(192, 140, 'tamp', { s: 9, a: 'end' })]), dbg);
  }
  return null;
}
export function postFigs(dbg = false) {
  const clove = [1, 2, 3, 4].map((s) => ({ title: ['1  Én omgang om pælen', '2  Bagom og rundt igen', '3  Anden omgang krydser den første', '4  Tampen ind under anden omgang'][s - 1], d: postPanel('halv', s, dbg) }));
  const fin = postPanel('halv', 4, dbg);
  const out = {
    'knob-halvstik-trin': { svg: sheet('Dobbelt halvstik – trin (skitse)', clove), caption: 'Dobbelt halvstik om en pæl, trin for trin (skitse – viser rækkefølge og retning). Tjek resultatet med kontrollen i teksten.' },
    'knob-halvstik': { svg: single('Dobbelt halvstik (skitse)', fin), caption: 'Skitse af dobbelt halvstik: to omgange om pælen, tampen under den sidste omgang.' },
  };
  // fast genstand + egen part
  const stem = POST(86, 8, 30, 134);
  const own = (n) => D([{ id: 's', col: A, pts: [[8, 70], [70, 74], [84, 80]], sw: 6 }, { id: 'w', col: A, pts: [[84, 80], [112, 70], [128, 84], [112, 98], [84, 90]], sw: 6, dash: n >= 2 ? '' : '' },
    ...(n >= 3 ? [{ id: 'h1', col: B, pts: [[84, 90], [60, 94], [40, 88], [56, 76], [82, 80]], sw: 6 }, { id: 'h2', col: B, pts: [[82, 80], [60, 66], [38, 74]], sw: 6, arrow: true }] : [])], [], [stem], dbg);
  const own2 = ['1  Reb en eller to gange om genstanden', '2  Tampen rundt om egen part (fast part)', '3  Dobbelt halvstik om egen part', '4  Stram – tjek at den holder'].map((t, i) => ({ title: t, d: own(Math.min(i + 1, 3)) }));
  out['knob-halvstik-fast-trin'] = { svg: sheet('Dobbelt halvstik om en fast genstand – trin (skitse)', own2), caption: 'Dobbelt halvstik om egen part: reb om pælen og sikring af enden om den faste part (skitse).' };
  out['knob-halvstik-fast'] = { svg: single('Dobbelt halvstik om fast genstand (skitse)', own(3)), caption: 'Skitse: rebet om genstanden og enden sikret med dobbelt halvstik om egen part.' };
  // tømmerstik
  const log = `<rect x="14" y="52" width="172" height="40" rx="14" fill="#8d7757" stroke="#1d1d1d" stroke-opacity=".5"/>`;
  const tim = (n) => D([{ id: 's', col: A, pts: [[190, 30], [140, 44], [110, 54], [100, 72], [112, 96], [135, 80]], sw: 6 },
    ...(n >= 2 ? [{ id: 't', col: B, pts: [[135, 80], [118, 58], [104, 44], [92, 66], [82, 50], [70, 70], [58, 54], [46, 74]], sw: 5, arrow: true }] : [])], [], [log, ...(n >= 3 ? [T(8, 120, 'mindst 3 snoninger om egen part', { s: 10 })] : [])], dbg);
  const tp = [{ title: '1  Reb om stammen', d: tim(1) }, { title: '2  Tampen om egen part', d: tim(2) }, { title: '3  Snoninger i træk – stram', d: tim(3) }];
  out['knob-toemmerstik-trin'] = { svg: sheet('Tømmerstik – trin (skitse)', tp, 3, 200, 150), caption: 'Tømmerstik: reb om stammen, tampen om egen part og mindst tre snoninger (skitse). Virker kun med træk.' };
  out['knob-toemmerstik'] = { svg: single('Tømmerstik (skitse)', tim(3)), caption: 'Skitse af tømmerstik: snoningerne ligger langs rebet; knobet låser, når der er træk, og falder af uden.' };
  // bardun (tautline)
  const peg = `<path d="M178 40v86" stroke="#8d7757" stroke-width="9" stroke-linecap="round"/><path d="M8 20h30l8 30H8z" fill="#2b6cb0" fill-opacity=".35" stroke="currentColor" stroke-opacity=".5"/>`;
  const bar = (n) => D([{ id: 's', col: A, pts: [[44, 40], [100, 70], [140, 90], [172, 96]], sw: 6 }, { id: 'l', col: A, pts: [[172, 96], [186, 108], [172, 122], [150, 108]], sw: 6 }, { id: 'e', col: B, pts: [[150, 108], [130, 100], [118, 88], [108, 100], [96, 82], [86, 94]], sw: 5, arrow: n >= 2 }], [], [peg, T(8, 70, 'tarp', { s: 10 }), T(170, 20, 'pløk', { s: 10, a: 'end' }), ...(n >= 3 ? [T(60, 135, 'knobet glider = justér stramning', { s: 10 })] : [])], dbg);
  const bp = [{ title: '1  Løkke om pløk / bagsiden', d: bar(1) }, { title: '2  Tampen om egen part, indad', d: bar(2) }, { title: '3  Skub knobet for at stramme', d: bar(3) }];
  out['knob-bardun-trin'] = { svg: sheet('Bardunbinding – trin (skitse)', bp, 3), caption: 'Bardun med glidende knob (tautline hitch), skitse. To omgange indenfor løkken og én udenfor.' };
  out['knob-bardun'] = { svg: single('Bardun (skitse)', bar(3)), caption: 'Skitse af bardun med glidende knob: knobet kan flyttes for at stramme eller løsne.' };
  return out;
}
export function more(dbg = false) { return { ...flagFigs(dbg), ...chainFigs(dbg) }; }
// postFigs (halvstik, tømmerstik, bardun) er bevidst IKKE med i udgivelsen: skitserne kunne ikke kvalitetssikres og kunne vildlede.
export const figures = { ...bowlineFigs(), ...reefFigs(), ...eightFigs(), ...more() };
export const _debug = { bowlineFigs, reefFigs, eightFigs, more };
