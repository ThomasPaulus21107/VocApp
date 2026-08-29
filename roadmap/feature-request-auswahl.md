# Feature: Welche Karten drankommen

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/auswahl.js` — neu, dazu `src/domain/modus.js`, `src/app.js`

Heute zieht `zieheRunde` reinen Zufall: mischen, die ersten 15 nehmen. Die
Runde hat kein Gedächtnis. Wer gestern an `caught` gescheitert ist, sieht es
heute mit derselben Wahrscheinlichkeit wie `to put` — und manche Karten sieht
sie wochenlang gar nicht.

## Die Zahlen

53 Verben, 15 Karten je Runde. Die Chance, dass eine bestimmte Karte in einer
Runde **nicht** drankommt, ist 38/53 = 0,72.

| Nach … Runden | noch nie gesehen |
|---|---|
| 3 | 37 % — rund 20 Verben |
| 5 | 19 % — rund 10 Verben |
| 10 | 4 % — rund 2 Verben |

Bis wirklich jedes Verb einmal dran war, dauert es im Schnitt **16 Runden**.
Fünf Runden sind etwa eine Woche Üben — danach sind zehn Verben unberührt,
und zwar zufällig ausgewählte, nicht die leichten.

Für eine Vokabelarbeit über 53 Verben ist das der falsche Weg.

## Zwei Anforderungen, die gegeneinander ziehen

1. **Alle kommen dran.** Kein Verb darf durchrutschen.
2. **Die schweren öfter.** Was nicht sitzt, muss häufiger kommen als das, was
   von Anfang an saß.

Nur Gewichtung verletzt (1): eine leichte Karte käme dann monatelang nicht
mehr, und vergessen wird auch Leichtes. Nur Abdeckung verletzt (2). Es braucht
beides in einer Formel.

## Stufe 1: der Beutel

Ohne jede Verlaufsdaten, sofort baubar.

Alle 53 Karten liegen in einem Beutel. Eine Runde zieht 15 heraus **und legt
sie nicht zurück**. Die nächste Runde zieht aus den verbliebenen 38, dann aus
23, dann aus 8 — und wenn der Beutel leer ist, wird er neu gefüllt.

Damit ist nach **vier Runden garantiert jedes Verb einmal dran gewesen**,
nicht im Schnitt nach sechzehn. Innerhalb einer Runde bleibt alles zufällig.

Der Beutel ist eine Liste von ids und überlebt bestenfalls das Neuladen. Er
darf deshalb in den Browser — er ist wegwerfbar: geht er verloren, wird neu
gemischt, und niemand verliert etwas.

## Stufe 2: gewichtet ziehen

Sobald es einen Lernstand gibt, bekommt jede Einheit ein Gewicht:

```js
gewicht = GRUNDWERT
        + SCHWERE  * schwierigkeit(ereignisse)   // 0 … 1
        + VERGESSEN * rundenSeitZuletzt          // wächst unbegrenzt
```

Gezogen wird **gewichtet ohne Zurücklegen** — nicht einfach „die 15
schwersten". Der Unterschied ist wichtig: eine feste Bestenliste ergibt jede
Runde fast denselben Stapel, und Üben wird zum Auswendiglernen der Reihenfolge.

Der dritte Summand ersetzt den Beutel: weil er unbegrenzt wächst, wird jede
lange nicht gesehene Karte irgendwann fast sicher gezogen. Abdeckung ist damit
keine Sonderregel, sondern fällt aus derselben Formel.

**Die Einheit ist Karte plus Form**, nicht die Karte: `to write` kann im
simple past sitzen und im Partizip nicht.

`auswahl.js` bleibt eine reine Funktion, und der Zufall wird hereingereicht
(`zufall = Math.random`) — genau wie bei `mische` und `zieheRunde`, damit der
Test das Ergebnis vorhersagen kann.

## Der Deckel: eine Runde darf nicht nur wehtun

Wenn die Gewichtung zu scharf ist, bekommt sie fünfzehn Karten, die sie alle
nicht kann, und am Ende eine Fünf. Zweimal so, und die App bleibt zu.

Deshalb ein Verhältnis-Deckel: **die schwerste Karte ist höchstens viermal so
wahrscheinlich wie die leichteste.** Damit sind in jeder Runde ein paar dabei,
die sitzen. Die Zahl ist ein `const` in `auswahl.js` und darf sich beim
Ausprobieren ändern.

## Nur im Übungsblatt gewichtet

Das ist die Falle, die man erst beim Nachrechnen sieht: **eine gewichtete
Runde ist schwerer als eine zufällige, also ist ihre Note nicht mehr
vergleichbar.** Wer fleißig übt, bekommt schlechtere Noten — und für die
Punkte, die später über mehrere Nutzer hinweg sichtbar sein sollen, wäre das
tödlich.

Die Lösung passt in eine Zeile, weil `modus.js` genau dafür gebaut ist:

```js
auswahlGewichtet   Kommen schwere Karten häufiger dran?
```

`UEBUNGSBLATT: true` — dort wird gelernt, dort soll es wehtun, wo es nötig ist.
`ARBEIT: false` — dort wird gemessen, und eine Messung mischt nicht nach.

Die Abdeckung (Stufe 1) gilt dagegen in **beiden** Modi. Sie macht die Runde
nicht schwerer, nur vollständiger.

## Voraussetzungen

- Stufe 1: **keine.** Eine Liste von ids, mehr braucht der Beutel nicht.
- Stufe 2: der gespeicherte Lernstand je Karte und Form. Ohne Verlaufsdaten
  gibt es keine Schwierigkeit — dann fällt der mittlere Summand weg, und die
  Formel verhält sich wie der Beutel. **Der erste Start ist damit definiert**
  und braucht keine Sonderbehandlung.

## Zu beachten

- **Nicht mit der [Lernpotential-Runde](feature-implemented-lernpotential-2026-08-24-2211.md)
  verwechseln.** Die holt zurück, was in *dieser* Runde danebenging, sofort.
  Hier geht es darum, was *nächste* Runde drankommt. Zwei verschiedene Fragen,
  zwei Dateien.
- **Auch nicht mit Leitner.** Leitner terminiert Karten auf ein Datum („erst in
  drei Tagen wieder"). Hier wird nur relativ gewichtet, ohne Kalender. Wer
  später Leitner will, ersetzt die Gewichtsformel — das Ziehen selbst bleibt.
- **`to read` regelt sich von allein.** Die Karte, die in allen drei Formen
  gleich ist, wird als leicht eingestuft und verliert an Gewicht. Der Eintrag
  im `backlog.md` erledigt sich damit teilweise.
- **Kein `new Date()` in der Domäne.** Gezählt wird in Runden, nicht in Tagen.
  Sollte je ein Datum nötig werden, kommt es von außen herein.
