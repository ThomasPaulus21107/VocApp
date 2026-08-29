# Feature: Jede Antwort geht zum Server

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/infra/backend.js`, `src/app.js`, `tests/backend.test.js`

Der Schritt, nach dem die Sicherung wirklich existiert: **jede Antwort und jede
gezogene Karte liegt zusätzlich auf einem Server, den man sichern kann.**

Für Matilda ändert sich dabei nichts. Kein Knopf, keine Wartezeit, keine
Meldung. Genau das ist die Abnahme.

## Lokal bleibt vorerst die Wahrheit

`app.js` rechnet weiter wie heute mit `localStorage`, und `backend.js` schiebt
dasselbe Ereignis zusätzlich nach Postgres. Der Server ist in diesem Schritt
ein **Spiegel**, keine Quelle.

Das ist bewusst der kleine Weg. Er bringt sofort, worauf es zuerst ankommt —
eine Kopie, die eine Ferienlücke auf dem iPhone übersteht — und er kann fast
nichts kaputtmachen: fällt der Server aus, merkt die App es nicht. Das
Umdrehen ist ein eigenes Feature und kommt später, siehe
[Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md).

## Der Ausgangskorb

`melde()` sendet nicht, sondern **legt ab**. Eine Liste in `localStorage`,
hinten kommt rein, vorne geht raus, sobald ein Versand geklappt hat.

Kein Netz, Flugmodus, Server aus, U-Bahn: die Zeile bleibt liegen und geht beim
nächsten Start raus. Ohne den Korb wäre jede Antwort ohne Empfang für immer
weg — und geübt wird auf einem Telefon.

Das ist **kein** Widerspruch zu der Regel aus `AGENTS.md`, dass in `storage.js`
nur liegen darf, was man jederzeit wegwerfen würde: ein Ausgangskorb ist genau
das. Was drinsteht, steht auch im lokalen Lernstand.

## Damit nichts doppelt ankommt

Zwei Dinge, die zusammengehören:

- Eine `crypto.randomUUID()` als **`geraet`**, einmal erzeugt und in
  `localStorage` abgelegt, daneben ein hochzählender Zähler als **`nummer`**.
- Der Versand als
  `upsert(zeilen, { onConflict: 'nutzer,geraet,nummer', ignoreDuplicates: true })`.

Damit ist jeder Versand wiederholbar. Bricht die Verbindung ab, nachdem der
Server geschrieben, aber bevor die App es erfahren hat, wird beim nächsten
Anlauf dieselbe Zeile geschickt — und nichts passiert. Das ist wichtiger, als
es klingt: ohne diese beiden Spalten wäre der Ausgangskorb eine Maschine, die
Antworten vervielfältigt.

## Die drei Anschlüsse

Alle drei in `app.js`. **In `domain/` wird keine Zeile angefasst** — dort kommen
Ereignisse als Argumente herein und Bewertungen heraus, und dabei bleibt es.

| Stelle | Ergänzung |
|---|---|
| `merkeAuswahl()` | je gezogener Einheit ein `melde({ art: 'gezogen', … })` |
| nach `verrechne(...)` | `melde({ art: 'antwort', … })` — dasselbe Objekt, das schon an `verrechne()` geht |
| ganz unten | `backend.starte();` |

## Kein einziges `await` in app.js

`backend.starte()` wird **ohne `await`** aufgerufen, und das ist keine
Nachlässigkeit, sondern der Punkt: weil lokal die Wahrheit ist, hängt nichts am
Server. Die App startet wie bisher sofort, auch wenn Supabase gerade nicht
antwortet.

Das eine `await` aus dem Muster in
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md) kommt erst,
wenn der Server die Wahrheit wird.

## Tests

Die reinen Teile werden exportiert und ohne Netz geprüft:

- `zuEreignis(ergebnis, geraet, nummer)` — aus dem Objekt, das `verrechne()`
  bekommt, wird eine Tabellenzeile. Auch für `art: 'gezogen'`.
- `naechsteNummer(stand)` — zählt hoch und fängt nach einem geleerten Korb
  nicht wieder bei null an.
- Der Korb überlebt einen fehlgeschlagenen Versand und ist nach einem
  erfolgreichen leer.
- Ohne Konfiguration wirft `melde()` nicht.

Dazu von Hand, weil kein Test es prüfen kann:

1. **Flugmodus.** Netz aus, Runde spielen — die App läuft ohne Ruckeln. Netz
   an, neu laden: die Zeilen gehen nach.
2. **Zweimal neu laden**, während der Korb voll ist: die Zeilenzahl in Supabase
   bleibt gleich.

## Voraussetzung

[Die zweite Naht zum Server](feature-request-backend-naht.md) und
[Die Ereignistabelle](feature-request-ereignistabelle.md), beide gebaut.

## Was danach kommt

[Der Bestand zieht um](feature-request-umzug-des-bestands.md) — ab hier
sammelt der Server nur, was neu passiert. Das Alte fehlt noch.
