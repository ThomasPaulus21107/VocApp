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
   │  Gebaut, getestet, gemergt — die Datei zieht um
   ▼
implemented/feature-<thema>-<JJJJ-MM-TT-hhmm>.md
```

Rückwärts geht es auch: was refined war und wieder ruht, wird zu einem
Backlog-Eintrag, und die durchdachte Fassung bleibt in der Git-Historie.

**Refinement heißt: eine Datei schreiben.** Damit ist „durchdacht" nichts
Gefühltes — entweder es gibt die Request-Datei, oder das Feature ist noch
nicht so weit. Eine separate Liste „bereit für den nächsten Sprint" gibt es
deshalb nicht: **die Request-Dateien sind diese Liste.**

## Der Ort sagt, was schon steht

Ein `ls roadmap/` soll reichen: **was dort direkt liegt, ist offen — was
gebaut ist, liegt in `implemented/`.**

| Wo | Was das heißt |
|---|---|
| `feature-request-<thema>.md` | durchdacht, aber noch nicht gebaut. Kann drankommen. |
| `implemented/feature-<thema>-<JJJJ-MM-TT-hhmm>.md` | gebaut. Datum und Uhrzeit sind der Zeitpunkt, an dem es in `main` lag. |

Bis zum 29.08.2026 stand der Zustand im Dateinamen (`feature-implemented-…`).
Das hat funktioniert, solange es eine Handvoll Dateien waren; bei
einundzwanzig gebauten gegen zehn offene war der Ordner nur noch Archiv mit
ein paar aktuellen Dateien dazwischen. **Der Unterordner trennt schärfer als
ein Präfix**, und im Namen steht das Wort jetzt nicht mehr zweimal.

**Umgezogen wird beim Merge**, nicht vorher — ein halb gebautes Feature bleibt
liegen, wo es liegt. Weil die `id` einer Datei ihr Pfad ist, ändern sich dabei
die Links: wer verschiebt, sucht einmal nach dem alten Pfad und zieht Roadmap,
`AGENTS.md` und die anderen Feature-Dateien nach. Aus `implemented/` heraus
zeigen Links mit `../` auf die offenen Dateien.

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
| [`implemented/`](implemented) | je ein gebautes Feature, mit Datum im Namen |

### Was gebaut ist

Von unten nach oben, neueste zuerst.

| Feature | Wann |
|---|---|
| [Jede Antwort geht zum Server](implemented/feature-ereignisse-melden-2026-08-30-1000.md) | 30.08. 10:00 |
| [Die Ereignistabelle mit Row Level Security](implemented/feature-ereignistabelle-2026-08-30-0815.md) | 30.08. 08:15 |
| [Test und Produktion](implemented/feature-releases-2026-08-30-0803.md) | 30.08. 08:03 |
| [Die zweite Naht zum Server](implemented/feature-backend-naht-2026-08-29-2225.md) | 29.08. 22:25 |
| [Wie die Oberfläche getestet wird](implemented/feature-ui-tests-2026-08-29-1943.md) | 29.08. 19:43 |
| [Dein Fleiß](implemented/feature-fleiss-2026-08-29-1551.md) | 29.08. 15:51 |
| [Den Lernfortschritt sehen](implemented/feature-fortschritt-2026-08-29-1531.md) | 29.08. 15:31 |
| [Der Lernstand je Vokabel](implemented/feature-lernstand-2026-08-29-1531.md) (Stufe 1) | 29.08. 15:31 |
| [Das Seitenmenü](implemented/feature-seitenmenue-2026-08-29-1348.md) | 29.08. 13:48 |
| [Auf dem Homebildschirm](implemented/feature-homebildschirm-2026-08-29-1327.md) | 29.08. 13:27 |
| [Welche Karten drankommen](implemented/feature-auswahl-2026-08-29-1327.md) (Stufe 1) | 29.08. 13:27 |
| [Die Speicher-Naht am Gerät](implemented/feature-storage-2026-08-29-1327.md) | 29.08. 13:27 |
| [Rote Tests blockieren den Merge](implemented/feature-tests-in-ci-2026-08-25-2243.md) | 25.08. 22:43 |
| [Wie streng die App prüft](implemented/feature-pruefstrenge-2026-08-25-2231.md) | 25.08. 22:31 |
| [Kleinkram in der Oberfläche](implemented/feature-kleinkram-2026-08-25-2231.md) | 25.08. 22:31 |
| [Die App passt auf ein schmales Handy](implemented/feature-mobile-390-2026-08-25-2231.md) | 25.08. 22:31 |
| [Der Moment nach der Runde](implemented/feature-nach-der-runde-2026-08-25-2212.md) | 25.08. 22:12 |
| [Die Lernpotential-Runde](implemented/feature-lernpotential-2026-08-24-2211.md) | 24.08. 22:11 |
| [Übungsblatt oder Arbeit](implemented/feature-arbeit-oder-uebungsblatt-2026-08-24-2022.md) | 24.08. 20:22 |
| [Die Ergebnisse nachlesen](implemented/feature-ergebnisliste-2026-08-24-2022.md) | 24.08. 20:22 |
| [Das Ergebnis als Schulnote](implemented/feature-schulnoten-2026-08-22-1115.md) | 22.08. 11:15 |
| [Die Roadmap](implemented/feature-roadmap-2026-08-21-1839.md) | 21.08. 18:39 |
| [Fokus auf das aktuelle Lernziel](implemented/feature-fokus-auf-verben-2026-08-21-1712.md) | 21.08. 17:12 |
| [Eine zweite Chance bei Fehlern](implemented/feature-zweite-chance-2026-08-21-1712.md) | 21.08. 17:12 |
| [Zwei Easter Eggs im Eingabefeld](implemented/feature-easter-eggs-2026-08-21-1712.md) | 21.08. 17:12 |
| [Töne für die Rückmeldung](implemented/feature-rueckmeldungstoene-2026-08-21-1712.md) | 21.08. 17:12 |
| [Unregelmäßige Verben mit drei Formen](implemented/feature-formen-modus-2026-08-20-2029.md) | 20.08. 20:29 |
| [Die App liegt unter einer öffentlichen URL](implemented/feature-deploy-auf-pages-2026-08-20-1558.md) | 20.08. 15:58 |
| [Die Kartenabfrage](implemented/feature-kartenabfrage-2026-08-20-1454.md) | 20.08. 14:54 |

### Was durchdacht ist und wartet

| Feature | Wer |
|---|---|
| [Die Vokabeln der 5. Klasse hereinholen](feature-request-vokabel-import-klasse-5.md) | Matilda, Einsammeln Thomas |
| [Alle drei Zeiten auf einer Karte](feature-request-drei-zeiten.md) | Thomas |
| [Tipps, die zur Frage passen](feature-request-tipps.md) | Thomas, Texte Matilda |
| [Technisches Monitoring](feature-request-monitoring.md) | Thomas |
| [Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md) | Entscheidung |
| [Ob die Abfragerichtung umschaltbar wird](feature-request-richtung.md) | Entscheidung |
| [Leitner-Fächer mit Wiedervorlage](feature-request-leitner.md) | Thomas, Entscheidung gegen die Gewichtung |

#### Der Weg zu Supabase, in der Reihenfolge

Sieben Dateien, die zusammengehören: erst die Datenbank, dann die Anmeldung.
Jede ist einzeln baubar und einzeln mergebar — deshalb sind es sieben und
nicht eine. Refined am 29.08.2026, nachdem Supabase eingerichtet war; die
Vorgeschichte steht in
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md).

```
   1 backend-naht ✓ ──┐
                      ├──▶ 3 ereignisse-melden ✓ ──▶ 4 umzug-des-bestands ✓
   2 ereignistabelle ✓┘                                      │
           │                              (jede Antwort liegt jetzt doppelt)
           └──▶ 10 releases ✓                                │
                                                             ▼
                            ┌──▶ 6 server-ist-die-wahrheit ──▶ 8 missionen
                 5 konten ──┼──▶ 7 kinderdaten                    │
                            └──▶ 11 hosting (Vercel)              ▼
                                                          9 wuerdigung (offen)
```

**Phase 1 ist seit dem 30.08.2026 vollständig** — 1 bis 4 stehen, und damit
liegt der Lernstand nicht nur im Browser, sondern auch auf einem Server, der
gesichert werden kann.

**Die Beobachtung danach ist gelaufen und am 04.09.2026 ausgewertet:** an vier
von fünf Tagen wurde geübt, die letzte Zeile kam am Abend vorher an, insgesamt
1397. Die Sicherung hat also fünf Tage lang unbemerkt funktioniert — genau das
sollte sie zeigen. **Damit ist 5 frei.**

Zwei Nebenbefunde stehen dabei fest und gehören in die Konten-Arbeit:

- **Matildas uid ist bekannt** und hat 569 Zeilen. Sie bekommt Adresse und
  Passwort; die übrigen sechs Nutzer in `VocApp` sind Streuzeilen ohne Besitzer,
  unter anderem von Klicks auf die neue Adresse. Seit dem 05.09.2026 steht die
  uid in [Konten](feature-request-konten.md) — mitsamt den Geräte-Ids und dem
  SQL zum Nachzählen. Aufgeschrieben, weil eine anonyme uid keinen Namen trägt
  und sich später nicht mehr erraten lässt. **Am 05.09.2026 kam eine zweite
  Entscheidung dazu:** was vom MacBook stammt, wird mit Thomas' Konto
  verknüpft, nicht mit Matildas — das ist gebaut und getestet, kein Lernstand.
  Entschieden am 04.09.2026:
  **sicherzustellen ist nur Matildas Stand**, alles andere wird vernachlässigt.
- **107 doppelte Antworten** liegen in der Tabelle — die Überschneidung zwischen
  Melden und Umzug. Folgenlos, solange lokal die Wahrheit ist; entdoppelt wird
  beim Lesen, siehe
  [Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md).


| # | Feature | Wer |
|---|---|---|
| 5 | [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md) | Thomas, Entscheidung: wer legt Konten an |
| 6 | [Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) | Thomas |
| 7 | [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md) | Thomas |
| 8 | [Gemeinsame Lernmissionen](feature-request-missionen.md) | Thomas, Ziele Matilda |
| 9 | [Würdigung statt Rangliste](feature-request-wuerdigung.md) | **offen** — Thomas und Matilda gemeinsam |

Zwei kommen dazu, die nicht am Lernstand hängen, sondern am Betrieb — sie
reihen sich nach 1 und 2 ein:

| # | Feature | Wer |
|---|---|---|
| 11 | [GitHub Pages ablösen](feature-request-hosting.md) | Thomas |

**Datei 11 darf nicht vor 1–5 kommen.** Ein Adresswechsel leert
`localStorage` — und dort liegt nicht nur der Lernstand, sondern auch der
Sitzungstoken. Der ist bei einem anonymen Nutzer der einzige Ausweis: ohne ihn
gehören die Zeilen auf dem Server einer uid, in die sich niemand mehr anmelden
kann. Erst ein Konto mit Mailadresse (Datei 5) macht den Umzug harmlos. Der
ganze Grund steht in der Datei.

Darauf bauen die letzten beiden auf, möglich geworden, seit *„Was ist ein
Punkt?"* am 29.08.2026 beantwortet ist. **Datei 9 ist die einzige der neun, die
noch eine offene Entscheidung enthält** — sie ist eine Entscheidungsdatei wie
[Richtung](feature-request-richtung.md) und keine Bauanleitung. Eine Rangliste
von Platz 1 bis 12 wird es nicht geben.

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

Punkt 1 war der Grund, warum `storage.js` refined wurde, obwohl es allein
nichts sichtbar macht: es blockierte nichts und machte dafür dem Seitenmenü
und der Kartenauswahl den Weg frei. Am 29.08.2026 ist es gebaut, und beide
sind seitdem entstanden — der Punkt hat sich also bewährt. Und Punkt 3 ist
der Grund, warum
**„Was ist ein Punkt?" im Backlog steht** — an dieser einen unbeantworteten
Frage hängt alles, was mehrere Nutzer betrifft.

Zwei Dateien sind bewusst **keine** Bauanleitung, sondern eine Entscheidung:
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md) und
[Ob die Abfragerichtung umschaltbar wird](feature-request-richtung.md). Sie
stehen hier, weil sie sonst als halb fertiger Code oder als Bauchgefühl
weiterleben.

Eine dritte war
[Wie die Oberfläche getestet wird](implemented/feature-ui-tests-2026-08-29-1943.md).
Sie zeigt, wie so eine Datei endet: **die Entscheidung steht jetzt darin**,
mitsamt dem, was verworfen wurde und warum. Eine Entscheidungsdatei zieht also
genauso nach `implemented/` um wie eine Bauanleitung — was gebaut wurde, ist
dann die Entscheidung selbst.

## Wiederkehrendes

Was in keiner Feature-Datei steht, weil es nie fertig ist. Kam aus den
Sprint-Dateien hierher:

- **Matilda schreibt nach einer Sitzung drei Dinge auf, die stören oder besser
  sein könnten.** Daraus ist mehr als ein Feature entstanden — die Modi und die
  Ergebnisliste zum Beispiel. In eine Datei, nicht auf einen Zettel.
- **Mindestens eine Änderung von Matilda geht selbst nach `main`** — eigener
  Branch, Pull Request, Merge. Der Git-Ablauf ist Teil des Lernziels und wird
  bewusst von Hand gemacht.
- **Vor dem Pull Request einmal `npm test`.** Seit dem 25.08.2026 prüft das
  auch [GitHub bei jedem Pull Request](implemented/feature-tests-in-ci-2026-08-25-2243.md)
  und blockiert den Merge, wenn es rot ist. Vorher selbst zu testen spart
  trotzdem die Wartezeit.

Was wir **nicht** bauen, steht nicht hier, sondern in `AGENTS.md` unter
„Out of Scope" — damit es nicht alle paar Monate neu diskutiert wird.
