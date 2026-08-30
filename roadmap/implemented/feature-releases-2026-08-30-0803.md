# Feature: Test und Produktion — das Schema kommt ohne Abtippen an

**Status:** umgesetzt am 30.08.2026 um 08:03, PR #48
**Wo im Code:** `.github/workflows/deploy.yml`, `supabase/migrations/` — neu,
dazu `.env.example` und `AGENTS.md`

In Supabase gibt es seit dem 29.08.2026 zwei Projekte: **VocApp** und
**VocApp TEST**. Diese Datei sagt, was der Unterschied ist, wie das Schema in
beide kommt, ohne auseinanderzulaufen, und was passiert, wenn jemand auf
„Veröffentlichen" drückt.

## Der Zustand heute

Jeder Merge nach `main` baut und veröffentlicht sofort auf GitHub Pages. Das
war richtig, solange die App nichts speicherte, was jemandem gehört: ein
Fehler war ein Neuladen entfernt.

Mit einer Datenbank stimmt das nicht mehr. Ein Merge kann ab jetzt eine
Migration mitbringen, und die ist kein Neuladen entfernt.

## Was sich ändert

| | `VocApp TEST` | `VocApp` |
|---|---|---|
| Entspricht | dem, was lokal ausprobiert wird | `main` |
| Bekommt Migrationen | von Hand, mit `npx supabase` | im Workflow, bei jedem Merge |
| Wer übt darin | niemand — hier wird ausprobiert | Matilda und die Kinder |
| Kaputt heißt | Testdaten weg, egal | jemand verliert seinen Stand |

**Lokal zeigt `npm run dev` auf VocApp TEST.** Damit stimmt „TEST entspricht
main" auch beim Entwickeln, und niemand schreibt beim Ausprobieren in echte
Daten.

## Was jetzt noch NICHT kommt

**Zwei gehostete Stände.** GitHub Pages liefert genau eine Seite pro Repo aus;
ein Test-Stand zum Anschauen ginge nur als Unterordner `/VocApp/test/` oder
über ein zweites Repo. Beides ist Aufwand für einen Zwischenschritt.

Entschieden am 29.08.2026: **der Test-Stand bleibt lokal, bis GitHub Pages
ohnehin abgelöst wird.** Dann wird daraus eine Zeile Konfiguration statt einer
Bastelei — siehe [GitHub Pages ablösen](../feature-request-hosting.md).

Getrennt sind vorerst also die **Datenbanken**, nicht die Adressen — und das
ist die Trennung, auf die es ankommt: Code lässt sich neu bauen, Daten nicht.

## Migrationen statt einer schema.sql

[Die Ereignistabelle](feature-ereignistabelle-2026-08-30-0815.md) sagt heute „im
SQL-Editor einfügen, zweimal". Mit zwei Projekten und einem Release-Ablauf ist
genau das die Fehlerquelle: Drift fällt erst auf, wenn ein Insert nur in einem
von beiden funktioniert.

Also `supabase/migrations/` mit durchnummerierten Dateien, eingespielt von der
**Supabase-CLI im Workflow**:

```
supabase/migrations/
  20260829120000_ereignisse.sql       <- die Tabelle und ihre Policies
  20260830090000_profile.sql          <- kommt mit den Konten
```

- **Merge nach `main`** → `supabase db push` gegen VocApp TEST.
- **Release** → dieselben Dateien gegen VocApp, **vor** dem Deploy.

Die Reihenfolge ist keine Kleinigkeit: erst das Schema, dann die App. Wäre es
andersherum, liefe für ein paar Sekunden neuer Code gegen eine alte Datenbank,
und das ist genau der Moment, in dem jemand übt.

### Eine Regel für jede Migration

**Sie darf nichts wegnehmen, was die gerade laufende Produktion noch braucht.**
Eine Spalte umbenennen heißt: neue Spalte dazu, beide eine Weile füllen, alte
später löschen — in einer Migration nach dem Release, das die alte nicht mehr
benutzt. Wer das abkürzt, nimmt der laufenden App unter den Füßen etwas weg.

Bei einer Ereignistabelle, in die nur eingefügt wird, ist das meistens leicht.
Der Satz steht hier, damit er dasteht, bevor es einmal nicht leicht ist.

### Die neue Abhängigkeit

Die **Supabase-CLI**, aber nur im Workflow (`supabase/setup-cli`) und nicht in
`package.json`. Sie taucht in keinem `npm install` auf und in nichts, was
Matilda liest. `AGENTS.md` verlangt trotzdem die Rückfrage; sie ist am
29.08.2026 gestellt und mit ja beantwortet worden.

## Der Knopf kommt später — Entscheidung vom 29.08.2026

Hier stand einmal: ein GitHub Release als Knopf, und ein Merge nach `main`
veröffentlicht dann nichts mehr. **Das ist vertagt**, und die Begründung
gehört aufgeschrieben, weil sie sonst in einem halben Jahr neu diskutiert
wird.

Der Zweck eines Release-Knopfs ist, *„Code ist fertig"* von *„die Kinder
bekommen es"* zu trennen. Diese Trennung zahlt sich aus, sobald es Kinder
gibt, die nicht am Projekt mitarbeiten. **Heute gibt es eine Nutzerin, und sie
ist die Co-Autorin** — für Matilda sind Merge und Release dasselbe Ereignis.

Dazu drei Dinge:

- **Ein Knopf prüft nichts**, er wählt einen Moment. Was an einer Migration
  wirklich schützt, ist die Regel oben und das fehlende `update`/`delete` in
  den Policies: **eine Ereignistabelle, in die nur eingefügt wird, kann ein
  schlechter Deploy nicht kaputtmachen.** Das ist eine Eigenschaft des
  Schemas, nicht des Ablaufs.
- **Er kostet etwas Konkretes.** Heute merged Matilda ihren Pull Request und
  drei Minuten später ist ihre Änderung in der App. `AGENTS.md` nennt das
  Projekt „zu gleichen Teilen eine funktionierende App **und** eine gemeinsame
  Lernerfahrung" — eine Änderung, für die sie danach jemanden fragen muss, ist
  weniger ihre.
- **Der richtige Moment ist eingeplant.** Bei Vercel ist „`main` → Vorschau,
  Tag → Produktion" eine Zeile Konfiguration; auf Pages wäre es eine Bastelei
  aus zwei Builds in einem Artefakt. Siehe
  [GitHub Pages ablösen](../feature-request-hosting.md).

**Was den Knopf sofort fällig macht:** das erste fremde Kind. Ab dann ist er
kein Zeremoniell mehr, sondern die Stelle, an der jemand hinschaut, bevor
etwas bei jemandem ankommt, der nicht mitgebaut hat.

Die Form steht dann schon fest: **Releases → Draft a new release → Tag
eintippen → Publish.** Ein Knopf im Browser, der auch vom Telefon geht, mit
einer Notiz, in der steht, was drin ist.

## Die Secrets

| Name | Wofür |
|---|---|
| `SUPABASE_URL_PROD`, `SUPABASE_KEY_PROD` | der Build |
| `SUPABASE_ACCESS_TOKEN` | die CLI |
| `SUPABASE_DB_PASSWORD_PROD` | `db push` |

Die TEST-Werte braucht kein Secret: gegen TEST wird lokal gearbeitet, und die
Zugangsdaten stehen in der lokalen `.env` beziehungsweise werden beim
Einspielen von Hand abgefragt.

**Die Projektkennungen sind kein Geheimnis** — `qykacefynfjgpebuazuv` und
`uwxhfhhxnynxcuzdrcri` stehen in jeder URL und dürfen offen im Workflow
stehen.

**Die `_PROD`-Werte sind die einzigen im Repo, bei denen ein Fehler echte
Daten trifft.** Sobald es ein zweites Kind gibt, gehören sie in eine
geschützte GitHub-Environment, damit kein Workflow aus einem fremden Pull
Request sie sieht.

## Die Abnahme

1. **Der Workflow läuft durch, obwohl es noch keine Migration gibt.**
   `db push` sagt dann, dass es nichts zu tun gibt — und genau das beweist
   den riskanten Teil: Token, Passwort und Verbindung stimmen.
2. Eine Migration nach `main` mergen → sie ist in **VocApp**, und zwar
   **bevor** die neue Seite live geht.
3. **Ein fehlendes Secret bricht den Lauf mit einem lesbaren Satz ab**, nicht
   mit einem Netzfehler. Einmal ausprobieren, indem man den Namen im Workflow
   verdreht.
4. In den Entwicklertools der veröffentlichten Seite nachsehen, dass die
   **VocApp**-URL drinsteht und nicht die von TEST. Einmal, aber gründlich —
   es ist der Fehler, den man sonst erst merkt, wenn Übungsdaten im falschen
   Projekt liegen.

## Zwei Dinge, die beim Bauen Zeit gekostet haben

Beide stehen ausführlich in [`supabase/README.md`](../../supabase/README.md):

- **`link` ist nicht optional.** Ohne ihn versucht `db push` eine direkte
  Verbindung über **IPv6**, und GitHub-Runner können kein IPv6. Der Fehler
  sieht aus wie ein Netzproblem und ist eine fehlende Zeile.
- **Eine `config.toml` braucht es nicht.** `supabase init` legt 413 Zeilen an,
  fast alles für eine lokale Entwicklungsumgebung, die hier niemand startet.

## Voraussetzung

[Die zweite Naht zum Server](feature-backend-naht-2026-08-29-2225.md) und
[Die Ereignistabelle](feature-ereignistabelle-2026-08-30-0815.md). Diese Datei ersetzt
deren Abschnitte zu „Spielwiese und Ernst" und zum Einspielen von Hand.

Sie kann direkt danach kommen — und sollte es auch: **je später sie kommt,
desto mehr Schema ist von Hand entstanden**, und desto schwerer wird der erste
Migrationsstand.
