# Roadmap

Hier steht, was die App werden soll — geplant, in Arbeit und abgeschlossen.
Der Code sagt, was sie *ist*; dieser Ordner sagt, wohin sie soll.

## Der Weg eines Features

```
  Idee
   │
   ▼
backlog.md                                ein Satz, was es ist. Dazu:
   │                                      was es braucht, was offen ist.
   │  Refinement — jemand denkt es durch und schreibt die Datei
   ▼
feature-request-<thema>.md                durchdacht: was, wo im Code,
   │                                      welche Voraussetzungen
   │  Gebaut, getestet, gemergt — die Datei wird umbenannt
   ▼
feature-implemented-<thema>-<JJJJ-MM-TT-hhmm>.md
```

Rückwärts geht es auch: was refined war und wieder ruht, wird zu einem
Backlog-Eintrag, und die durchdachte Fassung bleibt in der Git-Historie.

**Refinement heißt: eine Datei schreiben.** Damit ist „durchdacht" nichts
Gefühltes — entweder es gibt die Request-Datei, oder das Feature ist noch
nicht so weit. Eine separate Liste „bereit für den nächsten Sprint" gibt es
deshalb nicht: **die Request-Dateien sind diese Liste.**

## Der Dateiname sagt, was schon steht

Ein `ls roadmap/` soll reichen. Deshalb steht der Zustand **vorne im
Dateinamen**, und die Dateien sortieren sich von allein in zwei Blöcke:

| Name | Was das heißt |
|---|---|
| `feature-request-<thema>.md` | durchdacht, aber noch nicht gebaut. Kann drankommen. |
| `feature-implemented-<thema>-<JJJJ-MM-TT-hhmm>.md` | gebaut. Datum und Uhrzeit sind der Zeitpunkt, an dem es in `main` lag. |

**Umbenannt wird beim Merge**, nicht vorher — ein halb gebautes Feature heißt
weiter `request`. Weil die `id` einer Datei ihr Name ist, ändern sich dabei
auch die Links: wer umbenennt, sucht einmal nach dem alten Namen und zieht
Roadmap, `AGENTS.md` und die anderen Feature-Dateien nach.

In der Datei selbst steht eine Statuszeile:

```
**Status:** bereit — durchdacht, noch nicht gebaut
**Status:** umgesetzt am 24.08.2026 um 22:11, PR #14
```

### Es gab einmal Sprint-Dateien

`sprint-01.md` bis `sprint-03.md` sind am 25.08.2026 aufgelöst worden. Ihr
Inhalt steht jetzt in Feature-Dateien, im Backlog und weiter unten unter
„Wiederkehrendes". Zwei Ordnungen nebeneinander — Sprints *und*
Feature-Zustände — hätten sich nur gegenseitig veraltet: dieselbe Aufgabe war
in `sprint-03.md` „in Arbeit" und im Dateinamen längst `implemented`.

Was ein Sprint konnte und der Dateiname nicht kann, ist ein **Ziel für die
nächsten Wochen**. Das steht jetzt in der Überschrift von `backlog.md` und in
der Auswahl dessen, was als Nächstes refined wird.

## Was hier liegt

| Datei | Was drinsteht |
|---|---|
| [backlog.md](backlog.md) | Ideen, noch nicht durchdacht |
| `feature-request-*.md` | je ein durchdachtes Feature, noch nicht gebaut |
| `feature-implemented-*.md` | je ein gebautes Feature, mit Datum im Namen |

### Was gebaut ist

Von unten nach oben, neueste zuerst.

| Feature | Wann |
|---|---|
| [Der Moment nach der Runde](feature-implemented-nach-der-runde-2026-08-25-2212.md) | 25.08. 22:12 |
| [Die Lernpotential-Runde](feature-implemented-lernpotential-2026-08-24-2211.md) | 24.08. 22:11 |
| [Übungsblatt oder Arbeit](feature-implemented-arbeit-oder-uebungsblatt-2026-08-24-2022.md) | 24.08. 20:22 |
| [Die Ergebnisse nachlesen](feature-implemented-ergebnisliste-2026-08-24-2022.md) | 24.08. 20:22 |
| [Das Ergebnis als Schulnote](feature-implemented-schulnoten-2026-08-22-1115.md) | 22.08. 11:15 |
| [Die Roadmap](feature-implemented-roadmap-2026-08-21-1839.md) | 21.08. 18:39 |
| [Fokus auf das aktuelle Lernziel](feature-implemented-fokus-auf-verben-2026-08-21-1712.md) | 21.08. 17:12 |
| [Eine zweite Chance bei Fehlern](feature-implemented-zweite-chance-2026-08-21-1712.md) | 21.08. 17:12 |
| [Zwei Easter Eggs im Eingabefeld](feature-implemented-easter-eggs-2026-08-21-1712.md) | 21.08. 17:12 |
| [Töne für die Rückmeldung](feature-implemented-rueckmeldungstoene-2026-08-21-1712.md) | 21.08. 17:12 |
| [Unregelmäßige Verben mit drei Formen](feature-implemented-formen-modus-2026-08-20-2029.md) | 20.08. 20:29 |
| [Die App liegt unter einer öffentlichen URL](feature-implemented-deploy-auf-pages-2026-08-20-1558.md) | 20.08. 15:58 |
| [Die Kartenabfrage](feature-implemented-kartenabfrage-2026-08-20-1454.md) | 20.08. 14:54 |

### Was durchdacht ist und wartet

| Feature | Wer |
|---|---|
| [Wie streng die App prüft](feature-request-pruefstrenge.md) | Thomas |
| [Tipps, die bei der Form helfen](feature-request-verbtipps.md) | Matilda |
| [Zwei Kleinigkeiten in der Übungsrunde](feature-request-feinschliff.md) | Matilda |
| [Einstellungen, die bleiben](feature-request-einstellungen-speichern.md) | Thomas |
| [Die Optionsseite](feature-request-optionsseite.md) | Thomas, Gestaltung Matilda |
| [Namensfeld statt Login](feature-request-namensfeld.md) | Thomas |
| [Die App passt auf ein schmales Handy](feature-request-mobile-390.md) | Thomas |
| [Rote Tests blockieren den Merge](feature-request-tests-in-ci.md) | Thomas |
| [Ob die Abfragerichtung umschaltbar wird](feature-request-richtung.md) | Entscheidung |
| [Wie die Oberfläche getestet wird](feature-request-ui-tests.md) | Entscheidung |

Nicht jedes Feature ist Code. Die Vokabeln, die Verb-Tipps, die Töne und die
Farben sind Matildas Arbeit und stehen gleichberechtigt daneben — ohne sie ist
die App eine Vorführung und kein Werkzeug.

## Was ein Feature aufnahmereif macht

Eine `feature-request-*.md` zu schreiben lohnt sich erst, wenn vier Dinge
stimmen — sonst bleibt der Punkt im Backlog:

1. Die Voraussetzungen sind benannt und entweder erfüllt, oder sie entstehen
   parallel. Oder das Feature **schafft** selbst welche.
2. Es ist klar, was gebaut wird und wo es hingehört — Domäne, UI oder `infra`.
3. Die offenen Entscheidungen sind entschieden.
4. Der Umfang ist grob abschätzbar.

Punkt 1 ist der Grund, warum `storage.js` refined ist, obwohl es allein nichts
sichtbar macht: es blockiert nichts und macht dafür der Optionsseite, dem
Namensfeld und später Supabase den Weg frei. Und er ist der Grund, warum
„Punkte und Streak speichern" im Backlog steht, obwohl die Voraussetzung
absehbar ist — dort ist Punkt 3 offen: was überhaupt gezählt wird.

Zwei Dateien sind bewusst **keine** Bauanleitung, sondern eine Entscheidung:
[Wie die Oberfläche getestet wird](feature-request-ui-tests.md) und
[Ob die Abfragerichtung umschaltbar wird](feature-request-richtung.md). Sie
stehen hier, weil sie sonst als halb fertiger Code oder als Bauchgefühl
weiterleben.

## Wiederkehrendes

Was in keiner Feature-Datei steht, weil es nie fertig ist. Kam aus den
Sprint-Dateien hierher:

- **Matilda schreibt nach einer Sitzung drei Dinge auf, die stören oder besser
  sein könnten.** Daraus ist mehr als ein Feature entstanden — die Modi und die
  Ergebnisliste zum Beispiel. In eine Datei, nicht auf einen Zettel.
- **Mindestens eine Änderung von Matilda geht selbst nach `main`** — eigener
  Branch, Pull Request, Merge. Der Git-Ablauf ist Teil des Lernziels und wird
  bewusst von Hand gemacht.
- **Vor jedem Pull Request einmal `npm test`.** Bis
  [rote Tests den Merge blockieren](feature-request-tests-in-ci.md), ist das
  eine Absprache und keine Absicherung.

Was wir **nicht** bauen, steht nicht hier, sondern in `AGENTS.md` unter
„Out of Scope" — damit es nicht alle paar Monate neu diskutiert wird.
