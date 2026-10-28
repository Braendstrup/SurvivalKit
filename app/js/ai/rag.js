// Håndbogsopslag til AI-assistenten: find de mest relevante guides/arter og byg en kort kontekst + prompt.
// Søgningen er bevidst "eller"-baseret (naturlige spørgsmål har mange ord, som ikke alle står i samme guide).
import { store, tokens, blockText } from '../store.js';

const STOP = new Set('og i at det en den til er som paa med for af ikke der har jeg du vi kan skal man de hvad hvor hvordan hvornaar hvis eller om fra saa naar min mit mine din dit dine sig sin sit vil ville kunne skulle bliver blive vaere var et nogen noget meget mere mest godt bedst lige ogsaa kun bare nu her der hvilken hvilke hvem hvorfor gor gore lave faa faar tage tager hjaelp hjaelpe brug bruge'.split(' '));
const plain = (t) => String(t || '').replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, id, l) => l || id).replace(/\*\*?/g, '').replace(/\{[DTF]\}/g, '').replace(/\s+/g, ' ').trim();

// Let dansk ordstamme (bøjningsendelser), så "bløder" finder "blødning" – uden at "armen" matcher "varmen"
export const stem = (t) => { const r = t.replace(/(erne|ende|ning|ninger|ede|ene|er|en|et|ne|te|de|e|s)$/, ''); return r.length >= 3 && t.length >= 4 ? r : t; };
export function queryTokens(q) { return [...new Set(tokens(q).filter((t) => !STOP.has(t)))]; }

// Rangér guides og arter efter summen af matchende ord (titel/tags vægter mest)
export function retrieve(q, k = 4) {
  const qt = queryTokens(q);
  if (!qt.length) return [];
  const scored = [];
  for (const d of store.index) {
    if (d.type !== 'g' && d.type !== 'a' && d.type !== 's') continue;
    let score = 0, hits = 0;
    for (const t of qt) {
      let best = 0; const st = stem(t);
      for (const [tok, w] of d.tok) {
        if (tok === t) best = Math.max(best, w * 3);
        else if (t.length > 3 && tok.startsWith(t)) best = Math.max(best, w * 2);
        else if (st.length >= 3 && st !== t && tok.startsWith(st)) best = Math.max(best, w * 1.5);
        else if (tok.length > 4 && t.startsWith(tok)) best = Math.max(best, w);
      }
      if (best) { score += best; hits++; }
    }
    if (hits) scored.push({ type: d.type, id: d.id, score: score * (hits / qt.length) });
  }
  scored.sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const top = scored[0].score;
  // kun kilder, der er nogenlunde lige så relevante som den bedste
  return scored.filter((s) => s.score >= top * 0.25).slice(0, k).map((s) => {
    const e = store.byId.get(s.id);
    return { type: s.type, id: s.id, title: e.item.titel || e.item.dansk, kap: e.item.kap || (s.type === 'a' ? 'arter' : null), item: e.item, score: s.score };
  });
}

// Uddrag af én kilde inden for et tegnbudget: resumé + de afsnit, der indeholder søgeord (ellers handling/sikkerhed)
export function excerpt(src, qt, budget = 1500) {
  const it = src.item;
  if (src.type === 's') return cut([it.resume, ...it.faser.map((f) => f.titel + ': ' + f.trin.map((t) => plain(t.x || t.tekst)).join(' '))].map(plain).join(' '), budget);
  if (src.type === 'a') {
    const parts = [`${it.dansk} (${it.latin}). Kategori: ${it.kategoriLabel || it.kategori}.`, it.advarsel, it.kendetegn && 'Kendetegn: ' + it.kendetegn, it.dele && 'Spiselige dele: ' + it.dele, it.sikkerhed && 'Sikkerhed: ' + it.sikkerhed,
      (it.forvekslinger || []).length && 'Forvekslinger: ' + it.forvekslinger.map((f) => `${f.navn} (${plain(f.fare)})`).join('; '), it.farligeDobbelt];
    return cut(parts.filter(Boolean).map(plain).join(' '), budget);
  }
  const secs = []; let cur = { title: '', blokke: [] };
  for (const b of it.blokke || []) { if (b.t === 'sec' || (b.t === 'h' && (b.l || 2) === 2)) { secs.push(cur); cur = { title: b.x, blokke: [] }; } else cur.blokke.push(b); }
  secs.push(cur);
  const scoreSec = (s) => { const txt = tokens(s.title + ' ' + blockText(s.blokke).join(' ')); return qt.reduce((n, t) => n + txt.filter((x) => x.startsWith(t)).length, 0); };
  const pref = (s) => /^(Fremgangsmåde|Sikkerhed|Sådan binder)/.test(s.title) ? 0.5 : 0;
  const ranked = secs.filter((s) => s.blokke.length).map((s) => ({ s, v: scoreSec(s) + pref(s) })).sort((a, b) => b.v - a.v);
  let out = it.resume ? plain(it.resume) + ' ' : '';
  for (const { s } of ranked) {
    const t = (s.title ? s.title + ': ' : '') + plain(blockText(s.blokke).join(' '));
    if (out.length + t.length > budget) { out += ' ' + t; break; }
    out += ' ' + t;
  }
  return cut(out.trim(), budget);
}
const cut = (t, n) => t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, '') + ' …';

const SYSTEM = (sensitive) => [
  'Du er hjælper i "Survivalkit", en dansk feltmanual til natur og kriser. Svar på dansk, kort og konkret (højst ca. 120 ord), gerne som korte punkter.',
  'Brug først og fremmest teksten fra HÅNDBOGEN nedenfor. Henvis til kilden med [1], [2] osv. efter de sætninger, der bygger på den.',
  sensitive
    ? 'Dette emne er sikkerhedskritisk (førstehjælp, nød, giftige eller spiselige planter og svampe). Du må KUN bruge håndbogens tekst. Står svaret ikke i håndbogen, så svar præcis: [ikke i håndbogen]'
    : 'Hvis du tilføjer noget, der ikke står i håndbogen, så skriv det i et separat afsnit, der starter med [egen viden].',
  'Opfind aldrig tal, doseringer, regler eller artsbestemmelser. Ved livsfare: skriv at man skal ringe 112.',
].join('\n');

export const PROMPT_BUDGET = 6000; // tegn kontekst (≈ 2.000 tokens)
export function buildPrompt(q, sources, sensitive) {
  const qt = queryTokens(q);
  const per = Math.floor(PROMPT_BUDGET / Math.max(1, sources.length));
  const ctx = sources.map((s, i) => `[${i + 1}] ${s.title}\n${excerpt(s, qt, per - s.title.length - 8)}`).join('\n\n');
  const system = SYSTEM(sensitive);
  const user = `HÅNDBOGEN:\n${ctx || '(ingen relevante afsnit fundet)'}\n\nSPØRGSMÅL: ${q.trim()}`;
  return { system, user, text: `<|turn>system\n${system}<turn|>\n<|turn>user\n${user}<turn|>\n<|turn>model\n` };
}
