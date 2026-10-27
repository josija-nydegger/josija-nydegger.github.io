// Inhalt (<body>) eines Builds mit den Live-Seiten der Referenz vergleichen (_tests/referenz/live/, siehe referenz-sichern.js).
// Start: node _tests/inhalt-vergleich.js [Build-Ordner]   (Standard: dist/ im Hauptordner)
// Ignoriert Leerraum zwischen Tags, HTML-Kommentare und <script>. Die Skripte prüft website.test.js bzw. der Browser.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const LIVE = path.join(__dirname, 'referenz', 'live');

function body(file) {
  const doc = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  doc.querySelectorAll('script').forEach(s => s.remove());
  const walker = doc.createTreeWalker(doc.body, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach(c => c.remove());
  return doc.body.innerHTML.replace(/>\s+</g, '><').replace(/\s+/g, ' ')
    // Leerraum am Anfang/Ende von Block-Elementen zeigt der Browser nicht an (Astro entfernt ihn, Jekyll nicht)
    .replace(/(<(?:p|li|h[1-6]|div|section|ul|nav|article|footer|main)(?: [^>]*)?>) /g, '$1')
    .replace(/ (<\/(?:p|li|h[1-6]|div|section|ul|nav|article|footer|main)>)/g, '$1')
    .trim();
}

let fails = 0;
const pages = require('./referenz/head.json');
for (const url of Object.keys(pages)) {
  const rel = url.endsWith('/') ? url.slice(1) + 'index.html' : url.slice(1);
  const file = path.join(DIST, rel);
  if (!fs.existsSync(file)) { fails++; console.log('FAIL ' + url + ': Datei fehlt'); continue; }
  const got = body(file), want = body(path.join(LIVE, rel));
  if (got === want) { console.log('OK   ' + url + ' (' + want.length + ' Zeichen)'); continue; }
  fails++;
  let i = 0;
  while (got[i] === want[i]) i++;
  console.log('FAIL ' + url + ' ab Zeichen ' + i + ':\n  ist:  …' + got.slice(Math.max(0, i - 80), i + 120) + '\n  soll: …' + want.slice(Math.max(0, i - 80), i + 120));
}
console.log(fails ? fails + ' FEHLER' : 'Alle Seiteninhalte wie live');
process.exitCode = fails ? 1 : 0;
