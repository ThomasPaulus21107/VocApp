# Feature: Das Ergebnis als Schulnote

**Status:** umgesetzt am 22.08.2026 um 11:15, [PR #12](https://github.com/ThomasPaulus21107/VocApp/pull/12)
**Wo im Code:** `src/domain/note.js`, `src/app.js`, `src/ui/ui.js`

Am Ende einer Runde soll keine nackte Zahl stehen („11 von 15 richtig"),
sondern eine Note. Die kennt Matilda aus der Schule, und sie sagt ihr sofort,
wo sie steht.

## Warum 15 Karten

Die Punkteskala der Oberstufe geht von 15 bis 0 und ist eine fertige,
allgemein bekannte Umrechnung. Bei genau 15 Karten braucht es deshalb gar
keine Prozentrechnung: **jede richtige Karte ist ein Punkt, und die Punktzahl
ist direkt die Note.**

| Punkte | Note | Punkte | Note | Punkte | Note |
|---|---|---|---|---|---|
| 15 | **1+** | 10 | **2−** | 5 | **4** |
| 14 | **1** | 9 | **3+** | 4 | **4−** |
| 13 | **1−** | 8 | **3** | 3 | **5+** |
| 12 | **2+** | 7 | **3−** | 2 | **5** |
| 11 | **2** | 6 | **4+** | 1 | **5−** |
| | | | | 0 | **6** |

Deshalb wird `RUNDENGROESSE` von 20 auf 15 gesetzt. Ändert man die Rundenlänge
später wieder, muss die Umrechnung mit — die beiden hängen zusammen.

## Was eine Karte wert ist

Eine Karte ist nicht nur ganz oder gar nichts. Wie weit es allein gereicht
hat, steht mit in der Punktzahl:

| Fall | Punkte |
|---|---|
| auf Anhieb richtig | 1,0 |
| im zweiten Versuch richtig | 0,5 |
| mit Tipp | 0,1 weniger, also 0,9 bzw. 0,4 |
| falsch oder übersprungen (`s`) | 0 |
| „keine Ahnung" | kostet nichts — es ist kein Fehlversuch |

Zweiter Versuch und Tipp gibt es nur im Übungsblatt. In der
[Arbeit](feature-arbeit-oder-uebungsblatt-2026-08-24-2022.md) ist jede Karte 1 oder 0 — die
Tabelle darüber gilt trotzdem unverändert, sie kommt dort nur seltener zum
Zug.

Unter null geht eine Karte nie. Damit sind 15,0 Punkte das Maximum, und die
Note bleibt der direkte Blick in die Tabelle.

Weil Tipps Zehntel abziehen, kommen krumme Punktzahlen heraus. **Gerundet
wird kaufmännisch**, 12,5 wird also zur 13. Ein einzelner Tipp verdirbt
deshalb keine sonst perfekte Runde: 14,9 Punkte sind immer noch eine 1+.

## Wie es gebaut wird

Als reine Domänenfunktionen in `src/domain/note.js`, mit Test:

```
punkteFuerKarte({ versuch: 1, tipp: true })  ->  0.4
note(12.4)                                   ->  '2+'
```

Kein DOM, kein Datum, kein Speichern. Die Tabelle ist eine Liste im Code, kein
gerechneter Schwellenwert — sie ist kurz genug, dass man sie hinschreiben und
im Test vollständig prüfen kann. Gezählt wird in `app.js`, dem einzigen Ort
mit veränderlichem Zustand; die UI bekommt die fertige Note gesagt.

Matildas Sätze stehen als `NOTEN_TEXTE` in `ui.js`, geschlüsselt nach Note.
Sie sind Anzeige, keine Regel — und liegen damit dort, wo Matilda sie ohne
Rückfrage ändern kann.

## Entschieden

- **Zählt eine im zweiten Versuch richtige Karte als Punkt?** Einen halben.
  Ganz wäre die Note besser als das Können, gar nicht wäre entmutigend.
- **Wird die Note auch bei 0 von 15 gezeigt?** Ja, dann steht da eine 6. Die
  App verschweigt keine Runde — Matildas Satz dazu fängt das auf.

## Der Endbildschirm

Die Note ist das Größte auf dem Bildschirm, darunter steht Matildas Satz und
darunter klein „12,4 von 15 Punkten". Ohne die Punkte wäre nicht
nachvollziehbar, wo die Note herkommt.

## Noch offen

Zieht man später weniger als 15 Karten — die Übungsauswahl im
[Backlog](../backlog.md) kann das —, ist die Höchstpunktzahl kleiner und selbst
eine fehlerfreie Runde ergäbe eine schlechte Note. Der Endbildschirm sagt
deshalb ehrlich „von 9 Punkten", aber die Umrechnung passt dann nicht mehr.
Gehört zur Übungsauswahl, nicht hierher.

## Hängt zusammen mit

- Matildas Aufgabe, **zu jeder Note einen Text zu schreiben** — die Note sagt
  das Ergebnis, der Text sagt, wie es weitergeht.
- Der **Lernpotential-Runde** ([backlog.md](../backlog.md), bereit): sie nutzt
  dieselben falschen Karten, die für die Note ohnehin gezählt werden.
