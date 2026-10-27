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

## Referenz: Adressen der früheren Website

`referenz/` enthält aus dem Stand vom 26.10.2026 (kurz vor dem Wechsel von Jekyll zu Astro) die Liste aller veröffentlichten Adressen (`dateien.txt`) und die damalige Sitemap (`live/sitemap.xml`). Diese Adressen dürfen nie verschwinden: `website.test.js` prüft das bei jedem Build. Wird eine Adresse bewusst entfernt, gehört sie in die Liste `REMOVED` in `website.test.js` und `live-pruefung.js`.

Die Werkzeuge, mit denen beim Wechsel Seitenköpfe und Inhalte 1:1 verglichen wurden, sind mit der Umstellung entfallen (in der Git-Geschichte bis Commit `1839758` vorhanden).

## Live-Prüfung

```
node _tests/live-pruefung.js
```

braucht Internet. Ruft alle Adressen der Referenz auf <https://josija-nydegger.ch> ab und prüft Umleitungen (www, http, github.io, /en), Google-Bestätigung und 404-Seite. Sinnvoll nach Änderungen an Domain, DNS oder den Pages-Einstellungen.

## Neue Tools

Jedes neue Tool bekommt eine eigene Testdatei nach demselben Muster: Rechenkern aus der HTML-Datei laden (`/*CALC-START*/ … /*CALC-END*/` oder `window.__…` über jsdom), gegen Formeln, Tabellenwerte oder eine unabhängige Rechnung prüfen und in `package.json` (Hauptordner) bei `test` ergänzen.
