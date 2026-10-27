// Live-Website nach der Umstellung auf Astro prüfen (Stufe 3 in _notizen/astro-migration.md).
// Start: node _tests/live-pruefung.js   (braucht Internet)
// Ruft alle Adressen aus referenz/dateien.txt ab, prüft Umleitungen und Sonderfälle und speichert die Seiten
// in einen temporären Ordner, gegen den danach head-vergleich.js und inhalt-vergleich.js laufen.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const SITE = 'https://josija-nydegger.ch';
const REMOVED = ['assets/katex/katex.min.js', 'assets/katex/contrib/auto-render.min.js'];
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'live-'));

let fails = 0;
const ok = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (cond || info === undefined ? '' : ': ' + info)); };
const get = (url, opts = {}) => fetch(url, { redirect: 'manual', ...opts });

(async () => {
  const rows = fs.readFileSync(path.join(__dirname, 'referenz', 'dateien.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('\t'));
  for (const [url, file] of rows) {
    const res = await get(SITE + encodeURI(url));
    if (REMOVED.includes(file)) { ok('Bewusst entfernt (404): ' + url, res.status === 404, res.status); continue; }
    ok('200: ' + url, res.status === 200, res.status);
    if (res.status === 200 && /\.(html|xml|txt)$/.test(file)) {
      const target = path.join(OUT, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, await res.text());
    }
  }

  // Es läuft wirklich Astro (Jekyll schrieb einen generator-Tag)
  const home = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  ok('Astro-Version live (kein Jekyll-generator)', !home.includes('content="Jekyll'));

  // Sonderfälle
  const google = await get(SITE + '/google385c59b71b73dd03.html');
  ok('Google-Bestätigung unter .html', google.status === 200 && (await google.text()).trim() === 'google-site-verification: google385c59b71b73dd03.html');
  ok('/cv ohne .html', (await get(SITE + '/cv')).status === 200);
  const en = await get(SITE + '/en');
  ok('/en → /en/', en.status === 301 && en.headers.get('location') === SITE + '/en/', en.status + ' ' + en.headers.get('location'));
  const www = await get('https://www.josija-nydegger.ch/');
  ok('www → ohne www', [301, 308].includes(www.status) && www.headers.get('location').startsWith(SITE + '/'), www.status + ' ' + www.headers.get('location'));
  const http = await get('http://josija-nydegger.ch/');
  ok('http → https', [301, 308].includes(http.status) && http.headers.get('location').startsWith('https://'), http.status + ' ' + http.headers.get('location'));
  const gh = await get('https://josija-nydegger.github.io/cv.html');
  ok('github.io → eigene Domain', gh.status === 301 && gh.headers.get('location') === SITE + '/cv.html', gh.status + ' ' + gh.headers.get('location'));
  const missing = await get(SITE + '/gibt-es-nicht/');
  ok('Unbekannte Adresse → eigene 404-Seite', missing.status === 404 && (await missing.text()).includes('PAGE NOT FOUND'));

  console.log('\n--- Seitenköpfe und Inhalte live gegen die Referenz ---');
  for (const script of ['head-vergleich.js', 'inhalt-vergleich.js']) {
    try {
      console.log(execFileSync(process.execPath, [path.join(__dirname, script), OUT], { encoding: 'utf8' }).trim().split('\n').filter(l => !l.startsWith('OK')).join('\n'));
    } catch (e) { fails++; console.log(e.stdout); }
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  console.log(fails ? fails + ' FEHLER' : 'Live-Website in Ordnung');
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
