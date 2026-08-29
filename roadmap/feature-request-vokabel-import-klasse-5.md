# Feature: Die Vokabeln der 5. Klasse hereinholen

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `data/lektion-*.json`, `src/app.js`, `tests/daten.test.js`, `data/README.md`
**Wer:** Matilda (die Vokabeln), Thomas (das Einsammeln)

In der App stehen neun Demo-Karten: Hund, Fahrrad, Auto, Haus. Was fehlt, sind
die Wörter, die sie tatsächlich lernen muss. **Ohne sie ist die App eine
Vorführung und kein Werkzeug.**

Fasst zwei Backlog-Einträge zusammen, die sich nicht trennen lassen: das
Dateiformat und den Inhalt. Nachträglich aufteilen hieße, dieselben Karten
zweimal anzufassen.

## Das weckt den Vokabel-Strang wieder auf

Ehrlich vorweg: `AGENTS.md` sagt „Der Fokus liegt auf den Verben", und
`backlog.md` führt den Vokabel-Strang seit dem 25.08.2026 als ruhend. Dieses
Feature ist die Entscheidung, ihn wieder aufzunehmen. Wer es baut, ändert
beide Stellen mit — sonst behauptet die Doku weiter etwas anderes als der Code.

Der Grund, es jetzt zu tun: die Verben sind fertig abgefragt. Was an ihnen
noch offen ist ([Zeiten](feature-request-drei-zeiten.md),
[Tipps](feature-request-tipps.md)), macht die Abfrage besser, aber nicht
größer. Der nächste Zuwachs an Nutzen liegt im Stoff, nicht in der Mechanik.

## Eine Datei pro Lektion

`data/lektion-01.json`, `data/lektion-02.json` und so weiter, statt einer
immer weiter wachsenden `vokabeln.json`. Matilda arbeitet dann in kleinen,
überschaubaren Dateien, und die [Seitenmenü](implemented/feature-seitenmenue-2026-08-29-1348.md)
kann später einzelne Lektionen anbieten.

Die unregelmäßigen Verben bleiben, wo sie sind — sie sind keine Lektion,
sondern eine eigene Sorte Karte.

### Automatisch einsammeln

Sonst muss Matilda für jede neue Lektion auch noch `app.js` anfassen. Bei Vite
geht das an genau einer Stelle:

```js
import.meta.glob('../data/lektion-*.json', { eager: true })
```

**Preis:** das Namensmuster `lektion-*.json` ist ab dann bindend und gehört
nach `data/README.md`. **Gewinn:** kein Verzeichnis, das jemand pflegen muss —
sie legt eine Datei an, mehr nicht.

### Der Datentest muss mit

`tests/daten.test.js` führt die Dateiliste **von Hand** (`const dateien = {…}`).
Bleibt sie stehen, wird eine neue Lektion nie geprüft — und der Datentest ist
der praktisch wichtigste von allen, weil er Tippfehler abfängt, bevor sie in
der App auffallen. Im Test läuft Node, dort reicht `fs.readdirSync('data')`;
das Vite-Glob wird dafür nicht gebraucht.

Ein Test, der die Karten nicht sieht, ist schlimmer als kein Test: er ist
grün.

## Woher die Wörter kommen

**Abgetippt, Lektion für Lektion, eine Lektion je Pull Request.** Nicht aus
einer Datei konvertiert, auch wenn es das Wort „Import" nahelegt.

Zwei Gründe. Erstens ist das Abtippen der Weg, auf dem regelmäßig eine
Änderung von Matilda selbst nach `main` geht — der Git-Ablauf ist Teil des
Lernziels und steht so in `roadmap/README.md` unter „Wiederkehrendes".
Zweitens tippt sie beim Eintragen jede Vokabel einmal ab, und das ist schon
das halbe Lernen.

Gäbe es doch eine maschinenlesbare Liste, käme ein einmaliges Skript nach
`scripts/` und **nicht** in die App: es erzeugt dasselbe Format und läuft nie
wieder. Die App lädt JSON und sonst nichts.

## Die Karten wieder anzeigen

`app.js` importiert heute nur `unregelmaessige-verben.json`. Mit den Lektionen
kommt der zweite Stapel zurück — und damit zwei Dinge, die der Fokus-Umbau
ausgebaut hat:

- `el.beiwort` trägt seit damals den Formnamen (`simple past`). Für eine
  normale Vokabel muss dort wieder `wortart · bedeutung` stehen. Die
  Fallunterscheidung ist in `ui.js` fällig, nicht in der Domäne — `stelleFrage`
  liefert beide Felder längst mit.
- Die Formenzeile muss bei normalen Karten verschwinden. Genau daran ist
  [PR #8](https://github.com/ThomasPaulus21107/VocApp/pull/8) gescheitert:
  `display: flex` hat `hidden` überstimmt. Diesmal hinsehen.

## Auswählen, was geübt wird

**Sobald echte Vokabeln da sind, mischt eine Runde 53 Verben mit N Vokabeln,
und der Verb-Fokus löst sich still auf.** Das ist der eine Punkt, an dem
dieses Feature etwas kaputt machen kann.

Die Domäne kann die Auswahl schon (`hatFormen`, `mische`, `zieheRunde`), es
ist im Wesentlichen ein Wiederanschließen. Der Schalter dafür gehört auf
dieselbe Auswahl wie die Aufgabenart aus
[Alle drei Zeiten](feature-request-drei-zeiten.md) — es ist dieselbe Frage
(„was wird gefragt"), nur eine Zeile mehr.

Solange die Auswahl fehlt, gilt: die Lektionen liegen in `data/`, der Datentest
prüft sie, und `app.js` zieht weiter nur Verben. Das ist ein vertretbarer
Zwischenstand und blockiert Matildas Arbeit nicht.

## Voraussetzungen

Keine harten. Sinnvoll davor:
[Die Speicher-Naht am Gerät](implemented/feature-storage-2026-08-29-1327.md), damit
die Auswahl das Neuladen übersteht.

## Wann es fertig ist

Wenn eine Runde aus 15 Karten gezogen werden kann, ohne dass sich Karten
wiederholen, und die Wörter aus ihrem echten Unterricht stammen.

Es muss nicht alles auf einmal sein. Eine Lektion ist ein Pull Request.

## Zu beachten

- **`data/vokabeln.json` wird umbenannt**, nicht kopiert. Die neun
  Demo-Karten werden zu `lektion-00.json` oder fliegen raus — zu entscheiden,
  sobald die erste echte Lektion steht. Im selben Zug nachziehen:
  `data/README.md`, `AGENTS.md` und `README.md`, dort steht überall noch der
  alte Dateiname.
- **`id` niemals nachträglich ändern.** Die Demo-Karten heißen `demo-001`; die
  echten Lektionen fangen bei `l1-001` an. Der Datentest prüft die
  Eindeutigkeit über alle Dateien zusammen.
- **Beide `hinweise` sind Pflicht.** Bei 15 Karten je Lektion sind das 30
  Texte — das ist der eigentliche Aufwand, nicht die Vokabeln selbst. Wer die
  Lektion in einem Rutsch schreiben will, sollte das wissen.
