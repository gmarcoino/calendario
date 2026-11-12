# Calendario dell'Avvento

24 caselle, una canzone al giorno. Ogni casella si apre a mezzanotte del suo giorno di dicembre.

- `src/songs.js` – lista canzoni (titolo, artista, ID YouTube)
- `src/calendar.js` – logica (sblocco per data, link, validazione)
- `src/template.html` – pagina
- `test/` – test (unità, negativi, pagina in jsdom); `npm run mutate` – mutation testing (Stryker, soglia 100%)

Ad ogni push su `main` GitHub Actions esegue test e mutation testing e pubblica su Pages solo se passano.
Versione di test: `TEST_OPEN` in `.github/workflows/pages.yml` (vuoto = calendario vero).
Anteprima di tutte le caselle: aggiungere `#anteprima` al link.
