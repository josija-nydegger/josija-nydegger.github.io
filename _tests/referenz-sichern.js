// Referenz der heutigen (Jekyll-)Website sichern, als Massstab für die Migration zu Astro.
// Start: node _tests/referenz-sichern.js   (braucht Internet und einmalig "npm install" im Ordner _tests)
// Schreibt nach _tests/referenz/:
//   dateien.txt  alle Adressen, die Jekyll veröffentlicht (aus git ls-files + Sitemap/robots), jede live mit 200 geprüft
//   head.json    Kopf jeder HTML-Seite mit Front Matter, wie live ausgeliefert (title, meta, link, JSON-LD)
//   live/        Seiten, Feeds, sitemap.xml und robots.txt im Original
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'referenz');
const SITE = 'https://josija-nydegger.ch';
const EXCLUDE = ['README.md', 'ANLEITUNG.md', 'CLAUDE.md'];   // wie "exclude" in _config.yml
// Adressen, die schon live fehlerhaft sind: Sollzustand bleibt in dateien.txt, gemeldet als WARN statt FAIL
const KNOWN = {
  '/google385c59b71b73dd03.html': 'live 404: wegen Front Matter ohne permalink liegt die Datei unter /google385c59b71b73dd03/'
};

const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean)
  .filter(f => !/^[._]/.test(f) && !f.split('/').some(p => p.startsWith('_')) && !EXCLUDE.includes(f));

// Datei → Adresse: mit Front Matter über permalink (sonst Pfad), ohne Front Matter unverändert kopiert
const entries = files.map(f => {
  const head = fs.readFileSync(path.join(ROOT, f)).subarray(0, 4000).toString('utf8').replace(/\r\n/g, '\n');
  const fm = head.match(/^---\n([\s\S]*?)---\n/);
  if (!fm) return { file: f, url: '/' + f, rendered: false };
  const permalink = (fm[1].match(/^permalink:\s*(\S+)/m) || [])[1];
  return { file: f, url: permalink || '/' + f.replace(/(^|\/)index\.html$/, '$1'), rendered: true };
});
entries.push({ file: '(jekyll-sitemap)', url: '/sitemap.xml', rendered: true }, { file: '(jekyll-sitemap)', url: '/robots.txt', rendered: true });
entries.sort((a, b) => a.url.localeCompare(b.url));

// Adresse → Datei im gebauten Ordner (so prüft später der Astro-Test gegen dist/)
const outFile = url => url.endsWith('/') ? url.slice(1) + 'index.html' : url.slice(1);

(async () => {
  let fails = 0;
  const head = {};
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const e of entries) {
    const res = await fetch(SITE + encodeURI(e.url), { redirect: 'manual' });
    const ok = res.status === 200;
    if (!ok && KNOWN[e.url]) { console.log('WARN ' + res.status + ' ' + e.url + ' (' + KNOWN[e.url] + ')'); continue; }
    if (!ok) fails++;
    console.log((ok ? 'OK  ' : 'FAIL') + ' ' + res.status + ' ' + e.url);
    if (!ok || !e.rendered) continue;
    const body = await res.text();
    const target = path.join(OUT, 'live', outFile(e.url));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
    if (!/\.html?$|\/$/.test(e.url)) continue;
    const doc = new JSDOM(body).window.document;
    head[e.url] = {
      title: doc.title,
      meta: [...doc.head.querySelectorAll('meta[name], meta[property]')].map(m => [m.getAttribute('name') || m.getAttribute('property'), m.getAttribute('content')]),
      link: [...doc.head.querySelectorAll('link')].map(l => Object.fromEntries([...l.attributes].map(a => [a.name, a.value]))),
      jsonld: [...doc.head.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent))
    };
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'dateien.txt'),
    '# Adresse <TAB> Datei im Build <TAB> Quelle im Repo (Jekyll). Erzeugt von referenz-sichern.js am ' + new Date().toISOString().slice(0, 10) + '\n' +
    entries.map(e => [e.url, outFile(e.url), e.file].join('\t')).join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'head.json'), JSON.stringify(head, null, 2) + '\n');
  console.log('\n' + entries.length + ' Adressen, ' + Object.keys(head).length + ' Seitenköpfe → _tests/referenz/');
  console.log(fails ? fails + ' FEHLER' : 'Alle Adressen live erreichbar');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
