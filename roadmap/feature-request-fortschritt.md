# Feature: Den Lernfortschritt sehen

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `fortschritt.html`, `src/ui/` — neu

Eine Seite, die zeigt, was sitzt und was nicht. Für Matilda selbst und für
Thomas als Elternsicht.

Das ist die eine Hälfte von „Monitoring". Die andere — läuft die App
überhaupt — steht in [Technisches Monitoring](feature-request-monitoring.md)
und hat damit nur das Wort gemeinsam.

## Was darauf steht

Vier Dinge, mehr nicht:

1. **Wie viele der 159 Einheiten sitzen.** 53 Verben × 3 Formen, ein Balken.
   Das ist die Zahl, die Fortschritt fühlbar macht.
2. **Was immer wieder schiefgeht**, gruppiert nach `muster` — nicht als Liste
   einzelner Wörter, sondern als „`-ought` sitzt, `i – a – u` nicht".
3. **Die letzten Runden** mit Datum und Note, damit man eine Entwicklung sieht
   und nicht nur einen Zustand.
4. **Was lange nicht dran war.** Fällt als Nebenprodukt aus der Auswahl ab.

**Punkt 3 fehlt noch, und zwar aus einem konkreten Grund.** Der Lernstand
zählt je Einheit und führt einen Verlauf je *Antwort* — eine *Runde* als
Einheit gibt es darin nicht. Ihre Note ließe sich aus den Antworten
nachrechnen, aber nur ungefähr: eine abgebrochene Runde ist von einer
gespielten nicht zu unterscheiden.

Sauber wird es mit einem Eintrag je Runde (`{ rundeNr, punkte, karten, zeit }`)
im Lernstand. Das ist ein kleines eigenes Stück Arbeit und kein Nebenbei —
deshalb steht es hier und nicht im nächsten Commit.

## Warum eine eigene Seite

Wie bei der [Seitenmenü](feature-request-seitenmenue.md): Vite kann mehrere
Einstiegspunkte, `fortschritt.html` kommt als Eintrag in `rollupOptions.input`.
Kein Router, keine Abhängigkeit. Üben und Nachsehen sind zwei Situationen, und
die Karte soll leer bleiben.

## Die Elternsicht ist dieselbe Seite

Kein zweites Programm, kein Dashboard. Thomas sieht dieselbe Seite mit
Matildas Daten — was er darf und was nicht, entscheidet **Row Level Security
auf dem Server**, nicht ein Schalter in der Oberfläche.

Die Regel dazu: Eltern sehen den Fortschritt ihres Kindes, nicht den der
anderen. Sie steht in [Mehrere Nutzer](feature-request-mehrere-nutzer.md) als
offene Entscheidung und muss vorher fallen.

## Voraussetzungen

- [Der Lernstand je Vokabel](feature-request-lernstand.md) in **Stufe 1** —
  die lokale Fassung reicht vollständig. Weder Supabase noch eine Antwort auf
  die Punktefrage werden dafür gebraucht; die Elternsicht auf einem gemeinsamen
  Rechner funktioniert damit schon.
- [Tipps](feature-request-tipps.md) für das Feld `muster`, sonst fällt Punkt 2
  auf eine Wortliste zurück

## Zu beachten

- **Für ein Telefon entworfen, nicht für einen Bildschirm.** Geübt wird
  primär auf dem iPhone. Balken untereinander, keine breiten Tabellen, nichts,
  was quer scrollt.
- **Keine Diagrammbibliothek.** Ein Balken ist ein `div` mit einer Breite in
  Prozent. Die App hat kein Framework und braucht für vier Zahlen keins.
- **Fortschritt zeigen, nicht Versagen.** „Von 159 sitzen 94" ist dieselbe
  Information wie „65 sitzen nicht" und wirkt völlig anders. Die Seite soll
  gefährlich nah an Matildas Motivation gebaut werden — das ist Gestaltung und
  gehört ihr.
- Erst ab genug Runden aussagekräftig. Bis dahin lieber „noch zu wenig
  geübt, um etwas zu sagen" als eine Kurve aus drei Punkten.
