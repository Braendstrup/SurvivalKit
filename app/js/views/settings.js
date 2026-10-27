// Indstillinger (visning, kort og position, offline og lagring, om) samt kildeoversigten.
import { h, fmtMB, download } from '../util.js';
import { store } from '../store.js';
import * as db from '../db.js';
import * as packs from '../packs.js';
import { ic, toast, kontrolBadge, row } from './ui.js';
import { aiSettingsCard } from './chat.js';

const stat = (label, val) => h('div', { class: 'stat' }, h('span', null, label), h('strong', null, val));

export async function pageSettings(ctx) {
  const el = h('div', { class: 'settings' });
  el.append(h('h1', null, 'Indstillinger'));

  const theme = document.documentElement.dataset.theme || 'auto';
  const size = document.documentElement.dataset.size || 'm';
  const setPref = (k, v) => { try { localStorage.setItem('sk.' + k, v); } catch { /* ignoreres */ } document.documentElement.dataset[k] = v; };
  el.append(h('h2', { class: 'subhead' }, 'Visning'), h('div', { class: 'card' },
    h('label', { for: 'sel-theme' }, 'Udseende'), h('select', { id: 'sel-theme', onchange: (e) => setPref('theme', e.target.value) }, [['auto', 'Automatisk'], ['light', 'Lyst'], ['dark', 'Mørkt'], ['night', 'Nat (rødtonet, lav blænding)']].map(([v, l]) => h('option', { value: v, selected: theme === v }, l))),
    h('label', { for: 'sel-size' }, 'Tekststørrelse'), h('select', { id: 'sel-size', onchange: (e) => setPref('size', e.target.value) }, [['m', 'Normal'], ['l', 'Stor'], ['xl', 'Ekstra stor']].map(([v, l]) => h('option', { value: v, selected: size === v }, l)))));

  const lastpos = await db.kvGet('lastpos.enabled', false);
  el.append(h('h2', { class: 'subhead' }, 'Kort og position'), h('div', { class: 'card' },
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: lastpos, onchange: async (e) => { await db.kvSet('lastpos.enabled', e.target.checked); if (!e.target.checked) await db.kvDel('lastpos'); toast(e.target.checked ? 'Senest kendte position gemmes lokalt, mens kortet bruger GPS' : 'Gemt position slettet'); } }),
      h('span', null, 'Gem min senest registrerede position lokalt (kun på enheden, kun når kortets GPS er aktiv)'))));

  el.append(h('h2', { class: 'subhead' }, 'Offline og lagring'), await dataCard(ctx));
  el.append(h('h2', { class: 'subhead' }, 'AI-assistent'), await aiSettingsCard());

  el.append(h('h2', { class: 'subhead' }, 'Om'), h('ul', { class: 'list' },
    row('#/kilder', 'Kilder og verificering', 'Hvad er kontrolleret, og mod hvad'),
    row('#/g/om-begraensninger', 'Begrænsninger', 'Hvad appen ikke kan love'),
    row('#/kap/om', 'Om appen og offline', 'Version ' + store.content.build.version)));
  return el;
}

async function dataCard(ctx) {
  const box = h('div', { class: 'card' });
  const info = await db.storageInfo(); const active = await packs.getActive();
  box.append(
    stat('Forbindelse', navigator.onLine ? 'Online' : 'Offline – alt gemt virker'),
    stat('Appversion', store.content.build.version),
    stat('Håndbog (tekst, illustrationer, kilder)', ctx.swReady ? 'Gemt offline ✓' : 'Ikke gemt endnu – kræver første besøg online'),
    stat('Kortpakke Djursland', active ? `Hentet ✓ (v${active.version})` : 'IKKE hentet'),
    stat('Lager brugt / tilladt', `${fmtMB(info.usage)} / ${fmtMB(info.quota)}`),
    stat('Beskyttet mod automatisk oprydning', info.persisted == null ? 'ukendt' : info.persisted ? 'Ja' : 'Nej (browseren kan frigøre lager)'));
  box.append(h('div', { class: 'btnrow' }, h('a', { class: 'btn', href: '#/kort' }, ic('map'), active ? 'Åbn kort / opdater' : 'Hent kortpakke'),
    h('button', { class: 'btn secondary', onclick: async () => { const ok = await db.requestPersistence(); toast(ok ? 'Lageret er nu beskyttet' : 'Browseren gav ikke tilladelse (prøv at installere appen på startskærmen)'); } }, 'Beskyt lager')));
  box.append(h('p', { class: 'small muted' }, 'Browserlager kan i sjældne tilfælde ryddes af operativsystemet, især ved lav lagerplads eller hvis siden ikke bruges længe. Eksportér derfor vigtige noter og waypoints.'));
  box.append(h('div', { class: 'btnrow' },
    h('button', { class: 'btn secondary', onclick: async () => {
      const data = { app: 'survivalkit', version: 1, exported: new Date().toISOString(), kv: await db.kvAll(), waypoints: await db.wpAll() };
      delete data.kv['packs.active']; delete data.kv['lastpos'];
      download('survivalkit-data.json', JSON.stringify(data, null, 1), 'application/json');
    } }, ic('down'), 'Eksportér mine data (JSON)'),
    h('label', { class: 'btn secondary', style: 'margin:0' }, 'Importér data (JSON)', h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => {
      try { const d = JSON.parse(await e.target.files[0].text()); if (d.app !== 'survivalkit') throw new Error('Ikke en Survivalkit-fil'); for (const [k, v] of Object.entries(d.kv || {})) await db.kvSet(k, v); for (const w of d.waypoints || []) await db.wpPut(w); toast('Importeret – genindlæser'); setTimeout(() => location.reload(), 800); } catch (err) { toast('Import mislykkedes: ' + err.message); }
    } }))));
  box.append(h('div', { class: 'btnrow' }, h('button', { class: 'btn danger small', onclick: async () => { if (!confirm('Slet ALLE lokale data: noter, kontakter, waypoints, bogmærker og kortpakke?')) return; await packs.removePacks(); await db.wipeAll(); toast('Alt er slettet'); setTimeout(() => location.reload(), 600); } }, 'Slet alle lokale data')));
  return box;
}

export function pageKilder() {
  const c = store.content, el = h('div');
  el.append(h('h1', null, 'Kilder og verificering'),
    h('p', { class: 'lede' }, 'Alle kilder er gemt lokalt. "Kontrolleret" betyder, at den navngivne kildeside rent faktisk er læst og sammenholdt med guiden på datoen. Hvor kilden ikke understøtter en påstand, står det.'));
  el.append(h('h2', { class: 'subhead' }, 'Kilder'), h('ul', { class: 'src' }, c.sources.map((s) => h('li', null, h('strong', null, s.navn), s.url ? [' – ', h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.url)] : null,
    h('br'), 'Understøtter: ', s.stoetter, s.begraensning ? [h('br'), 'Begrænsning: ', s.begraensning] : null, h('br'), h('span', { class: 'muted' }, 'Sidst kontrolleret: ' + (s.dato || 'ikke kontrolleret'))))));
  const bad = c.guides.filter((g) => g.kontrol?.status !== 'kontrolleret'), badA = c.species.filter((s) => s.kontrol?.status !== 'kontrolleret');
  el.append(h('h2', { class: 'subhead' }, 'Indhold der endnu ikke er fuldt verificeret'),
    h('p', { class: 'small muted' }, 'Gennemsigtighed: disse afsnit er skrevet ud fra almen faglig viden eller kun delvist kontrolleret. De er markeret på selve siden.'),
    h('ul', { class: 'list' }, [...bad.map((g) => row('#/g/' + g.id, g.titel, g.kontrol?.note || '', kontrolBadge(g.kontrol))),
      ...badA.map((s) => row('#/a/' + s.id, s.dansk + ' (art)', s.kontrol?.note || '', kontrolBadge(s.kontrol)))]));
  return el;
}
