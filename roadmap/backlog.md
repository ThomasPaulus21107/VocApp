# Backlog

Alles, was wir bauen wollen, aber noch nicht durchdacht haben. Einträge hier
sind **kurz** — ein Satz, was es ist, und was fehlt.

Zwei Zeilen können darunter stehen:

- `braucht:` — was es voraussetzt, und wo das liegt
- `offen:` — was geklärt sein muss, bevor es refined ist

Ein Eintrag verlässt diese Datei, sobald jemand ihn durchdenkt und eine
`feature-request-*.md` dafür schreibt. Das ist das Refinement: **entweder es
gibt die Datei, oder das Feature ist noch nicht so weit.** Eine Liste
„bereit" gibt es nicht — die Request-Dateien sind sie.

Umgekehrt geht es auch: was refined war und wieder ruht, kommt hierher zurück.
Die durchdachte Fassung ist dann nicht weg, sie liegt in der Git-Historie.

---

## Der Vokabel-Strang

Ruht seit dem 25.08.2026. Der Fokus bleibt vorerst auf den unregelmäßigen
Verben — solange das gilt, hat keiner der drei Punkte einen Nutzen. Alle drei
waren refined; die ausführlichen Fassungen liegen in der Historie unter
`roadmap/feature-request-lektionsdateien.md`, `-vokabeln-klasse-5.md` und
`-uebungsauswahl.md`.

- **Eine Datei pro Lektion.** `data/lektion-01.json` statt einer wachsenden
  `vokabeln.json`, eingesammelt per `import.meta.glob('../data/lektion-*.json')`.
  `braucht:` nichts — es ist der Unterbau für die beiden nächsten
  `offen:` nur die Fokus-Entscheidung. Wenn sie fällt, ist es sofort baubar.
  **Achtung:** `tests/daten.test.js` führt die Dateiliste von Hand. Wer die
  App per Glob einsammeln lässt und den Test nicht, hat Lektionen, die niemand
  prüft.

- **Die Vokabeln der 5. Klasse.** Matildas eigentliche Arbeit — ohne sie ist
  die App eine Vorführung und kein Werkzeug. Heute stehen neun Demo-Karten da.
  `braucht:` eine Datei pro Lektion — das Format muss stehen, bevor sie
  anfängt. Nachträglich aufteilen hieße: dieselben Karten zweimal anfassen.

- **Auswählen, was geübt wird.** Vokabeln, unregelmäßige Verben oder beides.
  Die Domäne kann das schon (`stelleFrage`, `hatFormen`, `mische`), es ist
  überwiegend ein Wiederanschließen. In der UI ist es keins: `el.beiwort`
  trägt seit dem Fokus-Umbau den Formnamen, die Fallunterscheidung auf
  `wortart · bedeutung` muss zurück.
  `braucht:` echte Vokabeln, sonst wählt man zwischen 53 Verben und 9
  Demo-Karten

- **`wortart` und `bedeutung` wieder anzeigen.** Das Datenformat sieht beide
  unter der Frage vor, die App zeigt sie seit dem Fokus-Umbau nicht mehr.
  `braucht:` dieselbe Fallunterscheidung wie die Übungsauswahl — gehört
  zusammen gebaut

## Lernen und Wiederholen

- **Leitner-Fächer mit Wiedervorlage.** „Diese Karte erst in drei Tagen wieder."
  `braucht:` einen gespeicherten Lernstand **pro Karte** — im Backlog
  `braucht:` die [Lernpotential-Runde](feature-implemented-lernpotential-2026-08-24-2211.md)
  als Unterbau — **steht**, die Auswahl-Logik ist da und muss nur um das
  Datum erweitert werden
  `offen:` wie viele Fächer, welche Abstände, und was beim ersten Start passiert

- **Lernstand pro Karte speichern.** Der Unterbau für Leitner.
  `braucht:` [`storage.js`](feature-request-einstellungen-speichern.md) — refined,
  aber vorerst nur für Einstellungen
  `offen:` das Format. Sobald es auf der Platte liegt, ist jede Änderung eine
  Migration — deshalb steht es hier und nicht weiter oben.

## Punkte

- **Punkte und Streak speichern.** Der Punktestand überlebt das Schließen der
  Seite.
  `braucht:` [`storage.js`](feature-request-einstellungen-speichern.md)
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

## Rund ums Projekt

- **Matildas eigener GitHub-Account.** Ab ihrem 13. Geburtstag — vorher liegt
  dort die Altersgrenze. Bis dahin arbeitet sie an Thomas' Rechner mit, er
  übernimmt den GitHub-Teil.
