// Enhedstests af scenarier: forgreningslogik, fremdrift og indholdsregler (efter build).
import { readFileSync } from 'node:fs';
import { visibleSteps, progress, currentPhase, isVisible } from '../app/js/scenarier.js';
const c = JSON.parse(readFileSync(new URL('../app/data/content.json', import.meta.url)));
let fail = 0, n = 0;
const ok = (cond, m) => { n++; if (!cond) { fail++; console.log('FEJL', m); } };
const texts = (sc, svar) => visibleSteps(sc, svar).flatMap((f) => f.trin.map(({ t }) => t.x || t.tekst));

ok(c.scenarier.length === 8, 'antal scenarier: ' + c.scenarier.length);
const st = c.scenarier.find((s) => s.id === 'scn-stroem');
// forgrening: før svar skjules betingede trin; svar styrer hvilke der vises
const none = texts(st, {}), hus = texts(st, { omfang: 'hus' }), omr = texts(st, { omfang: 'omraade' });
ok(!none.some((x) => /HPFI-relæet til igen/.test(x)) && !none.some((x) => /DR P4/.test(x)), 'betingede trin skjult før svar');
ok(hus.some((x) => /HPFI-relæet til igen/.test(x)) && !hus.some((x) => /DR P4/.test(x)), 'svar "kun hos mig" viser HPFI, ikke DR P4');
ok(omr.some((x) => /DR P4/.test(x)) && !omr.some((x) => /HPFI-relæet til igen/.test(x)), 'svar "hele området" viser DR P4, ikke HPFI');
ok(none.some((x) => /Åbn ikke køleskab og fryser/.test(x)), 'ubetingede trin vises altid');
ok(isVisible({ hvis: { spm: 'a', svar: ['x', 'y'] } }, { a: 'y' }) && !isVisible({ hvis: { spm: 'a', svar: ['x'] } }, {}), 'isVisible');
// fremdrift og aktuel fase
const p0 = progress(st, { checks: {}, svar: {} });
ok(p0.done === 0 && p0.total > 10, 'fremdrift 0 af ' + p0.total);
const all = {}; for (const f of visibleSteps(st, { omfang: 'hus' })) for (const { key, t } of f.trin) if (!t.spm && f.fi === 0) all[key] = true;
ok(currentPhase(st, { checks: all, svar: { omfang: 'hus' } }) === 1, 'aktuel fase skifter, når fase 1 er færdig');
ok(currentPhase(st, { checks: {}, svar: {} }) === 0, 'aktuel fase er første ved start');
// indholdsregler
const srcIds = new Set(c.sources.map((s) => s.id));
for (const sc of c.scenarier) {
  ok(sc.kilder.length >= 1 && sc.kilder.every((k) => srcIds.has(k) && c.sources.find((s) => s.id === k).dato), `${sc.id}: kilder skal findes og være læst (dato)`);
  ok(sc.faser.length >= 2, `${sc.id}: mindst 2 faser`);
  const steps = sc.faser.flatMap((f) => f.trin).filter((t) => !t.spm);
  ok(steps.every((t) => ['D', 'T', 'F'].includes(t.ev)), `${sc.id}: evidensmærke på alle trin`);
  if (sc.ring112) ok(steps.some((t) => t.alarm && /112/.test(t.x)), `${sc.id}: ring112-scenarie mangler alarmtrin med 112`);
  // hver svarmulighed skal give mindst ét synligt trin, der ikke vises uden svar (ellers er spørgsmålet overflødigt)
  for (const q of sc.faser.flatMap((f) => f.trin).filter((t) => t.spm)) for (const a of q.svar) {
    const extra = texts(sc, { [q.spm]: a.id }).length - texts(sc, {}).length;
    ok(extra > 0, `${sc.id}: svaret ${q.spm}=${a.id} ændrer ingenting`);
  }
}
console.log(`Scenarier: ${n} kontroller – ${fail ? 'FEJLET (' + fail + ')' : 'OK'}`);
process.exit(fail ? 1 : 0);
