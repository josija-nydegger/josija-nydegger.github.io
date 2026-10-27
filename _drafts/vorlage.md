---
title: Titel des Beitrags
description: Kurze Zusammenfassung in einem Satz (erscheint in der Blog-Liste).
ref: titel-des-beitrags
---

Diese Datei ist eine Vorlage und wird nicht veröffentlicht, weil sie im Ordner `_drafts` liegt.

**So erstellst du einen neuen Beitrag:**

1. Diese Datei kopieren und im Ordner `src/content/blog` speichern.
2. Dateiname: `JJJJ-MM-TT-titel-ohne-leerzeichen.md`, z. B. `2026-11-03-ifcopenshell-einstieg.md`.
   Das Datum im Dateinamen ist das Veröffentlichungsdatum, der Rest die Adresse (`/blog/ifcopenshell-einstieg/`).
3. Oben `title`, `description` und `ref` anpassen (alle drei sind Pflicht), darunter den Text schreiben.
   `ref` ist eine kurze Kennung ohne Leerzeichen, z. B. `ifcopenshell-einstieg`.
4. Mit `npm run dev` ansehen (http://localhost:4321/blog/ifcopenshell-einstieg/), vor dem Commit `npm test`.

Optional im Front Matter: `image: /images/blog/bild.jpg` (grosses Vorschaubild beim Teilen),
`last_modified_at: 2026-11-10` (bei späteren Änderungen), `published: false` (noch nicht veröffentlichen).

**Englische Version (optional):**

1. Eine Kopie mit englischem Text im Ordner `src/content/blog/en/` speichern, z. B.
   `src/content/blog/en/2026-11-03-getting-started-with-ifcopenshell.md`.
2. Dieselbe `ref` wie beim deutschen Beitrag eintragen. Dann führt der Sprachumschalter
   "DE | EN" direkt zum übersetzten Beitrag. Sprache und Adresse (`/en/blog/...`) werden automatisch gesetzt.
3. Ein Beitrag darf auch nur in einer Sprache existieren. Dann führt der Umschalter zur Blog-Liste
   der anderen Sprache.

## Zwischentitel

Normaler Text, **fett**, *kursiv* und [ein Link](https://github.com/josija-nydegger).

- Aufzählung
- Noch ein Punkt

> Ein Zitat oder eine Randbemerkung.

Bilder legst du in `public/images/blog/` ab und bindest sie ohne `public` ein:

![Beschreibung des Bildes](/images/blog/beispiel.jpg)

Formeln (LaTeX) inline mit einfachem Dollar: $\sigma = \frac{N}{A}$, und als eigener Absatz mit doppeltem Dollar:

$$M_{max} = \frac{q \cdot l^2}{8}$$

Hinweise zu Formeln:

- Formeln werden beim Bauen gesetzt. `\{`, `\}`, `\\` und `*` funktionieren direkt, z. B. $\{1, 2, 3\}$.
- Längere Block-Formeln dürfen auch über mehrere Zeilen gehen, dann `$$` je allein auf eine Zeile.
- Für ein normales Dollarzeichen im Text: `\$` (z. B. \$5).
- Eine fehlerhafte Formel erscheint rot. Deshalb Beiträge mit Formeln vor dem Veröffentlichen in der Vorschau ansehen.

Code:

```python
import ifcopenshell
model = ifcopenshell.open("modell.ifc")
print(len(model.by_type("IfcBeam")))
```
