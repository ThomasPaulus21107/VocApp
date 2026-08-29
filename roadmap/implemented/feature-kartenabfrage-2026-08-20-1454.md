# Feature: Die Kartenabfrage

**Status:** umgesetzt am 20.08.2026 um 14:54, [PR #3](https://github.com/ThomasPaulus21107/VocApp/pull/3)
**Wo im Code:** `src/domain/pruefung.js`, `src/ui/ui.js`, `src/app.js`, `data/`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-01.md`, damit die Arbeit
nicht mit der Sprint-Datei verschwindet.

Eine Karte erscheint, man tippt die Antwort, die App sagt richtig oder falsch.
Das ist der Kern, auf dem alles Weitere steht.

## Was entstanden ist

- **Der Schichtschnitt.** `domain/` kennt kein DOM und keinen Speicher,
  `ui/` keine Lernlogik, `app.js` steckt beides zusammen und hält als
  einziger Ort veränderlichen Zustand. Diese Aufteilung hat seitdem jede
  Änderung überlebt und steht ausführlich in `AGENTS.md`.
- **Das Datenformat.** Eine Karte kennt beide Sprachen, die Richtung
  entscheidet erst die App über `stelleFrage(karte, richtung)`. Synonyme
  stehen in einer Liste, alle gelten als richtig, das erste wird gezeigt.
- **Vite als Build-Werkzeug**, Vanilla JS, kein Framework.
- **Zwei Sorten Tests:** die Domänenlogik und die Vokabeldateien selbst. Der
  Daten-Test ist bis heute der praktisch wichtigste — er fängt Tippfehler in
  `data/` ab, bevor sie in der Übungsrunde auffallen.

## Was daran wichtig war

Der Zufall wird hereingereicht (`mische(karten, zufall = Math.random)`), nicht
in der Domäne gezogen. Dasselbe gilt später für das Datum. Deshalb laufen die
Tests in Millisekunden ohne Browser, und deshalb konnte alles Spätere — Noten,
Modi, Lernpotential — als reine Funktion dazukommen.
