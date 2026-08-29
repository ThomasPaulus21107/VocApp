# Feature: Der Moment nach der Runde

**Status:** umgesetzt am 25.08.2026 um 22:12
**Wo im Code:** `index.html`, `src/ui/ui.js`, `src/ui/klang.js`,
`src/ui/effekte.js` — neu, `src/ui/styles.css`, `src/app.js`

Zwei Dinge, die denselben Augenblick betreffen: den Übergang von der Übung in
die Wiederholung, und die Belohnung für eine sehr gute Runde. Beides ist
Oberfläche und Ton, keine Regel — die Note ändert sich durch nichts davon.

## 1. Die Zwischenseite

Heute läuft nach der letzten Karte die
[Lernpotential-Runde](feature-lernpotential-2026-08-24-2211.md)
direkt an. Sichtbar ist das nur am Zähler oben und an einem Satz in der
Rückmeldungszeile — wer gerade tippt, übersieht beides.

Der Wechsel ist aber ein echter Einschnitt: **ab hier zählt nichts mehr.** Die
Note steht, die Ergebnisliste steht, es geht nur noch ums Können.

**Was gebaut wird:** ein eigener Abschnitt `<section id="zwischen">` in
`index.html`, wie `#start` und `#ende` schon einer ist. Darauf:

- „Die Runde ist durch." als Überschrift
- „Vier Karten haben noch Lernpotential." — die Zahl kommt aus `app.js`
- ein Knopf, der die zweite Runde startet
- ein **positiver Signalton** beim Erscheinen: eine sechste Melodie in
  `klang.js`, etwa `spiele('runde-geschafft')`

**Wichtig: keine Punkte, keine Note auf dieser Seite.** Wer hier schon die Note
sieht, spielt die Wiederholung nicht mehr ernsthaft. Die Zahl der offenen
Karten ist alles, was gezeigt wird.

**Wenn alles richtig war**, gibt es keine Zwischenseite — dann geht es wie
heute direkt zur Note. Es gäbe nichts anzukündigen. In der Arbeit gibt es sie
ohnehin nicht, dort gibt es keine Wiederholung.

Der einmalige Hinweissatz auf der ersten Wiederholungskarte in `ui.zeigeKarte`
wird damit überflüssig und kann weg — die Zwischenseite sagt es besser.

## 2. Spezialeffekte für die Spitzennoten

Für die drei besten Ergebnisse je ein eigener Effekt auf dem Ende-Bildschirm:

| Punkte | Note | Effekt |
|---|---|---|
| 15 | 1+ | **Rakete** — startet unten, fliegt nach oben aus dem Bild, mit Funkenspur |
| 14 | 1 | **Konfetti** — bunte Schnipsel fallen und taumeln |
| 13 | 1− | **Sternenregen** — Funken springen aus der Note heraus und verglühen |

Andere Ideen, falls Matilda lieber etwas anderes will: Feuerwerk (Punkte, die
aus einem Zentrum wegfliegen), Luftschlangen, ein Pokal, der hereinfällt und
wackelt, oder die Note selbst, die pulsiert und die Farbe wechselt.

### Wie es gebaut wird

Eine neue Datei `src/ui/effekte.js`, die zweite Schwester von `klang.js`: sie
bekommt einen Namen gesagt (`zeige('rakete')`) und entscheidet nichts selbst.

- **Reines DOM und CSS**, kein Canvas, keine neue Abhängigkeit. Ein Schnipsel
  ist ein `<span>` mit `transform` und `@keyframes`, dreißig davon mit
  versetztem `animation-delay` sind das Konfetti.
- **Kein `innerHTML`.** Das Teilchen steht als `<template>` in `index.html` und
  wird geklont — dieselbe Regel wie bei der Ergebnisliste.
- **Hinterher aufräumen:** die Elemente bei `animationend` wieder entfernen,
  sonst wachsen sie über mehrere Runden an.
- **`prefers-reduced-motion: reduce`** respektieren: dann bleibt der Ton, die
  Bewegung fällt weg.
- Je eine kurze Fanfare dazu in `MELODIEN`.

### Was daran Matilda gehört

Die Zuordnung Note → Effekt steht als Tabelle in `effekte.js`, direkt neben
`NOTEN_TEXTE` im Geist: Zeile ändern, speichern, Runde spielen. Die Farben
kommen aus dem Variablenblock in `styles.css`, sind also schon ihre.

**Eine Falle beim Bauen:** die Schlüssel sind die Noten als Zeichenkette, und
das Zeichen in „1−" ist ein echtes Minus (U+2212), kein Bindestrich. Es kommt
aus der `NOTEN`-Tabelle in `domain/note.js` und darf nicht umgetippt werden.

## Warum beides zusammen in einer Datei steht

Es ist derselbe Nachmittag: `klang.js` bekommt neue Melodien, `index.html`
bekommt neue Abschnitte, und beides ist Oberfläche ohne Regeländerung. Getrennt
wären es zwei Dateien, die dieselben drei Dateien anfassen.


---

## Wie es gebaut wurde

Nachgetragen nach dem Bauen. Der Plan oben hat gehalten; hier steht, was beim
Bauen dazukam oder anders entschieden wurde.

### Die Zwischenseite

`<section id="zwischen">` neben `#start`, `#karte` und `#ende`. Darauf steht
„Die Runde ist durch!" und darunter, was noch kommt — bei einer einzelnen
Karte im Singular, sonst mit Zahl. Der Knopf heißt „Weiter üben".

Im Ablauf hängt sie in `beendeStapel()`: statt die Wiederholung direkt zu
starten, zeigt `app.js` die Seite. Der Knopf ruft `starteLernpotential()`,
das vorher namenlos mitten in `beendeStapel()` stand — die Funktion gab es
also schon, sie hat nur einen Namen und einen Auslöser bekommen.

Der einmalige Hinweissatz auf der ersten Wiederholungskarte ist entfallen,
wie geplant. Die Zwischenseite sagt es besser.

### Die Effekte

`src/ui/effekte.js`, Schwester von `klang.js`: `zeige(note)` baut die
Teilchen und gibt den Namen des Effekts zurück, damit `ui.js` den passenden
Ton dazu spielen kann. Die Datei entscheidet nichts über Noten.

| Note | Effekt | Teilchen |
|---|---|---|
| 1+ | Rakete, startet unten und fliegt oben raus | 1 |
| 1 | Konfetti, fällt und taumelt | 30 |
| 1− | Sternenregen rund um die Note | 12 |

Vier neue Melodien in `MELODIEN`: `geschafft` für die Zwischenseite, dazu je
eine zu Rakete, Konfetti und Sternen.

`prefers-reduced-motion: reduce` schaltet die Bewegung ab, der Ton bleibt.

### Zwei Kleinigkeiten aus dem Ausprobieren

- Der Knopf auf der Zwischenseite stand allein am linken Rand. Er geht jetzt
  über die ganze Breite, wie die beiden Knöpfe auf der Startseite.
- Die Funken waren mit 1,5rem zu blass und lagen alle auf einer Höhe. Jetzt
  2,25rem, und jeder bekommt eine eigene Höhe zwischen 20 % und 60 %.

## Im Browser geprüft

Nicht nur Tests und Build — eine echte Runde in Chrome bei 390px Breite,
viermal durchgespielt:

| Runde | Ergebnis |
|---|---|
| 15 Karten falsch | Zwischenseite mit „15 Karten haben noch Lernpotential", Ende-Bildschirm bleibt verdeckt, danach Zähler „Lernpotential 1 von 15" |
| 15 richtig | keine Zwischenseite, Note 1+, 15 von 15 Punkten, Rakete |
| 1 falsch | Note 1, 30 Konfetti-Teilchen |
| 2 falsch | Note 1−, 12 Funken |
| 4 falsch | Note 2, kein Effekt und kein Ton |

Keine Fehler in der Browser-Konsole. Die 404-Meldung beim Laden ist
`favicon.ico` — die gibt es im Projekt nicht, das ist älter als dieses
Feature.


## Nachgebessert am 25.08.2026

Die Rakete war zu unscheinbar: ein Emoji, das kurz nach oben rutschte. Jetzt
ist sie **größer (4rem), fliegt länger (2,8s) und macht mehr her**:

- Sie **zittert erst wie beim Countdown** und hebt dann ab. Das Zittern ist
  das erste Drittel der Bewegung; die Prozentzahlen in den `@keyframes` sagen,
  wie lange.
- Sie zieht eine **Funkenspur** aus dreizehn kleinen Zeichen, die erst
  loslegen, wenn sie weg ist (`ABHEBEN = 0.9` Sekunden), leicht zur Seite
  wehen und verglimmen. In `TEILCHEN` heißt das: die Rakete hat `14` Teilchen
  — das erste ist sie selbst, die anderen sind die Spur.
- Der **Ton macht mit**: drei tiefe Ticks während des Zitterns, dann der
  Aufstieg. Vorher war die Melodie nach 0,8 Sekunden vorbei, während das Bild
  noch lief.

Neu dabei ist die Tabelle `DAUER` in `effekte.js`: Grundzeit plus
Zufallszuschlag je Effekt, an einer Stelle statt verstreut im Code. Wer einen
Effekt länger laufen lassen will, ändert dort eine Zahl — das CSS richtet sich
nach der Dauer.
