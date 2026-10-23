# Tool-Ideen

Ideen für kleine, interaktive Web-Tools auf der Website (`/tools/`).
Rahmen: ohne Normwerte (Mechanik und Eingaben der Nutzer), Open Source, je eine einzelne HTML-Seite, die im Browser läuft.

Stand: 23.10.2026

## Übersicht

| # | Tool | Bereich | Aufwand | Status |
|---|---|---|---|---|
| 1 | Durchlaufträger-Rechner | Statik | mittel | offen |
| 2 | Querschnittswerte-Rechner | Statik | klein | offen |
| 3 | Stützenlast-Abtrag nach Einzugsflächen | Tragwerksentwurf, Hochbau | klein bis mittel | offen |
| 4 | IFC-Mengen- und Property-Auszug | BIM | mittel | offen |
| 5 | IFC-Qualitätscheck | BIM | mittel bis gross | offen |

Empfohlene Reihenfolge: 2 → 1 → 3 → 4 → 5

## 1. Durchlaufträger-Rechner (Statik)

- **Eingaben:** Spannweiten, Auflager, Linien- und Einzellasten, EI.
- **Ausgaben:** Momenten-, Querkraft- und Durchbiegungsverlauf.
- **Technik:** kleines 1D-Stabwerksmodell (Steifigkeitsmethode) in JavaScript.
- **Idee:** Zwischenschritte zeigen, ähnlich wie der Lernmodus im Durchstanz-Tool.

## 2. Querschnittswerte-Rechner (Statik)

- **Querschnitte:** Rechteck, I, T, Kreis, Rohr, zusammengesetzte Querschnitte.
- **Ausgaben:** Fläche, Schwerpunkt, Trägheitsmoment, Widerstandsmoment, Zeichnung des Querschnitts.
- **Idee:** guter Einstieg, kleiner Aufwand, füllt die Übersichtsseite.

## 3. Stützenlast-Abtrag nach Einzugsflächen (Tragwerksentwurf, Hochbau)

- **Eingaben:** Stützenraster, Geschosszahl, Flächenlasten (vom Nutzer festgelegt).
- **Ausgaben:** Einzugsfläche und kumulierte Stützenlast je Stütze, als Raster dargestellt.
- **Hinweis auf der Seite:** Lastannahmen selbst festlegen und prüfen.

## 4. IFC-Mengen- und Property-Auszug im Browser (BIM)

- **Funktion:** IFC-Datei in die Seite ziehen; Anzahl und Mengen pro IFC-Klasse, Property-Sets auflisten, CSV-Export.
- **Vorteil:** Die Datei verlässt den Rechner der Nutzer nicht.
- **Technik:** Browser-Bibliothek wie web-ifc oder That Open. Lizenzen und Funktionsumfang vor der Veröffentlichung prüfen.

## 5. IFC-Qualitätscheck (BIM)

- **Funktion:** Modell auf typische Mängel prüfen, z. B. Bauteile ohne Material, ohne Geschosszuordnung, ohne Name.
- **Regeln:** vom Nutzer einstellbar (z. B. "alle Stützen brauchen die Eigenschaft Tragend").
- **Später:** Regeln am offenen Standard IDS (buildingSMART) ausrichten; aktuellen Stand prüfen.
- **Baut auf Tool 4 auf.**

## Für alle Tools

- **Quellen angeben:** Formeln aus Mechanik sind frei, Quelle (Lehrbuch, Skript) trotzdem nennen.
- **Lizenz:** Open Source, z. B. MIT.
- **Haftungshinweis** auf jeder Seite: Hilfsmittel, ersetzt keine Prüfung durch eine fachkundige Person.
- **Testfälle:** gegen Handrechnungen oder Lehrbuchbeispiele prüfen und auf der Seite aufführen.
- **Bibliotheken und Schriften selbst hosten** (kein externes JavaScript, kein Google Fonts).
- **Ablage:** `tools/<name>/index.html` ohne Front Matter, Eintrag in `_data/tools.yml`, Zurück-Link zur Übersicht.
