// Website als Ganzes: mit dem Jekyll-Nachbau bauen und das Ergebnis prüfen.
// Start: node _tests/website.test.js   (braucht einmalig "npm install" im Ordner _tests)
// Der Nachbau ist eine Annäherung an Jekyll (siehe jekyll-nachbau.js). Massgebend bleibt der echte Build auf GitHub.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
execFileSync(process.execPath, [path.join(__dirname, 'jekyll-nachbau.js'), ROOT, OUT], { stdio: 'pipe' });

let fails = 0;
const ok = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (cond || !info ? '' : ': ' + info)); };
const read = p => fs.readFileSync(path.join(OUT, p), 'utf8');
const walk = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name), base + e.name + '/') : [base + e.name]);

// 1. Alle wichtigen Seiten entstehen
const pages = ['index.html', 'cv.html', 'en/index.html', 'en/cv.html', 'tools/index.html', 'en/tools/index.html', 'feed.xml', 'en/feed.xml', '404.html'];
for (const p of pages) ok('Seite gebaut: ' + p, fs.existsSync(path.join(OUT, p)));

// 2. Kein Liquid-Code übrig
const built = walk(OUT).filter(p => /\.(html|xml)$/.test(p));
for (const p of built) {
  const s = read(p);
  ok('Kein Liquid übrig: ' + p, !/\{\{|\{%/.test(s), (s.match(/.{0,40}(\{\{|\{%).{0,40}/) || [''])[0]);
}

// 3. E-Mail nie im Klartext (weder im Repo noch in der gebauten Seite)
const repoFiles = walk(ROOT).filter(p => !/^(\.git|\.astro|node_modules|dist|_tests\/node_modules|public\/assets\/katex)\//.test(p) && /\.(html|md|yml|xml|txt|css|js)$/.test(p));
const mailRe = /[A-Za-z0-9._%+-]+@(josija-nydegger\.ch|gmail\.com)/;
for (const p of repoFiles) if (!p.startsWith('_tests/')) ok('Keine E-Mail im Klartext: ' + p, !mailRe.test(fs.readFileSync(path.join(ROOT, p), 'utf8')));
for (const p of built) ok('Keine E-Mail im Klartext (gebaut): ' + p, !mailRe.test(read(p)));

// 4. Sprachumschalter und hreflang: Gegenstücke verweisen aufeinander
const pairs = [['index.html', 'en/index.html', '/', '/en/'], ['cv.html', 'en/cv.html', '/cv.html', '/en/cv.html'], ['tools/index.html', 'en/tools/index.html', '/tools/', '/en/tools/']];
for (const [de, en, deUrl, enUrl] of pairs) {
  ok('Umschalter DE → EN: ' + de, read(de).includes('href="' + enUrl + '" hreflang="en"'));
  ok('Umschalter EN → DE: ' + en, read(en).includes('href="' + deUrl + '" hreflang="de"'));
  ok('hreflang x-default: ' + de, /hreflang="x-default"/.test(read(de)));
}

// 5. Interne Links und Bilder zeigen auf vorhandene Dateien
const exists = url => {
  const u = url.split('#')[0].split('?')[0];
  if (!u || u === '/') return true;
  const rel = decodeURIComponent(u.replace(/^\//, ''));
  const cands = [rel, rel + 'index.html', rel.replace(/\/$/, '') + '/index.html'];
  return cands.some(c => fs.existsSync(path.join(OUT, c)) || fs.existsSync(path.join(ROOT, 'public', c)));
};
for (const p of built.filter(p => p.endsWith('.html'))) {
  const s = read(p).replace(/<!--[\s\S]*?-->/g, '');   // Beispiel-Links in HTML-Kommentaren ignorieren
  for (const m of s.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (m[1].startsWith('//')) continue;
    ok('Link vorhanden: ' + m[1] + ' (in ' + p + ')', exists(m[1]));
  }
}

// 6. Feeds beginnen mit der XML-Deklaration
for (const f of ['feed.xml', 'en/feed.xml']) ok('Feed gültig beginnend: ' + f, read(f).startsWith('<?xml'));

fs.rmSync(OUT, { recursive: true, force: true });
console.log(fails ? fails + ' FEHLER' : 'Alle Tests bestanden');
process.exitCode = fails ? 1 : 0;
