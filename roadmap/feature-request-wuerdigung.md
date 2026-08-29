# Feature: Würdigung statt Rangliste

**Status:** offen — die Richtung steht, die Form nicht
**Wo im Code:** `index.html`, `src/ui/ui.js`, `supabase/schema.sql`

Die letzte offene Entscheidung aus
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md). Sie steht
als eigene Datei da, weil sie sonst zwischen den Missionen und der
Rangliste-die-nicht-kommt liegen bleibt — und weil sie eine Entscheidung ist
und keine Bauanleitung, wie
[Ob die Abfragerichtung umschaltbar wird](feature-request-richtung.md).

## Was schon entschieden ist

- **Alle dürfen den Fortschritt aller sehen, unter Pseudonymen.** Die Zahlen
  liegen also bereit; `fortschritte()` in
  [Gemeinsame Lernmissionen](feature-request-missionen.md) gibt Pseudonym,
  Wochenpunkte und Anteil sicher zurück.
- **Ein Punkt ist eine Karte, die saß**, gezählt über die laufende Woche.
- **Eine Rangliste von Platz 1 bis 12 wird es nicht geben.** Der Satz aus dem
  ersten Refinement gilt weiter: *in einer Gruppe gibt es immer ein letztes
  Kind, und das hört auf zu üben.*

Es fehlt also nur noch eine Frage, und es ist die schwierigste: **wie sieht
Anerkennung aus, die niemanden nach unten sortiert?**

## Drei Formen, die zur Wahl stehen

### Schwellen statt Sieger

Eine Marke, keine Reihenfolge: „diese Woche geschafft — matilda, fuchs7, leo,
nina". Alle, die darüber sind, werden genannt; es gibt keine Obergrenze und
keine Plätze.

**Das ist die einzige Form, die strukturell keinen Verlierer erzeugt.** Niemand
verliert seine Nennung dadurch, dass ein anderer besser war, und wer knapp
darunter liegt, weiß genau, was fehlt.

Offen dabei: **wo die Marke liegt.** Zu hoch, und es schaffen drei; zu niedrig,
und es bedeutet nichts. Sie darf auch nicht mitwachsen — eine Marke, die sich
an den Besten orientiert, ist eine Rangliste mit Umweg.

### Wechselnde Titel für verschiedene Dinge

„Die Fleißigste", „der größte Sprung", „die treueste Übende". Mehrere
Kategorien, damit verschiedene Kinder vorn liegen.

Lebendiger — aber je Titel gibt es genau einen, und wer über Wochen in keiner
Kategorie vorn ist, merkt das. Es ist eine Rangliste, nur in Scheiben
geschnitten.

### Nur gegen sich selbst

„Deine beste Woche bisher: 142. Diese Woche: 118." Kein Blick auf andere.

Völlig unschädlich, und für das eigene Dranbleiben vermutlich das Wirksamste.
Nur ist es dann kein Vergleich mehr, und der ursprüngliche Wunsch — sich
messen, gemeinsam etwas erreichen — bleibt bei den Missionen allein.

## Warum hier noch nichts entschieden ist

**Weil die Form nicht am Schreibtisch entstehen soll.** Was als Anerkennung
ankommt und was als Bloßstellung, weiß ein Zwölfjähriger besser als eine
Roadmap. Das gehört Thomas und Matilda gemeinsam, so wie die Punktefrage es
gehörte.

Der Vorschlag zum Einstieg ist trotzdem **Schwellen statt Sieger**, und zwar
aus einem prüfbaren Grund und nicht aus Geschmack: es ist die einzige der drei
Formen, bei der die Zahl der Gewürdigten nicht nach oben begrenzt ist.

## Voraussetzung

[Gemeinsame Lernmissionen](feature-request-missionen.md) — dort entsteht
`fortschritte()`, und dort steht der Balken, neben dem eine Würdigung
überhaupt erst einen Platz hat.

Solange diese Datei offen ist, wird nichts davon gebaut. **Die Missionen hängen
nicht daran** und können vorher laufen.
