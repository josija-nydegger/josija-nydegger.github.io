# josija-nydegger.ch

Persönliche Website von **Josija Nydegger**: Bauingenieurwesen, BIM und Digital Construction.

**Live:** <https://josija-nydegger.ch> · English: <https://josija-nydegger.ch/en/>

## Inhalt

- Kurzporträt, Arbeiten (mit PDFs), Projekte, Blog und Kontakt
- Lebenslauf, im Browser direkt als PDF speicherbar
- Zweisprachig: Deutsch (Hauptsprache) und Englisch unter `/en/`
- Helles und dunkles Design, folgt standardmässig der Systemeinstellung
- RSS-Feeds: [`/feed.xml`](https://josija-nydegger.ch/feed.xml) (DE) und [`/en/feed.xml`](https://josija-nydegger.ch/en/feed.xml) (EN)

## Technik

Bewusst schlicht: statisches HTML und CSS, erzeugt mit [Astro](https://astro.build), gebaut und veröffentlicht per GitHub Action auf GitHub Pages.
Keine UI-Frameworks, keine Tracker und kein externes JavaScript.
Formeln in Blogbeiträgen (LaTeX mit `$…$` und `$$…$$`) setzt [KaTeX](https://katex.org) beim Build; Stylesheet und Schriften liegen lokal in `public/assets/katex/`.

| Pfad | Inhalt |
|---|---|
| `src/pages/` | Seiten: Startseite, Lebenslauf, Tools, Blog, Feeds, Sitemap (Deutsch, Englisch unter `en/`) |
| `src/content/blog/`, `src/content/blog/en/` | Blogbeiträge in Markdown (Deutsch, Englisch) |
| `src/layouts/`, `src/components/` | Gemeinsames Layout, Blog-Layout, Menü, Link-Vorschau, strukturierte Daten |
| `src/data/` | Grundeinstellungen, feste Texte in beiden Sprachen, Liste der Tools |
| `public/style.css` | Gesamtes Design inkl. Dark Mode und Druckansicht |
| `public/tools/` | Web-Tools (eigenständige Seiten) |
| `public/arbeiten/` | PDFs der Arbeiten |
| `public/images/` | Profilbild, Link-Vorschau, Projekt-Icons, Blogbilder |
| `_tests/` | Tests für Tools und Website (`npm test`) |

## Bearbeiten

- **Neuer Blogbeitrag:** Vorlage in [`_drafts/vorlage.md`](_drafts/vorlage.md) kopieren und nach `src/content/blog/` (bzw. `src/content/blog/en/`) legen.
- **PDF einer Arbeit hinzufügen:** siehe [`ANLEITUNG.md`](ANLEITUNG.md).
- **Lokal ansehen:** einmalig `npm install`, dann `npm run dev` (Vorschau unter <http://localhost:4321>). Vor dem Commit `npm test`.
- Nach jedem Push auf `main` prüft und veröffentlicht eine GitHub Action die Seite in 1–2 Minuten. Fehler stehen im Tab **Actions**; schlägt ein Test fehl, bleibt die bisherige Version online.

Veröffentlicht wird nur, was Astro aus `src/` erzeugt, und der Inhalt von `public/`. Diese README, `ANLEITUNG.md`, `CLAUDE.md` und die Ordner mit `_` gelangen nicht auf die Website.

## Kontakt

[LinkedIn](https://www.linkedin.com/in/josija-nydegger) · [GitHub](https://github.com/josija-nydegger) · [ORCID](https://orcid.org/0009-0005-4270-2574)

© Josija Nydegger. Texte, Bilder und PDFs sind nicht zur Weiterverwendung freigegeben.
