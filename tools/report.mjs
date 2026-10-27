#!/usr/bin/env node
// Genererer docs/VERIFICERING.md, docs/KILDER.md og docs/TESTRESULTATER.md ud fra bygget indhold og tests/results.json.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)); mkdirSync(join(ROOT, 'docs'), { recursive: true });
const c = JSON.parse(readFileSync(join(ROOT, 'app/data/content.json'), 'utf8'));
const man = JSON.parse(readFileSync(join(ROOT, 'app/map/pack/manifest.json'), 'utf8'));
const chap = Object.fromEntries(c.chapters.map((k) => [k.id, k.titel]));
const row = (...a) => '| ' + a.map((x) => String(x ?? '').replace(/\|/g, '/').replace(/\n/g, ' ')).join(' | ') + ' |';

// ---- VERIFICERING ------------------------------------------------------------------------------------------------------------
let v = `# Verificeringsstatus\n\nGenereret af \`tools/report.mjs\` fra det indbyggede indhold (app-version ${c.build.version}, ${c.build.date}).\n\n`;
v += `**Statusforklaring.** *Kontrolleret*: indholdet er sammenholdt med en navngiven primærkilde, som faktisk er læst på kontroldatoen. *Delvist*: kernepunkter er kontrolleret, andre dele er almen faglig viden. *Ikke*: skrevet ud fra almen viden; ingen kilde er kontrolleret mod. Hvert afsnit i appen viser sin status.\n\n`;
const cnt = (arr, s) => arr.filter((x) => x.kontrol.status === s).length;
v += `| | Kontrolleret | Delvist | Ikke verificeret | I alt |\n|---|---|---|---|---|\n`;
v += row('Guides', cnt(c.guides, 'kontrolleret'), cnt(c.guides, 'delvist'), cnt(c.guides, 'ikke'), c.guides.length) + '\n' + row('Arter', cnt(c.species, 'kontrolleret'), cnt(c.species, 'delvist'), cnt(c.species, 'ikke'), c.species.length) + '\n\n';
v += `## Indhold der IKKE er fuldt verificeret\n\n### Guides\n\n| Guide | Kapitel | Status | Note |\n|---|---|---|---|\n`;
for (const g of c.guides.filter((g) => g.kontrol.status !== 'kontrolleret')) v += row(g.titel, chap[g.kap], g.kontrol.status, g.kontrol.note) + '\n';
v += `\n### Arter\n\n| Art | Kategori | Status | Note |\n|---|---|---|---|\n`;
for (const s of c.species.filter((s) => s.kontrol.status !== 'kontrolleret')) v += row(s.dansk, s.kategori, s.kontrol.status, s.kontrol.note) + '\n';
v += `\n## Kontrollerede guides (kilde læst)\n\n| Guide | Kilder |\n|---|---|\n`;
for (const g of c.guides.filter((g) => g.kontrol.status === 'kontrolleret')) v += row(g.titel, (g.kilder || []).join(', ')) + '\n';
v += `\n## Generelle forbehold\n\n- Sundhed.dk-siderne er læst som lægmandsvejledning; det er ikke en fagfællebedømt gennemgang af ERC/DRG-retningslinjerne.\n- CDC-siderne kunne ikke hentes (adgang nægtet); filter/kemisk desinfektion bygger på søgeresume og er markeret derefter.\n- Fødevarestyrelsens "Plantelisten" er dynamisk og er IKKE læst; artslisten støtter sig i stedet på DTU Fødevareinstituttets oversigt (2013) og Fødevarestyrelsens svampefolder.\n- Skvalderkål, bøgeblade og hasselnød er medtaget som *uverificerede* (kategori "Ikke verificeret"), fordi ingen myndighedsvurdering blev fundet.\n- Knob: tegningerne til pælestik, råbåndsknob, flagknob, ottetal og kædestik er egne skematiske tegninger; dobbelt halvstik, tømmerstik og bardun har ingen tegning (kunne ikke kvalitetssikres).\n- Ingen genererede artsbilleder er brugt.\n`;
writeFileSync(join(ROOT, 'docs/VERIFICERING.md'), v);

// ---- KILDER ---------------------------------------------------------------------------------------------------------------------
let k = `# Kilder og datalicenser\n\nGenereret fra appens kilderegister (\`content/00_meta.mjs\`). "Kontrolleret" = siden er hentet og læst på datoen. Alle kilder er også gemt lokalt i appen (siden *Kilder*).\n\n| Kilde | Understøtter | Begrænsning | Kontrolleret |\n|---|---|---|---|\n`;
for (const s of c.sources) k += row(`[${s.navn}](${s.url})`, s.stoetter, s.begraensning, s.dato || 'IKKE læst') + '\n';
k += `\n## Kortdata (pakke v${man.version})\n\n| Datasæt | Licens | Dato |\n|---|---|---|\n`;
for (const s of man.sources) k += row(s.name, s.licence, s.date) + '\n';
k += `\nAfgrænsning: ${man.regionDefinition}\n\nBBox: ${man.bbox.join(', ')} (WGS84). Størrelser og SHA-256 pr. fil står i \`app/map/pack/manifest.json\`.\n\n## Tredjepartssoftware i appen\n\n| Komponent | Licens | Placering |\n|---|---|---|\n| MapLibre GL JS 4.7.1 | BSD-3-Clause | app/vendor/ |\n| PMTiles (JS) 3.2.1 | BSD-3-Clause | app/vendor/ |\n| Open Sans glyphs (via fonts.openmaptiles.org) | Apache-2.0 | app/map/glyphs/ |\n| OpenStreetMap-data | ODbL 1.0 © OpenStreetMap-bidragydere | app/map/pack/ |\n| Terrain Tiles (Terrarium) | åbne data, kildeangivelse påkrævet | app/map/pack/ |\n`;
writeFileSync(join(ROOT, 'docs/KILDER.md'), k);

// ---- TESTRESULTATER ------------------------------------------------------------------------------------------------------
let unit = '';
for (const f of ['tests/unit_geo.mjs', 'tests/unit_content.mjs']) { try { unit += execSync(`node ${f}`, { cwd: ROOT, encoding: 'utf8' }); } catch (e) { unit += (e.stdout || '') + '\n(FEJL ved kørsel)\n'; } }
let t = `# Testresultater\n\nGenereret af \`tools/report.mjs\`. Tallene stammer fra den seneste faktiske kørsel af \`npm run test:unit\` og \`npm run test:e2e\` (Playwright + Chromium). Intet her er skønnet eller antaget.\n\n## Enhedstests\n\n\`\`\`\n${unit.trim()}\n\`\`\`\n\n`;
if (existsSync(join(ROOT, 'tests/results.json'))) {
  const r = JSON.parse(readFileSync(join(ROOT, 'tests/results.json'), 'utf8'));
  t += `## End-to-end (browser)\n\nKørt ${r.generated}; ${r.ok}/${r.total} bestået; varighed ${r.durationSec} s.\n\n| ID | Test | Resultat | Detalje |\n|---|---|---|---|\n`;
  for (const x of r.results) t += row(x.id, x.name, x.status, x.detail) + '\n';
  t += `\n**Offline-test:** fase 4 (O01–O09) lukker den lokale webserver helt og genstarter browseren med samme profil. Appen skal da starte fra service worker-cachen og IndexedDB. Netværksværter og fejlede kald logges (O09).\n`;
}
t += `\n## Hvad er IKKE testet\n\n- Rigtige mobile enheder (iOS Safari, Android Chrome): kun Chromium (desktop, mobilstørrelse) er testet. iOS kan rydde websitelager efter 7 dages inaktivitet, hvis appen ikke er føjet til startskærmen.\n- Ægte GPS-hardware og enhedens kompas: GPS er testet med simuleret position; kompas er ikke testet.\n- Installation som PWA via "Føj til startskærm".\n- Ydeevne og batteriforbrug over længere tid.\n- Flere samtidige faner/enheder.\n- Fagligt indhold er ikke testet automatisk ud over struktur; se VERIFICERING.md.\n`;
writeFileSync(join(ROOT, 'docs/TESTRESULTATER.md'), t);
console.log('docs/VERIFICERING.md, docs/KILDER.md, docs/TESTRESULTATER.md skrevet');
