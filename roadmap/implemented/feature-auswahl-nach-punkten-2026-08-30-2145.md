# Feature: In Arbeit wird nach Punkten ausgesucht

**Status:** umgesetzt am 30.08.2026 um 21:45, [PR #64](https://github.com/ThomasPaulus21107/VocApp/pull/64)
**Wo im Code:** `src/domain/auswahl.js`, `src/domain/lernstand.js`, `src/app.js`

Die dritte Fassung der Kartenauswahl. Die erste zog reinen Zufall, die zweite
sortierte nach Alter und teilte die Runde in
[Fächer](feature-auswahl-2026-08-29-1327.md) — diese hier entscheidet, **wer
innerhalb des größten Fachs drankommt.**

## Die Quote: 5 / 7 / 3 wird 6 / 8 / 1

```
nie:     6   ██████████
arbeit:  8   █████████████
sicher:  1   ██
             = 15
```

**Was sitzt, muss nicht dreimal die Woche vorgeführt werden.** Der eine Platz
für „sicher" bleibt, damit stabile Vokabeln nicht ganz verschwinden und ein
Abrutschen auffällt; die zwei frei gewordenen gehen dorthin, wo etwas zu holen
ist.

## Eine Zahl, die beides trägt

`summenVon()` in `lernstand.js` rechnet alle bisherigen Einzelergebnisse einer
Vokabel zu **einer** Zahl zusammen — 1 auf Anhieb, 0,5 im zweiten Versuch,
−0,1 für einen Tipp.

Warum nicht der Score: der sagt, wie **gut** es lief, die Zahl der Antworten,
wie **oft**. Die Summe trägt beides in sich, weil jede Antwort sie um ihren
eigenen Wert weiterschiebt. Zwanzig knappe Runden stehen damit über zwei
glatten.

## Sechs benannte Plätze, zwei gewürfelte

Der Korb „in Arbeit" wird nach der Summe sortiert und dann in dieser
Reihenfolge abgeräumt:

| Platz | wer das ist |
|---|---|
| `top1` | die höchste Summe — läuft gut, sitzt aber noch nicht |
| `last1` | die niedrigste — die härteste Vokabel |
| `mid1` | die Mitte |
| `top2`, `last2`, `mid2` | die jeweils nächste |

Die restlichen zwei Plätze werden aus demselben Fach gewürfelt.

**Gebaut als Umsortieren des Korbs, nicht als zweiter Auswahlweg.** `nimm()`
nimmt weiter von vorn, überspringt weiter Karten, die schon in der Runde
stehen, und freie Plätze rücken weiter nach. Die Fächer „nie" und „sicher"
bleiben nach Alter sortiert — dort ist die Abdeckung die Aufgabe, nicht das
Können.

Fällt das Fach kleiner aus als sechs Einträge, fallen Stellen zusammen (bei
drei ist `top1` zugleich `last2`). Das fängt ein Set ab; die Runde läuft dann
mit weniger benannten Plätzen voll. Ein Sonderfall ist das nicht, nur ein
kleines Fach.

## Der Haken, den man erst nach Wochen sieht

**Die Summe wächst mit jeder Antwort und schrumpft fast nie.** Wer oben steht,
steht morgen wieder oben — die benannten Plätze zeigen über Runden hinweg oft
dieselben Vokabeln, solange sich zwei Summen nicht überkreuzen.

Das ist der Preis dafür, dass „oft geübt" mitzählt. Dagegen halten die zwei
gewürfelten Plätze und das Fach „nie". Der Satz steht auch im Code, damit
niemand ihn in vier Wochen als Fehler diagnostiziert.

**Der nächste Schritt ist deshalb schon benannt**, aber ausdrücklich nicht
heute gebaut: eine einfachere Zahl, die Score und Zahl der Versuche
zusammenfasst, ohne monoton zu wachsen. Siehe [Backlog](../backlog.md).

## Die Abnahme

In `tests/auswahl.test.js`:

- Die sechs Plätze kommen in genau dieser Reihenfolge — an einem Fach aus elf
  Einträgen nachgerechnet.
- Die restlichen Plätze werden aus demselben Fach aufgefüllt, ohne dass eine
  Karte doppelt kommt.
- Ein Fach, das kleiner ist als die benannten Plätze, liefert trotzdem jede
  Karte genau einmal.
- Eine Vokabel mit 0 Punkten ist dabei — dafür gibt es `last1`.
- Die Quote ergibt zusammen fünfzehn. Wer eine Zahl ändert, merkt es hier.

## Voraussetzung

[Der Lernstand je Vokabel](feature-lernstand-2026-08-29-1531.md) — ohne die
Zähler gäbe es keine Summe.
