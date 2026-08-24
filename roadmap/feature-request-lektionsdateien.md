# Feature: Eine Datei pro Lektion

**Status:** in [Sprint 3](sprint-03.md)
**Wo im Code:** `data/`, `src/app.js`, `tests/daten.test.js`

Entschieden am 2026-08-21. Matildas Lektionen bekommen jede eine eigene Datei
(`data/lektion-01.json`, `data/lektion-02.json` …) statt einer immer weiter
wachsenden `vokabeln.json`.

Sie arbeitet dann in kleinen, überschaubaren Dateien, und die
[Optionsseite](feature-request-optionsseite.md) kann später einzelne Lektionen
anbieten. Nachträglich aufteilen hieße: dieselben Karten zweimal anfassen.

Die unregelmäßigen Verben bleiben, wo sie sind — sie sind keine Lektion,
sondern eine eigene Sorte Karte.

## Die Dateien automatisch einsammeln

Sonst muss Matilda für jede neue Lektion auch noch `app.js` anfassen. Bei Vite
geht das an genau einer Stelle:

```js
import.meta.glob('../data/lektion-*.json', { eager: true })
```

**Preis:** das Namensmuster `lektion-*.json` ist ab dann bindend und gehört
nach `data/README.md`. **Gewinn:** kein Verzeichnis der Listen, das jemand
pflegen müsste, und Matilda legt eine Datei an — mehr nicht.

## Der Datentest muss mit

`tests/daten.test.js` hat in Zeile 8 eine **harte Liste** der Dateien. Bleibt
sie stehen, wird eine neue Lektion nie geprüft — und der Daten-Test ist der
praktisch wichtigste, weil er Tippfehler abfängt, bevor sie in der App
auffallen.

Im Test läuft Node, dort reicht `fs.readdirSync('data')`. Das Vite-Glob wird
dafür nicht gebraucht.

## Umzug des Bestands

`data/vokabeln.json` (9 Demo-Karten) wird auf das neue Muster umbenannt. Im
selben Zug nachziehen: `data/README.md`, `AGENTS.md` und `README.md` — dort
steht überall noch der alte Dateiname.

## Was danach möglich ist

Matilda kann die Vokabeln der 5. Klasse anlegen, Lektion für Lektion. Das ist
kein Code, sondern Inhalt — steht deshalb direkt im
[Sprint](sprint-02.md), nicht hier.
