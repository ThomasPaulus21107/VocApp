-- Die Ereignistabelle: eine Zeile je Antwort und je gezogener Karte.
--
-- EREIGNISSE, KEINE ZUSTAENDE. Das ist die Entscheidung, die alles andere
-- traegt: hier steht, was passiert IST, und nicht, was die App daraus
-- errechnet hat. Wer in einem Jahr ein anderes Koennens-Modell will, rechnet
-- es aus denselben Zeilen neu, statt ein fortgeschriebenes fortzuschreiben.
--
-- Die Spalten bilden genau die Zeile ab, die verrechne() in
-- src/domain/lernstand.js heute schon in `verlauf` schreibt. Nichts ist neu
-- erfunden, nichts vorberechnet.
--
-- Siehe roadmap/implemented/feature-ereignistabelle-2026-08-30-0815.md.

create table ereignisse (
  id       bigint generated always as identity primary key,
  nutzer   uuid not null default auth.uid() references auth.users on delete cascade,

  -- Woher die Zeile kam und die wievielte sie von dort war. Zusammen mit dem
  -- unique unten wird jeder Versand wiederholbar: bricht die Verbindung ab,
  -- nachdem der Server geschrieben, aber bevor die App es erfahren hat, legt
  -- der naechste Anlauf nichts doppelt an.
  geraet   text   not null,
  nummer   bigint not null,

  -- Zwei Arten, nicht eine:
  --   'antwort'  aus verrechne()    -- eine Karte wurde beantwortet
  --   'gezogen'  aus merkeGezogen() -- eine Karte kam dran
  --
  -- Die zweite sieht ueberfluessig aus und ist es nicht: zieheRunde() in
  -- src/domain/auswahl.js entscheidet danach, was am laengsten nicht dran
  -- war. Ohne sie wuesste ein zweites Geraet das nicht und zoege falsch.
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
  -- real und keine Ganzzahl: ein Tipp kostet 0,1, der zweite Versuch
  -- bringt 0,5.
  punkte       real,

  -- zeit kommt vom GERAET (Date.now()), angelegt vom SERVER. Die App kennt
  -- keine Serveruhr, und domain/ darf ohnehin nicht nach der Zeit fragen --
  -- sie wird hereingereicht. Gehen die beiden weit auseinander, war jemand
  -- offline.
  zeit     timestamptz not null,
  -- Der LOKALE Tag des Geraets, nicht UTC. Um halb eins nachts gehoert die
  -- Runde noch zum Vortag, so wie Matilda es auch empfinden wuerde. Genau
  -- das rechnet app.js heute schon mit toLocaleDateString('sv').
  tag      date,
  angelegt timestamptz not null default now(),

  unique (nutzer, geraet, nummer)
);

create index ereignisse_nutzer_zeit on ereignisse (nutzer, zeit);


-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Die wichtigsten Zeilen der ganzen Datei. GitHub Pages ist statisch, der
-- Publishable Key steht im ausgelieferten Bundle -- RLS ist damit das
-- Einzige zwischen den Daten und dem offenen Netz.
-- ---------------------------------------------------------------------------

alter table ereignisse enable row level security;

-- ACHTUNG, die Falle: "to authenticated" schliesst NIEMANDEN aus. Eine
-- anonyme Sitzung hat genau diese Rolle, und eine anonyme Sitzung bekommt
-- jeder, der die Seite laedt, in einer Sekunde. Supabase warnt beim
-- Einschalten selbst davor.
--
-- Was hier schuetzt, ist allein das "using (nutzer = auth.uid())". Wer das
-- durch "using (true)" ersetzt, weil "es sind ja nur Angemeldete", oeffnet
-- die Tabelle fuers offene Netz. Die Zeile saehe harmlos aus.
create policy "eigene lesen"
  on ereignisse for select to authenticated
  using (nutzer = auth.uid());

create policy "eigene schreiben"
  on ereignisse for insert to authenticated
  with check (nutzer = auth.uid());

-- Kein update, kein delete -- absichtlich. Was passiert ist, ist passiert;
-- eine Ereignistabelle, in der man nachtraeglich aendern kann, ist keine.
-- Geloescht wird ueber den Nutzer, das "on delete cascade" oben raeumt
-- hinterher. Siehe roadmap/feature-request-kinderdaten.md.
