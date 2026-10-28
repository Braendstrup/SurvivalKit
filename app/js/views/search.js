// Søgning i hele håndbogen (offline), grupperet efter type.
import { h } from '../util.js';
import { store, search, routeOf } from '../store.js';
import { row } from './ui.js';

const GROUPS = [['s', 'Scenarier'], ['g', 'Guides'], ['kap', 'Kapitler'], ['a', 'Arter'], ['l', 'Tjeklister']];

export function pageSearch(q = '') {
  const el = h('div', { class: 'searchpage' });
  const inp = h('input', { type: 'search', value: q, placeholder: 'Søg eller stil et spørgsmål', 'aria-label': 'Søg', enterkeyhint: 'search' });
  const out = h('div');
  const draw = () => {
    const term = inp.value.trim();
    if (!term) {
      out.replaceChildren(h('p', { class: 'muted small' }, 'Virker uden net. Prøv fx: kogning, hugorm, pælestik, kompas, hypotermi.'),
        h('div', { class: 'chips' }, store.content.temaer.map((t) => h('a', { class: 'chip', href: '#/tema/' + t.id }, t.titel))));
      history.replaceState(history.state, '', '#/sog');
      return;
    }
    const r = search(term);
    const askRow = h('ul', { class: 'list askai' }, row('#/spoerg?q=' + encodeURIComponent(term), `Spørg AI: "${term}"`, 'Kort svar bygget på håndbogen – virker offline med en hentet model', null, 'chat'));
    history.replaceState(history.state, '', '#/sog?q=' + encodeURIComponent(term));
    const parts = [askRow, h('p', { class: 'muted small' }, r.length ? `${r.length} resultater` : 'Ingen resultater')];
    for (const [type, label] of GROUPS) {
      const hits = r.filter((x) => x.type === type);
      if (!hits.length) continue;
      parts.push(h('h2', { class: 'subhead' }, label), h('ul', { class: 'list' }, hits.map((x) => row(routeOf(x.type, x.id) + (x.type === 'g' ? '?q=' + encodeURIComponent(term) : ''), x.title, x.sub))));
    }
    out.replaceChildren(...parts);
  };
  inp.addEventListener('input', draw);
  el.append(h('h1', { class: 'sr-only' }, 'Søg'), h('div', { class: 'sticky-search' }, inp), out);
  draw();
  el.afterMount = () => { if (!q) inp.focus(); };
  return el;
}
