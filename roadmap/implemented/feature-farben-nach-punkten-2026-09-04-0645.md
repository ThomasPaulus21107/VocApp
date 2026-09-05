# Feature: Eine Farbe je Vokabel

**Status:** umgesetzt am 04.09.2026 um 06:45, [PR #67](https://github.com/ThomasPaulus21107/VocApp/pull/67)
**Wo im Code:** `src/domain/lernstand.js`, `src/domain/modus.js`, `src/app.js`,
`src/fortschritt.js`, `fortschritt.html`, `src/ui/styles.css`

Die Fortschrittsseite zeigte drei Fächer in drei Farben. Was sie nicht zeigte:
**dass sich innerhalb eines Fachs etwas bewegt.** Eine Woche Üben konnte
vergehen, ohne dass der Balken anders aussah.

## Die Skala: elf Stufen auf der Punktsumme

`farbstufe(summe)` in `lernstand.js`. Gerechnet wird mit **allen
Einzelergebnissen zusammen**, nicht mit dem Score:

```
dreimal mit 0,5 abgeschlossen  ->  1,5   Mitte
fünfmal voll getroffen         ->  5,0   über dem Deckel
```

| Stufe | Punktsumme | Farbe |
|---|---|---|
| 0 | ≤ 0 | rot |
| 1–9 | in zehn gleichen Schritten bis 3,0 | rot → orange → grün |
| 10 | ≥ 3,0 (`TIEFGRUEN_AB`) | tiefgrün |

**Warum die Summe und nicht der Score:** 100 Prozent aus einer einzigen Antwort
sind kein Beweis, sondern ein Zufall. Die Summe wächst nur, wenn wirklich geübt
wurde — sie trägt beides in sich, wie gut es lief und wie oft.

**Schon ein Hauch von Punkten hebt auf Stufe 1.** „Hat angefangen" soll man
sehen; sonst sähe die Vokabel, die einmal halb saß, aus wie die, die nie dran
war.

## Der Balken ist jetzt eine Skala, keine Fächer

Vorher drei Blöcke — sitzt, in Arbeit, nie dran. Jetzt **eine Leiste, sortiert
von tiefgrün links nach rot rechts**, ein Stück je Stufe, so breit wie sein
Anteil.

Darin steckt der eigentliche Zweck: **nach jeder Runde wandert die Grenze ein
Stück nach links.** Fortschritt ist nichts mehr, was man aus Zahlen erschließen
muss — man sieht ihn.

Die Fächer sind damit nicht weg, sie stehen weiter als Listen darunter. Nur der
Balken erzählt eine andere Geschichte als sie.

## Dieselbe Farbe in den Listen

Vor jeder Vokabel steht ein Punkt in **genau dem Ton, den sie im Balken
beiträgt.** Wer oben ganz rechts eine rote Kante sieht, findet die dazugehörigen
Wörter unten an ihren roten Punkten wieder. Ohne das wären es zwei getrennte
Darstellungen desselben Standes.

## Nachtrag am selben Tag: die Prozentzahl gehoert zur Farbe

Hinter jeder Vokabel stand eine Prozentzahl, und sie war der **Score** — der
Anteil der möglichen Punkte. Neben dem neuen Farbpunkt ergab das Widersprüche,
die niemand auflösen konnte:

> `sein · simple past` — roter Punkt, **100 %**

Beides stimmte. Der Punkt las die Punktsumme (0,9 — kaum etwas geholt), die
Zahl den Score (eine einzige Antwort, die saß). Zwei Maße, eine Zeile.

**Seit dem 04.09.2026 zeigt die Zahl dasselbe wie die Farbe:** `reifegrad()`
rechnet die Punktsumme gegen den Deckel, **3,0 Punkte sind 100 %**, darüber
wird nicht weitergezählt. Der rote Punkt oben steht jetzt neben 30 %.

`score()` ist damit nicht abgeschafft — die Fächer-Einteilung hängt weiter
daran, und dort ist er richtig: „hat sie getroffen, wenn sie drankam" ist eine
andere Frage als „hat sie genug gesammelt".

**Auf der Seite stehen deshalb zwei Prozentzahlen, die verschiedene Dinge
meinen.** Damit das niemand gegeneinander rechnet, sagt der Satz oben jetzt
„über 75 % der **möglichen** Punkte getroffen", und unter dem Balken steht eine
Zeile, die die Zahl hinter den Vokabeln erklärt.

## Nachtrag am 05.09.2026: die dritte Zahl wird ein Punkt

Eine Prozentzahl stand noch woanders — **aufgeklappt, hinter jeder einzelnen
Antwort.** Beim Nachlesen einer Sitzung standen damit zwei Zahlen untereinander,
die verschiedene Bezugsgrößen hatten: im Kopf der Zeile der Reifegrad der
Vokabel, darunter der Wert einer Antwort. Derselbe Fehler wie oben, eine Ebene
tiefer.

**Auch das ist jetzt ein Punkt.** `antwortstufe(punkte)` in `lernstand.js`
rechnet dieselben elf Töne, nur mit dem Deckel **einer Antwort**:

```
ANTWORT_MAX = BONUS_ARBEIT = 1,2
```

Zwei Deckel auf einer Skala, und das ist der ganze Unterschied: `farbstufe()`
misst, was eine Vokabel über Wochen gesammelt hat (3,0), `antwortstufe()` misst
einen einzigen Moment (1,2).

**Eine perfekte Antwort im Übungsblatt wird damit Stufe 9 von 10 und nicht
tiefgrün** — gewollt. Tiefgrün ist der stärkere Befund: ohne Tipp, ohne zweite
Chance, ohne Rückmeldung getroffen. Genau dafür gibt es den Bonus, und hier
sieht man ihn zum ersten Mal.

**Die Zahl ist nicht weg, sie ist leise geworden:** als `title` fürs Zeigen mit
der Maus und als `aria-label` für den Screenreader — „1 von 1,2 Punkten". Ohne
die beiden bliebe von der Zeile für ihn nur Datum und Vermerk übrig; eine Farbe
allein sagt niemandem etwas, der sie nicht sieht.

## Zwanzig Prozent Bonus in der Arbeit

`BONUS_ARBEIT` und `lernpunkte()` in `modus.js`. In der Arbeit gibt es keinen
Tipp, keine zweite Chance und keine Rückmeldung — **wer eine Vokabel dort
trifft, kann sie**, und das ist ein stärkerer Befund als dieselbe Vokabel im
Übungsblatt.

**Nur im Lernstand.** Die Runde selbst zählt weiter ohne Bonus, sonst gäbe es
18 von 15 Punkten und eine Note besser als 1. Was der Bonus dagegen sehr wohl
erreicht: er zählt in den **Wochen- und Gesamtpunkten** mit, denn die kommen
aus denselben Ereignissen. Eine Arbeit ist damit auch dort mehr wert als ein
Übungsblatt — das ist gewollt.

Gerundet wird auf zwei Stellen: `0,9 * 1,2` ergibt in Gleitkomma
`1.0799999999999998`, und diese Zahl landete so in Postgres.

## Die Abnahme

- `farbstufe()` in `tests/lernstand.test.js`: rot bei 0 und bei Minuspunkten,
  Stufe 1 schon bei 0,1, Deckel bei 3,0 — und die beiden Beispiele aus dem
  Gespräch (1,5 in der Mitte, 1,0 auf einem Drittel).
- `lernpunkte()` in `tests/modus.test.js`: Übungsblatt unverändert, Arbeit mal
  1,2, null bleibt null, der Gleitkomma-Rest ist weggerundet, und ein
  unbekannter Modus bekommt keinen Bonus.
- Angesehen statt nur gebaut: Balken und Listen im iPhone-Format gerendert.

## Was daran offen bleibt

**Der Deckel bei 3,0 ist eine Entscheidung und keine Wahrheit.** Er ist
erreicht, wenn eine Vokabel dreimal sauber saß. Ob das die richtige Hürde ist,
zeigt sich erst nach ein paar Wochen — die Zahl steht als `TIEFGRUEN_AB` an
einer Stelle.

Und: Stufe 0 ist rot für „noch nie dran" **und** für „dreimal danebengegangen".
Beides ist rot, weil beides null Punkte hat. Wer die zwei unterscheiden will,
braucht eine zweite Dimension — heute sagt das nur die Liste darunter.

## Voraussetzung

[Der Lernstand je Vokabel](feature-lernstand-2026-08-29-1531.md) — ohne die
Summe gäbe es nichts zu färben.
