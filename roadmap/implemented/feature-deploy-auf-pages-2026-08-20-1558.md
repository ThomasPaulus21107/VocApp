# Feature: Die App liegt unter einer öffentlichen URL

**Status:** umgesetzt am 20.08.2026 um 15:58, [PR #5](https://github.com/ThomasPaulus21107/VocApp/pull/5)
**Wo im Code:** `.github/workflows/deploy.yml`, `vite.config.js`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-01.md`.

Matilda kann den Link verschicken. Das war das eigentliche Ziel der ersten
Runde — eine App, die nur auf einem Rechner läuft, ist für sie keine App.

## Wie es gebaut ist

- `.github/workflows/deploy.yml` baut bei jedem Push auf `main` und
  veröffentlicht auf Pages
- Pages steht in den Repo-Einstellungen auf Quelle **GitHub Actions**, nicht
  auf „Deploy from a branch"
- `vite.config.js` enthält `base: '/VocApp/'` — der Pfad muss zum Repo-Namen
  passen, sonst lädt die veröffentlichte Seite leer
- `dist/` gehört deshalb nie ins Repo
- Branch Protection auf `main`: jede Änderung läuft über einen Pull Request

## Warum es vorgezogen wurde

Es stand ursprünglich auf der Liste „später". Der Handbetrieb über einen
`gh-pages`-Branch wären fünf Befehle bei jedem Veröffentlichen — und er hat
einen Fehlermodus, den der Workflow nicht kennt: `npm run build` vergessen und
einen alten Stand hochladen, ohne dass es auffällt.

**Nur Build und Deploy sind damit erledigt.** Tests als Merge-Bedingung sind
ein eigenes Vorhaben, siehe
[Rote Tests blockieren den Merge](feature-tests-in-ci-2026-08-25-2243.md).
