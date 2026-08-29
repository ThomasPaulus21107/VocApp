# Feature: Die Speicher-Naht am Gerät

**Status:** umgesetzt am 29.08.2026 um 13:27, [PR #20](https://github.com/ThomasPaulus21107/VocApp/pull/20)
**Wo im Code:** `src/infra/storage.js` — neu

Was man einstellt, soll beim nächsten Öffnen noch da sein. Das ist der
sichtbare Teil. Der wichtigere ist unsichtbar: **dies ist die einzige Stelle
im Projekt, die `localStorage` kennt.**

Hieß bis zum 29.08.2026 `feature-request-einstellungen-speichern.md`. Der
Name beschrieb den ersten Kunden, nicht die Sache — die Roadmap hat die Datei
in ihren Links ohnehin schon `storage.js` genannt.

## Zwei Nähte, nicht eine

Das ist die Korrektur vom 29.08.2026. Bis dahin stand hier, diese Datei werde
später gegen Supabase getauscht. Das war falsch gedacht:

| | `infra/storage.js` | `infra/backend.js` |
|---|---|---|
| Gehört zu | dem **Gerät** | der **Person** |
| Was liegt drin | Töne an/aus, Aufgabenart, zuletzt gewählter Modus | Lernstand, Punkte, Missionen |
| Technik | `localStorage`, synchron | Supabase, asynchron |
| Wird getauscht | **nie** | ist von Anfang an das Ziel |

Ob am Küchentisch der Ton an ist, ist eine Eigenschaft des Küchentisch-Laptops
und soll dem Handy egal sein. Ob `caught` sitzt, ist eine Eigenschaft von
Matilda und muss ihr auf jedes Gerät folgen. Beides in eine Naht zu zwingen
hieße, eines von beiden falsch zu machen.

Diese Datei beschreibt nur die erste. Die zweite steht in
[Der Lernstand je Vokabel](../feature-request-lernstand.md).

## Was drinsteht

```
speichern(schluessel, wert)
lesen(schluessel, standard)
```

Mehr nicht. Kein JSON-Schema, keine Migrationslogik, kein Cache. Synchron,
weil `localStorage` synchron ist — und weil hier nichts liegt, dessen Verlust
mehr kostet als ein Achselzucken.

## Was hier bewusst nicht durchgeht

**Kein Lernstand, keine Punkte.** Nicht, weil das Format noch nicht steht,
sondern aus einem härteren Grund: `localStorage` in fremden Browsern ist
**nicht migrierbar und nicht wiederherstellbar**. An zwölf Kinderbrowser kommt
niemand je wieder heran; ein privates Fenster oder ein geleerter Cache löscht
alles ersatzlos, und ein Kind mit Handy und Laptop hätte zwei Stände, die
nichts voneinander wissen.

Die Faustregel: **hier darf nur liegen, was man jederzeit wegwerfen würde.**

Das `zuletzt` aus [Welche Karten drankommen](feature-auswahl-2026-08-29-1327.md)
erfüllt das und darf hier rein: geht es verloren, sehen alle Karten gleich alt
aus, und nach vier Runden ist der Zustand von selbst wiederhergestellt.

### Eine benannte Ausnahme, befristet

Der [Lernstand je Vokabel](../feature-request-lernstand.md) in seiner Stufe 1
erfüllt die Faustregel **nicht** — eine über Monate gewachsene Statistik will
niemand wegwerfen. Er liegt trotzdem hier, und zwar bewusst und unter drei
Bedingungen:

1. Solange die App **einen** Nutzer hat. Ab dem ersten fremden Kind gilt die
   Regel wieder ohne Ausnahme.
2. Mit einem **„Statistik sichern"-Knopf**, der die JSON als Datei
   herunterlädt — auf dem iPhone die einzige Kopie, die eine Ferienlücke
   übersteht, und deshalb keine Kür. Dazu
   [Auf dem Homebildschirm](feature-homebildschirm-2026-08-29-1327.md), weil iOS
   `localStorage` sonst nach sieben Tagen ohne Benutzung löscht.
3. Mit Postgres als **geplantem** Ziel, nicht als vagem Später — der
   Ringpuffer aus Stufe 1 ist genau das, was später hochgeladen wird.

Das ist der Unterschied zwischen einer Ausnahme und einer aufgeweichten Regel:
sie hat einen Namen, einen Grund und ein Ablaufdatum.

## Der erste Kunde wurde ein anderer

Hier stand, der Töne-Schalter komme mit der Naht zusammen, „damit sie nicht
als Datei ohne Benutzer entsteht". Gebaut wurde sie dann mit dem
[Kartenbeutel](feature-auswahl-2026-08-29-1327.md) als erstem
Kunden — der erfüllt denselben Zweck besser, weil an ihm etwas hängt.

Der Schalter kam am 29.08.2026 um 13:48 mit dem
[Seitenmenü](feature-seitenmenue-2026-08-29-1348.md) nach. Der
Abschnitt darunter beschreibt, was gedacht war.

## Der erste Kunde: Töne an/aus

Damit die Naht nicht als Datei ohne Benutzer entsteht, kommt **ein** Schalter
gleich mit. Ein `true`/`false` — daran sieht man, ob Speichern und Lesen
funktionieren, bevor Wichtigeres durchgeht.

Er sitzt vorerst klein auf der **Startseite**, unter der Wahl zwischen
Übungsblatt und Arbeit, und zieht auf die
[Seitenmenü](feature-seitenmenue-2026-08-29-1348.md) um, sobald es die gibt.

## Was es freischaltet

Das Seitenmenü und die Wahl der Aufgabenart aus
[Alle drei Zeiten](../feature-request-drei-zeiten.md). Es blockiert nichts,
kostet einen Abend und ist danach nie wieder Thema.

## Zu beachten

- `localStorage` kann fehlschlagen (privates Fenster, volle Quote). Ein
  fehlgeschlagenes Speichern darf die App nicht anhalten — im Zweifel gilt der
  Standardwert. Jeder Zugriff gehört in `try/catch`.
- Der Speicher hängt am Browser, nicht an der Person. Wer sich einen Rechner
  teilt, teilt sich die Einstellungen. Das ist hier **richtig so** und kein
  Mangel — die Person kommt über
  [Mehrere Nutzer](../feature-request-mehrere-nutzer.md) und echte Konten, nicht
  über einen Namen im Speicherschlüssel.
