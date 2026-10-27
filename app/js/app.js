// Opstart, router, appens ramme (toplinje/bundmenu), service worker.
import { h } from './util.js';
import { loadContent, store } from './store.js';
import * as packs from './packs.js';
import * as V from './views.js';

const main = document.getElementById('main');
const top = document.querySelector('.top');
const backBtn = top.querySelector('.back'), titleEl = top.querySelector('.top-title'), btn112 = top.querySelector('.btn-112');
const ctx = { swReady: false, mapStatusText: '', rerender: (o) => { Object.assign(ctx, o || {}); render(); }, forceDownload: null };
let current = { cleanup: null, parent: '#/' };
let titleObserver = null;

// ---- ramme ----------------------------------------------------------------------------------------------------------
// Faneroden (Hjem, Nød, Kort, Gemte) har ingen tilbage-pil; undersider har.
const TAB_ROOTS = new Set(['', 'nod', 'kort', 'gemte']);
function setChrome({ title, back, show112, nav, root }) {
  top.classList.toggle('is-root', !!root);
  top.classList.toggle('is-home', root === 'home');
  backBtn.hidden = !back;
  titleEl.textContent = title || '';
  btn112.hidden = !show112;
  document.querySelectorAll('.bottom a').forEach((a) => { const on = a.dataset.nav === nav; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}
// Sidetitlen i toplinjen vises først, når sidens egen overskrift er rullet ud af syne
function watchTitle() {
  titleObserver?.disconnect(); top.classList.remove('scrolled');
  const h1 = main.querySelector('h1:not(.sr-only)');
  if (!h1 || !('IntersectionObserver' in window)) { top.classList.toggle('scrolled', !h1); return; }
  titleObserver = new IntersectionObserver(([e]) => top.classList.toggle('scrolled', !e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' });
  titleObserver.observe(h1);
}
// Tilbage: inden for appen bruges browserhistorikken; ellers sidens logiske forælder
backBtn.addEventListener('click', () => { if ((history.state?.n || 0) > 0) history.back(); else location.hash = current.parent; });

// ---- router ---------------------------------------------------------------------------------------------------------
let lastN = 0, firstRender = true;
async function render() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const q = new URLSearchParams(query || '').get('q') || '';
  // omdirigeringer fra tidligere routes
  if (parts[0] === 'mig') return location.replace('#/indstillinger');
  if (parts[0] === 'lister' && !parts[1]) return location.replace('#/gemte');
  // historikdybde (til tilbage-pilen)
  if (history.state?.n == null) history.replaceState({ n: firstRender ? 0 : lastN + 1 }, '');
  lastN = history.state.n; firstRender = false;

  if (current.cleanup) { try { current.cleanup(); } catch { /* ignoreres */ } current.cleanup = null; }
  main.classList.remove('fullmap');
  const c = store.content;
  let node, title = '', nav = 'home', parent = '#/', show112 = false;
  try {
    switch (parts[0]) {
      case undefined: node = V.pageHome(ctx); break;
      case 'nod': node = V.pageNod(); title = 'Nød'; nav = 'nod'; show112 = true; break;
      case 'tema': { const t = c.temaer.find((x) => x.id === parts[1]); node = V.pageTema(parts[1]); title = t?.titel || ''; break; }
      case 'kap': { const k = c.chapters.find((x) => x.id === parts[1]); node = V.pageChapter(parts[1]); title = k?.titel || ''; if (k) parent = '#/tema/' + V.temaOf(k.id)?.id; break; }
      case 'g': {
        const g = c.guides.find((x) => x.id === parts[1]);
        node = V.pageGuide(parts[1], q); title = g?.titel || ''; show112 = V.isEmergencyGuide(g);
        if (g) parent = '#/tema/' + V.temaOf(g.kap)?.id;
        break;
      }
      case 'arter': node = V.pageArter(); title = 'Artsguide'; parent = '#/tema/mad-natur'; break;
      case 'a': node = V.pageArt(parts[1]); title = store.byId.get(parts[1])?.item.dansk || ''; parent = '#/arter'; break;
      case 'lister': node = await V.pageList(parts[1]); title = c.lists.find((x) => x.id === parts[1])?.titel || ''; nav = 'gemte'; parent = '#/gemte'; break;
      case 'gemte': node = await V.pageGemte(); title = 'Gemte'; nav = 'gemte'; break;
      case 'sog': node = V.pageSearch(q); title = 'Søg'; break;
      case 'spoerg': node = V.pageChat(q); title = 'Spørg AI'; parent = '#/sog'; break;
      case 'kilder': node = V.pageKilder(); title = 'Kilder'; parent = '#/indstillinger'; break;
      case 'indstillinger': node = await V.pageSettings(ctx); title = 'Indstillinger'; break;
      case 'kort': {
        const { pageMap } = await import('./mapview.js');
        const r = await pageMap(ctx);
        node = r.node; current.cleanup = r.cleanup; if (r.fullmap) main.classList.add('fullmap');
        title = 'Kort'; nav = 'kort';
        break;
      }
      default: node = V.notFound();
    }
  } catch (e) {
    console.error(e);
    node = h('div', { class: 'callout danger' }, h('span', { class: 'ctitle' }, 'Der skete en fejl'), h('p', null, e.message), h('p', null, h('a', { href: '#/' }, 'Til forsiden'), ' · Ring 112 ved nød.'));
  }
  current.parent = parent;
  main.replaceChildren(node);
  const key = parts[0] || '';
  setChrome({ title, back: !TAB_ROOTS.has(key), show112, nav, root: key === '' ? 'home' : TAB_ROOTS.has(key) });
  document.title = title ? title + ' – Survivalkit' : 'Survivalkit';
  if (!main.classList.contains('fullmap')) window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  watchTitle();
  node.afterMount?.();
}

// ---- status ------------------------------------------------------------------------------------------------------------------
addEventListener('online', () => { V.toast('Online igen'); checkUpdates(); });
addEventListener('offline', () => V.toast('Offline – alt gemt virker stadig'));
// Udskrift: vis alle foldede afsnit
const opened = [];
addEventListener('beforeprint', () => { for (const d of document.querySelectorAll('details:not([open])')) { d.open = true; opened.push(d); } });
addEventListener('afterprint', () => { while (opened.length) opened.pop().open = false; });

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
