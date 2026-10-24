# CLAUDE.md

Persönliche Website von Josija Nydegger (Bauingenieurwesen, BIM, Digital Construction).
Live: <https://josija-nydegger.github.io> · gehostet mit GitHub Pages (Jekyll, Build direkt durch GitHub).

## Grundsätze

- **Schlicht bleiben:** eine Spalte, viel Weissraum, keine Animationen, keine Frameworks (kein React, Tailwind, Bootstrap), kein Build-Tool. Nur HTML, CSS, Jekyll/Liquid und Markdown.
- **Kein externes JavaScript und keine Tracker**, ausser es wird ausdrücklich gewünscht. Einzige Ausnahme sind die kleinen eigenen Inline-Skripte in `_layouts/default.html`: der Hell/Dunkel/System-Umschalter (speichert die Wahl in `localStorage`, ohne JavaScript bleibt die Systemeinstellung aktiv und die Buttons sind ausgeblendet), das Einsetzen der E-Mail-Adresse und der Button "Als PDF speichern" im Lebenslauf (öffnet den Druckdialog, ohne JavaScript ausgeblendet). Die Tools unter `tools/` sind eigenständige Seiten mit eigenem Inline-JavaScript (siehe Abschnitt "Tools"). Dazu KaTeX für Formeln in Blogbeiträgen, **lokal** in `assets/katex/` (kein CDN), nur auf Beiträgen geladen, die `$`, `\(` oder `\[` enthalten.
- **Sprache:** Deutsch (Hauptsprache, Schweizer Rechtschreibung, immer `ss`, nie `ß`) und Englisch (amerikanische Schreibweise, `en_US`). Arbeitstitel in Originalsprache belassen.
- **Datenschutz:** Keine Wohnadresse (Strasse), Telefonnummer und kein Geburtsdatum auf der Seite. Auf Wunsch veröffentlicht: Wohnort Lyss und "seit 2024 verheiratet mit Prisca" (Lebenslauf, Abschnitt Persönliches, und erster Satz der Startseite). Kontakt über LinkedIn und E-Mail.
- **E-Mail nie im Klartext** in HTML oder Repo schreiben (das Repo ist öffentlich). Sie steht nur Base64-kodiert als `email_b64` in `_config.yml` und wird per Inline-Skript in `_layouts/default.html` in alle `<a class="email">` eingesetzt. Umgebende Texte stehen in `<span class="email-wrap" hidden>` und bleiben ohne JavaScript ausgeblendet. Aktuell: Kontakt-Abschnitt beider Startseiten und Kopf beider Lebensläufe.
- Änderungen klein halten und bestehende Klassen in `style.css` wiederverwenden, statt neue Stile zu erfinden.

## Struktur

```
_config.yml          Jekyll-Einstellungen, Plugins (seo-tag, sitemap), Social-Links, defaults für lang/locale
_data/tools.yml      Liste der Tools für /tools/ und /en/tools/ (Titel, Beschreibung, Tags auf DE und EN)
_data/i18n.yml       Feste Texte der gemeinsamen Templates ("Zurück", Blog, Datumsformat, Theme-Buttons) auf DE und EN
_layouts/default.html  Gemeinsames Layout: <head>, hreflang, Menü, Sprachumschalter, Footer mit Theme-Umschalter
_includes/nav.html   Menü oben links: Start/Home · CV · Tools · Blog (folgt der Sprache der Seite)
_layouts/post.html   Layout für Blogbeiträge (baut auf default auf)
_includes/blog-list.html  Blog-Liste der Startseite (nur Beiträge der eigenen Sprache)
_includes/atom.xml   Vorlage für die RSS-/Atom-Feeds
_includes/person-jsonld.html  Strukturierte Daten (schema.org/Person) für Google auf Startseite und CV
_posts/              Deutsche Blogbeiträge in Markdown (werden automatisch gelistet)
_posts/en/           Englische Blogbeiträge (→ /en/blog/:title/)
_drafts/vorlage.md   Vorlage für neue Beiträge (wird nicht veröffentlicht)
_notizen/            Interne Notizen, z. B. tool-ideen.md (Ordner mit _ wird nicht veröffentlicht)
index.html           Startseite DE: Bio, Arbeiten, Projekte, Blog, Kontakt
cv.html              Lebenslauf DE
feed.xml             RSS-Feed DE
en/index.html        Startseite EN (/en/)
en/cv.html           Lebenslauf EN (/en/cv.html)
en/feed.xml          RSS-Feed EN
tools/index.html     Übersicht der Tools DE (/tools/), Liste aus _data/tools.yml
en/tools/index.html  Übersicht der Tools EN (/en/tools/)
tools/<name>/index.html  Einzelnes Tool, eigenständige HTML-Seite ohne Front Matter (nur Deutsch)
404.html             Fehlerseite "PAGE NOT FOUND" (Englisch, eine für die ganze Seite)
style.css            Gesamtes Design; Farben als CSS-Variablen inkl. Dark Mode (System + data-theme)
assets/katex/        KaTeX 0.16.11 (MIT) für LaTeX-Formeln im Blog, nur .woff2-Schriften
images/              profil.jpg, og-image.jpg (Link-Vorschau 1200×630), projekte/ für Projekt-Icons, blog/ für Beitragsbilder
arbeiten/            PDFs von Arbeiten (Projekt-, Bachelorarbeiten), nur im Original
favicon.svg, favicon-32.png, apple-touch-icon.png
ANLEITUNG.md         Anleitung für PDF-Uploads (nicht veröffentlicht)
README.md            Beschreibung für das GitHub-Repo (nicht veröffentlicht)
```

Alle Seiten beginnen mit Front Matter (`---`) mit `layout: default` und `ref:`. Diese Zeilen nicht entfernen. `lang` und `locale` setzt `_config.yml` automatisch (Ordner `en/` und `_posts/en/` → Englisch, sonst Deutsch).

**Achtung Permalinks:** Weil `permalink: /blog/:title/` in `_config.yml` mit `/` endet, macht Jekyll aus jeder Seite mit Front Matter eine Ordner-URL (`cv.html` → `/cv/`). Jede neue Seite braucht deshalb ein explizites `permalink:` im Front Matter (z. B. `permalink: /cv.html`). Interne Links und Asset-Pfade immer absolut schreiben (`/style.css`, `/images/...`).

`google385c59b71b73dd03.html` ist die Bestätigungsdatei für die Google Search Console: nicht löschen und Inhalt nicht ändern. Sie soll oben `---` / `sitemap: false` / `---` erhalten, damit sie nicht in der Sitemap erscheint (falls noch nicht erledigt).

## Konventionen

### Blogbeiträge
- Datei: `_posts/JJJJ-MM-TT-titel-mit-bindestrichen.md` (Kleinbuchstaben, keine Umlaute im Dateinamen).
- Front Matter mindestens:
  ```yaml
  ---
  title: Titel des Beitrags
  description: Ein Satz Zusammenfassung (für Blog-Liste und Link-Vorschau).
  ref: kurze-kennung
  ---
  ```
- Englische Übersetzung: `_posts/en/JJJJ-MM-TT-english-title.md` mit **derselben `ref`**. Ohne Gegenstück führt der Sprachumschalter zur Blog-Liste der anderen Sprache.
- Optional `image: /images/blog/bild.jpg` für eine eigene Link-Vorschau.
- Layout wird automatisch gesetzt (`defaults` in `_config.yml`). Es zeigt automatisch die Lesezeit (ca. 200 Wörter/Minute) und Links zum vorherigen/nächsten Beitrag derselben Sprache (nur falls vorhanden).
- **Formeln (LaTeX):** inline `$…$`, als Block `$$…$$` in einem eigenen Absatz. kramdown wandelt `$$…$$` selbst in `\(…\)` bzw. `\[…\]` um und schützt den Inhalt; einzelne `$…$` bleiben unverändert und werden erst im Browser von KaTeX gesetzt. Deshalb gilt bei `$…$`: Markdown verarbeitet den Inhalt mit (`\{`, `\}`, `\\` verlieren den Backslash, `*` kann kursiv machen). Solche Formeln inline als `$$…$$` schreiben. Dollarzeichen als Text: `<span class="nomath">$</span>`. `{{`/`{%` in Formeln mit `{% raw %}` schützen.
- Beiträge werden teils in Obsidian geschrieben: Wikilinks `[[...]]` in normale Markdown-Links umwandeln, Bilder nach `images/blog/` verschieben und mit absolutem Pfad (`/images/blog/...`) einbinden.

### Arbeiten (index.html, Abschnitt "Arbeiten")
- Neueste zuerst. Ein Eintrag ist ein `<li class="item">`-Block mit `item-head`, `item-title`, `item-year`, `item-sub`.
- PDF in `arbeiten/` ablegen und verlinken mit
  `<div class="tags"><a class="tag" href="/arbeiten/DATEI.pdf" target="_blank" rel="noopener">PDF</a></div>`.
- Immer auch in `en/index.html` eintragen: Titel im Original, nur die Beschreibung übersetzen.

### Projekte (index.html, Abschnitt "Projekte")
- Gleiche Struktur wie Arbeiten; Tags für Links (`Code`, `Demo`) und Technologien. Links immer als `<a class="tag">` (bekommen automatisch Rahmen und ↗), reine Info-Tags als `<span class="tag">`.
- Projekt-Icon: rund, 160×160 px, in `images/projekte/`, vor dem Titel mit `<img class="item-icon" src="/images/projekte/NAME.png" alt="" width="40" height="40" loading="lazy">`.

### Menü
- Oben links auf allen Seiten mit `layout: default`: Start (EN: Home) · CV · Tools · Blog, rechts der Sprachumschalter. Aktiver Punkt über `page.ref` (`home`, `cv`, `tools`) bzw. Blogbeitrag.
- Neue Hauptseiten bekommen ein eigenes `ref` und, falls sie ins Menü gehören, einen Eintrag in `_includes/nav.html` (beide Sprachen). Der Lebenslauf hat keinen Zurück-Button mehr, das Menü ersetzt ihn.

### Lebenslauf und strukturierte Daten
- Der Lebenslauf hat eine eigene Druckansicht (`@media print` in `style.css`): immer hell, ohne Navigation, keine Seitenumbrüche mitten in einem Eintrag.
- Änderungen an Arbeitgeber, Studium oder Wohnort auch in `_includes/person-jsonld.html` nachführen (z. B. BSB + Partner beenden, sobald die Stelle bei Baukonstrukt AG beginnt).

## Tools

Kleine Web-Tools zu Tragwerken, Statik und BIM unter `/tools/`. Ideen und Reihenfolge stehen in `_notizen/tool-ideen.md`.
Bisher: `tools/balken/` (Balken mit Auskragung, Einfeld- und Durchlaufträger) und `tools/querschnittswerte/`.

### Neues Tool erstellen
1. **Ablage:** `tools/<name>/index.html`, Ordnername kurz, Kleinbuchstaben, ohne Umlaute. **Kein Front Matter**, damit Jekyll die Datei unverändert kopiert (kein Liquid, kein Layout). Eine einzige Datei mit eigenem `<style>` und `<script>`.
2. **Liste:** Eintrag in `_data/tools.yml` oben einfügen (neueste zuerst) mit `url`, `year`, `title`/`description`/`tags` je in `de` und `en`. Die Übersichten `/tools/` und `/en/tools/` entstehen daraus automatisch.
3. **Aussehen wie die Website:** Farbvariablen aus `style.css` übernehmen (hell `#fcfcfb`, dunkel `#151515`, `--text`, `--muted`, `--border`, `--tag-bg` usw.), gleiche Schrift, ruhiges Layout mit Linien statt Karten. Ein bestehendes Tool als Vorlage kopieren.
4. **Kopf (`<head>`):** `lang="de-CH"`; das Inline-Skript für das Farbschema als erstes Skript (verhindert Aufblitzen); `<title>Name | Josija Nydegger</title>`; `meta description`; Favicons; **Link-Vorschau** von Hand: `canonical`, `og:type`, `og:site_name`, `og:locale` (`de_CH`), `og:title`, `og:description`, `og:url`, `og:image` (`/images/og-image.jpg`, 1200×630), `twitter:card`. Ein bestehendes Tool zeigt die genauen Zeilen.
5. **Seitenaufbau:** oben `← Tools` (Link auf `/tools/`), Titel, Kurzbeschreibung mit Einheiten; Eingaben; Zeichnung/Ergebnisse; aufklappbarer **Rechenweg** mit Zwischenschritten; Abschnitt **Annahmen und Grenzen** mit Quellen bzw. Grundlagen und den geprüften Testfällen; Fusszeile mit **Haftungshinweis** ("Hilfsmittel für Studium und Vordimensionierung. Es ersetzt keine Prüfung durch eine fachkundige Person."), Links zu GitHub und Website sowie Hell/Dunkel/System-Umschalter (gleicher `localStorage`-Schlüssel `theme` wie die Website).
6. **Verhalten:** Eingaben in der Adresszeile speichern (`#` + JSON), damit ein kopierter Link dieselben Werte öffnet; Werte aus dem Link prüfen, bevor sie verwendet werden; Button "Zurücksetzen"; ungültige Eingaben mit klarer Meldung statt falscher Ergebnisse; Druckansicht hell und mit offenem Rechenweg.
7. **Inhalt:** keine Normwerte (nur Mechanik und Eingaben der Nutzer); Eingaben verlassen den Rechner nicht (keine Server, keine Tracker). Bibliotheken und Schriften nur lokal einbinden, nie per CDN. Lizenz von Bibliotheken vorher prüfen.
8. **Testbar machen:** Rechenkern als reine Funktion, z. B. zwischen `/*CALC-START*/` und `/*CALC-END*/` (Balken) oder über `window.__… = { compute }` (Querschnittswerte), damit er automatisch getestet werden kann.
9. **Prüfen vor dem Commit:** gegen Tabellenwerte, Handrechnungen oder eine unabhängige Rechnung (z. B. FE) testen, inkl. Grenzfälle; Darstellung auf Handybreite und im Dunkelmodus ansehen; Testfälle auf der Seite aufführen.
10. Status in `_notizen/tool-ideen.md` nachführen. Die Tools sind vorerst nur auf Deutsch; `/en/tools/` weist darauf hin.

## Zweisprachigkeit (Deutsch / Englisch)

Status: **umgesetzt** (Oktober 2026).

- Deutsch unter den bestehenden URLs (`/`, `/cv.html`, `/blog/:title/`), Englisch unter `/en/`, `/en/cv.html`, `/en/blog/:title/`.
- Sprachumschalter "DE | EN" oben rechts (reine Links). Er sucht in `site.pages` bzw. `site.posts` die Seite mit gleicher `ref` und anderer `lang`; ohne Gegenstück → Startseite der anderen Sprache (bei Beiträgen `#blog`).
- `hreflang`-Links (`de`, `en`, `x-default` → Deutsch) nur, wenn ein echtes Gegenstück existiert.
- `_data/i18n.yml` nur für Texte, die gemeinsame Templates (`_layouts/`, `_includes/`) brauchen, immer in beiden Sprachen. Texte einer einzelnen Seite (z. B. Abschnittstitel) direkt in die Seite schreiben.
- Datumsformat: Deutsch `3.11.2026`, Englisch `3 Nov 2026` (`date_format` in `i18n.yml`).
- RSS: jekyll-feed wurde ersetzt durch eigene Atom-Feeds `/feed.xml` (DE) und `/en/feed.xml` (EN), beide aus `_includes/atom.xml`.
- PDFs der Arbeiten gibt es nur im Original. Vor dem Hochladen auf persönliche Daten prüfen (z. B. Matrikelnummern auf dem Titelblatt) und diese echt schwärzen, nicht nur überdecken.

### Übersetzung
- Texte natürlich übersetzen, nicht wörtlich. Feste Begriffe: Werkstudent → *working student*, Sozialpädagoge HF → *Social Pedagogue (Swiss College of Higher Education)*, Tragwerke → *structural engineering*, Zivildienst → *Swiss civilian service*, Matura → *Swiss Matura (university entrance qualification)*, Tiefbau → *infrastructure engineering*, Hochbau → *structural engineering for buildings*, Projektarbeit → *semester project*. Unsichere Übersetzungen mir zur Prüfung auflisten.
- Titel der Arbeiten (auch der Maturaarbeit) bleiben im Original; nur die Beschreibung wird übersetzt.
- Eigennamen ohne offizielle englische Bezeichnung bleiben im Original (z. B. ICP Höhere Fachschule für Sozialpädagogik, HOPE Sozialwerk, Chrischtehüsli, Gymnasium Interlaken, UGZ Stadt Zürich).

### Es gilt
- **Beide Sprachen immer synchron halten:** Jede Änderung an Bio, CV, Arbeiten oder Projekten in `index.html`/`cv.html` **und** `en/index.html`/`en/cv.html` nachführen und mich darauf hinweisen.
- Blogbeiträge dürfen auch nur in einer Sprache existieren.

## Später vielleicht
- **Baukontrolle-Web-App einbinden, sobald sie fertig ist:** als eigenständige Datei unter `projekte/baukontrolle/index.html` (ohne Front Matter, damit Jekyll sie unverändert kopiert) und als erstes Projekt im Abschnitt "Projekte" mit Demo-Button (`target="_blank"`). Nur Beispielmodelle wie das FZK-Haus, nie Kundendaten. Google Fonts möglichst lokal einbinden.
- Newsletter über Buttondown (Gratis-Plan, manueller Versand). Erfordert Anmeldeformular, Double Opt-in und eine Datenschutzseite.
- Eigene Domain, Tags im Blog, IFC-Viewer (That Open Engine), kleine Ingenieur-Tools.

## Prüfen

- Es gibt keinen lokalen Build. Nach dem Push baut GitHub die Seite in 1–2 Minuten; Fehler stehen im Tab **Actions** des Repos.
- Vor dem Commit: Liquid-Syntax prüfen (auch `_layouts/`, `_includes/`, `_data/i18n.yml`) (`{% %}` / `{{ }}` geschlossen), Links und Dateinamen auf exakte Schreibweise prüfen, Darstellung auf Handybreite bedenken.
- Commit-Nachrichten kurz und auf Deutsch, z. B. `Blog: Beitrag zu IfcOpenShell` oder `Arbeiten: PDF Projektarbeit BFH`.
