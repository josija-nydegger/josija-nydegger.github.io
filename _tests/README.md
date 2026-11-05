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
| `biegebemessung.test.js` | Biegebemessung-Tool: f<sub>cd</sub> gegen SIA 262 Tabelle 8, A<sub>s</sub> und A<sub>s</sub>' gegen Handrechnungen, Mindestbewehrung gegen das Rissmoment, Rückrechnung M<sub>Rd</sub> = M<sub>d</sub> für über 400 Kombinationen, M<sub>Rd</sub> gegen eine unabhängige Faserintegration (Rechteckblock und Parabel-Rechteck), Eingabeprüfung |
| `lastkombinationen.test.mjs` | Lastkombinationen-Tool: Normwerte im Code (SIA 260 Tabellen 1 und 2), Tragsicherheit und Gebrauchstauglichkeit gegen Handrechnungen (nur G, eine Q, kleinere Q massgebend, günstiges G, Schnee nach h<sub>0</sub>, Lasteinzugsbreite), Schneelast nach SIA 261 (s<sub>k</sub>, μ<sub>1</sub> nach Figur 2, 5.3.4 und Figur 4, C<sub>e</sub>, C<sub>T</sub>), ungültige Eingaben. Ohne Abhängigkeiten: liest den Block zwischen `CALC-START` und `CALC-END` |
| `einheiten.test.mjs` | Einheiten-Umrechner: Rechenkern `src/lib/einheiten.ts` (Node führt die TypeScript-Datei direkt aus). Bekannte Paare (1 kN/cm² = 10 MPa, 1 N/mm² = 1000 kN/m², 1 cm⁴ = 10'000 mm⁴, 1 kNm = 10⁶ Nmm, 25 kN/m³ = 2548 kg/m³), alle Kategorien hin und zurück, Masse ↔ Kraft mit g = 9.81 und 10, Gross-/Kleinschreibung (mN ≠ MN), Schreibweisen (1'250,5, m2/m^2/m², kNm/kN·m/kN*m, in/->/to), Rechnen (3.5 kN/m * 6 m = 21 kN), Temperatur absolut und als Differenz, Neigung (100 % = 45°, 1:n), Hinweise bei gleicher Dimension, Rundung und wissenschaftliche Schreibweise, Fehlermeldungen |
| `website.test.js` | Ganze Website, mit Astro zweimal gebaut (in temporäre Ordner, `dist/` bleibt unberührt). **A) echte Inhalte:** alle Seiten entstehen, keine Adresse der bisherigen Website fehlt (`referenz/dateien.txt`), keine Vorlagen-Reste, keine E-Mail im Klartext (Repo und Build), Sprachumschalter und hreflang, interne Links, Feeds und Sitemap gültig, robots.txt, Einheiten-Umrechner als App (Manifest, Icons, Service Worker nur im Tool-Ordner, übrige Seiten ohne Manifest und Service Worker). **B) Testbeiträge** aus `fixtures/blog/`: welche Beiträge erscheinen (Zukunft, Entwurf), Formeln, Dollar als Text, Typografie, Datum, Lesezeit, älter/neuer, Sprachumschalter, Blog-Liste, Link-Vorschau, Feeds, Sitemap |

Einzelne Tests: `node _tests/balken-momente.test.js` usw. Die Tool-Tests nehmen optional einen anderen Pfad zur HTML-Datei als Argument (Standard: `public/tools/<name>/index.html`).

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
