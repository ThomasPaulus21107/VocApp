# Feature: Übungsblatt oder Arbeit

**Status:** umgesetzt am 24.08.2026 um 20:22, [PR #13](https://github.com/ThomasPaulus21107/VocApp/pull/13)
**Idee:** Matilda
**Wo im Code:** `src/domain/modus.js`, `src/app.js`, `src/ui/ui.js`, `index.html`

Vor der ersten Karte steht eine Frage: übe ich, oder prüfe ich mich? Beides
mit denselben Karten und derselben Note — aber unter anderen Regeln.

## Die beiden Modi

| | Übungsblatt | Arbeit |
|---|---|---|
| Tipp-Knopf | da, kostet 0,1 Punkte | gar nicht sichtbar |
| zweiter Versuch | ja, dann 0,5 Punkte | nein |
| nach einer Antwort | „Richtig!" oder die Lösung groß | nichts, sofort die nächste Karte |
| „keine Ahnung" | Zuspruch, Karte bleibt offen | Zuspruch, aber die Karte ist durch |
| Notentabelle | dieselbe | dieselbe |

In der Arbeit ist eine Karte damit ganz oder gar nichts: 1 Punkt oder 0. Eine
1+ ist dort echt schwer, während sie im Übungsblatt mit Tipps noch drin ist.
Genau das ist der Unterschied, den es zu spüren geben soll.

## Warum in der Arbeit gar nichts kommt

Kein Ton, keine Lösung, kein „Weiter" — Enter, und die nächste Karte steht da.
Eine Arbeit sagt einem auch nicht nach jeder Aufgabe, wie man liegt. Das
Ergebnis kommt am Ende, auf einmal, als Note.

Preis dafür: die falschen Wörter sieht man während der Runde nicht mehr.
Zurück bekommt man sie nach der Runde in der
[Ergebnisliste](feature-implemented-ergebnisliste-2026-08-24-2022.md) — die ist deshalb kein Beiwerk,
sondern gehört zu diesem Modus dazu.

Zwei Dinge bleiben in beiden Modi gleich: eine **leere Eingabe** verbraucht
nichts (ein versehentliches Enter darf keine Karte kosten), und **`s`**
überspringt weiterhin.

## Wie es gebaut wird

`src/domain/modus.js` ist eine Tabelle mit vier Schaltern — `tippsErlaubt`,
`zweiterVersuch`, `zeigtErgebnis`, `hilferufOhneFolgen`. Mehr ist der
Unterschied zwischen den Modi nicht. Ein dritter Modus wäre eine Zeile.

`app.js` holt die Regeln beim Start einmal und fragt sie an den vier Stellen,
an denen sich der Ablauf gabelt. Die UI kennt die Modi **nicht**: der Name
steht als `data-modus` am Knopf im HTML und wird nur nach oben gereicht —
dasselbe Muster wie bei der Richtungswahl.

## Der Weg durch die App

```
Startseite  ->  Runde  ->  Note  ->  Startseite? Nein:
                                     die beiden Knöpfe stehen direkt dort.
```

Am Ende einer Runde ersetzen „Übungsblatt" und „Arbeit" den alten Knopf
„Noch eine Runde". Ein Klick startet sofort. Die Startseite sieht man deshalb
nur beim Öffnen der App. Dazu kommt „Ergebnisse ansehen" — siehe
[Die Ergebnisse nachlesen](feature-implemented-ergebnisliste-2026-08-24-2022.md).

## Nicht die Optionsseite

Die [Seitenmenü](feature-request-seitenmenue.md) ist etwas anderes: eine echte
zweite Datei für Einstellungen, die **bleiben** (Töne, Richtung, was geübt
wird). Der Modus wird bewusst **nicht** gespeichert — er wird jede Runde neu
gewählt, das ist der Sinn der beiden Knöpfe. Die Startseite ist später der
natürliche Ort für einen Link zur Optionsseite.

## Matildas Teil

Die Texte auf der Startseite und die beiden Zeilen unter den Knopfnamen
(„mit Tipps und zweitem Versuch" / „ohne Tipps, ein Versuch") sind
Platzhalter. Sie stehen in `index.html` und dürfen anders klingen.
