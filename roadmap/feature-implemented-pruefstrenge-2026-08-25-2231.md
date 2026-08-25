# Feature: Wie streng die App prüft

**Status:** umgesetzt am 25.08.2026 um 22:31
**Wo im Code:** `src/domain/pruefung.js`, Regel in `src/domain/modus.js`

Entschieden am 2026-08-25. Die Frage stand seit Sprint 1 als Häkchen in
`sprint-03.md` und ist deshalb nie drangekommen — Häkchen sehen aus wie
Kleinkram. Es sind aber drei Entscheidungen, die auf **jeder einzelnen Karte**
wirken.

## Die drei Fragen und ihre Antworten

| Frage | Entschieden |
|---|---|
| Zählt ein Tippfehler als falsch? | Im Übungsblatt nein, in der Arbeit ja |
| Muss man beim Infinitiv „to" mittippen? | Ja, wie bisher |
| Gelten bei `to be` „was" und „were" beide? | Ja, beide |

Nur die erste ist Arbeit. Die anderen beiden sind entschieden und stehen hier,
damit sie nicht in einem halben Jahr wieder aufgemacht werden.

## Warum das „to" Pflicht bleibt

Es gehört zur Form. „to write" ist der Infinitiv, „write" ist die Grundform —
im Schulheft steht die Spalte mit „to". Der Tipp zeigt es ohnehin an
(`to w____`), es ist also nichts, was man raten muss.

## Warum bei `to be` beide gelten

Die Frage lautet „sein → simple past", nicht „er → simple past". Ohne Person
ist keine der beiden Formen falsch. `uv-001` bleibt wie sie ist.

## Was gebaut wird: Tippfehler im Übungsblatt

Eine sechste Zeile in der Regeltabelle in `domain/modus.js`:

```
tippfehlerErlaubt  Zählt "writte" als richtig?
```

Übungsblatt `true`, Arbeit `false`. Damit steht die Strenge da, wo alle
anderen Modus-Unterschiede schon stehen, und nicht als Sonderfall in `app.js`.

Dazu eine reine Funktion in `pruefung.js`, die zwei Wörter vergleicht und
sagt, ob sie sich um höchstens **ein Zeichen** unterscheiden — ein Buchstabe
vertauscht, einer zu viel, einer zu wenig.

### Drei Regeln, ohne die es schiefgeht

1. **Erst ab fünf Buchstaben.** Bei kurzen Wörtern ist ein Zeichen zu viel
   Spielraum: „war" wäre sonst ein richtiges „was" — also ausgerechnet das
   deutsche Wort. Das gilt für die Länge der *erwarteten* Antwort.
2. **Die Toleranz greift zuletzt.** Erst `s` und „keine ahnung", dann der
   exakte Vergleich, dann erst der nachsichtige. Die beiden Easter Eggs dürfen
   nie über eine Ähnlichkeit gefunden werden.
3. **Die richtige Schreibweise muss auf den Bildschirm.** Sonst lernt man den
   Tippfehler mit. Die Rückmeldung heißt also nicht „Richtig!", sondern sagt
   dazu, wie es geschrieben wird — Text von Matilda.

### Punkte

Ein Tippfehler kostet nichts: volle Punktzahl. Er ist kein Wissensfehler, und
in der Arbeit — wo die Note wirklich zählt — gibt es die Nachsicht ohnehin
nicht.

## Warum das unter dem Verb-Fokus vorne steht

Es ist reine Domänenarbeit, vollständig testbar, ohne neue Abhängigkeit. Und
es betrifft jede Verbkarte: Formen wie „brought", „thought" oder „ridden"
sind genau die Wörter, bei denen man sich vertippt, ohne sie nicht zu können.


---

## Wie es gebaut wurde

`tippfehlerErlaubt` ist die sechste Zeile in der Regeltabelle: Übungsblatt
`true`, Arbeit `false`. `pruefeAntwort(eingabe, frage, tippfehlerErlaubt)`
nimmt sie als dritten Parameter, der ohne Angabe `false` ist — im Zweifel
wird also streng geprüft.

### `fastGleich(getippt, erwartet)`

Vergleicht von vorne bis zur ersten Abweichung und von hinten genauso. Was
dazwischen übrig bleibt, ist der Fehler: höchstens ein Zeichen auf jeder
Seite. Damit sind alle drei Tippfehler abgedeckt — vertauscht, zu viel, zu
wenig — ohne eine Distanzmatrix und ohne verschachtelte Schleife.

Die drei Regeln aus dem Plan stehen alle im Code:

- **Erst ab fünf Buchstaben** (`KURZ_GENUG_FUER_TOLERANZ`). Der Test hält
  ausdrücklich fest, dass „war" nie als „was" durchgehen darf und „sang" nicht
  als „sung".
- **Die Toleranz greift zuletzt**, nach `s`, nach „keine ahnung" und nach dem
  genauen Vergleich. Ein Test sichert das ab.
- **Die Schreibweise kommt auf den Bildschirm:** das Ergebnis trägt
  `tippfehler: true`, und die Rückmeldung heißt dann „Richtig! Kleiner
  Tippfehler, schau dir die Schreibweise an:" statt nur „Richtig!". Die drei
  Formen stehen ohnehin direkt darunter.

### Punkte

Unverändert: ein durchgelassener Tippfehler zählt als richtige Antwort und
kostet nichts. In der Arbeit gibt es die Nachsicht nicht, und dort zählt die
Note.

### Tests

Elf neue: sechs auf `fastGleich`, vier auf `pruefeAntwort` mit und ohne
Erlaubnis, einer auf die Regeltabelle.
