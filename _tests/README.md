# Tests

Lokale Prüfungen für die Website und die Tools. Der Ordner beginnt mit `_` und liegt ausserhalb von `src/` und `public/`, er wird deshalb nicht veröffentlicht.

## Einmalig einrichten

Node.js muss installiert sein. Dann im Hauptordner:

```
npm install
```

## Alle Tests starten

Im Hauptordner:

```
npm test
```

Jede Datei endet mit «Alle Tests bestanden» oder «n FEHLER» (dann mit Exit-Code 1). Fehlgeschlagene Prüfungen sind mit `FAIL` markiert.

| Datei | Prüft |
|---|---|
| `balken-momente.test.js` | Balken-Tool: Stütz- und Feldmomente gegen Tabellenwerte, Auflagerkräfte gegen eine unabhängige FE-Rechnung |
| `balken-querkraft-durchbiegung.test.js` | Balken-Tool: Querkraft und Durchbiegung gegen Formeln (5qL⁴/384EI usw.) und die FE-Rechnung |
| `querschnittswerte.test.js` | Querschnittswerte-Tool: A, I, W<sub>pl</sub>, Hauptachsen gegen geschlossene Formeln und numerische Integration |
| `website.test.js` | Ganze Website, mit Astro zweimal gebaut (in temporäre Ordner, `dist/` bleibt unberührt). **A) echte Inhalte:** alle Seiten entstehen, keine Adresse der bisherigen Website fehlt (`referenz/dateien.txt`), keine Vorlagen-Reste, keine E-Mail im Klartext (Repo und Build), Sprachumschalter und hreflang, interne Links, Feeds und Sitemap gültig, robots.txt. **B) Testbeiträge** aus `fixtures/blog/`: welche Beiträge erscheinen (Zukunft, Entwurf), Formeln, Dollar als Text, Typografie, Datum, Lesezeit, älter/neuer, Sprachumschalter, Blog-Liste, Link-Vorschau, Feeds, Sitemap |

Einzelne Tests: `node _tests/balken-momente.test.js` usw. Die Balken- und Querschnitts-Tests nehmen optional einen anderen Pfad zur HTML-Datei als Argument (Standard: `public/tools/<name>/index.html`).

## Testbeiträge

`fixtures/blog/` enthält Beiträge, die jede Blog-Funktion einmal benutzen. `website.test.js` baut damit zusätzlich (`BLOG_DIR=./_tests/fixtures/blog`, siehe `src/content.config.ts`). Wer eine Blog-Funktion ändert, passt Beitrag und Prüfung gemeinsam an.

## Vergleich mit der Jekyll-Website (Migration)

`referenz/` enthält den Stand der Live-Website vom 26.10.2026, kurz vor dem Wechsel zu Astro. Gesichert mit `referenz-sichern.js` (nur für diesen Stand gedacht, nicht erneut ausführen).

```
npm run vergleich
```

baut die Website und vergleicht sie mit der Referenz:

- `head-vergleich.js`: Seitenköpfe (Titel, Meta-Tags, Links, JSON-LD). Bewusste Abweichungen stehen im Skript unter `ALLOWED`.
- `inhalt-vergleich.js`: `<body>` jeder Seite (ohne Leerraum, Kommentare und Skripte).

Das ist nur bis zur Umstellung sinnvoll: Sobald sich Inhalte ändern, weichen sie absichtlich von der Referenz ab. Die Prüfung, dass keine Adresse der Referenz verloren geht, bleibt dagegen dauerhaft in `website.test.js`.

## Neue Tools

Jedes neue Tool bekommt eine eigene Testdatei nach demselben Muster: Rechenkern aus der HTML-Datei laden (`/*CALC-START*/ … /*CALC-END*/` oder `window.__…` über jsdom), gegen Formeln, Tabellenwerte oder eine unabhängige Rechnung prüfen und in `package.json` (Hauptordner) bei `test` ergänzen.
