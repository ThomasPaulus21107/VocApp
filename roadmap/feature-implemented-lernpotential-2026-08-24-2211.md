# Feature: Die Lernpotential-Runde

**Status:** umgesetzt am 24.08.2026 um 22:11, in [Sprint 3](sprint-03.md)
**Wo im Code:** `src/domain/lernpotential.js`, Regel in `src/domain/modus.js`,
Wiederholung derselben Form über `stelleFrageZuForm()` in `src/domain/pruefung.js`

Wer eine Karte falsch hatte, bekommt sie in derselben Sitzung noch einmal.
Nicht morgen, nicht in drei Tagen — sofort, solange man noch dabei ist.

Der Name ist Absicht: „Nachsitzen" klingt nach Strafe. Was man noch nicht
kann, ist aber genau das, wo Üben etwas bringt. Das Wort steht deshalb so auch
im Code, damit Bildschirm und Funktion dasselbe sagen.

## Wie es gebaut wird

Als reine Domänenfunktion:

```
lernpotential(stapel, falscheIds)  ->  neuer Stapel
```

Rein kommt die gespielte Runde und die Liste der Karten, die falsch waren.
Raus kommt ein neuer Stapel. **Kein Speichern, kein Datum, kein Zufall von
innen** — damit bleibt es testbar wie alles andere in `domain/`.

Die falschen Karten stehen für den Ergebnisbildschirm ohnehin schon fest. Der
Aufwand ist deshalb klein: die Liste, die dort gezählt wird, geht einfach
weiter in diese Funktion.

## Wie es entschieden wurde

Die offenen Punkte aus dem Planning, beantwortet beim Bauen:

- **Zählt die zweite Runde zur Note?** Nein. Die Note steht nach dem ersten
  Durchgang fest. In der zweiten Runde wachsen weder `punkte` noch die
  Ergebnisliste — `merkeErgebnis()` steigt dort gleich wieder aus.
- **Wie oft?** Einmal. `imLernpotential` sorgt dafür, dass es keine dritte
  Runde gibt: wer eine Karte zweimal falsch hat, hat sie heute nicht mehr im
  Kopf.
- **Wenn alles richtig war**, gibt es keine zweite Runde, und der
  Ergebnisbildschirm sagt dazu nichts — die Zeile bleibt einfach weg.
- **Welche Karten kommen mit?** Alles, was nicht auf Anhieb und ohne Hilfe
  saß: falsch beantwortet, erst im zweiten Versuch richtig, oder mit Tipp
  gelöst. Das sind genau die drei Fälle, in denen eine Karte Punkte kostet —
  wer den halben Punkt oder das Zehntel abgibt, kann die Karte eben noch
  nicht sicher. Übersprungene Karten (`s`) und „keine Ahnung" bleiben
  draußen: da wurde es nicht versucht.
- **Nur im Übungsblatt.** Das steht als fünfte Zeile `lernpotential` in der
  Regeltabelle in `domain/modus.js`, nicht als Sonderfall in `app.js`. In der
  Arbeit gibt es keine zweite Chance — auch keine nachträgliche.
- **Der Übergang** passiert von selbst: nach der letzten Karte läuft die
  zweite Runde direkt an. Der Zähler oben heißt dann „Lernpotential 2 von 4",
  und auf der ersten Karte steht einmal, was jetzt kommt.
- **Dieselbe Form wie beim ersten Mal.** Die zweite Runde ist eine reine
  Wiederholung: dieselbe Karte, dieselbe gesuchte Form. Ein neuer Wurf würde
  eine andere Aufgabe stellen als die, die danebenging.

  Dafür ist `stelleFormFrage()` in zwei Funktionen zerlegt:
  `stelleFrageZuForm(karte, richtung, form)` baut die Frage zu einer
  genannten Form, `stelleFormFrage()` würfelt die Form aus und ruft die
  erste auf. Der Zufall sitzt damit an genau einer Stelle, und die
  Wiederholung kommt ganz ohne ihn aus.

  Der Merkzettel in `app.js` hält deshalb `{ id, form }` statt nur der id.
  `lernpotential()` selbst bleibt eine reine Auswahl über ids und muss von
  Formen nichts wissen.
- **Die Reihenfolge bleibt**, wie gespielt. Neu mischen würde bei drei bis
  fünf Karten nichts bringen und Zufall in eine Funktion holen, die ohne ihn
  auskommt.

## Was aufgepasst werden musste

Die Höchstpunktzahl war `stapel.length`. In der zweiten Runde ist der Stapel
kürzer — ohne das gemerkte `hoechstpunktzahl` stünde am Ende „12 von 4
Punkten".

## Warum es vor den Leitner-Fächern kommt

Beides sortiert Karten nach dem, was man nicht kann. Der Unterschied ist das
Gedächtnis: das Lernpotential lebt in einer Sitzung, die Leitner-Fächer über
Tage — mit gespeichertem Lernstand und Wiedervorlage-Datum.

Wer das Lernpotential zuerst baut, hat die Auswahl-Logik schon und muss sie
später nur um das Datum erweitern. Andersherum müsste man beides gleichzeitig
richtig hinbekommen.
