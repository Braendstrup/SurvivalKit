// Manuel afprøvning med RIGTIG sprogmodel (Gemma 4 E2B) i appen – ikke en del af den normale testsuite (tager lang tid).
// 1) online: hent modellen via appens egen download (Hugging Face, range, OPFS, SHA-256) og stil et spørgsmål
// 2) offline: server lukket, browser genstartet med samme profil, netværk slået fra – stil et spørgsmål igen
// Kræver WebGPU; uden GPU bruges SwiftShader (CPU-emulering, meget langsomt). Skriver tests/ai_real_results.json.
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serve } from './serve.mjs';
const { chromium } = createRequire(process.env.PW_NODE_MODULES || '/opt/node-tools/node_modules/')('playwright');
const ARGS = ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-angle=swiftshader', '--use-webgpu-adapter=swiftshader'];
const dir = mkdtempSync(join(tmpdir(), 'sk-ai-'));
const out = { started: new Date().toISOString(), gpu: 'SwiftShader (CPU-emuleret WebGPU)', steps: [] };
const log = (s) => { console.log(new Date().toISOString().slice(11, 19), s); };
const step = (name, ok, detail) => { out.steps.push({ name, ok, detail }); log((ok ? 'OK   ' : 'FEJL ') + name + ' – ' + detail); };
const Q1 = 'Hvor længe skal man koge vand for at gøre det sikkert at drikke?';

let { server, port } = await serve(join(process.cwd(), 'app'));
let ctx = await chromium.launchPersistentContext(dir, { args: ARGS, viewport: { width: 420, height: 860 } });
let page = ctx.pages()[0];
page.on('console', (m) => { if (m.type() === 'error') log('console: ' + m.text().slice(0, 200)); });
await page.goto(`http://127.0.0.1:${port}/#/spoerg`); await page.waitForFunction('window.__appReady');
await page.waitForFunction('window.__swReady', null, { timeout: 30000 });
try {
  await page.waitForSelector('.setup .models button', { timeout: 30000 });
  const t0 = Date.now();
  await page.locator('.setup li.model:has-text("Gemma 4 E2B") button').click();
  await page.waitForSelector('.enginechip', { timeout: 30 * 60000 });
  const active = await page.evaluate(() => new Promise((r) => { const q = indexedDB.open('survivalkit'); q.onsuccess = () => { const g = q.result.transaction('kv').objectStore('kv').get('ai.active'); g.onsuccess = () => r(g.result); }; }));
  step('Download + SHA-256 + aktivering (E2B, 2,0 GB)', active?.id === 'gemma4-e2b', `${Math.round((Date.now() - t0) / 1000)} s, aktiv: ${JSON.stringify(active)}`);
  const caches = await page.evaluate(() => caches.keys()); step('AI-runtime cachet til offline', caches.some((k) => k.startsWith('sk-ai-')), caches.join(', '));
  for (const [phase, q] of [['online', Q1]]) {
    const t1 = Date.now();
    await page.fill('textarea[aria-label="Spørgsmål"]', q); await page.press('textarea[aria-label="Spørgsmål"]', 'Enter');
    await page.waitForSelector('.msg.ai .sources, .msg.ai .refused, .msg.ai .callout.warn', { timeout: 60 * 60000 });
    const txt = await page.locator('.msg.ai').last().innerText();
    step(`Svar med rigtig model (${phase})`, /minut/i.test(txt) && (await page.locator('.msg.ai').last().locator('a[href="#/g/vand-kogning"]').count()) >= 1, `${Math.round((Date.now() - t1) / 1000)} s: ${txt.replace(/\s+/g, ' ').slice(0, 400)}`);
  }
} catch (e) { step('Online-fase', false, e.message.slice(0, 300)); }
await ctx.close(); server.close(); await new Promise((r) => setTimeout(r, 500));

// offline
ctx = await chromium.launchPersistentContext(dir, { args: ARGS, viewport: { width: 420, height: 860 } });
page = ctx.pages()[0];
const ext = []; ctx.on('request', (r) => { if (!r.url().startsWith(`http://127.0.0.1:${port}/`)) ext.push(r.url()); });
try {
  await page.goto(`http://127.0.0.1:${port}/#/spoerg`, { waitUntil: 'domcontentloaded' }); await page.waitForFunction('window.__appReady', null, { timeout: 30000 });
  await ctx.setOffline(true);
  await page.waitForSelector('.enginechip', { timeout: 60000 });
  const t1 = Date.now(), q = 'Hvordan binder jeg et pælestik?';
  await page.fill('textarea[aria-label="Spørgsmål"]', q); await page.press('textarea[aria-label="Spørgsmål"]', 'Enter');
  await page.waitForSelector('.msg.ai .sources, .msg.ai .refused, .msg.ai .callout.warn', { timeout: 60 * 60000 });
  const txt = await page.locator('.msg.ai').last().innerText();
  step('Svar med rigtig model OFFLINE (server lukket, genstart, netværk slået fra)', (await page.locator('.msg.ai .sources a').count()) >= 1 && !/fejlede/i.test(txt), `${Math.round((Date.now() - t1) / 1000)} s: ${txt.replace(/\s+/g, ' ').slice(0, 400)}`);
  step('Ingen eksterne kald offline', ext.length === 0, ext.slice(0, 3).join(' ; ') || 'ingen');
} catch (e) { step('Offline-fase', false, e.message.slice(0, 300)); }
await ctx.close(); rmSync(dir, { recursive: true, force: true });
out.finished = new Date().toISOString();
writeFileSync(join(process.cwd(), 'tests', 'ai_real_results.json'), JSON.stringify(out, null, 1));
process.exit(out.steps.every((s) => s.ok) ? 0 : 1);
