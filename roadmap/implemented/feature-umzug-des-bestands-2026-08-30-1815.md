# Feature: Der Bestand zieht um

**Status:** umgesetzt am 30.08.2026 um 18:15, PR #57
**Wo im Code:** `src/infra/backend.js`, `src/app.js`, `tests/backend.test.js`

Das kleinste der vier Datenbank-Features und das letzte von Phase 1. Ohne es
kennt der Server nur, was ab dem Einbau passiert ist — Matildas bisher geübte
Wochen stünden weiter allein im Browser.

## Was umzieht

Der Lernstand in `localStorage` enthält `verlauf`: bis zu 750 Antworten, jede
schon fast in der Form, die die Tabelle erwartet. Einmalig beim Start wird die
Liste durchgegangen und jede Zeile in den Ausgangskorb gelegt:

- `geraet: 'umzug-<geraet>'` — ein eigener Name, damit die Nummern der neuen
  Ereignisse nicht mit denen des Bestands kollidieren.
- `nummer: index` — die Stelle im Verlauf.
- `art: 'antwort'`.

Danach ein Merker in `localStorage`, damit es nicht bei jedem Start wieder
passiert. Und selbst wenn: der `unique (nutzer, geraet, nummer)` aus
[der Ereignistabelle](feature-ereignistabelle-2026-08-30-0815.md) sorgt dafür,
dass ein zweiter Anlauf nichts doppelt anlegt. **Der Merker spart Arbeit, er
ist nicht die Sicherung.**

Der Merker wird gesetzt, sobald die Zeilen **im Korb** liegen — nicht erst nach
einem geglückten Versand. Das ist dieselbe Arbeitsteilung wie bei `melde()`:
der Korb ist die Sicherung, der Versand kommt von allein.

## Der Tag, den der Verlauf nicht kennt

Beim Bauen aufgefallen und in der geplanten Fassung noch nicht vorgesehen:
**`verlauf` hat keine Spalte `tag`.** `verrechne()` bekommt den Tag zwar von
`app.js`, legt ihn aber nur in `tage` ab, nicht in die einzelne Zeile.

Ihn beim Umzug auf `null` zu lassen wäre teuer gewesen: an `tag` hängt die
[Fleiß-Seite](feature-fleiss-2026-08-29-1551.md), und ein Bestand ohne Tage
wäre ein Bestand ohne Serie. Er wird deshalb aus `zeit` zurückgerechnet, mit
demselben `toLocaleDateString('sv')`, das `app.js` benutzt.

**Zurückrechnen darf man ihn genau hier** — der Umzug läuft auf demselben
Gerät, das die Zeile geschrieben hat, also in derselben Zeitzone. Aus einer
fremden Zeitzone wäre es geraten, und deshalb steht die Umrechnung in
`backend.js` und nirgends sonst.

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

## Wo der Aufruf steht

In `app.js` unmittelbar **vor** `backend.holeNach()`, und die Reihenfolge ist
kein Zufall: `umzug()` legt nur ab und sendet nicht. Stünde er dahinter, ginge
der Bestand erst beim übernächsten Start raus.

`umzug()` meldet auch niemanden an — das tut erst der Versand, und nur, wenn
etwas zu senden ist. Wer die App zum ersten Mal öffnet, hat keinen Bestand und
bekommt dafür auch keinen anonymen Nutzer. Die Regel aus
[Jede Antwort geht zum Server](feature-ereignisse-melden-2026-08-30-1000.md)
bleibt damit unangetastet.

## Die Abnahme

Als Test in `tests/backend.test.js`:

- Jede Zeile des Verlaufs landet im Korb, in seiner Reihenfolge, als
  `art: 'antwort'`.
- Der Bestand nimmt `umzug-<geraet>`, der laufende Betrieb den nackten Namen —
  sonst träfen sich Stelle 1 des Verlaufs und die erste neue Antwort auf
  derselben Nummer.
- Zweimal starten legt nichts nach.
- Der Tag wird zurückgerechnet.
- Steht im Verlauf Unsinn, wirft es nicht — und setzt keinen Merker, damit der
  nächste Start es noch einmal versucht.

Dazu von Hand, weil kein Test es prüfen kann:

**Auf einem Gerät mit gefülltem Lernstand: einmal starten, dann in Supabase
zählen. Die Zeilenzahl muss der Länge von `verlauf` entsprechen. Zweimal
starten ändert sie nicht.**

Der Bestand geht als **ein** `upsert` mit bis zu 750 Zeilen raus — der bislang
größte Aufruf im Projekt. Geht er nicht durch, bleibt er im Korb liegen und
nichts ist verloren; die Antwort wäre dann eine Obergrenze je Durchlauf in
`versende()`, die später auch dem Normalbetrieb nützt.

## Voraussetzung

[Jede Antwort geht zum Server](feature-ereignisse-melden-2026-08-30-1000.md).

## Was danach kommt

Phase 1 ist fertig. **Ein paar Tage still laufen lassen** und nachsehen, ob die
Zeilen ankommen, bevor
[Aus der anonymen Sitzung wird ein Konto](../feature-request-konten.md)
beginnt.
