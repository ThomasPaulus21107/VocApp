# Feature: Die Optionsseite

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `optionen.html`, `src/ui/` — neu

Eine eigene Seite, auf der man einstellt, wie geübt wird. Nicht als Klappe
oder Dialog in der Karte, sondern als zweite Seite: Üben und Einstellen sind
zwei verschiedene Situationen, und die Karte soll leer bleiben.

## Warum eine echte zweite Seite

Vite kann mehrere Einstiegspunkte — `optionen.html` kommt als Eintrag in
`rollupOptions.input`, fertig. **Kein Router, keine neue Abhängigkeit, keine
Zustandsverwaltung.** Ein Link hin, ein Link zurück. Auf GitHub Pages
funktioniert das ohne Server-Konfiguration, weil es eine echte Datei ist.

## Was auf die Seite kommt

Aufgeteilt am 2026-08-25. Vorher standen hier drei Schalter, von denen unter
dem Verb-Fokus keiner übrig blieb:

| Schalter | Wo er jetzt steht |
|---|---|
| Töne an/aus | zieht mit [`storage.js`](feature-request-einstellungen-speichern.md) vor, vorerst auf der Startseite |
| Was wird geübt | ruht mit dem Vokabel-Strang, siehe `backlog.md` |
| Richtung | eigene Entscheidung, siehe [Richtung](feature-request-richtung.md) |

**Die Seite selbst wird damit erst gebaut, wenn es zwei Schalter zu zeigen
gibt.** Vorher ist sie eine leere Seite mit einem Link darauf. Das ist keine
Absage, sondern eine Reihenfolge: erst die Schalter, dann der Ort für sie.

Was dann als Erstes darauf gehört, ist der Töne-Schalter — er zieht von der
Startseite um, wo er nur zwischengeparkt ist.

## Voraussetzungen

- [Einstellungen speichern](feature-request-einstellungen-speichern.md) — sonst ist
  jede Einstellung beim Neuladen wieder weg
- **Mindestens zwei Schalter**, die es zu zeigen lohnt

## Später

Weitere Schalter kommen dazu, sobald es sie gibt: einzelne Lektionen, das
[Namensfeld](feature-request-namensfeld.md), Rundenlänge. Die Seite ist dafür angelegt
— jeder Schalter ist eine Zeile mehr, kein Umbau.

## Matildas Teil

Die Gestaltung. Die Seite soll aussehen wie die App, nicht wie ein
Einstellungsmenü aus einem Programm.
