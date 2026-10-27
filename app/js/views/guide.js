// Guides og kapitler: blokrendering, foldbare standardafsnit, søgetræf.
import { h, inline } from '../util.js';
import { store, foldText } from '../store.js';
import { ic, bookmarks, toggleBookmark, setRecent, kontrolBadge, sourcesBody, linkItem, guideRow, fold, notFound, row } from './ui.js';

// ---- tekstblokke ---------------------------------------------------------------------------------------------
const KIND = { info: ['Information', 'info', 'info'], warn: ['Advarsel', 'warn', 'warn'], danger: ['Fare', 'danger', 'alert'], act: ['Handl nu', 'act', 'alert'] };
const LISTS = (items, tag) => h(tag, null, items.map((it) => h('li', null, inline(typeof it === 'string' ? it : it.x))));

export function renderBlocks(blokke) {
  return (blokke || []).map((b) => {
    switch (b.t) {
      case 'p': return h('p', null, inline(b.x));
      case 'h': return h('h' + (b.l || 2), null, b.x);
      case 'sec': return h('h2', null, b.x);
      case 'ul': return LISTS(b.items, 'ul');
      case 'ol': return LISTS(b.items, 'ol');
      case 'steps': return h('ol', { class: 'steps' }, b.items.map((it) => h('li', null, inline(typeof it === 'string' ? it : it.x))));
      case 'callout': {
        const [label, cls, icon] = KIND[b.k || 'info'];
        return h('div', { class: 'callout ' + cls, role: cls === 'act' ? 'alert' : 'note' },
          h('span', { class: 'ctitle' }, ic(icon), b.title || label),
          b.x ? h('p', null, inline(b.x)) : null, b.items ? LISTS(b.items, 'ul') : null);
      }
      case 'call112': return h('a', { class: 'call112', href: 'tel:112' }, ic('phone'), h('span', null, h('b', null, 'Ring 112'), h('small', null, inline(b.x || 'Ved livsfare, bevidstløshed, kraftig blødning eller tvivl: ring først.'))));
      case 'fig': return figure(b.id, b.cap);
      case 'figs': return h('div', { class: 'figgrid' }, b.ids.map((id) => figure(id)));
      case 'table': return h('div', { class: 'tablewrap' }, h('table', null, b.head ? h('thead', null, h('tr', null, b.head.map((c) => h('th', null, inline(c))))) : null,
        h('tbody', null, b.rows.map((r) => h('tr', null, r.map((c) => h('td', null, inline(c))))))));
      case 'kv': return h('dl', { class: 'kvt' }, b.rows.map(([k, v]) => [h('dt', null, k), h('dd', null, inline(v))]));
      case 'details': return fold(b.title, renderBlocks(b.blokke), { open: !!b.open });
      default: return h('p', null, '[ukendt blok: ' + b.t + ']');
    }
  });
}

function figure(id, cap) {
  const f = store.content.figs[id];
  if (!f) return h('p', { class: 'muted' }, '[manglende figur ' + id + ']');
  const box = h('figure', { class: 'figure' });
  const wrap = document.createElement('div'); wrap.innerHTML = f.svg; // SVG fra egen build (betroet indhold)
  const svg = wrap.firstElementChild; svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', cap || f.caption || id);
  box.append(svg, h('figcaption', null, cap || f.caption || ''));
  return box;
}

const EV_LEGEND = () => h('p', { class: 'small' }, inline('Mærker i teksten: {D} understøttet af navngiven kilde. {T} praktisk tommelfingerregel. {F} kræver faglig vurdering – gæt ikke.'));
const NIVEAU = { gr: 'Grundlæggende', mi: 'Mellem', av: 'Avanceret' };

// ---- opdeling i afsnit -----------------------------------------------------------------------------------------
// Praktiske guides har 9 standardafsnit ("sec"); knobguides har h2-afsnit. Handling og sikkerhed er altid åbne.
const ALWAYS_OPEN = /^(Fremgangsmåde|Sikkerhed|Sådan binder du det|Begrænsninger)/;
const isHead = (type) => type === 'praktisk' ? (b) => b.t === 'sec' : type === 'knob' ? (b) => b.t === 'h' && (b.l || 2) === 2 : null;
function split(blokke, test) {
  const pre = [], secs = [];
  for (const b of blokke) {
    if (test(b)) secs.push({ title: b.x, blokke: [] });
    else (secs.length ? secs[secs.length - 1].blokke : pre).push(b);
  }
  return { pre, secs };
}
const hasDanger = (bl) => (bl || []).some((b) => (b.t === 'callout' && (b.k === 'danger' || b.k === 'act')) || b.t === 'call112' || hasDanger(b.blokke));

export function pageGuide(id, q = '') {
  const c = store.content, g = c.guides.find((x) => x.id === id);
  if (!g) return notFound();
  setRecent(g.id);
  const marked = () => bookmarks.list.includes(g.id);
  const bm = h('button', { class: 'iconbtn', 'aria-pressed': String(marked()), 'aria-label': marked() ? 'Fjern fra Gemte' : 'Gem guide', title: 'Gem', onclick: async () => {
    await toggleBookmark(g.id); const on = marked();
    bm.setAttribute('aria-pressed', String(on)); bm.setAttribute('aria-label', on ? 'Fjern fra Gemte' : 'Gem guide'); bm.replaceChildren(ic(on ? 'bookmark' : 'bookmark-o'));
  } }, ic(marked() ? 'bookmark' : 'bookmark-o'));
  const el = h('article', { class: 'guide' });
  el.append(h('div', { class: 'ghead' }, h('h1', null, g.titel), bm),
    g.resume ? h('p', { class: 'lede' }, inline(g.resume)) : null,
    h('div', { class: 'meta' }, kontrolBadge(g.kontrol), g.niveau ? h('span', { class: 'badge neutral' }, NIVEAU[g.niveau] || g.niveau) : null));
  if (g.kontrol?.status === 'ikke') el.append(h('p', { class: 'notice warn' }, ic('info'), h('span', null, 'Ikke fagligt verificeret – bygger på almen viden. ', h('a', { href: '#/kilder' }, 'Hvad betyder det?'))));

  const test = isHead(g.type);
  if (!test) el.append(...renderBlocks(g.blokke));
  else {
    const { pre, secs } = split(g.blokke, test);
    el.append(...renderBlocks(pre));
    for (const s of secs) {
      const body = renderBlocks(s.blokke);
      if (ALWAYS_OPEN.test(s.title)) el.append(h('section', { class: 'gsec' }, h('h2', null, s.title), body));
      else el.append(h('details', { class: 'fold gsec' }, h('summary', null, hasDanger(s.blokke) ? ic('alert', 'ic warnmark') : null, h('h2', null, s.title), ic('chevron', 'ic chev')), h('div', { class: 'fold-body' }, body)));
    }
  }
  const nSrc = (g.kilder || []).length;
  el.append(fold(`Kilder og evidens (${nSrc})`, [EV_LEGEND(), ...sourcesBody(g.kilder, g.kontrol)], { cls: 'sources' }));
  const rel = (g.se || []).map((id2) => linkItem(id2)).filter(Boolean);
  if (rel.length) el.append(h('h2', { class: 'subhead' }, 'Se også'), h('ul', { class: 'list' }, rel));

  // Fra søgning: åbn de afsnit, der indeholder alle søgeord, og rul til det første
  const words = foldText(q).split(/[^a-z0-9]+/).filter((t) => t.length > 1);
  let first = null;
  if (words.length) for (const d of el.querySelectorAll('details.gsec')) {
    const txt = foldText(d.textContent);
    if (words.every((w) => txt.includes(w))) { d.open = true; d.classList.add('hit'); first ||= d; }
  }
  el.afterMount = () => { if (first) first.scrollIntoView({ block: 'start' }); };
  return el;
}

// Er guiden nødrelateret? (styrer 112-knappen i toplinjen)
export const isEmergencyGuide = (g) => !!g && (g.kap === 'nod' || g.kap === 'foerstehjaelp' || g.nod || g.ring112);

export function chapterBody(k) {
  const c = store.content, out = [];
  if (k.id === 'kort') out.push(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/kort' }, ic('map'), 'Åbn kortet')));
  if (k.id === 'arter') out.push(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/arter' }, ic('leaf'), 'Åbn artsguiden')));
  const guides = c.guides.filter((g) => g.kap === k.id);
  if (guides.length) out.push(h('ul', { class: 'list' }, guides.map(guideRow)));
  if (k.id === 'lister') out.push(h('ul', { class: 'list' }, c.lists.map((l) => row('#/lister/' + l.id, l.titel, 'Tjekliste', null, 'list'))));
  return out;
}

export function pageChapter(id) {
  const k = store.content.chapters.find((x) => x.id === id);
  if (!k) return notFound();
  return h('div', null, h('h1', null, k.titel), k.intro ? h('p', { class: 'lede' }, inline(k.intro)) : null, ...chapterBody(k));
}
