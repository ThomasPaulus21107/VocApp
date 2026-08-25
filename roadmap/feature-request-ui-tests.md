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

## Voraussetzungen

Keine. Kann jederzeit passieren.

## Nicht verwechseln mit

[Rote Tests blockieren den Merge](feature-request-tests-in-ci.md) — dort geht es
darum, die vorhandenen Tests verbindlich zu machen. Das ist unabhängig davon
und braucht keine neue Abhängigkeit.
