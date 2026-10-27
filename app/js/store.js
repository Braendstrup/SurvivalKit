// Indholdslager og søgeindeks (alt lokalt). Indholdet ligger i data/content.json (bygges af tools/build.mjs)
// og er forhåndscachet af service workeren.
import { norm, setLinkResolver } from './util.js';

export const store = { content: null, byId: new Map(), index: [], loaded: false };

export async function loadContent() {
  if (store.loaded) return store.content;
  const r = await fetch('data/content.json');
  if (!r.ok) throw new Error('Kunne ikke læse indholdet (' + r.status + ')');
  return setContent(await r.json());
}
// Bruges også af enhedstests (Node), der indlæser content.json direkte
export function setContent(c) {
  store.content = c;
  for (const ch of c.chapters) store.byId.set(ch.id, { type: 'kap', item: ch });
  for (const g of c.guides) store.byId.set(g.id, { type: 'g', item: g });
  for (const s of c.species) store.byId.set(s.id, { type: 'a', item: s });
  for (const l of c.lists) store.byId.set(l.id, { type: 'l', item: l });
  for (const s of c.sources) store.byId.set('src:' + s.id, { type: 'src', item: s });
  setLinkResolver((id) => {
    if (id === 'kort') return { href: '#/kort', label: 'Kort over Djursland' };
    if (id === 'arter') return { href: '#/arter', label: 'Artsguide' };
    if (id === 'kilder') return { href: '#/kilder', label: 'Kilder' };
    if (id === 'nod') return { href: '#/nod', label: 'Nødmenu' };
    const e = store.byId.get(id);
    if (!e) return { href: '#/', label: id };
    return { href: routeOf(e.type, id), label: e.item.titel || e.item.dansk || id };
  });
  buildIndex();
  store.loaded = true;
  return c;
}

// ---- søgning ---------------------------------------------------------------------------------------
export const foldText = (s) => norm(s).replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'aa').replace(/[éè]/g, 'e').replace(/ü/g, 'u');
export const tokens = (s) => foldText(s).split(/[^a-z0-9]+/).filter((t) => t.length > 1);

export function blockText(bl, out = []) {
  for (const b of bl || []) {
    if (b.x) out.push(b.x);
    if (b.title) out.push(b.title);
    if (b.items) for (const it of b.items) out.push(typeof it === 'string' ? it : (it.x || ''));
    if (b.rows) for (const r of b.rows) out.push(r.join(' '));
    if (b.blokke) blockText(b.blokke, out);
  }
  return out;
}

function buildIndex() {
  const c = store.content, idx = [];
  const add = (type, id, title, sub, fields) => {
    const map = new Map();
    for (const [text, w] of fields) for (const t of tokens(text)) map.set(t, Math.max(map.get(t) || 0, w));
    idx.push({ type, id, title, sub, tok: map });
  };
  for (const g of c.guides) {
    const kap = c.chapters.find((k) => k.id === g.kap);
    add('g', g.id, g.titel, kap ? kap.titel : '', [[g.titel, 10], [(g.tags || []).join(' '), 7], [g.resume || '', 4], [blockText(g.blokke).join(' '), 1]]);
  }
  for (const s of c.species) {
    add('a', s.id, s.dansk, `${s.latin} – ${s.kategoriLabel || s.kategori}`, [[s.dansk + ' ' + (s.synonymer || []).join(' '), 10], [s.latin + ' ' + s.familie, 8], [(s.voksested || '') + ' ' + (s.kendetegn || ''), 2], [(s.forvekslinger || []).map((f) => f.navn + ' ' + (f.latin || '')).join(' '), 5]]);
  }
  for (const l of c.lists) add('l', l.id, l.titel, 'Tjekliste', [[l.titel, 10], [l.grupper.map((gr) => gr.titel + ' ' + gr.punkter.join(' ')).join(' '), 1]]);
  for (const ch of c.chapters) add('kap', ch.id, ch.titel, 'Kapitel', [[ch.titel, 9], [ch.intro || '', 2]]);
  store.index = idx;
}

export function search(q, limit = 40) {
  const qt = tokens(q);
  if (!qt.length) return [];
  const res = [];
  for (const d of store.index) {
    let score = 0, ok = true;
    for (const t of qt) {
      let best = 0;
      for (const [tok, w] of d.tok) {
        if (tok === t) best = Math.max(best, w * 3);
        else if (tok.startsWith(t)) best = Math.max(best, w * 2);
        else if (t.length > 3 && tok.includes(t)) best = Math.max(best, w);
      }
      if (!best) { ok = false; break; }
      score += best;
    }
    if (ok) res.push({ ...d, score });
  }
  res.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'da'));
  return res.slice(0, limit).map(({ tok, ...r }) => r);
}

export const routeOf = (type, id) => `#/${type === 'l' ? 'lister' : type}/${id}`;
export const hrefFor = routeOf;
