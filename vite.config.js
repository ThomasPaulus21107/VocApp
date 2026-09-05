import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Zwei Ziele, ein Bundle: Vercel liefert an der Wurzel aus, GitHub Pages
  // unter dem Repo-Namen. Die Zeile kann nicht beides -- aber sie muss auch
  // nicht, solange der Unterschied im Build sichtbar ist, und das ist er:
  // Vercel setzt VERCEL=1. Das Haekchen dafuer ("System Environment
  // Variables") ist im Vercel-Projekt gesetzt.
  //
  // Ohne VERCEL kommt weiterhin '/VocApp/' heraus -- das gilt fuer den
  // Dev-Server, fuer die Oberflaechen-Tests und fuer den Pages-Workflow.
  // Wer hier etwas aendert, macht damit eine der beiden Adressen kaputt.
  base: process.env.VERCEL ? '/' : '/VocApp/',

  build: {
    rollupOptions: {
      // Eine Seite, ein Einstiegspunkt. Mehr braucht es nicht -- kein
      // Router, keine neue Abhängigkeit. Wer eine weitere Seite baut, trägt
      // sie hier ein; wer das vergisst, merkt es erst am Deploy, weil der
      // Dev-Server sie trotzdem ausliefert.
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        fortschritt: resolve(import.meta.dirname, 'fortschritt.html'),
        fleiss: resolve(import.meta.dirname, 'fleiss.html'),
        anmelden: resolve(import.meta.dirname, 'anmelden.html'),
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
