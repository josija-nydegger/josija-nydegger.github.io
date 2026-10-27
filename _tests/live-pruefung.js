// Live-Website prüfen, z. B. nach einer Veröffentlichung oder Änderungen an Domain/DNS.
// Start: node _tests/live-pruefung.js   (braucht Internet)
// Ruft alle Adressen aus referenz/dateien.txt ab (Stand vor dem Wechsel zu Astro, dürfen nie verschwinden)
// und prüft Umleitungen, Google-Bestätigung und 404-Seite.
const fs = require('fs');
const path = require('path');

const SITE = 'https://josija-nydegger.ch';
// Adressen der Referenz, die bewusst entfallen sind (gleiche Liste wie in website.test.js)
const REMOVED = ['assets/katex/katex.min.js', 'assets/katex/contrib/auto-render.min.js'];

let fails = 0;
const ok = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (cond || info === undefined ? '' : ': ' + info)); };
const get = (url, opts = {}) => fetch(url, { redirect: 'manual', ...opts });

(async () => {
  const rows = fs.readFileSync(path.join(__dirname, 'referenz', 'dateien.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('\t'));
  for (const [url, file] of rows) {
    const res = await get(SITE + encodeURI(url));
    if (REMOVED.includes(file)) ok('Bewusst entfernt (404): ' + url, res.status === 404, res.status);
    else ok('200: ' + url, res.status === 200, res.status);
  }

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

  console.log(fails ? fails + ' FEHLER' : 'Live-Website in Ordnung');
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
