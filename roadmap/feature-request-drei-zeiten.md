# Feature: Alle drei Zeiten auf einer Karte

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/pruefung.js`, `src/domain/note.js`, `src/app.js`, `src/ui/ui.js`, `index.html`

Heute zeigt eine Verbkarte alle drei Formen, **eine** davon ist leer und wird
getippt. Die klassische Schulaufgabe ist eine andere: `go — went — gone`, alle
drei hintereinander, aus dem Kopf.

## Was heute fehlt

Zwei Dinge, und sie hängen zusammen:

- `ABGEFRAGTE_FORMEN` in `pruefung.js` enthält nur `infinitive` und
  `simple-past`. **Nach dem Partizip wird nie gefragt** — es wird nach dem
  Lösen mitgezeigt. Ein Drittel des Stoffs ist damit Dekoration.
- Gefragt wird immer nur *eine* Form. Wer `went` kann, muss nie zeigen, dass
  er auch `gone` kann.

Das war eine bewusste Entscheidung, sie steht in
[Unregelmäßige Verben mit drei Formen](feature-implemented-formen-modus-2026-08-20-2029.md).
Für den Anfang war sie richtig — eine Lücke ist eine überschaubare Frage. Für
eine Arbeit reicht sie nicht: dort steht die ganze Zeile.

## Was gebaut wird

Eine **Zeiten-Runde**. Die Karte zeigt das deutsche Verb, darunter drei
Eingabefelder mit den Beschriftungen `infinitive`, `simple past`,
`past participle`. Alle drei werden getippt, dann einmal geprüft.

In der Domäne ist das eine neue Frageart neben `stelleFormFrage`:

```js
stelleZeitenfrage(karte, richtung)
// -> { id, frage, luecken: [{ form, antworten }, ...], loesung, ... }
```

`pruefeAntwort` bleibt, wie sie ist, und wird dreimal aufgerufen — einmal je
Lücke. Alles, was heute schon stimmt (Tippfehler-Toleranz, `springen`,
`keine Ahnung`), gilt damit unverändert pro Feld.

## Die Punkte gehen sonst nicht auf

Das ist der Teil, an dem es schiefgehen kann. `note.js` sagt es selbst: „Sie
passt nur, solange eine Runde 15 Karten hat: eine Karte, ein Punkt." Eine
Zeiten-Karte ist aber dreimal so viel Arbeit wie eine Lückenkarte.

Drei Wege, und nur einer lässt die Notentabelle in Ruhe:

| Weg | Folge |
|---|---|
| Karte = 1 Punkt, alle drei müssen stimmen | Ein Tippfehler kostet die ganze Karte. Zu hart, und die Note wird zufällig. |
| Karte = 1 Punkt, je Form ein Drittel | Krumme Zahlen überall, und `NOTEN` bekommt Drittel statt Zehntel. |
| **Runde = 5 Karten, je Form ein Punkt** | 15 Antworten, 15 Punkte. **Die Notentabelle bleibt unangetastet.** |

Empfohlen ist der dritte. Dafür muss `RUNDENGROESSE` in `app.js` von „15
Karten" zu „15 **Antworten**" werden — der Kommentar dort erklärt heute schon
den Zusammenhang mit `note.js` und muss mitgezogen werden.

## Kein dritter Modus

`modus.js` lädt dazu ein („Wer einen dritten Modus will, schreibt hier eine
Zeile dazu"), aber hier wäre es falsch. `MODI` beantwortet **wie streng**
geprüft wird — Tipps, zweiter Versuch, Zwischenstand. Die Zeiten-Runde
beantwortet **was gefragt** wird. Das sind zwei Achsen.

Kämen sie in dieselbe Tabelle, gäbe es vier Zeilen statt zwei, und
„Zeiten-Arbeit" müsste die Strengeregeln von `ARBEIT` noch einmal abschreiben.
Also: eine eigene Auswahl (Aufgabenart), und Übungsblatt/Arbeit bleibt
senkrecht dazu. Beide Aufgabenarten gibt es in beiden Strengegraden.

## Es ist der zweite Schalter

Die [Seitenmenü](feature-request-seitenmenue.md) wartet auf „mindestens
zwei Schalter, die es zu zeigen lohnt". Bisher gab es nur einen (Töne an/aus),
weil der Vokabel-Strang ruht und die [Richtung](feature-request-richtung.md)
unentschieden ist. **Die Wahl der Aufgabenart ist dieser zweite Schalter** —
und damit macht dieses Feature nebenbei das Seitenmenü reicher.

## Voraussetzungen

Keine für die Domäne und die Karte selbst — die drei Formen stehen alle in
`data/unregelmaessige-verben.json`, es wird kein Datenformat geändert.

Für die *Auswahl* zwischen den Aufgabenarten:
[Die Speicher-Naht am Gerät](feature-request-storage.md). Solange
die fehlt, kann die Zeiten-Runde als einziger Startknopf mehr auf der
Startseite anfangen, neben Übungsblatt und Arbeit.

## Zu beachten

- **Zweite Chance und Lernpotential zählen pro Form, nicht pro Karte.**
  `app.js` merkt sich Fehler ohnehin schon als `{ id, form }` — die
  Wiederholung kann also genau die Form nachreichen, die danebenging, und
  `stelleFrageZuForm` gibt es dafür bereits.
- **Nur der Infinitiv trägt alle Bedeutungen.** Bei `to break` ist im
  Infinitivfeld „brechen, zerbrechen, kaputtmachen" richtig, in den anderen
  beiden Feldern nur die Hauptbedeutung. In Richtung Englisch stört das nicht,
  in Richtung Deutsch schon — siehe [Richtung](feature-request-richtung.md).
- **`to read` wird zum Dreifach-Freipunkt.** Die Karte steht im
  `backlog.md` unter „Kleinigkeiten"; in der Zeiten-Runde wiegt sie dreimal so
  schwer. Die Entscheidung darüber gehört Matilda, aber sie wird hier dringender.
- **Drei Eingabefelder auf einem iPhone, mit offener Tastatur.** Das ist die
  Randbedingung, gegen die entworfen wird, seit klar ist, dass primär mobil
  geübt wird — nicht ein „auch noch prüfen". Über der Tastatur bleiben rund
  350 px: Verb, drei beschriftete Felder, Knopf. Das ist knapp und machbar.
  Passt es nicht, wird **ein Feld nach dem anderen** abgefragt statt drei
  gleichzeitig — dieselbe Aufgabe, anderer Bildschirm. Untereinander in jedem
  Fall, nie nebeneinander. Die Formenzeile ist schon einmal am Layout gescheitert
  ([PR #8](https://github.com/ThomasPaulus21107/VocApp/pull/8)), und genau so
  ein Fehler ist der Anlass für [Wie die Oberfläche getestet wird](feature-request-ui-tests.md).
- **`enterkeyhint` und Tab-Reihenfolge.** Enter im ersten Feld darf nicht die
  halb leere Karte abschicken, sondern springt ins nächste. Erst im letzten
  Feld wird geprüft.
