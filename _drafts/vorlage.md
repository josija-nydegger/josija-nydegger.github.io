---
title: Titel des Beitrags
description: Kurze Zusammenfassung in einem Satz (erscheint in der Blog-Liste).
---

Diese Datei ist eine Vorlage und wird nicht veröffentlicht, weil sie im Ordner `_drafts` liegt.

**So erstellst du einen neuen Beitrag:**

1. Diese Datei kopieren und im Ordner `_posts` speichern.
2. Dateiname: `JJJJ-MM-TT-titel-ohne-leerzeichen.md`, z. B. `2026-11-03-ifcopenshell-einstieg.md`.
   Das Datum im Dateinamen ist das Veröffentlichungsdatum.
3. Oben `title` und `description` anpassen, darunter den Text schreiben.

## Zwischentitel

Normaler Text, **fett**, *kursiv* und [ein Link](https://github.com/josija-nydegger).

- Aufzählung
- Noch ein Punkt

> Ein Zitat oder eine Randbemerkung.

Bilder legst du in `images/blog/` ab und bindest sie so ein:

![Beschreibung des Bildes](/images/blog/beispiel.jpg)

Code:

```python
import ifcopenshell
model = ifcopenshell.open("modell.ifc")
print(len(model.by_type("IfcBeam")))
```
