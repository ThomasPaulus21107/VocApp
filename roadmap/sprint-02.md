# Sprint 2: Fokus auf das aktuelle Lernziel

**Abgeschlossen am 2026-08-21.**

Dieser Sprint wurde nicht vorher geplant, sondern **rückwirkend
aufgeschrieben**. Er hält fest, was zwischen dem Abschluss von Sprint 1 und
der neuen Roadmap tatsächlich entstanden ist — damit die Arbeit nicht
zwischen zwei Plänen verschwindet.

Ziel im Nachhinein formuliert: Die App übt genau das, was Matilda gerade in
der Schule braucht — unregelmäßige Verben — und sie sagt nach jeder Antwort
deutlich, woran man ist.

## Was entstanden ist

Alles in [PR #10](https://github.com/ThomasPaulus21107/VocApp/pull/10).

- [X] **Fokus auf die unregelmäßigen Verben.** Nur noch die Verbenliste, nur
      eine Richtung: das deutsche Verb steht da, getippt wird die englische
      Form. Der gemischte Stapel aus beiden Listen ist dabei herausgefallen —
      bewusst, und er kommt in Sprint 3 als Einstellung zurück.
- [X] **Eine Runde hat eine feste Länge.** `zieheRunde` in `pruefung.js`,
      `RUNDENGROESSE` in `app.js`. Nicht mehr alle Karten am Stück.
- [X] **Eine zweite Chance bei Fehlern.** Beim ersten Fehlversuch gibt es
      einen Hinweis und einen weiteren Versuch, erst danach die Lösung.
- [X] **Zwei Easter Eggs im Eingabefeld.** `s` überspringt die Karte,
      „keine ahnung" antwortet mit „DU SCHAFFST DAS" und lässt die Karte
      offen, ohne einen Versuch zu verbrauchen.
- [X] **Töne für die Rückmeldung** (`src/ui/klang.js`). Fünf Melodien —
      richtig, noch ein Versuch, falsch, Zuspruch, leere Eingabe. Im Browser
      gerechnet, keine Sounddateien.
- [X] **Diese Roadmap.** Der Ordner `roadmap/` mit Backlog, Feature-Dateien
      und Sprints, dazu „Out of Scope" in `AGENTS.md`.

## Was dabei offen geblieben ist

Nichts davon war ein Fehler, aber es ist der Anlass für Sprint 3:

- Der **Ton-Schalter** fehlt — es gibt keine Möglichkeit, die Melodien
  abzustellen. Braucht einen Ort für Einstellungen und etwas, das sie
  speichert.
- **`RUNDENGROESSE` steht auf 20**, ohne dass die Zahl je entschieden wurde.
- Die **normalen Vokabeln sind unerreichbar** geworden. Sie liegen in
  `data/vokabeln.json`, aber die App lädt sie nicht mehr.
- `wortart` und `bedeutung` werden **nicht mehr angezeigt**, obwohl
  `AGENTS.md` beschreibt, dass sie unter der Frage stehen.

## Was ungeplant nach Sprint 1 noch dazukam

Der **Formen-Modus für unregelmäßige Verben** (PR #7 und #8) entstand noch
vor dem Abschluss von Sprint 1: 53 Verben in einer eigenen Liste, drei Formen
nebeneinander, eine davon als Lücke. Er ist die Grundlage für alles, was in
diesem Sprint passiert ist.
