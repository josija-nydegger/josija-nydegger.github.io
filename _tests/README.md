# Tests

Lokale Prüfungen für die Website und die Tools. Der Ordner beginnt mit `_` und wird deshalb von Jekyll nicht veröffentlicht.

## Einmalig einrichten

Node.js muss installiert sein. Dann im Ordner `_tests`:

```
npm install
```

## Alle Tests starten

```
npm test
```

Jede Datei endet mit «Alle Tests bestanden» oder «n FEHLER» (dann mit Exit-Code 1). Fehlgeschlagene Prüfungen sind mit `FAIL` markiert.

| Datei | Prüft |
|---|---|
| `balken-momente.test.js` | Balken-Tool: Stütz- und Feldmomente gegen Tabellenwerte, Auflagerkräfte gegen eine unabhängige FE-Rechnung |
| `balken-querkraft-durchbiegung.test.js` | Balken-Tool: Querkraft und Durchbiegung gegen Formeln (5qL⁴/384EI usw.) und die FE-Rechnung |
| `querschnittswerte.test.js` | Querschnittswerte-Tool: A, I, W<sub>pl</sub>, Hauptachsen gegen geschlossene Formeln und numerische Integration |
| `website.test.js` | Ganze Website mit dem Jekyll-Nachbau: alle Seiten entstehen, kein Liquid übrig, keine E-Mail im Klartext, Sprachumschalter und hreflang, interne Links, Feeds |

`referenz-sichern.js` (nicht Teil von `npm test`, braucht Internet) sichert die Live-Website als Massstab für die Migration zu Astro nach `referenz/`: alle veröffentlichten Adressen, die Seitenköpfe und die Originale von Seiten, Feeds, Sitemap und robots.txt. Siehe `_notizen/astro-migration.md`.

`head-vergleich.js` vergleicht die Seitenköpfe eines Astro-Builds (`dist/`) mit `referenz/head.json`: Titel, Meta-Tags, Links und JSON-LD. Bewusste Abweichungen stehen im Skript unter `ALLOWED`. Start im Hauptordner nach `npm run build`: `node _tests/head-vergleich.js`.

Einzelne Tests: `node balken-momente.test.js` usw. Die Balken- und Querschnitts-Tests nehmen optional einen anderen Pfad zur HTML-Datei als Argument.

## Jekyll-Nachbau

`jekyll-nachbau.js` baut die Seite grob nach (Front Matter, defaults, Layouts, Includes, Filter), weil es lokal kein Jekyll gibt:

```
npm run build
```

Das Ergebnis liegt in `_tests/_site/` (nicht im Repo). Zum Ansehen z. B. `python -m http.server 4123 --directory _site`. Grenzen: Markdown nur sehr einfach, `{% seo %}` nur als Platzhalter, keine Plugins. Massgebend bleibt der echte Build auf GitHub.

## Neue Tools

Jedes neue Tool bekommt eine eigene Testdatei nach demselben Muster: Rechenkern aus der HTML-Datei laden (`/*CALC-START*/ … /*CALC-END*/` oder `window.__…` über jsdom), gegen Formeln, Tabellenwerte oder eine unabhängige Rechnung prüfen und in `package.json` bei `test` ergänzen.
