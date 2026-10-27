// Hjælpere til at skrive indhold. Se tools/build.mjs for validering.
export const DATO = '2026-10-26'; // dato for kildekontrollen i denne udgave

export const P = (x) => ({ t: 'p', x });
export const H = (x, l = 3) => ({ t: 'h', x, l });
export const UL = (...items) => ({ t: 'ul', items: items.flat() });
export const OL = (...items) => ({ t: 'ol', items: items.flat() });
export const STEPS = (...items) => ({ t: 'steps', items: items.flat() });
export const INFO = (x, title) => ({ t: 'callout', k: 'info', x, title });
export const WARN = (x, title) => ({ t: 'callout', k: 'warn', x, title });
export const DANGER = (x, title) => ({ t: 'callout', k: 'danger', x, title });
export const ACT = (x, title) => ({ t: 'callout', k: 'act', x, title });
export const CL = (k, title, ...items) => ({ t: 'callout', k, title, items: items.flat() });
export const C112 = (x) => ({ t: 'call112', x });
export const FIG = (id, cap) => ({ t: 'fig', id, cap });
export const FIGS = (...ids) => ({ t: 'figs', ids });
export const TABLE = (head, rows) => ({ t: 'table', head, rows });
export const KV = (...rows) => ({ t: 'kv', rows });
export const DET = (title, ...blokke) => ({ t: 'details', title, blokke: blokke.flat() });
export const SEC = (x) => ({ t: 'sec', x });

const asBlocks = (v, listType = 'ul') => {
  if (v == null) return [];
  if (typeof v === 'string') return [P(v)];
  if (Array.isArray(v)) {
    if (v.length && typeof v[0] === 'object') return v;
    return [{ t: listType, items: v }];
  }
  return [v];
};

/**
 * Praktisk guide med fast struktur (Formål, Hvornår, Udstyr, Fremgangsmåde, Sådan kontrollerer du resultatet, Typiske fejl,
 * Sikkerhed, Danske forhold, Alternativ løsning). Ekstra blokke kan indsættes før/efter trin via `foer` og `efter`.
 */
export function praktisk(o) {
  const blokke = [];
  if (o.advarsel) blokke.push(...asBlocks(o.advarsel));
  if (o.foer) blokke.push(...asBlocks(o.foer));
  blokke.push(SEC('Formål'), ...asBlocks(o.formaal));
  blokke.push(SEC('Hvornår'), ...asBlocks(o.hvornaar));
  blokke.push(SEC('Udstyr'), ...asBlocks(o.udstyr));
  blokke.push(SEC('Fremgangsmåde'));
  if (o.fig) blokke.push(...(Array.isArray(o.fig) ? [FIGS(...o.fig)] : [FIG(o.fig)]));
  blokke.push(...(Array.isArray(o.trin) && typeof o.trin[0] === 'string' ? [STEPS(o.trin)] : asBlocks(o.trin)));
  if (o.efter) blokke.push(...asBlocks(o.efter));
  blokke.push(SEC('Sådan kontrollerer du resultatet'), ...asBlocks(o.kontrolTjek));
  blokke.push(SEC('Typiske fejl'), ...asBlocks(o.fejl));
  blokke.push(SEC('Sikkerhed'), ...asBlocks(o.sikkerhed));
  blokke.push(SEC('Danske forhold'), ...asBlocks(o.dansk));
  blokke.push(SEC('Alternativ løsning'), ...asBlocks(o.alternativ));
  const { formaal, hvornaar, udstyr, trin, kontrolTjek, fejl, sikkerhed, dansk, alternativ, advarsel, foer, efter, fig, ...rest } = o;
  return { type: 'praktisk', niveau: 'gr', ...rest, blokke };
}

/** Informationsguide (opslag/forklaring) uden fast sektionsstruktur. */
export function info(o) {
  const { blokke, ...rest } = o;
  return { type: 'info', niveau: 'gr', ...rest, blokke };
}

export const K = {
  ok: (note) => ({ status: 'kontrolleret', dato: DATO, note }),
  delvist: (note) => ({ status: 'delvist', dato: DATO, note }),
  ikke: (note) => ({ status: 'ikke', dato: null, note: note || 'Skrevet ud fra almen faglig viden; endnu ikke kontrolleret mod en navngiven kilde.' }),
};
