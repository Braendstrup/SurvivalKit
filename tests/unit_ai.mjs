// Enhedstests af AI-assistentens regler (uden sprogmodel): nødord, følsomme emner, efterbehandling, kilder, promptbudget, SHA-256.
import { readFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { setContent } from '../app/js/store.js';
import { retrieve, buildPrompt, PROMPT_BUDGET } from '../app/js/ai/rag.js';
import { emergency, isSensitive, postprocess } from '../app/js/ai/safety.js';
import { Sha256 } from '../app/js/ai/sha256.js';

setContent(JSON.parse(readFileSync(new URL('../app/data/content.json', import.meta.url))));
let fail = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.log('FEJL', m); } };

// nødord (inkl. æ/ø/å og bøjninger)
for (const q of ['Min ven er bevidstløs', 'han trækker ikke vejret', 'det bløder voldsomt fra benet', 'blødning der ikke stopper', 'bidt af en hugorm', 'barnet har spist en giftig svamp',
  'jeg tror armen er brækket', 'hun er helt nedkølet og forvirret', 'han er faldet gennem isen', 'der er brand i teltet', 'mistanke om kulilte', 'hævede læber efter hvepsestik', 'skal jeg ringe 112?', 'hvordan giver jeg hjertemassage'])
  ok(emergency(q), 'nødord ikke fanget: ' + q);
for (const q of ['hvordan binder jeg et pælestik', 'hvor længe skal vand koge', 'hvordan tænder jeg bål i regnvejr', 'hvad betyder højdekurver', 'hvordan bruger jeg kompas'])
  ok(!emergency(q), 'falsk nødord: ' + q);

// opslag finder relevante guides for naturlige spørgsmål
const top = (q) => retrieve(q).map((s) => s.id);
ok(top('Hvor længe skal man koge vand for at gøre det sikkert at drikke?').includes('vand-kogning'), 'kogning ikke fundet: ' + top('Hvor længe skal man koge vand?'));
ok(top('hvordan binder jeg et pælestik').includes('knob-paelestik'), 'pælestik ikke fundet');
ok(top('hvad gør jeg ved hugormebid').some((id) => /hugorm/.test(id)), 'hugorm ikke fundet: ' + top('hvad gør jeg ved hugormebid'));
ok(top('min ven bløder fra armen')[0] === 'fh-bloedning', 'bløder → blødning: ' + top('min ven bløder fra armen'));
ok(!top('min ven bløder fra armen').includes('beredskab-stroemafbrydelse'), 'armen matcher varmen');
ok(retrieve('xqzvbn blorf').length === 0, 'nonsens gav resultater');
ok(retrieve('hvor finder jeg ramsløg').some((s) => s.type === 'a'), 'art ikke fundet for ramsløg');

// følsomhed
ok(isSensitive('kan man spise ramsløg', retrieve('kan man spise ramsløg')), 'spiselighed ikke følsom');
ok(isSensitive('hvad gør jeg ved hugormebid', retrieve('hvad gør jeg ved hugormebid')), 'hugorm ikke følsom');
ok(!isSensitive('hvordan binder jeg et pælestik', retrieve('hvordan binder jeg et pælestik')), 'knob fejlagtigt følsom');

// efterbehandling
const src = retrieve('hvordan binder jeg et pælestik');
let r = postprocess('Lav et øje [1]. Før enden op [1, 9].\n\n[egen viden] Øv det hjemme først.<turn|>', src, false);
ok(!r.refused && r.cited.length === 1 && r.cited[0] === 0, 'kildeliste forkert: ' + JSON.stringify(r.cited));
ok(r.paras.some((p) => p.own && p.text.startsWith('Øv')) && r.paras.some((p) => !p.own && p.text.includes('[1]') && !p.text.includes('[9]')), 'egen viden/ugyldig kilde: ' + JSON.stringify(r.paras));
ok(!r.paras.some((p) => p.text.includes('<turn|>')), 'modeltoken ikke fjernet');
const hsrc = retrieve('hvad gør jeg ved hugormebid');
ok(postprocess('Hold personen i ro [1].\n\n[egen viden] Læg is på.', hsrc, true).refused, 'egen viden på følsomt emne blev ikke afvist');
ok(postprocess('[ikke i håndbogen]', hsrc, true).refused, '[ikke i håndbogen] ikke afvist');
ok(postprocess('Noget svar', [], true).refused, 'følsomt uden kilder ikke afvist');
ok(!postprocess('Hold personen i ro og ring 112 [1].', hsrc, true).refused, 'gyldigt følsomt svar afvist');
ok(postprocess('Ramsløg kan spises [1].', retrieve('kan man spise ramsløg'), true, 'kan man spise ramsløg').eatRule, 'spiseregel mangler');

// prompt: budget og format
for (const q of ['hvordan holder jeg varmen om natten i en shelter', 'hvad skal jeg have i rygsækken på en dagstur']) {
  const s = retrieve(q), p = buildPrompt(q, s, false);
  ok(p.user.length < PROMPT_BUDGET + 600, `prompt for lang (${p.user.length}) for: ${q}`);
  ok(p.text.startsWith('<|turn>system\n') && p.text.endsWith('<|turn>model\n'), 'Gemma 4-format');
  ok(/\[1\]/.test(p.user), 'kilder nummereret');
}
ok(/KUN bruge håndbogens tekst/.test(buildPrompt('x', [], true).system), 'striks instruks på følsomt emne');

// SHA-256 (inkrementel) mod Node
for (const len of [0, 3, 64, 1000, 200003]) { const d = randomBytes(len), s = new Sha256(); for (let i = 0; i < len; i += 777) s.update(d.subarray(i, i + 777)); ok(s.hex() === createHash('sha256').update(d).digest('hex'), 'sha256 ' + len); }

console.log(`AI-regler: ${n} kontroller – ${fail ? 'FEJLET (' + fail + ')' : 'OK'}`);
process.exit(fail ? 1 : 0);
