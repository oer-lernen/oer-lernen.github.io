/* Komma ermittelt – Startseite: Spiel-Ebene, Aktenzeichen, Menü für Lehrkräfte, Ton, Vollbild, Komma, Lampe */

/* Empfang der Code-Liste: Programme/puzzles/liste.js ruft puzzleListe(`…`) auf (wird nach dieser Datei geladen) */
window.puzzleListe = function (text) { window.PUZZLE_LISTE_TEXT = String(text); };

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var SEITENTITEL = document.title;
  var AKTEN_ORDNER = 'Programme/puzzles/';

  /* ---------- Code-Liste lesen: je Zeile "CODE  Dateiname  # Notiz" ----------
     Dieselben Regeln wie im Quiz-Player („Code-Liste prüfen“): Bei doppelten Codes gilt der erste Eintrag,
     und es werden nur .html-Dateien aus dem Ordner puzzles geöffnet. */
  function saeubereCode(text) {
    return String(text || '').toUpperCase()
      .replace(/[ÄÖÜ]/g, function (u) { return { 'Ä': 'AE', 'Ö': 'OE', 'Ü': 'UE' }[u]; })
      .replace(/[^A-Z0-9]/g, '');
  }
  function leseListe() {
    if (typeof window.PUZZLE_LISTE_TEXT !== 'string') return null;
    var liste = {};
    window.PUZZLE_LISTE_TEXT.split(/\r?\n/).forEach(function (zeile) {
      var ohneNotiz = zeile.split('#')[0].trim();
      if (!ohneNotiz) return;
      var teile = ohneNotiz.split(/\s+/);
      if (teile.length !== 2) return;
      var code = saeubereCode(teile[0]);
      var datei = teile[1];
      if (code.length !== 5 || !/\.html?$/i.test(datei)) return;
      if (/^[a-z]+:/i.test(datei) || datei.charAt(0) === '/' || datei.indexOf('..') >= 0 || datei.indexOf('\\') >= 0) return;
      if (!Object.prototype.hasOwnProperty.call(liste, code)) liste[code] = datei;
    });
    return liste;
  }
  var LISTE = leseListe();

  /* ---------- Ton: kurze Rechtecktöne über Web Audio, standardmäßig aus; toene = [[Hz, Sekunden], …] ---------- */
  var tonAn = false;
  var audio = null;
  var TON_FEHLER = [[220, 0.18]];
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
  /* Welches Symbol zu sehen ist, regelt detektei.css über aria-pressed */
  $('ton-knopf').addEventListener('click', function () {
    tonAn = !tonAn;
    this.setAttribute('aria-pressed', String(tonAn));
    $('ton-text').textContent = tonAn ? 'Ton an' : 'Ton aus';
    piep([[660, 0.06], [880, 0.1]]);
  });

  /* ---------- Vollbild: Startseite oder Spiel-Ebene; Knöpfe verschwinden, wo der Browser es nicht kann (z. B. iPhone) ---------- */
  /* Die Detektei ist allein für das Vollbild zuständig: Das Spiel-Fenster darf es nicht selbst anfordern
     (siehe neuerRahmen), deshalb blenden die Spiele dort ihre eigenen Vollbild-Knöpfe aus. */
  var vollbildMoeglich = !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
  var SYMBOL_GROSS = 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5';   /* Ecken nach außen: Vollbild */
  var SYMBOL_KLEIN = 'M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5';   /* Ecken nach innen: Vollbild beenden */
  function umschaltenVollbild(element) {
    try {
      var p = document.fullscreenElement ? document.exitFullscreen() : element.requestFullscreen();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  /* Beide Knöpfe zeigen an, was ein Klick bewirkt: Vollbild an oder aus */
  function zeigeVollbildZustand() {
    var an = !!document.fullscreenElement;
    ['vollbild-knopf', 'buehne-vollbild'].forEach(function (id) {
      var knopf = $(id);
      var pfad = knopf.querySelector('path');
      if (pfad) pfad.setAttribute('d', an ? SYMBOL_KLEIN : SYMBOL_GROSS);
      knopf.setAttribute('title', an ? 'Vollbild beenden' : 'Vollbild');
    });
    $('buehne-vollbild').setAttribute('aria-label', an ? 'Vollbild beenden' : 'Vollbild');
    var text = $('vollbild-knopf').querySelector('span');
    if (text) text.textContent = an ? 'Vollbild aus' : 'Vollbild';
  }
  /* Im Vollbild bleibt der Bildschirm an (z. B. am Smartboard), sofern der Browser das kann */
  var wachSperre = null;
  var wachAnfrage = false;
  function wachHalten(an) {
    if (!('wakeLock' in navigator)) return;
    if (an) {
      if (wachSperre || wachAnfrage) return;
      wachAnfrage = true;
      navigator.wakeLock.request('screen').then(function (sperre) {
        wachAnfrage = false;
        if (!document.fullscreenElement) { sperre.release().catch(function () {}); return; }
        wachSperre = sperre;
        sperre.addEventListener('release', function () { if (wachSperre === sperre) wachSperre = null; });
      }).catch(function () { wachAnfrage = false; });
    } else if (wachSperre) {
      var alt = wachSperre;
      wachSperre = null;
      alt.release().catch(function () {});
    }
  }
  if (vollbildMoeglich) {
    $('vollbild-knopf').addEventListener('click', function () { umschaltenVollbild(document.documentElement); });
    $('buehne-vollbild').addEventListener('click', function () { umschaltenVollbild($('buehne')); });
    document.addEventListener('fullscreenchange', function () {
      zeigeVollbildZustand();
      wachHalten(!!document.fullscreenElement);
    });
    /* Beim Wechsel in einen anderen Tab gibt der Browser die Sperre frei; beim Zurückkommen neu anfordern */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && document.fullscreenElement) wachHalten(true);
    });
    zeigeVollbildZustand();
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

  /* ---------- Schreibtischlampe: Licht an = Nacht, Licht aus = Tag (tageszeit.js) ---------- */
  var lampe = $('lampen-knopf');
  var tagKnopf = $('tageszeit-knopf');
  function zeigeLampe() {
    var nacht = document.documentElement.getAttribute('data-zeit') !== 'tag';
    var text = nacht ? 'Licht ausschalten (Tagansicht)' : 'Licht einschalten (Nachtansicht)';
    lampe.setAttribute('aria-label', text);
    lampe.title = text;
    /* Knopf in der Kopfzeile: fester Name „Nacht“, gedrückt = Nachtansicht ist an */
    tagKnopf.setAttribute('aria-pressed', String(nacht));
    tagKnopf.title = nacht ? 'Zur Tagansicht wechseln' : 'Zur Nachtansicht wechseln';
  }
  if (typeof window.tageszeitUmschalten === 'function') {
    var umschalten = function () {
      var neu = window.tageszeitUmschalten();
      piep(neu === 'nacht' ? [[440, 0.04], [660, 0.08]] : [[660, 0.04], [440, 0.08]]);
    };
    lampe.addEventListener('click', umschalten);
    tagKnopf.addEventListener('click', umschalten);
    /* Die Beschriftung folgt jedem Wechsel, auch dem automatischen nach Uhrzeit */
    if (window.MutationObserver) {
      new MutationObserver(zeigeLampe).observe(document.documentElement, { attributes: true, attributeFilter: ['data-zeit'] });
    } else {
      lampe.addEventListener('click', zeigeLampe);
    }
    zeigeLampe();
  } else {
    lampe.hidden = true;
    tagKnopf.hidden = true;
  }

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

  /* ---------- Aktenzeichen-Karte: Anzeige und Meldungen ---------- */
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

  /* ---------- Akten: Code prüfen, Datei suchen, Titel lesen ---------- */
  /* Geprüfte Akten merken, damit dieselbe Akte nicht zweimal geladen wird (nur gefundene, fehlende werden neu geprüft) */
  var gepruefteAkten = {};
  function aktenPfad(datei) {
    return AKTEN_ORDNER + datei.split('/').map(encodeURIComponent).join('/');
  }
  /* Liest nur den Kopf der Datei: Dort steht <script id="puzzle-meta"> mit dem Titel des Puzzles oder Quiz */
  function leseTitel(antwort) {
    try {
      var leser = antwort.body.getReader();
      var decoder = new TextDecoder();
      var text = '';
      var weiter = function () {
        return leser.read().then(function (teil) {
          if (!teil.done) text += decoder.decode(teil.value, { stream: true });
          var treffer = text.match(/id="puzzle-meta">([\s\S]*?)<\/script>/);
          if (!treffer && !teil.done && text.length < 24000) return weiter();
          leser.cancel().catch(function () {});
          try {
            var meta = treffer ? JSON.parse(treffer[1]) : null;
            return meta && typeof meta.title === 'string' ? meta.title : '';
          } catch (e) { return ''; }
        });
      };
      return weiter().catch(function () { return ''; });
    } catch (e) { return Promise.resolve(''); }
  }
  function pruefeAkte(code) {
    if (!LISTE) {
      return Promise.resolve({ ok: false, meldung: 'Die Code-Liste lässt sich gerade nicht lesen. Bitte gib deiner Lehrkraft Bescheid.' });
    }
    var datei = LISTE[code];
    if (!datei) {
      return Promise.resolve({ ok: false, meldung: 'Zu diesem Aktenzeichen gibt es keine Akte. Prüfe die Schreibweise.' });
    }
    if (gepruefteAkten[code]) return Promise.resolve(gepruefteAkten[code]);
    var info = { ok: true, src: aktenPfad(datei), titel: '' };
    /* Am eigenen Rechner (file://) lässt sich nichts prüfen: dann einfach öffnen */
    if (location.protocol === 'file:' || !window.fetch) return Promise.resolve(info);
    return fetch(info.src, { cache: 'no-store' }).then(function (antwort) {
      if (!antwort.ok) {
        return { ok: false, meldung: 'Die Akte ' + code + ' ist gerade nicht auffindbar. Bitte gib deiner Lehrkraft Bescheid.' };
      }
      return leseTitel(antwort).then(function (titel) {
        info.titel = titel;
        gepruefteAkten[code] = info;
        return info;
      });
    }).catch(function () { return info; });   /* Netz gestört: trotzdem versuchen */
  }

  /* ---------- Ziele der Spiel-Ebene: aus den Links mit data-route (Fallakten und Lehrkräfte-Menü) ---------- */
  var ZIELE = {};
  document.querySelectorAll('[data-route]').forEach(function (link) {
    /* data-quelle: abweichende Adresse für die Spiel-Ebene (href bleibt für „In neuem Tab öffnen“) */
    ZIELE[link.getAttribute('data-route')] = {
      titel: link.getAttribute('data-titel'),
      src: link.getAttribute('data-quelle') || link.getAttribute('href')
    };
    link.addEventListener('click', function (e) {
      /* Strg/Cmd/Umschalt oder Mittelklick: Datei normal in neuem Tab öffnen */
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      menue.open = false;
      piep([[523, 0.07], [784, 0.14]]);
      gehe(link.getAttribute('data-route'));
    });
  });

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
    /* Vollbild ausdrücklich sperren: Ohne 'none' dürften Seiten derselben Domain es automatisch.
       Die Spiele merken das (document.fullscreenEnabled ist dann false) und blenden ihren eigenen
       Vollbild-Knopf aus; vergrößert wird über den Knopf in der Leiste der Spiel-Ebene. */
    f.setAttribute('allow', "fullscreen 'none'; autoplay");
    /* Puzzles und Quizze laufen abgeschottet wie im Quiz-Player: Skripte ja, Zugriff auf die Detektei nein */
    if (ziel.akte) f.setAttribute('sandbox', 'allow-scripts');
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
    /* Nur das Vollbild der Spiel-Ebene beenden; war die ganze Startseite im Vollbild, bleibt sie es */
    if (document.fullscreenElement === buehne) {
      try { var p = document.exitFullscreen(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
    aktuellesZiel = null;
    entferneRahmen();
    buehne.hidden = true;
    seite.inert = false;
    document.documentElement.classList.remove('buehne-offen');
    document.title = SEITENTITEL;
    if (vorherFokus && document.contains(vorherFokus)) vorherFokus.focus();
  }

  /* ---------- Adresse: #fall/…, #werkzeug/… und #akte/CODE öffnen die Spiel-Ebene ---------- */
  function leseAdresse() {
    /* Eine kaputte Adresse (z. B. „#%E0“) darf die Seite nicht lahmlegen */
    try { return decodeURIComponent(location.hash.replace(/^#/, '')); } catch (e) { return ''; }
  }
  function raeumeAdresseAuf() {
    history.replaceState(null, '', location.pathname + location.search);
  }

  var aktenAnfrage = 0;
  function oeffneAkte(code) {
    if (aktuellesZiel && aktuellesZiel.code === code && !buehne.hidden) return;
    var nr = ++aktenAnfrage;
    pruefeAkte(code).then(function (info) {
      if (nr !== aktenAnfrage) return;   /* inzwischen wurde etwas anderes gewählt */
      if (!info.ok) {
        /* Meldung dort zeigen, wo man ein Aktenzeichen eingibt (z. B. bei einem veralteten Link) */
        schliesse();
        raeumeAdresseAuf();
        eingabe.value = code;
        zeigeKaestchen();
        meldung(info.meldung, true);
        piep(TON_FEHLER);
        $('akten-form').scrollIntoView({ block: 'center' });
        return;
      }
      oeffne({
        titel: info.titel ? 'Akte ' + code + ': ' + info.titel : 'Akte ' + code,
        src: info.src,
        akte: true,
        code: code
      });
    });
  }

  function folgeAdresse() {
    var weg = leseAdresse();
    var akte = /^akte\/([A-Za-z0-9]{5})$/i.exec(weg);
    if (akte) { oeffneAkte(akte[1].toUpperCase()); return; }
    aktenAnfrage++;   /* eine noch laufende Akten-Suche verwerfen */
    if (ZIELE[weg]) oeffne(ZIELE[weg]); else schliesse();
  }
  window.addEventListener('hashchange', folgeAdresse);

  /* Öffnen über die Seite selbst: neuer Verlaufseintrag, damit die Zurück-Taste des Browsers die Ebene schließt */
  var laengeBeimOeffnen = -1;
  function gehe(route) {
    history.pushState({ detektei: true }, '', '#' + route);
    laengeBeimOeffnen = history.length;
    folgeAdresse();
  }

  /* Zurück: Hat die Detektei den Verlaufseintrag selbst angelegt und kam seither keiner dazu, einen Schritt zurück –
     so läuft die Zurück-Taste des Browsers danach nicht ins Leere. Sonst (z. B. Seite über einen Link geöffnet)
     die Ebene schließen und die Adresse aufräumen, ohne die Seite zu verlassen. */
  $('buehne-zurueck').addEventListener('click', function () {
    if (aktuellesZiel && aktuellesZiel.akte && !window.confirm('Akte schließen? Was du in dieser Akte schon gelöst hast, wird nicht gespeichert.')) return;
    var eigenerEintrag = history.state && history.state.detektei && history.length === laengeBeimOeffnen;
    schliesse();
    if (eigenerEintrag) history.back(); else raeumeAdresseAuf();
  });

  /* ---------- Aktenzeichen eingeben: Buchstaben und Ziffern, höchstens fünf, Anzeige in Großbuchstaben ---------- */
  eingabe.addEventListener('input', function () {
    var sauber = eingabe.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5);
    if (sauber !== eingabe.value) eingabe.value = sauber;
    meldung('', false);
    zeigeKaestchen();
  });
  eingabe.addEventListener('focus', zeigeKaestchen);
  eingabe.addEventListener('blur', zeigeKaestchen);

  var sucheLaeuft = false;
  $('akten-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (sucheLaeuft) return;
    var code = eingabe.value.toUpperCase();
    if (code.length === 0) {
      meldung('Gib zuerst die fünf Zeichen ein.', true);
      piep(TON_FEHLER);
      return;
    }
    if (code.length < 5) {
      var fehlt = 5 - code.length;
      meldung(fehlt === 1 ? 'Es fehlt noch ein Zeichen.' : 'Es fehlen noch ' + fehlt + ' Zeichen.', true);
      piep(TON_FEHLER);
      return;
    }
    /* Erst prüfen, dann öffnen: Eine falsche Eingabe legt so keinen Verlaufseintrag an */
    sucheLaeuft = true;
    meldung('Akte ' + code + ' wird gesucht …', false);
    pruefeAkte(code).then(function (info) {
      sucheLaeuft = false;
      if (!info.ok) {
        meldung(info.meldung, true);
        piep(TON_FEHLER);
        return;
      }
      piep([[523, 0.08], [659, 0.08], [784, 0.16]]);
      eingabe.value = '';
      zeigeKaestchen();
      meldung('', false);
      gehe('akte/' + code);
    });
  });

  zeigeKaestchen();
  folgeAdresse();
});
