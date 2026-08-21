# Feature: Das Ergebnis als Schulnote

**Status:** in [Sprint 3](sprint-03.md)
**Wo im Code:** `src/domain/`, `src/ui/ui.js`

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

## Wie es gebaut wird

Als reine Domänenfunktion in `src/domain/`, mit Test:

```
note(richtige)  ->  '2+'
```

Kein DOM, kein Datum, kein Speichern. Die Tabelle ist eine Liste im Code, kein
gerechneter Schwellenwert — sie ist kurz genug, dass man sie hinschreiben und
im Test vollständig prüfen kann.

## Offene Fragen

- **Zählt eine im zweiten Versuch richtige Karte als Punkt?**
  Vorschlag: nein. Sonst ist die Note besser als das Können.
- **Wird die Note auch bei 0 von 15 gezeigt?** Das wäre eine 6. Zeigen wie sie
  ist, oder ab einer Schwelle nur Matildas Text? Die App soll ehrlich sein,
  aber sie ist kein Zeugnis.

## Hängt zusammen mit

- Matildas Aufgabe, **zu jeder Note einen Text zu schreiben** — die Note sagt
  das Ergebnis, der Text sagt, wie es weitergeht.
- Der **Lernpotential-Runde** ([backlog.md](backlog.md), bereit): sie nutzt
  dieselben falschen Karten, die für die Note ohnehin gezählt werden.
