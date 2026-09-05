-- Das Pseudonym: woran die anderen das Kind erkennen.
--
-- GENAU ZWEI SPALTEN. Alles, wofuer ein anderer mehr sehen muesste --
-- Rangliste, Missionen, useruebergreifender Punktestand -- haengt an der Frage
-- "was ist ein Punkt?" und wird hier nicht angefasst, auch nicht "schon mal
-- vorbereitet". Eine Spalte, die niemand fuellt, ist eine Behauptung darueber,
-- wie es weitergeht.
--
-- KLARNAMEN KOMMEN NICHT HINEIN. Das Pseudonym ist das, was fremde Kinder
-- voneinander sehen; "matilda-p" ist keins. Siehe
-- roadmap/feature-request-kinderdaten.md.
--
-- Der Anmeldename und der Anzeigename sind zwei Dinge: der eine steckt in der
-- Kennung "<pseudonym>@konten.vocappulary.online" und bleibt am besten fuer
-- immer, weil das Kind ihn auswendig tippt. Dieser hier ist aenderbar.
--
-- Siehe roadmap/feature-request-konten.md.

create table profile (
  uid       uuid primary key references auth.users on delete cascade,
  pseudonym text not null
);


-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Dieselbe Ueberlegung wie bei `ereignisse`: der Publishable Key steht im
-- ausgelieferten Bundle, RLS ist das Einzige zwischen den Daten und dem
-- offenen Netz. Und wieder gilt -- "to authenticated" schliesst niemanden aus,
-- was schuetzt, ist allein die Bedingung darunter.
-- ---------------------------------------------------------------------------

alter table profile enable row level security;

-- Nur die eigene Zeile, und nur lesen.
--
-- Kein insert, kein update, kein delete: angelegt und geaendert wird im
-- Dashboard. THOMAS VERGIBT DAS PSEUDONYM, nicht das Kind -- sonst heisst nach
-- einer Woche eines wie das andere, und ein Anzeigename, den alle sehen, kann
-- beleidigend sein. Wer ihn selbst setzen koennte, koennte ihn auch selbst
-- missbrauchen.
--
-- Dass dieses select spaeter ALLE Zeilen zurueckgeben muss -- alle sehen den
-- Fortschritt aller, unter Pseudonymen -- ist bekannt und gehoert zu
-- roadmap/feature-request-missionen.md. Bis dahin sieht jeder nur sich.
create policy "eigenes lesen"
  on profile for select to authenticated
  using (uid = auth.uid());
