# Feature: Dein Fleiß

**Status:** umgesetzt am 29.08.2026 um 15:51, [PR #28](https://github.com/ThomasPaulus21107/VocApp/pull/28)
**Wo im Code:** `fleiss.html`, `src/fleiss.js`, dazu `fleiss()` und `serie()` in `src/domain/lernstand.js`

Eine zweite Statistikseite neben
[Dein Fortschritt](feature-fortschritt-2026-08-29-1531.md). Die
zeigt, **was** sitzt. Diese zeigt, **wann geübt wurde** — an welchem Tag wie
viel, und wie gut es an dem Tag lief.

## Warum das eine eigene Seite ist

Es sind zwei verschiedene Fragen, und sie trösten auch verschieden. „Von 106
Formen sitzen 15" ist ein Zustand und kann an einem schlechten Tag entmutigen.
„Du hast an 21 von 30 Tagen geübt" ist eine Leistung, und die kann einem
niemand mehr wegnehmen.

## Was darauf steht

Ein **Balkendiagramm über die letzten 30 Tage**. Ein Balken je Tag, die Höhe
ist die Zahl der Antworten. Der Balken ist zweigeteilt: der grüne Teil unten
sind die Treffer, der Rest ging daneben. Damit stehen Menge und Trefferquote
in einem Bild, ohne zweites Diagramm daneben.

Tage ohne Üben bekommen einen Strich statt eines Balkens. **Ein Diagramm, das
nur die guten Tage kennt, zeigt keinen Fleiß.**

Dazu vier Zahlen: geübte Tage von 30, Antworten insgesamt, Trefferquote
insgesamt, und der beste Tag.

Ganz oben steht die **Serie** — wie viele Tage am Stück zuletzt geübt wurde,
heute mitgezählt.

## Der Speicher zählt jetzt auch Tage

Der [Lernstand](feature-lernstand-2026-08-29-1531.md) bekommt ein
Feld `tage`: je Datum die Zahl der Antworten, der Treffer und die Summe der
Punkte.

Der Verlauf der letzten 750 Antworten hätte dafür **nicht** gereicht. Wer viel
übt, verliert dort die alten Tage nach zwei Wochen — und ausgerechnet die
Rückschau braucht die alten Tage. Ein Tag kostet ein paar Dutzend Byte, ein
ganzes Jahr also weniger als eine gespielte Runde.

Aufgehoben werden 400 Tage (`TAGE_MAX`). Was älter ist, fällt vorne heraus.

## Welcher Tag ist heute?

Die Domäne darf die Uhr nicht kennen. Der Tag kommt deshalb als Text
`JJJJ-MM-TT` von außen herein — aus `app.js` beim Verbuchen, aus `fleiss.js`
beim Anzeigen. Beide benutzen `toLocaleDateString('sv')`, das dieses Format in
der **Zeitzone des Geräts** liefert: eine Runde um halb eins nachts gehört noch
zum Vortag, so wie Matilda es auch empfinden würde.

## Zu beachten

- **Auf dem Telefon sind 30 Balken schmal.** Deshalb keine Beschriftung je
  Tag, sondern nur erstes und letztes Datum unter dem Diagramm. Wer genau
  hinsehen will, hält auf einen Balken.
- **Der Maßstab ist der beste Tag**, nicht eine feste Zahl. Bei einer Runde am
  Tag wäre ein fester Maßstab ein Diagramm aus lauter Stummeln.
- Die Serie ist hier **beschreibend**, nicht belohnend. Sie zählt Tage und
  vergibt keine Punkte — die Frage „was ist ein Punkt?" aus dem Backlog wird
  damit nicht vorweggenommen.

## Wie es geworden ist

Gebaut wie beschrieben. Zwei Dinge sind unterwegs dazugekommen:

**Die Balken sind Knöpfe.** Geplant war „wer genau hinsehen will, hält auf
einen Balken" — als `title`-Tooltip gebaut, und der braucht Hover. Auf dem
iPhone gibt es keinen: ausgerechnet auf dem Hauptgerät war der einzelne Tag
damit nicht zu lesen. Jetzt ist jeder Tag ein `<button>`, und der angetippte
schreibt sich in eine Zeile unter das Diagramm. Die Trefferfläche ist die
ganze Säule und nicht nur der gefärbte Teil — bei 30 Tagen nebeneinander ist
eine Spalte schmal, in der Höhe holt sie zurück, was ihr in der Breite fehlt.

Am Container darf deshalb **kein `role="img"`** stehen. Das hatte die erste
Fassung, und es hätte die Knöpfe für einen Screenreader zu einem einzigen
Bild verschmolzen. Jetzt ist es eine `role="group"`, und jeder Knopf trägt
seinen Satz als `aria-label`.

**Der Weg hierher ist kürzer.** Unter der Ergebnisliste am Ende einer Runde
stehen seit dem 29.08. zwei Links auf diese Seite und auf den Fortschritt.
Vorher führte der Weg nur über das Seitenmenü — ausgerechnet in dem Moment,
in dem man wissen will, wie es insgesamt steht, war er am weitesten.

### Jede Runde einzeln, unter dem Diagramm

Am 29.08.2026 dazugekommen: unter dem Balkendiagramm steht jede Runde als
eigene Zeile — wann sie anfing, ob Übungsblatt oder Arbeit, wie viele
Antworten, welche Quote, und ein liegender Balken dazu. Das Diagramm sagt, an
welchen **Tagen** geübt wurde; diese Liste sagt, **wann genau und wie es lief**.

Der Balken zeigt **nur die Quote**, volle Breite sind 100 %. Der erste Anlauf
maß zwei Größen gleichzeitig — Länge gleich Antwortzahl, grüner Teil gleich
Treffer — und war damit unlesbar: eine Runde mit 45 Antworten und 91 % hatte
einen kürzeren grünen Balken als eine mit 75 Antworten und 59 %. Wie viel
beantwortet wurde, steht als Zahl daneben und muss nicht zweimal dastehen.

**Die Runden werden aus dem Verlauf zurückgerechnet**, denn eine Rundennummer
schreibt er nicht mit. Eine neue Runde fängt an, wenn der Modus wechselt, wenn
eben die Wiederholung lief und jetzt nicht mehr, wenn die laufende Runde ihre
15 Karten voll hat, oder wenn eine lange Pause dazwischenliegt. Die
Wiederholung zählt zur Runde davor und macht sie **nicht** voll — sie zieht
keine neuen Karten.

Ein mitgeschriebenes Feld wäre einfacher gewesen, hätte aber nur für Neues
gegolten; so gilt es auch für den Bestand. **Sollte die Rundengröße einmal
schwanken (Leitner), trägt die Rechnung nicht mehr** — das steht als Warnung
an `runden()`.

## Was noch offen ist

**Bis zum 29.08.2026 öffnete kein Test diese Seite.** Geprüft war nur die
Domäne darunter (`fleiss()` und `serie()` in `lernstand.js`), `src/fleiss.js`
selbst gar nicht — derselbe blinde Fleck wie bei der Fortschrittsseite. Seit
[Wie die Oberfläche getestet wird](feature-ui-tests-2026-08-29-1943.md) spielt
`tests/oberflaeche/seiten.test.js` eine Runde und sieht danach hier nach: die
dreißig Balken, die Zahlen, die Rundenliste und was ein angetippter Balken
erzählt.

## Später

- **Streak über Wochen** und was daraus folgt: siehe [`backlog.md`](../backlog.md) unter Punkte.
- **Nach Modus trennen** — im Verlauf steht schon, ob eine Antwort im
  Übungsblatt oder in der Arbeit fiel. Eine Arbeit an einem Tag sagt mehr als
  fünf Übungsrunden.
