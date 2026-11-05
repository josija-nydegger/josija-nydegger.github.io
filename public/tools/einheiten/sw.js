// Service Worker nur für den Einheiten-Umrechner (offline nutzbar, als App installierbar).
// Er liegt in /tools/einheiten/ und darf darum nur Seiten unter /tools/einheiten/ steuern;
// die übrige Website bleibt unberührt.
//
// Strategie:
// - Die Seite selbst zuerst aus dem Netz (immer die neueste Version). Offline oder ohne Antwort
//   nach 3 Sekunden aus dem Speicher.
// - Gebündelte Dateien unter /_astro/ (Name mit Prüfsumme, ändern sich nie) zuerst aus dem Speicher.
// - Icons, Manifest, Favicons: aus dem Speicher, im Hintergrund aktualisiert.
// Updates brauchen keine neue Versionsnummer: Jede online geladene Seite ersetzt die gespeicherte,
// lädt ihre neuen /_astro/-Dateien nach und entfernt die alten. CACHE nur ändern, wenn sich diese Datei
// grundlegend ändert (alte Speicher werden dann beim Aktivieren gelöscht).
const CACHE = 'einheiten-v2'; // v2: eigene Icons (kN ⇄ MPa), alte Speicher werden beim Aktivieren gelöscht
const SCOPE = new URL('./', self.location.href).pathname; // /tools/einheiten/
const STATIC = [
  SCOPE + 'manifest.webmanifest',
  SCOPE + 'icons/icon-192.png',
  SCOPE + 'icons/icon-512.png',
  SCOPE + 'icons/icon-maskable-192.png',
  SCOPE + 'icons/icon-maskable-512.png',
  SCOPE + 'icons/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-32.png'
];
const TIMEOUT = 3000;

/** Dateien unter /_astro/, die eine Seite einbindet */
const astroAssets = html => [...new Set([...html.matchAll(/(?:src|href)="(\/_astro\/[^"]+)"/g)].map(m => m[1]))];

/** Seite speichern, ihre /_astro/-Dateien nachladen und nicht mehr gebrauchte entfernen */
async function remember(res) {
  const cache = await caches.open(CACHE);
  const html = await res.clone().text();
  await cache.put(SCOPE, res);
  const assets = astroAssets(html);
  for (const req of await cache.keys()) {
    const path = new URL(req.url).pathname;
    if (path.startsWith('/_astro/') && !assets.includes(path)) await cache.delete(req);
  }
  await Promise.all(assets.map(async a => {
    if (!(await cache.match(a))) await cache.add(a);
  }));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const res = await fetch(SCOPE, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Seite nicht geladen: ' + res.status);
    await remember(res);
    const cache = await caches.open(CACHE);
    await cache.addAll(STATIC);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('einheiten-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Die Seite: Netz zuerst, sonst gespeicherte Version
  if (req.mode === 'navigate' && (url.pathname === SCOPE || url.pathname === SCOPE + 'index.html')) {
    const network = fetch(req);
    event.waitUntil(network.then(res => (res.ok ? remember(res.clone()) : undefined)).catch(() => {}));
    event.respondWith((async () => {
      const timeout = new Promise(resolve => setTimeout(resolve, TIMEOUT, null));
      try {
        const res = await Promise.race([network, timeout]);
        if (res) return res;
      } catch (e) { /* offline */ }
      const cached = await caches.match(SCOPE);
      return cached || network;
    })());
    return;
  }

  // Gebündelte Dateien: unveränderlich, Speicher zuerst
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(req, res.clone());
      }
      return res;
    })());
    return;
  }

  // Icons, Manifest, Favicons: Speicher zuerst, im Hintergrund aktualisieren
  if (STATIC.includes(url.pathname)) {
    const network = fetch(req).then(async res => {
      if (res.ok) await (await caches.open(CACHE)).put(url.pathname, res.clone());
      return res;
    });
    event.waitUntil(network.catch(() => {}));
    event.respondWith((async () => (await caches.match(url.pathname)) || network)());
  }
});
