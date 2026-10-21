# CLAUDE.md

Persönliche Website von Josija Nydegger (Bauingenieurwesen, BIM, Digital Construction).
Live: <https://josija-nydegger.github.io> · gehostet mit GitHub Pages (Jekyll, Build direkt durch GitHub).

## Grundsätze

- **Schlicht bleiben:** eine Spalte, viel Weissraum, keine Animationen, keine Frameworks (kein React, Tailwind, Bootstrap), kein Build-Tool. Nur HTML, CSS, Jekyll/Liquid und Markdown.
- **Kein externes JavaScript und keine Tracker**, ausser es wird ausdrücklich gewünscht. Einzige Ausnahme sind die kleinen eigenen Inline-Skripte in `_layouts/default.html`: der Hell/Dunkel/System-Umschalter (speichert die Wahl in `localStorage`, ohne JavaScript bleibt die Systemeinstellung aktiv und die Buttons sind ausgeblendet) und das Einsetzen der E-Mail-Adresse.
- **Sprache:** Deutsch (Hauptsprache, Schweizer Rechtschreibung, immer `ss`, nie `ß`) und Englisch (amerikanische Schreibweise, `en_US`). Arbeitstitel in Originalsprache belassen.
- **Datenschutz:** Keine Wohnadresse, Telefonnummer, kein Geburtsdatum und kein Zivilstand auf der Seite. Kontakt über LinkedIn und E-Mail.
- **E-Mail nie im Klartext** in HTML oder Repo schreiben (das Repo ist öffentlich). Sie steht nur Base64-kodiert als `email_b64` in `_config.yml` und wird per Inline-Skript in `_layouts/default.html` in alle `<a class="email">` eingesetzt. Umgebende Texte stehen in `<span class="email-wrap" hidden>` und bleiben ohne JavaScript ausgeblendet. Aktuell: Kontakt-Abschnitt beider Startseiten und Kopf beider Lebensläufe.
- Änderungen klein halten und bestehende Klassen in `style.css` wiederverwenden, statt neue Stile zu erfinden.

## Struktur

```
_config.yml          Jekyll-Einstellungen, Plugins (seo-tag, sitemap), Social-Links, defaults für lang/locale
_data/i18n.yml       Feste Texte der gemeinsamen Templates ("Zurück", Blog, Datumsformat, Theme-Buttons) auf DE und EN
_layouts/default.html  Gemeinsames Layout: <head>, hreflang, Sprachumschalter, Footer mit Theme-Umschalter
_layouts/post.html   Layout für Blogbeiträge (baut auf default auf)
_includes/blog-list.html  Blog-Liste der Startseite (nur Beiträge der eigenen Sprache)
_includes/atom.xml   Vorlage für die RSS-/Atom-Feeds
_posts/              Deutsche Blogbeiträge in Markdown (werden automatisch gelistet)
_posts/en/           Englische Blogbeiträge (→ /en/blog/:title/)
_drafts/vorlage.md   Vorlage für neue Beiträge (wird nicht veröffentlicht)
index.html           Startseite DE: Bio, Arbeiten, Projekte, Blog, Kontakt
cv.html              Lebenslauf DE
feed.xml             RSS-Feed DE
en/index.html        Startseite EN (/en/)
en/cv.html           Lebenslauf EN (/en/cv.html)
en/feed.xml          RSS-Feed EN
404.html             Fehlerseite "PAGE NOT FOUND" (Englisch, eine für die ganze Seite)
style.css            Gesamtes Design; Farben als CSS-Variablen inkl. Dark Mode (System + data-theme)
images/              profil.jpg, og-image.jpg (Link-Vorschau 1200×630), blog/ für Beitragsbilder
arbeiten/            PDFs von Arbeiten (Projekt-, Bachelorarbeiten), nur im Original
favicon.svg, favicon-32.png, apple-touch-icon.png
ANLEITUNG.md         Anleitung für PDF-Uploads (nicht veröffentlicht)
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
- Layout wird automatisch gesetzt (`defaults` in `_config.yml`).
- Beiträge werden teils in Obsidian geschrieben: Wikilinks `[[...]]` in normale Markdown-Links umwandeln, Bilder nach `images/blog/` verschieben und mit absolutem Pfad (`/images/blog/...`) einbinden.

### Arbeiten (index.html, Abschnitt "Arbeiten")
- Neueste zuerst. Ein Eintrag ist ein `<li class="item">`-Block mit `item-head`, `item-title`, `item-year`, `item-sub`.
- PDF in `arbeiten/` ablegen und verlinken mit
  `<div class="tags"><a class="tag" href="/arbeiten/DATEI.pdf" target="_blank" rel="noopener">PDF</a></div>`.
- Immer auch in `en/index.html` eintragen: Titel im Original, nur die Beschreibung übersetzen.

### Projekte (index.html, Abschnitt "Projekte")
- Gleiche Struktur wie Arbeiten; Tags für Links (`Code`, `Demo`) und Technologien. Links immer als `<a class="tag">` (bekommen automatisch Rahmen und ↗), reine Info-Tags als `<span class="tag">`.

## Zweisprachigkeit (Deutsch / Englisch)

Status: **umgesetzt** (Oktober 2026).

- Deutsch unter den bestehenden URLs (`/`, `/cv.html`, `/blog/:title/`), Englisch unter `/en/`, `/en/cv.html`, `/en/blog/:title/`.
- Sprachumschalter "DE | EN" oben rechts (reine Links). Er sucht in `site.pages` bzw. `site.posts` die Seite mit gleicher `ref` und anderer `lang`; ohne Gegenstück → Startseite der anderen Sprache (bei Beiträgen `#blog`).
- `hreflang`-Links (`de`, `en`, `x-default` → Deutsch) nur, wenn ein echtes Gegenstück existiert.
- `_data/i18n.yml` nur für Texte, die gemeinsame Templates (`_layouts/`, `_includes/`) brauchen, immer in beiden Sprachen. Texte einer einzelnen Seite (z. B. Abschnittstitel) direkt in die Seite schreiben.
- Datumsformat: Deutsch `3.11.2026`, Englisch `3 Nov 2026` (`date_format` in `i18n.yml`).
- RSS: jekyll-feed wurde ersetzt durch eigene Atom-Feeds `/feed.xml` (DE) und `/en/feed.xml` (EN), beide aus `_includes/atom.xml`.
- PDFs der Arbeiten gibt es nur im Original.

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
- Eigene Domain, Tags im Blog, KaTeX für Formeln, IFC-Viewer (That Open Engine), kleine Ingenieur-Tools.

## Prüfen

- Es gibt keinen lokalen Build. Nach dem Push baut GitHub die Seite in 1–2 Minuten; Fehler stehen im Tab **Actions** des Repos.
- Vor dem Commit: Liquid-Syntax prüfen (auch `_layouts/`, `_includes/`, `_data/i18n.yml`) (`{% %}` / `{{ }}` geschlossen), Links und Dateinamen auf exakte Schreibweise prüfen, Darstellung auf Handybreite bedenken.
- Commit-Nachrichten kurz und auf Deutsch, z. B. `Blog: Beitrag zu IfcOpenShell` oder `Arbeiten: PDF Projektarbeit BFH`.
