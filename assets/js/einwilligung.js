/* EINWILLIGUNG v1 – Speichern auf diesem Gerät nur mit Einwilligung (wie Silbenexpress und Kommas Zählrahmen)
   Quelle: assets/js/einwilligung.js. Dieser Block steckt wortgleich in jedem Spiel, das etwas speichert,
   damit die Spiele auch einzeln und offline laufen. Nach einer Änderung hier: python3 werkzeuge/einwilligung_einbauen.py

   - Beim ersten Start fragt ein Fenster „Eine Frage an die Erwachsenen“.
   - „Ja, merken“: Die Einwilligung (kommas-einwilligung-v1) gilt für alle Spiele dieser Website.
   - „Nein, nichts speichern“: Es wird nichts gespeichert, auch nicht die Antwort. Beim nächsten Start fragt das Spiel erneut.
   - Widerruf unter „Für Lehrkräfte“ → „Auf diesem Gerät merken: Nicht merken“: Alle Spielstände dieser Website werden gelöscht.
   Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG.

   Für das Spiel: KommaSpeicher.darf() vor jedem Lesen und Schreiben prüfen;
   KommaSpeicher.frage(name, beiJa) einmal beim Start aufrufen;
   KommaSpeicher.setze(true|false) für den Schalter im Lehrkräfte-Menü; KommaSpeicher.beiAenderung(fn). */
(function () {
  'use strict';
  if (window.KommaSpeicher) return;
  var SCHLUESSEL = 'kommas-einwilligung-v1';
  /* Alle Speicherstände der Sprachdetektei: werden beim Widerruf gelöscht */
  var PRAEFIXE = ['kommas-einwilligung', 'abteil7', 'kasusteich', 'zeitfaden', 'wortwurfbude', 'faelscherwerkstatt'];
  var DATENSCHUTZ = 'https://www.kommakatze.de/datenschutz.html';
  var zustand = null;          /* true = ja, false = nein (nur für diesen Aufruf), null = noch nicht gefragt */
  var hoerer = [];

  function lies() { try { return localStorage.getItem(SCHLUESSEL) === 'ja'; } catch (e) { return false; } }
  if (lies()) zustand = true;

  function loescheAlles() {
    try {
      var weg = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i) || '';
        if (PRAEFIXE.some(function (p) { return k.indexOf(p) === 0; })) weg.push(k);
      }
      weg.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) { /* ohne Speicher gibt es nichts zu löschen */ }
  }

  function setze(ja) {
    zustand = !!ja;
    if (ja) { try { localStorage.setItem(SCHLUESSEL, 'ja'); } catch (e) {} }
    else loescheAlles();
    hoerer.forEach(function (fn) { try { fn(zustand); } catch (e) {} });
  }

  function stil() {
    if (document.getElementById('komma-einwilligung-stil')) return;
    var s = document.createElement('style');
    s.id = 'komma-einwilligung-stil';
    s.textContent =
      '.ke-hg{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(30,20,40,.6)}' +
      '.ke-karte{max-width:460px;width:100%;max-height:calc(100% - 32px);overflow:auto;background:#FFFDF6;color:#2A2138;border:4px solid #2A2138;border-radius:18px;box-shadow:6px 6px 0 #2A2138;padding:20px 22px;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:left}' +
      '.ke-karte h2{margin:0 0 8px;font-size:1.25rem;line-height:1.25}' +
      '.ke-karte p{margin:0 0 10px}' +
      '.ke-reihe{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0 8px}' +
      '.ke-knopf{flex:1 1 160px;font:inherit;font-weight:700;padding:10px 14px;border:3px solid #2A2138;border-radius:12px;cursor:pointer;color:#2A2138}' +
      '.ke-ja{background:#BFEBD8}.ke-nein{background:#F7E08A}' +
      '.ke-knopf:focus-visible,.ke-link:focus-visible{outline:3px dashed #D94F5C;outline-offset:3px}.ke-karte:focus{outline:none}' +
      '.ke-link{color:#5A4A9E;font-weight:700}' +
      '.ke-klein{font-size:.85rem;color:#5B5070}';
    (document.head || document.documentElement).appendChild(s);
  }

  /* Fragt einmal, solange nicht eingewilligt wurde; beiJa() läuft nach „Ja, merken“ */
  function frage(name, beiJa) {
    if (zustand !== null) return;
    var los = function () {
      if (zustand !== null || document.querySelector('.ke-hg')) return;
      stil();
      var vorher = document.activeElement;
      var hg = document.createElement('div');
      hg.className = 'ke-hg';
      hg.innerHTML =
        '<div class="ke-karte" role="dialog" aria-modal="true" aria-labelledby="ke-titel" aria-describedby="ke-text" tabindex="-1">' +
        '<h2 id="ke-titel">Eine Frage an die Erwachsenen</h2>' +
        '<p id="ke-text"></p>' +
        '<p>Die Angaben bleiben im Browser dieses Geräts und gelten für alle Spiele der Sprachdetektei. Es werden keine Cookies gesetzt, keine Namen gespeichert und keine Daten übertragen. Ändern lässt sich das jederzeit unter „Für Lehrkräfte“.</p>' +
        '<div class="ke-reihe"><button type="button" class="ke-knopf ke-ja">Ja, merken</button><button type="button" class="ke-knopf ke-nein">Nein, nichts speichern</button></div>' +
        '<p class="ke-klein">Ohne Speichern funktioniert alles, der Stand ist aber nach dem Schließen weg. <a class="ke-link" href="' + DATENSCHUTZ + '" target="_blank" rel="noopener">Datenschutzerklärung lesen</a></p>' +
        '</div>';
      hg.querySelector('#ke-text').textContent = 'Darf „' + name + '“ auf diesem Gerät merken, wie weit gespielt wurde (Fortschritt, Sticker und Einstellungen)?';
      var zu = function (ja) {
        if (hg.parentNode) hg.parentNode.removeChild(hg);
        setze(ja);
        if (ja && typeof beiJa === 'function') { try { beiJa(); } catch (e) {} }
        if (vorher && vorher.focus && document.contains(vorher)) { try { vorher.focus(); } catch (e) {} }
      };
      hg.querySelector('.ke-ja').addEventListener('click', function () { zu(true); });
      hg.querySelector('.ke-nein').addEventListener('click', function () { zu(false); });
      /* Tab bleibt im Fenster */
      hg.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var f = hg.querySelectorAll('button,a');
        var erst = f[0], letzt = f[f.length - 1];
        if (e.shiftKey && document.activeElement === erst) { e.preventDefault(); letzt.focus(); }
        else if (!e.shiftKey && document.activeElement === letzt) { e.preventDefault(); erst.focus(); }
      });
      document.body.appendChild(hg);
      hg.querySelector('.ke-karte').focus();
    };
    if (document.body) los(); else document.addEventListener('DOMContentLoaded', los);
  }

  window.KommaSpeicher = {
    darf: function () { return zustand === true; },
    gefragt: function () { return zustand !== null; },
    setze: setze,
    frage: frage,
    beiAenderung: function (fn) { hoerer.push(fn); },
    TEXT_AN: 'Merken',
    TEXT_AUS: 'Nicht merken',
    TITEL: 'Auf diesem Gerät merken'
  };
})();
/* EINWILLIGUNG ENDE */
