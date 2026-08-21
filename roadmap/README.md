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
   │  Refinement — jemand denkt es durch und schreibt eine feature-*.md
   ▼
feature-*.md        durchdacht: was, wo im Code, welche Voraussetzungen
   │
   │  Planning — wir suchen aus, was in den nächsten Sprint passt
   ▼
sprint-0X.md        die Auswahl, mit Namen dran und Häkchen zum Abhaken
```

**Refinement heißt: eine Datei schreiben.** Damit ist „durchdacht" nichts
Gefühltes — entweder es gibt die `feature-*.md`, oder das Feature ist noch
nicht so weit. Eine separate Liste „bereit für den nächsten Sprint" gibt es
deshalb nicht: **die Feature-Dateien sind diese Liste.**

Woran ein Sprint gerade arbeitet, steht in der Statuszeile jeder Feature-Datei:

```
**Status:** in [Sprint 3](sprint-03.md)
**Status:** bereit — noch keinem Sprint zugeordnet
```

## Was hier liegt

| Datei | Was drinsteht |
|---|---|
| [sprint-01.md](sprint-01.md) | **abgeschlossen** — Kartenabfrage, Deploy auf Pages |
| [sprint-02.md](sprint-02.md) | **abgeschlossen** — Fokus auf das aktuelle Lernziel |
| [sprint-03.md](sprint-03.md) | **in Arbeit** — Auswählen, üben, eine Note bekommen |
| [backlog.md](backlog.md) | Ideen, noch nicht durchdacht |
| `feature-*.md` | je ein durchdachtes Feature |

### Die Features

| Feature | Wer | Status |
|---|---|---|
| [Eine Datei pro Lektion](feature-lektionsdateien.md) | Thomas | Sprint 3 |
| [Die Vokabeln der 5. Klasse](feature-vokabeln-klasse-5.md) | Matilda | Sprint 3 |
| [Einstellungen, die bleiben](feature-einstellungen-speichern.md) | Thomas | Sprint 3 |
| [Die Optionsseite](feature-optionsseite.md) | beide | Sprint 3 |
| [Auswählen, was geübt wird](feature-uebungsauswahl.md) | Thomas | Sprint 3 |
| [Das Ergebnis als Schulnote](feature-schulnoten.md) | beide | Sprint 3 |
| [Tipps, die bei der Form helfen](feature-verbtipps.md) | Matilda | Sprint 3 |
| [Die App passt auf ein schmales Handy](feature-mobile-390.md) | Thomas | Sprint 3 |
| [Rote Tests blockieren den Merge](feature-tests-in-ci.md) | Thomas | Sprint 3 |
| [Die Lernpotential-Runde](feature-lernpotential.md) | Thomas | bereit |
| [Namensfeld statt Login](feature-namensfeld.md) | Thomas | bereit |
| [Wie die Oberfläche getestet wird](feature-ui-tests.md) | Thomas | bereit |

Nicht jedes Feature ist Code. Die Vokabeln und die Verb-Tipps sind Matildas
Arbeit und stehen gleichberechtigt daneben — ohne sie ist die App eine
Vorführung und kein Werkzeug.

## Was ein Feature aufnahmereif macht

Eine `feature-*.md` zu schreiben lohnt sich erst, wenn vier Dinge stimmen —
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
