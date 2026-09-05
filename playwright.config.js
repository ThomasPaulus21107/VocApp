// Die Oberflaechen-Tests. Sie starten einen echten Browser, oeffnen die App
// und bedienen sie -- anders als die Tests in tests/, die reine Funktionen
// pruefen und kein Fenster brauchen.
//
// WARUM ein echter Browser und kein nachgebautes DOM: der Fehler, der diese
// Tests ausgeloest hat, war ein Layout-Fehler (PR #8, `display: flex` hat das
// hidden-Attribut ueberstimmt). Ein nachgebautes DOM haette ihn nicht
// gefunden. Die Abwaegung steht in roadmap/implemented/feature-ui-tests-*.md.
import { defineConfig, devices } from '@playwright/test';

// Der Dev-Server haengt die Seiten unter den Repo-Namen -- so wie GitHub
// Pages es auch tut. Das steht als `base` in vite.config.js.
const URSPRUNG = 'http://localhost:5173';
const ADRESSE = `${URSPRUNG}/VocApp/`;

// Eine erfundene Sitzung, damit die Tests ueberhaupt bis zur ersten Karte
// kommen: seit es Konten gibt, schickt jede Seite ohne Sitzung zum Anmelden.
//
// Sie ist NICHT echt und muss es nicht sein. Der Client liest sie aus dem
// Speicher, sieht ein Ablaufdatum in weiter Ferne und fragt deshalb bei
// niemandem nach -- geprueft wird ein Token erst, wenn eine Anfrage damit
// rausgeht, und die scheitert hier ohnehin (siehe .env.test).
//
// Der Schluesselname kommt aus supabase-js: "sb-<erster Teil des Hostnamens>
// -auth-token". Mit der Adresse aus .env.test ist das "sb-localhost-...".
const SITZUNG = {
  access_token: 'attrappe',
  refresh_token: 'attrappe',
  expires_at: 4102444800, // 01.01.2100 -- also nie waehrend eines Testlaufs
  token_type: 'bearer',
  user: { id: '00000000-0000-4000-8000-000000000000' },
};

export default defineConfig({
  testDir: './tests/oberflaeche',

  // Ein Test, der nur manchmal gruen ist, ist kein Test. In der CI darf er
  // es zweimal versuchen -- dort ist die Maschine langsamer und geteilt.
  retries: process.env.CI ? 2 : 0,

  // `test.only` ist beim Suchen praktisch und in der CI ein stiller
  // Ausfall: alle anderen Tests waeren uebersprungen und der Lauf gruen.
  forbidOnly: Boolean(process.env.CI),

  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: ADRESSE,

    // Jeder Test faengt angemeldet an. Wer den anderen Fall braucht -- das
    // Anmeldeformular selbst --, setzt sich mit test.use() einen leeren
    // Speicher davor.
    storageState: {
      cookies: [],
      origins: [{
        origin: URSPRUNG,
        localStorage: [
          { name: 'sb-localhost-auth-token', value: JSON.stringify(SITZUNG) },
        ],
      }],
    },

    // Ein Mitschnitt entsteht nur, wenn ein Test beim zweiten Anlauf wieder
    // rot ist. Dann zeigt `npx playwright show-report` jeden Klick.
    trace: 'on-first-retry',
  },

  // Nur ein Geraet, und zwar Matildas: geuebt wird auf dem iPhone, also wird
  // auch dort getestet. WebKit ist die Maschine hinter Safari -- ein Test in
  // Chrome wuerde ueber genau den Browser nichts sagen, der benutzt wird.
  projects: [
    {
      name: 'iphone',
      use: { ...devices['iPhone 14'] },
    },
  ],

  // Playwright startet den Dev-Server selbst und wartet, bis er antwortet.
  // Laeuft schon einer (npm run dev im anderen Fenster), wird der benutzt.
  webServer: {
    // "--mode test" zieht .env.test heran und damit eine erfundene
    // Supabase-Adresse. Ohne das liefen die Tests lokal gegen "VocApp TEST"
    // und in der CI gegen gar nichts -- also zweimal verschieden.
    command: 'npm run dev -- --mode test',
    url: ADRESSE,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
