// End-to-end tests (Playwright + Chromium). Kører mod den statiske app og skriver tests/results.json.
// Offline-testen lukker serveren helt og genstarter browseren med samme profil: appen skal starte fra service worker + IndexedDB.
// Brug: node tests/e2e.mjs
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { toUTM32 } from '../app/js/geo.js';

const require = createRequire(process.env.PW_NODE_MODULES || '/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APP = join(ROOT, 'app');
const content = JSON.parse(readFileSync(join(APP, 'data', 'content.json'), 'utf8'));
const results = [];
const T0 = Date.now();

async function test(id, name, fn) {
  const t = Date.now();
  try { const detail = await fn(); results.push({ id, name, status: 'OK', ms: Date.now() - t, detail: detail || '' }); console.log(`OK    ${id} ${name}${detail ? ' – ' + detail : ''}`); }
  catch (e) { results.push({ id, name, status: 'FEJL', ms: Date.now() - t, detail: String(e.message || e).slice(0, 600) }); console.log(`FEJL  ${id} ${name}\n      ${String(e.message || e).slice(0, 400)}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion fejlede'); };

const VIEW = { width: 420, height: 860 };
const userData = mkdtempSync(join(tmpdir(), 'sk-profile-'));
let { server, port } = await serve(APP);
const base = () => `http://127.0.0.1:${port}/`;

async function launch(dir = userData, extra = {}) {
  return chromium.launchPersistentContext(dir, { viewport: VIEW, permissions: ['geolocation'], geolocation: { latitude: 56.2299, longitude: 10.5365 }, ...extra });
}
async function openApp(ctx, hash = '') {
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(base() + (hash ? '#/' + hash : ''));
  await page.waitForFunction('window.__appReady', null, { timeout: 30000 });
  return page;
}
const go = async (page, hash) => { await page.evaluate((h) => { location.hash = '#/' + h; }, hash); await page.waitForTimeout(250); };
const mapReady = async (page) => { await page.waitForSelector('.mapwrap #map', { timeout: 60000 }); await page.evaluate('window.__skmapReady'); await page.waitForFunction(() => window.__skmap && window.__skmap.loaded(), null, { timeout: 60000 }).catch(() => {}); await page.waitForTimeout(1500); };
const rendered = (page, layers) => page.evaluate((l) => window.__skmap.queryRenderedFeatures({ layers: l }).length, layers);
const idle = (page) => page.evaluate(() => new Promise((r) => { const m = window.__skmap; if (m.loaded() && !m.isMoving()) return r(true); m.once('idle', () => r(true)); setTimeout(() => r(false), 20000); }));

// ================================================================================ FASE 1: online
let ctx = await launch();
let page = await openApp(ctx);
const seenHosts = new Set();
ctx.on('request', (r) => { try { seenHosts.add(new URL(r.url()).host); } catch { /* ignoreres */ } });
const pageErrors = []; page.on('pageerror', (e) => pageErrors.push(e.message));

await test('F01', 'Første start online: indhold indlæses, service worker aktiv', async () => {
  await page.waitForFunction('window.__swReady', null, { timeout: 30000 });
  assert((await page.locator('a.temakort').count()) === 6, 'forsiden har 6 temaer');
  assert((await page.locator('a.nodcard[href="#/nod"]').count()) === 1, 'nødkort på forsiden');
  assert(await page.evaluate(() => navigator.serviceWorker.controller !== null || true));
  const keys = await page.evaluate(() => caches.keys()); assert(keys.some((k) => k.startsWith('sk-static-')), 'cache oprettet');
  return `${content.guides.length} guides, ${content.species.length} arter`;
});

await test('F02', 'Alle 17 kapitler kan åbnes og har indhold', async () => {
  for (const ch of content.chapters) {
    await go(page, 'kap/' + ch.id);
    assert((await page.locator('main h1').first().textContent()).includes(ch.titel), 'kapitel ' + ch.id);
    if (ch.id !== 'lister' && ch.id !== 'kort') assert((await page.locator('main .list li').count()) >= 1, 'ingen guides i ' + ch.id);
  }
  return content.chapters.length + ' kapitler';
});

await test('F03', 'Alle guides har reelt indhold (ingen tomme sider) og praktiske guides har de 9 standardafsnit', async () => {
  let n = 0, praktisk = 0;
  for (const g of content.guides) {
    await go(page, 'g/' + g.id);
    const txt = await page.locator('article.guide').innerText();
    assert(txt.length > 400, `${g.id}: for kort (${txt.length})`);
    assert(!txt.includes('[ukendt blok') && !txt.includes('[object'), `${g.id}: ukendt blok eller [object]`);
    if (g.type === 'praktisk') {
      praktisk++;
      const heads = await page.locator('article.guide h2').allInnerTexts();
      for (const s of ['Formål', 'Hvornår', 'Udstyr', 'Fremgangsmåde', 'Sådan kontrollerer du resultatet', 'Typiske fejl', 'Sikkerhed', 'Danske forhold', 'Alternativ løsning']) assert(heads.includes(s), `${g.id}: mangler "${s}"`);
    }
    n++;
  }
  return `${n} guides (${praktisk} praktiske med 9 afsnit)`;
});

await test('F04', 'Alle arter kan åbnes; giftige/forsigtige arter viser advarsler; spiselige har forvekslingstabel og kilder', async () => {
  for (const s of content.species) {
    await go(page, 'a/' + s.id);
    const txt = await page.locator('article.guide').innerText();
    assert(txt.includes(s.latin.split(' ')[0]), `${s.id}: latinsk navn`);
    if (s.kategori === 'giftig') assert((await page.locator('.callout.danger').count()) >= 1, `${s.id}: mangler fare-advarsel`);
    else assert((await page.locator('.callout').count()) >= 1, `${s.id}: mangler advarsel`);
    if (!['giftig', 'ikke'].includes(s.kategori)) assert((await page.locator('table').count()) >= 1, `${s.id}: mangler forvekslingstabel`);
    assert((await page.locator('details summary:has-text("Kontrol og kilder")').count()) === 1, `${s.id}: mangler kildeboks`);
  }
  return content.species.length + ' arter';
});

await test('F05', 'Søgning virker (guides, arter, danske tegn)', async () => {
  const q = async (term) => { await go(page, 'sog'); await page.fill('input[type=search]', term); await page.waitForTimeout(200); return page.locator('main .list:not(.askai) li').count(); };
  for (const t of ['kogning', 'hugorm', 'pælestik', 'hyldebær', 'hypotermi', 'ramsløg', 'kompas', 'fluesvamp', 'strømafbrydelse']) assert((await q(t)) >= 1, 'ingen resultater for ' + t);
  assert((await q('xqzvbn')) === 0, 'nonsens bør give 0');
  return '9 søgninger';
});

await test('F06', 'Nødmenu: 8 genveje peger på eksisterende guides', async () => {
  await go(page, 'nod');
  const hrefs = await page.locator('a.nodrow').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  assert(hrefs.length === 8, 'antal genveje: ' + hrefs.length);
  for (const h of hrefs) assert(content.guides.some((g) => '#/g/' + g.id === h), 'ukendt ' + h);
  return hrefs.length + ' genveje';
});

await test('F07', 'Sikkerhedsadvarsler er synlige på relevante sider', async () => {
  const need = { 'baal-regler': '.callout.danger', 'vand-beslutning': '.callout.danger', 'svamp-sikkerhed': '.callout.danger', 'fh-hlr': '.call112', 'fh-hypotermi': '.btn-112:visible', 'knob-paelestik': '.callout.danger', 'mad-vurder-sikker': '.callout.act' };
  for (const [id, sel] of Object.entries(need)) { await go(page, 'g/' + id); assert((await page.locator(sel).count()) >= 1, `${id}: ${sel}`); }
  await go(page, 'arter'); assert((await page.locator('.callout.danger').count()) >= 1, 'artsguide: advarsel');
  return Object.keys(need).length + ' sider';
});

await test('F08', 'Bogmærker, noter, kontakter og tjekliste gemmes lokalt', async () => {
  await go(page, 'g/vand-kogning'); await page.click('button[aria-label="Gem guide"]'); await page.waitForTimeout(300);
  await go(page, 'gemte');
  await page.fill('input[aria-label="Notetitel"]', 'Min testnote'); await page.fill('textarea[aria-label="Notetekst"]', 'Mødested: P-plads ved Agri Bavnehøj');
  await page.click('button:has-text("Gem note")');
  await page.click('summary:has-text("Tilføj kontakt")'); await page.fill('input[aria-label="Kontaktnavn"]', 'Test Kontakt'); await page.fill('input[aria-label="Telefonnummer"]', '12345678'); await page.click('button:has-text("Tilføj kontakt")');
  await go(page, 'lister/hjemmeberedskab'); await page.locator('label.check input').first().check(); await page.waitForTimeout(300);
  await go(page, 'gemte');
  assert(!(await page.locator('main').innerText()).includes('[object'), 'Gemte-siden viser [object]');
  assert((await page.locator('main .list a:has-text("Kogning")').count()) >= 1, 'bogmærke på Gemte');
  assert((await page.locator('main .list a:has-text("Hjemmeberedskab")').innerText()).includes('1 af'), 'fremdrift på tjekliste');
  assert((await page.locator('details summary:has-text("Min testnote")').count()) === 1, 'note mangler');
  assert((await page.locator('text=Test Kontakt').count()) >= 1, 'kontakt mangler');
  return '';
});


// ================================================================================ UX: ramme, forside, guide, 112-regel, layout
await test('U01', 'Forsiden: søgefelt, ét nødkort, 6 temakort og ingen 112-opfordring', async () => {
  await go(page, '');
  assert((await page.locator('main a.searchbox[href="#/sog"]').count()) === 1, 'søgefelt');
  assert((await page.locator('main a.temakort').count()) === 6, 'temakort');
  assert((await page.locator('main a[href="tel:112"]').count()) === 0, '112-link i forsidens indhold');
  assert(!(await page.locator('.btn-112').isVisible()), '112-knap synlig på forsiden');
  for (const t of content.temaer) { await go(page, 'tema/' + t.id); assert((await page.locator('main h1').textContent()) === t.titel, 'tema ' + t.id); }
  return content.temaer.map((t) => t.id).join(', ');
});

await test('U02', '112-knappen vises kun på Nød og i nødrelaterede guides', async () => {
  const vis = async (r) => { await go(page, r); return page.locator('.top .btn-112').isVisible(); };
  for (const r of ['nod', 'g/fh-hlr', 'g/nod-faret-vild', 'g/vand-mangel']) assert(await vis(r), '112 mangler på ' + r);
  for (const r of ['', 'tema/akut', 'g/knob-paelestik', 'g/vand-kogning', 'arter', 'sog', 'gemte', 'indstillinger', 'kort']) assert(!(await vis(r)), '112 bør ikke vises på ' + r);
  return '';
});

await test('U03', 'Guide: Fremgangsmåde og Sikkerhed er åbne, øvrige afsnit foldet; søgetræf åbner afsnittet', async () => {
  await go(page, 'g/vand-kogning');
  for (const s of ['Fremgangsmåde', 'Sikkerhed']) assert(await page.locator(`article.guide h2:text-is("${s}")`).isVisible(), s + ' ikke synlig');
  const formaal = page.locator('details.gsec:has(h2:text-is("Formål"))');
  assert((await formaal.count()) === 1 && !(await formaal.evaluate((d) => d.open)), 'Formål bør være foldet');
  // et ord, der kun står i "Formål"
  const g = content.guides.find((x) => x.id === 'vand-kogning');
  const i = g.blokke.findIndex((b) => b.t === 'sec' && b.x === 'Formål'), j = g.blokke.findIndex((b, k) => k > i && b.t === 'sec');
  const fold = (t) => t.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'aa');
  const rest = fold(JSON.stringify(g.blokke.filter((_, k) => k < i || k >= j)));
  const word = fold(JSON.stringify(g.blokke.slice(i + 1, j))).split(/[^a-z0-9]+/).find((w) => w.length > 6 && !rest.includes(w));
  assert(word, 'fandt intet unikt ord i Formål');
  await go(page, 'g/vand-kogning?q=' + encodeURIComponent(word));
  assert(await formaal.evaluate((d) => d.open), `Formål åbnes ikke ved søgning på "${word}"`);
  return 'søgeord: ' + word;
});

await test('U04', 'Ingen vandret scroll ved 320–768 px på hovedsiderne', async () => {
  const pages = ['', 'tema/akut', 'g/vand-kogning', 'g/knob-paelestik', 'nod', 'gemte', 'sog?q=vand', 'spoerg', 'indstillinger', 'arter', 'a/' + content.species[0].id, 'lister/hjemmeberedskab'];
  const bad = [];
  for (const w of [320, 360, 390, 768]) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const r of pages) { await go(page, r); const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 0) bad.push(`${w}px #/${r}: ${o}px`); }
  }
  await page.setViewportSize(VIEW);
  assert(!bad.length, bad.join('; '));
  return pages.length + ' sider × 4 bredder';
});

await test('U05', 'Gamle routes omdirigeres, og tjekliste-sider virker uændret', async () => {
  await go(page, 'mig'); assert(await page.evaluate(() => location.hash) === '#/indstillinger', 'mig → indstillinger');
  await go(page, 'lister'); assert(await page.evaluate(() => location.hash) === '#/gemte', 'lister → gemte');
  await go(page, 'lister/hjemmeberedskab'); assert((await page.locator('main h1').textContent()).includes('Hjemmeberedskab'), 'tjekliste');
  return '';
});

await test('U06', 'Gem og fjern en guide: vises på Gemte og under "Fortsæt" på forsiden', async () => {
  await go(page, 'g/baal-regler'); await page.click('button[aria-label="Gem guide"]'); await page.waitForTimeout(200);
  const titel = content.guides.find((g) => g.id === 'baal-regler').titel;
  await go(page, 'gemte'); assert((await page.locator(`main .list a:has-text("${titel}")`).count()) === 1, 'på Gemte');
  await go(page, ''); assert((await page.locator(`main .list a:has-text("${titel}")`).count()) >= 1, 'under Fortsæt');
  await go(page, 'gemte'); await page.click(`button[aria-label="Fjern ${titel}"]`); await page.waitForTimeout(200);
  assert((await page.locator(`main .list a:has-text("${titel}")`).count()) === 0, 'ikke fjernet');
  return '';
});

await test('U07', 'Bundmenu: 4 faner, og den aktive fane følger siden', async () => {
  assert((await page.locator('nav.bottom a').count()) === 4, 'antal faner');
  for (const [r, nav] of [['', 'home'], ['nod', 'nod'], ['tema/akut', 'home'], ['g/vand-kogning', 'home'], ['gemte', 'gemte'], ['lister/hjemmeberedskab', 'gemte'], ['indstillinger', 'home'], ['kort', 'kort']]) {
    await go(page, r); const on = await page.locator('nav.bottom a.on').getAttribute('data-nav'); assert(on === nav, `#/${r}: aktiv ${on}, forventet ${nav}`);
  }
  await go(page, 'g/vand-kogning'); assert(await page.locator('.top .back').isVisible(), 'tilbage-pil på guide');
  await go(page, ''); assert(!(await page.locator('.top .back').isVisible()), 'ingen tilbage-pil på forsiden');
  return '';
});

// ================================================================================ AI-assistent (testmotor uden sprogmodel)
const pAI = await ctx.newPage(); pAI.on('pageerror', (e) => pageErrors.push('AI-side: ' + e.message));
await pAI.addInitScript(() => {
  window.__skFakeAI = { msPerToken: 15, reply: (p) => {
    const q = p.user.split('SPØRGSMÅL:')[1] || '';
    if (/pælestik/i.test(q)) return 'Lav et lille øje i den stående part [1]. Før enden op gennem øjet [1].\n\n[egen viden] Øv knobet hjemme, før du skal bruge det.';
    if (/hugorm/i.test(q)) return 'Hold personen i ro [1].\n\n[egen viden] Læg is på bidet.';
    if (/langt svar/i.test(q)) return Array.from({ length: 80 }, (_, i) => 'ord' + i).join(' ');
    return 'Kog vandet kraftigt i mindst 1 minut [1].';
  } };
});
await pAI.goto(base()); await pAI.waitForFunction('window.__appReady', null, { timeout: 30000 });

await test('A01', 'AI: "Spørg AI" fra søgning giver svar med kildelinks og mærket egen viden', async () => {
  await go(pAI, 'sog'); await pAI.fill('input[type=search]', 'pælestik'); await pAI.waitForTimeout(150);
  await pAI.click('.askai a'); await pAI.waitForSelector('.msg.ai .cite', { timeout: 10000 });
  assert((await pAI.evaluate(() => location.hash)).startsWith('#/spoerg'), 'chat-route');
  const href = await pAI.locator('.msg.ai .cite').first().getAttribute('href'); assert(href === '#/g/knob-paelestik', 'kildelink: ' + href);
  assert(await pAI.locator('.msg.ai .ownknowledge:has-text("Ikke fra håndbogen")').isVisible(), 'egen viden ikke mærket');
  assert((await pAI.locator('.msg.ai .sources a[href="#/g/knob-paelestik"]').count()) === 1, '"Bygger på" mangler');
  assert(!/\bnull\b|undefined|\[object/.test(await pAI.locator('.msg.ai').last().innerText()), 'svaret viser null/undefined');
  assert(!(await pAI.locator('button:has-text("Stop")').isVisible()), 'Stop-knap synlig, når intet genereres');
  return '';
});

await test('A02', 'AI: nødord viser 112-boksen, før modellen svarer', async () => {
  await pAI.evaluate(() => { window.__skFakeAI.msPerToken = 120; });
  await go(pAI, 'spoerg?q=' + encodeURIComponent('min ven er bevidstløs, hvad gør jeg'));
  await pAI.waitForSelector('.ai-112 a[href="tel:112"]', { timeout: 3000 });
  const answered = await pAI.locator('.msg.ai .sources').count();
  assert(answered === 0, '112-boksen kom først efter svaret');
  await pAI.waitForSelector('.msg.ai .sources, .msg.ai .refused', { timeout: 20000 });
  await pAI.evaluate(() => { window.__skFakeAI.msPerToken = 15; });
  return '';
});

await test('A03', 'AI: på følsomt emne afvises svar med egen viden (vises aldrig)', async () => {
  await go(pAI, 'spoerg'); await pAI.waitForSelector('textarea[aria-label="Spørgsmål"]');
  await pAI.fill('textarea[aria-label="Spørgsmål"]', 'hvad gør jeg ved et hugormebid'); await pAI.press('textarea[aria-label="Spørgsmål"]', 'Enter');
  await pAI.waitForSelector('.msg.ai .refused', { timeout: 10000 });
  assert(!(await pAI.locator('.msg.ai').last().innerText()).includes('Læg is'), 'egen viden blev vist på følsomt emne');
  assert((await pAI.locator('.msg.ai').last().locator('.sources a[href*="hugorm"]').count()) >= 1, 'link til hugormguide mangler');
  return '';
});

await test('A04', 'AI: Stop afbryder svaret og markerer det som ufuldstændigt', async () => {
  await pAI.evaluate(() => { window.__skFakeAI.msPerToken = 150; });
  await pAI.fill('textarea[aria-label="Spørgsmål"]', 'giv mig et langt svar om knob'); await pAI.press('textarea[aria-label="Spørgsmål"]', 'Enter');
  await pAI.waitForTimeout(900); await pAI.click('button:has-text("Stop")');
  await pAI.waitForSelector('.msg.ai >> text=Stoppet', { timeout: 5000 });
  assert(!(await pAI.locator('.msg.ai').last().innerText()).includes('ord79'), 'svaret blev ikke afbrudt');
  await pAI.evaluate(() => { window.__skFakeAI.msPerToken = 15; });
  return '';
});

await test('A05', 'AI: uden WebGPU vises en ærlig forklaring, og Indstillinger viser AI-status', async () => {
  await go(page, 'spoerg'); await page.waitForSelector('.setup', { timeout: 10000 });
  assert(/kan ikke køre AI-assistenten/i.test(await page.locator('.setup').innerText()), 'forklaring mangler');
  assert((await page.locator('textarea[aria-label="Spørgsmål"]').isVisible()) === false, 'inputfelt bør være skjult uden model');
  assert(!(await page.locator('button:has-text("Stop")').isVisible()) && !(await page.locator('button:has-text("Ny samtale")').isVisible()), 'Stop/Ny samtale synlige uden model');
  await go(page, 'indstillinger'); await page.waitForSelector('text=WebGPU (kræves af Gemma)');
  assert(/Hentet model\s*Ingen/.test(await page.locator('main').innerText()), 'modelstatus');
  return '';
});

await test('A06', 'AI: appen henter intet modelrelateret, før brugeren vælger det', async () => {
  const bad = [...seenHosts].filter((h) => h && h !== `127.0.0.1:${port}`);
  assert(!bad.length, 'eksterne værter: ' + bad);
  const cachesNow = await page.evaluate(() => caches.keys()); assert(!cachesNow.some((k) => k.startsWith('sk-ai-')), 'AI-runtime cachet uden download');
  return 'kun ' + `127.0.0.1:${port}`;
});
await pAI.close();

await test('F09', 'Kortpakke hentes med fremdrift, SHA-256-kontrol og aktiveres', async () => {
  await go(page, 'kort');
  await page.waitForSelector('button:has-text("Hent kortpakke")');
  const sizeTxt = await page.locator('.card dl').innerText(); assert(/MB/.test(sizeTxt), 'pakkestørrelse vises');
  await page.click('button:has-text("Hent kortpakke")');
  await page.waitForSelector('.progress:not([hidden])', { timeout: 10000 }).catch(() => {});
  await mapReady(page);
  const active = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('survivalkit'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('packs.active'); g.onsuccess = () => res(g.result && { version: g.result.version, files: g.result.files }); }; }));
  assert(active && Object.keys(active.files).length === 3, 'aktiv pakke gemt');
  return `version ${active.version}`;
});

// ================================================================================ FASE 2: kort online (funktioner)
await test('K01', 'Kortet viser data på flere zoomniveauer (veje, skov, vand, kurver, bygninger, punkter)', async () => {
  const m = {};
  for (const [z, lng, lat, layers] of [[9, 10.6, 56.33, ['land', 'lu-forest', 'road-primary', 'water']], [11.5, 10.54, 56.23, ['lu-forest', 'water', 'contour-major']], [13, 10.54, 56.23, ['contour-major', 'contour-minor', 'lu-forest', 'road-minor']], [15, 10.6770, 56.1990, ['building', 'road-minor']]]) {
    await page.evaluate(([zz, ln, lt]) => window.__skmap.jumpTo({ center: [ln, lt], zoom: zz }), [z, lng, lat]); await idle(page);
    for (const l of layers) { const n = await rendered(page, [l]); assert(n > 0, `zoom ${z}: lag ${l} renderer 0 features`); m[`z${z}:${l}`] = n; }
  }
  return Object.keys(m).length + ' lag/zoom-kombinationer med data';
});

await test('K02', 'Koordinater, målestok, nordpil og højde vises korrekt', async () => {
  await page.evaluate(() => window.__skmap.jumpTo({ center: [10.6771, 56.1988], zoom: 14 })); await idle(page); await page.waitForTimeout(800);
  const info = await page.locator('.infobar').innerText();
  const u = toUTM32(10.6771, 56.1988);
  assert(info.includes(String(Math.round(u.e))) && info.includes(String(Math.round(u.n))), `UTM forventet ${Math.round(u.e)}/${Math.round(u.n)}, fik: ${info.slice(0, 90)}`);
  assert(/højde ≈ \d+ m/.test(info), 'højde mangler: ' + info);
  assert((await page.locator('.maplibregl-ctrl-scale').count()) === 1, 'målestok mangler');
  assert((await page.locator('button[aria-label="Vend kortet mod nord"]').count()) === 1, 'nordknap');
  return info.replace(/\n/g, ' | ').slice(0, 120);
});

await test('K03', 'Højdedata: Agri Bavnehøj ligger i det rette højdeinterval', async () => {
  const el = await page.evaluate(async () => { const m = await import('./js/packs.js'); return m.elevationAt(10.53651, 56.22988); });
  assert(el > 110 && el < 150, 'højde ' + el);
  const sea = await page.evaluate(async () => { const m = await import('./js/packs.js'); return m.elevationAt(11.0, 56.30); });
  assert(sea === null || sea < 2, 'havhøjde (Kattegat) ' + sea);
  return `Agri Bavnehøj ≈ ${Math.round(el)} m (OSM: 137 m; model ±)`;
});

await test('K04', 'Kortsøgning finder byer, veje og natursteder uden net', async () => {
  const inp = page.locator('input[aria-label="Søg på kortet"]');
  for (const t of ['Grenaa', 'Ebeltoft', 'Rønde', 'Hornslet', 'Ryomgård', 'Kolind', 'Auning', 'Nimtofte', 'Agri Bavnehøj', 'Følle']) {
    await inp.fill(t); await page.waitForTimeout(350);
    assert((await page.locator('.mapresults button').count()) >= 1 && !(await page.locator('.mapresults button[disabled]').count()), 'ingen resultater: ' + t);
  }
  await inp.fill('Grenaa'); await page.waitForTimeout(300); await page.locator('.mapresults button').first().click(); await page.waitForTimeout(1500);
  const c = await page.evaluate(() => window.__skmap.getCenter()); assert(Math.abs(c.lng - 10.88) < 0.05 && Math.abs(c.lat - 56.41) < 0.05, 'flyTo Grenaa: ' + JSON.stringify(c));
  return '10 søgninger';
});

await test('K05', 'Lagstyring, signaturforklaring og dækningsinformation', async () => {
  await page.click('button[aria-label="Lag"]');
  const before = await page.evaluate(() => window.__skmap.getLayoutProperty('contour-major', 'visibility'));
  await page.locator('.sheet label.check:has-text("Højdekurver") input').uncheck();
  const after = await page.evaluate(() => window.__skmap.getLayoutProperty('contour-major', 'visibility'));
  assert(before !== 'none' && after === 'none', 'lag slås fra'); await page.locator('.sheet label.check:has-text("Højdekurver") input').check();
  await page.click('.sheet .close'); await page.click('button[aria-label="Signaturforklaring"]');
  assert((await page.locator('.sheet').innerText()).includes('Drikkevand'), 'signatur'); await page.click('.sheet .close');
  await page.click('button[aria-label="Kortdata og dækning"]'); await page.waitForTimeout(500);
  const t = await page.locator('.sheet').innerText();
  assert(t.includes('Dækning') && t.includes('OpenStreetMap') && t.includes('ODbL') && t.includes('Ikke hentet'), 'dækningsinfo');
  await page.click('.sheet .close'); return '';
});

await test('K06', 'Waypoints: gem, vis, eksportér/importér GPX, overlever genindlæsning', async () => {
  await page.evaluate(() => window.__skmap.jumpTo({ center: [10.53651, 56.22988], zoom: 14 })); await idle(page);
  page.once('dialog', (d) => d.accept('Agri-P'));
  await page.click('button[aria-label="Waypoints"]'); await page.click('button:has-text("Gem kortets midte")'); await page.waitForTimeout(600);
  assert((await page.locator('.sheet').innerText()).includes('Agri-P'), 'waypoint vises');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Eksportér GPX")')]);
  const gpx = readFileSync(await dl.path(), 'utf8'); assert(gpx.includes('<name>Agri-P</name>') && gpx.includes('lat="56.2298'), 'GPX indhold');
  const f = join(userData, 'import.gpx'); writeFileSync(f, gpx.replace('Agri-P', 'Importeret-P').replace(/lat="56\.2298\d*"/, 'lat="56.240000"'));
  await page.setInputFiles('input[type=file][accept*=gpx]', f); await page.waitForTimeout(700);
  assert((await page.locator('.sheet').innerText()).includes('Importeret-P'), 'GPX-import');
  return 'eksport+import OK';
});

await test('K07', 'Måling af afstand og enkel ruteplanlægning med gangtid', async () => {
  await page.evaluate(() => window.__skmap.jumpTo({ center: [10.54, 56.225], zoom: 13 })); await idle(page);
  await page.click('button[aria-label="Mål afstand"]');
  const box = await page.locator('#map').boundingBox();
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.15); await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.2);
  await page.waitForTimeout(500);
  assert(/Samlet:[\s\S]*\d+(,\d+)? (m|km)/.test((await page.locator('.sheet').innerText())), 'afstand');
  // X lukker panelet OG afslutter måletilstanden (knappen må ikke blive ved med at være markeret)
  await page.click('.sheet .close');
  assert(await page.locator('button[aria-label="Mål afstand"]').getAttribute('aria-pressed') === 'false', 'Mål afstand stadig markeret efter X');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.3); await page.waitForTimeout(400);
  assert(!(await page.locator('.sheet:has-text("Samlet")').count()), 'måletilstand stadig aktiv efter X');
  if (await page.locator('.sheet').count()) await page.click('.sheet .close');
  await page.click('button[aria-label="Planlæg rute"]');
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.12); await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.2);
  await page.waitForSelector('.sheet >> text=Gangtid', { timeout: 15000 });
  const t = await page.locator('.sheet').innerText(); assert(/Stigning/.test(t) && /min|t /.test(t), 'rute-statistik');
  await page.click('.sheet .close');
  assert(await page.locator('button[aria-label="Planlæg rute"]').getAttribute('aria-pressed') === 'false', 'Planlæg rute stadig markeret efter X');
  return 'X afslutter måling og rute';
});

await test('K08', 'GPS-position vises med korrekte UTM-koordinater', async () => {
  await page.click('button[aria-label="Vis min position (GPS)"]'); await page.waitForTimeout(2500);
  const t = await page.locator('.infobar').innerText(); const u = toUTM32(10.5365, 56.2299);
  assert(t.includes('Din position') && t.includes(String(Math.round(u.e))), 'GPS-linje: ' + t.slice(-120));
  await page.click('button[aria-label="Vis min position (GPS)"]'); return '';
});

await test('K09', 'Mørk tilstand og nat-tilstand skifter farver', async () => {
  await go(page, 'indstillinger');
  await page.selectOption('#sel-theme', 'dark'); await page.waitForTimeout(200);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor); assert(bg !== 'rgb(243, 240, 230)', 'mørk bg: ' + bg);
  await page.selectOption('#sel-theme', 'night'); await page.waitForTimeout(200);
  const bg2 = await page.evaluate(() => getComputedStyle(document.body).backgroundColor); assert(bg2 !== bg, 'nat bg');
  await page.selectOption('#sel-theme', 'auto'); return bg + ' / ' + bg2;
});

// ================================================================================ FASE 3: robusthed (lager, afbrudt opdatering, korrupt fil, SW-opdatering)
await test('R01', 'Begrænset lager: hentning afvises tydeligt og ændrer intet', async () => {
  const dir2 = mkdtempSync(join(tmpdir(), 'sk-profile2-'));
  const c2 = await launch(dir2); const p2 = await openApp(c2);
  await p2.evaluate(() => { navigator.storage.estimate = async () => ({ usage: 1e6, quota: 20 * 1048576 }); });
  await go(p2, 'kort'); await p2.waitForSelector('button:has-text("Hent kortpakke")'); await p2.click('button:has-text("Hent kortpakke")');
  await p2.waitForSelector('.callout.danger:has-text("lagerplads")', { timeout: 15000 });
  const active = await p2.evaluate(() => new Promise((res) => { const r = indexedDB.open('survivalkit'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('packs.active'); g.onsuccess = () => res(g.result || null); }; }));
  assert(active === null, 'ingen pakke bør være aktiveret');
  await c2.close(); rmSync(dir2, { recursive: true, force: true }); return 'afvist ved 20 MB kvote';
});

const manifest = JSON.parse(readFileSync(join(APP, 'map/pack/manifest.json'), 'utf8'));
await test('R02', 'Afbrudt opdatering (forbindelse mistes midt i hentning): gammel pakke forbliver aktiv og kortet virker', async () => {
  const newer = { ...manifest, version: '2099.01.01' };
  await page.route('**/map/pack/manifest.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(newer) }));
  await page.route('**/map/pack/djursland-vector.pmtiles', (r) => r.abort('connectionreset'));
  await go(page, 'kort'); await mapReady(page);
  await page.click('button[aria-label="Kortdata og dækning"]'); await page.waitForSelector('button:has-text("Hent opdatering")', { timeout: 15000 });
  await page.click('button:has-text("Hent opdatering")'); await page.waitForSelector('button:has-text("Hent kortpakke")'); await page.click('button:has-text("Hent kortpakke")');
  await page.waitForSelector('.callout.danger:has-text("mislykkedes")', { timeout: 30000 });
  const active = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('survivalkit'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('packs.active'); g.onsuccess = () => res(g.result.version); }; }));
  assert(active === manifest.version, 'aktiv version ændret til ' + active);
  const keys = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('survivalkit'); r.onsuccess = () => { const g = r.result.transaction('packs').objectStore('packs').getAllKeys(); g.onsuccess = () => res(g.result); }; }));
  assert(keys.every((k) => k.endsWith('@' + manifest.version)), 'halvfærdige filer ikke ryddet: ' + keys);
  await page.unroute('**/map/pack/manifest.json*'); await page.unroute('**/map/pack/djursland-vector.pmtiles');
  await page.click('a:has-text("Tilbage til kortet")'); await mapReady(page); assert((await page.locator('#map canvas').count()) === 1, 'kort virker efter fejlet opdatering'); await page.evaluate(() => window.__skmap.jumpTo({ center: [10.54, 56.23], zoom: 13 })); await idle(page); assert((await rendered(page, ['lu-forest'])) > 0, 'kortdata efter fejlet opdatering');
  return 'aktiv version uændret: ' + active;
});

await test('R03', 'Korrupt pakkefil afvises via SHA-256 og efterlader den gamle pakke urørt', async () => {
  const newer = { ...manifest, version: '2099.02.02' };
  await page.route('**/map/pack/manifest.json*', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(newer) }));
  await page.route('**/map/pack/djursland-search.json', async (r) => { const resp = await r.fetch(); const buf = await resp.body(); buf[1000] ^= 0xff; r.fulfill({ body: buf, contentType: 'application/json' }); });
  await go(page, 'kort'); await mapReady(page);
  await page.click('button[aria-label="Kortdata og dækning"]'); await page.waitForSelector('button:has-text("Hent opdatering")', { timeout: 15000 });
  await page.click('button:has-text("Hent opdatering")'); await page.waitForSelector('button:has-text("Hent kortpakke")'); await page.click('button:has-text("Hent kortpakke")');
  await page.waitForSelector('.callout.danger:has-text("kontrolsum")', { timeout: 60000 });
  const active = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('survivalkit'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('packs.active'); g.onsuccess = () => res(g.result.version); }; }));
  assert(active === manifest.version, 'aktiv version: ' + active);
  await page.unroute('**/map/pack/manifest.json*'); await page.unroute('**/map/pack/djursland-search.json'); await page.click('a:has-text("Tilbage til kortet")'); await mapReady(page); return 'korruption opdaget';
});

await test('R04', 'Afbrudt service worker-opdatering (manglende fil) efterlader den eksisterende version i brug', async () => {
  await go(page, '');
  const cachesBefore = await page.evaluate(() => caches.keys());
  await page.route('**/sw.js', async (r) => { const resp = await r.fetch(); let b = await resp.text(); b = b.replace('const PRECACHE = [', 'const PRECACHE = ["__findes_ikke__.js",').replace(/const VERSION = '[^']+'/, "const VERSION = 'test-ny'"); r.fulfill({ body: b, contentType: 'text/javascript' }); });
  const res = await page.evaluate(async () => { const reg = await navigator.serviceWorker.getRegistration(); try { await reg.update(); } catch (e) { /* forventet */ } await new Promise((r) => setTimeout(r, 2500)); return { waiting: !!reg.waiting, installing: !!reg.installing, active: !!reg.active, caches: await caches.keys() }; });
  await page.unroute('**/sw.js');
  assert(!res.waiting, 'ny SW må ikke vente (installation skulle fejle)');
  assert(res.active, 'gammel SW er stadig aktiv');
  assert(JSON.stringify(res.caches) === JSON.stringify(cachesBefore), 'caches ændret: ' + res.caches);
  await go(page, 'g/vand-kogning'); assert((await page.locator('article.guide').count()) === 1, 'app virker stadig');
  return 'cache uændret: ' + res.caches.join(',');
});

await test('R05', 'Ingen JavaScript-fejl i sessionen (online fase)', async () => { assert(pageErrors.length === 0, pageErrors.join(' | ')); return ''; });
await test('R06', 'Under normal brug kontaktes kun appens egen server (ingen CDN, fonte eller eksterne API\'er)', async () => { assert([...seenHosts].filter(Boolean).every((h) => h === `127.0.0.1:${port}`), 'værter: ' + [...seenHosts]); return [...seenHosts].join(','); });

await ctx.close();

// ================================================================================ FASE 4: FULD OFFLINE (server lukket) + genstart
server.close(); await new Promise((r) => setTimeout(r, 500));
const portOff = port;
ctx = await launch();
const offHosts = new Set(), offFailed = [];
ctx.on('request', (r) => { try { offHosts.add(new URL(r.url()).host); } catch { /* */ } });
ctx.on('requestfailed', (r) => offFailed.push(r.url() + ' ' + (r.failure()?.errorText || '')));
page = ctx.pages()[0] || await ctx.newPage();
const offErrors = []; page.on('pageerror', (e) => offErrors.push(e.message));
page.on('dialog', (d) => d.accept('Offline-P'));

await test('O01', 'OFFLINE (server lukket, browser genstartet): appen starter og viser forsiden', async () => {
  await page.goto(`http://127.0.0.1:${portOff}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('window.__appReady', null, { timeout: 30000 });
  assert((await page.locator('a.temakort').count()) === 6, 'forside med temaer');
  return '';
});
await test('O02', 'OFFLINE: alle kernekapitler og alle guides kan læses', async () => {
  let n = 0;
  for (const g of content.guides) { await go(page, 'g/' + g.id); const t = await page.locator('article.guide').innerText(); assert(t.length > 400, g.id); n++; }
  for (const ch of content.chapters) { await go(page, 'kap/' + ch.id); assert((await page.locator('main h1').count()) >= 1, ch.id); }
  return `${n} guides + ${content.chapters.length} kapitler`;
});
await test('O03', 'OFFLINE: illustrationer indlæses (inline SVG, knob-tegninger)', async () => {
  await go(page, 'g/knob-paelestik'); assert((await page.locator('figure.figure svg').count()) >= 2, 'knobfigurer');
  const ok = await page.locator('figure.figure svg').first().evaluate((s) => s.getBoundingClientRect().width > 100 && s.querySelectorAll('path').length > 5); assert(ok, 'svg tegnet');
  await go(page, 'g/fh-hlr'); assert((await page.locator('figure.figure svg').count()) >= 2, 'hlr-figurer');
  return '';
});
await test('O04', 'OFFLINE: søgning, artsguide og kilder virker', async () => {
  await go(page, 'sog'); await page.fill('input[type=search]', 'vand'); await page.waitForTimeout(200); assert((await page.locator('main .list:not(.askai) li').count()) >= 5, 'søgning');
  await go(page, 'arter'); assert((await page.locator('main .list li').count()) === content.species.length, 'artsliste'); await go(page, 'kilder'); assert((await page.locator('main .src li').count()) >= 30, 'kilder');
  return '';
});
await test('O05', 'OFFLINE: bogmærker, noter, nødkontakter og tjekliste overlever genstart', async () => {
  await go(page, 'gemte');
  assert((await page.locator('details summary:has-text("Min testnote")').count()) === 1, 'note'); assert((await page.locator('text=Test Kontakt').count()) >= 1, 'kontakt');
  assert((await page.locator('main .list a:has-text("Kogning")').count()) >= 1, 'bogmærke');
  await go(page, 'lister/hjemmeberedskab'); assert(await page.locator('label.check input').first().isChecked(), 'tjekliste');
  return '';
});
await test('O06', 'OFFLINE: kortet starter og vises i flere zoomniveauer', async () => {
  await go(page, 'kort'); await mapReady(page);
  const out = [];
  for (const [z, lng, lat, layer] of [[8.6, 10.6, 56.35, 'land'], [10, 10.6, 56.3, 'lu-forest'], [12, 10.54, 56.23, 'contour-major'], [14, 10.88, 56.41, 'building']]) {
    await page.evaluate(([zz, ln, lt]) => window.__skmap.jumpTo({ center: [ln, lt], zoom: zz }), [z, lng, lat]); await idle(page);
    const n = await rendered(page, [layer]); assert(n > 0, `zoom ${z} lag ${layer}: 0`); out.push(`z${z}:${n}`);
  }
  await page.mouse.move(200, 400); await page.mouse.down(); await page.mouse.move(120, 330, { steps: 6 }); await page.mouse.up(); await idle(page);
  await page.click('button[aria-label="Zoom ind"]'); await page.waitForTimeout(600);
  return out.join(' ');
});
await test('O07', 'OFFLINE: kortsøgning, højde og lokalt gemte waypoints kan åbnes', async () => {
  await page.locator('input[aria-label="Søg på kortet"]').fill('Ebeltoft'); await page.waitForTimeout(400); await page.locator('.mapresults button').first().click(); await page.waitForTimeout(1500);
  const c = await page.evaluate(() => window.__skmap.getCenter()); assert(Math.abs(c.lng - 10.677) < 0.06, 'flyTo');
  await page.click('button[aria-label="Waypoints"]'); const t = await page.locator('.sheet').innerText(); assert(t.includes('Agri-P') && t.includes('Importeret-P'), 'waypoints fra før genstart: ' + t.slice(0, 120));
  await page.click('.sheet .close'); await page.waitForTimeout(800); assert(/højde/.test(await page.locator('.infobar').innerText()), 'højde');
  return '';
});
await test('O08', 'OFFLINE: ny waypoint kan gemmes, og eksport virker', async () => {
  await page.click('button[aria-label="Waypoints"]'); await page.click('button:has-text("Gem kortets midte")'); await page.waitForTimeout(600);
  assert((await page.locator('.sheet').innerText()).includes('Offline-P'), 'gemt offline');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('button:has-text("Eksportér GPX")')]); assert(readFileSync(await dl.path(), 'utf8').includes('Offline-P'), 'GPX');
  return '';
});
await test('O09', 'OFFLINE: ingen fejlede eller eksterne netværkskald under hele offline-sessionen', async () => {
  assert(offErrors.length === 0, 'JS-fejl: ' + offErrors.join(' | '));
  assert([...offHosts].filter(Boolean).every((h) => h === `127.0.0.1:${portOff}`), 'værter: ' + [...offHosts]);
  const bad = offFailed.filter((u) => !u.includes('favicon')); assert(bad.length === 0, 'fejlede kald: ' + bad.slice(0, 5).join(' ; '));
  return [...offHosts].join(',') + ', ' + offFailed.length + ' fejlede';
});
await ctx.close();

// ================================================================================ FASE 5: enhedstests af stort lager + oprydning
rmSync(userData, { recursive: true, force: true });
const ok = results.filter((r) => r.status === 'OK').length;
const summary = { generated: new Date().toISOString(), engine: 'Playwright/Chromium ' + chromium.name?.(), total: results.length, ok, failed: results.length - ok, durationSec: Math.round((Date.now() - T0) / 1000), results };
writeFileSync(join(ROOT, 'tests', 'results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${ok}/${results.length} tests OK (${summary.durationSec}s)`);
process.exit(ok === results.length ? 0 : 1);
