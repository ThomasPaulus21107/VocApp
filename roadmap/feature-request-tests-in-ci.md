# Feature: Rote Tests blockieren den Merge

**Status:** in [Sprint 3](sprint-03.md)
**Wo im Code:** `.github/workflows/`

Ein Pull Request lässt sich nicht mehr mergen, wenn `npm test` fehlschlägt.

## Warum es bisher nicht so ist

Der Deploy-Workflow aus Sprint 1 baut und veröffentlicht, prüft aber bewusst
keine Tests — das war zurückgestellt. Bis heute gilt die Absprache „vor dem
Pull Request einmal `npm test`". Absprachen dieser Art halten genau so lange,
bis es eilig ist.

## Was zu tun ist

- Ein Workflow, der bei jedem Pull Request `npm ci` und `npm test` ausführt
- In den Branch-Protection-Regeln von `main` als **required check** eintragen

Das ist kein Code, den Matilda liest, und keine Zeile in der App. Es ist eine
Workflow-Datei und ein Häkchen in den Repo-Einstellungen.

## Warum es in diesen Sprint gehört

In Sprint 3 kommen der Datentest über mehrere Lektionsdateien und die
Notenumrechnung dazu — zwei Dinge, bei denen ein stiller Fehler direkt in
Matildas Übungsrunde landet. Ab hier ist der Test die Absicherung, nicht mehr
nur eine Gewohnheit.

## Nicht dasselbe wie UI-Tests

Hier geht es nur darum, die **vorhandenen** Tests verbindlich zu machen. Ob
zusätzlich im Browser getestet wird, ist eine eigene Entscheidung mit einer
neuen Abhängigkeit — siehe [feature-request-ui-tests.md](feature-request-ui-tests.md).
