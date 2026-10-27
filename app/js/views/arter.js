// Artsguide: liste med filtre og artssider.
import { h, inline } from '../util.js';
import { store } from '../store.js';
import { kontrolBadge, sourcesBox, notFound, row } from './ui.js';

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
      h('ul', { class: 'list' }, items.map((s) => row('#/a/' + s.id, s.dansk, s.latin + ' · ' + (s.naturtyper || []).join(', '), h('span', { class: 'species-status ' + KAT[s.kategori][1] }, shortKat(s.kategori))))));
  };
  for (const x of [q, nat, kat, mnd]) x.addEventListener('input', draw);
  el.append(h('div', { class: 'sticky-search' }, q, h('div', { class: 'filters' }, nat, kat, mnd)), out);
  draw();
  return el;
}
const shortKat = (k) => ({ standard: 'Spiselig', forsigtighed: 'Forsigtig', undgaa: 'Undgå', giftig: 'GIFTIG', ikke: 'Uverificeret' }[k]);

export function pageArt(id) {
  const c = store.content, s = c.species.find((x) => x.id === id);
  if (!s) return notFound();
  const el = h('article', { class: 'guide' });
  const [katLabel, katCls] = KAT[s.kategori];
  el.append(h('h1', null, s.dansk), h('p', null, h('em', null, s.latin), ' · ', s.familie),
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
