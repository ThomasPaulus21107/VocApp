# Feature: Gemeinsame Lernmissionen

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `supabase/schema.sql`, `src/infra/backend.js`,
`src/ui/ui.js`, `index.html`

„Zusammen 500 Verben diese Woche." Eine Zahl, an der alle mitschreiben, und ein
Balken, der voller wird.

Möglich geworden ist das am 29.08.2026, als die Frage *was ist ein Punkt?*
beantwortet wurde — siehe
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md). Sie war
der Grund, warum an diesem Strang jahrelang nichts gebaut werden durfte.

## Warum Missionen und nicht die Rangliste

Der Satz steht seit dem ersten Refinement in der Roadmap und ist der Grund für
die Reihenfolge:

> In einer Gruppe gibt es immer ein letztes Kind, und das hört auf zu üben.

**Eine Mission hat keinen Letzten, sondern ein Ziel.** Technisch ist es
derselbe Unterbau — eine geteilte Zahl auf dem Server — pädagogisch ist es das
bessere Feature. Ein Vergleich zwischen Kindern kommt später und in einer Form,
die noch nicht gefunden ist; Näheres dort.

## Die Zahl

**Ein Punkt ist eine Karte, die saß**: 1 auf Anhieb, 0,5 im zweiten Versuch,
Tipp −0,1. Das ist `punkteFuerKarte()` aus `domain/note.js`, dieselbe Zahl, die
schon in jeder Ereigniszeile als `punkte` steht.

**Seit dem 04.09.2026 mit einem Zuschlag:** in der Arbeit sind es 20 Prozent
mehr (`lernpunkte()` in `domain/modus.js`). Für Missionen ist das mehr als eine
Zahl — **wer Arbeiten spielt, sammelt schneller.** Gewollt ist es: die Arbeit
kennt keinen Tipp, keine zweite Chance und keine Rückmeldung, sie ist der
härtere Weg. Wer beim Entwerfen einer Mission trotzdem gleiche Startbedingungen
will, zählt Karten statt Punkte — die Entscheidung fällt hier, nicht im Code.

Gezählt wird **die laufende Woche**, montags auf null. Wer mittendrin dazukommt,
ist am nächsten Montag gleichauf — und es gibt ein Ende, statt endlos zu
sammeln.

## Was zu bauen ist

Wenig, weil die Ereignisse schon liegen:

- **Eine `missionen`-Tabelle**: Titel, Ziel, Beginn, Ende. Wird von Hand
  gefüllt, so wie die Konten — bei einer Mission pro Woche ist ein Formular
  dafür verfrüht.
- **`fortschritte()`** — die Funktion unten. Sie trägt die Mission und alles,
  was später an Vergleich dazukommt.
- **Ein Balken auf der Startseite.** Titel, Stand, Ziel. Kein eigener
  Einstiegspunkt: eine Mission gehört dorthin, wo geübt wird.

## `fortschritte()` — die einzige Stelle, an der man andere sieht

Am 29.08.2026 ist entschieden worden: **alle dürfen den Fortschritt aller
sehen, unter Pseudonymen.** Diese Funktion ist die Umsetzung, und sie ist
bewusst die einzige.

```sql
create function fortschritte()
returns table (pseudonym text, woche real, sicher int)
security definer                -- liest ereignisse, ohne sie zu oeffnen
set search_path = public
language sql stable
as $$
  select p.pseudonym,
         coalesce(sum(e.punkte) filter (where e.tag >= date_trunc('week', now())::date), 0),
         ...
  from profile p left join ereignisse e on e.nutzer = p.uid
  -- Wer nur zum Gucken vorbeikommt, sieht nichts.
  where (auth.jwt() ->> 'is_anonymous')::boolean is not true
  group by p.pseudonym
$$;

revoke all on function fortschritte() from anon;
grant execute on function fortschritte() to authenticated;
```

Drei Eigenschaften, und jede davon ist der Grund, warum es eine Funktion ist
und keine Policy auf `ereignisse`:

- **Sie gibt Zahlen zurück, keine Zeilen.** Pseudonym, Wochenpunkte, Anteil
  sicher. Nicht: wann jemand übt, welche Vokabel er elfmal falsch hatte, wie
  lange er weg war. Das steht im Ereignis-Tagebuch und geht niemanden an.
- **Sie schließt anonyme Sitzungen aus.** `signInAnonymously()` steht jedem
  offen, der die Seite lädt, **und liefert die Rolle `authenticated`** — ohne
  diese Zeile wäre „alle Angemeldeten" gleich „das offene Netz". Der einzige
  Unterschied zwischen einem Kind und einem Fremden steht nicht in der Rolle,
  sondern in der `is_anonymous`-Angabe im Token. Deshalb wird genau die
  geprüft und nicht die Rolle.
- **`security definer`, aber eng.** Die Funktion darf mehr als der Aufrufer;
  deshalb steht `set search_path` dabei und deshalb ist sie kurz genug, um sie
  ganz zu lesen.

**Welche Zahlen drinstehen, ist an genau dieser Stelle zu ändern** — die App
zeigt, was herauskommt.

## Was ausdrücklich nicht dazugehört

- **Kein Rangordnen.** Keine Platzierung, keine Liste von oben nach unten. Wie
  aus den Zahlen eine Würdigung wird, steht in
  [Würdigung statt Rangliste](feature-request-wuerdigung.md) und ist offen.
- **Kein Zugriff auf fremde Ereignisse.** Die Policies in
  [der Ereignistabelle](implemented/feature-ereignistabelle-2026-08-30-0815.md) bleiben, wie sie
  sind. Wer sie aufmacht, hebt die zweite Eigenschaft oben auf.
- **Keine Belohnung für die Serie.** Sie wird weiter nur gezählt, siehe
  [Backlog](backlog.md).

## Die Abnahme

- Zwei Konten üben, der Balken zählt beides.
- **In der Konsole des einen Kontos `select('*')` auf `ereignisse`: weiterhin
  nur die eigenen Zeilen.** Die Mission darf daran nichts geändert haben.
- **Ohne Anmeldung `fortschritte()` aufrufen** — also aus einer frischen
  anonymen Sitzung, wie sie jeder Besucher bekommt: **es kommt nichts zurück.**
  Das ist die Abnahme, die wirklich zählt.
- Montag: die Wochenzahl steht auf null, die Gesamtzahl nicht.

## Voraussetzung

[Aus der anonymen Sitzung wird ein Konto](implemented/feature-konten-2026-09-05-1830.md) und
[Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) —
ohne Konten gibt es niemanden, mit dem man etwas gemeinsam hat, und ohne den
Rollentausch keine verlässliche Summe.

Dazu [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md), weil eine
Mission ohne fremde Kinder ein Balken für eine Person wäre.
