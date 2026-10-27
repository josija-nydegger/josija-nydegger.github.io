// Seitenköpfe eines Builds mit der Live-Referenz vergleichen (_tests/referenz/head.json, siehe referenz-sichern.js).
// Start: node _tests/head-vergleich.js [Build-Ordner]   (Standard: dist/ im Hauptordner)
// Verglichen werden <title>, alle meta name/property, alle <link> und das JSON-LD (Reihenfolge der Schlüssel egal).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const ref = require('./referenz/head.json');

// Bewusste Abweichungen von Jekyll (siehe _notizen/astro-migration.md)
const ALLOWED = {
  'meta generator': 'Jekyll-spezifisch, entfällt',
  '/en/ title': 'englischer Untertitel statt deutschem'
};

const outFile = url => url.endsWith('/') ? url.slice(1) + 'index.html' : url.slice(1);
function headOf(file) {
  const doc = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  return {
    title: doc.title,
    meta: [...doc.head.querySelectorAll('meta[name], meta[property]')].map(m => [m.getAttribute('name') || m.getAttribute('property'), m.getAttribute('content')]),
    link: [...doc.head.querySelectorAll('link')].map(l => Object.fromEntries([...l.attributes].map(a => [a.name, a.value]))),
    jsonld: [...doc.head.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent))
  };
}
const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort()) : x);

let fails = 0, warns = 0;
const report = (allowedKey, msg) => {
  if (ALLOWED[allowedKey]) { warns++; console.log('WARN ' + msg + ' (erlaubt: ' + ALLOWED[allowedKey] + ')'); }
  else { fails++; console.log('FAIL ' + msg); }
};

for (const [url, want] of Object.entries(ref)) {
  const file = path.join(DIST, outFile(url));
  if (!fs.existsSync(file)) { report(null, url + ': Datei fehlt (' + outFile(url) + ')'); continue; }
  const got = headOf(file);
  const before = fails;
  if (got.title !== want.title) report(url + ' title', `${url} title: "${got.title}" statt "${want.title}"`);
  const gm = new Map(got.meta), wm = new Map(want.meta);
  for (const [k, v] of wm) if (gm.get(k) !== v) report('meta ' + k, `${url} meta ${k}: ${JSON.stringify(gm.get(k))} statt ${JSON.stringify(v)}`);
  for (const [k, v] of gm) if (!wm.has(k)) report('meta ' + k, `${url} meta ${k} zusätzlich: ${JSON.stringify(v)}`);
  const gl = got.link.map(canon), wl = want.link.map(canon);
  if (gl.join('\n') !== wl.join('\n')) report(url + ' link', `${url} link:\n  ist:  ${gl.join('\n        ')}\n  soll: ${wl.join('\n        ')}`);
  const gj = got.jsonld.map(canon).sort(), wj = want.jsonld.map(canon).sort();
  if (gj.join('\n') !== wj.join('\n')) report(url + ' jsonld', `${url} JSON-LD:\n  ist:  ${gj.join('\n        ')}\n  soll: ${wj.join('\n        ')}`);
  if (fails === before) console.log('OK   ' + url);
}
console.log(fails ? fails + ' FEHLER' : 'Alle Seitenköpfe wie live' + (warns ? ` (${warns} erlaubte Abweichungen)` : ''));
process.exitCode = fails ? 1 : 0;
