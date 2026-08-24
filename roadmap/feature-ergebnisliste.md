# Feature: Die Ergebnisse nachlesen

**Status:** gebaut, in [Sprint 3](sprint-03.md)
**Idee:** Matilda
**Wo im Code:** `src/app.js`, `src/ui/ui.js`, `index.html`

Die Note sagt, wie die Runde ausgegangen ist. Sie sagt nicht, **an welchem
Wort** es lag. Dafür gibt es unter der Note eine Liste: eine Zeile je Karte,
mit Häkchen oder Kreuz, der richtigen Lösung und dem, was getippt wurde.

## Warum das gerade jetzt kommt

In der [Arbeit](feature-arbeit-oder-uebungsblatt.md) erfährt man während der
Runde nichts — kein „Richtig!", keine Lösung, nur die nächste Karte. Ohne
diese Liste wären die richtigen Wörter danach **nirgends** zu sehen. Die Note
allein wäre dann ein Urteil ohne Begründung.

## Eine Zeile

```
✓  schreiben · simple past              0,9
   wrote

✗  gehen · infinitive                     0
   to go
   du: to gone
```

- **Häkchen oder Kreuz** in Grün oder Rot — das ist das Erste, was man sieht.
- **Frage und gesuchte Form**, damit die Zeile ohne Rückerinnern lesbar ist.
- **Die Punkte der Karte** rechts. Erst dadurch ist die Note nachrechenbar:
  0,9 heißt, dass ein Tipp benutzt wurde, 0,5 heißt zweiter Versuch.
- **Die Lösung** darunter, immer — auch bei richtigen Karten.
- **„du: …"** nur, wenn wirklich etwas getippt wurde. Übersprungene Karten
  (`s`) und „keine Ahnung" haben keine Antwort, die man zeigen könnte.

## Die drei Knöpfe am Ende

| Knopf | Was passiert |
|---|---|
| Ergebnisse ansehen | klappt die Liste auf, Text wird zu „Ergebnisse ausblenden" |
| Übungsblatt | neue Runde, mit Tipps und zweitem Versuch |
| Arbeit | neue Runde, ohne beides |

Die Liste ist zugeklappt, bis man sie sehen will: direkt nach der Runde soll
die Note stehen, nicht eine Wand aus fünfzehn Zeilen. Das Auf- und Zuklappen
bleibt als einziges Ereignis **in `ui.js`** — es steht nichts auf dem Spiel,
alle Daten sind schon da, und die App muss davon nichts erfahren.

## Wie es gebaut wird

`app.js` schreibt nach jeder erledigten Karte eine Zeile in `ergebnisse` —
an derselben Stelle, an der auch die Punkte gezählt werden. Am Ende wandert
die fertige Liste in `ui.zeigeEnde(...)`.

Neu ist, dass `ui.js` **Elemente erzeugt**, was es bisher nie musste. Damit
das Markup trotzdem im HTML bleibt, steht die Zeile als `<template>` in
`index.html`; `ui.js` klont sie und setzt Text ein. Kein `innerHTML`, keine
zusammengebauten HTML-Strings.

## Hängt zusammen mit

- Der [Lernpotential-Runde](feature-lernpotential.md): sie braucht genau
  diese falschen Karten. `ergebnisse` ist das Rohmaterial dafür — bisher nur
  für die Dauer einer Runde, gespeichert wird nichts.
