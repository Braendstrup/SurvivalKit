// Scenarie-side: faser med afkrydsning og forgreninger. Fremdrift gemmes lokalt (kv: scn.<id>).
import { h, inline } from '../util.js';
import { store, routeOf } from '../store.js';
import * as db from '../db.js';
import { ic, kontrolBadge, sourcesBody, fold, notFound, linkItem } from './ui.js';
import { visibleSteps, progress, currentPhase } from '../scenarier.js';

export async function pageScenarie(id) {
  const sc = (store.content.scenarier || []).find((x) => x.id === id);
  if (!sc) return notFound();
  const key = 'scn.' + id;
  const state = Object.assign({ checks: {}, svar: {} }, await db.kvGet(key, {}));
  const save = () => db.kvSet(key, state);
  const el = h('article', { class: 'guide scenarie' });
  const prog = h('span', { class: 'badge neutral' });
  const body = h('div');
  const reset = h('button', { class: 'btn secondary small', onclick: async () => { if (!confirm('Start scenariet forfra? Afkrydsninger og svar nulstilles.')) return; state.checks = {}; state.svar = {}; await save(); draw(true); } }, 'Start forfra');
  el.append(h('h1', null, sc.titel), h('p', { class: 'lede' }, inline(sc.resume)), h('div', { class: 'meta' }, kontrolBadge(sc.kontrol), prog, reset), body);

  const linkOf = (id2) => { const e = store.byId.get(id2); return e ? h('a', { class: 'steplink', href: routeOf(e.type, id2) }, (e.type === 's' ? 'Scenarie: ' : e.type === 'l' ? 'Tjekliste: ' : 'Guide: ') + (e.item.titel || e.item.dansk), ' ›') : null; };
  let openSet = null;
  function draw(resetOpen = false) {
    const phases = visibleSteps(sc, state.svar);
    if (!openSet || resetOpen) openSet = new Set([currentPhase(sc, state)]);
    const p = progress(sc, state); prog.textContent = `${p.done} af ${p.total} trin`;
    body.replaceChildren(...phases.map((f) => {
      const n = f.trin.filter(({ t }) => !t.spm).length, d = f.trin.filter(({ key: k, t }) => !t.spm && state.checks[k]).length;
      const det = h('details', { class: 'fold gsec phase', open: openSet.has(f.fi) },
        h('summary', null, h('h2', null, f.titel), h('span', { class: 'count' }, `${d}/${n}`), ic('chevron', 'ic chev')),
        h('div', { class: 'fold-body' }, f.trin.map(({ key: k, t }) => (t.spm ? question(t) : step(k, t)))));
      det.addEventListener('toggle', () => { if (det.open) openSet.add(f.fi); else openSet.delete(f.fi); });
      return det;
    }));
  }
  function question(t) {
    const cur = state.svar[t.spm];
    return h('div', { class: 'scnq', role: 'group', 'aria-label': t.tekst }, h('p', null, h('b', null, t.tekst)),
      h('div', { class: 'chips' }, t.svar.map((a) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(cur === a.id), onclick: async () => { state.svar[t.spm] = a.id; await save(); draw(); } }, a.tekst))),
      cur == null ? h('p', { class: 'small muted' }, 'Vælg et svar for at se de trin, der passer.') : null);
  }
  function step(k, t) {
    const cb = h('input', { type: 'checkbox', checked: !!state.checks[k], onchange: async () => { state.checks[k] = cb.checked; row.classList.toggle('done', cb.checked); await save(); const p = progress(sc, state); prog.textContent = `${p.done} af ${p.total} trin`; } });
    const call = t.alarm && /\b112\b/.test(t.x) ? h('a', { class: 'call112 mini', href: 'tel:112' }, ic('phone'), 'Ring 112') : null;
    const row = h('div', { class: 'scnstep' + (state.checks[k] ? ' done' : '') + (t.alarm ? ' alarm' : '') },
      h('label', { class: 'check' }, cb, h('span', null, inline(t.x + ' {' + t.ev + '}'))),
      (t.link || call) ? h('div', { class: 'stepextra' }, call, t.link ? linkOf(t.link) : null) : null);
    return row;
  }
  draw();
  const nSrc = (sc.kilder || []).length;
  el.append(fold(`Kilder og evidens (${nSrc})`, [h('p', { class: 'small' }, inline('Mærker: {D} understøttet af navngiven kilde. {T} praktisk tommelfingerregel. {F} kræver faglig vurdering.')), ...sourcesBody(sc.kilder, sc.kontrol)], { cls: 'sources' }));
  const rel = [...new Set(sc.faser.flatMap((f) => f.trin.map((t) => t.link).filter(Boolean)))].map(linkItem).filter(Boolean);
  if (rel.length) el.append(h('h2', { class: 'subhead' }, 'Se også'), h('ul', { class: 'list' }, rel));
  return el;
}

export const scenarieRow = (sc) => h('li', null, h('a', { class: 'nodrow scn', href: '#/scenarie/' + sc.id }, ic(sc.ikon || 'alert', 'ic lead'), h('span', { class: 'rt' }, h('b', null, sc.titel), h('small', null, sc.resume)), ic('chevron', 'ic chev')));
