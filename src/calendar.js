// Logica pura del calendario: nessun accesso a DOM, così è testabile in Node.
(function (root) {
  'use strict';

  var TOTAL_DAYS = 24;
  var DECEMBER = 11; // mesi JS: 0 = gennaio
  var MS_PER_DAY = 24 * 60 * 60 * 1000;
  var VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

  function isValidDay(day) {
    return Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS;
  }

  function assertDay(day) {
    if (!isValidDay(day)) throw new RangeError('Giorno non valido: ' + day);
  }

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  // Mezzanotte (ora locale del telefono) del giorno indicato.
  function unlockDate(day, year) {
    assertDay(day);
    return new Date(year, DECEMBER, day, 0, 0, 0, 0);
  }

  // Fail-closed: data non valida => casella chiusa.
  function isUnlocked(day, now, year) {
    assertDay(day);
    if (!isValidDate(now)) return false;
    return now.getTime() >= unlockDate(day, year).getTime();
  }

  // Giorni di calendario mancanti (0 se già aperta).
  function daysUntil(day, now, year) {
    assertDay(day);
    if (!isValidDate(now)) return null;
    if (isUnlocked(day, now, year)) return 0;
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var target = Date.UTC(year, DECEMBER, day);
    return Math.round((target - today) / MS_PER_DAY);
  }

  function lockedLabel(day, now, year) {
    var n = daysUntil(day, now, year);
    if (n === null) return 'Non ancora';
    if (n === 1) return 'Domani!';
    return 'Tra ' + n + ' giorni';
  }

  // "il 3 dicembre", "l'8 dicembre", "l'11 dicembre", "il 1° dicembre"
  function dateText(day) {
    assertDay(day);
    if (day === 1) return 'il 1° dicembre';
    if (day === 8 || day === 11) return 'l\'' + day + ' dicembre';
    return 'il ' + day + ' dicembre';
  }

  function isValidVideoId(id) {
    return typeof id === 'string' && VIDEO_ID_RE.test(id);
  }

  // Con un ID: player embed (youtube-nocookie) nel browser.
  // Senza ID: ricerca YouTube per titolo, così il calendario funziona già ora.
  function songUrl(song) {
    if (!song) return null;
    if (isValidVideoId(song.youtubeId)) {
      return 'https://www.youtube-nocookie.com/embed/' + song.youtubeId + '?autoplay=1&rel=0';
    }
    var q = [song.title, song.artist].join(' ').trim();
    if (!q) return null;
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  }

  function validateSongs(songs) {
    var errors = [];
    if (!Array.isArray(songs)) return ['La lista canzoni deve essere un array'];
    if (songs.length !== TOTAL_DAYS) {
      errors.push('Servono ' + TOTAL_DAYS + ' canzoni, trovate ' + songs.length);
    }
    var seen = {};
    songs.forEach(function (s, i) {
      var n = i + 1;
      if (!s || typeof s.title !== 'string' || !s.title.trim()) {
        errors.push('Casella ' + n + ': titolo mancante');
        return;
      }
      var id = s.youtubeId;
      if (id !== undefined && id !== '' && !isValidVideoId(id)) {
        errors.push('Casella ' + n + ': youtubeId non valido "' + id + '"');
      }
      if (isValidVideoId(id)) {
        if (seen[id]) errors.push('Casella ' + n + ': video duplicato della casella ' + seen[id]);
        else seen[id] = n;
      }
    });
    return errors;
  }

  // Ordine "sparso" delle caselle, come nei calendari veri. Deterministico.
  function gridOrder() {
    var order = [];
    for (var i = 0; i < TOTAL_DAYS; i++) order.push(((i * 7) % TOTAL_DAYS) + 1);
    return order;
  }

  var api = {
    TOTAL_DAYS: TOTAL_DAYS,
    isValidDay: isValidDay,
    unlockDate: unlockDate,
    isUnlocked: isUnlocked,
    daysUntil: daysUntil,
    lockedLabel: lockedLabel,
    dateText: dateText,
    isValidVideoId: isValidVideoId,
    songUrl: songUrl,
    validateSongs: validateSongs,
    gridOrder: gridOrder
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Advent = api;
})(this);
