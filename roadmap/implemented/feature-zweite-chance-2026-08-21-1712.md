# Feature: Eine zweite Chance bei Fehlern

**Status:** umgesetzt am 21.08.2026 um 17:12, [PR #10](https://github.com/ThomasPaulus21107/VocApp/pull/10)
**Wo im Code:** `src/app.js`, `src/ui/ui.js`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-02.md`.

Beim ersten Fehlversuch gibt es einen Hinweis und einen weiteren Versuch, erst
danach die Lösung. Wer sich vertippt oder zu schnell abschickt, verliert nicht
sofort die Karte.

## Wie es funktioniert

`versuch` in `app.js` zählt: 0 ist der erste Anlauf, 1 die Korrekturchance, 2
heißt erledigt. Bei 1 bleibt die Karte stehen, das Eingabefeld wird geleert,
die Lösung kommt noch nicht.

## Was später daraus geworden ist

Drei Dinge hängen inzwischen an dieser einen Zahl:

- **Die Note.** Eine im zweiten Versuch richtige Karte bringt einen halben
  Punkt statt einem ganzen — siehe
  [Das Ergebnis als Schulnote](feature-schulnoten-2026-08-22-1115.md).
- **Der Modus.** In der Arbeit gibt es die Chance nicht. Das steht als
  `zweiterVersuch` in der Regeltabelle in `domain/modus.js`, siehe
  [Übungsblatt oder Arbeit](feature-arbeit-oder-uebungsblatt-2026-08-24-2022.md).
- **Das Lernpotential.** Eine Karte, die erst im zweiten Versuch saß, kommt am
  Ende noch einmal — siehe
  [Die Lernpotential-Runde](feature-lernpotential-2026-08-24-2211.md).
