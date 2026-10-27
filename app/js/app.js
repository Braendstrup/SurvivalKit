// Opstart, router, service worker og statuslinje.
import { h } from './util.js';
import { loadContent, store } from './store.js';
import * as db from './db.js';
import * as packs from './packs.js';
import * as V from './views.js';

const main = document.getElementById('main');
const ctx = { swReady: false, mapStatusText: '', rerender: (o) => { Object.assign(ctx, o || {}); render(); }, forceDownload: null };
let current = { cleanup: null };

// ---- router ---------------------------------------------------------------------------------------------------------
async function render() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (current.cleanup) { try { current.cleanup(); } catch { /* ignoreres */ } current.cleanup = null; }
  main.classList.remove('fullmap');
  let node, nav = parts[0] || 'home', title = 'Survivalkit';
  try {
    switch (parts[0]) {
      case undefined: node = V.pageHome(ctx); break;
      case 'nod': node = V.pageNod(); break;
      case 'kap': node = V.pageChapter(parts[1]); break;
      case 'g': node = V.pageGuide(parts[1]); title = store.byId.get(parts[1])?.item.titel || title; break;
      case 'arter': node = V.pageArter(); break;
      case 'a': node = V.pageArt(parts[1]); title = store.byId.get(parts[1])?.item.dansk || title; break;
      case 'lister': node = await V.pageList(parts[1] || store.content.lists[0].id); nav = 'home'; break;
      case 'sog': node = V.pageSearch(new URLSearchParams(query || '').get('q') || ''); break;
      case 'kilder': node = V.pageKilder(); nav = 'mig'; break;
      case 'mig': node = await V.pageMig(ctx); break;
      case 'kort': {
        const { pageMap } = await import('./mapview.js');
        const r = await pageMap(ctx);
        node = r.node; current.cleanup = r.cleanup; if (r.fullmap) main.classList.add('fullmap');
        break;
      }
      default: node = V.notFound();
    }
  } catch (e) {
    console.error(e);
    node = h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Der skete en fejl'), h('p', null, e.message), h('p', null, h('a', { href: '#/' }, 'Til forsiden'), ' · Ring 112 ved nød.'));
  }
  main.replaceChildren(node);
  document.title = title === 'Survivalkit' ? title : title + ' – Survivalkit';
  document.querySelectorAll('.bottom a').forEach((a) => a.classList.toggle('on', a.dataset.nav === nav));
  if (!main.classList.contains('fullmap')) window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

// ---- status ------------------------------------------------------------------------------------------------------------------
function netPill() {
  const el = document.getElementById('netpill');
  const on = navigator.onLine;
  el.textContent = on ? 'Online' : 'Offline – alt gemt virker';
  el.title = on ? 'Der er netforbindelse. Appen bruger den kun til valgfrie opdateringer.' : 'Ingen netforbindelse. Håndbog, søgning og hentet kort virker.';
}
addEventListener('online', () => { netPill(); checkUpdates(); }); addEventListener('offline', netPill);

async function mapStatus() {
  const a = await packs.getActive();
  ctx.mapStatusText = a ? `Hentet ✓ v${a.version}` : 'Kortpakke ikke hentet endnu';
}

// ---- service worker ---------------------------------------------------------------------------------------------------------
const bar = document.getElementById('updatebar');
function showUpdate(reg) {
  bar.hidden = false;
  bar.replaceChildren(h('span', null, 'Ny version af håndbogen er klar. Dine data bevares.'), h('button', { class: 'btn small', onclick: () => { reg.waiting?.postMessage({ type: 'SKIP_WAITING' }); } }, 'Opdater nu'));
}
let reloading = false;
async function setupSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const hadController = !!navigator.serviceWorker.controller;
    const reg = await navigator.serviceWorker.register('sw.js');
    // Genindlæs kun ved opdatering af en eksisterende version (ikke ved allerførste installation)
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading || !hadController) return; reloading = true; location.reload(); });
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(reg); });
    });
    await navigator.serviceWorker.ready; ctx.swReady = true;
    window.__swReady = true;
    window.__swReg = reg;
  } catch (e) { console.warn('Service worker kunne ikke registreres:', e.message); }
}
async function checkUpdates() {
  try { const reg = await navigator.serviceWorker?.getRegistration(); if (reg && navigator.onLine) await reg.update(); } catch { /* offline */ }
}

// ---- start ------------------------------------------------------------------------------------------------------------------------------
(async function boot() {
  netPill();
  try { await loadContent(); } catch (e) {
    main.replaceChildren(h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Indholdet kunne ikke indlæses'), h('p', null, e.message), h('p', null, 'Ring 112 ved nød.')));
    return;
  }
  await V.loadBookmarks(); await mapStatus();
  addEventListener('hashchange', render);
  await render();
  window.__appReady = true;
  setupSW().then(checkUpdates);
})();
