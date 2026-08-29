# Feature: Wie die Oberfläche getestet wird

**Status:** umgesetzt am 29.08.2026 um 19:43, [PR #37](https://github.com/ThomasPaulus21107/VocApp/pull/37)
**Wo im Code:** `tests/oberflaeche/`, `playwright.config.js`, `package.json`, `vite.config.js`, `.github/workflows/tests.yml`

Kein Feature für die App, sondern eine Entscheidung über eine neue
Abhängigkeit. Sie ist denselben Weg gegangen wie alles andere — und deshalb
steht hier auch, was **nicht** gewählt wurde.

**Entschieden ist: Playwright.**

## Der Anlass

Am 20.08.2026 ist ein Fehler durchgerutscht, den kein Test finden konnte
([PR #8](https://github.com/ThomasPaulus21107/VocApp/pull/8)):
`display: flex` hat das `hidden`-Attribut überstimmt, die Formenzeile blieb
sichtbar stehen — mitsamt der Lösung, nach der gerade gefragt war. Im Markup
stand alles richtig. Reine Funktionstests sehen so etwas nie: sie kennen kein
Layout.

## Was zur Wahl stand

| | jsdom | Playwright |
|---|---|---|
| Was es ist | ein nachgebautes DOM in Node | ein echter Browser |
| Findet den Sprint-1-Fehler | **nein** — kennt kein CSS-Layout | ja |
| Laufzeit | Millisekunden | Sekunden, plus Installation in der CI |
| Neue Abhängigkeit | eine kleine | eine große |

Das war die unangenehme Pointe: **die billige Variante hätte genau den Fehler
nicht gefunden, der der Anlass war.** Ein nachgebautes DOM sagt außerdem über
eine offene iOS-Tastatur nichts — und geübt wird auf dem iPhone.

Die dritte Möglichkeit war, nichts einzubauen und weiter am Handy nachzusehen.
Sie ist verworfen worden, nicht vergessen: von Hand nachsehen kann alles, was
Playwright kann, aber **nur eines von beidem passiert zuverlässig vor jedem
Merge.** Und spätestens bei einem Dutzend Kinder sagt niemand mehr beim
Abendessen, dass etwas kaputt ist — sie hören einfach auf.

## Die Gegenprobe

Ein Test, der nicht rot werden kann, ist kein Test. Also die Probe aufs
Exempel: die Regel `[hidden] { display: none !important }` einmal aus
`styles.css` herausgenommen und beide Suiten laufen lassen.

- **169 Vitest-Tests: alle grün.** Genau wie damals.
- **10 der neuen Oberflächen-Tests: rot.**

Der Fehler von damals wird also wirklich gefangen, und nicht nur behauptet.

## Was gebaut ist

43 Tests in vier Dateien unter `tests/oberflaeche/`, dazu `hilfen.js` mit dem
Wissen, wie man die App bedient — in den Tests selbst steht nur noch, was
dabei herauskommen soll.

| Datei | Was sie prüft |
|---|---|
| `sichtbarkeit.test.js` | der Fehlertyp von oben: alle Elemente mit `hidden` auf jeder Seite, **gemessen** statt am Attribut abgelesen |
| `runde.test.js` | eine Runde von der Wahl bis zur Note — beide Modi, zweite Chance, Tipp, Lernpotential, Ergebnisliste |
| `seiten.test.js` | das Seitenmenü und die beiden Statistikseiten, die bisher kein Test je geöffnet hat — samt der anklickbaren Balken |
| `telefon.test.js` | was nur auf einem Telefon schiefgeht: seitlicher Überstand, Platz über der Tastatur, Schriftgröße im Eingabefeld |

**Getestet wird auf 390 px in WebKit** — der Maschine hinter Safari und dem
Gerät, auf dem tatsächlich geübt wird. Ein grüner Lauf in Chrome hätte über
genau den Browser nichts gesagt. Nur ein Gerät, kein Fächer aus Browsern: das
Projekt soll klein bleiben.

**Der Test muss die richtige Antwort kennen**, um eine Runde durchzuspielen.
Auf dem Bildschirm steht nur das deutsche Verb und der Name der Form — also
schlägt `hilfen.js` in `data/unregelmaessige-verben.json` nach, so wie Matilda
es auch täte. Damit ist keine Zeile Abfragelogik im Test nachgebaut.

## Wie es läuft

```bash
npm test                    # Vitest, Sekunden -- unverändert
npm run test:oberflaeche    # Playwright, im echten Browser
npx playwright install webkit   # einmalig
```

`npm test` bleibt schnell und bleibt der Befehl für den Alltag. Die
Oberflächen-Tests sind ein **eigener Job** in `.github/workflows/tests.yml`,
damit die schnellen Tests nicht auf den Browser-Download warten. Vitest nimmt
`tests/oberflaeche/` in `vite.config.js` ausdrücklich aus — sonst würde es
die Dateien einsammeln und daran scheitern.

## Was noch von Hand kommt

**Der Job `oberflaeche` gehört als required check ins Ruleset von `main`.**
Solange das fehlt, läuft er zwar, blockiert aber nichts — und wäre damit genau
das, was er ersetzen soll: ein Blick, den man auch weglassen kann. Dasselbe
galt schon für `testen`, siehe
[Rote Tests blockieren den Merge](feature-tests-in-ci-2026-08-25-2243.md).

## Nicht verwechseln mit

[Rote Tests blockieren den Merge](feature-tests-in-ci-2026-08-25-2243.md) —
dort ging es darum, die vorhandenen Tests verbindlich zu machen. Das war
unabhängig davon und brauchte keine neue Abhängigkeit.

## Später

- **Kein Screenshot-Vergleich.** Er würde bei jeder Farbe, die Matilda ändert,
  rot — und ihre Farben sind Absicht und kein Fehler. Was zählt, ist geprüft:
  dass nichts überläuft, nichts sichtbar bleibt, was weg sein soll, und dass
  über der Tastatur genug Platz ist.
- **Die drei Eingabefelder** aus [Alle drei Zeiten auf einer Karte](../feature-request-drei-zeiten.md)
  sind die nächste Änderung an genau der Formenzeile, die schon einmal am
  Layout gescheitert ist. Sie kommt jetzt nicht mehr ungeprüft durch.
