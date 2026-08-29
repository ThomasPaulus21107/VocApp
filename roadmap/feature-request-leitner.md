# Feature: Leitner-Fächer mit Wiedervorlage

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/auswahl.js`, `src/domain/lernstand.js`, `src/app.js`
**Wer:** Thomas

„Diese Karte erst in drei Tagen wieder." Ein Modell darüber, wann eine Vokabel
wieder drankommen muss — statt der reinen Rotation, die heute entscheidet.

Kommt aus `backlog.md`, wo es mit drei offenen Punkten stand: wie viele
Fächer, welche Abstände, und was beim ersten Start passiert. Alle drei sind
hier beantwortet.

## Die eine Frage, an der alles hängt

**Leitner liefert eine Tagesmenge, die App will 15 Karten.** Das ist der
Bruch, und er ist kein Detail: an einem Tag sind sechs Karten fällig, an einem
anderen achtzig. Reines Leitner sagt dann „heute nichts mehr, komm morgen
wieder" — für ein Kind, das gerade üben *will*, ist das die falsche Antwort.

Der übliche Ausweg ist, die Rundengröße variabel zu machen. Das kostet mehr,
als es klingt: die Note rechnet gegen `hoechstpunktzahl = stapel.length`, und
eine „2+" aus sechs Karten ist nicht dieselbe wie eine aus fünfzehn. Die
Rundengröße ist in diesem Projekt keine Zahl, sondern eine Maßeinheit.

## Der Vorschlag: Leitner sortiert, es filtert nicht

**Die Fälligkeit ersetzt das Alter im Sortierschlüssel — und sonst nichts.**

Heute sortiert [`zieheRunde()`](implemented/feature-auswahl-2026-08-29-1327.md)
nach `kartenAlter`, dann `alter`, dann Würfel, und nimmt die ersten 15. Der
Umbau ersetzt den zweiten Schlüssel:

```
heute:   b.kartenAlter - a.kartenAlter || b.alter      - a.alter      || würfel
Leitner: b.kartenAlter - a.kartenAlter || b.ueberfaellig - a.ueberfaellig || würfel
```

`ueberfaellig` ist die Zahl der Tage, die eine Einheit über ihrem
Fälligkeitsdatum steht. Sie darf **negativ** werden: eine Karte, die erst in
fünf Tagen dran wäre, steht bei `-5`.

Damit fällt das Mengenproblem weg, ohne dass es gelöst werden muss:

- **Mehr als 15 fällig?** Es kommen die, die am längsten überfällig sind.
  Genau das, was Leitner will.
- **Weniger als 15 fällig?** Die Runde füllt sich mit den Karten auf, die als
  nächstes fällig würden — die mit der kleinsten negativen Zahl. Man übt vor,
  in der sinnvollsten denkbaren Reihenfolge.
- **Gar nichts fällig?** Dieselbe Regel, keine Sonderbehandlung. Es gibt nie
  eine leere Runde und nie eine kurze.

**Der Preis, offen gesagt:** das ist nicht mehr reines Leitner. Reines Leitner
schützt vor dem Zuviel-Üben, indem es Nein sagt. Diese Fassung sagt immer Ja
und verschiebt nur die Reihenfolge. Wer täglich übt, bekommt trotzdem exakt
das Leitner-Verhalten — die Fälligen füllen die 15 dann von allein. Der
Unterschied zeigt sich nur an dem Tag, an dem jemand eine dritte Runde spielen
will, und dort ist Ja die bessere Antwort.

**Der Gewinn:** es ist derselbe Umbau wie die Gewichtung — ein anderer
Sortierschlüssel, kein neuer Ablauf. Kein Sonderfall in `app.js`, keine zweite
Rundenlogik, und `zieheRunde()` bleibt eine reine Funktion mit einem Argument
mehr.

## Fünf Fächer, und die Abstände kommen aus der Schulwoche

| Fach | wieder in | Bedeutung |
|---|---|---|
| 0 | heute | frisch falsch, oder noch nie dran |
| 1 | 1 Tag | einmal gesessen |
| 2 | 3 Tagen | sitzt |
| 3 | 7 Tagen | sitzt eine Woche später noch |
| 4 | 14 Tagen | kann sie |

Vier Sprünge, größter Abstand zwei Wochen. Länger lohnt sich hier nicht: eine
Lektion ist nach ein paar Wochen durch, und eine Karte, die 30 Tage
verschwindet, verschwindet für dieses Schuljahr.

**Auf- und Abstieg benutzen die Bewertung, die es schon gibt.** `punkteFuerKarte()`
liefert die Zahl, aus der auch Note und Score entstehen — daran hängt sich das
Fach an, statt eine zweite Wahrheit über „können" aufzumachen:

- **voller Punkt** (auf Anhieb, ohne Tipp) → ein Fach hoch
- **halber Punkt** (zweiter Versuch) oder Tipp benutzt → Fach bleibt
- **falsch, übersprungen, aufgegeben** → zurück auf Fach 0

Zurück auf 0 und nicht ein Fach runter: was man vergessen hat, hat man
vergessen. Das ist die harte Variante, aber die ehrliche — und sie ist
dieselbe Strenge, mit der `SICHER_AB_PROZENT` über „sitzt" entscheidet.

## Die Wiederholung am Rundenende darf nicht aufsteigen

Die [Lernpotential-Runde](implemented/feature-lernpotential-2026-08-24-2211.md)
ist bereits ein Mini-Leitner mit Abstand null: was danebenging, kommt sofort
noch einmal. Sie zählt seit dem 29.08.2026 im Lernstand mit — **aber sie darf
kein Fach hochschieben.** Dort stand die Lösung eben noch auf dem Bildschirm;
eine Karte, die deshalb für sieben Tage verschwindet, ist genau der Fehler,
den Leitner verhindern soll.

Dafür gibt es das Feld schon: im Verlauf steht `wiederholung: true` an diesen
Antworten. Es ist am 29.08.2026 aus demselben Gedanken entstanden und wird
hier zum ersten Mal wirklich gebraucht.

## Was beim ersten Start passiert

**Nicht bei null anfangen — die Fächer aus dem Verlauf rechnen.**

Der Ringpuffer hält die letzten 750 Antworten, also rund fünfzig Runden. Die
lassen sich chronologisch durchspielen und ergeben für jede Einheit das Fach,
in dem sie heute stünde. Wer seit Wochen übt, findet seine gut sitzenden
Vokabeln sofort in den oberen Fächern wieder, statt vierzehn Tage lang bei
null anzufangen.

Das ist genau der Zweck, für den der Verlauf gebaut wurde — `lernstand.js`
sagt es wörtlich: *„das Gegengift gegen das Festlegen: aus ihm lässt sich ein
anderes Können-Modell neu rechnen, statt es nur fortzuschreiben."* Leitner ist
der erste Fall, der das einlöst.

Für Einheiten ohne Verlaufszeilen gilt Fach 0, fällig heute. Sie stehen damit
ganz vorn — neue Vokabeln kommen zuerst dran, und die Abdeckung bleibt so
schnell wie heute.

## Der Speicher bekommt zwei Felder

Je Einheit, additiv zum bestehenden Eintrag:

```js
fach: 0,                 // 0 bis 4
faellig: '2026-08-29',   // JJJJ-MM-TT, wie in tage
```

Das Datum kommt in derselben Währung wie `tage` — als Text von außen, aus
`app.js` mit `toLocaleDateString('sv')`. **Die Domäne fragt weiterhin nicht,
wie spät es ist**, sie bekommt den Tag gereicht. `zieheRunde()` braucht dafür
ein Argument mehr.

Alte Stände ohne die Felder fängt `vollstaendig()` ab, das seit dem 29.08.2026
in `lernstand.js` steht. Es ist genau für diesen Fall gebaut.

## Zu beachten

- **Die Abdeckungsgarantie fällt weg.** Heute ist nach vier Runden jedes Verb
  einmal dran gewesen, weil die Rotation niemanden auslässt. Mit Leitner
  verschwinden gut sitzende Karten für bis zu zwei Wochen — das ist der Sinn,
  aber es ist eine Eigenschaft, die das Projekt bewusst aufgibt.
- **`rundeNr` bleibt, wo es ist.** Die Auswahl rechnet dann in Tagen, der
  Lernstand zählt weiter Runden. Beide werden gebraucht: die Runden für die
  Statistik, die Tage für die Fälligkeit.
- **Safari räumt nach sieben Tagen auf.** Ein Modell, das auf Termine baut,
  hängt stärker an Kontinuität als eines, das nur zählt. Der
  [Homebildschirm](implemented/feature-homebildschirm-2026-08-29-1327.md)
  mildert das, hebt es aber nicht auf. Der Verlauf ist hier die zweite
  Sicherung: solange er steht, lassen sich die Fächer neu rechnen.
- **Die Arbeit zählt wie das Übungsblatt.** Eine Arbeit ist die beste Evidenz,
  die es gibt — sie darf Fächer verschieben. Nur die Wiederholung nicht.

## Erst entscheiden, dann bauen

**Leitner und [„Schwere Karten häufiger dran nehmen"](backlog.md) sind
Alternativen, keine Ergänzungen.** Beide ersetzen denselben Sortierschlüssel,
beide lesen denselben Lernstand:

| | Gewichtung (Stufe 2) | Leitner |
|---|---|---|
| Umbau | ein Summand, `1 - score / 100` | Sortierschlüssel plus zwei Felder |
| Speicherformat | unverändert | zwei Felder je Einheit |
| Modell | „schwer heißt öfter" | „vergessen heißt fällig" |
| Abdeckung | bleibt garantiert | fällt weg |

Die Gewichtung ist billiger und braucht kein neues Format. Leitner ist das
mächtigere Modell und die bessere Antwort auf *Vergessen* — aber es weiß nur
über die Zeit Bescheid, nicht über Schwierigkeit.

Sie schließen sich nicht für immer aus: `ueberfaellig` und `1 - score / 100`
könnten später zwei Summanden derselben Formel sein. Aber gebaut wird eines
von beiden zuerst, und diese Entscheidung gehört vor die erste Zeile Code.

## Später

- **Beide Summanden zusammen** — Fälligkeit und Schwierigkeit in einer Formel.
- **Die Fächer sichtbar machen.** Die Fortschrittsseite zeigt heute drei
  Fächer nach Score. Fünf nach Fälligkeit wären ein zweites Bild derselben
  Sammlung — und die Frage, ob das hilft oder verwirrt, gehört Matilda.
- **Abstände je Kind.** Erst relevant, wenn es mehrere gibt.
