# Migration Jekyll → Astro

Stand: 26.10.2026, Branch `astro`. Grundlage: Astro 7 (laut Doku), alle URLs bleiben gleich.

## Zielstruktur

```
astro.config.mjs        site, build.format 'preserve', Markdown/KaTeX
package.json            Astro + Test-Abhängigkeiten (ersetzt _tests/package.json)
src/
  content.config.ts     Collection "blog" (Beiträge DE + EN)
  content/blog/         Beiträge DE (heute _posts/)
  content/blog/en/      Beiträge EN (heute _posts/en/)
  data/site.ts          Titel, Beschreibung, email_b64, Social-Links (heute _config.yml)
  data/i18n.ts          heute _data/i18n.yml
  data/tools.ts         heute _data/tools.yml
  data/pages.ts         Gegenstücke über ref: home/cv/tools → URL je Sprache
  lib/posts.ts          Datum + Slug aus Dateiname, URL, Lesezeit, älter/neuer
  layouts/Base.astro    heute _layouts/default.html
  layouts/Post.astro    heute _layouts/post.html
  components/           Nav, Seo, BlogList, PersonJsonLd
  pages/                alle Seiten und Endpunkte (siehe Tabelle)
public/                 alles, was unverändert kopiert wird
_tests/  _notizen/  _drafts/   bleiben (ausserhalb von src/ und public/, nicht veröffentlicht)
```

## Dateizuordnung

| Jekyll | Astro | Hinweis |
|---|---|---|
| `_config.yml` | `astro.config.mjs` + `src/data/site.ts` | `defaults` für lang/locale entfallen, jede Seite übergibt `lang` |
| `_layouts/default.html` | `src/layouts/Base.astro` | Props `lang`, `ref`, `title`, `description`, `isPost`; die drei Skripte als `<script is:inline>` (sonst bündelt Astro sie, Theme blitzt auf) |
| `{% seo %}` | `src/components/Seo.astro` | `jekyll-seo-tag` von Hand nachbauen; Vorlage: `_tests/referenz/head.json` |
| `_layouts/post.html` | `src/layouts/Post.astro` | Lesezeit aus `post.body`, älter/neuer über `lib/posts.ts`; KaTeX-Block entfällt |
| `_includes/nav.html` | `src/components/Nav.astro` | |
| `_includes/blog-list.html` | `src/components/BlogList.astro` | |
| `_includes/person-jsonld.html` | `src/components/PersonJsonLd.astro` | |
| `_includes/atom.xml` + `feed.xml` + `en/feed.xml` | `src/pages/feed.xml.ts`, `src/pages/en/feed.xml.ts` | gemeinsame Funktion `lib/feed.ts`, Inhalt aus `entry.rendered.html` |
| `_data/i18n.yml` | `src/data/i18n.ts` | Datum mit `Intl`: `de-CH` → `3.11.2026`, `en-GB` → `3 Nov 2026` |
| `_data/tools.yml` | `src/data/tools.ts` | |
| `index.html` | `src/pages/index.astro` | HTML 1:1, `{% include blog-list.html %}` → `<BlogList lang="de" />` |
| `cv.html` | `src/pages/cv.astro` | → `/cv.html` dank `preserve` |
| `en/index.html`, `en/cv.html` | `src/pages/en/index.astro`, `src/pages/en/cv.astro` | |
| `tools/index.html`, `en/tools/index.html` | `src/pages/tools/index.astro`, `src/pages/en/tools/index.astro` | Liquid-Schleife → `tools.map(...)` |
| `tools/balken/`, `tools/querschnittswerte/` | `public/tools/…/index.html` | unverändert |
| `404.html` | `src/pages/404.astro` | |
| `_posts/*.md` | `src/content/blog/*.md` | Dateinamen gleich, Datum + Slug daraus wie bei Jekyll |
| Blog-URLs | `src/pages/blog/[slug]/index.astro`, `src/pages/en/blog/[slug]/index.astro` | → `/blog/slug/index.html` |
| `jekyll-sitemap` | `src/pages/sitemap.xml.ts` (+ `public/robots.txt`, falls live vorhanden) | eigener Endpunkt, damit `/sitemap.xml` bleibt |
| `google385c…html` | `public/google385c…html` | **ohne** Front Matter, Inhalt wie heute ausgeliefert |
| `style.css`, Favicons, `CNAME`, `images/`, `arbeiten/` | `public/…` | unverändert |
| `assets/katex/` | `public/assets/katex/` (nur CSS + Schriften) | `katex.min.js` und `auto-render` entfallen |
| `_drafts/vorlage.md` | bleibt | Abschnitt "Formeln" vereinfachen |
| `_layouts/`, `_includes/`, `_data/`, `_config.yml`, `jekyll-nachbau.js` | löschen | erst in Phase 9 |

Markdown: `syntaxHighlight: false` (heute auch keine Code-Farben), `remark-math` + `rehype-katex` (Formeln beim Build, kein `{% raw %}`/`\{`-Umweg mehr). Kleines Remark-Plugin merkt sich, ob ein Beitrag Formeln enthält → `katex.min.css` nur dann laden. Beiträge bleiben `.md`, nicht `.mdx`.

## URL-Prüfung

**Stufe 1 – Referenz sichern (Phase 0, erledigt):** `node _tests/referenz-sichern.js` erzeugt `_tests/referenz/` (50 Adressen, 7 Seitenköpfe):
- `dateien.txt`: alle Adressen, die Jekyll heute veröffentlicht (Seiten, statische Dateien, Feeds, Sitemap), jede live mit Status 200 geprüft
- `head.json`: Kopf jeder HTML-Seite live (title, meta, link, JSON-LD)
- `live/`: `sitemap.xml`, `feed.xml`, `en/feed.xml`, `robots.txt` wie live ausgeliefert

**Stufe 2 – lokal bei jedem `npm test`:**
- jede Adresse aus `dateien.txt` existiert in `dist/`
- Kopf jeder Seite = `head.json` (Abweichungen einzeln melden und bewusst entscheiden)
- `/sitemap.xml` mit denselben URLs wie live
- bisherige Prüfungen: E-Mail nicht im Klartext, Sprachumschalter/hreflang, interne Links, Feeds
- Testbeitrag (Vorlage DE + EN, gleiche `ref`) für Blog-URL, Umschalter, Formeln, älter/neuer, Feed; vor dem Merge entfernen

**Stufe 3 – live nach dem Umschalten:** alle Adressen aus `dateien.txt` gegen `https://josija-nydegger.ch` (200 erwartet), Stichproben `/cv`, `www.`, `http://`; Sitemap in der Search Console neu abrufen, Abdeckung eine Woche beobachten.

## GitHub Action

`.github/workflows/deploy.yml`:

```yaml
name: Website bauen und veröffentlichen
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6        # npm ci + astro build + Upload, Node 24
      - run: npm test                     # Tools + Website gegen dist/

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

PRs werden nur gebaut und getestet, veröffentlicht wird nur `main`. `package-lock.json` committen. `public/CNAME` und die Domain in den Pages-Einstellungen bleiben, DNS/DNSSEC unverändert.

## Phasen

| Phase | Inhalt | Aufwand | Status |
|---|---|---|---|
| 0 | Branch `astro`, Referenz sichern (Stufe 1) | 1 h | erledigt |
| 1 | Astro-Gerüst, `astro.config.mjs`, Dateien nach `public/` | 1 h | erledigt (Astro 7.4.2; 39 von 50 Adressen im Build, es fehlen nur Seiten, Feeds, Sitemap, robots.txt) |
| 2 | `src/data/*`, `lib/posts.ts` | 1 h | erledigt (mit Testbeiträgen und Debug-Endpunkt geprüft, danach entfernt; `npm run check` ohne Fehler) |
| 3 | `Base`, `Seo`, `Nav`, `PersonJsonLd`, `Post` | 2–3 h | |
| 4 | Seiten 1:1 übertragen | 1–2 h | |
| 5 | Blog-Collection, Routen, KaTeX, Feeds, Sitemap, Testbeitrag | 2 h | |
| 6 | Tests umbauen (Tool-Tests → `public/tools/`, `website.test.js` → `dist/` + Referenz, Nachbau/liquidjs weg) | 1–2 h | |
| 7 | Workflow, PR öffnen, PR-Build grün | 30 min | |
| 8 | Umschalten: zuerst Pages-Quelle auf "GitHub Actions" (alte Seite bleibt bis zum nächsten Deploy online), dann mergen, Stufe 3 | 30 min | |
| 9 | Aufräumen: Jekyll-Dateien löschen, CLAUDE.md, README, ANLEITUNG, Vorlage nachführen | 1 h | |

Rückfall: Bis Phase 8 ändert sich live nichts. Danach Pages-Quelle zurück auf "Branch main" und Merge rückgängig machen.

## Befunde aus Phase 0

- **Google-Bestätigungsdatei live 404:** Seit sie Front Matter hat (`sitemap: false`), macht Jekyll wegen der Permalink-Regel `/google385c59b71b73dd03/` daraus statt `.html`. Mit Astro (`public/`, ohne Front Matter) ist das automatisch behoben. Auf `main` liesse es sich sofort mit `permalink: /google385c59b71b73dd03.html` im Front Matter beheben.
- **`/en/` mit deutschem Untertitel:** `<title>` und JSON-LD der englischen Startseite nennen "Bauingenieurwesen · BIM · Digital Construction" (`site.tagline`). In Phase 3 entscheiden: 1:1 übernehmen oder `tagline` aus `i18n` (EN) verwenden.
- Live haben die Seiten **kein `og:image`** und `twitter:card` = `summary` (obwohl `image:` in `_config.yml` steht). Für Astro so übernehmen.
- `jekyll-sitemap` erzeugt auch `/robots.txt` und listet neben den Seiten das PDF und die beiden Tools (mit `lastmod`). Der Astro-Endpunkt muss das nachbilden.

## Übergangszustand (ab Phase 1)

- Statische Dateien liegen in `public/`, die Jekyll-Seiten (`index.html`, `cv.html`, `en/…`, `tools/index.html`, Feeds, `404.html`) noch im Hauptordner. Der Jekyll-Nachbau liest sie dort und kopiert Stil und Bilder aus `public/`; `npm test` in `_tests` bleibt so bis Phase 6 gültig.
- Der Branch ist auf GitHub Pages (Jekyll) **nicht** lauffähig, weil Stil, Bilder und Tools nun in `public/` liegen. Darum vor Phase 8 nicht auf `main` mergen.
- Root-`package.json` hat `"type": "module"`; `_tests/` behält eine eigene `package.json` (CommonJS) bis Phase 6.
- **Ab Phase 2 doppelt:** `_data/i18n.yml` ↔ `src/data/i18n.ts`, `_data/tools.yml` ↔ `src/data/tools.ts`, `_config.yml` ↔ `src/data/site.ts`. Änderungen bis Phase 9 in beiden nachführen (Jekyll-Nachbau liest noch die YAML-Dateien).
- Beiträge vorläufig in `src/content/blog/` (Entscheid 1, Empfehlung); umstellen = eine Zeile `base` in `src/content.config.ts`.
- Phase 6: E-Mail-Prüfung in `website.test.js` auch auf `.ts`/`.astro`/`.mjs` ausdehnen (prüft heute nur html, md, yml, xml, txt, css, js).
- `ANLEITUNG.md`, `README.md` und `CLAUDE.md` nennen noch die alten Pfade (`arbeiten/`, `images/`, `style.css`, `tools/<name>/`): in Phase 9 nachführen.

## Verhalten von src/lib/posts.ts (wie Jekyll, geprüft in Phase 2)

- Beitrag nur mit Datum vorne im Dateinamen; `title`, `description`, `ref` Pflicht (sonst bricht der Build mit Meldung ab).
- Adresse `/blog/<slug>/` bzw. `/en/blog/<slug>/`, Slug aus dem Dateinamen oder `slug:` im Front Matter; Datum optional per `date:` überschreibbar.
- Wie auf GitHub Pages: Datum in der Zukunft oder `published: false` → nicht veröffentlicht.
- Reihenfolge neueste zuerst, am gleichen Tag nach Dateiname absteigend.
- Lesezeit `max(1, floor((Wörter + 100) / 200))`, ohne MathML-Kopie der Formeln.
- Datum: `15.9.2026` / `16 Sep 2026` (von Hand, Intl liefert teils "Sept"); Feed `2026-09-15T00:00:00+02:00` mit Sommerzeit.

## Offene Entscheide

1. Beiträge in `src/content/blog/` (Empfehlung) oder weiter in `_posts/` (falls Obsidian-Vault darauf zeigt).
2. JSON-LD von `jekyll-seo-tag` (WebSite/BlogPosting) nachbauen (Empfehlung) oder nur Person behalten.
3. KaTeX beim Build (Empfehlung) oder weiter im Browser.
