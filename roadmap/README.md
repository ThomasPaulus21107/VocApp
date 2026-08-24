# Roadmap

Hier steht, was die App werden soll — geplant, in Arbeit und abgeschlossen.
Der Code sagt, was sie *ist*; dieser Ordner sagt, wohin sie soll.

## Der Weg eines Features

```
  Idee
   │
   ▼
backlog.md          ein Satz, was es ist. Dazu: was es braucht, was offen ist.
   │
   │  Refinement — jemand denkt es durch und schreibt eine Feature-Datei
   ▼
feature-request-*.md    durchdacht: was, wo im Code, welche Voraussetzungen
   │
   │  Planning — wir suchen aus, was in den nächsten Sprint passt
   ▼
sprint-0X.md            die Auswahl, mit Namen dran und Häkchen zum Abhaken
   │
   │  Gebaut, getestet, gemergt — die Datei wird umbenannt
   ▼
feature-implemented-*-JJJJ-MM-TT-hhmm.md
```

**Refinement heißt: eine Datei schreiben.** Damit ist „durchdacht" nichts
Gefühltes — entweder es gibt die Feature-Datei, oder das Feature ist noch
nicht so weit. Eine separate Liste „bereit für den nächsten Sprint" gibt es
deshalb nicht: **die Feature-Dateien sind diese Liste.**

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

Der Sprint dazu steht in der Statuszeile in der Datei selbst:

```
**Status:** in [Sprint 3](sprint-03.md)
**Status:** bereit — noch keinem Sprint zugeordnet
**Status:** umgesetzt am 24.08.2026 um 22:11, in [Sprint 3](sprint-03.md)
```

## Was hier liegt

| Datei | Was drinsteht |
|---|---|
| [sprint-01.md](sprint-01.md) | **abgeschlossen** — Kartenabfrage, Deploy auf Pages |
| [sprint-02.md](sprint-02.md) | **abgeschlossen** — Fokus auf das aktuelle Lernziel |
| [sprint-03.md](sprint-03.md) | **in Arbeit** — Auswählen, üben, eine Note bekommen |
| [backlog.md](backlog.md) | Ideen, noch nicht durchdacht |
| `feature-request-*.md` | je ein durchdachtes Feature, noch nicht gebaut |
| `feature-implemented-*.md` | je ein gebautes Feature, mit Datum im Namen |

### Die Features

| Feature | Wer | Status |
|---|---|---|
| [Eine Datei pro Lektion](feature-request-lektionsdateien.md) | Thomas | Sprint 3 |
| [Die Vokabeln der 5. Klasse](feature-request-vokabeln-klasse-5.md) | Matilda | Sprint 3 |
| [Einstellungen, die bleiben](feature-request-einstellungen-speichern.md) | Thomas | Sprint 3 |
| [Die Optionsseite](feature-request-optionsseite.md) | beide | Sprint 3 |
| [Auswählen, was geübt wird](feature-request-uebungsauswahl.md) | Thomas | Sprint 3 |
| [Das Ergebnis als Schulnote](feature-implemented-schulnoten-2026-08-22-1115.md) | beide | **umgesetzt** 22.08. |
| [Übungsblatt oder Arbeit](feature-implemented-arbeit-oder-uebungsblatt-2026-08-24-2022.md) | beide | **umgesetzt** 24.08. |
| [Die Ergebnisse nachlesen](feature-implemented-ergebnisliste-2026-08-24-2022.md) | beide | **umgesetzt** 24.08. |
| [Tipps, die bei der Form helfen](feature-request-verbtipps.md) | Matilda | Sprint 3 |
| [Die App passt auf ein schmales Handy](feature-request-mobile-390.md) | Thomas | Sprint 3 |
| [Rote Tests blockieren den Merge](feature-request-tests-in-ci.md) | Thomas | Sprint 3 |
| [Die Lernpotential-Runde](feature-implemented-lernpotential-2026-08-24-2211.md) | Thomas | **umgesetzt** 24.08. |
| [Namensfeld statt Login](feature-request-namensfeld.md) | Thomas | bereit |
| [Wie die Oberfläche getestet wird](feature-request-ui-tests.md) | Thomas | bereit |

Nicht jedes Feature ist Code. Die Vokabeln und die Verb-Tipps sind Matildas
Arbeit und stehen gleichberechtigt daneben — ohne sie ist die App eine
Vorführung und kein Werkzeug.

## Was ein Feature aufnahmereif macht

Eine `feature-request-*.md` zu schreiben lohnt sich erst, wenn vier Dinge stimmen —
sonst bleibt der Punkt im Backlog:

1. Die Voraussetzungen sind benannt und entweder erfüllt, oder sie entstehen
   im laufenden Sprint. Oder das Feature **schafft** selbst welche.
2. Es ist klar, was gebaut wird und wo es hingehört — Domäne, UI oder `infra`.
3. Die offenen Entscheidungen sind entschieden.
4. Der Umfang ist grob abschätzbar.

Punkt 1 ist der Grund, warum `storage.js` refined ist, obwohl es allein
nichts sichtbar macht: es blockiert nichts und macht dafür der Optionsseite,
dem Namensfeld und später Supabase den Weg frei. Und er ist der Grund, warum
„Punkte und Streak speichern" noch im Backlog steht, obwohl die Voraussetzung
in Sprint 3 entsteht — dort ist Punkt 3 offen: was überhaupt gezählt wird.

## Wie ein Sprint endet

Die Datei bleibt liegen, mit gesetzten Häkchen. Auch das, was ungeplant
dazukam, wird nachgetragen: in Sprint 1 waren das die unregelmäßigen Verben,
in Sprint 2 die Rückmeldungstöne. Beide Male war das mehr Arbeit als geplant,
und beide Male stand es hinterher nirgends.

Was wir **nicht** bauen, steht nicht hier, sondern in `AGENTS.md` unter
„Out of Scope" — damit es nicht alle paar Monate neu diskutiert wird.
