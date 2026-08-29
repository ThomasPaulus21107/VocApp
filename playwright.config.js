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
const ADRESSE = 'http://localhost:5173/VocApp/';

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
    command: 'npm run dev',
    url: ADRESSE,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
