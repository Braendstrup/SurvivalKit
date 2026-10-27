// Gemte: bogmærker, tjeklister, noter og nødkontakter (alt gemt lokalt på enheden). Plus selve tjekliste-siden.
import { h, inline, fmtDate, uid } from '../util.js';
import { store, routeOf } from '../store.js';
import * as db from '../db.js';
import { ic, toast, bookmarks, toggleBookmark, fold, row, sourcesBox, notFound } from './ui.js';

const listTotal = (l) => l.grupper.reduce((n, g) => n + g.punkter.length, 0);

export async function pageGemte() {
  const c = store.content, el = h('div', { class: 'gemte' });
  el.append(h('h1', null, 'Gemte'));

  // bogmærker
  const bmList = h('ul', { class: 'list' });
  const drawBm = () => {
    const items = bookmarks.list.map((id) => [id, store.byId.get(id)]).filter(([, e]) => e);
    bmList.replaceChildren(...(items.length ? items.map(([id, e]) => h('li', { class: 'withaction' },
      h('a', { href: routeOf(e.type, id) }, h('span', { class: 'rt' }, h('b', null, e.item.titel || e.item.dansk), h('small', null, e.item.resume || e.item.latin || ''))),
      h('button', { class: 'iconbtn', 'aria-label': 'Fjern ' + (e.item.titel || e.item.dansk), onclick: async () => { await toggleBookmark(id); drawBm(); } }, ic('x'))))
      : [h('li', { class: 'empty' }, 'Tryk på bogmærket øverst i en guide for at gemme den her.')]));
  };
  drawBm();
  el.append(h('h2', { class: 'subhead' }, 'Bogmærker'), bmList);

  // tjeklister med fremdrift
  const checks = await db.kvGet('checks', {});
  el.append(h('h2', { class: 'subhead' }, 'Tjeklister'), h('ul', { class: 'list' }, c.lists.map((l) => {
    const n = Object.values(checks[l.id] || {}).filter(Boolean).length;
    return row('#/lister/' + l.id, l.titel, n ? `${n} af ${listTotal(l)} afkrydset` : `${listTotal(l)} punkter`, h('span', { class: 'count' }, n ? `${n}/${listTotal(l)}` : ''), 'list');
  })));

  // noter
  const notes = await db.kvGet('notes', []);
  const nl = h('div'); const nt = h('input', { type: 'text', placeholder: 'Titel', 'aria-label': 'Notetitel' }), nx = h('textarea', { placeholder: 'Skriv din note …', 'aria-label': 'Notetekst' });
  const drawN = () => nl.replaceChildren(...notes.map((x, i) => fold(h('span', null, x.title || '(uden titel)', h('small', { class: 'muted' }, ' · ' + fmtDate(x.ts))), [h('p', { style: 'white-space:pre-wrap' }, x.text),
    h('button', { class: 'btn secondary small', onclick: async () => { notes.splice(i, 1); await db.kvSet('notes', notes); drawN(); } }, 'Slet note')], { cls: 'note' })));
  drawN();
  el.append(h('h2', { class: 'subhead' }, 'Noter'), nl, fold('Ny note', [nt, nx, h('div', { class: 'btnrow' }, h('button', { class: 'btn small', onclick: async () => {
    if (!nx.value.trim() && !nt.value.trim()) return;
    notes.unshift({ id: uid(), title: nt.value, text: nx.value, ts: Date.now() }); const ok = await db.kvSet('notes', notes); nt.value = nx.value = ''; drawN(); toast(ok ? 'Note gemt' : 'Kunne ikke gemme permanent');
  } }, 'Gem note'))], { open: !notes.length }));

  // nødkontakter og personlige oplysninger
  const pd = await db.kvGet('persondata', { navn: '', adresse: '', medicin: '', allergi: '', blodtype: '', note: '' });
  const contacts = await db.kvGet('contacts', []);
  const f = (key, label) => { const i = h('input', { type: 'text', value: pd[key] || '', 'aria-label': label, onchange: async () => { pd[key] = i.value; await db.kvSet('persondata', pd); toast('Gemt'); } }); return [h('label', null, label), i]; };
  const cl = h('ul', { class: 'list' });
  const drawC = () => cl.replaceChildren(...contacts.map((c2, i) => h('li', { class: 'withaction' },
    h('a', { href: 'tel:' + c2.phone.replace(/\s/g, '') }, ic('phone', 'ic lead'), h('span', { class: 'rt' }, h('b', null, c2.name), h('small', null, c2.phone + (c2.note ? ' · ' + c2.note : '')))),
    h('button', { class: 'iconbtn', 'aria-label': 'Slet ' + c2.name, onclick: async () => { contacts.splice(i, 1); await db.kvSet('contacts', contacts); drawC(); } }, ic('x')))));
  drawC();
  const n = h('input', { type: 'text', placeholder: 'Navn', 'aria-label': 'Kontaktnavn' }), p = h('input', { type: 'tel', placeholder: 'Telefon', 'aria-label': 'Telefonnummer' }), no = h('input', { type: 'text', placeholder: 'Note (fx relation)', 'aria-label': 'Note' });
  el.append(h('h2', { class: 'subhead' }, 'Nødkontakter'), h('p', { class: 'small muted' }, 'Gemmes kun på denne enhed og vises ikke til nogen.'), cl,
    fold('Tilføj kontakt', [n, p, no, h('div', { class: 'btnrow' }, h('button', { class: 'btn small', onclick: async () => {
      if (!n.value || !p.value) return toast('Udfyld navn og telefon');
      contacts.push({ name: n.value, phone: p.value, note: no.value }); await db.kvSet('contacts', contacts); n.value = p.value = no.value = ''; drawC();
    } }, 'Tilføj kontakt'))]),
    fold('Mine oplysninger (medicin, allergier m.m.)', [...f('navn', 'Navn'), ...f('adresse', 'Adresse / hjemsted'), ...f('medicin', 'Medicin'), ...f('allergi', 'Allergier'), ...f('blodtype', 'Blodtype (valgfrit)')]));
  return el;
}

export async function pageList(id) {
  const l = store.content.lists.find((x) => x.id === id);
  if (!l) return notFound();
  const checks = await db.kvGet('checks', {});
  const st = checks[id] || {};
  const el = h('div', { class: 'tjekliste' });
  const total = listTotal(l);
  const bar = h('i'); const lab = h('span', { class: 'small muted' });
  const upd = () => { const n = Object.values(st).filter(Boolean).length; bar.style.width = (n / total * 100) + '%'; lab.textContent = `${n} af ${total} afkrydset`; };
  el.append(h('h1', null, l.titel));
  if (l.intro) el.append(h('p', { class: 'lede' }, inline(l.intro)));
  el.append(h('div', { class: 'progress' }, bar), lab);
  l.grupper.forEach((g, gi) => {
    el.append(h('h2', { class: 'subhead' }, g.titel));
    g.punkter.forEach((p, pi) => {
      const key = gi + '.' + pi;
      const cb = h('input', { type: 'checkbox', checked: !!st[key], onchange: async () => { st[key] = cb.checked; checks[id] = st; rowEl.classList.toggle('done', cb.checked); upd(); await db.kvSet('checks', checks); } });
      const rowEl = h('label', { class: 'check' + (st[key] ? ' done' : '') }, cb, h('span', null, inline(p)));
      el.append(rowEl);
    });
  });
  el.append(h('div', { class: 'btnrow' }, h('button', { class: 'btn secondary small', onclick: async () => { checks[id] = {}; await db.kvSet('checks', checks); location.reload(); } }, 'Nulstil denne liste')));
  if (l.kilder) el.append(sourcesBox(l.kilder, l.kontrol));
  upd();
  return el;
}
