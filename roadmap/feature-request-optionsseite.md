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

## Die Blockade ist weg

Bis zum 29.08.2026 stand hier: „Die Seite wird erst gebaut, wenn es zwei
Schalter zu zeigen gibt" — und es gab nur einen. Inzwischen sind es genug:

| Schalter | Kommt aus |
|---|---|
| Töne an/aus | [`storage.js`](feature-request-storage.md), steht bis dahin auf der Startseite |
| Aufgabenart: Lücke oder alle drei Zeiten | [Alle drei Zeiten](feature-request-drei-zeiten.md) |
| Was wird geübt: Verben, Vokabeln, beides | [Vokabel-Import](feature-request-vokabel-import-klasse-5.md) |
| Richtung | eigene Entscheidung, siehe [Richtung](feature-request-richtung.md) |

Gebaut wird sie, sobald der zweite davon existiert — das ist nach heutigem
Stand die Aufgabenart.

## Voraussetzungen

- [Die Speicher-Naht am Gerät](feature-request-storage.md) — sonst ist jede
  Einstellung beim Neuladen wieder weg
- **Mindestens zwei Schalter**, die es zu zeigen lohnt

## Später

Weitere Schalter kommen dazu, sobald es sie gibt: einzelne Lektionen,
Rundenlänge, und mit [mehreren Nutzern](feature-request-mehrere-nutzer.md) der
Link zur Anmeldung. Die Seite ist dafür angelegt — jeder Schalter ist eine
Zeile mehr, kein Umbau.

Ein Namensfeld gehört ausdrücklich **nicht** dazu. Es war der Ersatz für
Konten und ist mit ihnen hinfällig geworden; der Eintrag liegt seit dem
29.08.2026 wieder im [Backlog](backlog.md).

## Matildas Teil

Die Gestaltung. Die Seite soll aussehen wie die App, nicht wie ein
Einstellungsmenü aus einem Programm.
