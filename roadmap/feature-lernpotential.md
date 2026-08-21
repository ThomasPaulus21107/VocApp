# Feature: Die Lernpotential-Runde

**Status:** bereit — noch keinem Sprint zugeordnet
**Wo im Code:** `src/domain/`

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

## Offene Punkte für das Planning

Nichts davon blockiert den Bau — es sind Fragen, die man beim Bauen beantwortet:

- **Zählt die zweite Runde zur Note?** Vorschlag: nein. Die Note steht nach
  dem ersten Durchgang fest, das Lernpotential kommt danach.
- **Wie oft?** Vorschlag: einmal. Wer eine Karte zweimal falsch hat, hat sie
  heute nicht mehr im Kopf — dann hilft nur der nächste Tag.
- **Wenn alles richtig war**, gibt es keine zweite Runde. Der
  Ergebnisbildschirm sagt das dann ausdrücklich, statt einen leeren Stapel zu
  starten.

## Warum es vor den Leitner-Fächern kommt

Beides sortiert Karten nach dem, was man nicht kann. Der Unterschied ist das
Gedächtnis: das Lernpotential lebt in einer Sitzung, die Leitner-Fächer über
Tage — mit gespeichertem Lernstand und Wiedervorlage-Datum.

Wer das Lernpotential zuerst baut, hat die Auswahl-Logik schon und muss sie
später nur um das Datum erweitern. Andersherum müsste man beides gleichzeitig
richtig hinbekommen.
