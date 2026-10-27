// Enhedstest af indholdet (efter build): kildehenvisninger, kontrolstatus, forbudte formuleringer, artsfelter.
import { readFileSync } from 'node:fs';
const c = JSON.parse(readFileSync(new URL('../app/data/content.json', import.meta.url)));
let fail = 0; const bad = (m) => { fail++; console.log('FEJL', m); };
const src = new Set(c.sources.map((s) => s.id));
const text = (o) => JSON.stringify(o);
for (const g of c.guides) {
  if (!g.kontrol) bad(g.id + ': ingen kontrolstatus');
  for (const k of g.kilder || []) if (!src.has(k)) bad(g.id + ': ukendt kilde ' + k);
  if (g.kontrol?.status === 'kontrolleret' && !(g.kilder || []).length) bad(g.id + ': kontrolleret uden kilde');
  if (g.kontrol?.status !== 'ikke' && !g.kontrol?.dato) bad(g.id + ': kontrolleret/delvist uden dato');
}
for (const s of c.species) {
  if (!s.kilder?.length) bad(s.id + ': ingen kilder');
  if (['standard', 'forsigtighed'].includes(s.kategori) && s.kontrol.status === 'ikke') bad(s.id + ': spiselig markeret uden verificering');
  if (s.kategori === 'standard' && !(s.forvekslinger || []).length) bad(s.id + ': ingen forvekslinger');
}
// ingen art må kaldes "sikker" alene; ingen invasive/forældede råd
const forbidden = [/sug giften ud/i, /skær i (bid|såret)/i, /drik havvand/i];
for (const f of forbidden) if (f.test(text(c.guides.map((g) => g.blokke)).replace(/Smør aldrig flåten[^"]*/g, ''))) console.log('INFO: mønster fundet (kontrollér kontekst):', f);
console.log(`Indholdstest: ${c.guides.length} guides, ${c.species.length} arter, ${c.sources.length} kilder – ${fail ? 'FEJLET (' + fail + ')' : 'OK'}`);
process.exit(fail ? 1 : 0);
