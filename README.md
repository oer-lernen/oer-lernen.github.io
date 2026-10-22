# Komma ermittelt – Sprachdetektei

Lernspiele, Puzzles und Quizze von Sebastian Wolf, veröffentlicht über GitHub Pages unter https://oer-lernen.github.io/.
Die Lernmaterialien stehen unter CC BY-SA 4.0 (Einzelheiten und Schriftlizenzen: `lizenzen.html`).

## Ordner

```
index.html            Startseite (Fallakten, Aktenzeichen, Menü für Lehrkräfte)
impressum.html        Impressum
datenschutz.html      Hinweis zum Datenschutz
lizenzen.html         Lizenz der Materialien und der Schriften
assets/css/           Gestaltung für Startseite und Rechtsseiten
assets/js/            tageszeit.js (Tag/Nacht nach Uhrzeit), startseite.js
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

Die Startseite liest dieselbe Liste: Ein Aktenzeichen öffnet direkt die passende Akte im Quiz-Player.

## Adressen zum Verlinken

- Ein Spiel direkt öffnen: `https://oer-lernen.github.io/#fall/zeitfaden`
  (außerdem `fall/wortarten-labor`, `fall/wortwurfbude`, `fall/kasus-teich`, `fall/abteil-7`)
- Eine Akte direkt öffnen: `https://oer-lernen.github.io/#akte/GRIMM`
- Werkzeuge: `#werkzeug/puzzle-generator`, `#werkzeug/quiz-generator`, `#werkzeug/code-liste`
