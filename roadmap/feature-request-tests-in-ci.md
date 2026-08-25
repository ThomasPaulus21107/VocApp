# Feature: Rote Tests blockieren den Merge

**Status:** halb — die Workflow-Datei steht, das Häkchen auf GitHub fehlt
**Wo im Code:** `.github/workflows/`

Ein Pull Request lässt sich nicht mehr mergen, wenn `npm test` fehlschlägt.

## Warum es bisher nicht so ist

Der Deploy-Workflow vom 20.08.2026 baut und veröffentlicht, prüft aber
bewusst keine Tests — das war zurückgestellt. Bis heute gilt die Absprache „vor dem
Pull Request einmal `npm test`". Absprachen dieser Art halten genau so lange,
bis es eilig ist.

## Was zu tun ist

- [x] Ein Workflow, der bei jedem Pull Request `npm ci` und `npm test`
      ausführt — `.github/workflows/tests.yml`, seit dem 25.08.2026
- [ ] In den Branch-Protection-Regeln von `main` als **required check**
      eintragen

**Erst der zweite Punkt macht das Feature fertig.** Solange er fehlt, läuft
der Test zwar und ist am Pull Request zu sehen, blockiert aber nichts — und
genau das Blockieren ist der Zweck. Die Datei heißt deshalb weiter
`feature-request-*`.

Der Weg auf GitHub: **Settings → Branches → Branch protection rule für `main`
→ „Require status checks to pass before merging" → als Check `testen`
auswählen.** Der Check taucht in der Liste erst auf, nachdem er einmal
gelaufen ist — also nach dem ersten Pull Request mit dieser Datei.

Das ist kein Code, den Matilda liest, und keine Zeile in der App. Es ist eine
Workflow-Datei und ein Häkchen in den Repo-Einstellungen.

## Warum es jetzt mehr wert ist als früher

Inzwischen hängen Note, Modus-Regeln und die Lernpotential-Auswahl an der
Domänenschicht — Dinge, bei denen ein stiller Fehler direkt in Matildas
Übungsrunde landet und nicht auffällt. Und sobald Matilda selbst Karten
anlegt, ist der Daten-Test das Netz darunter. Ab hier ist der Test die
Absicherung, nicht mehr nur eine Gewohnheit.

## Nicht dasselbe wie UI-Tests

Hier geht es nur darum, die **vorhandenen** Tests verbindlich zu machen. Ob
zusätzlich im Browser getestet wird, ist eine eigene Entscheidung mit einer
neuen Abhängigkeit — siehe [feature-request-ui-tests.md](feature-request-ui-tests.md).
