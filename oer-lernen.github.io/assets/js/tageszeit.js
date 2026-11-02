/* Tag oder Nacht nach Uhrzeit des Geräts: 7:00 bis 18:59 Uhr Tag, sonst Nacht. Wird jede Minute neu geprüft. */
(function () {
  function setzeTageszeit() {
    var stunde = new Date().getHours();
    document.documentElement.setAttribute('data-zeit', stunde >= 7 && stunde < 19 ? 'tag' : 'nacht');
  }
  setzeTageszeit();
  setInterval(setzeTageszeit, 60000);
})();
