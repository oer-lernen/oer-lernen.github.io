/* Tag oder Nacht nach Uhrzeit des Geräts: 7:00 bis 18:59 Uhr Tag, sonst Nacht. Wird jede Minute neu geprüft.
   Auf der Startseite schaltet ein Klick auf die Schreibtischlampe von Hand um (siehe startseite.js).
   Diese Wahl gilt, bis die Seite neu geladen wird; gespeichert wird nichts. */
(function () {
  var vonHand = false;
  function setze(zeit) {
    document.documentElement.setAttribute('data-zeit', zeit);
  }
  function setzeTageszeit() {
    if (vonHand) return;
    var stunde = new Date().getHours();
    setze(stunde >= 7 && stunde < 19 ? 'tag' : 'nacht');
  }
  setzeTageszeit();
  setInterval(setzeTageszeit, 60000);

  /* Von Hand umschalten; gibt die neue Tageszeit zurück ('tag' oder 'nacht') */
  window.tageszeitUmschalten = function () {
    vonHand = true;
    var neu = document.documentElement.getAttribute('data-zeit') === 'tag' ? 'nacht' : 'tag';
    setze(neu);
    return neu;
  };
})();
