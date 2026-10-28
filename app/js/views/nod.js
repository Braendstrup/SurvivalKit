// Nød-siden: de 8 situationer først, derefter "Ring 112 hvis", nødprocedure og andre numre.
import { h, inline } from '../util.js';
import { store } from '../store.js';
import { ic, fold } from './ui.js';
import { renderBlocks } from './guide.js';
import { scenarieRow } from './scenarie.js';

const RING_HVIS = [
  'nogen er bevidstløs eller ikke trækker vejret normalt', 'der er kraftig blødning, der ikke standser', 'der er mistanke om brud, rygskade eller hovedskade',
  'nogen har hugormebid, alvorlig allergisk reaktion eller åndedrætsbesvær', 'nogen er kraftigt nedkølet, forvirret eller meget overophedet',
  'nogen er forsvundet, savnet eller i fare i vand, mørke eller dårligt vejr', 'der er brand, kulilte-mistanke eller andre livstruende forhold'];

export function pageNod() {
  const el = h('div', { class: 'nod' });
  el.append(h('h1', null, 'Nød'), h('p', { class: 'lede' }, 'Vælg det, der passer bedst. Ved livsfare: ring 112 først (knappen øverst).'));
  el.append(h('h2', { class: 'subhead' }, 'Akut'));
  el.append(h('ul', { class: 'nodlist' }, store.content.nodmenu.map((n) =>
    h('li', null, h('a', { class: 'nodrow', href: '#/g/' + n.guide }, ic(n.ikon, 'ic lead'), h('span', { class: 'rt' }, h('b', null, n.titel), h('small', null, n.tekst)), ic('chevron', 'ic chev'))))));
  el.append(h('h2', { class: 'subhead' }, 'Kriser og hændelser'), h('ul', { class: 'nodlist' }, (store.content.scenarier || []).map(scenarieRow)));
  el.append(fold('Ring 112 hvis …', h('ul', null, RING_HVIS.map((t) => h('li', null, t))), { open: true, cls: 'danger', warn: true }));
  const g = store.byId.get('nod-1min')?.item;
  if (g) el.append(fold('Nødprocedure på under ét minut', renderBlocks(g.blokke)));
  el.append(fold('Andre numre', h('p', null, inline('Politiets servicenummer **114** · Lægevagt/akuttelefon **1813** (Region Hovedstaden; øvrige regioner: se [[dansk-numre]]) · Giftlinjen **82 12 12 12** (døgnåben). Kilde: Beredskabsstyrelsen.'))));
  return el;
}
