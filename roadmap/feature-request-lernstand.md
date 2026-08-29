# Feature: Der Lernstand je Vokabel

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/lernstand.js` — neu, `src/app.js`, später `src/infra/backend.js`

Wie oft kam ein Wort dran, wie gingen die Versuche aus, und was geht immer
wieder schief. Das ist der Unterbau für
[die Gewichtung](feature-request-auswahl.md), für
[die Fortschrittsseite](feature-request-fortschritt.md) und für alles, was
später Punkte heißt.

**In zwei Stufen**, seit dem 29.08.2026: die erste läuft lokal und braucht
weder Supabase noch eine Antwort auf die Punktefrage.

## Die Daten entstehen längst — sie werden weggeworfen

`app.js` schreibt während jeder Runde mit:

```js
ergebnisse.push({ frage, gesuchteForm, erwartet, richtig, getippt, punkte })
```

Welche Form gefragt war, ob es saß, was getippt wurde, was es wert war. Am
Rundenende wird daraus die Ergebnisliste — und dann ist es weg.

Eine Lücke gibt es: `merkeErgebnis` speichert `frage` (das deutsche Wort),
nicht die `id` der Karte. Für die Anzeige reicht das, für Auswertung nicht.
`merkeFuerSpaeter` daneben hat sie. **Eine Zeile.**

## Stufe 1: lokal, ein Nutzer

Zwei Dinge nebeneinander in [`storage.js`](feature-request-storage.md):

**Das Aggregat** — je Karte und Form ein paar Zähler. Beantwortet „wie oft
dran, wie ging es aus" für immer und wächst nie:

```js
"uv-003|simple-past": {
  dran: 14, ersterVersuch: 9, zweiterVersuch: 3, falsch: 2,
  tipps: 4, uebersprungen: 0, zuletzt: 26
}
```

`zuletzt` ist **dasselbe Feld, das die [Auswahl](feature-request-auswahl.md)
für die Abdeckung braucht.** Zwei Features, ein Datensatz.

**Der Ringpuffer** — die letzten 50 Runden als einzelne Antworten mit
Zeitstempel. Er ist das Gegengift gegen das Festlegen: damit lässt sich ein
Können-Modell neu rechnen, statt es nur fortzuschreiben.

| | Größe |
|---|---|
| Aggregat, 106 Einheiten × acht Zahlen | ~15 KB, wächst nie |
| Ringpuffer, 750 Antworten | ~80 KB, wächst nie |
| Verfügbar in `localStorage` | ~5 MB |

Nachgemessen am 29.08.2026: eine gespielte Runde belegt 2,4 KB, im Vollausbau
sind es rund **100 KB — zwei Prozent des Platzes.** (Die Schätzung stand hier
vorher bei 63 KB; die Verlaufszeilen sind etwas dicker als angenommen.) Selbst
ein ungekürztes Protokoll über ein Jahr läge bei etwa 2 MB — es gibt hier kein
Platzproblem, nur ein Formatproblem.

Aus 106 werden 159 Einheiten, sobald
[Alle drei Zeiten](feature-request-drei-zeiten.md) auch nach dem Partizip
fragt. An der Größenordnung ändert das nichts.

### Was Stufe 1 freischaltet

**Die Punktefrage blockiert das nicht.** „Wie oft kam `caught` dran und wie oft
saß es" braucht kein Punktemodell — das braucht nur die Rangliste. Sofort
baubar werden damit:

- [Den Lernfortschritt sehen](feature-request-fortschritt.md), als lokale Seite
- [Gewichtung Stufe 2](feature-request-auswahl.md) — „schwer" steht jetzt im Aggregat
- Wiederkehrende Potentiale, sobald das Feld `muster` da ist

Gesperrt bleibt nur, was wirklich mehrere Menschen braucht: Vergleiche,
Missionen, gemeinsamer Punktestand.

### Der Preis, ehrlich

- **Der Speicher hängt am Gerät.** Das ist seit dem 29.08.2026 kein Problem
  mehr: geübt wird primär auf Matildas iPhone, und damit ist die lokale
  Statistik nicht die halbe, sondern die ganze.
- **iOS löscht `localStorage` nach sieben Tagen ohne Benutzung.** Safari räumt
  skriptgeschriebenen Speicher weg, wenn eine Seite eine Woche lang nicht
  benutzt wurde. Die Uhr setzt sich bei jedem Öffnen zurück — wer regelmäßig
  übt, merkt nie etwas. Es trifft die Lücken: Krankheit, Ferien, Schuljahresende.
  **Genau die Momente, nach denen die Statistik am meisten wert wäre.**
  Dagegen hilft [Auf dem Homebildschirm](feature-request-homebildschirm.md) —
  dort gilt die Regel nicht.
- **Ein geleerter Cache löscht Monate.** Beim `zuletzt` der Auswahl war das
  egal, hier nicht.
- **Format ändern geht**, solange es der eigene Browser ist: der Code läuft ja
  beim nächsten Öffnen und kann hochziehen. Was bei fremden Kindern nicht geht,
  ist etwas anderes — prüfen, ob es geklappt hat, sichern, wiederherstellen.

Deshalb gehört **ein „Statistik sichern"-Knopf** dazu, der die JSON als Datei
herunterlädt. Auf einem iPhone als Hauptgerät ist er keine Kür, sondern
**Pflicht von Anfang an**: er ist die einzige Kopie, die eine Ferienlücke
übersteht. Zehn Zeilen, und aus einem unwiederbringlichen Verlust wird ein
ärgerlicher.

Und: **erst den Homebildschirm, dann sammeln.** Eine Web-App auf dem
Homebildschirm hat unter iOS ihren eigenen Speicher, getrennt von Safari — wer
später installiert, steht vor einer scheinbar leeren Statistik.

## Stufe 2: Postgres, mehrere Nutzer

Eine Zeile je Antwort, dauerhaft:

```
user_id, karten_id, form, richtig, versuch, tipp_stufen, modus, gespielt_am
```

Der Ringpuffer aus Stufe 1 ist genau das, was hochgeladen wird; das Aggregat
wird danach aus den Zeilen abgeleitet und ist Cache, nicht Wahrheit.

### Ereignisse, nicht Zustände

| | Zustand je Karte | **Ereignis je Antwort** |
|---|---|---|
| Modell ändern | alte Werte sind verloren | **neu berechnen aus dem Bestand** |
| „Wiederkehrend" beantwortbar | nein, keine Geschichte | ja, das ist der Normalfall |

Der Backlog hat den Lernstand lange mit „sobald es auf der Platte liegt, ist
jede Änderung eine Migration" aufgehalten. Genau diese Angst löst sich hier
auf: **Ereignisse sind das einzige Format, das dich nicht festlegt.**

Größenordnung: 15 Antworten × 3 Runden am Tag × 12 Kinder × 200 Tage ≈
**100.000 Zeilen im Jahr.** Für Postgres ist das nichts.

## Die Einheit ist Karte plus Form

`to write` kann im simple past sitzen und im Partizip nicht — 53 Verben ×
3 Formen sind **159 verfolgbare Einheiten**, nicht 53. Wer auf Kartenebene
zusammenfasst, mittelt genau die Information weg, um die es geht. Die App
unterscheidet das ohnehin schon: `zuWiederholen` merkt sich `{ id, form }`.

## Wiederkehrende Potentiale hängen am Muster

„Du kannst `sang` nicht" ist eine Vokabel. „**Du verlierst systematisch bei
`i – a – u`**" ist eine Diagnose — und führt zu einer Übung, die auch bei
`swim` und `drink` hilft.

Den Gruppierungsschlüssel dafür führt
[Tipps, die zur Frage passen](feature-request-tipps.md) als Feld `muster` ein.
Es tut damit zwei Dinge: es liefert den Tipptext **und** die Achse, über die
ausgewertet wird.

## Die Domäne

`domain/lernstand.js`, reine Funktionen wie alles dort:

```js
verrechne(aggregat, ergebnis)     // -> neues Aggregat, unveraendert rein
schwierigkeit(eintrag)            // -> 0 … 1, fuer die Gewichtung
schwaechen(aggregat, karten)      // -> gruppiert nach muster
```

**Das Datum kommt von außen herein**, nie `new Date()` in der Domäne.

## Nicht verwechseln mit `lernpotential.js`

Die Datei sagt über sich selbst: „Nicht morgen, nicht in drei Tagen — sofort."
Sie holt zurück, was in *dieser* Runde danebenging. Hier geht es um die
Geschichte über Wochen. Zwei Fragen, zwei Dateien — die bestehende bleibt
unangetastet.

Leitner aus dem Backlog ist danach nur ein anderes Modell über denselben
Daten: es ersetzt die Gewichtsformel, nicht das Ziehen.

## Voraussetzungen

- **Stufe 1:** [Die Speicher-Naht am Gerät](feature-request-storage.md). Sonst
  nichts.
- **Stufe 2:** [Mehrere Nutzer](feature-request-mehrere-nutzer.md) — ohne
  Konten gibt es kein `user_id`.
- [Tipps](feature-request-tipps.md) für das Feld `muster`, sobald es um
  wiederkehrende Potentiale geht. Für die Statistik selbst nicht nötig.

## Zu beachten

- **Melden darf nie blockieren.** In Stufe 1 heißt das `try/catch` um jeden
  Speicherzugriff, in Stufe 2 einen Aufruf, der im Hintergrund läuft. Eine
  Runde, die hängt, ist schlimmer als ein fehlender Datenpunkt.
- **Der Modus gehört in den Datensatz.** Eine Antwort im Übungsblatt (mit Tipp
  und zweitem Versuch) ist nicht dieselbe Evidenz wie eine in der Arbeit. Ohne
  dieses Feld ist die Auswertung später nicht zu retten.
- **Die Lernpotential-Runde zählt nicht mit.** `app.js` schreibt dort schon
  heute nichts in `ergebnisse` — dieselbe Karte stünde sonst zweimal drin.
