# Feature: Die App passt auf ein schmales Handy

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/ui/styles.css`

Bei 390 Pixeln Breite lief die Karte rechts aus dem Bild, bei 560 passte
alles. Das ist die Breite gängiger Handys — also genau das Gerät, auf dem
Matilda übt.

## Erst nachmessen, dann reparieren

**Die alte Diagnose stimmt nicht.** Notiert war „irgendwo sitzt eine
Mindestbreite um die 480px, die das Schrumpfen verhindert". In `styles.css`
gibt es aber keine einzige `min-width`. Was es gibt, ist `max-width: 30rem`
auf `.buehne` — das sind zwar exakt 480px, aber `max-width` begrenzt nach
oben und verhindert kein Schrumpfen.

Dazu steht überall `clamp()` mit `vw`-Anteil und `overflow-wrap: break-word`.
Das CSS sieht inzwischen so aus, als wäre das Problem beim Fokus-Umbau
mitbehoben worden.

**Erster Schritt ist deshalb Nachmessen, nicht Reparieren.** Gut möglich, dass
dieses Feature aus einer Bestätigung besteht.

## Wenn doch noch etwas klemmt

Die verbliebenen Verdächtigen bei 390px:

- Die Formenzeile: `grid-template-columns: repeat(3, 1fr)` mit drei Spalten
  nebeneinander. „past participle" ist lang.
- Das `padding: 1rem` am `body` plus die Innenabstände der Karte.

## Voraussetzungen

Keine.

## Wie es geprüft wird

In den Entwicklerwerkzeugen auf 390px stellen und **eine ganze Runde spielen**
— Karte, Tipp, falsche Antwort, Formenzeile, Ergebnis. Der Sprint-1-Fehler
(`display: flex` überstimmt `hidden`) ist genau deshalb durchgerutscht, weil
niemand den Zustand *nach* der Antwort angesehen hat.
