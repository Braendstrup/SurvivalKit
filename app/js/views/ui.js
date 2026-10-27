// Fælles byggesten for siderne: ikoner, toast, bogmærker, senest læst, statusmærker, kildeboks og listerækker.
import { h, inline } from '../util.js';
import { store, routeOf } from '../store.js';
import * as db from '../db.js';

export const ic = (id, cls = 'ic') => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + id); s.append(u); return s; };
export const toast = (msg, ms = 3500) => { document.querySelectorAll('.toast').forEach((t) => t.remove()); const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t); setTimeout(() => t.remove(), ms); };

// ---- bogmærker og senest læst ---------------------------------------------------------------------------
export const bookmarks = { list: [] };
export const recent = { id: null };
export async function loadBookmarks() { bookmarks.list = await db.kvGet('bookmarks', []); recent.id = await db.kvGet('recent', null); }
export async function toggleBookmark(id) {
  const i = bookmarks.list.indexOf(id);
  if (i >= 0) bookmarks.list.splice(i, 1); else bookmarks.list.push(id);
  const ok = await db.kvSet('bookmarks', bookmarks.list);
  toast(ok ? (i >= 0 ? 'Bogmærke fjernet' : 'Gemt under Gemte') : 'Kunne ikke gemme permanent – gemt midlertidigt');
}
export function setRecent(id) { recent.id = id; db.kvSet('recent', id); }

// ---- statusmærker -----------------------------------------------------------------------------------------
const KONTROL = { kontrolleret: ['ok', 'Kontrolleret mod kilde'], delvist: ['warn', 'Delvist kontrolleret'], ikke: ['bad', 'Ikke fagligt verificeret'] };
export function kontrolBadge(k) {
  if (!k) return h('span', { class: 'badge bad' }, 'Ikke fagligt verificeret');
  const [cls, label] = KONTROL[k.status] || KONTROL.ikke;
  return h('span', { class: 'badge ' + cls, title: k.note || '' }, label + (k.dato && k.status !== 'ikke' ? ' ' + k.dato : ''));
}
// Lille statusprik til lister (farve + tekst for skærmlæser og hover)
export function kontrolDot(k) {
  const [cls, label] = KONTROL[k?.status] || KONTROL.ikke;
  return h('span', { class: 'dot ' + cls, title: label, role: 'img', 'aria-label': label });
}

const srcsOf = (ids) => (ids || []).map((id) => store.content.sources.find((s) => s.id === id)).filter(Boolean);
export function sourcesBody(ids, kontrol) {
  const srcs = srcsOf(ids);
  return [
    h('p', null, kontrolBadge(kontrol), kontrol?.dato ? h('span', { class: 'small muted' }, ' Seneste kontrol: ' + kontrol.dato) : null),
    kontrol?.note ? h('p', { class: 'small' }, inline(kontrol.note)) : null,
    srcs.length ? h('ul', { class: 'src' }, srcs.map((s) => h('li', null, h('strong', null, s.navn), ' – ', s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.url) : null,
      h('br'), h('span', { class: 'muted' }, 'Understøtter: ' + s.stoetter + (s.begraensning ? ' · Begrænsning: ' + s.begraensning : '') + ' · Kontrolleret: ' + (s.dato || 'ikke kontrolleret'))))) : h('p', { class: 'muted small' }, 'Ingen kilde registreret – indholdet er ikke dokumenteret.'),
    h('p', { class: 'small muted' }, 'Kilder er gemt lokalt (offline), men links åbner kun med internet. Se også ', h('a', { href: '#/kilder' }, 'alle kilder'), '.')];
}
export const sourcesBox = (ids, kontrol, title = 'Kontrol og kilder') => fold(`${title} (${srcsOf(ids).length})`, sourcesBody(ids, kontrol));

// ---- rækker og lister -------------------------------------------------------------------------------------------
// En listerække: titel + undertekst + valgfrit element til højre. Klassen .list bevares (bruges af tests og CSS).
export const row = (href, title, sub, right, icon) => h('li', null, h('a', { href }, icon ? ic(icon, 'ic lead') : null, h('span', { class: 'rt' }, h('b', null, title), sub ? h('small', null, sub) : null), right || ic('chevron', 'ic chev')));
export function linkItem(id) {
  const e = store.byId.get(id); if (!e) return null;
  return row(routeOf(e.type, id), e.item.titel || e.item.dansk, e.item.resume || e.item.latin || '');
}
export const guideRow = (g) => row('#/g/' + g.id, g.titel, g.resume || '', kontrolDot(g.kontrol));

// Foldbart afsnit med ensartet udseende
export const fold = (title, kids, { open = false, cls = '', warn = false } = {}) =>
  h('details', { class: 'fold ' + cls, open }, h('summary', null, warn ? ic('alert', 'ic warnmark') : null, h('span', null, title), ic('chevron', 'ic chev')), h('div', { class: 'fold-body' }, kids));

export const temaOf = (kapId) => store.content.temaer.find((t) => t.kapitler.includes(kapId));

export function notFound() { return h('div', null, h('h1', null, 'Siden findes ikke'), h('p', null, h('a', { href: '#/' }, 'Til forsiden'))); }
