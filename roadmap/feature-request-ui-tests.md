# Feature: Entscheiden, wie die Oberfläche getestet wird

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `tests/`, `package.json`

Kein Feature für die App, sondern eine Entscheidung über eine neue
Abhängigkeit. Sie steht hier, weil sie denselben Weg gehen soll wie alles
andere.

## Der Anlass

Am 20.08.2026 ist ein Fehler durchgerutscht, den kein Test finden konnte
([PR #8](https://github.com/ThomasPaulus21107/VocApp/pull/8)):
`display: flex` hat das `hidden`-Attribut überstimmt, die Formenzeile blieb
sichtbar stehen. Reine Funktionstests sehen so etwas nie — sie kennen kein
Layout.

## Zur Wahl

| | jsdom | Playwright |
|---|---|---|
| Was es ist | ein nachgebautes DOM in Node | ein echter Browser |
| Findet den Sprint-1-Fehler | **nein** — kennt kein CSS-Layout | ja |
| Laufzeit | Millisekunden | Sekunden, plus Installation in der CI |
| Neue Abhängigkeit | eine kleine | eine große |

Das ist die unangenehme Pointe: die billige Variante hätte genau den Fehler
nicht gefunden, der der Anlass war.

## Dritte Möglichkeit

Nichts einbauen und stattdessen weiter am Handy nachsehen. Bei zwei
Bildschirmen ist das vertretbar — es sollte dann aber eine Entscheidung sein
und keine Unterlassung.

**Seit dem 29.08.2026 hat das mehr Gewicht:** geübt wird primär auf dem
iPhone, also ist der Blick aufs Telefon nicht mehr die Notlösung, sondern der
realistischste Test, den es gibt. Das spricht gegen jsdom — ein nachgebautes
DOM sagt über eine offene iOS-Tastatur genau nichts. Es spricht aber auch
dafür, die Sache endlich zu entscheiden: Playwright kann iPhone-Abmessungen
nachstellen, von Hand nachsehen kann das auch, und nur eines von beidem
passiert zuverlässig vor jedem Merge.

## Es ist dringender geworden

Stand 29.08.2026. Drei Dinge, die inzwischen in der Roadmap stehen, sind genau
die Sorte Änderung, bei der der Sprint-1-Fehler wieder passiert:

- **Drei Eingabefelder** statt einem in [Alle drei Zeiten](feature-request-drei-zeiten.md),
  auf 390 px, mit Tab-Reihenfolge — dieselbe Formenzeile, die schon einmal am
  Layout gescheitert ist
- **Drei weitere Seiten** ([Seitenmenü](implemented/feature-seitenmenue-2026-08-29-1348.md),
  [Fortschritt](implemented/feature-fortschritt-2026-08-29-1531.md),
  [Fleiß](implemented/feature-fleiss-2026-08-29-1551.md)), die kein Test je öffnet —
  auf der Fleiß-Seite inzwischen mit anklickbaren Balken, also mit Verhalten
  und nicht nur mit Layout
- **Fremde Nutzer.** Heute sagt Matilda beim Abendessen, dass etwas kaputt ist.
  Ein Dutzend Kinder sagt gar nichts, sie hören auf.

Die dritte Möglichkeit unten — nichts einbauen und am Handy nachsehen — trägt
genau bis zu diesem Punkt und nicht weiter.

## Voraussetzungen

Keine. Kann jederzeit passieren.

## Nicht verwechseln mit

[Rote Tests blockieren den Merge](implemented/feature-tests-in-ci-2026-08-25-2243.md) — dort geht es
darum, die vorhandenen Tests verbindlich zu machen. Das ist unabhängig davon
und braucht keine neue Abhängigkeit.
