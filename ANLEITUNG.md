# Anleitung: Arbeit als PDF auf der Website veröffentlichen

Website: <https://josija-nydegger.ch>
Repository: `josija-nydegger/josija-nydegger.github.io`

## 1. PDF vorbereiten

- Kurzer Dateiname **ohne Leerzeichen und Umlaute**, nur Kleinbuchstaben, Zahlen und Bindestriche.
  Beispiel: `projektarbeit-bfh-bruecken.pdf`
- Maximale Grösse beim Hochladen über den Browser: **25 MB**.
- Bei Hochschularbeiten vorher klären, ob die Veröffentlichung erlaubt ist (ETH / BFH, Betreuer:in, allfällige Partner).

## 2. PDF hochladen

Die PDFs kommen in den Ordner `public/arbeiten/` (er existiert bereits).

1. Im Repository in den Ordner `public`, dann `arbeiten` klicken.
2. Dort **Add file → Upload files** wählen und die PDF hineinziehen.
3. Auf **Commit changes** klicken.

## 3. Link auf der Startseite einfügen

1. Im Repository die Datei `src/pages/index.astro` öffnen und auf das **Stift-Symbol (Edit)** klicken.
2. Den passenden Eintrag im Abschnitt `Arbeiten` suchen.
3. Direkt unter der Zeile mit `class="item-sub"` diese Zeile einfügen und den Dateinamen anpassen:

   ```html
   <div class="tags"><a class="tag" href="/arbeiten/projektarbeit-bfh-bruecken.pdf" target="_blank" rel="noopener">PDF</a></div>
   ```

   Der Link beginnt mit `/arbeiten/`, ohne `public` (Astro veröffentlicht den Inhalt von `public/` direkt unter der Domain).

   Vollständiges Beispiel für die ETH-Arbeit:

   ```html
   <li class="item">
     <div class="item-head">
       <p class="item-title">Simulating the fluid-structure interaction of a wind turbine blade in COMSOL</p>
       <span class="item-year">2021</span>
     </div>
     <p class="item-sub">Bachelorarbeit, ETH Zürich</p>
     <div class="tags"><a class="tag" href="/arbeiten/bachelorarbeit-eth-windturbine.pdf" target="_blank" rel="noopener">PDF</a></div>
   </li>
   ```

4. Auf **Commit changes** klicken.
5. **Englische Seite nicht vergessen:** Dasselbe in `src/pages/en/index.astro` wiederholen (Abschnitt `Academic work`), mit demselben Link.
   Der Titel der Arbeit bleibt in der Originalsprache, nur die Beschreibung darunter ist englisch
   (z. B. `Semester project, Bern University of Applied Sciences`).

## 4. Prüfen

- Nach 1–2 Minuten erscheint unter der Arbeit ein **PDF**-Button, auf Deutsch (`/`) und auf Englisch (`/en/`).
- Funktioniert der Button nicht: Stimmt der Dateiname im Link **exakt** mit der hochgeladenen Datei überein, inklusive Gross- und Kleinschreibung?
- Erscheint die Änderung gar nicht: Im Repository den Tab **Actions** öffnen. Dort steht, ob die Veröffentlichung fehlgeschlagen ist (z. B. weil ein Test einen falschen Link gefunden hat: der Link muss genau zur Datei in `public/arbeiten/` passen).

## Weitere Arbeit hinzufügen

Im Abschnitt `Arbeiten` in `src/pages/index.astro` einen ganzen `<li class="item"> … </li>`-Block kopieren, darüber einfügen (neueste zuerst) und Titel, Jahr, Beschreibung und PDF-Link anpassen. Danach dasselbe in `src/pages/en/index.astro` mit englischer Beschreibung.

