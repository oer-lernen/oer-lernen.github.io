# Komma ermittelt – Sprachdetektei

Lernspiele, Puzzles und Quizze von Sebastian Wolf, veröffentlicht über GitHub Pages (Repository oer-lernen.github.io) unter https://www.kommakatze.de/.
Die Lernmaterialien stehen unter CC BY-SA 4.0 (Einzelheiten und Schriftlizenzen: `lizenzen.html`).

## Ordner

```
index.html            Startseite (Fallakten, Aktenzeichen, Menü für Lehrkräfte)
impressum.html        Impressum
404.html              Seite für falsche Adressen (GitHub Pages zeigt sie automatisch)
datenschutz.html      Hinweis zum Datenschutz
lizenzen.html         Lizenz der Materialien und der Schriften
assets/css/           Gestaltung für Startseite und Rechtsseiten
assets/js/            tageszeit.js (Tag/Nacht nach Uhrzeit, Lampe schaltet von Hand um), startseite.js
assets/fonts/         Pixelify Sans mit Lizenz (OFL.txt)
assets/bilder/        Symbol für den Browser-Tab
Programme/            Lernspiele, Puzzle-Generator, Quiz-Generator, Quiz-Player
Programme/puzzles/    fertige Puzzles und Quizze und die Code-Liste liste.js
```

## Neues Puzzle oder Quiz hinzufügen

1. Die exportierte Datei in `Programme/puzzles/` ablegen.
2. In `Programme/puzzles/liste.js` eine Zeile ergänzen: `CODE   Dateiname.html   # Notiz`
   (Der Generator zeigt die fertige Zeile unter „Zeile für die Code-Liste“ an.)
3. Kontrolle: Auf der Startseite „Für Lehrkräfte“ → „Code-Liste prüfen“.

Die Startseite liest dieselbe Liste: Ein Aktenzeichen öffnet die passende Datei direkt in der Spiel-Ebene
(abgeschottet wie im Quiz-Player). Der Quiz-Player selbst bleibt für ältere Links (`Programme/Der-Quiz-Player.html#CODE`)
und für „Code-Liste prüfen“.

## Spiel-Ebene

- Zurück und Vollbild gibt es nur in der Leiste der Spiel-Ebene. Das Spiel-Fenster darf kein eigenes Vollbild anfordern
  (`allow="fullscreen 'none'"`); die Spiele blenden ihren Vollbild-Knopf dann aus. Einzeln geöffnet behalten sie ihn.
- Impressum, Datenschutz und Lizenzen öffnen sich aus der Spiel-Ebene in einem neuen Tab, damit der Spielstand erhalten bleibt.
- Die Spiele zeigen in der Detektei keine eigenen Rechtslinks; die Leiste übernimmt das. Einzeln geöffnet zeigen alle Lernspiele,
  der Quiz-Player und die Generatoren kleine Links auf dieselben Seiten (Impressum, Datenschutz, Lizenzen).
  Erkennung: Ein kurzes Skript im Kopf jeder Datei setzt die Klasse `eingebettet`, wenn die Datei in einem iframe läuft.

## Tag und Nacht

- Die Startseite wechselt nach der Uhrzeit des Geräts (7 bis 19 Uhr Tag, sonst Nacht).
- Ein Klick auf die Schreibtischlampe schaltet von Hand um (Licht an = Nacht, Licht aus = Tag).
  Die Wahl gilt bis zum nächsten Neuladen; gespeichert wird nichts.

## Adressen zum Verlinken

- Ein Spiel direkt öffnen: `https://www.kommakatze.de/#fall/zeitfaden`
  (außerdem `fall/wortarten-labor`, `fall/wortwurfbude`, `fall/kasus-teich`, `fall/abteil-7`, `fall/faelscherwerkstatt`)
- Eine Akte direkt öffnen: `https://www.kommakatze.de/#akte/GRIMM`
- Werkzeuge: `#werkzeug/puzzle-generator`, `#werkzeug/quiz-generator`, `#werkzeug/code-liste`
