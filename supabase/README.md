# Das Datenbank-Schema

Hier liegt, wie die Tabellen in Supabase aussehen — als **Migrationen**, nicht
als eine Datei zum Abtippen. Eine Migration ist ein Stück SQL mit einem Datum
im Namen; die CLI merkt sich, welche schon gelaufen sind, und spielt nur die
neuen ein.

```
migrations/
  20260830060642_ereignisse.sql
  20260905183000_profile.sql
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

**Heute sichert der Workflow das von allein** — Migration und Deploy liegen
darin nacheinander. **Nach dem Umzug zu Vercel nicht mehr:** dort baut Vercel
sofort beim Push, während Actions daneben migriert. Ab dann gilt stattdessen
die Regel aus
[GitHub Pages ablösen](../roadmap/feature-request-hosting.md): **eine Migration
kommt in ihrem eigenen Pull Request, vor dem Code, der sie benutzt.**

## Eine Regel für jede Migration

**Sie darf nichts wegnehmen, was die laufende App noch braucht.** Eine Spalte
umbenennen heißt: neue Spalte dazu, beide eine Weile füllen, alte später
löschen — in einer Migration, die erst kommt, wenn niemand mehr die alte
benutzt.

Bei einer Ereignistabelle, in die nur eingefügt wird, ist das meistens leicht.
Der Satz steht hier, damit er dasteht, bevor es einmal nicht leicht ist.

## Von Hand einspielen (TEST)

Die CLI wird nicht installiert und steht nicht in `package.json` — `npx` holt
sie bei Bedarf. **Drei Schritte, nicht zwei:**

```bash
# 1. einmal je Rechner: oeffnet den Browser, du bestaetigst
npx supabase@latest login

# 2. einmal je Projektordner: waehlt das Projekt und die IPv4-Verbindung
npx supabase@latest link --project-ref uwxhfhhxnynxcuzdrcri

# 3. so oft es neue Migrationen gibt
npx supabase@latest db push
```

**Schritt 1 wird gern vergessen**, weil der Workflow ihn nicht braucht: dort
kommt das Token aus dem Secret `SUPABASE_ACCESS_TOKEN`. Lokal fehlt es, und
dann sagt die CLI

```
Access token not provided. Supply an access token by running `supabase login`
```

und der nächste Befehl scheitert mit `Cannot find project ref` — was aussieht
wie ein zweiter Fehler und nur die Folge des ersten ist.

`login` legt ein eigenes Token für diesen Rechner an; das aus den GitHub-
Secrets wird dafür nicht gebraucht und sollte auch nicht dafür benutzt werden.

Bei Schritt 2 fragt sie nach dem **Datenbank-Passwort**. Es steht in Supabase
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

## Nachpruefen, ohne dem Dashboard zu glauben

Alles hier laeuft mit dem **Publishable Key** — dem oeffentlichen. Ein Secret
Key wird dafuer nie gebraucht, und wer eines dieser Rezepte damit ausfuehrt,
prueft nicht die Sicherheit, sondern haengt sie aus.

### Ist die anonyme Anmeldung an?

Ohne einen Nutzer anzulegen:

```bash
curl -s "$URL/auth/v1/settings" -H "apikey: $KEY" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['external']['anonymous_users'])"
```

`True` heisst an. Steht dort `False`, meldet sich die App nie an — **ohne
Fehler und ohne Meldung**, sie laeuft einfach ohne Sicherung weiter.

### Haelt Row Level Security?

Der Test, der ueber "gebaut oder nicht gebaut" entscheidet. Zwei anonyme
Sitzungen anlegen (`POST /auth/v1/signup` mit `{}`), mit der ersten ein paar
Zeilen schreiben, mit der **zweiten** lesen:

```
Sitzung A: select('*') -> die eigenen Zeilen
Sitzung B: select('*') -> null Zeilen        <- darauf kommt es an
ohne Token: select('*') -> null Zeilen
```

Kommt bei B oder ohne Token auch nur eine fremde Zeile, ist die Tabelle offen.

**Zwei Fallen dabei**, beide am 30.08.2026 selbst hineingetappt:

- **`PATCH` und `DELETE` antworten mit HTTP 204**, obwohl keine Policy sie
  erlaubt. PostgREST gibt das unabhaengig davon zurueck, ob eine Zeile
  betroffen war; RLS filtert alles weg, und "nichts geaendert" sieht aus wie
  "geaendert". **Der Rueckgabewert ist kein Beweis** — die Zeilen vorher und
  nachher vergleichen.
- **Ein Insert mit fremdem `nutzer` muss 403 geben.** Sonst koennte jeder
  Zeilen auf ein fremdes Konto schreiben, ohne je etwas lesen zu koennen.

### Schreibt die veroeffentlichte App ins richtige Projekt?

Der Fehler, den man sonst erst Wochen spaeter bemerkt — wenn die geuebten
Wochen im falschen Projekt liegen. Die Projektkennung steckt im ausgelieferten
Bundle:

```bash
JS=$(curl -s "$SEITE" | grep -oE 'src="[^"]*index-[^"]*\.js"' | sed 's/src="//;s/"//')
curl -s "$SEITE$JS" | grep -c qykacefynfjgpebuazuv   # VocApp,      erwartet 1
curl -s "$SEITE$JS" | grep -c uwxhfhhxnynxcuzdrcri   # VocApp TEST, erwartet 0
```

Gehoert nach jeder Aenderung an den Secrets einmal gemacht.

## Vor jedem Eingriff an einem Konto: erst exportieren

Gilt fuer alles, was in `auth.users` greift -- eine Adresse setzen, ein Passwort
vergeben, einen Nutzer loeschen. Der Grund steht in der Migration: an
`ereignisse` haengt ein `on delete cascade`. **Ein geloeschter Nutzer nimmt
seine Zeilen mit, ohne Rueckfrage und ohne Papierkorb.**

```sql
select * from ereignisse where nutzer = '<uid>';
```

Ergebnis im SQL-Editor als CSV herunterladen, bevor der Eingriff passiert.

**Die Datei gehoert nicht ins Repo.** Es sind Lerndaten eines Kindes; irgendwo
lokal reicht, und geloescht werden darf sie, sobald der Eingriff sichtbar
geglueckt ist.

Wer die richtige uid sucht: sie steht nicht im Repo, sondern nur in der
Tabelle. Ueber das Geraet zu gehen ist der zuverlaessigste Weg --

```sql
select nutzer, count(*), min(zeit)::date, max(zeit)::date
from ereignisse where geraet like '%<geraeteteil>%' group by nutzer;
```

## Aufraeumen

In `VocApp TEST` sammeln sich anonyme Nutzer und Abnahme-Zeilen an. Sie stoeren
nichts und haengen an nichts — geloescht wird im Dashboard unter
`Authentication → Users`, das raeumt ueber `on delete cascade` die Zeilen
gleich mit weg.

**Die App selbst kann das nicht**, und das ist Absicht: es gibt keine
`delete`-Policy. Was passiert ist, ist passiert.

## Eine neue Migration anlegen

```bash
npx supabase@latest migration new wie_sie_heissen_soll
```

Das legt eine leere Datei mit Zeitstempel an. Schreib das SQL hinein, merge
es, und der Workflow spielt es ein.
