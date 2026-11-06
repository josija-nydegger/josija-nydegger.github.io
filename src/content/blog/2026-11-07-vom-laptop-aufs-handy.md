---
title: "Vom Laptop aufs Handy – ohne Kabel, ohne WLAN, ohne Login"
description: Wie mein Projekt QR-tool Text über eine Folge von QR-Codes aufs Handy überträgt und von Version zu Version schneller, sicherer und vielseitiger wurde.
ref: qr-tool
tags: [QR-tool, Projekt, Datenübertragung, Sicherheit, KI]
---

Ich sitze in der Vorlesung, meine Notizen liegen auf dem Laptop, und für die Zugfahrt hätte ich sie gerne auf dem Handy. Die üblichen Wege brauchen alle etwas, das ich dafür eigentlich nicht will: ein Kabel, ein gemeinsames Netzwerk oder ein Login bei einem Mail- oder Cloud-Dienst.

Deshalb habe ich **QR-tool** gebaut. Der Laptop zeigt eine schnelle Folge von QR-Codes, das Handy filmt sie mit der Kamera und setzt daraus den Text wieder zusammen. Es braucht keine App, kein Konto und keine Internetverbindung zwischen den Geräten.

## Was das Tool kann

QR-tool besteht aus zwei Webseiten. Der **Sender** ist eine einzelne Datei, die ich auf dem Laptop per Doppelklick öffne. Er funktioniert auch auf einem Computer ganz ohne Internet. Der **Empfänger** läuft im Browser des Handys.

- **Text und Dokumente:** Reiner Text oder formatierte Notizen mit Überschriften, Tabellen und mathematischen Formeln.
- **Verschlüsselung:** Mit einer Passphrase verschlüsselt. Wer den Bildschirm abfilmt, sieht nur Datensalat.
- **Visitenkarten:** Ein Kontakt als QR-Code, den jede normale Handykamera direkt speichern kann.
- **Weiterverarbeiten:** Kopieren, teilen oder als TXT-, Markdown-, CSV- oder PDF-Datei speichern.
- **Statistik:** Nach jeder Übertragung zeigt das Handy, wie lange es gedauert hat und wie schnell es war.

## So läuft eine Übertragung ab

1. Auf dem Laptop öffne ich den Sender, füge meine Notizen ein und gebe bei Bedarf eine Passphrase ein.
2. Ich starte den Stream, am besten im Kino-Modus, der die Codes bildschirmfüllend anzeigt.
3. Auf dem Handy öffne ich den Empfänger und halte die Kamera auf den Bildschirm. Ein Raster aus Kacheln färbt sich grün, während die Daten ankommen.
4. Nach wenigen Sekunden erscheinen die Notizen auf dem Handy, formatiert und bereit zum Speichern. Bei einem verschlüsselten Stream tippe ich zuerst die Passphrase ein.

<img src="/images/blog/qr-tool-streamer.png" alt="Der Sender auf dem Laptop: Vorlesungsnotizen in Markdown, Passphrase „Brücke Beton Statik Kaffee“, vier Codes pro Bild mit 15 Bildern pro Sekunde" width="480" loading="lazy">

<img src="/images/blog/qr-tool-reader.png" alt="Der Empfänger auf dem Handy nach Eingabe der Passphrase: Statistik, dieselben Notizen formatiert mit Formel und Tabelle, Export-Buttons" width="320" loading="lazy">

## Wie schnell ist das?

Ein Beispiel: Ich habe rund **30'000&nbsp;Wörter** übertragen, etwa so viel wie 100 Buchseiten. Der Text war 217&nbsp;KB gross und wurde vor dem Senden auf 84&nbsp;KB komprimiert, also um 61&nbsp;% kleiner. Mit vier Codes pro Bild und 15&nbsp;Bildern pro Sekunde war alles nach **3.2&nbsp;Sekunden** auf dem Handy. Das sind im Schnitt 25.9&nbsp;KB pro Sekunde, in der Spitze 31.3&nbsp;KB/s.

Interessant: Mehr Bilder pro Sekunde machen es nicht automatisch schneller. Mit 10 und mit 20&nbsp;Bildern pro Sekunde dauerte derselbe Test länger. Bei 20 kommt vermutlich die Handykamera nicht mehr mit, und es gehen mehr Bilder verloren. 15 Bilder pro Sekunde sind für diese Einstellung der Sweet Spot.

Und wie weit lässt sich das treiben? Für den bisher grössten Test habe ich den ganzen Roman **Moby Dick** übertragen, den es bei [Project Gutenberg](https://www.gutenberg.org/ebooks/2701) kostenlos als Textdatei gibt: 215'845&nbsp;Wörter oder 1.2&nbsp;MB Text, komprimiert noch 493&nbsp;KB. Nach **knapp über einer Minute** war das ganze Buch auf dem Handy.

## Was daran besonders ist

Die Idee, Daten über QR-Codes zu verschicken, ist nicht neu. Ein Post auf X hat mich inspiriert. Mich reizte die Frage, wie weit sich das treiben lässt. Drei Dinge machen QR-tool aus meiner Sicht besonders:

**Es gibt keinen Weg zurück.** Die Daten fliessen nur vom Bildschirm zur Kamera. Das Handy kann nichts an den Laptop zurückschicken, und unterwegs gibt es kein Netzwerk, in das sich jemand einklinken könnte.

**Verpasste Bilder spielen keine Rolle.** Wer ein Handy in der Hand hält, wackelt. Einzelne Bilder sind unscharf oder werden übersprungen. Früher hiess das: Am Ende fehlten Teil 17 und Teil 42, und ich musste sie gezielt nochmals senden. Heute verpackt der Sender die Daten mit sogenannten **Fountain-Codes**: Nach einem ersten Durchgang ist jedes weitere Bild eine Mischung aus mehreren Teilen. Das Handy muss nicht bestimmte Bilder erwischen, sondern nur *genug* davon. Sobald genug angekommen sind, lässt sich der Rest zurückrechnen, ähnlich wie bei einem Sudoku, das man mit beliebigen Hinweisen lösen kann, solange es genug sind. Das Prinzip stammt aus der Nachrichtentechnik und wird dort eingesetzt, wo der Empfänger nicht nachfragen kann.

**Es läuft einfach im Browser.** Keine Installation, kein Konto, kein Server, der die Daten speichert.

## Von Version zu Version

QR-tool ist in drei Etappen gewachsen:

- **Erste Version (Mai 2026), rund 0.7&nbsp;KB/s:** die Grundidee, formatierte Notizen mit Formeln und eine erste Verschlüsselung.
- **Am Tag danach, rund 3&nbsp;KB/s:** ein deutlich besserer Scanner, Visitenkarten und PDF-Export.
- **Überarbeitung (Oktober 2026), 25.9&nbsp;KB/s gemessen:** Sicherheit neu aufgebaut, Fountain-Codes, vier Codes pro Bild, Exporte und Statistik.

Die erste Version zeigte fünf Codes pro Sekunde mit je 150 Zeichen. Die heutige Version ist im Test rund **35-mal schneller**. Den grössten Sprung brachte nicht ein einzelner Trick, sondern die Kombination: dichtere Codes, bessere Kompression, mehrere Codes gleichzeitig und das Ende der Jagd nach fehlenden Bildern.

## Gebaut mit KI – und was ich dabei gelernt habe

QR-tool habe ich mit Hilfe von KI programmiert. Am ersten Tag entstanden so in rund sechs Stunden 37 Versionen: Ich beschrieb, was ich wollte, und hatte kurz darauf eine funktionierende Lösung. Ohne KI hätte ich das in dieser Zeit nie geschafft.

Die Kehrseite zeigte sich später. Im Oktober liess ich den Code gezielt von einer KI überprüfen, diesmal nicht mit dem Auftrag „bau mir das“, sondern „finde die Fehler“. Das Ergebnis war ernüchternd:

- Ein präparierter QR-Code hätte auf der Empfänger-Seite fremden Code ausführen können.
- Die als „militärisch“ beschriebene Verschlüsselung war deutlich schwächer als behauptet.
- Ein Filter, der eigentlich Abstürze verhindern sollte, löschte stillschweigend Zeichen wie €, Emojis oder griechische Buchstaben.
- Der Sender, der „ohne Internet“ funktionieren sollte, lud seine Bausteine in Wahrheit aus dem Internet.

Alles davon ist inzwischen behoben. Was ich daraus mitnehme: KI ist ein enormer Beschleuniger, aber die Verantwortung bleibt bei mir. Funktionen entstehen in Minuten. Ob ein Sicherheitsversprechen stimmt, muss trotzdem jemand Zeile für Zeile prüfen. Und KI ist darin erstaunlich gut, wenn man sie ausdrücklich danach fragt.

## Ausprobieren

Den Empfänger kannst du direkt auf dem Handy öffnen: [QR-Reader](https://josija-nydegger.ch/QR-tool/QR-Reader.html). Den Sender (`QR-Streamer.html`) und den gesamten Code findest du auf [GitHub](https://github.com/josija-nydegger/QR-tool).

Als Nächstes möchte ich den Empfänger noch schneller machen und neben Text auch ganze Dateien übertragen können.
