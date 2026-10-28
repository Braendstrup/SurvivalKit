// Forside og temasider.
import { h, inline } from '../util.js';
import { store } from '../store.js';
import { ic, bookmarks, recent, linkItem, notFound } from './ui.js';
import { chapterBody } from './guide.js';
import { scenarieRow } from './scenarie.js';

const temaStats = (t) => {
  const n = store.content.guides.filter((g) => t.kapitler.includes(g.kap)).length;
  return `${t.kapitler.length} kapitler · ${n} guides`;
};

export function pageHome() {
  const c = store.content;
  const el = h('div', { class: 'home' });
  el.append(h('h1', { class: 'sr-only' }, 'Survivalkit – dansk feltmanual'));
  el.append(h('a', { class: 'searchbox', href: '#/sog', role: 'search' }, ic('search'), h('span', null, 'Søg eller spørg …')));
  el.append(h('a', { class: 'nodcard', href: '#/nod' }, ic('alert'), h('span', null, h('b', null, 'Nødsituation eller krise?'), h('small', null, 'Skade, faret vild, strømmen går, storm, sirene – trin for trin')), ic('chevron', 'ic chev')));
  el.append(h('h2', { class: 'subhead' }, 'Håndbogen'),
    h('div', { class: 'temagrid' }, c.temaer.map((t) => h('a', { class: 'temakort', href: '#/tema/' + t.id }, ic(t.ikon), h('b', null, t.titel), h('small', null, temaStats(t))))));
  const items = [];
  if (recent.id && store.byId.get(recent.id)) items.push({ id: recent.id, label: 'Senest læst' });
  for (const id of bookmarks.list.slice(-3).reverse()) if (id !== recent.id) items.push({ id });
  if (items.length) el.append(h('h2', { class: 'subhead' }, 'Fortsæt'), h('ul', { class: 'list cards' }, items.map((x) => linkItem(x.id)).filter(Boolean)));
  el.append(h('p', { class: 'footnote' }, 'Offlinehåndbog – tjek altid aktuelle regler og afbrændingsforbud, når du har net. ', h('a', { href: '#/g/om-begraensninger' }, 'Om appen ›')));
  return el;
}

export function pageTema(id) {
  const c = store.content, t = c.temaer.find((x) => x.id === id);
  if (!t) return notFound();
  const el = h('div', { class: 'tema' }, h('h1', null, t.titel), t.intro ? h('p', { class: 'lede' }, t.intro) : null);
  if (t.id === 'regler' && c.scenarier?.length) el.append(h('section', { class: 'kapsec' }, h('h2', null, 'Scenarier – trin for trin'), h('ul', { class: 'nodlist' }, c.scenarier.map(scenarieRow))));
  for (const kid of t.kapitler) {
    const k = c.chapters.find((x) => x.id === kid);
    if (!k) continue;
    const intro = k.intro ? h('p', { class: 'clamp small muted', onclick: (e) => e.currentTarget.classList.toggle('open') }, inline(k.intro)) : null;
    el.append(h('section', { class: 'kapsec', id: 'kap-' + k.id }, h('h2', null, h('a', { href: '#/kap/' + k.id }, k.titel)), intro, ...chapterBody(k)));
  }
  return el;
}
