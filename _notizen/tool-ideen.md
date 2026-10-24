# Tool-Ideen

Ideen für kleine, interaktive Web-Tools auf der Website (`/tools/`).
Rahmen: ohne Normwerte (Mechanik und Eingaben der Nutzer), Open Source, je eine einzelne HTML-Seite, die im Browser läuft.

Stand: 24.10.2026

## Übersicht

| # | Tool | Bereich | Aufwand | Status |
|---|---|---|---|---|
| 1 | Durchlaufträger-Rechner | Statik | mittel | teilweise umgesetzt: `tools/balken/` (Okt. 2026) |
| 2 | Querschnittswerte-Rechner | Statik | klein | umgesetzt: `tools/querschnittswerte/` (Okt. 2026) |
| 3 | Stützenlast-Abtrag nach Einzugsflächen | Tragwerksentwurf, Hochbau | klein bis mittel | offen |
| 4 | IFC-Mengen- und Property-Auszug | BIM | mittel | offen |
| 5 | IFC-Qualitätscheck | BIM | mittel bis gross | offen |

Empfohlene Reihenfolge: 2 → 1 → 3 → 4 → 5 (2 und 1 erledigt, als Nächstes 3)

## 1. Durchlaufträger-Rechner (Statik)

- **Eingaben:** Spannweiten, Auflager, Linien- und Einzellasten, EI.
- **Ausgaben:** Momenten-, Querkraft- und Durchbiegungsverlauf.
- **Technik:** kleines 1D-Stabwerksmodell (Steifigkeitsmethode) in JavaScript.
- **Idee:** Zwischenschritte zeigen, ähnlich wie der Lernmodus im Durchstanz-Tool.
- **Umgesetzt als "Balken mit Auskragung"** (`tools/balken/`): Einfeld- und Durchlaufträger (2–8 Felder) mit Kragarmen, Punkt- und Linienlasten; Stützmomente mit der Dreimomentengleichung (statt Steifigkeitsmethode), Auflagerkräfte, Momentenverlauf und Rechenweg. Geprüft gegen Tabellenwerte und eine unabhängige FE-Rechnung.
- **Noch offen:** Querkraft- und Durchbiegungsverlauf, EI als Eingabe (heute konstant angenommen), Einspannungen und Auflagersetzungen.

## 2. Querschnittswerte-Rechner (Statik)

- **Querschnitte:** Rechteck, I, T, Kreis, Rohr, zusammengesetzte Querschnitte.
- **Ausgaben:** Fläche, Schwerpunkt, Trägheitsmoment, Widerstandsmoment, Zeichnung des Querschnitts.
- **Idee:** guter Einstieg, kleiner Aufwand, füllt die Übersichtsseite.
- **Umgesetzt** (`tools/querschnittswerte/`): Rechteck, Kreis, Kreisrohr, Rechteckrohr, I, T, Winkel und zusammengesetzte Querschnitte mit Aussparungen; zusätzlich Deviationsmoment, Hauptachsen, plastische Widerstandsmomente, Formfaktoren und Eigengewicht. Geprüft gegen geschlossene Formeln.
- **Mögliche Erweiterungen:** Ausrundungsradien von Walzprofilen, Torsionswerte.

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
- **Rechenweg-Darstellung (für später):** Heute Monospace-Schrift mit Formeln als Text (Variante A, bewusst beibehalten). Zwei Alternativen wurden am 24.10.2026 als Vorschau geprüft:
  - **B · Computer-Modern-Schrift:** gleicher Text, aber in KaTeX_Main/KaTeX_Math (Nachbau von Computer Modern, liegt schon in `assets/katex/`), Variablen kursiv. Kleiner Aufwand (CSS plus kursive Auszeichnung der Variablen im Code), wirkt deutlich mehr nach LaTeX. Brüche bleiben als "a / b", Formeln nicht ausgerichtet.
  - **C · Echter Formelsatz mit KaTeX:** Rechenweg als LaTeX erzeugen und mit KaTeX setzen (echte Brüche, Summenzeichen, ausgerichtete Zeilen, linksbündig mit `fleqn`). Am schönsten, aber mehr Aufwand: jeder Rechenweg als LaTeX-Text statt HTML, KaTeX (ca. 150 KB, lokal aus `assets/katex/`) in den Tools laden, am besten erst beim Aufklappen des Rechenwegs.
- **Vollständige Anleitung** für neue Tools (Kopf, Link-Vorschau, Seitenaufbau, Tests): `CLAUDE.md`, Abschnitt "Tools".
