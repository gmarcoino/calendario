// Assembla un unico file HTML autonomo dopo aver validato le canzoni.
//   node build.js            -> dist/index.html  (versione vera)
//   node build.js --test 1   -> dist/test.html   (casella 1 aperta subito)
const fs = require('fs');
const path = require('path');
const Advent = require('./src/calendar');
const SONGS = require('./src/songs');

const YEAR = 2026;

function build({ testOpen = [] } = {}) {
  const errors = Advent.validateSongs(SONGS);
  if (errors.length) throw new Error('Lista canzoni non valida:\n- ' + errors.join('\n- '));
  if (!Array.isArray(testOpen) || !testOpen.every(Advent.isValidDay)) {
    throw new RangeError('Caselle di test non valide: ' + JSON.stringify(testOpen));
  }
  const read = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
  const html = read('template.html')
    .replace('/*CALENDAR_JS*/', () => read('calendar.js'))
    .replace('/*SONGS_JS*/', () => read('songs.js'))
    .replace('/*YEAR*/2026', String(YEAR))
    .replace('/*TEST_OPEN*/[]', JSON.stringify(testOpen));
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  const out = path.join(__dirname, 'dist', testOpen.length ? 'test.html' : 'index.html');
  fs.writeFileSync(out, html);
  return out;
}

if (require.main === module) {
  const i = process.argv.indexOf('--test');
  const testOpen = i === -1 ? [] : process.argv.slice(i + 1).map(Number);
  console.log('OK ->', build({ testOpen }));
}
module.exports = { build, YEAR };
