# Feature: Rote Tests blockieren den Merge

**Status:** umgesetzt am 25.08.2026 um 22:43
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
- [x] In den Schutzregeln von `main` als **required check** eintragen —
      am 25.08.2026 gesetzt

## Wie es auf GitHub eingestellt ist

Der Schutz von `main` läuft nicht über das klassische „Branch protection",
sondern über ein **Ruleset** namens `Protection Ruleset`. Es gilt für den
Default-Branch, ist aktiv, und seine Bypass-Liste ist leer — die Regeln gelten
also auch für den Repo-Besitzer.

| Regel | Was sie tut |
|---|---|
| `deletion` | `main` lässt sich nicht löschen |
| `non_fast_forward` | kein `--force` auf `main` |
| `pull_request` | Änderungen nur über einen Pull Request, 0 Freigaben nötig |
| `required_status_checks` | `testen` muss grün sein |

**Der Check heißt `testen`, nicht „Tests".** In der Liste steht der Name des
*Jobs*, nicht der des Workflows. Und er taucht dort erst auf, nachdem er
einmal gelaufen ist — beim ersten Mal also: Pull Request aufmachen, Lauf
abwarten, dann die Regel setzen.

**„Require branches to be up to date before merging" ist bewusst aus**
(`strict: false`). An bedeutet: sobald sich `main` bewegt, muss der Branch
erst aktualisiert werden, bevor er gemergt werden darf. Bei zwei Leuten an
einem Rechner kostet das mehr, als es bringt.

Der Weg dorthin, falls es je neu eingerichtet werden muss:
**Settings → Rules → Rulesets → `Protection Ruleset` → Require status checks
to pass → + Add checks → `testen`.**

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
neuen Abhängigkeit — siehe [feature-request-ui-tests.md](../feature-request-ui-tests.md).
