# Feature: Jede Antwort geht zum Server

**Status:** umgesetzt am 30.08.2026 um 10:00, PR #52
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
[Der Server wird die Wahrheit](../feature-request-server-ist-die-wahrheit.md).

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
| ganz unten | statt `backend.starte()` ein `backend.holeNach()` — siehe unten |

### Angemeldet wird erst, wenn es etwas zu sichern gibt

[Die zweite Naht](feature-backend-naht-2026-08-29-2225.md) ruft `starte()` beim Laden
der Seite. Das war zum Prüfen richtig und ist auf Dauer falsch: **jeder
Seitenaufruf legt dann einen anonymen Nutzer an.** Am 29.08.2026 in
`VocApp TEST` nachgezählt — ein paar Testläufe, zehn Nutzer.

Die Seite liegt öffentlich im Netz. Ein neugieriger Klick, ein Crawler, ein
geteilter Link, ein privates Fenster: jedes Mal eine Zeile in `auth.users`, für
immer. Gefährlich ist das nicht — RLS hält, diese Nutzer sehen und schreiben
nichts — aber es wächst, und anonyme Nutzer zählen bei Supabase als aktive
Nutzer.

Also wandert der Aufruf nach innen: **`melde()` sorgt selbst dafür, dass eine
Sitzung da ist**, bevor der Ausgangskorb geleert wird. Wer die Seite nur
ansieht, bekommt kein Konto; wer eine Karte beantwortet, schon.

**Eine Sache fehlt dann aber**, und sie ist beim Bauen aufgefallen, nicht beim
Denken: ist `melde()` der einzige Auslöser, bleibt ein voller Korb nach einem
Neustart liegen, bis jemand die nächste Karte beantwortet. Wer im Flugmodus
geübt und die App danach geschlossen hat, verlöre seine Antworten bis zur
übernächsten Sitzung.

Deshalb gibt es zusätzlich **`holeNach()`** am Start der App. Es ist kein
Anmelden: ist der Korb leer, passiert gar nichts — und leer ist er bei jedem,
der nur guckt.

Das kostet nichts, und zwar aus zwei Gründen:

- **`melde()` legt nur ab und wartet auf niemanden.** Ob die Anmeldung eine
  halbe Sekunde braucht, merkt keiner — die Zeile liegt so lange im Korb.
- **Die `uid` braucht der Client gar nicht.** `nutzer uuid not null default
  auth.uid()` setzt der Server beim Einfügen. Der Korb funktioniert ohne sie,
  und eine Zeile, die vor der Anmeldung entstanden ist, bekommt beim Versenden
  denselben Nutzer wie alle anderen.

## Kein einziges `await` in app.js

`app.js` wartet auf nichts, was mit dem Server zu tun hat — und das ist keine
Nachlässigkeit, sondern der Punkt: weil lokal die Wahrheit ist, hängt nichts am
Server. Die App startet wie bisher sofort, auch wenn Supabase gerade nicht
antwortet.

Auch die Anmeldung aus dem Abschnitt oben bleibt **innerhalb** von
`backend.js`. Sie färbt nicht durch, weil niemand auf sie wartet: `melde()`
gibt nichts zurück, worauf man warten könnte.

Das eine `await` aus dem Muster in
[Ob die App mehrere Nutzer kennt](../feature-request-mehrere-nutzer.md) kommt erst,
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
3. **Die Seite öffnen und wieder schließen, ohne zu üben** — in
   `Authentication → Users` darf **kein** neuer Nutzer stehen. Das ist die
   Abnahme für den Abschnitt oben, und sie ist leicht zu vergessen, weil
   nichts kaputtgeht, wenn sie fehlschlägt: man merkt es erst an einer Zahl,
   die drei Monate später zu hoch ist.

## Voraussetzung

[Die zweite Naht zum Server](feature-backend-naht-2026-08-29-2225.md) und
[Die Ereignistabelle](feature-ereignistabelle-2026-08-30-0815.md), beide gebaut.

## Was danach kommt

[Der Bestand zieht um](../feature-request-umzug-des-bestands.md) — ab hier
sammelt der Server nur, was neu passiert. Das Alte fehlt noch.
