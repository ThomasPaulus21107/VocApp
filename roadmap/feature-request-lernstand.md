# Feature: Der Lernstand als Ereignisse

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/lernstand.js` — neu, `src/infra/backend.js`, `src/app.js`

Welche Vokabel sitzt bei wem wie gut, und was geht immer wieder schief. Das
ist der Unterbau für [die Auswahl](feature-request-auswahl.md), für
[den Fortschritt](feature-request-fortschritt.md) und für alles, was später
Punkte heißt.

## Die Daten entstehen längst — sie werden weggeworfen

Das ist die eigentliche Nachricht. `app.js` schreibt während jeder Runde mit:

```js
ergebnisse.push({ frage, gesuchteForm, erwartet, richtig, getippt, punkte })
```

Welche Form gefragt war, ob es saß, was getippt wurde, was es wert war. Am
Rundenende wird daraus die Ergebnisliste — und dann ist es weg.

Eine Lücke gibt es: `merkeErgebnis` speichert `frage` (das deutsche Wort),
nicht die `id` der Karte. Für die Anzeige reicht das, für Auswertung nicht.
`merkeFuerSpaeter` daneben hat sie. **Eine Zeile.**

## Ereignisse, nicht Zustände

Die wichtigste Entscheidung, und sie ist der Grund, warum das hier überhaupt
gebaut werden kann.

| | Zustand je Karte | **Ereignis je Antwort** |
|---|---|---|
| Was liegt da | `{ user, karte, form, koennen: 0.7 }` | eine Zeile je Antwort, mit Zeitstempel |
| Modell ändern | alte Werte sind verloren | **neu berechnen aus dem Bestand** |
| „Wiederkehrend" beantwortbar | nein, keine Geschichte | ja, das ist der Normalfall |

Der Backlog hat den Lernstand bisher mit „sobald es auf der Platte liegt, ist
jede Änderung eine Migration" aufgehalten. Genau diese Angst löst sich hier
auf: **Ereignisse sind das einzige Format, das dich nicht festlegt.** Ein
neues Können-Modell ist eine neue Abfrage über dieselben Zeilen.

Der schnelle Lesezugriff wird eine abgeleitete Tabelle, die man jederzeit neu
befüllen kann. Sie ist Cache, nicht Wahrheit.

## Die Zeile

```
user_id, karten_id, form, richtig, versuch, tipp_stufen, modus, gespielt_am
```

**Die Einheit ist Karte plus Form**, nicht die Karte. `to write` kann im
simple past sitzen und im Partizip nicht — 53 Verben × 3 Formen sind **159
verfolgbare Einheiten**, nicht 53. Wer auf Kartenebene zusammenfasst, mittelt
genau die Information weg, um die es geht. Die App unterscheidet das ohnehin
schon: `zuWiederholen` merkt sich `{ id, form }`.

Größenordnung: 15 Antworten × 3 Runden am Tag × 12 Kinder × 200 Tage ≈
**100.000 Zeilen im Jahr.** Für Postgres ist das nichts.

## Warum nicht in den Browser

Siehe [`storage.js`](feature-request-storage.md): `localStorage` in fremden
Browsern ist **nicht migrierbar und nicht wiederherstellbar**. Ein
Formatfehler bliebe für immer drin, ein geleerter Cache löscht alles, und Handy
und Laptop wüssten nichts voneinander. Bei Postgres ist eine Formatänderung
eine SQL-Datei, die einmal läuft.

Die Grenze: **lokal ist nur in Ordnung, solange die einzigen Daten welche
sind, die man wegwerfen will.** Bis zum ersten fremden Kind gilt das, danach
nicht mehr.

## Wiederkehrende Potentiale hängen am Muster

„Du kannst `sang` nicht" ist eine Vokabel. „**Du verlierst systematisch bei
`i – a – u`**" ist eine Diagnose — und führt zu einer Übung, die auch bei
`swim` und `drink` hilft.

Dafür braucht es einen Gruppierungsschlüssel, und genau den führt
[Tipps, die zur Frage passen](feature-request-tipps.md) als Feld `muster` auf
der Karte ein. Es tut damit zwei Dinge: es liefert den Tipptext **und** die
Achse, über die ausgewertet wird. Ohne dieses Feld bleibt „wiederkehrende
Potentiale" eine Absichtserklärung.

## Die Domäne

`domain/lernstand.js`, reine Funktionen wie alles dort:

```js
bewerte(ereignisse, heute)      // -> { karte, form, koennen, zuletzt }
schwaechen(ereignisse, karten)  // -> gruppiert nach muster
```

**Das Datum kommt von außen herein**, nie `new Date()` in der Domäne — dieselbe
Regel, die der Backlog schon für die Streak-Berechnung aufgeschrieben hat.

## Nicht verwechseln mit `lernpotential.js`

Die Datei sagt über sich selbst: „Nicht morgen, nicht in drei Tagen — sofort."
Sie holt zurück, was in *dieser* Runde danebenging. Hier geht es um die
Geschichte über Wochen. Zwei Fragen, zwei Dateien — die bestehende bleibt
unangetastet.

Leitner aus dem Backlog ist danach nur noch ein anderes Modell über denselben
Ereignissen: es ersetzt die Gewichtsformel, nicht das Ziehen.

## Voraussetzungen

- [Mehrere Nutzer](feature-request-mehrere-nutzer.md) — ohne Konten gibt es
  kein `user_id`
- [Tipps](feature-request-tipps.md) für das Feld `muster`, sobald es um
  wiederkehrende Potentiale geht. Für den reinen Lernstand nicht nötig.

## Zu beachten

- **Melden darf nie blockieren.** Fällt das Netz aus, wird weitergeübt und die
  Zeilen gehen verloren. Eine Runde, die hängt, weil der Server langsam ist,
  ist schlimmer als ein fehlender Datenpunkt.
- **Der Modus gehört in die Zeile.** Eine Antwort im Übungsblatt (mit Tipp und
  zweitem Versuch) ist nicht dieselbe Evidenz wie eine in der Arbeit. Ohne
  dieses Feld ist die Auswertung später nicht zu retten.
