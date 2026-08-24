# Feature: Die Optionsseite

**Status:** in [Sprint 3](sprint-03.md)
**Wo im Code:** `optionen.html`, `src/ui/` — neu

Eine eigene Seite, auf der man einstellt, wie geübt wird. Nicht als Klappe
oder Dialog in der Karte, sondern als zweite Seite: Üben und Einstellen sind
zwei verschiedene Situationen, und die Karte soll leer bleiben.

## Warum eine echte zweite Seite

Vite kann mehrere Einstiegspunkte — `optionen.html` kommt als Eintrag in
`rollupOptions.input`, fertig. **Kein Router, keine neue Abhängigkeit, keine
Zustandsverwaltung.** Ein Link hin, ein Link zurück. Auf GitHub Pages
funktioniert das ohne Server-Konfiguration, weil es eine echte Datei ist.

## Die drei Schalter zum Start

| Schalter | Werte |
|---|---|
| Töne | an / aus |
| Was wird geübt | Vokabeln / unregelmäßige Verben / beides |
| Richtung | Englisch → Deutsch / Deutsch → Englisch |

Der Ton-Schalter ist der einfachste erste Kunde für die Speicher-Naht: ein
`true`/`false`, an dem man sieht, ob sie funktioniert, bevor Wichtigeres
durchgeht.

Die Richtungswahl ist fast geschenkt — die Radios **stehen schon** in
`index.html` und sind in `ui.js` verdrahtet, sie werden nur nicht aufgerufen
und bleiben deshalb ausgeblendet. Sie müssen nur auf die Optionsseite
umziehen.

## Voraussetzungen

- [Einstellungen speichern](feature-request-einstellungen-speichern.md) — sonst ist
  jede Einstellung beim Neuladen wieder weg
- [Übungsauswahl](feature-request-uebungsauswahl.md) liefert den mittleren Schalter

## Später

Weitere Schalter kommen dazu, sobald es sie gibt: einzelne Lektionen, das
[Namensfeld](feature-request-namensfeld.md), Rundenlänge. Die Seite ist dafür angelegt
— jeder Schalter ist eine Zeile mehr, kein Umbau.

## Matildas Teil

Die Gestaltung. Die Seite soll aussehen wie die App, nicht wie ein
Einstellungsmenü aus einem Programm.
