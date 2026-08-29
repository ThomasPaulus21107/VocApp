# Feature: Welche Karten drankommen

**Status:** Stufe 1 umgesetzt am 29.08.2026 um 13:27, [PR #20](https://github.com/ThomasPaulus21107/VocApp/pull/20)
**Offen:** Stufe 2 — die Gewichtung nach Schwierigkeit
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

Nur Gewichtung verletzt (1): eine leichte Karte käme monatelang nicht mehr,
und vergessen wird auch Leichtes. Nur Abdeckung verletzt (2). Es braucht
beides — und es passt in **eine** Formel.

## Das Gedächtnis ist keine Liste, sondern eine Zahl je Karte

Umgeschrieben am 29.08.2026. Vorher stand hier ein „Beutel", aus dem gezogen
und der nachgefüllt wird. Das war umständlicher als nötig.

Gespeichert wird stattdessen, **wann eine Karte zuletzt dran war**:

```js
{ rundeNr: 27, zuletzt: { "uv-001|simple-past": 26, "uv-002|infinitive": 19, … } }
```

Der Beutel ist damit kein Ding mehr, sondern eine Sortierung: **nimm die 15,
die am längsten nicht dran waren, bei Gleichstand würfle.** Was noch nie dran
war, zählt als unendlich alt und steht ganz vorne.

**Die Sortierung hat zwei Stufen** — das ist beim Bauen am 29.08.2026
herausgekommen und stand vorher nicht hier. Erst zählt, wie lange die
**Karte** nicht dran war, dann die **Form**. Sortiert man nur nach der Form,
sieht die noch ungefragte zweite Form einer eben gezogenen Karte genauso alt
aus wie ein Verb, das noch nie dran war — beide stehen ja nicht im Merkzettel.
Dann rutschen wieder ganze Verben durch, und genau das sollte aufhören.

Mit beiden Stufen gilt: **nach vier Runden war jedes Verb einmal dran, nach
acht jede seiner abgefragten Formen.** Ohne die erste Stufe waren es nach drei
Runden nur 36 von 53 Verben statt 45.

Drei Dinge werden dadurch einfacher:

- **Die hässliche Kante verschwindet.** 53 geht nicht durch 15 auf. Ein echter
  Beutel läuft in Runde vier mit acht Karten leer und muss sieben aus dem
  frisch gefüllten nachziehen, die dann in Runde fünf nicht wiederkommen
  dürfen. Hier läuft nichts leer: die sieben Nachgezogenen haben danach die
  jüngste Rundennummer und stehen von selbst hinten an. Die Abdeckung nach
  vier Runden gilt trotzdem.
- **Es ist kein veränderlicher Zustand**, sondern eine Beobachtung. Sie kann
  nicht in einen unmöglichen Zustand geraten.
- **Es ist dasselbe Feld, das die Statistik ohnehin führt** — siehe
  [Der Lernstand](feature-request-lernstand.md). Zwei Features, ein Datensatz.

## Eine Formel für beide Stufen

```js
gewicht = ALTER    * (rundeNr - zuletzt)      // Abdeckung
        + SCHWERE  * schwierigkeit(statistik) // 0 … 1, erst ab Stufe 2
```

**Stufe 1** ist diese Formel mit `SCHWERE = 0`: nur Abdeckung, kein Lernstand
nötig. **Stufe 2** schaltet den zweiten Summanden zu, sobald die Statistik da
ist. Kein Umbau, eine Konstante.

Weil der erste Summand unbegrenzt wächst, wird jede lange übergangene Karte
irgendwann fast sicher gezogen — Abdeckung ist keine Sonderregel, sondern
fällt aus der Formel. Und der Fall „noch gar keine Daten" verhält sich
automatisch wie Stufe 1. **Der erste Start ist damit definiert** und braucht
keine Sonderbehandlung.

Gezogen wird **gewichtet ohne Zurücklegen**, nicht „die 15 schwersten". Eine
feste Bestenliste ergäbe jede Runde fast denselben Stapel, und Üben würde zum
Auswendiglernen der Reihenfolge.

**Die Einheit ist Karte plus Form**, nicht die Karte: `to write` kann im
simple past sitzen und im Partizip nicht.

## Die Aufteilung

```js
// domain/auswahl.js -- rein, kein Speicher, Zufall injiziert
zieheRunde(karten, anzahl, zuletzt, rundeNr, zufall = Math.random)
```

```js
// app.js -- der einzige Ort, der beides kennt
const stand = storage.lesen('auswahl', { rundeNr: 0, zuletzt: {} });
stapel = zieheRunde(verben.karten, RUNDENGROESSE, stand.zuletzt, stand.rundeNr);
// danach: rundeNr + 1, die gezogenen ids darauf setzen, speichern
```

Die Domäne erfährt nie, woher `zuletzt` kommt. Später liefert es Postgres per
`max(gespielt_am) group by karten_id` statt `localStorage` — **die Funktion
ändert sich dabei um keine Zeile.** Das ist die Naht.

`mische` und das bisherige `zieheRunde` in `pruefung.js` bleiben unangetastet,
damit die bestehenden Tests grün bleiben. Geändert wird die eine Aufrufstelle
in `app.js`.

## Der Deckel: eine Runde darf nicht nur wehtun

Wenn die Gewichtung zu scharf ist, bekommt sie fünfzehn Karten, die sie alle
nicht kann, und am Ende eine Fünf. Zweimal so, und die App bleibt zu.

Deshalb ein Verhältnis-Deckel: **die schwerste Karte ist höchstens viermal so
wahrscheinlich wie die leichteste.** Damit sind in jeder Runde ein paar dabei,
die sitzen. Die Zahl ist ein `const` und darf sich beim Ausprobieren ändern.

## Nur im Übungsblatt gewichtet

Die Falle, die man erst beim Nachrechnen sieht: **eine gewichtete Runde ist
schwerer als eine zufällige, also ist ihre Note nicht mehr vergleichbar.** Wer
fleißig übt, bekäme schlechtere Noten — und für Punkte, die später über
mehrere Nutzer hinweg sichtbar sein sollen, wäre das tödlich.

Die Lösung passt in eine Zeile, weil `modus.js` genau dafür gebaut ist:

```js
auswahlGewichtet   Kommen schwere Karten häufiger dran?
```

`UEBUNGSBLATT: true` — dort wird gelernt, dort soll es wehtun, wo es nötig ist.
`ARBEIT: false` — dort wird gemessen, und eine Messung mischt nicht nach.

Die Abdeckung gilt dagegen in **beiden** Modi. Sie macht die Runde nicht
schwerer, nur vollständiger.

## Voraussetzungen

- **Stufe 1:** [Die Speicher-Naht am Gerät](feature-implemented-storage-2026-08-29-1327.md). Ein
  Gedächtnis, das das Schließen des Browsers überlebt, geht nicht ohne sie —
  und genau darum geht es hier: eine Übungssitzung hat zwei bis drei Runden,
  das Abdeckungsproblem baut sich über Tage auf. Der Beutel ist damit der
  zweite Kunde der Naht, neben dem Töne-Schalter.
- **Stufe 2:** [Der Lernstand](feature-request-lernstand.md), Stufe 1 (lokal).
  Ohne Statistik gibt es keine Schwierigkeit, und `SCHWERE` bleibt auf null.

## Was davon noch offen ist

Gebaut ist **Stufe 1**: die Abdeckung. Nach vier Runden war jedes Verb einmal
dran, nach acht jede seiner abgefragten Formen.

**Stufe 2 fehlt** — die Gewichtung nach Schwierigkeit, und damit auch die
Zeile `auswahlGewichtet` in `modus.js` und der Verhältnis-Deckel. Die
Voraussetzung dafür steht inzwischen: der
[Lernstand](feature-request-lernstand.md) zählt, was danebengeht. Es fehlt
nur noch der zweite Summand in der Formel.

## Zu beachten

- **`zuletzt` ist wegwerfbar.** Geht es verloren, sehen alle Karten gleich alt
  aus, es wird zufällig gezogen, und nach vier Runden ist der Zustand von
  selbst wiederhergestellt. Es darf deshalb ohne Bedenken in `storage.js`.
- **Nicht mit der [Lernpotential-Runde](feature-implemented-lernpotential-2026-08-24-2211.md)
  verwechseln.** Die holt zurück, was in *dieser* Runde danebenging, sofort.
  Hier geht es darum, was *nächste* Runde drankommt.
- **Auch nicht mit Leitner.** Leitner terminiert Karten auf ein Datum („erst in
  drei Tagen wieder"). Hier wird in Runden gerechnet, ohne Kalender. Wer später
  Leitner will, ersetzt die Gewichtsformel — das Ziehen bleibt.
- **`to read` regelt sich von allein.** Die Karte, die in allen drei Formen
  gleich ist, wird als leicht eingestuft und verliert an Gewicht.
- **Kein `new Date()` in der Domäne.** Gezählt wird in Runden, nicht in Tagen.
