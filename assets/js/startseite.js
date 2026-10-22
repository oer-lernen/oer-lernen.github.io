/* Komma ermittelt – Startseite: Spiel-Ebene, Aktenzeichen, Menü für Lehrkräfte, Ton, Vollbild, Komma */

/* Empfang der Code-Liste: Programme/puzzles/liste.js ruft puzzleListe(`…`) auf (wird nach dieser Datei geladen) */
window.puzzleListe = function (text) { window.PUZZLE_LISTE_TEXT = String(text); };

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var SEITENTITEL = document.title;
  var PLAYER = 'Programme/Der-Quiz-Player.html';

  /* ---------- Code-Liste lesen: je Zeile "CODE  Dateiname  # Notiz" ---------- */
  function leseListe() {
    if (typeof window.PUZZLE_LISTE_TEXT !== 'string') return null;
    var liste = {};
    window.PUZZLE_LISTE_TEXT.split(/\r?\n/).forEach(function (zeile) {
      var ohneNotiz = zeile.split('#')[0].trim();
      if (!ohneNotiz) return;
      var teile = ohneNotiz.split(/\s+/);
      if (/^[A-Za-z0-9]{5}$/.test(teile[0]) && teile[1]) liste[teile[0].toUpperCase()] = teile[1];
    });
    return liste;
  }
  var LISTE = leseListe();

  /* ---------- Ton: kurze Rechtecktöne über Web Audio, standardmäßig aus; toene = [[Hz, Sekunden], …] ---------- */
  var tonAn = false;
  var audio = null;
  function piep(toene) {
    if (!tonAn) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audio) audio = new AC();
      var t = audio.currentTime;
      toene.forEach(function (ton) {
        var o = audio.createOscillator();
        var g = audio.createGain();
        o.type = 'square';
        o.frequency.value = ton[0];
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + ton[1]);
        o.connect(g);
        g.connect(audio.destination);
        o.start(t);
        o.stop(t + ton[1]);
        t += ton[1];
      });
    } catch (e) { /* ohne Ton geht es auch */ }
  }
  $('ton-knopf').addEventListener('click', function () {
    tonAn = !tonAn;
    this.setAttribute('aria-pressed', String(tonAn));
    $('ton-text').textContent = tonAn ? 'Ton an' : 'Ton aus';
    $('ton-an-bild').hidden = !tonAn;
    $('ton-aus-bild').hidden = tonAn;
    piep([[660, 0.06], [880, 0.1]]);
  });

  /* ---------- Vollbild: Startseite oder Spiel-Ebene; Knöpfe verschwinden, wo der Browser es nicht kann (z. B. iPhone) ---------- */
  var vollbildMoeglich = !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
  function umschaltenVollbild(element) {
    try {
      var p = document.fullscreenElement ? document.exitFullscreen() : element.requestFullscreen();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  if (vollbildMoeglich) {
    $('vollbild-knopf').addEventListener('click', function () { umschaltenVollbild(document.documentElement); });
    $('buehne-vollbild').addEventListener('click', function () { umschaltenVollbild($('buehne')); });
  } else {
    $('vollbild-knopf').hidden = true;
    $('buehne-vollbild').hidden = true;
  }

  /* ---------- Komma wecken; nach vier Sekunden schläft sie wieder ein ---------- */
  var schlafUhr = null;
  function setzeWach(wach) {
    $('tisch').classList.toggle('wach', wach);
    $('miau').hidden = !wach;
    $('zzz').hidden = wach;
    $('komma-knopf').setAttribute('aria-label', wach ? 'Komma ist wach' : 'Komma wecken');
  }
  $('komma-knopf').addEventListener('click', function () {
    clearTimeout(schlafUhr);
    if ($('tisch').classList.contains('wach')) { setzeWach(false); return; }
    setzeWach(true);
    piep([[880, 0.08], [660, 0.16]]);
    schlafUhr = setTimeout(function () { setzeWach(false); }, 4000);
  });

  /* ---------- Ziele der Spiel-Ebene: aus den Links mit data-route (Fallakten und Lehrkräfte-Menü) ---------- */
  var ZIELE = {};
  document.querySelectorAll('[data-route]').forEach(function (link) {
    ZIELE[link.getAttribute('data-route')] = { titel: link.getAttribute('data-titel'), src: link.getAttribute('href') };
    link.addEventListener('click', function (e) {
      /* Strg/Cmd/Umschalt oder Mittelklick: Datei normal in neuem Tab öffnen */
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      $('lehrkraefte').open = false;
      piep([[523, 0.07], [784, 0.14]]);
      location.hash = link.getAttribute('data-route');
    });
  });

  function zielAusAdresse() {
    var weg = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (ZIELE[weg]) return ZIELE[weg];
    var akte = /^akte\/([A-Za-z0-9]{5})$/.exec(weg);
    if (akte) {
      var code = akte[1].toUpperCase();
      return { titel: 'Akte ' + code, src: PLAYER + '#' + code };
    }
    return null;
  }

  /* ---------- Spiel-Ebene öffnen und schließen ---------- */
  /* Für jedes Ziel entsteht ein frisches iframe: So legt das Wechseln keine Verlaufseinträge im Fenster an,
     und die Zurück-Taste des Browsers schließt zuverlässig die Ebene. */
  var buehne = $('buehne');
  var seite = $('seite');
  var rahmen = null;
  var vorherFokus = null;
  var aktuellesZiel = null;

  function neuerRahmen(ziel) {
    var f = document.createElement('iframe');
    f.id = 'buehne-rahmen';
    f.title = ziel.titel;
    f.setAttribute('allow', 'fullscreen; autoplay');
    f.addEventListener('load', function () {
      if (rahmen === f) { try { f.contentWindow.focus(); } catch (e) { f.focus(); } }
    });
    f.setAttribute('src', ziel.src);
    return f;
  }

  function entferneRahmen() {
    if (rahmen && rahmen.parentNode) rahmen.parentNode.removeChild(rahmen);
    rahmen = null;
  }

  function oeffne(ziel) {
    if (aktuellesZiel && aktuellesZiel.src === ziel.src && !buehne.hidden) return;
    if (buehne.hidden) vorherFokus = document.activeElement;
    aktuellesZiel = ziel;
    $('buehne-titel').textContent = ziel.titel;
    entferneRahmen();
    rahmen = neuerRahmen(ziel);
    buehne.appendChild(rahmen);
    buehne.hidden = false;
    seite.inert = true;
    document.documentElement.classList.add('buehne-offen');
    document.title = ziel.titel + ' – Komma ermittelt';
  }

  function schliesse() {
    if (buehne.hidden) return;
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
    aktuellesZiel = null;
    entferneRahmen();
    buehne.hidden = true;
    seite.inert = false;
    document.documentElement.classList.remove('buehne-offen');
    document.title = SEITENTITEL;
    if (vorherFokus && document.contains(vorherFokus)) vorherFokus.focus();
  }

  function folgeAdresse() {
    var ziel = zielAusAdresse();
    if (ziel) oeffne(ziel); else schliesse();
  }
  window.addEventListener('hashchange', folgeAdresse);
  folgeAdresse();

  /* Zurück schließt die Ebene sofort und räumt die Adresse auf, ohne einen neuen Verlaufseintrag */
  $('buehne-zurueck').addEventListener('click', function () {
    schliesse();
    history.replaceState(null, '', location.pathname + location.search);
  });

  /* ---------- Menü „Für Lehrkräfte“: schließt bei Klick daneben und mit Escape ---------- */
  var menue = $('lehrkraefte');
  document.addEventListener('click', function (e) {
    if (menue.open && !menue.contains(e.target)) menue.open = false;
  });
  menue.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menue.open) {
      menue.open = false;
      menue.querySelector('summary').focus();
    }
  });

  /* ---------- Aktenzeichen: Buchstaben und Ziffern, höchstens fünf, Anzeige in Großbuchstaben ---------- */
  var eingabe = $('aktenzeichen');
  var kaestchen = $('kaestchen').children;
  var status = $('az-status');

  function zeigeKaestchen() {
    var wert = eingabe.value;
    var aktiv = Math.min(wert.length, 4);
    var fokus = document.activeElement === eingabe;
    for (var i = 0; i < kaestchen.length; i++) {
      kaestchen[i].textContent = wert.charAt(i);
      kaestchen[i].classList.toggle('aktiv', fokus && i === aktiv);
    }
  }
  function meldung(text, fehler) {
    status.textContent = text;
    status.classList.toggle('fehler', !!fehler);
  }
  eingabe.addEventListener('input', function () {
    var sauber = eingabe.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
    if (sauber !== eingabe.value) eingabe.value = sauber;
    meldung('', false);
    zeigeKaestchen();
  });
  eingabe.addEventListener('focus', zeigeKaestchen);
  eingabe.addEventListener('blur', zeigeKaestchen);

  $('akten-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var code = eingabe.value.toUpperCase();
    if (code.length === 0) {
      meldung('Gib zuerst die fünf Zeichen ein.', true);
      piep([[220, 0.18]]);
    } else if (code.length < 5) {
      var fehlt = 5 - code.length;
      meldung(fehlt === 1 ? 'Es fehlt noch ein Zeichen.' : 'Es fehlen noch ' + fehlt + ' Zeichen.', true);
      piep([[220, 0.18]]);
    } else if (LISTE && !LISTE[code]) {
      meldung('Zu diesem Aktenzeichen gibt es keine Akte. Prüfe die Schreibweise.', true);
      piep([[220, 0.18]]);
    } else {
      /* Ohne lesbare Liste übernimmt der Player die Prüfung */
      meldung('Akte ' + code + ' wird geöffnet …', false);
      piep([[523, 0.08], [659, 0.08], [784, 0.16]]);
      location.hash = 'akte/' + code;
      eingabe.value = '';
      zeigeKaestchen();
      meldung('', false);
    }
  });

  zeigeKaestchen();
});
