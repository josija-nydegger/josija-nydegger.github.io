# CLAUDE.md

Persönliche Website von Josija Nydegger (Bauingenieurwesen, BIM, Digital Construction).
Live: <https://josija-nydegger.github.io> · gehostet mit GitHub Pages (Jekyll, Build direkt durch GitHub).

## Grundsätze

- **Schlicht bleiben:** eine Spalte, viel Weissraum, keine Animationen, keine Frameworks (kein React, Tailwind, Bootstrap), kein Build-Tool. Nur HTML, CSS, Jekyll/Liquid und Markdown.
- **Kein externes JavaScript und keine Tracker**, ausser es wird ausdrücklich gewünscht.
- **Sprache:** Deutsch, Schweizer Rechtschreibung (immer `ss`, nie `ß`). Arbeitstitel in Originalsprache belassen.
- **Datenschutz:** Keine E-Mail-Adresse, Wohnadresse, Telefonnummer, kein Geburtsdatum und kein Zivilstand auf der Seite. Kontakt läuft über LinkedIn.
- Änderungen klein halten und bestehende Klassen in `style.css` wiederverwenden, statt neue Stile zu erfinden.

## Struktur

```
_config.yml          Jekyll-Einstellungen, Plugins (seo-tag, feed, sitemap), Social-Links
_layouts/post.html   Layout für Blogbeiträge
_posts/              Blogbeiträge in Markdown (werden automatisch gelistet)
_drafts/vorlage.md   Vorlage für neue Beiträge (wird nicht veröffentlicht)
index.html           Startseite: Bio, Arbeiten, Projekte, Blog, Kontakt
cv.html              Lebenslauf
style.css            Gesamtes Design; Farben als CSS-Variablen inkl. Dark Mode
images/              profil.jpg, og-image.jpg (Link-Vorschau 1200×630), blog/ für Beitragsbilder
arbeiten/            PDFs von Arbeiten (Projekt-, Bachelorarbeiten)
favicon.svg, favicon-32.png, apple-touch-icon.png
ANLEITUNG.md         Anleitung für PDF-Uploads (nicht veröffentlicht)
```

`index.html` und `cv.html` beginnen mit Front Matter (`---`), damit Liquid-Tags wie `{% seo %}` funktionieren. Diese Zeilen nicht entfernen.

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
  ---
  ```
- Optional `image: /images/blog/bild.jpg` für eine eigene Link-Vorschau.
- Layout wird automatisch gesetzt (`defaults` in `_config.yml`).
- Beiträge werden teils in Obsidian geschrieben: Wikilinks `[[...]]` in normale Markdown-Links umwandeln, Bilder nach `images/blog/` verschieben und mit absolutem Pfad (`/images/blog/...`) einbinden.

### Arbeiten (index.html, Abschnitt "Arbeiten")
- Neueste zuerst. Ein Eintrag ist ein `<li class="item">`-Block mit `item-head`, `item-title`, `item-year`, `item-sub`.
- PDF in `arbeiten/` ablegen und verlinken mit
  `<div class="tags"><a class="tag" href="arbeiten/DATEI.pdf">PDF</a></div>`.

### Projekte (index.html, Abschnitt "Projekte")
- Gleiche Struktur wie Arbeiten; Tags für Links (`Code`, `Demo`) und Technologien.

## Nächste Aufgabe: Website zweisprachig (Deutsch / Englisch)

Status: **geplant, noch nicht umgesetzt.** Ziel: alle Inhalte in beiden Sprachen, ausser die PDFs der Arbeiten (nur im Original).

### Anforderungen
- **Deutsch bleibt Hauptsprache** unter den bestehenden URLs (`/`, `/cv.html`), damit Links und Google-Einträge gültig bleiben.
- **Englisch unter `/en/`**: `/en/` (Startseite) und `/en/cv.html`. Blogbeiträge unter `/en/blog/:title/`.
- **Sprachumschalter oben rechts** auf jeder Seite ("DE | EN", aktive Sprache hervorgehoben). Er führt zur **entsprechenden Seite** in der anderen Sprache (CV → CV, Beitrag → übersetzter Beitrag). Gibt es keine Übersetzung eines Beitrags, führt er zur Startseite der anderen Sprache (Abschnitt Blog).
- Schlicht im bestehenden Stil, gut bedienbar auf dem Handy, ohne JavaScript (reine Links).

### Umsetzung (Vorschlag)
- Ein gemeinsames Layout (`_layouts/default.html`) mit `<head>`, Umschalter und Footer, das `index`, `cv` und Beiträge beider Sprachen nutzen. Doppelten Code vermeiden.
- Front Matter jeder Seite und jedes Beitrags: `lang: de` oder `lang: en` und eine gemeinsame Kennung `ref:` (z. B. `ref: home`, `ref: cv`, `ref: ifcopenshell-einstieg`). Der Umschalter sucht in `site.pages` bzw. `site.posts` das Gegenstück mit gleicher `ref` und anderer `lang`.
- Beiträge: `_posts/` für Deutsch, englische Beiträge mit `lang: en` und `permalink: /en/blog/:title/` (per `defaults` in `_config.yml` für einen Unterordner, z. B. `_posts/en/`). Die Blog-Liste auf jeder Startseite zeigt nur Beiträge der eigenen Sprache.
- `<html lang="…">` je nach Seite setzen; `hreflang`-Links (`de`, `en`, `x-default` → Deutsch) im `<head>` für Google.
- Feste Texte (Abschnittstitel "Arbeiten/Works", "Projekte/Projects", "Zurück/Back", "Die ersten Beiträge folgen bald" usw.) in `_data/i18n.yml` ablegen statt doppelt hart codieren.
- Datumsformat: Deutsch `3.11.2026`, Englisch `3 Nov 2026`.
- RSS: jekyll-feed unterstützt Kategorien/Sprachen nur eingeschränkt. Lösung wählen (z. B. eigener Feed `/en/feed.xml` als Liquid-Template) und die Feed-Links pro Sprache anpassen.
- `jekyll-seo-tag`: `locale` pro Seite setzen (`de_CH` / `en_US`).
- `ANLEITUNG.md` und `_drafts/vorlage.md` um die englische Variante ergänzen.

### Übersetzung
- Texte natürlich übersetzen, nicht wörtlich. Begriffe mit Vorsicht: Werkstudent → *working student*, Sozialpädagoge HF → *Social Pedagogue (Swiss College of Higher Education)*, Tragwerke → *structural engineering / load-bearing structures*, Zivildienst → *Swiss civilian service*, Matura → *Swiss Matura (university entrance qualification)*. Unsichere Übersetzungen mir zur Prüfung auflisten.
- Titel der Arbeiten bleiben im Original; nur die Beschreibung (z. B. "Projektarbeit, Berner Fachhochschule") wird übersetzt.

### Danach gilt
- **Beide Sprachen immer synchron halten:** Jede Änderung an Bio, CV, Arbeiten oder Projekten in beiden Versionen nachführen und mich darauf hinweisen.
- Blogbeiträge dürfen auch nur in einer Sprache existieren.

## Später vielleicht
- **Baukontrolle-Web-App einbinden, sobald sie fertig ist:** als eigenständige Datei unter `projekte/baukontrolle/index.html` (ohne Front Matter, damit Jekyll sie unverändert kopiert) und als erstes Projekt im Abschnitt "Projekte" mit Demo-Button (`target="_blank"`). Nur Beispielmodelle wie das FZK-Haus, nie Kundendaten. Google Fonts möglichst lokal einbinden.
- Newsletter über Buttondown (Gratis-Plan, manueller Versand). Erfordert Anmeldeformular, Double Opt-in und eine Datenschutzseite.
- Eigene Domain, Tags im Blog, KaTeX für Formeln, IFC-Viewer (That Open Engine), kleine Ingenieur-Tools.

## Prüfen

- Es gibt keinen lokalen Build. Nach dem Push baut GitHub die Seite in 1–2 Minuten; Fehler stehen im Tab **Actions** des Repos.
- Vor dem Commit: Liquid-Syntax prüfen (`{% %}` / `{{ }}` geschlossen), Links und Dateinamen auf exakte Schreibweise prüfen, Darstellung auf Handybreite bedenken.
- Commit-Nachrichten kurz und auf Deutsch, z. B. `Blog: Beitrag zu IfcOpenShell` oder `Arbeiten: PDF Projektarbeit BFH`.
