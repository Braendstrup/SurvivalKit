// Sikkerhedsregler for AI-assistenten. Håndhæves af appen – uafhængigt af, hvad modellen svarer.
import { foldText } from '../store.js';

// Nødord: viser altid 112-boksen, før modellen kaldes (foldet tekst: æ→ae, ø→o, å→aa)
const EMERGENCY = [/bevidstlo/, /traekker ikke vejret|ingen vejrtraek|vejrtraekning|kan ikke traekke vejret|aandenod|aandedraetsbesvaer/, /hjertestop|genopliv|\bhlr\b|hjertemassage|hjertestarter/,
  /blod(er|ning|te|ende)|pulsaar/, /hugorm|slangebid|bidt af en slange/, /forgift|giftig.*(spist|drukket|slugt)|(spist|drukket|slugt).*giftig/, /braekke|braekket|\bbrud\b|rygskade|hovedskade|nakkeskade/,
  /hypotermi|nedkol|forfrys|hedeslag|underafkol/, /drukn|faldet i vandet|gennem isen/, /\bbrand\b|braender|forbraend|kulilte|rogforgift/, /anafylak|allergisk reaktion|haevede laeber|haevet tunge/,
  /kramper|slagtilfaelde|blodprop|besvim|livsfare|livstruende|\b112\b/];
export function emergency(q) { const f = foldText(q); return EMERGENCY.some((r) => r.test(f)); }

// Følsomme emner: førstehjælp/nød (efter kapitel) og spiselighed/giftighed (efter ord eller artskilder)
const EAT = /\bspis|spiselig|\bsmage|svamp|\bbaer|giftig|\bplante|\burt(er)?\b|\brod(der)?\b|\bfrugt|\bnodder|forvekslin/;
export const isEatQuestion = (q) => EAT.test(foldText(q));
export function isSensitive(q, sources) {
  return emergency(q) || isEatQuestion(q) || sources.some((s) => s.type === 'a' || s.kap === 'nod' || s.kap === 'foerstehjaelp' || s.kap === 'arter' || s.kap === 'mad');
}

export const EAT_RULE = 'Spis kun planter, bær og svampe, du kender 100 % – og kun hvis artsguiden angiver dem som spiselige. Billeder og AI kan ikke garantere sikker bestemmelse.';
export const NOT_IN_BOOK = 'Det står ikke i håndbogen, og emnet er for vigtigt til at gætte. Læs de relevante guides nedenfor, eller spørg en fagperson. Ved livsfare: ring 112.';

// Efterbehandling: fjern modeltokens, find kildehenvisninger, adskil egen viden, afvis usikre svar på følsomme emner.
// Resultat: { refused, paras: [{ text, own }], cited: [kildeindeks], eatRule }
export function postprocess(raw, sources, sensitive, q = '') {
  let text = String(raw || '').replace(/<\|?turn\|?>|<turn\|>|<end_of_turn>|<start_of_turn>(model|user)?|<eos>|<bos>/g, '').replace(/^\s*model\s*\n/, '').trim();
  const eatRule = isEatQuestion(q) || sources.some((s) => s.type === 'a');
  const ownMarked = /\[\s*egen viden\s*\]/i.test(text), notInBook = /\[\s*ikke i håndbogen\s*\]/i.test(text);
  if (sensitive && (!sources.length || ownMarked || notInBook || !text)) return { refused: true, paras: [], cited: [], eatRule };
  if (!text || (notInBook && !text.replace(/\[\s*ikke i håndbogen\s*\]/gi, '').trim())) return { refused: true, paras: [], cited: [], eatRule };
  text = text.replace(/\[\s*ikke i håndbogen\s*\]/gi, '').trim();
  const cited = new Set();
  // [1], [1, 2], [1][2]: behold kun gyldige numre
  text = text.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_, list) => {
    const ok = list.split(',').map((n) => +n.trim()).filter((n) => n >= 1 && n <= sources.length);
    ok.forEach((n) => cited.add(n - 1));
    return ok.map((n) => `[${n}]`).join('');
  });
  // egen viden: fra markøren og resten af afsnittet/teksten
  const paras = [];
  let own = false;
  for (const p of text.split(/\n\s*\n/)) {
    const m = p.match(/\[\s*egen viden\s*\]/i);
    if (m) {
      const before = p.slice(0, m.index).trim(), after = p.slice(m.index + m[0].length).replace(/^[\s:–-]+/, '').trim();
      if (before) paras.push({ text: before, own });
      own = true;
      if (after) paras.push({ text: after, own: true });
    } else if (p.trim()) paras.push({ text: p.trim(), own });
  }
  return { refused: false, paras, cited: [...cited].sort((a, b) => a - b), eatRule };
}
