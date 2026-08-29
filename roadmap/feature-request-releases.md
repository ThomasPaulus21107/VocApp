# Feature: Test und Produktion, und was ein Release ist

**Status:** bereit — durchdacht, noch nicht gebaut
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
| Entspricht | `main` | dem letzten Release-Tag |
| Bekommt Migrationen | bei jedem Merge nach `main` | beim Release |
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
Bastelei — siehe [GitHub Pages ablösen](feature-request-hosting.md).

Getrennt sind vorerst also die **Datenbanken**, nicht die Adressen — und das
ist die Trennung, auf die es ankommt: Code lässt sich neu bauen, Daten nicht.

## Migrationen statt einer schema.sql

[Die Ereignistabelle](feature-request-ereignistabelle.md) sagt heute „im
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

## Der Knopf

**Releases → Draft a new release → Tag eintippen → Publish.** Ein echter Knopf
im Browser, der auch vom Telefon geht, und man bekommt eine Notiz dazu, in der
steht, was drin ist.

Der Tag löst den Workflow aus. Er tut dann, in dieser Reihenfolge:

1. Tests laufen lassen — ein rotes Release wird gar nicht erst gebaut.
2. Migrationen nach **VocApp** einspielen.
3. Mit den VocApp-Schlüsseln bauen und auf Pages veröffentlichen.

**Annahme, die du bestätigen oder umwerfen musst:** damit veröffentlicht ein
Merge nach `main` **nichts mehr**. Pages zeigt ab dann den letzten Release-Tag,
nicht mehr den letzten Merge. Anders wäre „auf Knopfdruck releasable" ohne
Wirkung — der Knopf hätte nichts zu tun, was der Merge nicht schon getan hat.
Praktisch heißt es: nach dem Umbau einmal `v1.0.0` veröffentlichen, sonst steht
die Seite auf dem Stand von vorher.

## Die Secrets

| Name | Wofür |
|---|---|
| `SUPABASE_URL_PROD`, `SUPABASE_KEY_PROD` | der Build beim Release |
| `SUPABASE_ACCESS_TOKEN` | die CLI, für beide Projekte |
| `SUPABASE_DB_PASSWORD_TEST`, `SUPABASE_DB_PASSWORD_PROD` | `db push` |

Die TEST-Schlüssel für den Build braucht niemand als Secret, solange der
Test-Stand nicht gehostet wird — sie stehen in der lokalen `.env`.

**Die beiden `_PROD`-Werte sind die einzigen im Repo, bei denen ein Fehler
echte Daten trifft.** Sie gehören in eine geschützte GitHub-Environment, damit
sie nur der Release-Job sieht und kein Workflow aus einem fremden Pull Request.

## Die Abnahme

1. Eine Migration nach `main` mergen → sie ist in **VocApp TEST**, nicht in
   VocApp.
2. Ein Release veröffentlichen → sie ist auch in VocApp, und zwar **bevor** die
   neue Seite live geht.
3. Ein Release mit rotem Test → **nichts passiert**, weder Migration noch
   Deploy.
4. In den Entwicklertools der veröffentlichten Seite nachsehen, dass die
   VocApp-URL drinsteht und nicht die von TEST. Einmal, aber gründlich — es ist
   der Fehler, den man sonst erst merkt, wenn Übungsdaten in der Produktion
   liegen.

## Voraussetzung

[Die zweite Naht zum Server](implemented/feature-backend-naht-2026-08-29-2225.md) und
[Die Ereignistabelle](feature-request-ereignistabelle.md). Diese Datei ersetzt
deren Abschnitte zu „Spielwiese und Ernst" und zum Einspielen von Hand.

Sie kann direkt danach kommen — und sollte es auch: **je später sie kommt,
desto mehr Schema ist von Hand entstanden**, und desto schwerer wird der erste
Migrationsstand.
