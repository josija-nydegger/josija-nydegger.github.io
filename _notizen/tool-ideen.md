# Tool-Ideen

Ideen für kleine, interaktive Web-Tools auf der Website (`/tools/`).
Rahmen: ohne Normwerte (Mechanik und Eingaben der Nutzer), Open Source, je eine einzelne HTML-Seite, die im Browser läuft.

Stand: 5.11.2026

## Übersicht

| # | Tool | Bereich | Aufwand | Status |
|---|---|---|---|---|
| 1 | Durchlaufträger-Rechner | Statik | mittel | umgesetzt: `tools/balken/` (Okt. 2026) |
| 2 | Querschnittswerte-Rechner | Statik | klein | umgesetzt: `tools/querschnittswerte/` (Okt. 2026) |
| 3 | Stützenlast-Abtrag nach Einzugsflächen | Tragwerksentwurf, Hochbau | klein bis mittel | offen |
| 4 | IFC-Mengen- und Property-Auszug | BIM | mittel | offen |
| 5 | IFC-Qualitätscheck | BIM | mittel bis gross | offen |
| 7 | Lastkombinationen (SIA 260) | Einwirkungen | klein bis mittel | umgesetzt: `tools/lastkombinationen/` (Nov. 2026) |
| 6 | Biegebemessung Rechteckquerschnitt (SIA 262) | Stahlbeton | mittel | umgesetzt: `tools/biegebemessung/` (Nov. 2026) |
| 8 | Einheiten-Umrechner | Allgemein | klein bis mittel | umgesetzt: `tools/einheiten/` (Nov. 2026), als App installierbar |

Empfohlene Reihenfolge: 2 → 1 → 3 → 4 → 5 (2 und 1 erledigt, als Nächstes 3)

## 1. Durchlaufträger-Rechner (Statik)

- **Eingaben:** Spannweiten, Auflager, Linien- und Einzellasten, EI.
- **Ausgaben:** Momenten-, Querkraft- und Durchbiegungsverlauf.
- **Technik:** kleines 1D-Stabwerksmodell (Steifigkeitsmethode) in JavaScript.
- **Idee:** Zwischenschritte zeigen, ähnlich wie der Lernmodus im Durchstanz-Tool.
- **Umgesetzt als "Balken mit Auskragung"** (`tools/balken/`): Einfeld- und Durchlaufträger (2–8 Felder) mit Kragarmen, Punkt- und Linienlasten; Stützmomente mit der Dreimomentengleichung (statt Steifigkeitsmethode), Auflagerkräfte, Verläufe von Querkraft, Moment und Durchbiegung (einzeln ein- und ausblendbar), EI aus E-Modul-Vorlage oder freiem E und Rechteckquerschnitt oder eingegebenem I (Link zu Querschnittswerte), Rechenweg. Geprüft gegen Tabellenwerte und eine unabhängige FE-Rechnung. Geneigte Punktlasten (Winkel α, zuschaltbar) mit Normalkraftverlauf, Auflager A fest; Dreiecks- und Trapezlasten (q links/rechts pro Abschnitt, zuschaltbar) (Nov. 2026).
- **Noch offen:** Einspannungen, Auflagersetzungen, abschnittsweise veränderliches EI, Lastfallkombinationen bzw. ungünstigste Laststellung automatisch, Momentenlasten.

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

## 6. Biegebemessung Rechteckquerschnitt nach SIA 262 (Stahlbeton)

- **Umgesetzt** (`tools/biegebemessung/`, Nov. 2026) auf ausdrücklichen Wunsch mit Normwerten der SIA 262:2025 (Vorlagen überschreibbar): erforderliche Zugbewehrung, Druckbewehrung ab wählbarer x/d-Grenze, Mindestbewehrung gegen sprödes Versagen (4.3.1.2), Stabwahl mit lichtem Abstand (5.2.3.2), M<sub>Rd</sub> der gewählten Bewehrung, x/d-Ampel (4.1.4.2.5/6), Zeichnung mit Bewehrung, Dehnungen und Spannungsblock, Rechenweg. Geprüft gegen Handrechnungen, Tabelle 8 und eine Faserintegration.
- **Mögliche Erweiterungen:** Normalkraft (Biegung mit Längskraft), Plattenbalken, zwei Bewehrungslagen, Querkraft, Mindestbewehrung für Rissbreiten (4.4.2), Plattenstreifen pro Meter mit Stababstand statt Stabzahl.

## 7. Lastkombinationen nach SIA 260 (Einwirkungen)

- **Umgesetzt** (`tools/lastkombinationen/`, Nov. 2026): Liste von Einwirkungen (G/Q, Einheit, ψ-Typ, günstig), Grundkombination Typ 2 (Gl. 16) mit jeder Q als Leiteinwirkung, seltene, häufige und quasi-ständige Lastfälle (Gl. 20–22), Lasteinzugsbreite, Übergabe von q_d ans Balken-Tool. Normwerte SIA 260:2013 Tabelle 1 und 2. Schneelast auf Dächern nach SIA 261:2020 (Lastmodell 1, μ1 nach Figur 2, 5.3.4, Figur 4), ergänzt Nov. 2026.
- **Mögliche Erweiterungen:** Schnee Lastmodell 2, Shed- und Tonnendächer (μ2, μ3), Höhensprünge (Figur 5), Schneeüberhang (5.3.7); aussergewöhnliche Situationen (Gl. 17), Typ 1 (EQU) und Typ 3 (GEO), Erd- und Wasserdruck, mehrere Lastbilder statt einer Summe, Übergabe an den Durchlaufträger mit feldweiser Nutzlast.

## 8. Einheiten-Umrechner (Allgemein)

- **Umgesetzt** (`tools/einheiten/`, Nov. 2026): ein Eingabefeld mit Freitext («12.5 kN/cm2 in MPa», «3.5 kN/m * 6 m»), Live-Resultat, ohne Zieleinheit alle Einheiten der Kategorie; Masse ↔ Kraft über wählbares g (9.81/10), Temperatur absolut und als Differenz, Neigung über tan (°, %, ‰, 1:n), Hinweise bei gleicher Dimension (kN/m² Flächenlast/Spannung usw.), Verlauf und Favoriten im Browser, Tastatur (Enter kopiert, ↑↓ Verlauf). Rechenkern in TypeScript (`src/lib/einheiten.ts`), Seite als Astro-Seite. Als App (PWA) installierbar und offline nutzbar, nur dieses Tool.
- **Erweitert** (Nov. 2026): h, min, Geschwindigkeit (km/h), Durchfluss (l/s, m³/h), Frequenz (Hz, 1/min), Hektar, Energie und Leistung (J, Wh, kWh, W), Bauphysik (λ, U, R, c, Wärmestromdichte), Bewehrung aus Ø und Abstand oder Anzahl (d12 s15, 4 d16), π/pi, Potenzen auf Klammern, ans.
- **Mögliche Erweiterungen:** angloamerikanische Einheiten (inch, lbf, psi, ksi; Achtung: «in» ist das Schlüsselwort für die Zieleinheit), alte Einheiten kp/Mp für Bestandspläne, Tage und Jahre, eigene Konstanten, Einheiten-Tabelle klickbar, Teilen-Button.

## Für alle Tools

- **Quellen angeben:** Formeln aus Mechanik sind frei, Quelle (Lehrbuch, Skript) trotzdem nennen.
- **Lizenz:** Open Source, z. B. MIT.
- **Haftungshinweis** auf jeder Seite: Hilfsmittel, ersetzt keine Prüfung durch eine fachkundige Person.
- **Testfälle:** gegen Handrechnungen oder Lehrbuchbeispiele prüfen und auf der Seite aufführen.
- **Bibliotheken und Schriften selbst hosten** (kein externes JavaScript, kein Google Fonts).
- **Ablage:** `public/tools/<name>/index.html` (wird unverändert kopiert), Eintrag in `src/data/tools.ts`, Zurück-Link zur Übersicht.
- **Rechenweg-Darstellung (für später):** Heute Monospace-Schrift mit Formeln als Text (Variante A, bewusst beibehalten). Zwei Alternativen wurden am 24.10.2026 als Vorschau geprüft:
  - **B · Computer-Modern-Schrift:** gleicher Text, aber in KaTeX_Main/KaTeX_Math (Nachbau von Computer Modern, liegt schon in `public/assets/katex/fonts/`), Variablen kursiv. Kleiner Aufwand (CSS plus kursive Auszeichnung der Variablen im Code), wirkt deutlich mehr nach LaTeX. Brüche bleiben als "a / b", Formeln nicht ausgerichtet.
  - **C · Echter Formelsatz mit KaTeX:** Rechenweg als LaTeX erzeugen und mit KaTeX setzen (echte Brüche, Summenzeichen, ausgerichtete Zeilen, linksbündig mit `fleqn`). Am schönsten, aber mehr Aufwand: jeder Rechenweg als LaTeX-Text statt HTML, KaTeX (ca. 150 KB) in den Tools laden, am besten erst beim Aufklappen des Rechenwegs. Seit dem Wechsel zu Astro liegt nur noch das Stylesheet lokal; `katex.min.js` müsste dafür wieder aus `node_modules/katex/dist/` nach `public/assets/katex/` kopiert werden (gleiche Version wie in `package.json`).
- **Vollständige Anleitung** für neue Tools (Kopf, Link-Vorschau, Seitenaufbau, Tests): `CLAUDE.md`, Abschnitt "Tools".
