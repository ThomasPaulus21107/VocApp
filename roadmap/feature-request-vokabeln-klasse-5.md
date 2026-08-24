# Feature: Die Vokabeln der 5. Klasse

**Status:** in [Sprint 3](sprint-03.md)
**Wo:** `data/lektion-*.json` — Matildas Arbeit

Bisher stehen neun Demo-Karten in der App. Was fehlt, sind die Vokabeln, die
sie tatsächlich lernen muss. Ohne sie ist die App eine Vorführung und kein
Werkzeug.

## Warum das ein Feature ist und keine Fleißaufgabe

Es ist die Arbeit, von der alles andere abhängt: Notenskala, Übungsauswahl und
Rundenlänge werden erst dann sinnvoll, wenn genug echte Karten da sind. 15
Karten je Runde brauchen einen Vorrat, aus dem sich ziehen lässt.

Außerdem ist es **Matildas Beitrag im engeren Sinn.** Sie ist Co-Autorin, und
die Vokabeln sind der Teil, den nur sie schreiben kann — Thomas weiß nicht,
welche Wörter dran sind.

## Voraussetzungen

- [Eine Datei pro Lektion](feature-request-lektionsdateien.md) — das Format muss
  stehen, bevor sie anfängt. Nachträglich aufteilen hieße: dieselben Karten
  zweimal anfassen.

## Wie es gemacht wird

Eine Datei je Lektion, `data/lektion-01.json` und so weiter. Format wie
bisher, beschrieben in `data/README.md`. Jede Karte braucht `id`, `en`, `de`,
`wortart` und beide `hinweise`.

Der Daten-Test läuft bei jedem Pull Request mit und meldet die betroffene `id`,
wenn etwas fehlt — Tippfehler fallen also auf, bevor sie in der App landen.

## Wann es fertig ist

Wenn eine Runde aus 15 Karten gezogen werden kann, ohne dass sich Karten
wiederholen, und die Wörter aus ihrem echten Unterricht stammen.

Es muss nicht alles auf einmal sein. Eine Lektion ist ein Pull Request — das
ist auch der Weg, auf dem wieder eine Änderung von ihr in `main` landet.
