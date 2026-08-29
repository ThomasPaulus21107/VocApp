# Feature: Die Ereignistabelle mit Row Level Security

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `supabase/schema.sql` — neu. Kein JavaScript.

Eine Tabelle und vier Zeilen Sicherheit. Die Datei liegt versioniert im Repo
und wird im SQL-Editor eingefügt — die Supabase-CLI wäre eine weitere
Abhängigkeit und lohnt für eine Tabelle nicht.

**Sie läuft zweimal**, einmal je Projekt: es gibt eine Spielwiese für lokal und
ein echtes für GitHub Pages, siehe
[Die zweite Naht zum Server](feature-request-backend-naht.md). Genau dafür ist
sie eine Datei im Repo und kein einmal getippter Text — sonst driften die
beiden nach der zweiten Änderung auseinander, und das merkt man erst, wenn ein
Insert nur in einem von beiden funktioniert.

## Ereignisse, keine Zustände

`AGENTS.md` legt das Format seit dem Lernstand fest: *„Gespeichert werden dort
**Ereignisse** (eine Zeile je Antwort), nicht errechnete Zustände — das ist das
einzige Format, das sich später nicht festlegt."*

Die Tabelle bildet deshalb genau die Zeile ab, die `verrechne()` in
`src/domain/lernstand.js` heute schon in `verlauf` schreibt. Nichts wird neu
erfunden, nichts wird vorberechnet. Wer in einem Jahr ein anderes
Könnens-Modell will, rechnet es aus denselben Zeilen neu — statt ein
fortgeschriebenes fortzuschreiben.

Das war die offene Frage im Backlog-Eintrag „Lernstand pro Karte speichern",
und sie ist damit auch für den Server beantwortet.

## Zwei Arten in einer Tabelle

Es gibt zwei Ereignisse, nicht eins:

- **`antwort`** — aus `verrechne()`. Eine Karte wurde beantwortet.
- **`gezogen`** — aus `merkeGezogen()`. Eine Karte kam dran.

Das zweite sieht überflüssig aus und ist es nicht. `zieheRunde()` in
`src/domain/auswahl.js` entscheidet danach, **was am längsten nicht dran war**.
Ohne die gezogenen Ereignisse wüsste ein zweites Gerät das nicht und würde
falsch ziehen — und wer eine Runde abbricht, bekäme dieselben Karten sofort
wieder.

Eine zweite Tabelle dafür wäre die halbe Wahrheit an zwei Orten. Eine Spalte
`art` reicht.

## Das Schema

```sql
create table ereignisse (
  id       bigint generated always as identity primary key,
  nutzer   uuid not null default auth.uid() references auth.users on delete cascade,

  -- Woher die Zeile kam und die wievielte sie von dort war. Zusammen mit dem
  -- unique unten wird jeder Versand wiederholbar: ein Abbruch mitten im
  -- Senden legt beim naechsten Anlauf nichts doppelt an.
  geraet   text   not null,
  nummer   bigint not null,

  art      text not null check (art in ('gezogen', 'antwort')),
  karte    text not null,                    -- "uv-003"
  form     text,                             -- "simple-past", oder null
  runde    integer,                          -- nur bei 'gezogen'

  ausgang      text check (ausgang in ('richtig','falsch','uebersprungen','aufgegeben')),
  versuch      smallint,
  tipp         boolean,
  tippfehler   boolean,
  modus        text,
  wiederholung boolean,
  punkte       real,

  zeit     timestamptz not null,             -- die Uhr des Geraets, Date.now()
  tag      date,                             -- der lokale Tag des Geraets
  angelegt timestamptz not null default now(),

  unique (nutzer, geraet, nummer)
);

create index ereignisse_nutzer_zeit on ereignisse (nutzer, zeit);
```

Zu drei Spalten gehört ein Satz, den man sonst in einem Jahr sucht:

- **`zeit` kommt vom Gerät, `angelegt` vom Server.** Die App kennt keine
  Serveruhr, und `domain/` darf ohnehin nicht nach der Zeit fragen — sie wird
  hereingereicht. Gehen die beiden weit auseinander, war jemand offline.
- **`tag` ist der lokale Tag des Geräts**, nicht UTC. Um halb eins nachts
  gehört die Runde noch zum Vortag, so wie Matilda es auch empfinden würde.
  Genau das rechnet `app.js` heute schon mit `toLocaleDateString('sv')`.
- **`punkte` ist `real` und keine Ganzzahl.** Ein Tipp kostet 0,1, der zweite
  Versuch bringt 0,5.

## Row Level Security

```sql
alter table ereignisse enable row level security;

create policy "eigene lesen"     on ereignisse for select to authenticated using      (nutzer = auth.uid());
create policy "eigene schreiben" on ereignisse for insert to authenticated with check (nutzer = auth.uid());
```

**Das sind die vier wichtigsten Zeilen des ganzen Vorhabens.** GitHub Pages ist
statisch, der Publishable Key steht im ausgelieferten Bundle — RLS ist damit
das Einzige zwischen den Daten und dem offenen Netz. Ohne sie liest und
schreibt jeder mit den Entwicklertools jede Zeile.

**Kein `update`, kein `delete`.** Was passiert ist, ist passiert; eine
Ereignistabelle, in der man nachträglich ändern kann, ist keine. Gelöscht wird
über den Nutzer — das `on delete cascade` oben räumt hinterher, siehe
[Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

### Warum hier trotzdem niemand fremde Zeilen sieht

Am 29.08.2026 ist entschieden worden, dass **alle den Fortschritt aller sehen
dürfen, unter Pseudonymen**. Das ändert an dieser Tabelle nichts, und der Grund
dafür gehört genau hierher, weil er sonst beim nächsten Anfassen verlorengeht:

1. **`signInAnonymously()` steht jedem offen, der die Seite lädt.** Eine Policy
   `for select to authenticated using (true)` hieße wörtlich: wer die URL
   kennt, macht sich in einer Sekunde eine Sitzung und liest alles. „Angemeldet"
   ist hier keine Hürde.
2. **`ereignisse` ist kein Punktestand, sondern ein Tagebuch.** Jede Antwort mit
   Zeitstempel: wer um 23:40 übt, wer eine Vokabel elfmal falsch hatte, wer drei
   Wochen weg war. Das ist mehr, als „alle sehen alle Fortschritte" verlangt,
   und es lässt sich nicht wieder einsammeln.

**Geteilt wird deshalb nicht die Tabelle, sondern eine Zusammenfassung** —
Pseudonym und Zahlen, nicht Zeilen. Sie steht in
[Gemeinsame Lernmissionen](feature-request-missionen.md) und kommt erst mit den
Konten. Bis dahin bleibt es bei den zwei Policies oben.

**Wer später eine Lesepolicy auf dieser Tabelle aufmacht, hebt Punkt 1 auf.**
Dann ist die App offen, und zwar still.

## Die Abnahme

Nicht nebenbei, sondern als Bedingung: **solange dieser Test nicht gelaufen
ist, gilt das Feature als nicht gebaut.**

1. Zweites Browserprofil öffnen (das bekommt eine eigene anonyme Sitzung).
2. In der Konsole `supabase.from('ereignisse').select('*')`.
3. **Es müssen null Zeilen zurückkommen.**

**In beiden Projekten**, nicht nur in der Spielwiese. Die Policies im echten
Projekt sind die, auf die es ankommt, und sie sind auch die, die man beim
zweiten Einspielen vergisst.

Kommt auch nur eine fremde Zeile, ist die Tabelle offen und alles Weitere
wartet.

## Voraussetzung

Keine — die Tabelle lässt sich vor, nach oder neben
[Die zweite Naht zum Server](feature-request-backend-naht.md) anlegen. Beide
zusammen sind die Voraussetzung für
[Jede Antwort geht zum Server](feature-request-ereignisse-melden.md).
