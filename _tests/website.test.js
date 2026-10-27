// Website als Ganzes: mit Astro bauen und das Ergebnis prüfen.
// Start: node _tests/website.test.js   (braucht einmalig "npm install" im Hauptordner)
// Baut zweimal in temporäre Ordner (dist/ bleibt unberührt):
//   A) mit den echten Inhalten: Seiten, Adressen der Referenz, E-Mail, Sprachumschalter, Links, Feeds, Sitemap
//   B) mit den Testbeiträgen aus _tests/fixtures/blog: Blog-Funktionen (Formeln, Datum, Lesezeit, älter/neuer, Feeds, Sitemap)
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const ASTRO = path.join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs');

// Adressen der bisherigen Website (referenz/dateien.txt), die bewusst entfallen sind (siehe _notizen/astro-migration.md)
const REMOVED = ['assets/katex/katex.min.js', 'assets/katex/contrib/auto-render.min.js'];

function build(env = {}) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
  // Inhalts-Cache löschen, sonst mischt Astro Beiträge aus dem vorherigen Build ein
  fs.rmSync(path.join(ROOT, 'node_modules', '.astro', 'data-store.json'), { force: true });
  execFileSync(process.execPath, [ASTRO, 'build', '--outDir', out, '--silent'], { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'pipe' });
  return out;
}

let fails = 0;
const ok = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (cond || info === undefined ? '' : ': ' + info)); };
// Alle Dateien unter dir (relativ), Ordner, auf die skip passt, werden gar nicht erst betreten
const walk = (dir, base = '', skip = null) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const rel = base + e.name;
  if (!e.isDirectory()) return [rel];
  return skip && skip.test(rel + '/') ? [] : walk(path.join(dir, e.name), rel + '/', skip);
});
const site = out => ({
  has: p => fs.existsSync(path.join(out, p)),
  read: p => fs.readFileSync(path.join(out, p), 'utf8'),
  doc: p => new JSDOM(fs.readFileSync(path.join(out, p), 'utf8')).window.document,
  xml: p => new JSDOM(fs.readFileSync(path.join(out, p), 'utf8'), { contentType: 'application/xml' }).window.document
});

// Gemeinsame Prüfungen für beide Builds: interne Links, Feeds, Sitemap
function common(label, out) {
  const s = site(out);
  const built = walk(out);
  const exists = url => {
    const rel = decodeURIComponent(url.split('#')[0].split('?')[0].replace(/^\//, ''));
    return [rel, rel + 'index.html', rel.replace(/\/$/, '') + '/index.html', rel || 'index.html'].some(s.has);
  };
  for (const p of built.filter(p => p.endsWith('.html'))) {
    const html = s.read(p).replace(/<!--[\s\S]*?-->/g, '');   // Beispiel-Links in HTML-Kommentaren ignorieren
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (m[1].startsWith('//')) continue;
      ok(`${label}: Link vorhanden: ${m[1]} (in ${p})`, exists(m[1]));
    }
  }
  for (const f of ['feed.xml', 'en/feed.xml', 'sitemap.xml']) {
    ok(`${label}: ${f} beginnt mit XML-Deklaration`, s.has(f) && s.read(f).startsWith('<?xml'));
    ok(`${label}: ${f} ist gültiges XML`, s.has(f) && !s.xml(f).querySelector('parsererror'));
  }
  const locs = s.has('sitemap.xml') ? [...s.xml('sitemap.xml').getElementsByTagName('loc')].map(l => l.textContent) : [];
  for (const loc of locs) ok(`${label}: Sitemap-Adresse vorhanden: ${loc}`, loc.startsWith('https://josija-nydegger.ch/') && exists(loc.slice('https://josija-nydegger.ch'.length)));
  return locs;
}

// ===== A) Echte Inhalte =====
const A = build();
try {
  const a = site(A);
  const builtA = walk(A);

  // 1. Alle wichtigen Seiten entstehen
  for (const p of ['index.html', 'cv.html', 'en/index.html', 'en/cv.html', 'tools/index.html', 'en/tools/index.html', 'feed.xml', 'en/feed.xml', 'sitemap.xml', 'robots.txt', '404.html', 'CNAME'])
    ok('Seite gebaut: ' + p, a.has(p));

  // 2. Keine Adresse der bisherigen Website geht verloren
  const refFiles = fs.readFileSync(path.join(__dirname, 'referenz', 'dateien.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('\t')[1]);
  for (const f of refFiles.filter(f => !REMOVED.includes(f))) ok('Adresse der Referenz vorhanden: ' + f, a.has(f));
  for (const f of REMOVED) ok('Bewusst entfernt: ' + f, !a.has(f));

  // 3. Keine Reste aus Vorlagen (ohne die unveränderten Dateien aus public/, z. B. Tools mit eigenem JavaScript)
  const generated = builtA.filter(p => /\.(html|xml)$/.test(p) && !fs.existsSync(path.join(ROOT, 'public', p)));
  for (const p of generated) {
    const text = a.read(p);
    ok('Keine Vorlagen-Reste: ' + p, !/\bundefined\b|\[object Object\]|\bNaN\b|\{\{|\{%/.test(text), (text.match(/.{0,40}(\bundefined\b|\[object Object\]|\bNaN\b|\{\{|\{%).{0,40}/) || [''])[0]);
  }

  // 4. E-Mail nie im Klartext (weder im Repo noch in der gebauten Seite)
  const mailRe = /[A-Za-z0-9._%+-]+@josija-nydegger\.ch|josija\.nydegger@gmail\.com/;
  const repoFiles = walk(ROOT, '', /^(\.git|\.astro|node_modules|dist|_tests\/node_modules|public\/assets\/katex)\//).filter(p => /\.(html|md|yml|xml|txt|css|js|mjs|cjs|ts|astro|json)$/.test(p));
  for (const p of repoFiles) ok('Keine E-Mail im Klartext: ' + p, !mailRe.test(fs.readFileSync(path.join(ROOT, p), 'utf8')));
  for (const p of builtA.filter(p => /\.(html|xml|txt)$/.test(p))) ok('Keine E-Mail im Klartext (gebaut): ' + p, !mailRe.test(a.read(p)));
  ok('E-Mail kodiert eingebunden', /atob\(emailB64\)/.test(a.read('index.html')) && /const emailB64 = "[A-Za-z0-9+/=]+"/.test(a.read('index.html')));

  // 5. Sprachumschalter und hreflang: Gegenstücke verweisen aufeinander
  const pairs = [['index.html', 'en/index.html', '/', '/en/'], ['cv.html', 'en/cv.html', '/cv.html', '/en/cv.html'], ['tools/index.html', 'en/tools/index.html', '/tools/', '/en/tools/']];
  for (const [de, en, deUrl, enUrl] of pairs) {
    ok('Umschalter DE → EN: ' + de, a.read(de).includes('href="' + enUrl + '" hreflang="en"'));
    ok('Umschalter EN → DE: ' + en, a.read(en).includes('href="' + deUrl + '" hreflang="de"'));
    ok('hreflang x-default: ' + de, a.read(de).includes('hreflang="x-default" href="https://josija-nydegger.ch' + deUrl + '"'));
  }
  ok('404 ohne hreflang', !/hreflang="x-default"/.test(a.read('404.html')));

  // 6. Feeds, Sitemap, robots.txt
  const locsA = common('A', A);
  const liveLocs = [...new JSDOM(fs.readFileSync(path.join(__dirname, 'referenz', 'live', 'sitemap.xml'), 'utf8'), { contentType: 'application/xml' }).window.document.getElementsByTagName('loc')].map(l => l.textContent);
  for (const loc of liveLocs) ok('Sitemap enthält weiterhin: ' + loc, locsA.includes(loc));
  ok('Sitemap ohne 404 und Google-Datei', !locsA.some(l => /404|google/.test(l)));
  ok('robots.txt verweist auf Sitemap', a.has('robots.txt') && a.read('robots.txt').trim() === 'Sitemap: https://josija-nydegger.ch/sitemap.xml');
  ok('Kein KaTeX-Stylesheet ohne Formeln', !generated.some(p => a.read(p).includes('katex.min.css')));
} catch (e) { ok('A: Prüfung ohne Absturz', false, e.message); }

// ===== B) Testbeiträge =====
const B = build({ BLOG_DIR: './_tests/fixtures/blog' });
try {
  const b = site(B);

  // 7. Welche Beiträge erscheinen
  for (const p of ['blog/formeln/', 'blog/text/', 'blog/eigener-slug/', 'en/blog/formulas/', 'en/blog/only-english/']) ok('Beitrag gebaut: /' + p, b.has(p + 'index.html'));
  for (const p of ['blog/zukunft/', 'blog/entwurf/', 'blog/aaa/', 'blog/readme/']) ok('Beitrag nicht gebaut: /' + p, !b.has(p + 'index.html'));

  // 8. Formeln (KaTeX beim Build)
  const formeln = b.read('blog/formeln/index.html');
  const fdoc = b.doc('blog/formeln/index.html');
  ok('Formeln: 1 Block-Formel', fdoc.querySelectorAll('.katex-display').length === 1, fdoc.querySelectorAll('.katex-display').length);
  ok('Formeln: 4 Formeln insgesamt', fdoc.querySelectorAll('.katex').length === 4, fdoc.querySelectorAll('.katex').length);
  ok('Formeln: \\{1, 2, 3\\} unverändert', formeln.includes('<annotation encoding="application/x-tex">\\{1, 2, 3\\}</annotation>'));
  ok('Formeln: a * b * c unverändert', formeln.includes('<annotation encoding="application/x-tex">a * b * c</annotation>'));
  ok('Formeln: KaTeX-Stylesheet geladen', formeln.includes('href="/assets/katex/katex.min.css"'));
  ok('Ohne Formeln: kein KaTeX-Stylesheet', !b.read('blog/text/index.html').includes('katex.min.css'));
  ok('Kein KaTeX-JavaScript', !walk(B).filter(p => p.endsWith('.html')).some(p => /katex[^"]*\.js/.test(b.read(p))));
  ok('Dollar als Text (\\$ und .nomath)', fdoc.querySelector('article').textContent.includes('Ein Preis von $5 und $10 bleibt Text.'));
  ok('Dollar im Code unverändert', formeln.includes('<code>$x$</code>') && formeln.includes('print("$HOME")'));
  ok('Typografie wie kramdown', fdoc.querySelector('article').textContent.includes('“Anführungszeichen” – Strich — Geviert … Punkte.'));

  // 9. Datum, Lesezeit, älter/neuer, Sprachumschalter
  const date = p => b.doc(p).querySelector('.date').textContent;
  ok('Datum und Lesezeit DE', date('blog/formeln/index.html') === '20.10.2026 · 1 Min. Lesezeit', date('blog/formeln/index.html'));
  ok('Lesezeit 2 Min. bei rund 450 Wörtern', date('blog/text/index.html') === '10.10.2026 · 2 Min. Lesezeit', date('blog/text/index.html'));
  ok('Datum und Lesezeit EN', date('en/blog/formulas/index.html') === '21 Oct 2026 · 1 min read', date('en/blog/formulas/index.html'));
  const nav = p => [...b.doc(p).querySelectorAll('.post-nav a')].map(x => x.className + ' ' + x.getAttribute('href')).join(', ');
  ok('Älter/neuer: neuester Beitrag', nav('blog/formeln/index.html') === 'prev /blog/text/', nav('blog/formeln/index.html'));
  ok('Älter/neuer: gleicher Tag nach Dateiname', nav('blog/text/index.html') === 'prev /blog/eigener-slug/, next /blog/formeln/', nav('blog/text/index.html'));
  ok('Älter/neuer: nur gleiche Sprache', nav('en/blog/formulas/index.html') === 'prev /en/blog/only-english/', nav('en/blog/formulas/index.html'));
  ok('Umschalter zum Gegenstück', formeln.includes('href="/en/blog/formulas/" hreflang="en"') && formeln.includes('hreflang="en" href="https://josija-nydegger.ch/en/blog/formulas/"'));
  ok('Umschalter ohne Gegenstück → Blog-Liste', b.read('blog/text/index.html').includes('href="/en/#blog" hreflang="en"') && !b.read('blog/text/index.html').includes('x-default'));
  ok('Umschalter EN ohne Gegenstück → Blog-Liste', b.read('en/blog/only-english/index.html').includes('href="/#blog" hreflang="de"'));

  // 10. Blog-Liste auf den Startseiten
  const list = p => [...b.doc(p).querySelectorAll('#blog a.item')].map(x => x.getAttribute('href')).join(' ');
  ok('Blog-Liste DE', list('index.html') === '/blog/formeln/ /blog/text/ /blog/eigener-slug/', list('index.html'));
  ok('Blog-Liste EN', list('en/index.html') === '/en/blog/formulas/ /en/blog/only-english/', list('en/index.html'));

  // 11. Link-Vorschau und JSON-LD der Beiträge
  const meta = (d, k) => d.querySelector(`meta[property="${k}"], meta[name="${k}"]`)?.getAttribute('content');
  ok('Beitrag: og:type article', meta(fdoc, 'og:type') === 'article');
  ok('Beitrag: og:image absolut', meta(fdoc, 'og:image') === 'https://josija-nydegger.ch/images/og-image.jpg');
  ok('Beitrag: twitter:card gross mit Bild', meta(fdoc, 'twitter:card') === 'summary_large_image');
  ok('Beitrag ohne Bild: twitter:card summary', meta(b.doc('blog/text/index.html'), 'twitter:card') === 'summary');
  const ld = JSON.parse(fdoc.querySelector('script[type="application/ld+json"]').textContent);
  ok('Beitrag: JSON-LD BlogPosting', ld['@type'] === 'BlogPosting' && ld.datePublished === '2026-10-20T00:00:00+02:00' && ld.dateModified === '2026-10-22T00:00:00+02:00', JSON.stringify(ld));

  // 12. Feeds und Sitemap mit Beiträgen
  const feed = b.xml('feed.xml');
  const entries = [...feed.getElementsByTagName('entry')];
  ok('Feed DE: 3 Beiträge', entries.length === 3, entries.length);
  ok('Feed DE: updated = neuester Beitrag', feed.querySelector('feed > updated').textContent === '2026-10-20T00:00:00+02:00');
  ok('Feed DE: Titel richtig maskiert', entries[0].getElementsByTagName('title')[0].textContent === 'Formeln & "Zeichen"');
  ok('Feed DE: updated aus last_modified_at', entries[0].getElementsByTagName('updated')[0].textContent === '2026-10-22T00:00:00+02:00');
  const content = entries[0].getElementsByTagName('content')[0].textContent;
  ok('Feed DE: Formeln nur als MathML', content.includes('<math') && !content.includes('katex-html'));
  ok('Feed EN: 2 Beiträge', b.xml('en/feed.xml').getElementsByTagName('entry').length === 2);
  const locsB = common('B', B);
  ok('Sitemap: Beiträge enthalten, Zukunft/Entwurf nicht', ['/blog/formeln/', '/blog/text/', '/en/blog/formulas/'].every(u => locsB.includes('https://josija-nydegger.ch' + u)) && !locsB.some(l => /zukunft|entwurf/.test(l)));
  ok('Sitemap: lastmod aus last_modified_at', /<loc>https:\/\/josija-nydegger\.ch\/blog\/formeln\/<\/loc>\n<lastmod>2026-10-22T00:00:00\+02:00<\/lastmod>/.test(b.read('sitemap.xml')));
} catch (e) { ok('B: Prüfung ohne Absturz', false, e.message); }
for (const dir of [A, B]) fs.rmSync(dir, { recursive: true, force: true });
fs.rmSync(path.join(ROOT, 'node_modules', '.astro', 'data-store.json'), { force: true });
console.log(fails ? fails + ' FEHLER' : 'Alle Tests bestanden');
process.exitCode = fails ? 1 : 0;
