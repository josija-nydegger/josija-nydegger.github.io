# josija-nydegger.github.io

Persönliche Website von **Josija Nydegger**: Bauingenieurwesen, BIM und Digital Construction.

**Live:** <https://josija-nydegger.github.io> · English: <https://josija-nydegger.github.io/en/>

## Inhalt

- Kurzporträt, Arbeiten (mit PDFs), Projekte, Blog und Kontakt
- Lebenslauf, im Browser direkt als PDF speicherbar
- Zweisprachig: Deutsch (Hauptsprache) und Englisch unter `/en/`
- Helles und dunkles Design, folgt standardmässig der Systemeinstellung
- RSS-Feeds: [`/feed.xml`](https://josija-nydegger.github.io/feed.xml) (DE) und [`/en/feed.xml`](https://josija-nydegger.github.io/en/feed.xml) (EN)

## Technik

Bewusst schlicht: reines HTML und CSS mit [Jekyll](https://jekyllrb.com/), gebaut und gehostet von GitHub Pages.
Keine Frameworks, kein Build-Tool, keine Tracker und kein externes JavaScript.
Formeln in Blogbeiträgen (LaTeX mit `$…$` und `$$…$$`) setzt [KaTeX](https://katex.org), lokal eingebunden in `assets/katex/`.

| Pfad | Inhalt |
|---|---|
| `index.html`, `cv.html` | Startseite und Lebenslauf (Deutsch) |
| `en/` | Startseite, Lebenslauf und Feed (Englisch) |
| `_posts/`, `_posts/en/` | Blogbeiträge in Markdown (Deutsch, Englisch) |
| `_layouts/`, `_includes/` | Gemeinsames Layout, Blog-Layout, Feeds, strukturierte Daten |
| `_data/i18n.yml` | Feste Texte der Templates in beiden Sprachen |
| `style.css` | Gesamtes Design inkl. Dark Mode und Druckansicht |
| `arbeiten/` | PDFs der Arbeiten |
| `images/` | Profilbild, Link-Vorschau, Projekt-Icons, Blogbilder |

## Bearbeiten

- **Neuer Blogbeitrag:** Vorlage in [`_drafts/vorlage.md`](_drafts/vorlage.md) kopieren und nach `_posts/` (bzw. `_posts/en/`) legen.
- **PDF einer Arbeit hinzufügen:** siehe [`ANLEITUNG.md`](ANLEITUNG.md).
- Nach jedem Push baut GitHub die Seite in 1–2 Minuten neu. Fehler stehen im Tab **Actions**.

Diese README, `ANLEITUNG.md` und `CLAUDE.md` werden nicht auf der Website veröffentlicht.

## Kontakt

[LinkedIn](https://www.linkedin.com/in/josija-nydegger) · [GitHub](https://github.com/josija-nydegger) · [ORCID](https://orcid.org/0009-0005-4270-2574)

© Josija Nydegger. Texte, Bilder und PDFs sind nicht zur Weiterverwendung freigegeben.
