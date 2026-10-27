#!/usr/bin/env node
// Bygger indhold og service worker:
//   content/*.mjs  ->  app/data/content.json  (+ inline SVG-figurer, validering)
//   tools/sw.template.js -> app/sw.js         (versioneret forhåndscache af alle app-filer undtagen kortpakker)
// Brug: node tools/build.mjs
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APP = join(ROOT, 'app'), CONTENT = join(ROOT, 'content');
const problems = [];
const err = (m) => problems.push(m);

// ---- indhold -----------------------------------------------------------------------------------------------------------------
const mods = {};
for (const f of readdirSync(CONTENT).filter((n) => n.endsWith('.mjs') && !n.startsWith('_')).sort()) {
  mods[f] = await import(pathToFileURL(join(CONTENT, f)).href);
}
const chapters = [], guides = [], species = [], lists = [], sources = [];
let nodmenu = [], temaer = [];
const figs = {};
for (const [f, m] of Object.entries(mods)) {
  if (m.chapters) chapters.push(...m.chapters);
  if (m.guides) guides.push(...m.guides);
  if (m.species) species.push(...m.species);
  if (m.lists) lists.push(...m.lists);
  if (m.sources) sources.push(...m.sources);
  if (m.nodmenu) nodmenu = m.nodmenu;
  if (m.temaer) temaer = m.temaer;
}
chapters.sort((a, b) => a.nr - b.nr);

const figDir = join(CONTENT, 'fig');
for (const f of readdirSync(figDir).filter((n) => n.endsWith('.svg'))) {
  const id = f.replace(/\.svg$/, '');
  let svg = readFileSync(join(figDir, f), 'utf8').trim();
  const cap = (svg.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  svg = svg.replace(/<\?xml[^>]*\?>/, '');
  if (!/viewBox=/.test(svg)) err(`figur ${id}: mangler viewBox`);
  figs[id] = { svg, caption: cap };
}
// dynamisk genererede figurer (fx knob) leveres af moduler via export const figures = { id: {svg, caption} }
for (const m of Object.values(mods)) if (m.figures) for (const [id, v] of Object.entries(m.figures)) figs[id] = v;

// ---- validering ------------------------------------------------------------------------------------------------------------
const ids = new Set();
const dupe = (id, what) => { if (ids.has(id)) err(`dublet-id: ${id} (${what})`); ids.add(id); };
const chapIds = new Set(chapters.map((c) => c.id)); chapters.forEach((c) => dupe(c.id, 'kapitel'));
const srcIds = new Set(sources.map((s) => s.id));
const STD = ['Formål', 'Hvornår', 'Udstyr', 'Fremgangsmåde', 'Sådan kontrollerer du resultatet', 'Typiske fejl', 'Sikkerhed', 'Danske forhold', 'Alternativ løsning'];
const blockCount = (bl) => (bl || []).reduce((n, b) => n + 1 + (b.blokke ? blockCount(b.blokke) : 0), 0);
function checkBlocks(where, bl) {
  for (const b of bl || []) {
    if (b.t === 'fig' && !figs[b.id]) err(`${where}: ukendt figur ${b.id}`);
    if (b.t === 'figs') for (const i of b.ids) if (!figs[i]) err(`${where}: ukendt figur ${i}`);
    if (b.blokke) checkBlocks(where, b.blokke);
  }
}
for (const g of guides) {
  dupe(g.id, 'guide');
  if (!chapIds.has(g.kap)) err(`guide ${g.id}: ukendt kapitel ${g.kap}`);
  if (!g.titel || !g.blokke?.length) err(`guide ${g.id}: mangler titel/indhold`);
  if (g.blokke && blockCount(g.blokke) < (g.type === 'praktisk' ? 10 : 2)) err(`guide ${g.id}: for tyndt indhold`);
  for (const s of g.kilder || []) if (!srcIds.has(s)) err(`guide ${g.id}: ukendt kilde ${s}`);
  if (!g.kontrol || !['kontrolleret', 'delvist', 'ikke'].includes(g.kontrol.status)) err(`guide ${g.id}: mangler kontrolstatus`);
  if (g.kontrol?.status === 'kontrolleret' && !(g.kilder || []).length) err(`guide ${g.id}: "kontrolleret" kræver mindst én kilde`);
  if (g.type === 'praktisk') {
    const heads = g.blokke.filter((b) => b.t === 'sec').map((b) => b.x);
    for (const s of STD) if (!heads.includes(s)) err(`guide ${g.id}: mangler standardafsnit "${s}"`);
  }
  checkBlocks('guide ' + g.id, g.blokke);
}
for (const s of species) {
  dupe(s.id, 'art');
  for (const k of ['dansk', 'latin', 'familie', 'kategori', 'kontrol', 'kilder']) if (!s[k]) err(`art ${s.id}: mangler ${k}`);
  if (s.kategori !== 'giftig' && s.kategori !== 'ikke') for (const k of ['saeson', 'voksested', 'kendetegn', 'dele', 'tilberedning', 'sikkerhed', 'lov', 'forvekslinger']) if (!s[k] || (Array.isArray(s[k]) && !s[k].length)) err(`art ${s.id}: mangler ${k}`);
  for (const x of s.kilder || []) if (!srcIds.has(x)) err(`art ${s.id}: ukendt kilde ${x}`);
}
for (const l of lists) dupe(l.id, 'liste');
// temaer: hvert (ikke-skjult) kapitel i præcis ét tema
const inTema = new Map();
for (const t of temaer) {
  if (!t.id || !t.titel || !t.kapitler?.length) err(`tema ${t.id}: mangler id/titel/kapitler`);
  for (const k of t.kapitler || []) { if (!chapIds.has(k)) err(`tema ${t.id}: ukendt kapitel ${k}`); if (inTema.has(k)) err(`kapitel ${k} ligger i både ${inTema.get(k)} og ${t.id}`); inTema.set(k, t.id); }
}
if (!temaer.length) err('ingen temaer defineret');
for (const c of chapters) if (!c.skjul && !inTema.has(c.id)) err(`kapitel ${c.id}: ligger ikke i noget tema`);
for (const n of nodmenu) if (!guides.find((g) => g.id === n.guide)) err(`nødmenu: ukendt guide ${n.guide}`);
// interne links [[id]]
const known = new Set([...ids, 'kort', 'arter', 'kilder', 'nod']);
const scan = (txt, where) => { for (const m of String(txt).matchAll(/\[\[([^\]|]+)/g)) if (!known.has(m[1].trim())) err(`${where}: brudt link [[${m[1]}]]`); };
const walk = (o, where) => { if (typeof o === 'string') scan(o, where); else if (Array.isArray(o)) o.forEach((x) => walk(x, where)); else if (o && typeof o === 'object') Object.values(o).forEach((x) => walk(x, where)); };
guides.forEach((g) => walk(g, 'guide ' + g.id)); species.forEach((s) => walk(s, 'art ' + s.id)); lists.forEach((l) => walk(l, 'liste ' + l.id)); chapters.forEach((c) => walk(c, 'kap ' + c.id));

if (problems.length) { console.error('BYGGEFEJL:\n - ' + problems.join('\n - ')); process.exit(1); }

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const stats = {
  guides: guides.length, praktiske: guides.filter((g) => g.type === 'praktisk').length, arter: species.length, lister: lists.length, kilder: sources.length, figurer: Object.keys(figs).length,
  kontrolleret: guides.filter((g) => g.kontrol.status === 'kontrolleret').length, delvist: guides.filter((g) => g.kontrol.status === 'delvist').length, ikke: guides.filter((g) => g.kontrol.status === 'ikke').length,
  artKontrolleret: species.filter((s) => s.kontrol.status === 'kontrolleret').length, artDelvist: species.filter((s) => s.kontrol.status === 'delvist').length, artIkke: species.filter((s) => s.kontrol.status === 'ikke').length,
};
mkdirSync(join(APP, 'data'), { recursive: true });
const build = { version: pkg.version, date: new Date().toISOString().slice(0, 10), stats };
writeFileSync(join(APP, 'data', 'content.json'), JSON.stringify({ build, chapters, guides, species, lists, sources, figs, nodmenu, temaer }));
console.log('indhold:', JSON.stringify(stats));

// ---- service worker --------------------------------------------------------------------------------------------------------------
function listFiles(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}
const files = listFiles(APP).map((p) => relative(APP, p).split(sep).join('/'))
  .filter((p) => p !== 'sw.js' && !p.startsWith('map/pack/') && !p.startsWith('vendor/mediapipe/') && !p.startsWith('_') && !p.endsWith('.map') && !p.endsWith('.DS_Store'))
  .sort();
const hash = createHash('sha256');
for (const f of files) { hash.update(f); hash.update(readFileSync(join(APP, f))); }
const version = pkg.version + '-' + hash.digest('hex').slice(0, 10);
const precache = ['./', ...files.map((f) => encodeURI(f))];
const sw = readFileSync(join(ROOT, 'tools', 'sw.template.js'), 'utf8').replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(precache, null, 1));
writeFileSync(join(APP, 'sw.js'), sw);
let total = 0; for (const f of files) total += statSync(join(APP, f)).size;
console.log(`sw.js: version ${version}, ${precache.length} filer, ${(total / 1048576).toFixed(2)} MB forhåndscachet`);
