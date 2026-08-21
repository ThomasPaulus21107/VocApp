# Backlog

Alles, was wir bauen wollen, aber noch nicht durchdacht haben. Einträge hier
sind **kurz** — ein Satz, was es ist, und was fehlt.

Zwei Zeilen können darunter stehen:

- `braucht:` — was es voraussetzt, und wo das liegt
- `offen:` — was geklärt sein muss, bevor es refined ist

Ein Eintrag verlässt diese Datei, sobald jemand ihn durchdenkt und eine
eigene `feature-*.md` dafür schreibt. Das ist das Refinement: **entweder es
gibt die Datei, oder das Feature ist noch nicht so weit.** Eine Liste
„bereit" gibt es nicht — die Feature-Dateien sind sie.

---

## Lernen und Wiederholen

- **Leitner-Fächer mit Wiedervorlage.** „Diese Karte erst in drei Tagen wieder."
  `braucht:` einen gespeicherten Lernstand **pro Karte** — im Backlog
  `braucht:` die [Lernpotential-Runde](feature-lernpotential.md) als Unterbau
  — refined
  `offen:` wie viele Fächer, welche Abstände, und was beim ersten Start passiert

- **Lernstand pro Karte speichern.** Der Unterbau für Leitner.
  `braucht:` [`storage.js`](feature-einstellungen-speichern.md) — entsteht in
  Sprint 3, aber vorerst nur für Einstellungen
  `offen:` das Format. Sobald es auf der Platte liegt, ist jede Änderung eine
  Migration — deshalb steht es hier und nicht weiter oben.

## Punkte

- **Punkte und Streak speichern.** Der Punktestand überlebt das Schließen der
  Seite.
  `braucht:` [`storage.js`](feature-einstellungen-speichern.md) — **in Sprint 3**
  `offen:` was überhaupt gezählt wird. Noten? Richtige Karten insgesamt?
  Gespielte Runden? Ohne diese Antwort ist das Speicherformat nicht zu bauen.

- **Streak über mehrere Tage.** „Vier Tage hintereinander geübt."
  `braucht:` Punkte und Streak speichern — im Backlog
  `braucht:` das Datum von außen: `berechneStreak(zustand, heute)`, nie
  `new Date()` in der Domäne

## Über ein Gerät hinaus

- **Supabase hinter derselben Naht.** `storage.js` wird ausgetauscht, Domäne
  und UI merken nichts davon.
  `braucht:` einen gespeicherten Lernstand, der sich zu synchronisieren lohnt
  — im Backlog

- **Accounts / User Management.**
  `braucht:` Supabase — im Backlog

- **Gleicher Stand auf Handy und Laptop.** Das ist das eigentliche Motiv für
  Accounts — nicht „mehrere Leute", sondern dieselbe Person auf einem anderen
  Gerät. Auf GitHub Pages gibt es keinen Server: jeder Browser führt seinen
  eigenen Speicher, und mehrere Nutzer gleichzeitig stören sich nie, weil sie
  nichts teilen.
  `braucht:` Accounts — im Backlog

## Kleinigkeiten

- **`to read` ist in allen drei Formen gleich.** Wenn die Karte drankommt, ist
  die Frage geschenkt. Der Unterschied liegt in der Aussprache, und die kann
  eine getippte Antwort nicht prüfen.
  `offen:` Karte rausnehmen, markieren, oder einfach so lassen?
