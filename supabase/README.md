# Das Datenbank-Schema

Hier liegt, wie die Tabellen in Supabase aussehen — als **Migrationen**, nicht
als eine Datei zum Abtippen. Eine Migration ist ein Stück SQL mit einem Datum
im Namen; die CLI merkt sich, welche schon gelaufen sind, und spielt nur die
neuen ein.

```
migrations/
  20260830120000_ereignisse.sql
  20260901093000_profile.sql
```

## Warum nicht einfach eine schema.sql

Weil es **zwei** Projekte gibt: `VocApp TEST` zum Ausprobieren und `VocApp`
für Matilda. Eine Datei, die man von Hand in beide einfügt, läuft nach der
zweiten Änderung auseinander — und es fällt erst auf, wenn etwas nur in einem
von beiden funktioniert.

## Wer spielt was ein

| | wann |
|---|---|
| `VocApp` | bei jedem Merge nach `main`, im Workflow, **vor** dem Deploy |
| `VocApp TEST` | von Hand, siehe unten |

Die Reihenfolge beim Deploy ist keine Kleinigkeit: erst das Schema, dann die
App. Andersherum liefe für ein paar Sekunden neuer Code gegen eine alte
Datenbank, und das ist genau der Moment, in dem jemand übt.

## Eine Regel für jede Migration

**Sie darf nichts wegnehmen, was die laufende App noch braucht.** Eine Spalte
umbenennen heißt: neue Spalte dazu, beide eine Weile füllen, alte später
löschen — in einer Migration, die erst kommt, wenn niemand mehr die alte
benutzt.

Bei einer Ereignistabelle, in die nur eingefügt wird, ist das meistens leicht.
Der Satz steht hier, damit er dasteht, bevor es einmal nicht leicht ist.

## Von Hand einspielen (TEST)

Die CLI wird nicht installiert und steht nicht in `package.json` — `npx` holt
sie bei Bedarf:

```bash
npx supabase@latest link --project-ref uwxhfhhxnynxcuzdrcri
npx supabase@latest db push
```

Beim ersten Mal fragt sie nach dem Datenbank-Passwort. Es steht in Supabase
unter Project Settings → Database; ansehen kann man es dort nicht, nur neu
setzen.

Für `VocApp` lautet die Kennung `qykacefynfjgpebuazuv` — das braucht man aber
normalerweise nicht, das macht der Workflow.

## Zwei Dinge, die Zeit gekostet haben

- **`link` ist nicht optional.** Ohne ihn versucht `db push` eine direkte
  Verbindung über **IPv6**, und die GitHub-Runner können kein IPv6. Der Fehler
  heißt dann `IPv6 is not supported on your current network` und sieht aus wie
  ein Netzproblem, ist aber eine fehlende Zeile.
- **Eine `config.toml` braucht es nicht.** `supabase init` legt 413 Zeilen an,
  von denen fast alles die lokale Entwicklungsumgebung betrifft, die hier
  niemand startet. `link` und `db push` kommen ohne aus.

## Eine neue Migration anlegen

```bash
npx supabase@latest migration new wie_sie_heissen_soll
```

Das legt eine leere Datei mit Zeitstempel an. Schreib das SQL hinein, merge
es, und der Workflow spielt es ein.
