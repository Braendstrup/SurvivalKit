// Sider (visninger). Hver funktion returnerer et DOM-element, som router indsætter i <main>.
import { h, inline, fmtDate, fmtMB, uid, download } from './util.js';
import { store, search, routeOf } from './store.js';
import * as db from './db.js';
import * as packs from './packs.js';
import { toGPX, fromGPX } from './geo.js';

const ic = (id, cls = 'ic') => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + id); s.append(u); return s; };
export const toast = (msg, ms = 3500) => { const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t); setTimeout(() => t.remove(), ms); };

// ---- bogmærker ------------------------------------------------------------------------------------------
export const bookmarks = { list: [] };
export async function loadBookmarks() { bookmarks.list = await db.kvGet('bookmarks', []); }
async function toggleBookmark(id) {
  const i = bookmarks.list.indexOf(id);
  if (i >= 0) bookmarks.list.splice(i, 1); else bookmarks.list.push(id);
  const ok = await db.kvSet('bookmarks', bookmarks.list);
  toast(ok ? (i >= 0 ? 'Bogmærke fjernet' : 'Bogmærke gemt (lokalt)') : 'Kunne ikke gemme permanent – gemt midlertidigt');
}

// ---- tekstblokke ---------------------------------------------------------------------------------------------
const KIND = { info: ['Information', 'info'], warn: ['Advarsel', 'warn'], danger: ['Fare', 'danger'], act: ['Handl nu', 'act'] };
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
        const [label, cls] = KIND[b.k || 'info'];
        return h('div', { class: 'callout ' + cls, role: cls === 'act' ? 'alert' : 'note' },
          h('span', { class: 'ctitle' }, (cls === 'danger' || cls === 'act' ? '⚠ ' : cls === 'warn' ? '! ' : 'i ') + (b.title || label)),
          b.x ? h('p', null, inline(b.x)) : null, b.items ? LISTS(b.items, 'ul') : null);
      }
      case 'call112': return h('a', { class: 'call112', href: 'tel:112' }, ic('phone'), h('div', null, h('b', null, 'Ring 1-1-2'), h('small', null, inline(b.x || 'Ved livsfare, bevidstløshed, kraftig blødning eller tvivl: ring først. Appen må aldrig forsinke et nødopkald.'))));
      case 'fig': return figure(b.id, b.cap);
      case 'figs': return h('div', { class: 'figgrid' }, b.ids.map((id) => figure(id)));
      case 'table': return h('div', { class: 'tablewrap' }, h('table', null, b.head ? h('thead', null, h('tr', null, b.head.map((c) => h('th', null, inline(c))))) : null,
        h('tbody', null, b.rows.map((r) => h('tr', null, r.map((c) => h('td', null, inline(c))))))));
      case 'kv': return h('dl', { class: 'kvt' }, b.rows.map(([k, v]) => [h('dt', null, k), h('dd', null, inline(v))]));
      case 'details': return h('details', b.open ? { open: true } : null, h('summary', null, b.title), renderBlocks(b.blokke));
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

const KONTROL = { kontrolleret: ['ok', 'Kontrolleret mod kilde'], delvist: ['warn', 'Delvist kontrolleret'], ikke: ['bad', 'Ikke fagligt verificeret'] };
export function kontrolBadge(k) {
  if (!k) return h('span', { class: 'badge bad' }, 'Ikke fagligt verificeret');
  const [cls, label] = KONTROL[k.status] || KONTROL.ikke;
  return h('span', { class: 'badge ' + cls, title: k.note || '' }, label + (k.dato && k.status !== 'ikke' ? ' ' + k.dato : ''));
}

function sourcesBox(ids, kontrol) {
  const srcs = (ids || []).map((id) => store.content.sources.find((s) => s.id === id)).filter(Boolean);
  return h('details', { class: 'card' }, h('summary', null, 'Kontrol og kilder (' + srcs.length + ')'),
    h('p', null, kontrolBadge(kontrol), kontrol?.dato ? h('span', { class: 'small muted' }, ' Seneste kontrol: ' + kontrol.dato) : null),
    kontrol?.note ? h('p', { class: 'small' }, inline(kontrol.note)) : null,
    srcs.length ? h('ul', { class: 'src' }, srcs.map((s) => h('li', null, h('strong', null, s.navn), ' – ', s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.url) : null,
      h('br'), h('span', { class: 'muted' }, 'Understøtter: ' + s.stoetter + (s.begraensning ? ' · Begrænsning: ' + s.begraensning : '') + ' · Kontrolleret: ' + (s.dato || 'ikke kontrolleret'))))) : h('p', { class: 'muted small' }, 'Ingen kilde registreret – indholdet er ikke dokumenteret.'),
    h('p', { class: 'small muted' }, 'Kilder er gemt lokalt (offline), men links åbner kun med internet. Se også ', h('a', { href: '#/kilder' }, 'alle kilder'), '.'));
}

const EV_LEGEND = h('details', { class: 'small' }, h('summary', null, 'Hvad betyder mærkerne?'),
  h('p', null, inline('{D} Understøttet af navngiven kilde. {T} Praktisk tommelfingerregel. {F} Kræver faglig vurdering – gæt ikke.')));

const NIVEAU = { gr: 'Grundlæggende', mi: 'Mellem', av: 'Avanceret' };

// ---- sider -----------------------------------------------------------------------------------------------------------------
export function pageHome(ctx) {
  const c = store.content;
  const el = h('div');
  el.append(h('div', { class: 'hero' }, h('h1', null, 'Feltmanual til dansk natur og kriser'),
    h('p', null, 'Virker uden internet. Prioriterer sikkerhed og kildebelagte råd frem for survivalmyter.')));
  el.append(h('div', { class: 'callout act' }, h('span', { class: 'ctitle' }, '⚠ Livsfare? Ring 112 først'),
    h('p', null, 'Appen må aldrig forsinke et nødopkald. ', h('a', { href: 'tel:112' }, 'Ring 1-1-2 nu'), ' – opkaldet er gratis og virker i hele EU.')));
  el.append(h('h2', null, 'Nødmenu'), nodGrid());
  el.append(h('div', { class: 'grid' },
    tile('#/kort', 'map', 'Kort over Djursland', ctx.mapStatusText || 'Topografisk offlinekort'),
    tile('#/arter', 'leaf', 'Spiseligt & giftigt', 'Artsguide med forvekslinger'),
    tile('#/lister/hjemmeberedskab', 'list', 'Tjeklister', 'Hjemmeberedskab, rygsæk m.m.')));
  el.append(h('h2', null, 'Kapitler'));
  el.append(h('div', { class: 'grid' }, c.chapters.filter((k) => !k.skjul).map((k) => tile('#/kap/' + k.id, k.ikon || 'book', `${k.nr}. ${k.titel}`, `${c.guides.filter((g) => g.kap === k.id).length} guides`))));
  if (bookmarks.list.length) {
    el.append(h('h2', null, 'Dine bogmærker'), h('ul', { class: 'list' }, bookmarks.list.map((id) => linkItem(id)).filter(Boolean)));
  }
  el.append(h('div', { class: 'callout info' }, h('span', { class: 'ctitle' }, 'Husk'),
    h('p', null, 'En offlinehåndbog kan ikke garantere de nyeste regler, afbrændingsforbud, vejrudsigter eller beredskabsmeddelelser. Tjek dem, når du har forbindelse. Se ', h('a', { href: '#/g/om-begraensninger' }, 'begrænsninger'), ' og ', h('a', { href: '#/kilder' }, 'kilder'), '.')));
  return el;
}
function tile(href, icon, title, sub, cls = '') { return h('a', { class: 'tile ' + cls, href }, ic(icon), h('b', null, title), h('small', null, sub)); }
function linkItem(id) {
  const e = store.byId.get(id); if (!e) return null;
  return h('li', null, h('a', { href: routeOf(e.type, id) }, h('span', null, e.item.titel || e.item.dansk, h('small', null, e.item.resume || e.item.latin || ''))));
}
function nodGrid() {
  return h('div', { class: 'grid' }, store.content.nodmenu.map((n) => tile('#/g/' + n.guide, n.ikon, n.titel, n.tekst, 'emergency')));
}

export function pageNod() {
  const el = h('div');
  el.append(h('h1', null, 'Nødmenu'));
  el.append(h('a', { class: 'call112', href: 'tel:112' }, ic('phone'), h('div', null, h('b', null, 'Ring 1-1-2'), h('small', null, 'Gratis, døgnåbent, hele EU. Ring først – læs bagefter.'))));
  el.append(h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Ring 112 hvis'),
    h('ul', null, [
      'nogen er bevidstløs eller ikke trækker vejret normalt', 'der er kraftig blødning, der ikke standser', 'der er mistanke om brud, rygskade eller hovedskade',
      'nogen har hugormebid, alvorlig allergisk reaktion eller åndedrætsbesvær', 'nogen er kraftigt nedkølet, forvirret eller meget overophedet',
      'nogen er forsvundet, savnet eller i fare i vand, mørke eller dårligt vejr', 'der er brand, kulilte-mistanke eller andre livstruende forhold'].map((t) => h('li', null, t)))));
  el.append(nodGrid());
  const g = store.byId.get('nod-1min')?.item;
  if (g) el.append(h('h2', null, 'Nødprocedure på under ét minut'), ...renderBlocks(g.blokke));
  el.append(h('div', { class: 'callout info' }, h('span', { class: 'ctitle' }, 'Andre numre'),
    h('p', null, inline('Politiets servicenummer **114** · Lægevagt/akuttelefon **1813** (Region Hovedstaden; øvrige regioner: se [[dansk-numre]]) · Giftlinjen **82 12 12 12** (døgnåben). Kilde: Beredskabsstyrelsen.'))));
  return el;
}

export function pageChapter(id) {
  const c = store.content, k = c.chapters.find((x) => x.id === id);
  if (!k) return notFound();
  const el = h('div');
  el.append(h('p', { class: 'crumb' }, h('a', { href: '#/' }, 'Forside'), ' › ', k.titel), h('h1', null, `${k.nr}. ${k.titel}`));
  if (k.intro) el.append(h('p', null, inline(k.intro)));
  if (k.id === 'kort') el.append(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/kort' }, ic('map'), 'Åbn kortet')));
  if (k.id === 'mad') el.append(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/arter' }, ic('leaf'), 'Åbn artsguiden')));
  const guides = c.guides.filter((g) => g.kap === id);
  el.append(h('ul', { class: 'list' }, guides.map((g) => h('li', null, h('a', { href: '#/g/' + g.id }, h('span', null, g.titel, h('small', null, g.resume || '')), kontrolBadge(g.kontrol))))));
  return el;
}

export function pageGuide(id) {
  const c = store.content, g = c.guides.find((x) => x.id === id);
  if (!g) return notFound();
  const k = c.chapters.find((x) => x.id === g.kap);
  const marked = bookmarks.list.includes(g.id);
  const bm = h('button', { class: 'btn secondary small', 'aria-pressed': String(marked), onclick: async (e) => { const btnEl = e.currentTarget; await toggleBookmark(g.id); const on = bookmarks.list.includes(g.id); btnEl.setAttribute('aria-pressed', String(on)); btnEl.replaceChildren(ic(on ? 'bookmark' : 'bookmark-o'), on ? 'Gemt' : 'Gem'); } },
    ic(marked ? 'bookmark' : 'bookmark-o'), marked ? 'Gemt' : 'Gem');
  const el = h('article', { class: 'guide' });
  el.append(h('p', { class: 'crumb' }, h('a', { href: '#/' }, 'Forside'), ' › ', k ? h('a', { href: '#/kap/' + k.id }, k.titel) : '', ' › ', g.titel),
    h('h1', null, g.titel),
    h('p', null, kontrolBadge(g.kontrol), g.niveau ? h('span', { class: 'badge neutral' }, NIVEAU[g.niveau] || g.niveau) : null, bm),
    g.resume ? h('p', null, h('strong', null, inline(g.resume))) : null);
  if (g.nod || g.ring112) el.append(renderBlocks([{ t: 'call112' }])[0]);
  if (g.kontrol?.status === 'ikke') el.append(h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, 'Status: ikke fagligt verificeret'), h('p', null, 'Dette afsnit bygger på almen faglig viden og er endnu ikke kontrolleret mod en navngiven kilde. Brug det som pejling, og læs kildernes anvisninger, hvis du har mulighed for det.')));
  el.append(...renderBlocks(g.blokke));
  el.append(EV_LEGEND, sourcesBox(g.kilder, g.kontrol));
  const rel = (g.se || []).map((id2) => linkItem(id2)).filter(Boolean);
  if (rel.length) el.append(h('h2', null, 'Se også'), h('ul', { class: 'list' }, rel));
  return el;
}

// ---- artsguide --------------------------------------------------------------------------------------------------------------
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const KAT = {
  standard: ['Dokumenteret spiselig (kræver stadig sikker bestemmelse)', 's-standard'],
  forsigtighed: ['Kræver særlig forsigtighed', 's-forsigtighed'],
  undgaa: ['Nybegyndere bør undgå', 's-undgaa'],
  giftig: ['GIFTIG – må ikke indsamles', 's-giftig'],
  ikke: ['Ikke verificeret mod kilde i denne udgave', 's-ikke'],
};
const monthbar = (ms) => h('div', { class: 'monthbar', role: 'img', 'aria-label': 'Sæson: ' + (ms || []).map((m) => MONTHS[m - 1]).join(' ') }, MONTHS.map((m, i) => h('i', { class: (ms || []).includes(i + 1) ? 'on' : '' }, m)));
const NATUR = ['skov', 'skovbryn', 'eng', 'hede', 'kyst', 'sø og vandløb', 'have og park'];
let artFilter = { q: '', natur: '', kat: '', maaned: '' };

export function pageArter() {
  const c = store.content, el = h('div');
  el.append(h('h1', null, 'Spiseligt og giftigt'),
    h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Læs før du bruger artsguiden'),
      h('ul', null, [
        'Spis kun planter og svampe, du kender 100 %. Billeder og apps (også AI) kan ikke garantere sikker bestemmelse. – Fødevarestyrelsen.',
        'Mad er sjældent det, der redder dig i en nødsituation: du kan klare dig i uger uden mad, men kun få dage uden vand. Tag aldrig risici for at skaffe mad.',
        'Appen indeholder bevidst ingen fotos eller genererede tegninger af arter: de kunne give falsk tryghed. Brug en nyere feltbog (fx de bøger Fødevarestyrelsen anbefaler) eller en kyndig.',
      ].map((t) => h('li', null, t)))),
    h('p', null, inline('Tilberedning, hygiejne og forgiftning: [[mad-hygiejne]], [[svamp-forgiftning]], [[giftige-planter-forgiftning]]. Regler for indsamling: [[regler-indsamling]].')));
  const q = h('input', { type: 'search', placeholder: 'Søg art, latinsk navn eller forveksling', value: artFilter.q, 'aria-label': 'Søg i arter' });
  const nat = h('select', { 'aria-label': 'Naturtype' }, h('option', { value: '' }, 'Alle naturtyper'), NATUR.map((n) => h('option', { value: n, selected: artFilter.natur === n }, n[0].toUpperCase() + n.slice(1))));
  const kat = h('select', { 'aria-label': 'Kategori' }, h('option', { value: '' }, 'Alle kategorier'), Object.entries(KAT).map(([k, [l]]) => h('option', { value: k, selected: artFilter.kat === k }, l)));
  const mnd = h('select', { 'aria-label': 'Måned' }, h('option', { value: '' }, 'Alle måneder'), MONTHS.map((_, i) => h('option', { value: String(i + 1), selected: artFilter.maaned === String(i + 1) }, ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'][i])));
  const out = h('div');
  const draw = () => {
    artFilter = { q: q.value, natur: nat.value, kat: kat.value, maaned: mnd.value };
    const ql = q.value.trim().toLowerCase();
    const items = c.species.filter((s) =>
      (!ql || (s.dansk + ' ' + s.latin + ' ' + (s.synonymer || []).join(' ') + ' ' + (s.forvekslinger || []).map((f) => f.navn).join(' ')).toLowerCase().includes(ql)) &&
      (!nat.value || (s.naturtyper || []).includes(nat.value)) && (!kat.value || s.kategori === kat.value) &&
      (!mnd.value || (s.saeson || []).includes(+mnd.value)));
    out.replaceChildren(h('p', { class: 'muted small' }, `${items.length} af ${c.species.length} arter`),
      h('ul', { class: 'list' }, items.map((s) => h('li', null, h('a', { href: '#/a/' + s.id }, h('span', null, s.dansk, h('small', null, s.latin + ' · ' + (s.naturtyper || []).join(', '))), h('span', { class: 'species-status ' + KAT[s.kategori][1] }, shortKat(s.kategori)))))));
  };
  for (const x of [q, nat, kat, mnd]) x.addEventListener('input', draw);
  el.append(h('div', { class: 'sticky-search' }, q, h('div', { class: 'btnrow' }, nat, kat, mnd)), out);
  draw();
  return el;
}
const shortKat = (k) => ({ standard: 'Spiselig', forsigtighed: 'Forsigtig', undgaa: 'Undgå', giftig: 'GIFTIG', ikke: 'Uverificeret' }[k]);

export function pageArt(id) {
  const c = store.content, s = c.species.find((x) => x.id === id);
  if (!s) return notFound();
  const el = h('article', { class: 'guide' });
  const [katLabel, katCls] = KAT[s.kategori];
  el.append(h('p', { class: 'crumb' }, h('a', { href: '#/arter' }, 'Artsguide'), ' › ', s.dansk),
    h('h1', null, s.dansk), h('p', null, h('em', null, s.latin), ' · ', s.familie),
    h('p', null, h('span', { class: 'species-status ' + katCls }, katLabel), ' ', kontrolBadge(s.kontrol)));
  if (s.kategori === 'giftig') el.append(h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Giftig eller dødelig'), h('p', null, inline(s.advarsel || 'Må ikke indsamles eller spises. Ved mistanke om forgiftning: ring Giftlinjen 82 12 12 12 eller 112.'))));
  else if (s.kategori === 'ikke') el.append(h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, 'Ikke verificeret'), h('p', null, 'Der er ikke fundet en myndighedsvurdering af denne art i de kilder, der er kontrolleret. Brug den ikke som nødføde, og kun hvis du i forvejen kan bestemme den sikkert.')));
  else el.append(h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, 'Identifikation først'), h('p', null, 'Sikker bestemmelse kræver flere samtidige kendetegn, kontrol af forvekslingsarter og gerne en kyndig. Er du det mindste i tvivl: lad være.')));
  if (s.saeson?.length) el.append(h('div', { class: 'sec-label' }, 'Sæson i Danmark'), monthbar(s.saeson));
  const row = (label, val) => val ? [h('dt', null, label), h('dd', null, inline(Array.isArray(val) ? val.join('; ') : val))] : null;
  el.append(h('dl', { class: 'kvt' }, row('Naturtype', (s.naturtyper || []).join(', ')), row('Typisk voksested', s.voksested), row('Kendetegn', s.kendetegn),
    row('Blade, stængel, blomster, frugter', s.beskrivelse), row('Spiselige dele', s.dele), row('Tilberedning', s.tilberedning), row('Smag og konsistens', s.smag),
    row('Sikkerhedskrav til identifikation', s.sikkerhed), row('Lovmæssige forhold', s.lov), row('Bemærkning', s.bem)));
  if (s.forvekslinger?.length) {
    el.append(h('h2', null, 'Forvekslingsmuligheder'), h('div', { class: 'tablewrap' }, h('table', null,
      h('thead', null, h('tr', null, ['Art', 'Fare', 'Sådan skelner du'].map((t) => h('th', null, t)))),
      h('tbody', null, s.forvekslinger.map((f) => h('tr', null, h('td', null, h('strong', null, f.navn), f.latin ? h('div', { class: 'small' }, h('em', null, f.latin)) : null), h('td', null, inline(f.fare || '')), h('td', null, inline(f.forskel || ''))))))));
  }
  if (s.farligeDobbelt) el.append(h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Giftige eller farlige dobbeltgængere'), h('p', null, inline(s.farligeDobbelt))));
  el.append(sourcesBox(s.kilder, s.kontrol));
  return el;
}

// ---- tjeklister -------------------------------------------------------------------------------------------------------------
export async function pageList(id) {
  const l = store.content.lists.find((x) => x.id === id);
  if (!l) return notFound();
  const checks = await db.kvGet('checks', {});
  const st = checks[id] || {};
  const el = h('div');
  const total = l.grupper.reduce((n, g) => n + g.punkter.length, 0);
  const bar = h('i'); const lab = h('span', { class: 'small muted' });
  const upd = () => { const n = Object.values(st).filter(Boolean).length; bar.style.width = (n / total * 100) + '%'; lab.textContent = `${n} af ${total} afkrydset`; };
  el.append(h('p', { class: 'crumb' }, h('a', { href: '#/' }, 'Forside'), ' › ', h('a', { href: '#/lister/' + store.content.lists[0].id }, 'Tjeklister'), ' › ', l.titel), h('h1', null, l.titel),
    h('div', { class: 'chips' }, store.content.lists.map((x) => h('a', { class: 'chip', href: '#/lister/' + x.id, 'aria-pressed': String(x.id === id), style: 'text-decoration:none' }, x.titel))));
  if (l.intro) el.append(h('p', null, inline(l.intro)));
  el.append(h('div', { class: 'progress' }, bar), lab);
  l.grupper.forEach((g, gi) => {
    el.append(h('h2', null, g.titel));
    g.punkter.forEach((p, pi) => {
      const key = gi + '.' + pi;
      const cb = h('input', { type: 'checkbox', checked: !!st[key], onchange: async () => { st[key] = cb.checked; checks[id] = st; row.classList.toggle('done', cb.checked); upd(); await db.kvSet('checks', checks); } });
      const row = h('label', { class: 'check' + (st[key] ? ' done' : '') }, cb, h('span', null, inline(p)));
      el.append(row);
    });
  });
  el.append(h('div', { class: 'btnrow' }, h('button', { class: 'btn secondary small', onclick: async () => { checks[id] = {}; await db.kvSet('checks', checks); location.reload(); } }, 'Nulstil denne liste')));
  if (l.kilder) el.append(sourcesBox(l.kilder, l.kontrol));
  upd();
  return el;
}

// ---- søgning ---------------------------------------------------------------------------------------------------------------------
export function pageSearch(q = '') {
  const el = h('div');
  const inp = h('input', { type: 'search', value: q, placeholder: 'Søg i hele håndbogen (virker offline)', 'aria-label': 'Søg', autofocus: true });
  const out = h('div');
  const TYPELABEL = { g: 'Guide', a: 'Art', l: 'Tjekliste', kap: 'Kapitel' };
  const draw = () => {
    const r = search(inp.value);
    out.replaceChildren(inp.value.trim() ? h('p', { class: 'muted small' }, `${r.length} resultater`) : h('p', { class: 'muted' }, 'Prøv fx: vand, kogning, hugorm, pælestik, bål, kompas, hyldebær, hypotermi.'),
      h('ul', { class: 'list' }, r.map((x) => h('li', null, h('a', { href: routeOf(x.type, x.id) }, h('span', null, x.title, h('small', null, x.sub)), h('span', { class: 'badge neutral' }, TYPELABEL[x.type]))))));
  };
  inp.addEventListener('input', draw);
  el.append(h('h1', null, 'Søg'), h('div', { class: 'sticky-search' }, inp), out);
  draw();
  return el;
}

// ---- kilder ---------------------------------------------------------------------------------------------------------------------------
export function pageKilder() {
  const c = store.content, el = h('div');
  el.append(h('h1', null, 'Kilder og verificering'),
    h('p', null, 'Alle kilder er gemt lokalt. "Kontrolleret" betyder, at den navngivne kildeside rent faktisk er læst og sammenholdt med guiden på datoen. Hvor kilden ikke understøtter en påstand, står det.'));
  el.append(h('h2', null, 'Kilder'), h('ul', { class: 'src' }, c.sources.map((s) => h('li', null, h('strong', null, s.navn), s.url ? [' – ', h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.url)] : null,
    h('br'), 'Understøtter: ', s.stoetter, s.begraensning ? [h('br'), 'Begrænsning: ', s.begraensning] : null, h('br'), h('span', { class: 'muted' }, 'Sidst kontrolleret: ' + (s.dato || 'ikke kontrolleret'))))));
  const bad = c.guides.filter((g) => g.kontrol?.status !== 'kontrolleret'), badA = c.species.filter((s) => s.kontrol?.status !== 'kontrolleret');
  el.append(h('h2', null, 'Indhold der endnu ikke er fuldt verificeret'),
    h('p', { class: 'small muted' }, 'Gennemsigtighed: disse afsnit er skrevet ud fra almen faglig viden eller kun delvist kontrolleret. De er markeret på selve siden.'),
    h('ul', { class: 'list' }, [...bad.map((g) => h('li', null, h('a', { href: '#/g/' + g.id }, h('span', null, g.titel, h('small', null, g.kontrol?.note || '')), kontrolBadge(g.kontrol)))),
      ...badA.map((s) => h('li', null, h('a', { href: '#/a/' + s.id }, h('span', null, s.dansk + ' (art)', h('small', null, s.kontrol?.note || '')), kontrolBadge(s.kontrol))))]));
  return el;
}

// ---- Mig ---------------------------------------------------------------------------------------------------------------------------------
export async function pageMig(ctx) {
  const el = h('div');
  el.append(h('h1', null, 'Mig'));
  // personlige oplysninger / nødkontakter
  const pd = await db.kvGet('persondata', { navn: '', adresse: '', medicin: '', allergi: '', blodtype: '', note: '' });
  const contacts = await db.kvGet('contacts', []);
  const pdBox = h('div', { class: 'card' }, h('h2', null, 'Nødkontakter og personlige oplysninger'), h('p', { class: 'small muted' }, 'Gemmes kun på denne enhed. Vises ikke til nogen. Eksporteres kun, hvis du selv vælger det.'));
  const f = (key, label, ph) => { const i = h('input', { type: 'text', value: pd[key] || '', placeholder: ph || '', 'aria-label': label, onchange: async () => { pd[key] = i.value; await db.kvSet('persondata', pd); toast('Gemt'); } }); return [h('label', null, label), i]; };
  pdBox.append(...f('navn', 'Navn'), ...f('adresse', 'Adresse / hjemsted'), ...f('medicin', 'Medicin'), ...f('allergi', 'Allergier'), ...f('blodtype', 'Blodtype (valgfrit)'));
  const cl = h('div');
  const drawC = () => cl.replaceChildren(...contacts.map((c2, i) => h('div', { class: 'stat' }, h('span', null, h('strong', null, c2.name), c2.note ? h('small', { class: 'muted' }, ' – ' + c2.note) : null), h('span', null,
    h('a', { class: 'btn small', href: 'tel:' + c2.phone.replace(/\s/g, '') }, ic('phone'), c2.phone), ' ', h('button', { class: 'btn secondary small', 'aria-label': 'Slet ' + c2.name, onclick: async () => { contacts.splice(i, 1); await db.kvSet('contacts', contacts); drawC(); } }, ic('x'))))));
  const n = h('input', { type: 'text', placeholder: 'Navn', 'aria-label': 'Kontaktnavn' }), p = h('input', { type: 'tel', placeholder: 'Telefon', 'aria-label': 'Telefonnummer' }), no = h('input', { type: 'text', placeholder: 'Note (fx relation)', 'aria-label': 'Note' });
  pdBox.append(h('h3', null, 'Kontaktpersoner'), cl, n, p, no, h('div', { class: 'btnrow' }, h('button', { class: 'btn small', onclick: async () => { if (!n.value || !p.value) return toast('Udfyld navn og telefon'); contacts.push({ name: n.value, phone: p.value, note: no.value }); await db.kvSet('contacts', contacts); n.value = p.value = no.value = ''; drawC(); } }, 'Tilføj kontakt')));
  drawC(); el.append(pdBox);

  // noter
  const notes = await db.kvGet('notes', []);
  const nBox = h('div', { class: 'card' }, h('h2', null, 'Personlige beredskabsnoter'));
  const nl = h('div'); const nt = h('input', { type: 'text', placeholder: 'Titel', 'aria-label': 'Notetitel' }), nx = h('textarea', { placeholder: 'Skriv din note …', 'aria-label': 'Notetekst' });
  const drawN = () => nl.replaceChildren(...notes.map((x, i) => h('details', null, h('summary', null, x.title || '(uden titel)', h('small', { class: 'muted' }, ' · ' + fmtDate(x.ts))), h('p', { style: 'white-space:pre-wrap' }, x.text),
    h('button', { class: 'btn secondary small', onclick: async () => { notes.splice(i, 1); await db.kvSet('notes', notes); drawN(); } }, 'Slet note'))));
  nBox.append(nl, nt, nx, h('div', { class: 'btnrow' }, h('button', { class: 'btn small', onclick: async () => { if (!nx.value.trim() && !nt.value.trim()) return; notes.unshift({ id: uid(), title: nt.value, text: nx.value, ts: Date.now() }); const ok = await db.kvSet('notes', notes); nt.value = nx.value = ''; drawN(); toast(ok ? 'Note gemt' : 'Kunne ikke gemme permanent'); } }, 'Gem note')));
  drawN(); el.append(nBox);

  // bogmærker
  el.append(h('div', { class: 'card' }, h('h2', null, 'Bogmærker'), bookmarks.list.length ? h('ul', { class: 'list' }, bookmarks.list.map((id) => linkItem(id)).filter(Boolean)) : h('p', { class: 'muted' }, 'Ingen endnu. Tryk "Gem" øverst på en guide.')));

  // indstillinger
  const theme = (document.documentElement.dataset.theme || 'auto');
  const size = (document.documentElement.dataset.size || 'm');
  const setPref = (k, v) => { try { localStorage.setItem('sk.' + k, v); } catch { /* ignoreres */ } document.documentElement.dataset[k] = v; };
  const lastpos = await db.kvGet('lastpos.enabled', false);
  el.append(h('div', { class: 'card' }, h('h2', null, 'Indstillinger'),
    h('label', { for: 'sel-theme' }, 'Udseende'), h('select', { id: 'sel-theme', onchange: (e) => setPref('theme', e.target.value) }, [['auto', 'Automatisk'], ['light', 'Lyst'], ['dark', 'Mørkt'], ['night', 'Nat (rødtonet, lav blænding)']].map(([v, l]) => h('option', { value: v, selected: theme === v }, l))),
    h('label', { for: 'sel-size' }, 'Tekststørrelse'), h('select', { id: 'sel-size', onchange: (e) => setPref('size', e.target.value) }, [['m', 'Normal'], ['l', 'Stor'], ['xl', 'Ekstra stor']].map(([v, l]) => h('option', { value: v, selected: size === v }, l))),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: lastpos, onchange: async (e) => { await db.kvSet('lastpos.enabled', e.target.checked); if (!e.target.checked) await db.kvDel('lastpos'); toast(e.target.checked ? 'Senest kendte position gemmes lokalt, mens kortet bruger GPS' : 'Gemt position slettet'); } }), h('span', null, 'Gem min senest registrerede position lokalt (kun på enheden, kun når kortets GPS er aktiv)'))));

  // data og lager
  el.append(await dataCard(ctx));
  return el;
}

async function dataCard(ctx) {
  const box = h('div', { class: 'card' }, h('h2', null, 'Data og offline-lager'));
  const info = await db.storageInfo(); const active = await packs.getActive();
  box.append(
    h('div', { class: 'stat' }, h('span', null, 'Appversion'), h('strong', null, store.content.build.version)),
    h('div', { class: 'stat' }, h('span', null, 'Håndbog (tekst, illustrationer, kilder)'), h('strong', null, ctx.swReady ? 'Gemt offline ✓' : 'Ikke endnu gemt – kræver første besøg online')),
    h('div', { class: 'stat' }, h('span', null, 'Kortpakke Djursland'), h('strong', null, active ? `Hentet ✓ (v${active.version})` : 'IKKE hentet')),
    h('div', { class: 'stat' }, h('span', null, 'Lager brugt / tilladt'), h('strong', null, `${fmtMB(info.usage)} / ${fmtMB(info.quota)}`)),
    h('div', { class: 'stat' }, h('span', null, 'Beskyttet mod automatisk oprydning'), h('strong', null, info.persisted == null ? 'ukendt' : info.persisted ? 'Ja' : 'Nej (browseren kan frigøre lager)')));
  box.append(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/kort' }, ic('map'), active ? 'Åbn kort / opdater' : 'Hent kortpakke'),
    h('button', { class: 'btn secondary', onclick: async () => { const ok = await db.requestPersistence(); toast(ok ? 'Lageret er nu beskyttet' : 'Browseren gav ikke tilladelse (prøv at installere appen på startskærmen)'); } }, 'Beskyt lager')));
  box.append(h('p', { class: 'small muted' }, 'Browserlager kan i sjældne tilfælde ryddes af operativsystemet, især ved lav lagerplads eller hvis siden ikke bruges længe. Eksportér derfor vigtige noter og waypoints.'));
  box.append(h('div', { class: 'btnrow' },
    h('button', { class: 'btn secondary', onclick: async () => {
      const data = { app: 'survivalkit', version: 1, exported: new Date().toISOString(), kv: await db.kvAll(), waypoints: await db.wpAll() };
      delete data.kv['packs.active']; delete data.kv['lastpos'];
      download('survivalkit-data.json', JSON.stringify(data, null, 1), 'application/json');
    } }, ic('down'), 'Eksportér mine data (JSON)'),
    h('label', { class: 'btn secondary', style: 'margin:0' }, 'Importér data (JSON)', h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => {
      try { const d = JSON.parse(await e.target.files[0].text()); if (d.app !== 'survivalkit') throw new Error('Ikke en Survivalkit-fil'); for (const [k, v] of Object.entries(d.kv || {})) await db.kvSet(k, v); for (const w of d.waypoints || []) await db.wpPut(w); toast('Importeret – genindlæser'); setTimeout(() => location.reload(), 800); } catch (err) { toast('Import mislykkedes: ' + err.message); }
    } }))));
  box.append(h('div', { class: 'btnrow' }, h('button', { class: 'btn danger small', onclick: async () => { if (!confirm('Slet ALLE lokale data: noter, kontakter, waypoints, bogmærker og kortpakke?')) return; await packs.removePacks(); await db.wipeAll(); toast('Alt er slettet'); setTimeout(() => location.reload(), 600); } }, 'Slet alle lokale data')));
  return box;
}

export function notFound() { return h('div', null, h('h1', null, 'Siden findes ikke'), h('p', null, h('a', { href: '#/' }, 'Til forsiden'))); }
export { ic };
