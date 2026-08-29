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

Gezählt wird **die laufende Woche**, montags auf null. Wer mittendrin dazukommt,
ist am nächsten Montag gleichauf — und es gibt ein Ende, statt endlos zu
sammeln.

## Was zu bauen ist

Wenig, weil die Ereignisse schon liegen:

- **Eine `missionen`-Tabelle**: Titel, Ziel, Beginn, Ende. Wird von Hand
  gefüllt, so wie die Konten — bei einer Mission pro Woche ist ein Formular
  dafür verfrüht.
- **Eine Sicht, die zusammenzählt.** Die Summe über alle Teilnehmenden in
  einem Zeitraum. Als `view` oder Funktion in Postgres, damit die App keine
  fremden Zeilen zu sehen bekommt — nur die Summe.
- **Ein Balken auf der Startseite.** Titel, Stand, Ziel. Kein eigener
  Einstiegspunkt: eine Mission gehört dorthin, wo geübt wird.

## Die RLS-Regel, auf die es ankommt

**Niemand sieht die Zeilen eines anderen — auch nicht für die Mission.** Die
Summe kommt aus einer Funktion mit `security definer`, die genau eine Zahl
zurückgibt und keine Zeilen. Ohne diese Trennung wäre die Mission ein
Nebeneingang zu allen Ereignissen aller Kinder, und die Policies aus
[der Ereignistabelle](feature-request-ereignistabelle.md) wären umsonst
geschrieben.

Damit ist die Mission auch die ehrlichste Form des Vergleichs: **man sieht,
dass beigetragen wurde, nicht wer wie viel.**

## Was ausdrücklich nicht dazugehört

- **Kein Rangordnen.** Keine Platzierung, keine Liste von oben nach unten.
- **Kein eigener Beitrag im Vergleich zu anderen.** Wer wissen will, was er
  selbst getan hat, sieht auf seine Fleiß-Seite.
- **Keine Belohnung für die Serie.** Sie wird weiter nur gezählt, siehe
  [Backlog](backlog.md).

## Die Abnahme

- Zwei Konten üben, der Balken zählt beides.
- **In der Konsole des einen Kontos `select('*')` auf `ereignisse`: weiterhin
  nur die eigenen Zeilen.** Die Mission darf daran nichts geändert haben.
- Montag: die Wochenzahl steht auf null, die Gesamtzahl nicht.

## Voraussetzung

[Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md) und
[Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) —
ohne Konten gibt es niemanden, mit dem man etwas gemeinsam hat, und ohne den
Rollentausch keine verlässliche Summe.

Dazu [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md), weil eine
Mission ohne fremde Kinder ein Balken für eine Person wäre.
