# Feature: Tipps, die zur Frage passen

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/pruefung.js`, `src/domain/note.js`, `data/unregelmaessige-verben.json`, `data/README.md`
**Wer:** Thomas (die Mechanik), Matilda (die Texte)

Ersetzt am 29.08.2026 die Datei `feature-request-verbtipps.md`. Dort ging es
nur um die Texte bei den Verben; beim Nachsehen im Code stellte sich heraus,
dass die Mechanik darunter das eigentliche Thema ist. Die alte Fassung liegt
in der Git-Historie.

## Der Befund: die Tipps in der Datei sieht heute niemand

53 Verben tragen je zwei Hinweistexte, `nach-de` und `nach-en`. Der Datentest
verlangt sie, `data/README.md` erklärt sie über einen halben Abschnitt — und
in der laufenden App erscheint **keiner davon**.

Der Grund steht in `pruefung.js` bei `stelleFrageZuForm`:

```js
// Der Tipp wird gebaut, nicht aus der Karte gelesen: er soll bei der Form
// helfen, nicht bei der Bedeutung.
hinweis: baueHinweis(antworten[0]),
```

Was der Tipp-Knopf zeigt, ist also `w____` — die Buchstabenmaske. Der Weg über
`karte.hinweise` existiert nur in `stelleFrage`, und die ist für normale
Vokabeln; `app.js` lädt `vokabeln.json` seit dem Fokus-Umbau gar nicht mehr.
**106 geschriebene Texte, die niemand sieht.**

Das ist kein Fehler, sondern eine halb zu Ende gedachte Entscheidung: es wurde
richtig erkannt, dass ein Bedeutungstipp bei einer Formfrage nicht hilft — und
dann wurde er ersatzlos abgeklemmt, statt durch etwas Besseres ersetzt.

## Es gibt drei Sorten Tipp, nicht eine

| Sorte | Woher | Hilft bei | Zustand |
|---|---|---|---|
| **Buchstaben** `w____` | gebaut aus der Lösung | Schreibweise, Länge | gebaut, einzige sichtbare |
| **Bedeutung** „ein Haustier" | `hinweise` auf der Karte | *welches Wort* gemeint ist | geschrieben, unsichtbar |
| **Muster** „gehört zu `buy/bought`" | neu | die Form *ableiten* | fehlt |

Ein Tipp ist damit kein Text mehr, sondern eine **Leiter**: erst der, der am
wenigsten verrät.

## Die Musterhinweise

Aus der ersetzten Datei, unverändert Matildas Idee. Unregelmäßige Verben sind
nicht zufällig unregelmäßig — sie kommen in Gruppen:

| Muster | Gehört zusammen |
|---|---|
| `-ought` / `-aught` | think/thought, buy/bought, fight/fought, catch/caught |
| `i – a – u` | sing/sang/sung, swim/swam/swum, drink/drank/drunk |
| `-ow – ew – own` | know/knew/known, grow/grew/grown, throw/threw/thrown |
| ändert sich gar nicht | put, let, hit, cut |

Ein Tipp lautet dann nicht mehr „das machst du im Kopf", sondern „gehört zu
`buy / bought` und `catch / caught`".

**Das ändert, was die App übt.** Mit Bedeutungstipps ist es Vokabellernen; mit
Mustertipps lernt sie die Systematik dahinter und kann Verben einordnen, die
noch gar nicht drankamen.

Seit dem 29.08.2026 hängt noch etwas daran: die
[Fortschrittsseite](implemented/feature-fortschritt-2026-08-29-1531.md) zeigt unter „Das sitzt
noch nicht" eine **Wortliste**. Mit `muster` würde daraus eine Diagnose —
nicht „sang geht daneben", sondern „`i – a – u` sitzt nicht". Das ist
derselbe Unterschied wie beim Tipp selbst, nur eine Seite weiter.

## Wie es gebaut wird

`stelleFrageZuForm` liefert statt eines `hinweis` eine **Liste**, vom
schwächsten zum stärksten:

```js
hinweise: [
  { art: 'muster',     text: 'gehört zu buy/bought und catch/caught' },
  { art: 'buchstaben', text: 'th____t' },
]
```

Der Tipp-Knopf gibt beim ersten Druck den ersten, beim zweiten den zweiten.
Ist keine Stufe da, fällt sie einfach weg — eine Karte ohne Musterhinweis
zeigt direkt die Buchstaben, so wie heute.

Für normale Vokabeln ist die erste Stufe der Bedeutungshinweis aus
`karte.hinweise`. Damit wird der bestehende Text wieder sichtbar, sobald der
[Vokabel-Import](feature-request-vokabel-import-klasse-5.md) durch ist.

## Was ein Tipp kostet

`ABZUG_TIPP` ist heute ein Zehntel, und `app.js` merkt sich nur ein
`tippBenutzt = true` — zweimal drücken kostet deshalb genauso viel wie einmal.
Bei einer Leiter ist das falsch: die Buchstabenmaske verrät sehr viel mehr als
ein Muster.

Vorschlag: **je Stufe ein Zehntel**, gezählt statt geschaltet
(`tippStufen` statt `tippBenutzt`). Zwei Stufen kosten dann 0,2 — immer noch
wenig genug, dass man Tipps benutzen darf, ohne dass die Note umkippt. Die
Formel in `punkteFuerKarte` bekommt dafür eine Zahl statt eines Schalters,
`Math.max(0, …)` deckelt wie bisher.

## Das Datenformat

`hinweise` bekommt eine dritte Zeile. Ein Verb sieht dann so aus:

```json
"hinweise": {
  "nach-de": "das macht ein wütender Hund mit seinen Zähnen",
  "nach-en": "an angry dog does this with its teeth",
  "muster": "i – i – i, wie sit/sat/sat? Nein — schau auf das Partizip."
}
```

`muster` gilt für beide Richtungen: das Muster ist eine Eigenschaft des
englischen Verbs, nicht der Abfragerichtung. Das ist der Unterschied zu den
beiden anderen Zeilen und der Grund, warum es *neben* ihnen steht und nicht
in ihnen.

**Beim Bauen mitziehen:** `data/README.md` (der Abschnitt „Die beiden
Hinweise" heißt dann nicht mehr so) und `tests/daten.test.js` — dort ist zu
entscheiden, ob `muster` Pflicht wird. Empfehlung: ja für Karten mit `formen`,
sonst bleibt es bei zwölf gepflegten und einundvierzig leeren Verben.

## Voraussetzungen

Keine. Die Verbenliste steht, das Feld ist da, es geht um eine Stufe mehr
darin und um zehn Zeilen in `pruefung.js`.

## Zu beachten

- **53 Verben, und nicht alle passen in eine Gruppe.** Bei den Einzelgängern
  (`go/went/gone`, `be/was/been`) ist ein ehrliches „das ist ein Sonderfall,
  den muss man sich merken" besser als ein konstruiertes Muster.
- **Die Bedeutungstexte bleiben stehen**, auch wenn sie bei Formfragen nicht
  mehr auftauchen. Sie werden wieder gebraucht, sobald normale Vokabeln
  dazukommen — und sie neu zu schreiben wäre teurer, als sie liegen zu lassen.
- In der [Zeiten-Runde](feature-request-drei-zeiten.md) hat eine Karte drei
  Lücken. Der Musterhinweis gilt für alle drei zusammen, die Buchstabenmaske
  je Feld. Wer beides baut, sollte das in dieser Reihenfolge tun.
