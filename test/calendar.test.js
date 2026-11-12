const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../src/calendar');

const Y = 2026;
const d = (m, day, h = 0, min = 0, s = 0, ms = 0) => new Date(Y, m - 1, day, h, min, s, ms);

// ---------- Sblocco: casi positivi ----------
test('casella 3 si apre esattamente alla mezzanotte del 3 dicembre', () => {
  assert.equal(A.isUnlocked(3, d(12, 3, 0, 0, 0, 0), Y), true);
});
test('casella 3 resta aperta nei giorni seguenti', () => {
  assert.equal(A.isUnlocked(3, d(12, 4), Y), true);
  assert.equal(A.isUnlocked(3, d(12, 31, 23, 59), Y), true);
});
test('dopo Natale e nell\'anno nuovo tutte le caselle sono aperte', () => {
  for (let day = 1; day <= 24; day++) {
    assert.equal(A.isUnlocked(day, d(12, 25), Y), true);
    assert.equal(A.isUnlocked(day, new Date(Y + 1, 0, 6), Y), true);
  }
});
test('il 1 dicembre è aperta solo la casella 1', () => {
  const now = d(12, 1, 8);
  const open = [];
  for (let day = 1; day <= 24; day++) if (A.isUnlocked(day, now, Y)) open.push(day);
  assert.deepEqual(open, [1]);
});
test('il 24 dicembre sono aperte tutte e 24', () => {
  for (let day = 1; day <= 24; day++) assert.equal(A.isUnlocked(day, d(12, 24, 0), Y), true);
});

// ---------- Sblocco: casi negativi ----------
test('casella 3 chiusa un millisecondo prima della mezzanotte', () => {
  assert.equal(A.isUnlocked(3, d(12, 2, 23, 59, 59, 999), Y), false);
});
test('a novembre tutte chiuse', () => {
  for (let day = 1; day <= 24; day++) assert.equal(A.isUnlocked(day, d(11, 30, 23, 59), Y), false);
});
test('stesso giorno ma anno precedente: chiusa', () => {
  assert.equal(A.isUnlocked(5, new Date(Y - 1, 11, 25), Y), false);
});
test('data non valida: casella chiusa (fail-closed)', () => {
  assert.equal(A.isUnlocked(1, new Date('boh'), Y), false);
  assert.equal(A.isUnlocked(1, '2026-12-05', Y), false);
  assert.equal(A.isUnlocked(1, null, Y), false);
  assert.equal(A.isUnlocked(1, Date.now(), Y), false);
});
test('giorni non validi vengono rifiutati', () => {
  for (const bad of [0, 25, -1, 3.5, '3', NaN, null, undefined, Infinity]) {
    assert.throws(() => A.isUnlocked(bad, d(12, 24), Y), RangeError, `giorno ${String(bad)}`);
    assert.throws(() => A.unlockDate(bad, Y), RangeError);
    assert.throws(() => A.daysUntil(bad, d(12, 1), Y), RangeError);
  }
});
test('isValidDay: limiti', () => {
  assert.equal(A.isValidDay(1), true);
  assert.equal(A.isValidDay(24), true);
  assert.equal(A.isValidDay(0), false);
  assert.equal(A.isValidDay(25), false);
  assert.equal(A.TOTAL_DAYS, 24);
});
test('unlockDate è la mezzanotte locale del giorno', () => {
  const u = A.unlockDate(7, Y);
  assert.deepEqual([u.getFullYear(), u.getMonth(), u.getDate(), u.getHours(), u.getMinutes(), u.getSeconds(), u.getMilliseconds()], [Y, 11, 7, 0, 0, 0, 0]);
});

// ---------- Conto alla rovescia ----------
test('daysUntil', () => {
  assert.equal(A.daysUntil(3, d(12, 1, 23, 30), Y), 2);
  assert.equal(A.daysUntil(3, d(12, 2, 23, 59), Y), 1);
  assert.equal(A.daysUntil(3, d(12, 3), Y), 0);
  assert.equal(A.daysUntil(3, d(12, 20), Y), 0);
  assert.equal(A.daysUntil(1, d(11, 10, 12), Y), 21);
  assert.equal(A.daysUntil(1, new Date('x'), Y), null);
});
test('lockedLabel', () => {
  assert.equal(A.lockedLabel(3, d(12, 2), Y), 'Domani!');
  assert.equal(A.lockedLabel(5, d(12, 2), Y), 'Tra 3 giorni');
  assert.equal(A.lockedLabel(5, new Date('x'), Y), 'Non ancora');
});

// ---------- Link YouTube ----------
test('ID valido -> link embed youtube-nocookie con autoplay', () => {
  assert.equal(A.songUrl({ title: 'X', youtubeId: 'dQw4w9WgXcQ' }),
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
});
test('senza ID -> ricerca per titolo + artista, codificata', () => {
  assert.equal(A.songUrl({ title: 'Let It Snow!', artist: 'Dean Martin', youtubeId: '' }),
    'https://www.youtube.com/results?search_query=Let%20It%20Snow!%20Dean%20Martin');
  assert.equal(A.songUrl({ title: 'Stille Nacht', artist: '' }),
    'https://www.youtube.com/results?search_query=Stille%20Nacht');
});
test('negativo: ID non valido non finisce in un link embed', () => {
  for (const bad of ['short', 'dQw4w9WgXcQX', 'dQw4w9WgXc!', '<script>xx>', ' dQw4w9WgXc', 12345678901]) {
    const url = A.songUrl({ title: 'T', youtubeId: bad });
    assert.ok(!url.includes('embed'), `non deve essere embed: ${bad}`);
  }
});
test('negativo: niente titolo né ID -> nessun link', () => {
  assert.equal(A.songUrl(null), null);
  assert.equal(A.songUrl(undefined), null);
  assert.equal(A.songUrl({}), null);
  assert.equal(A.songUrl({ title: '   ', artist: '' }), null);
});
test('isValidVideoId', () => {
  assert.equal(A.isValidVideoId('a_b-C123456'), true);
  assert.equal(A.isValidVideoId('a_b-C12345'), false);
  assert.equal(A.isValidVideoId('xa_b-C123456'), false);
  assert.equal(A.isValidVideoId(undefined), false);
});

// ---------- Validazione lista canzoni ----------
const mk = (n, extra = {}) => Array.from({ length: n }, (_, i) => ({ title: 'Song ' + (i + 1), youtubeId: '', ...extra }));
test('lista valida senza errori', () => {
  assert.deepEqual(A.validateSongs(mk(24)), []);
});
test('negativo: numero sbagliato di canzoni', () => {
  assert.deepEqual(A.validateSongs(mk(23)), ['Servono 24 canzoni, trovate 23']);
  assert.deepEqual(A.validateSongs(mk(25)), ['Servono 24 canzoni, trovate 25']);
});
test('negativo: non è un array', () => {
  assert.deepEqual(A.validateSongs({}), ['La lista canzoni deve essere un array']);
  assert.deepEqual(A.validateSongs(null), ['La lista canzoni deve essere un array']);
});
test('negativo: titolo mancante / vuoto / voce nulla', () => {
  const s = mk(24); s[2] = { title: '  ' }; s[4] = null; s[6] = { title: 5 };
  assert.deepEqual(A.validateSongs(s), ['Casella 3: titolo mancante', 'Casella 5: titolo mancante', 'Casella 7: titolo mancante']);
});
test('negativo: youtubeId malformato (es. URL intero incollato)', () => {
  const s = mk(24); s[0].youtubeId = 'https://youtu.be/dQw4w9WgXcQ';
  assert.deepEqual(A.validateSongs(s), ['Casella 1: youtubeId non valido "https://youtu.be/dQw4w9WgXcQ"']);
});
test('youtubeId assente (undefined) è ammesso', () => {
  const s = mk(24); delete s[0].youtubeId;
  assert.deepEqual(A.validateSongs(s), []);
});
test('negativo: stesso video in due caselle', () => {
  const s = mk(24); s[1].youtubeId = 'dQw4w9WgXcQ'; s[9].youtubeId = 'dQw4w9WgXcQ'; s[11].youtubeId = 'aaaaaaaaaaa';
  assert.deepEqual(A.validateSongs(s), ['Casella 10: video duplicato della casella 2']);
});

// ---------- Griglia ----------
test('gridOrder contiene ogni giorno 1..24 una sola volta, in ordine sparso', () => {
  const o = A.gridOrder();
  assert.equal(o.length, 24);
  assert.deepEqual([...o].sort((a, b) => a - b), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.notDeepEqual(o, Array.from({ length: 24 }, (_, i) => i + 1));
  assert.deepEqual(o.slice(0, 4), [1, 8, 15, 22]);
});

// ---------- Aggiunti per uccidere i mutanti sopravvissuti ----------
test('negativo: giorno non valido rifiutato anche se la data è non valida', () => {
  assert.throws(() => A.isUnlocked(0, new Date('x'), Y), /Giorno non valido: 0/);
  assert.throws(() => A.daysUntil(25, new Date('x'), Y), /Giorno non valido: 25/);
});
test('artista mancante non produce "undefined" nella ricerca', () => {
  assert.equal(A.songUrl({ title: 'Stille Nacht' }),
    'https://www.youtube.com/results?search_query=Stille%20Nacht');
});
test('nel browser (senza module) espone window.Advent', () => {
  const vm = require('vm');
  const sandbox = { process }; // process: serve allo strumento di mutation testing
  vm.runInNewContext(require('fs').readFileSync(require.resolve('../src/calendar'), 'utf8'), sandbox);
  assert.equal(typeof sandbox.Advent.isUnlocked, 'function');
});
test('dateText: articolo corretto (l\'8, l\'11, il 3)', () => {
  assert.equal(A.dateText(3), 'il 3 dicembre');
  assert.equal(A.dateText(8), 'l\'8 dicembre');
  assert.equal(A.dateText(11), 'l\'11 dicembre');
  assert.equal(A.dateText(1), 'il 1° dicembre');
  assert.throws(() => A.dateText(0), RangeError);
});
