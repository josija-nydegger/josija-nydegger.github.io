---
title: Titel des Beitrags
description: Kurze Zusammenfassung in einem Satz (erscheint in der Blog-Liste).
ref: titel-des-beitrags
---

Diese Datei ist eine Vorlage und wird nicht veröffentlicht, weil sie im Ordner `_drafts` liegt.

**So erstellst du einen neuen Beitrag:**

1. Diese Datei kopieren und im Ordner `_posts` speichern.
2. Dateiname: `JJJJ-MM-TT-titel-ohne-leerzeichen.md`, z. B. `2026-11-03-ifcopenshell-einstieg.md`.
   Das Datum im Dateinamen ist das Veröffentlichungsdatum.
3. Oben `title`, `description` und `ref` anpassen, darunter den Text schreiben.
   `ref` ist eine kurze Kennung ohne Leerzeichen, z. B. `ifcopenshell-einstieg`.

**Englische Version (optional):**

1. Eine Kopie mit englischem Text im Ordner `_posts/en/` speichern, z. B.
   `_posts/en/2026-11-03-getting-started-with-ifcopenshell.md`.
2. Dieselbe `ref` wie beim deutschen Beitrag eintragen. Dann führt der Sprachumschalter
   "DE | EN" direkt zum übersetzten Beitrag. Sprache und Adresse (`/en/blog/...`) werden automatisch gesetzt.
3. Ein Beitrag darf auch nur in einer Sprache existieren. Dann führt der Umschalter zur Blog-Liste
   der anderen Sprache.

## Zwischentitel

Normaler Text, **fett**, *kursiv* und [ein Link](https://github.com/josija-nydegger).

- Aufzählung
- Noch ein Punkt

> Ein Zitat oder eine Randbemerkung.

Bilder legst du in `images/blog/` ab und bindest sie so ein:

![Beschreibung des Bildes](/images/blog/beispiel.jpg)

Formeln (LaTeX) inline mit einfachem Dollar: $\sigma = \frac{N}{A}$, und als eigener Absatz mit doppeltem Dollar:

$$M_{max} = \frac{q \cdot l^2}{8}$$

Hinweise zu Formeln:

- Enthält eine Inline-Formel `\{`, `\}`, `\\` oder `*`, schreibe sie mit doppeltem Dollar im Fliesstext,
  z. B. `die Menge $$\{1, 2, 3\}$$ ist …`. Sie wird trotzdem inline dargestellt.
- Für ein normales Dollarzeichen im Text: `<span class="nomath">$</span>`.
- Stehen in einer Formel zwei geschweifte Klammern direkt nacheinander (öffnend), Leerzeichen dazwischen setzen,
  sonst hält Jekyll sie für eigenen Code.

Code:

```python
import ifcopenshell
model = ifcopenshell.open("modell.ifc")
print(len(model.by_type("IfcBeam")))
```
