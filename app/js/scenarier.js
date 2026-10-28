// Logik for scenarier (uden DOM, så den kan enhedstestes): hvilke trin er synlige, og hvor langt er man.
// Et trin med "hvis" vises kun, når spørgsmålet er besvaret med et af de angivne svar.
export const stepKey = (fi, ti) => `${fi}.${ti}`;
export const isVisible = (t, svar) => !t.hvis || (t.hvis.svar || []).includes(svar[t.hvis.spm]);

/** Synlige trin pr. fase: [{ fi, titel, trin: [{ ti, key, t }] }] */
export function visibleSteps(sc, svar = {}) {
  return sc.faser.map((f, fi) => ({ fi, titel: f.titel, trin: f.trin.map((t, ti) => ({ ti, key: stepKey(fi, ti), t })).filter(({ t }) => isVisible(t, svar)) }));
}
/** Fremdrift: { done, total } over synlige handlingstrin (spørgsmål tæller ikke) */
export function progress(sc, state) {
  let done = 0, total = 0;
  for (const f of visibleSteps(sc, state.svar)) for (const { key, t } of f.trin) { if (t.spm) continue; total++; if (state.checks[key]) done++; }
  return { done, total };
}
/** Første fase med noget ugjort (åbnes som standard) */
export function currentPhase(sc, state) {
  const v = visibleSteps(sc, state.svar);
  const i = v.findIndex((f) => f.trin.some(({ key, t }) => (t.spm ? state.svar[t.spm] == null : !state.checks[key])));
  return i < 0 ? v.length - 1 : i;
}
