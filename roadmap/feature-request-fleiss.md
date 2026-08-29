# Feature: Dein Fleiß

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `fleiss.html`, `src/fleiss.js` — neu, dazu `src/domain/lernstand.js`

Eine zweite Statistikseite neben
[Dein Fortschritt](implemented/feature-fortschritt-2026-08-29-1531.md). Die
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

Der [Lernstand](implemented/feature-lernstand-2026-08-29-1531.md) bekommt ein
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

## Später

- **Streak über Wochen** und was daraus folgt: siehe `backlog.md` unter Punkte.
- **Nach Modus trennen** — im Verlauf steht schon, ob eine Antwort im
  Übungsblatt oder in der Arbeit fiel. Eine Arbeit an einem Tag sagt mehr als
  fünf Übungsrunden.
