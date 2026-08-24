# Feature: Einstellungen, die bleiben

**Status:** in [Sprint 3](sprint-03.md)
**Wo im Code:** `src/infra/storage.js` — neu

Was man einstellt, soll beim nächsten Öffnen noch da sein. Das ist der
sichtbare Teil. Der wichtigere ist unsichtbar: **dies ist die einzige Stelle
im Projekt, die `localStorage` kennt.**

## Warum das eine eigene Schicht ist

`domain/` darf keine Persistenz kennen, `ui/` auch nicht. Also braucht es
einen dritten Ort. Später wird genau diese Datei gegen Supabase getauscht,
ohne dass Domäne oder UI davon erfahren — deshalb muss die Naht von Anfang an
sauber sein.

```
speichern(schluessel, wert)
lesen(schluessel, standard)
```

Mehr nicht. Kein JSON-Schema, keine Migrationslogik, kein Cache.

## Vorerst nur Einstellungen

Durch diese Naht gehen zunächst **ausschließlich Einstellungen**: Töne an/aus,
was geübt wird, in welche Richtung. Ein Lernstand **pro Karte** bewusst nicht.

Der Unterschied ist das Risiko. Einstellungen sind ein flaches Objekt mit ein
paar Schaltern — man kann es jederzeit erweitern, und wenn etwas kaputtgeht,
ist eine Vorliebe weg. Ein gespeicherter Lernstand legt sein Format dagegen
fest: jede spätere Änderung muss entweder damit leben oder Bestandsdaten
umziehen. Solange nur Einstellungen durchgehen, kostet ein Umbau nichts.

## Was es freischaltet

Das hier blockiert nichts und macht dafür mehreren Dingen den Weg frei:
[Optionsseite](feature-request-optionsseite.md), [Namensfeld](feature-request-namensfeld.md),
später Punkte und Streak und irgendwann Supabase. Wenn im Sprint etwas
gestrichen werden muss, dann nicht das.

## Zu beachten

- `localStorage` kann fehlschlagen (privates Fenster, volle Quote). Ein
  fehlgeschlagenes Speichern darf die App nicht anhalten — im Zweifel gilt der
  Standardwert.
- Der Speicher hängt am Browser, nicht an der Person. Wer sich einen Rechner
  teilt, teilt sich die Einstellungen. Dafür gibt es das
  [Namensfeld](feature-request-namensfeld.md).
