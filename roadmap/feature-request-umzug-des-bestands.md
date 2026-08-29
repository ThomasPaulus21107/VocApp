# Feature: Der Bestand zieht um

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/infra/backend.js`

Das kleinste der vier Datenbank-Features und das letzte von Phase 1. Ohne es
kennt der Server nur, was ab dem Einbau passiert ist — Matildas bisher geübte
Wochen stünden weiter allein im Browser.

## Was umzieht

Der Lernstand in `localStorage` enthält `verlauf`: bis zu 750 Antworten, jede
schon in genau der Form, die die Tabelle erwartet. Einmalig beim ersten Start
mit Backend wird die Liste durchgegangen und jede Zeile in den Ausgangskorb
gelegt:

- `geraet: 'umzug-<geraet>'` — ein eigener Name, damit die Nummern der neuen
  Ereignisse nicht mit denen des Bestands kollidieren.
- `nummer: index` — die Stelle im Verlauf.
- `art: 'antwort'`.

Danach ein Merker in `localStorage`, damit es nicht bei jedem Start wieder
passiert. Und selbst wenn: der `unique (nutzer, geraet, nummer)` aus
[der Ereignistabelle](feature-request-ereignistabelle.md) sorgt dafür, dass ein
zweiter Anlauf nichts doppelt anlegt. **Der Merker spart Arbeit, er ist nicht
die Sicherung.**

## Was nicht umzieht

**Was älter als 750 Antworten ist, ist verloren.** `VERLAUF_MAX` in
`domain/lernstand.js` ist ein Ringpuffer: was hinten hereinkam, ist vorne
herausgefallen, lange bevor es diese Datei gab.

Der Satz steht hier, damit später niemand danach sucht. Die Zähler in
`einheiten` wissen zwar noch, **wie oft** eine Vokabel dran war — aber nicht
mehr, wann und wie es ausging, und einzelne Ereignisse lassen sich daraus nicht
zurückrechnen.

Ebenfalls nicht mit umziehen: die gezogenen Karten. `verlauf` kennt nur
Antworten. Nach dem Umzug fehlt dem Server also die Vorgeschichte der Auswahl —
das ist folgenlos, solange lokal die Wahrheit ist, und danach kostet es nach
ein paar Runden nichts mehr: `zieheRunde()` holt die Abdeckung von selbst
wieder ein.

## Die Abnahme

Auf einem Gerät mit gefülltem Lernstand: einmal starten, dann in Supabase
zählen. Die Zeilenzahl muss der Länge von `verlauf` entsprechen. Zweimal
starten ändert sie nicht.

## Voraussetzung

[Jede Antwort geht zum Server](feature-request-ereignisse-melden.md).

## Was danach kommt

Phase 1 ist fertig. **Ein paar Tage still laufen lassen** und nachsehen, ob die
Zeilen ankommen, bevor
[Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md) beginnt.
