import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // WICHTIG: hier muss der Name eures GitHub-Repos stehen, mit Schrägstrichen.
  // Beispiel: Repo "vokabelkiste"  ->  base: '/vokabelkiste/'
  // Ohne das findet GitHub Pages die Dateien nicht.
  base: '/VocApp/',

  build: {
    rollupOptions: {
      // Zwei Seiten, zwei Einstiegspunkte. Mehr braucht es nicht -- kein
      // Router, keine neue Abhängigkeit. Wer eine dritte Seite baut, trägt
      // sie hier ein.
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        fortschritt: resolve(import.meta.dirname, 'fortschritt.html'),
        fleiss: resolve(import.meta.dirname, 'fleiss.html'),
      },
    },
  },

  // Vitest sammelt sonst jede *.test.js ein -- auch die in
  // tests/oberflaeche/. Die brauchen aber einen echten Browser und laufen
  // mit Playwright: "npm run test:oberflaeche".
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/oberflaeche/**'],
  },
});
