import { defineConfig } from 'vite';

export default defineConfig({
  // WICHTIG: hier muss der Name eures GitHub-Repos stehen, mit Schrägstrichen.
  // Beispiel: Repo "vokabelkiste"  ->  base: '/vokabelkiste/'
  // Ohne das findet GitHub Pages die Dateien nicht.
  base: '/HIER-REPO-NAME-EINTRAGEN/',
});
