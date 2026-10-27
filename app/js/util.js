// Små hjælpere: DOM-bygning uden innerHTML, mini-markup til indhold, datoformatering.

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  append(el, kids);
  return el;
}
export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return el;
}
export function svgEl(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

// ---- mini-markup -----------------------------------------------------------------------------
// **fed**  *kursiv*  [[id]] / [[id|tekst]] (internt link)  {D} {T} {F} (videnstype-mærker)  \n (linjeskift)
export const EVIDENCE = {
  D: ['Dokumenteret', 'Understøttet af en navngiven myndigheds- eller fagkilde (se kilder).'],
  T: ['Tommelfingerregel', 'Praktisk erfaringsregel uden præcis dokumentation – brug som pejling, ikke som garanti.'],
  F: ['Faglig vurdering', 'Kræver uddannelse, erfaring eller en professionel vurdering. Gæt ikke.'],
};
let linkResolver = (id) => ({ href: '#/g/' + id, label: id });
export function setLinkResolver(fn) { linkResolver = fn; }

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\[[^\]]+\]\]|\{[DTF]\}|\n)/g;
export function inline(text) {
  const frag = document.createDocumentFragment();
  for (const part of String(text ?? '').split(TOKEN)) {
    if (!part) continue;
    if (part === '\n') frag.append(h('br'));
    else if (part.startsWith('**')) frag.append(h('strong', null, inline(part.slice(2, -2))));
    else if (part.startsWith('[[')) {
      const [id, label] = part.slice(2, -2).split('|');
      const r = linkResolver(id.trim());
      frag.append(h('a', { href: r.href, class: 'xref' }, label || r.label));
    } else if (/^\{[DTF]\}$/.test(part)) {
      const k = part[1];
      frag.append(h('span', { class: 'ev ev-' + k, title: EVIDENCE[k][1] }, EVIDENCE[k][0]));
    } else if (part.startsWith('*') && part.length > 2) frag.append(h('em', null, part.slice(1, -1)));
    else frag.append(part);
  }
  return frag;
}

export const fmtDate = (ts) => new Date(ts).toLocaleString('da-DK', { dateStyle: 'medium', timeStyle: 'short' });
export const fmtMB = (b) => b == null ? '–' : (b / 1048576).toFixed(b < 10485760 ? 1 : 0).replace('.', ',') + ' MB';
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
export const norm = (s) => String(s ?? '').toLowerCase().normalize('NFC');
export function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
export function download(name, text, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
