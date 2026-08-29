# Feature: Den Lernfortschritt sehen

**Status:** umgesetzt am 29.08.2026 um 15:31, [PR #24](https://github.com/ThomasPaulus21107/VocApp/pull/24) (in `main` mit [PR #25](https://github.com/ThomasPaulus21107/VocApp/pull/25))
**Wo im Code:** `fortschritt.html`, `src/ui/` — neu

Eine Seite, die zeigt, was sitzt und was nicht. Für Matilda selbst und für
Thomas als Elternsicht.

Das ist die eine Hälfte von „Monitoring". Die andere — läuft die App
überhaupt — steht in [Technisches Monitoring](../feature-request-monitoring.md)
und hat damit nur das Wort gemeinsam.

## Was darauf steht

Oben ein Überblick: wie viele der 106 Einheiten sicher sitzen, ein Balken
dazu, und vier Zahlen (geübt, Runden, Antworten, zuletzt).

Darunter **drei Fächer**, nebeneinander sobald der Bildschirm Platz hat und
untereinander auf dem Telefon. Jedes nennt seine Menge und zeigt zehn
Beispiele:

| Fach | Was hineingehört | Sortiert nach |
|---|---|---|
| **Noch nie geübt** | war noch nie dran, oder nur gezogen und nicht beantwortet | Reihenfolge der Karten |
| **In Arbeit** | schon dran, aber Score ≤ 75 % oder unter drei Antworten | höchster Score oben |
| **Stabil gelernt** | Score über 75 % **und** mindestens drei Antworten | niedrigster Score oben |

Die Sortierung ist am 29.08.2026 in beiden Fächern umgedreht worden. Vorher
stand oben, was am weitesten weg war; jetzt steht oben, **was gerade an der
Kippe ist** — in Arbeit das, was fast geschafft ist, bei den stabilen das,
was als Erstes wieder abzurutschen droht.

Am selben Tag ist die Hürde von **drei Antworten** dazugekommen. Ohne sie
stünde eine Vokabel, die genau einmal richtig war, sofort bei 100 % und
gälte als stabil — ein einziger Treffer ist aber kein Beweis. Die Zahl steht
als `SICHER_AB_ANTWORTEN` neben der Prozentmarke.

Auf der Seite stand davon zunächst nur die Hälfte: „über 75 % der Punkte".
Seit dem 29.08.2026 **nennt der Satz unter der großen Zahl beide
Bedingungen** — mindestens dreimal geübt *und* über 75 %. Eine Seite, die nur
die eine Hürde nennt, erklärt die andere nicht: wer eine Vokabel einmal
fehlerfrei hatte, sucht sie sonst vergeblich unter „stabil gelernt". Beide
Zahlen holt `src/fortschritt.js` aus `domain/lernstand.js` und schreibt sie
in den Satz — sie stehen nicht im Markup, damit sie nicht auseinanderlaufen.

**Der Score ist die erreichte Punktzahl geteilt durch die Zahl der
Antworten** — dieselbe Bewertung, aus der auch die Note entsteht: auf Anhieb
richtig ist ein ganzer Punkt, im zweiten Versuch ein halber, ein Tipp kostet
ein Zehntel, ein durchgelassener Tippfehler zwei, falsch und übersprungen
bringen nichts.

**Wenn die Zähler einer Einheit nichts hergeben, springt der Verlauf ein.**
Zwei Sorten Altlast brauchen das: ein Eintrag, den `vollstaendig()` mangels
Summe zurückgesetzt hat — er stünde sonst unter „noch nie geübt", obwohl der
Verlauf seine Antworten kennt —, und ein alter Eintrag ohne Summe, dessen
Score als `NaN` herauskäme. In beiden Fällen weiß der Verlauf mehr, und dann
hat er recht. Wer eine Vokabel fünfmal
geübt und dabei 4,6 Punkte geholt hat, steht bei 92 %.

Das ist bewusst dieselbe Währung wie in der Runde. Eine zweite Bewertungslogik
daneben wäre eine zweite Wahrheit darüber, was „können" heißt.

Einen Score gibt es nur da, wo gemessen wurde — was nie dran war, bekommt
keinen, nicht null.

Die Schwelle von 75 % steht als `SICHER_AB_PROZENT` in `domain/lernstand.js`.
Sie ist eine Entscheidung und keine Wahrheit.

**Eine Karte mit nur einer Antwort landet bei einem Treffer sofort auf 100 %**
und damit unter „Sitzt". Wer das strenger will, verlangt zusätzlich zwei
Antworten — eine Zeile in `verteile()`.

## Zwei Dinge fehlen noch

**Die letzten Runden mit Datum und Note.** Der Lernstand zählt je Einheit und
führt einen Verlauf je *Antwort* — eine *Runde* als Einheit gibt es darin
nicht. Ihre Note ließe sich nachrechnen, aber nur ungefähr: eine abgebrochene
Runde ist von einer gespielten nicht zu unterscheiden. Sauber wird es mit
einem Eintrag je Runde (`{ rundeNr, punkte, karten, zeit }`) im Lernstand.

**Die Gruppierung nach `muster`.** „In Arbeit" ist heute eine Wortliste. Mit
[Mustern](../feature-request-tipps.md) würde daraus eine Diagnose: nicht
„sang geht daneben", sondern „`i – a – u` sitzt nicht".

## Warum eine eigene Seite

Wie bei der [Seitenmenü](feature-seitenmenue-2026-08-29-1348.md): Vite kann mehrere
Einstiegspunkte, `fortschritt.html` kommt als Eintrag in `rollupOptions.input`.
Kein Router, keine Abhängigkeit. Üben und Nachsehen sind zwei Situationen, und
die Karte soll leer bleiben.

## Die Elternsicht ist dieselbe Seite

Kein zweites Programm, kein Dashboard. Thomas sieht dieselbe Seite mit
Matildas Daten — was er darf und was nicht, entscheidet **Row Level Security
auf dem Server**, nicht ein Schalter in der Oberfläche.

Die Regel dazu: Eltern sehen den Fortschritt ihres Kindes, nicht den der
anderen. Sie steht in [Mehrere Nutzer](../feature-request-mehrere-nutzer.md) als
offene Entscheidung und muss vorher fallen.

## Was am 29.08.2026 dazugekommen ist

**Der Balken zeigt die drei Fächer.** Links grün, was stabil gelernt ist,
daneben orange, was in Arbeit ist, der hellrote Rest war noch nie dran. Das
dritte Stück braucht kein eigenes Element — was die beiden anderen übrig
lassen, *ist* das dritte Fach, also ist es der Hintergrund der Leiste. Die
Farben heißen `--nie`, `--in-arbeit` und `--sitzt` und stehen in Matildas
Bereich.

Vorher maß der Balken die *geübten* Einheiten, während die große Zahl darüber
die *sicheren* zählte. Bei „0 von 106" stand er damit fast halb gefüllt da.

**Jede Vokabel klappt auf.** Darunter steht, wann sie dran war und was sie
dabei geholt hat — 100 % auf Anhieb, 50 % im zweiten Anlauf, dieselbe Zahl,
aus der der Score gemittelt wird. Antworten aus einer Arbeit oder aus der
Wiederholung bekommen ihren Vermerk. `<details>` macht das Auf und Zu, die
Liste entsteht erst beim Aufklappen, und wo der Ringpuffer nichts mehr hat,
steht das da statt einer leeren Liste.

**„… und 21 weitere" ist ein Knopf** und zeigt auf Klick den Rest des Fachs.

Unter der großen Zahl steht ein Satz, der den Stand einordnet und bei null
stabilen Formen das Lob weglässt. Welche der drei Stufen gilt, entscheidet
`stufe()` an derselben 75-%-Marke.

## Voraussetzungen

- [Der Lernstand je Vokabel](feature-lernstand-2026-08-29-1531.md) in **Stufe 1** —
  die lokale Fassung reicht vollständig. Weder Supabase noch eine Antwort auf
  die Punktefrage werden dafür gebraucht; die Elternsicht auf einem gemeinsamen
  Rechner funktioniert damit schon.
- [Tipps](../feature-request-tipps.md) für das Feld `muster`, sonst fällt Punkt 2
  auf eine Wortliste zurück

## Zu beachten

- **Für ein Telefon entworfen, nicht für einen Bildschirm.** Geübt wird
  primär auf dem iPhone. Balken untereinander, keine breiten Tabellen, nichts,
  was quer scrollt.
- **Keine Diagrammbibliothek.** Ein Balken ist ein `div` mit einer Breite in
  Prozent. Die App hat kein Framework und braucht für vier Zahlen keins.
- **Fortschritt zeigen, nicht Versagen.** „Von 159 sitzen 94" ist dieselbe
  Information wie „65 sitzen nicht" und wirkt völlig anders. Die Seite soll
  gefährlich nah an Matildas Motivation gebaut werden — das ist Gestaltung und
  gehört ihr.
- Erst ab genug Runden aussagekräftig. Bis dahin lieber „noch zu wenig
  geübt, um etwas zu sagen" als eine Kurve aus drei Punkten.
