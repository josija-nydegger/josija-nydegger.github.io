# Anleitung: Arbeit als PDF auf der Website veröffentlichen

Website: <https://josija-nydegger.github.io>
Repository: `josija-nydegger/josija-nydegger.github.io`

## 1. PDF vorbereiten

- Kurzer Dateiname **ohne Leerzeichen und Umlaute**, nur Kleinbuchstaben, Zahlen und Bindestriche.
  Beispiel: `projektarbeit-bfh-bruecken.pdf`
- Maximale Grösse beim Hochladen über den Browser: **25 MB**.
- Bei Hochschularbeiten vorher klären, ob die Veröffentlichung erlaubt ist (ETH / BFH, Betreuer:in, allfällige Partner).

## 2. PDF hochladen

Die PDFs kommen in den Ordner `arbeiten/`.

**Wenn der Ordner `arbeiten` auf GitHub noch nicht existiert:**

1. Auf dem Computer einen Ordner `arbeiten` anlegen und die PDF hineinlegen.
2. Im Repository auf **Add file → Upload files** klicken.
3. Den **ganzen Ordner** `arbeiten` ins Upload-Fenster ziehen.
4. Auf **Commit changes** klicken.

**Wenn der Ordner `arbeiten` bereits existiert:**

1. Im Repository in den Ordner `arbeiten` klicken.
2. Dort **Add file → Upload files** wählen und die PDF hineinziehen.
3. Auf **Commit changes** klicken.

## 3. Link auf der Startseite einfügen

1. Im Repository die Datei `index.html` öffnen und auf das **Stift-Symbol (Edit)** klicken.
2. Den passenden Eintrag im Abschnitt `Arbeiten` suchen.
3. Direkt unter der Zeile mit `class="item-sub"` diese Zeile einfügen und den Dateinamen anpassen:

   ```html
   <div class="tags"><a class="tag" href="arbeiten/projektarbeit-bfh-bruecken.pdf">PDF</a></div>
   ```

   Vollständiges Beispiel für die ETH-Arbeit:

   ```html
   <li class="item">
     <div class="item-head">
       <p class="item-title">Simulating the fluid-structure interaction of a wind turbine blade in COMSOL</p>
       <span class="item-year">2021</span>
     </div>
     <p class="item-sub">Bachelorarbeit, ETH Zürich</p>
     <div class="tags"><a class="tag" href="arbeiten/bachelorarbeit-eth-windturbine.pdf">PDF</a></div>
   </li>
   ```

4. Auf **Commit changes** klicken.

## 4. Prüfen

- Nach 1–2 Minuten erscheint unter der Arbeit ein **PDF**-Button.
- Funktioniert der Button nicht: Stimmt der Dateiname im Link **exakt** mit der hochgeladenen Datei überein, inklusive Gross- und Kleinschreibung?
- Erscheint die Änderung gar nicht: Im Repository den Tab **Actions** öffnen. Dort steht, ob die Veröffentlichung fehlgeschlagen ist.

## Weitere Arbeit hinzufügen

Im Abschnitt `Arbeiten` in `index.html` einen ganzen `<li class="item"> … </li>`-Block kopieren, darüber einfügen (neueste zuerst) und Titel, Jahr, Beschreibung und PDF-Link anpassen.
