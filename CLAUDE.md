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

## Prüfen

- Es gibt keinen lokalen Build. Nach dem Push baut GitHub die Seite in 1–2 Minuten; Fehler stehen im Tab **Actions** des Repos.
- Vor dem Commit: Liquid-Syntax prüfen (`{% %}` / `{{ }}` geschlossen), Links und Dateinamen auf exakte Schreibweise prüfen, Darstellung auf Handybreite bedenken.
- Commit-Nachrichten kurz und auf Deutsch, z. B. `Blog: Beitrag zu IfcOpenShell` oder `Arbeiten: PDF Projektarbeit BFH`.
