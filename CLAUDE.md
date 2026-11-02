# CLAUDE.md

Persönliche Website von Josija Nydegger (Bauingenieurwesen, BIM, Digital Construction).
Live: <https://josija-nydegger.ch> · gebaut mit [Astro](https://astro.build) (statisch), veröffentlicht per GitHub Action auf GitHub Pages. Bis Oktober 2026 Jekyll; Ablauf und Entscheide des Wechsels: `_notizen/astro-migration.md`.

**Domain:** `josija-nydegger.ch`, registriert bei Infomaniak (dort auch DNS, DNSSEC aktiv). DNS: 4× A und 4× AAAA für `@` auf die GitHub-Pages-Adressen, CNAME `www` → `josija-nydegger.github.io`, TXT `_github-pages-challenge-josija-nydegger` (Domain in GitHub bestätigt). Die übrigen Einträge (MX, SPF, DKIM, DMARC, SRV, autoconfig) sind für E-Mail und bleiben. Die Datei `public/CNAME` enthält die Domain: **nicht löschen**. In den Repo-Einstellungen steht Pages → Source auf **"GitHub Actions"** (nicht "Deploy from a branch"). Alte Adressen unter `josija-nydegger.github.io` leiten automatisch auf die Domain um. Absolute Adressen immer mit `https://josija-nydegger.ch` schreiben (bzw. `absoluteUrl()` aus `src/data/site.ts`). Falls die DNS-Verwaltung je umzieht: DNSSEC vorher ausschalten.

## Grundsätze

- **Schlicht bleiben:** eine Spalte, viel Weissraum, keine Animationen. Astro nur als Generator für statisches HTML: keine UI-Frameworks (kein React, Vue, Svelte, Tailwind, Bootstrap), keine Astro-Islands bzw. `client:`-Komponenten, keine zusätzlichen Integrationen ohne Rückfrage. Seiten als `.astro` (HTML mit wenig Logik), Beiträge in Markdown, das ganze Design in `public/style.css`.
- **Kein externes JavaScript und keine Tracker**, ausser es wird ausdrücklich gewünscht. Einzige Ausnahme sind die kleinen eigenen Inline-Skripte in `src/layouts/Base.astro` (alle mit `is:inline` bzw. `define:vars`, damit Astro sie nicht bündelt): der Hell/Dunkel/System-Umschalter (speichert die Wahl in `localStorage`, ohne JavaScript bleibt die Systemeinstellung aktiv und die Buttons sind ausgeblendet), das Einsetzen der E-Mail-Adresse und der Button "Als PDF speichern" im Lebenslauf (öffnet den Druckdialog, ohne JavaScript ausgeblendet). Die Tools unter `public/tools/` sind eigenständige Seiten mit eigenem Inline-JavaScript (siehe Abschnitt "Tools"). Formeln in Blogbeiträgen setzt KaTeX **beim Build** (kein KaTeX-JavaScript im Browser); nur das Stylesheet und die Schriften liegen **lokal** in `public/assets/katex/` (kein CDN) und werden nur auf Beiträgen mit Formeln geladen.
- **Sprache:** Deutsch (Hauptsprache, Schweizer Rechtschreibung, immer `ss`, nie `ß`) und Englisch (amerikanische Schreibweise, `en_US`). Arbeitstitel in Originalsprache belassen.
- **Datenschutz:** Keine Wohnadresse (Strasse), Telefonnummer und kein Geburtsdatum auf der Seite. Auf Wunsch veröffentlicht: Wohnort Lyss und "seit 2024 verheiratet mit Prisca" (Lebenslauf, Abschnitt Persönliches, und erster Satz der Startseite). Kontakt über LinkedIn und E-Mail.
- **E-Mail nie im Klartext** in HTML, Code oder Repo schreiben (das Repo ist öffentlich). Sie steht nur Base64-kodiert als `emailB64` in `src/data/site.ts` und wird per Inline-Skript in `src/layouts/Base.astro` in alle `<a class="email">` eingesetzt. Umgebende Texte stehen in `<span class="email-wrap" hidden>` und bleiben ohne JavaScript ausgeblendet. Aktuell: Kontakt-Abschnitt beider Startseiten und Kopf beider Lebensläufe. `npm test` prüft Repo und Build darauf.
- Änderungen klein halten und bestehende Klassen in `public/style.css` wiederverwenden, statt neue Stile zu erfinden. Bestehende Komponenten und Hilfsfunktionen (`src/components/`, `src/lib/`) wiederverwenden.

## Struktur

```
astro.config.mjs     Astro: Domain, Ausgabeformat 'preserve', Markdown (remark/rehype, KaTeX, Typografie)
package.json         Abhängigkeiten (exakte Versionen) und Befehle: dev, build, preview, check, test
.github/workflows/deploy.yml  Bauen, prüfen und veröffentlichen (siehe "Prüfen")
src/
  content.config.ts  Collection "blog": Ordner, Dateinamen, Pflichtfelder im Front Matter
  content/blog/      Deutsche Blogbeiträge in Markdown (→ /blog/:slug/)
  content/blog/en/   Englische Blogbeiträge (→ /en/blog/:slug/)
  data/site.ts       Titel, Beschreibung, Domain, emailB64, Social-Links
  data/i18n.ts       Feste Texte der gemeinsamen Layouts/Komponenten auf DE und EN, Datumsformat
  data/pages.ts      Seiten mit Gegenstück in der anderen Sprache (ref → Adresse je Sprache)
  data/tools.ts      Liste der Tools für /tools/ und /en/tools/ (Titel, Beschreibung, Tags auf DE und EN)
  layouts/Base.astro Gemeinsames Layout: <head>, hreflang, Menü, Sprachumschalter, Footer, Inline-Skripte
  layouts/Post.astro Layout für Blogbeiträge (Datum, Lesezeit, älter/neuer)
  components/        Nav (Menü), Seo (Titel, Link-Vorschau, JSON-LD), BlogList, PersonJsonLd (schema.org/Person)
  lib/posts.ts       Beiträge: Datum/Sprache/Adresse aus dem Dateinamen, Lesezeit, älter/neuer, Gegenstück
  lib/feed.ts        Atom-Feeds
  lib/remark-math-extras.mjs  $$…$$ allein im Absatz = Block-Formel; merkt sich, ob ein Beitrag Formeln hat
  pages/             Alle Seiten und Endpunkte, Pfad = Adresse (siehe "Adressen")
    index.astro, cv.astro, 404.astro, tools/index.astro          Deutsch (404 Englisch, eine für alles)
    en/index.astro, en/cv.astro, en/tools/index.astro            Englisch
    blog/[slug]/index.astro, en/blog/[slug]/index.astro          Blogbeiträge
    feed.xml.ts, en/feed.xml.ts, sitemap.xml.ts                  Feeds und Sitemap
public/              Wird unverändert veröffentlicht
  style.css          Gesamtes Design; Farben als CSS-Variablen inkl. Dark Mode (System + data-theme) und Druckansicht
  tools/<name>/index.html  Einzelnes Tool, eigenständige HTML-Seite (nur Deutsch)
  assets/katex/      KaTeX 0.16.47 (MIT): nur katex.min.css und .woff2-Schriften
  images/            profil.jpg, og-image.jpg, projekte/ für Projekt-Icons, blog/ für Beitragsbilder
  arbeiten/          PDFs von Arbeiten (Projekt-, Bachelorarbeiten), nur im Original
  favicon.svg, favicon.ico (16/32/48), favicon-32.png, apple-touch-icon.png (180×180, randlos dunkelblau, iOS rundet selbst)  Website-Symbol "Statik & Code", Quelle: G:\Meine Ablage\personal_website\favicon 3.0
  CNAME              Eigene Domain für GitHub Pages (nicht löschen)
  robots.txt         Verweis auf die Sitemap
  google385c59b71b73dd03.html  Bestätigung Google Search Console
_drafts/vorlage.md   Vorlage für neue Beiträge (nicht veröffentlicht)
_notizen/            Interne Notizen, z. B. tool-ideen.md, astro-migration.md (nicht veröffentlicht)
_tests/              Tests (Node.js): Tools gegen Formeln/FE, Website mit Astro-Build, Live-Prüfung (nicht veröffentlicht)
ANLEITUNG.md         Anleitung für PDF-Uploads (nicht veröffentlicht)
README.md            Beschreibung für das GitHub-Repo (nicht veröffentlicht)
```

Veröffentlicht wird nur, was Astro aus `src/pages/` erzeugt, plus der Inhalt von `public/`. Alles andere im Hauptordner (auch `_tests/`, `_notizen/`, Markdown-Dateien) gelangt nicht auf die Website.

**Adressen:** `build.format: 'preserve'` in `astro.config.mjs`: `src/pages/foo.astro` → `/foo.html`, `src/pages/foo/index.astro` → `/foo/`. So bleiben `/cv.html`, `/tools/`, `/en/` usw. wie bisher. Neue Seite = neue Datei in `src/pages/`, mit `<Base lang="…" ref="…" title="…" description="…">` als Rahmen. Hat sie ein Gegenstück in der anderen Sprache, beide Adressen unter einer gemeinsamen `ref` in `src/data/pages.ts` eintragen. Interne Links und Asset-Pfade immer absolut schreiben (`/style.css`, `/images/...`). Die Sitemap nimmt neue Seiten automatisch auf.

`public/google385c59b71b73dd03.html` ist die Bestätigungsdatei für die Google Search Console: nicht löschen, Inhalt nicht ändern, kein Front Matter. Sie ist in `src/pages/sitemap.xml.ts` von der Sitemap ausgenommen.

## Konventionen

### Blogbeiträge
- Datei: `src/content/blog/JJJJ-MM-TT-titel-mit-bindestrichen.md` (Kleinbuchstaben, keine Umlaute im Dateinamen). Das Datum im Namen ist das Veröffentlichungsdatum, der Rest die Adresse (`/blog/titel-mit-bindestrichen/`). Dateien ohne Datum vorne sind keine Beiträge.
- Front Matter, Pflicht (sonst bricht der Build mit einer Meldung ab):
  ```yaml
  ---
  title: Titel des Beitrags
  description: Ein Satz Zusammenfassung (für Blog-Liste und Link-Vorschau).
  ref: kurze-kennung
  ---
  ```
- Optional: `image: /images/blog/bild.jpg` (eigene Link-Vorschau mit grossem Bild), `last_modified_at: JJJJ-MM-TT` (Feed und Sitemap), `slug:` (andere Adresse), `date:` (anderes Datum), `published: false` (nicht veröffentlichen).
- Englische Übersetzung: `src/content/blog/en/JJJJ-MM-TT-english-title.md` mit **derselben `ref`**. Ohne Gegenstück führt der Sprachumschalter zur Blog-Liste der anderen Sprache.
- Beiträge mit Datum in der Zukunft erscheinen erst beim ersten Build ab diesem Tag (nächster Push auf `main` oder die Action im Tab Actions von Hand starten).
- Das Layout zeigt automatisch die Lesezeit (ca. 200 Wörter/Minute) und Links zum älteren/neueren Beitrag derselben Sprache (nur falls vorhanden).
- **Formeln (LaTeX):** inline `$…$`, als Block `$$…$$` allein in einem Absatz (oder `$$` auf eigenen Zeilen). Formeln werden beim Build gesetzt; `\{`, `\\`, `*` usw. funktionieren direkt, keine Umwege wie früher bei kramdown. Dollarzeichen als Text: `\$` (oder `<span class="nomath">$</span>`). Fehlerhafte Formeln erscheinen rot statt den Build abzubrechen: nach dem Schreiben in der Vorschau ansehen.
- Typografie automatisch: `"…"` → “…”, `--` → –, `---` → —, `...` → …. Gilt nicht für Titel und Beschreibung im Front Matter.
- Beiträge werden teils in Obsidian geschrieben: Wikilinks `[[...]]` in normale Markdown-Links umwandeln, Bilder nach `public/images/blog/` verschieben und mit absolutem Pfad (`/images/blog/...`) einbinden.
- Beiträge als `.md`, nicht `.mdx` (sonst stören geschweifte Klammern in Formeln).

### Arbeiten (`src/pages/index.astro`, Abschnitt "Arbeiten")
- Neueste zuerst. Ein Eintrag ist ein `<li class="item">`-Block mit `item-head`, `item-title`, `item-year`, `item-sub`.
- PDF in `public/arbeiten/` ablegen und verlinken mit
  `<div class="tags"><a class="tag" href="/arbeiten/DATEI.pdf" target="_blank" rel="noopener">PDF</a></div>`.
- Immer auch in `src/pages/en/index.astro` eintragen: Titel im Original, nur die Beschreibung übersetzen.
- In `.astro`-Dateien gelten geschweifte Klammern `{ }` im Text als Code: als `&#123;` / `&#125;` schreiben.

### Projekte (`src/pages/index.astro`, Abschnitt "Projekte")
- Gleiche Struktur wie Arbeiten; Tags für Links (`Code`, `Demo`) und Technologien. Links immer als `<a class="tag">` (bekommen automatisch Rahmen und ↗), reine Info-Tags als `<span class="tag">`.
- Projekt-Icon: rund, 160×160 px, in `public/images/projekte/`, vor dem Titel mit `<img class="item-icon" src="/images/projekte/NAME.png" alt="" width="40" height="40" loading="lazy">`.

### Menü
- Oben links auf allen Seiten mit `Base`-Layout: Start (EN: Home) · CV · Tools · Blog, rechts der Sprachumschalter. Aktiver Punkt über `ref` (`home`, `cv`, `tools`) bzw. Blogbeitrag.
- Neue Hauptseiten bekommen ein eigenes `ref` (in `src/data/pages.ts`) und, falls sie ins Menü gehören, einen Eintrag in `src/components/Nav.astro` (beide Sprachen). Der Lebenslauf hat keinen Zurück-Button, das Menü ersetzt ihn.

### Lebenslauf und strukturierte Daten
- Der Lebenslauf hat eine eigene Druckansicht (`@media print` in `public/style.css`): immer hell, ohne Navigation, keine Seitenumbrüche mitten in einem Eintrag.
- Änderungen an Arbeitgeber, Studium oder Wohnort auch in `src/components/PersonJsonLd.astro` nachführen (aktuell Baukonstrukt AG seit November 2026; BSB + Partner 2024 bis Oktober 2026 mit `endDate`).

## Tools

Kleine Web-Tools zu Tragwerken, Statik und BIM unter `/tools/`. Ideen und Reihenfolge stehen in `_notizen/tool-ideen.md`.
Bisher: `public/tools/balken/` (Balken mit Auskragung, Einfeld- und Durchlaufträger) und `public/tools/querschnittswerte/`.

### Neues Tool erstellen
1. **Ablage:** `public/tools/<name>/index.html`, Ordnername kurz, Kleinbuchstaben, ohne Umlaute. Astro kopiert die Datei unverändert (kein Layout, keine Vorlagen-Logik). Eine einzige Datei mit eigenem `<style>` und `<script>`.
2. **Liste:** Eintrag in `src/data/tools.ts` oben einfügen (neueste zuerst) mit `url`, `year`, `title`/`description`/`tags` je in `de` und `en`. Die Übersichten `/tools/` und `/en/tools/` entstehen daraus automatisch, die Sitemap nimmt das Tool automatisch auf.
3. **Aussehen wie die Website:** Farbvariablen aus `public/style.css` übernehmen (hell `#fcfcfb`, dunkel `#151515`, `--text`, `--muted`, `--border`, `--tag-bg` usw.), gleiche Schrift, ruhiges Layout mit Linien statt Karten. Ein bestehendes Tool als Vorlage kopieren.
4. **Kopf (`<head>`):** `lang="de-CH"`; das Inline-Skript für das Farbschema als erstes Skript (verhindert Aufblitzen); `<title>Name | Josija Nydegger</title>`; `meta description`; Favicons; **Link-Vorschau** von Hand: `canonical`, `og:type`, `og:site_name`, `og:locale` (`de_CH`), `og:title`, `og:description`, `og:url`, `twitter:card` mit `summary`. **Kein `og:image`**, damit WhatsApp, Teams usw. wie bei den übrigen Seiten das Website-Symbol (`apple-touch-icon.png`) zeigen statt eines grossen Bildes. Ein bestehendes Tool zeigt die genauen Zeilen.
5. **Seitenaufbau:** oben `← Tools` (Link auf `/tools/`), Titel, Kurzbeschreibung mit Einheiten; Eingaben; Zeichnung/Ergebnisse; aufklappbarer **Rechenweg** mit Zwischenschritten; Abschnitt **Annahmen und Grenzen** mit Quellen bzw. Grundlagen und den geprüften Testfällen; Fusszeile mit **Haftungshinweis** ("Hilfsmittel für Studium und Vordimensionierung. Es ersetzt keine Prüfung durch eine fachkundige Person."), Links zu GitHub und Website sowie Hell/Dunkel/System-Umschalter (gleicher `localStorage`-Schlüssel `theme` wie die Website).
6. **Verhalten:** Eingaben in der Adresszeile speichern (`#` + JSON), damit ein kopierter Link dieselben Werte öffnet; Werte aus dem Link prüfen, bevor sie verwendet werden; Button "Zurücksetzen"; ungültige Eingaben mit klarer Meldung statt falscher Ergebnisse; Druckansicht hell und mit offenem Rechenweg.
7. **Inhalt:** keine Normwerte (nur Mechanik und Eingaben der Nutzer). Ausnahme auf ausdrücklichen Wunsch: E-Modul-Vorlagen im Balken-Tool (Werte mit Normangabe: Baustahl 210 000 SIA 263:2013, Betonstahl 200 000 SIA 262:2025, Holz E<sub>m,mean</sub> C24 11 000 / GL24h 11 500 SIA 265:2021 (Gebrauchstauglichkeit; E<sub>0,05</sub> 7 400 / 9 600 nur im Hinweistext), Aluminium 70 000 SN EN 1999-1-1; jederzeit frei überschreibbar); Eingaben verlassen den Rechner nicht (keine Server, keine Tracker). Bibliotheken und Schriften nur lokal einbinden, nie per CDN. Lizenz von Bibliotheken vorher prüfen.
8. **Testbar machen:** Rechenkern als reine Funktion, z. B. zwischen `/*CALC-START*/` und `/*CALC-END*/` (Balken) oder über `window.__… = { compute }` (Querschnittswerte), damit er automatisch getestet werden kann.
9. **Prüfen vor dem Commit:** gegen Tabellenwerte, Handrechnungen oder eine unabhängige Rechnung (z. B. FE) testen, inkl. Grenzfälle, als Testdatei in `_tests/` (Muster: `balken-*.test.js`, Pfad zum Tool `public/tools/<name>/index.html`) und im `test`-Skript des Haupt-`package.json` ergänzen; Darstellung auf Handybreite und im Dunkelmodus ansehen; Testfälle auf der Seite aufführen.
10. Status in `_notizen/tool-ideen.md` nachführen. Die Tools sind vorerst nur auf Deutsch; `/en/tools/` weist darauf hin.

## Zweisprachigkeit (Deutsch / Englisch)

Status: **umgesetzt** (Oktober 2026).

- Deutsch unter den bestehenden URLs (`/`, `/cv.html`, `/blog/:slug/`), Englisch unter `/en/`, `/en/cv.html`, `/en/blog/:slug/`.
- Sprachumschalter "DE | EN" oben rechts (reine Links, in `src/layouts/Base.astro`). Er sucht das Gegenstück mit gleicher `ref`: zuerst in `src/data/pages.ts`, dann bei den Beiträgen (`counterpartUrl()` in `src/lib/posts.ts`); ohne Gegenstück → Startseite der anderen Sprache (bei Beiträgen `#blog`).
- `hreflang`-Links (`de`, `en`, `x-default` → Deutsch) nur, wenn ein echtes Gegenstück existiert.
- `src/data/i18n.ts` nur für Texte, die gemeinsame Layouts und Komponenten brauchen, immer in beiden Sprachen. Texte einer einzelnen Seite (z. B. Abschnittstitel) direkt in die Seite schreiben.
- Datumsformat: Deutsch `3.11.2026`, Englisch `3 Nov 2026` (`formatDate()` in `src/data/i18n.ts`).
- RSS: eigene Atom-Feeds `/feed.xml` (DE) und `/en/feed.xml` (EN), beide aus `src/lib/feed.ts`. Formeln im Feed nur als MathML.
- PDFs der Arbeiten gibt es nur im Original. Vor dem Hochladen auf persönliche Daten prüfen (z. B. Matrikelnummern auf dem Titelblatt) und diese echt schwärzen, nicht nur überdecken.

### Übersetzung
- Texte natürlich übersetzen, nicht wörtlich. Feste Begriffe: Werkstudent → *working student*, Sozialpädagoge HF → *Social Pedagogue (Swiss College of Higher Education)*, Tragwerke → *structural engineering*, Zivildienst → *Swiss civilian service*, Matura → *Swiss Matura (university entrance qualification)*, Tiefbau → *infrastructure engineering*, Hochbau → *structural engineering for buildings*, Projektarbeit → *semester project*. Unsichere Übersetzungen mir zur Prüfung auflisten.
- Titel der Arbeiten (auch der Maturaarbeit) bleiben im Original; nur die Beschreibung wird übersetzt.
- Eigennamen ohne offizielle englische Bezeichnung bleiben im Original (z. B. ICP Höhere Fachschule für Sozialpädagogik, HOPE Sozialwerk, Chrischtehüsli, Gymnasium Interlaken, UGZ Stadt Zürich).

### Es gilt
- **Beide Sprachen immer synchron halten:** Jede Änderung an Bio, CV, Arbeiten oder Projekten in `src/pages/index.astro`/`src/pages/cv.astro` **und** `src/pages/en/index.astro`/`src/pages/en/cv.astro` nachführen und mich darauf hinweisen.
- Blogbeiträge dürfen auch nur in einer Sprache existieren.

## Später vielleicht
- **Baukontrolle-Web-App einbinden, sobald sie fertig ist:** als eigenständige Datei unter `public/projekte/baukontrolle/index.html` (wird unverändert kopiert) und als erstes Projekt im Abschnitt "Projekte" mit Demo-Button (`target="_blank"`). Nur Beispielmodelle wie das FZK-Haus, nie Kundendaten. Google Fonts möglichst lokal einbinden.
- Newsletter über Buttondown (Gratis-Plan, manueller Versand). Erfordert Anmeldeformular, Double Opt-in und eine Datenschutzseite.
- Tags im Blog, IFC-Viewer (That Open Engine), weitere Ingenieur-Tools.
- Markdown-Prozessor Sätteri (Standard in Astro 7) statt remark/rehype, sobald es eine offizielle KaTeX-Lösung gibt. Betrifft nur `astro.config.mjs` und `src/lib/remark-math-extras.mjs`; danach die Testbeiträge in `_tests/fixtures/blog` prüfen.

## Prüfen

- **Einmalig:** Node.js 24 installieren, dann im Hauptordner `npm install`.
- **Lokal ansehen:** `npm run dev` (Vorschau unter <http://localhost:4321>, lädt bei Änderungen neu). Fertigen Build ansehen: `npm run build`, dann `npm run preview`.
- **Vor jedem Commit:** `npm run check` (Typen) und `npm test`. Prüft die Rechenkerne beider Tools gegen Formeln und eine FE-Rechnung und baut die Website zweimal (mit den echten Inhalten und mit den Testbeiträgen aus `_tests/fixtures/blog`): alle Seiten, keine Adresse der früheren Website fehlt, E-Mail nicht im Klartext, Sprachumschalter, interne Links, Feeds, Sitemap, Formeln, Datum, Lesezeit. Details: `_tests/README.md`.
- Neue Tools bekommen eine eigene Testdatei in `_tests/` und einen Eintrag im `test`-Skript von `package.json`. Ändert sich eine Blog-Funktion, Testbeitrag und Prüfung gemeinsam anpassen.
- **Veröffentlichen:** Push auf `main` startet `.github/workflows/deploy.yml` (Typen, Tests, Build, Veröffentlichung, ca. 1–2 Minuten). Schlägt ein Schritt fehl, bleibt die bisherige Website online; Fehler stehen im Tab **Actions** des Repos. Pull Requests werden nur gebaut und geprüft. Nach Änderungen an Domain oder DNS: `node _tests/live-pruefung.js`.
- **Cache:** Nach Änderungen an den Markdown-Plugins (`astro.config.mjs`, `src/lib/remark-math-extras.mjs`) die Ordner `.astro/` und `node_modules/.astro/` löschen, sonst zeigt Astro Beiträge aus dem Cache.
- **Abhängigkeiten:** exakte Versionen in `package.json`. Bei einem Update von `katex` auch `katex.min.css` und die `.woff2`-Schriften aus `node_modules/katex/dist/` nach `public/assets/katex/` kopieren und `VERSION.txt` nachführen.
- Vor dem Commit: Links und Dateinamen auf exakte Schreibweise prüfen, Darstellung auf Handybreite bedenken.
- Commit-Nachrichten kurz und auf Deutsch, z. B. `Blog: Beitrag zu IfcOpenShell` oder `Arbeiten: PDF Projektarbeit BFH`.
