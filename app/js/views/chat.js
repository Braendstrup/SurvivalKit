// AI-assistent ("Spørg"): svar bygget på håndbogen, med kildelinks og sikkerhedsregler. Samtaler gemmes ikke.
import { h, inline, fmtMB } from '../util.js';
import { routeOf } from '../store.js';
import * as db from '../db.js';
import { ic, toast } from './ui.js';
import * as models from '../ai/models.js';
import { getEngine } from '../ai/engine.js';
import { retrieve, buildPrompt } from '../ai/rag.js';
import { emergency, isSensitive, postprocess, EAT_RULE, NOT_IN_BOOK } from '../ai/safety.js';

const GB = (b) => (b / 1e9).toFixed(1).replace('.', ',') + ' GB';

// Hvilken motor kan bruges nu? { kind, label } eller { kind: null, dev, active }
export async function resolveEngine() {
  if (globalThis.__skFakeAI) return { kind: 'fake', label: 'Testmodel' };
  const [dev, active, pref] = await Promise.all([models.checkDevice(), models.getActive(), db.kvGet('ai.engine', null)]);
  if (dev.builtin === 'available' && (pref !== 'gemma' || !active)) return { kind: 'builtin', label: 'Browserens indbyggede AI', dev };
  if (active && dev.webgpu) return { kind: 'mediapipe', label: active.model.name, dev, active };
  return { kind: null, dev, active };
}

export function pageChat(q0 = '') {
  const el = h('div', { class: 'chat' });
  const head = h('div', { class: 'chathead' });
  const log = h('div', { class: 'chatlog', 'aria-live': 'polite' });
  const inp = h('textarea', { rows: 1, placeholder: 'Stil et spørgsmål til håndbogen …', 'aria-label': 'Spørgsmål', enterkeyhint: 'send' });
  const send = h('button', { class: 'iconbtn send', 'aria-label': 'Send', type: 'submit' }, ic('chevron'));
  const stop = h('button', { class: 'btn secondary small', type: 'button', hidden: true }, 'Stop');
  const form = h('form', { class: 'composer' }, inp, send);
  let wrap;
  el.append(h('h1', { class: 'sr-only' }, 'Spørg AI'), head, log,
    wrap = h('div', { class: 'composer-wrap' }, h('div', { class: 'composer-bar' }, h('p', { class: 'disclaimer' }, ic('alert'), 'AI kan tage fejl. Ved livsfare: ring 112.'), stop,
      h('button', { class: 'btn secondary small', type: 'button', onclick: () => { ctrl?.abort(); log.replaceChildren(); inp.focus(); } }, 'Ny samtale')), form));

  let engineInfo = null, ctrl = null, busy = false;
  const setBusy = (b) => { busy = b; stop.hidden = !b; send.disabled = b; };
  stop.addEventListener('click', () => ctrl?.abort());
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  inp.addEventListener('input', () => { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 160) + 'px'; });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = inp.value.trim(); if (!q || busy) return; inp.value = ''; inp.style.height = ''; ask(q); });

  async function init() {
    engineInfo = await resolveEngine();
    if (!engineInfo.kind) { head.replaceChildren(setupCard(engineInfo, () => init())); wrap.hidden = true; return; }
    wrap.hidden = false;
    head.replaceChildren(h('p', { class: 'enginechip' }, ic('info'), engineInfo.label + ' · offline · ', h('a', { href: '#/indstillinger' }, 'skift')));
    if (q0 && !log.childElementCount) ask(q0); else inp.focus();
  }

  async function ask(q) {
    log.append(h('div', { class: 'msg user' }, q));
    const sources = retrieve(q);
    const sensitive = isSensitive(q, sources);
    if (emergency(q)) {
      const nodGuide = sources.find((s) => s.kap === 'nod' || s.kap === 'foerstehjaelp');
      log.append(h('div', { class: 'ai-112', role: 'alert' }, h('a', { class: 'call', href: 'tel:112' }, ic('phone'), h('b', null, 'Ring 112')),
        h('span', null, 'Ved livsfare: ring først – læs bagefter. ', nodGuide ? h('a', { href: routeOf(nodGuide.type, nodGuide.id) }, nodGuide.title) : h('a', { href: '#/nod' }, 'Gå til Nød'))));
    }
    const body = h('div', { class: 'body' }, h('p', { class: 'muted small thinking' }, 'Slår op i håndbogen …'));
    const bubble = h('div', { class: 'msg ai' }, body);
    log.append(bubble); bubble.scrollIntoView({ block: 'end' });

    if (sensitive && !sources.length) { body.replaceChildren(...renderAnswer({ refused: true, paras: [], cited: [], eatRule: true }, sources)); return; }
    setBusy(true); ctrl = new AbortController();
    let raw = '', stopped = false;
    try {
      const engine = await getEngine(engineInfo.kind, (msg) => body.replaceChildren(h('p', { class: 'muted small thinking' }, msg)));
      body.replaceChildren(h('p', { class: 'muted small thinking' }, sensitive ? 'Skriver svar – kontrolleres mod håndbogen, før det vises …' : 'Skriver …'));
      const live = h('p', { class: 'live' });
      const prompt = buildPrompt(q, sources, sensitive);
      raw = await engine.generate(prompt, (txt) => {
        if (sensitive) return; // følsomme svar vises først efter kontrol
        live.textContent = postprocess(txt, sources, false).paras.map((p) => p.text).join('\n\n') || '…';
        if (!live.isConnected) body.replaceChildren(live);
      }, ctrl.signal);
      stopped = ctrl.signal.aborted;
    } catch (e) {
      if (ctrl.signal.aborted) stopped = true;
      else { body.replaceChildren(h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, ic('alert'), 'AI-assistenten fejlede'), h('p', null, e.message || String(e)), h('p', { class: 'small' }, 'Hvis telefonen har for lidt hukommelse, så prøv den lettere model (Gemma 4 E2B) under Indstillinger.')), ...[sourceList(sources, [], 'Fundet i håndbogen')].filter(Boolean)); setBusy(false); return; }
    }
    setBusy(false);
    const res = postprocess(raw, sources, sensitive, q);
    if (stopped && !raw.trim()) { body.replaceChildren(...[h('p', { class: 'muted small' }, 'Stoppet.'), sourceList(sources, [], 'Fundet i håndbogen')].filter(Boolean)); return; }
    body.replaceChildren(...renderAnswer(res, sources), ...(stopped ? [h('p', { class: 'muted small' }, '(Stoppet – svaret er ufuldstændigt.)')] : []));
    bubble.scrollIntoView({ block: 'nearest' });
  }

  init();
  return el;
}

function renderPara(text, sources) {
  const p = h('p');
  for (const seg of text.split(/(\[\d+\])/)) {
    const m = seg.match(/^\[(\d+)\]$/);
    if (m) { const s = sources[+m[1] - 1]; if (s) p.append(h('a', { class: 'cite', href: routeOf(s.type, s.id), title: s.title }, m[1])); }
    else p.append(inline(seg));
  }
  return p;
}
function sourceList(sources, cited, label) {
  const list = cited.length ? cited.map((i) => sources[i]) : sources;
  if (!list.length) return null;
  return h('div', { class: 'sources' }, h('span', { class: 'small muted' }, cited.length ? 'Bygger på:' : label),
    h('ul', null, list.map((s) => h('li', null, h('a', { href: routeOf(s.type, s.id) }, (cited.length ? `[${sources.indexOf(s) + 1}] ` : '') + s.title)))));
}
function renderAnswer(res, sources) {
  const out = [];
  if (res.refused) out.push(h('div', { class: 'callout warn refused' }, h('span', { class: 'ctitle' }, ic('alert'), 'Ikke i håndbogen'), h('p', null, NOT_IN_BOOK)));
  else {
    const own = res.paras.filter((p) => p.own), book = res.paras.filter((p) => !p.own);
    out.push(...book.map((p) => renderPara(p.text, sources)));
    if (own.length) out.push(h('div', { class: 'ownknowledge' }, h('span', { class: 'ctitle' }, ic('alert'), 'Ikke fra håndbogen – ikke verificeret'), ...own.map((p) => renderPara(p.text, sources))));
  }
  if (res.eatRule) out.push(h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, ic('alert'), 'Husk'), h('p', null, EAT_RULE)));
  out.push(sourceList(sources, res.refused ? [] : res.cited, res.refused ? 'Relevante guides:' : 'Fundet i håndbogen:'));
  return out.filter(Boolean);
}

// ---- opsætning: vælg og hent model --------------------------------------------------------------------------------
function setupCard(info, onReady) {
  const { dev } = info;
  const box = h('div', { class: 'setup' }, h('h2', null, 'AI-assistent'),
    h('p', null, 'Stil spørgsmål i almindeligt sprog og få et kort svar bygget på håndbogens guides – også uden net. Kræver en sprogmodel på telefonen (hentes én gang over wifi).'));
  if (info.active && !dev.webgpu) {
    box.append(h('div', { class: 'callout warn' }, h('span', { class: 'ctitle' }, ic('alert'), 'Browseren kan ikke køre modellen lige nu'), h('p', null, 'Modellen er hentet, men browseren giver ikke adgang til grafikprocessoren (WebGPU). Prøv en opdateret Chrome eller Edge.')));
    return box;
  }
  if (!dev.webgpu || !dev.opfs) {
    box.append(h('div', { class: 'callout info' }, h('span', { class: 'ctitle' }, ic('info'), 'Denne enhed kan ikke køre AI-assistenten'),
      h('p', null, !dev.webgpu ? 'Browseren understøtter ikke WebGPU, som sprogmodellen kræver. Det gælder fx mange ældre telefoner og nogle browsere. Prøv en opdateret Chrome på Android.' : 'Browseren mangler fillager (OPFS) til modellen.'),
      h('p', null, 'Søgning i håndbogen virker som normalt: ', h('a', { href: '#/sog' }, 'Søg'), '.')));
    return box;
  }
  const status = h('div');
  const list = h('ul', { class: 'list models' });
  box.append(list, status, h('p', { class: 'small muted' }, 'Modellerne er Googles Gemma 4 (Apache 2.0) og hentes fra Hugging Face. Filen kontrolleres med SHA-256 og gemmes kun på denne enhed. Der sendes ingen spørgsmål ud af telefonen.'));
  (async () => {
    for (const m of models.CATALOG) {
      const part = await models.partialSize(m);
      const rec = m.id === dev.recommended;
      const fits = models.fitsStorage(m, dev.free != null ? dev.free + part : null);
      const btn = h('button', { class: rec ? 'btn' : 'btn secondary', disabled: !fits, onclick: () => start(m) }, ic('down'), part ? `Genoptag (${GB(part)} af ${GB(m.size)})` : `Hent ${GB(m.size)}`);
      list.append(h('li', { class: 'model' }, h('div', { class: 'rt' }, h('b', null, m.name, rec ? h('span', { class: 'badge ok' }, 'Anbefalet') : null), h('small', null, m.note),
        !fits ? h('small', { class: 'warntext' }, `Kræver ca. ${GB(m.size * 1.3)} ledig plads (ledig: ${dev.free != null ? GB(dev.free) : 'ukendt'}).`) : null), btn));
    }
  })();
  let ctrl = null;
  async function start(m) {
    ctrl = new AbortController();
    const bar = h('i'), lab = h('span', { class: 'small muted' }, 'Starter …');
    status.replaceChildren(h('div', { class: 'progress' }, bar), lab, h('div', { class: 'btnrow' }, h('button', { class: 'btn secondary small', onclick: () => ctrl.abort() }, 'Afbryd')));
    list.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    try {
      await models.downloadModel(m.id, (p) => {
        bar.style.width = (p.done / p.total * 100).toFixed(1) + '%';
        lab.textContent = p.phase === 'runtime' ? 'Henter AI-programfiler …' : p.phase === 'download' ? `Henter ${m.name}: ${fmtMB(p.done)} af ${fmtMB(p.total)}` : p.phase === 'verify' ? `Kontrollerer filen (SHA-256): ${Math.round(p.done / p.total * 100)} %` : 'Klar';
      }, ctrl.signal);
      toast(m.name + ' er hentet og klar – virker nu uden net');
      onReady();
    } catch (e) {
      status.replaceChildren(h('div', { class: 'callout ' + (e.code === 'AFBRUDT' ? 'info' : 'danger') }, h('span', { class: 'ctitle' }, ic('alert'), e.code === 'AFBRUDT' ? 'Afbrudt' : 'Hentning mislykkedes'), h('p', null, e.message),
        h('div', { class: 'btnrow' }, h('button', { class: 'btn small', onclick: () => start(m) }, 'Genoptag'))));
      list.querySelectorAll('button').forEach((b) => { b.disabled = false; });
    }
  }
  return box;
}

// ---- indstillinger: status og håndtering -------------------------------------------------------------------------
export async function aiSettingsCard() {
  const box = h('div', { class: 'card' });
  const [dev, active, pref] = await Promise.all([models.checkDevice(), models.getActive(), db.kvGet('ai.engine', null)]);
  const stat = (l, v) => h('div', { class: 'stat' }, h('span', null, l), h('strong', null, v));
  box.append(stat('Hentet model', active ? `${active.model.name} (${GB(active.model.size)})` : 'Ingen'),
    stat('Browserens indbyggede AI', dev.builtin === 'available' ? 'Fundet' : dev.builtin === 'downloadable' || dev.builtin === 'downloading' ? 'Kan hentes af browseren' : 'Ikke tilgængelig'),
    stat('WebGPU (kræves af Gemma)', dev.webgpu ? 'Ja' : 'Nej'));
  if (dev.builtin === 'available' && active) box.append(h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: pref === 'gemma', onchange: async (e) => { await db.kvSet('ai.engine', e.target.checked ? 'gemma' : 'builtin'); toast('Gemt'); } }), h('span', null, `Brug ${active.model.name} i stedet for browserens indbyggede AI`)));
  box.append(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/spoerg' }, 'Åbn AI-assistent'),
    active ? h('button', { class: 'btn secondary', onclick: async () => { if (!confirm(`Slet ${active.model.name} (${GB(active.model.size)}) fra enheden?`)) return; await models.removeModel(); toast('Modellen er slettet'); location.reload(); } }, 'Slet model') : null));
  return box;
}
