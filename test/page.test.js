// Test d'integrazione: carica la pagina costruita in jsdom con una data finta.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const { build, YEAR } = require('../build');
const SONGS = require('../src/songs');
const A = require('../src/calendar');

const html = fs.readFileSync(build(), 'utf8');

function load(now, hash = '', source = html) {
  const RealDate = Date;
  const fixed = now.getTime();
  const dom = new JSDOM(source, {
    url: 'https://example.test/' + hash,
    runScripts: 'dangerously',
    beforeParse(win) {
      class FakeDate extends RealDate {
        constructor(...a) { super(...(a.length ? a : [fixed])); }
        static now() { return fixed; }
      }
      win.Date = FakeDate;
      win.setInterval = () => 0;
    }
  });
  const doors = [...dom.window.document.querySelectorAll('.door')];
  const byDay = (n) => doors.find((el) => el.firstChild.textContent === String(n));
  return { dom, doors, byDay };
}

test('build: file unico senza segnaposto rimasti', () => {
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(!html.includes('/*CALENDAR_JS*/') && !html.includes('/*SONGS_JS*/') && !html.includes('/*YEAR*/'));
  assert.ok(html.includes('var YEAR = ' + YEAR));
});

test('3 dicembre: caselle 1-3 sono link, 4-24 chiuse e senza link', () => {
  const { doors, byDay } = load(new Date(YEAR, 11, 3, 9));
  assert.equal(doors.length, 24);
  for (let d = 1; d <= 24; d++) {
    const el = byDay(d);
    if (d <= 3) {
      assert.equal(el.tagName, 'A', `giorno ${d}`);
      assert.equal(el.getAttribute('href'), A.songUrl(SONGS[d - 1]));
    } else {
      assert.equal(el.tagName, 'DIV', `giorno ${d}`);
      assert.ok(el.classList.contains('locked'));
      assert.equal(el.querySelector('a'), null);
    }
  }
  assert.ok(byDay(3).classList.contains('today'));
  assert.ok(!byDay(2).classList.contains('today'));
  assert.equal(byDay(4).querySelector('.hint').textContent, 'Domani!');
});

test('negativo: 2 dicembre 23:59 la casella 3 è ancora chiusa', () => {
  const { byDay } = load(new Date(YEAR, 11, 2, 23, 59, 59));
  assert.equal(byDay(3).tagName, 'DIV');
  assert.equal(byDay(2).tagName, 'A');
});

test('negativo: a novembre nessun link nella pagina', () => {
  const { dom } = load(new Date(YEAR, 10, 10));
  assert.equal(dom.window.document.querySelectorAll('#grid a').length, 0);
});

test('tocco su casella chiusa mostra il messaggio e non naviga', () => {
  const { dom, byDay } = load(new Date(YEAR, 11, 1));
  byDay(10).click();
  const t = dom.window.document.getElementById('toast');
  assert.ok(t.classList.contains('show'));
  assert.match(t.textContent, /10 dicembre/);
});

test('tocco su casella aperta la segna come ascoltata', () => {
  const { dom, byDay } = load(new Date(YEAR, 11, 5));
  byDay(5).dispatchEvent(new dom.window.MouseEvent('click', { cancelable: true }));
  assert.ok(byDay(5).classList.contains('seen'));
  assert.equal(JSON.parse(dom.window.localStorage.getItem('avvento-' + YEAR))[5], 1);
});

test('#anteprima apre tutte le caselle (per controllare i link)', () => {
  const { dom } = load(new Date(YEAR, 10, 10), '#anteprima');
  assert.equal(dom.window.document.querySelectorAll('#grid a').length, 24);
  assert.equal(dom.window.document.getElementById('badge').hidden, false);
});

test('link aperti in nuova scheda con rel=noopener', () => {
  const { dom } = load(new Date(YEAR, 11, 24));
  for (const a of dom.window.document.querySelectorAll('#grid a')) {
    assert.equal(a.target, '_blank');
    assert.equal(a.rel, 'noopener');
  }
});

test('negativo: il build fallisce con una lista canzoni rotta', () => {
  const path = require.resolve('../src/songs');
  const original = require.cache[path].exports;
  try {
    require.cache[path].exports = original.slice(0, 23);
    delete require.cache[require.resolve('../build')];
    const { build: b } = require('../build');
    assert.throws(() => b(), /Servono 24 canzoni/);
  } finally {
    require.cache[path].exports = original;
    delete require.cache[require.resolve('../build')];
    require('../build').build();
  }
});

test('negativo: senza #anteprima il badge non è visibile', () => {
  const { dom } = load(new Date(YEAR, 11, 5));
  const badge = dom.window.document.getElementById('badge');
  assert.equal(dom.window.getComputedStyle(badge).display, 'none');
});
test('messaggio casella chiusa con articolo corretto', () => {
  const { dom, byDay } = load(new Date(YEAR, 10, 20));
  byDay(8).click();
  assert.equal(dom.window.document.getElementById('toast').textContent, 'Pazienza! La casella 8 si apre l\'8 dicembre 🎄');
});

// ---------- Versione di test ----------
const testHtml = fs.readFileSync(build({ testOpen: [1] }), 'utf8');

test('versione di test: oggi (novembre) si apre solo la casella 1, col player vero', () => {
  const { dom, byDay } = load(new Date(YEAR, 10, 10), '', testHtml);
  const links = [...dom.window.document.querySelectorAll('#grid a')];
  assert.equal(links.length, 1);
  assert.equal(byDay(1).getAttribute('href'), 'https://www.youtube-nocookie.com/embed/' + SONGS[0].youtubeId + '?autoplay=1&rel=0');
  assert.notEqual(dom.window.getComputedStyle(dom.window.document.getElementById('testBadge')).display, 'none');
});
test('negativo: la versione vera non contiene caselle di test né il badge', () => {
  assert.ok(html.includes('var TEST_OPEN = [];'));
  const { dom } = load(new Date(YEAR, 10, 10));
  assert.equal(dom.window.document.querySelectorAll('#grid a').length, 0);
  assert.equal(dom.window.getComputedStyle(dom.window.document.getElementById('testBadge')).display, 'none');
});
test('negativo: caselle di test non valide bloccano il build', () => {
  for (const bad of [[0], [25], ['1'], [1.5], 'tutte']) {
    assert.throws(() => build({ testOpen: bad }), RangeError, JSON.stringify(bad));
  }
});

test('lista definitiva: tutte le 24 caselle aprono un video, nessuna ricerca', () => {
  const { dom } = load(new Date(YEAR, 11, 24));
  const hrefs = [...dom.window.document.querySelectorAll('#grid a')].map((a) => a.getAttribute('href'));
  assert.equal(hrefs.length, 24);
  for (const h of hrefs) assert.match(h, /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}\?autoplay=1&rel=0$/);
  assert.equal(new Set(hrefs).size, 24);
});
