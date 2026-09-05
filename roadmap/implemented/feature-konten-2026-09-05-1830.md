# Feature: Aus der anonymen Sitzung wird ein Konto

**Status:** umgesetzt am 05.09.2026 um 18:30, PR #PLATZHALTER
**Wo im Code:** `anmelden.html` und `src/anmelden.js` — neu, dazu
`vite.config.js`, `src/ui/menue.js`, `src/infra/backend.js`, die Migration
`supabase/migrations/20260905183000_profile.sql` und zwei Schalter in der
Supabase-Konfiguration (Sign-ups aus, anonyme Anmeldung aus)

## Was beim Bauen dazukam

Drei Dinge, die beim Durchdenken nicht dastanden:

- **Der Wächter greift auf allen drei Seiten**, nicht nur beim Üben. Die
  Statistikseiten lesen zwar nur aus `localStorage` — aber ein Kind, das über
  das Menü dorthin kommt, versteht nicht, warum die eine Seite eine Anmeldung
  verlangt und die andere nicht. Zwei Klassen von Seiten wären eine Regel, die
  niemand erklären kann.
- **Ohne Umgebungsvariablen greift er gar nicht.** `verlangeSitzung()` gibt
  dann `true` zurück, und die App läuft wie vorher ohne Server. Ein im
  Workflow vergessenes Secret kostet damit die Sicherung und nicht das Üben —
  ein Anmeldeformular, das nichts anmelden kann, wäre die schlechtere Antwort.
- **Die Oberflächen-Tests laufen jetzt mit `--mode test`** gegen eine
  erfundene Supabase-Adresse aus `.env.test`, und `playwright.config.js`
  schiebt ihnen eine erfundene Sitzung unter. Vorher wäre derselbe Testlauf
  lokal gegen `VocApp TEST` gelaufen und in der CI gegen gar nichts — also
  zweimal verschieden, und das ist kein Test. Nebenbei sind damit alle 52
  Oberflächen-Tests ein Nachweis, dass der Wächter richtig sitzt.

Der Anfang von Phase 2. Ab hier gehört ein Lernstand einer **Person** und nicht
mehr einem Browser.

## Wer legt Konten an: entschieden am 29.08.2026

**Thomas legt sie an. Die Oberfläche kennt weder Registrieren noch einen Weg,
sich selbst ein Konto zu machen.**

Ein offenes Anmeldeformular im Netz ist bei Kinderdaten die Tür, die man nicht
aufmacht — und bei einem Dutzend Kindern sind zwölf Konten von Hand eine halbe
Stunde, kein Feature.

**In der Supabase-Konfiguration heißt das: Sign-ups aus.** Sonst legt das
Formular, das es nicht geben soll, trotzdem Konten an — über die API, die
immer da ist. Der Schalter ist die eigentliche Absicherung, nicht die fehlende
Schaltfläche.

## Ohne Mailadressen: entschieden am 30.08.2026

Supabase kennt als Kennung nur **E-Mail, Telefonnummer oder anonym.** Telefon
scheidet aus (Anbieter, Kosten, und die wenigsten Zwölfjährigen haben eine
Nummer), anonym hat keinen Weg zurück. Bleibt die E-Mail — **aber sie muss
weder echt sein noch einem Kind gehören.**

### Die Adresse ist eine Kennung, kein Postfach

```
blauer-otter@konten.vocappulary.online
```

Eine Subdomäne, die uns gehört und auf der **nie ein Mailserver steht**.
Angelegt mit `auth.admin.createUser({ email, password, email_confirm: true })`;
verschickt wird nichts, bestätigt wird nichts, und es gibt nichts zu
bestätigen.

**Das ist der beste Datenschutz, den dieses Feature haben kann: wir sammeln
keine einzige Kontaktadresse eines fremden Kindes ein.** Was nicht da ist, kann
nicht abfließen, nicht falsch adressiert werden und nicht gelöscht werden
müssen. Siehe [Wenn fremde Kinder mitüben](../feature-request-kinderdaten.md).

Als lokalen Teil nimmt man **das Pseudonym, nie den Klarnamen** — dieselbe
Regel wie beim Anzeigenamen weiter unten. `matilda-p@…` ist kein Pseudonym.

### Angemeldet wird mit Name und Passwort

Das Kind tippt `blauer-otter` und sein Passwort. **Die Domäne hängt die App
an**, sie steht nirgends auf dem Bildschirm:

```js
signInWithPassword({ email: `${name}@konten.vocappulary.online`, password })
```

Der Grund für diesen Weg statt eines Links: **das Kind kommt ohne Thomas auf
ein neues Gerät.** Schulrechner, Tablet der Freundin, neues Telefon — es tippt
zwei Felder und ist drin. Ein Link müsste jedes Mal erzeugt und überbracht
werden.

Der Preis steht ehrlich hier: Zwölfjährige und Passwörter heißt vergessen,
aufgeschrieben, weitergegeben. Zwei Dinge federn das ab:

- **Thomas vergibt das Passwort**, das Kind wählt es nicht. Drei einfache
  Wörter, laut vorlesbar, und für alle nach demselben Muster.
- **Zurückgesetzt wird im Dashboard**, mit
  `auth.admin.updateUserById(uid, { password })`. Es gibt kein „Passwort
  vergessen"-Formular — das führte zu einer Mailadresse, die es nicht gibt.

**Was das Formular können muss**, damit es überhaupt einmal getippt wird:
`autocomplete="username"` und `autocomplete="current-password"`, damit iOS das
Passwort im Schlüsselbund anbietet. Ohne diese zwei Attribute tippt ein Kind
sein Passwort jedes Mal neu, und dann ist es nach einer Woche
`aaa` — oder die App fliegt vom Homebildschirm.

### Was daraus für `anmelden.html` folgt

Zwei Felder, ein Knopf, ein verständlicher Satz, wenn es nicht passt.
**Kein Registrieren, kein „Passwort vergessen", kein „angemeldet bleiben"** —
die Sitzung bleibt ohnehin und wird stillschweigend erneuert. Wer die App auf
den Homebildschirm legt, sieht die Seite genau einmal.

### Der Anmeldename und der Anzeigename sind zwei Dinge

Sie fangen gleich an — beide sind das Pseudonym — und sie dürfen sich trennen.
Der **Anmeldename** steckt in der Adresse und bleibt am besten für immer, weil
das Kind ihn auswendig tippt. Das **Pseudonym in `profile`** ist das, was die
anderen sehen, und Thomas kann es jederzeit ändern.

Muss der Anmeldename doch einmal weichen, geht auch das:
`auth.admin.updateUserById(uid, { email })`. Aber es ist ein bewusster
Handgriff und kein Nebeneffekt einer Umbenennung.

## Ein Gerät ist kein Nutzer

Der Satz muss hier stehen, weil das Gegenteil heute stimmt und man es sich
angewöhnt hat: Bis zu diesem Feature legt **jedes Gerät seinen eigenen anonymen
Nutzer** an, und darum fallen „Gerät" und „Person" zusammen.

Sie gehören aber verschiedenen Schichten an, und nach diesem Feature sieht man
das auch:

| | was es ist | wo es steht |
|---|---|---|
| **Gerätename** | ein Nummernkreis, damit zwei Geräte sich nicht in die laufenden Nummern geraten | `geraet` in `ereignisse`, gewürfelt in `backend.js` |
| **Pseudonym** | woran die anderen das Kind erkennen | `profile`, änderbar |
| **uid** | die Person | `auth.users`, für immer |

Der Gerätename identifiziert niemanden und taucht auf keinem Bildschirm auf.
**Ein Pseudonym gehört nie einem Gerät.**

### Der Anmeldeschirm, einmal je Gerät

```
App öffnen  ──▶  Sitzung da?  ── ja ──▶  üben
                     │ nein
                     ▼
               anmelden.html:  blauer-otter  +  Passwort
                     │
                     ▼
               Sitzung liegt im Gerät und erneuert sich still
```

Auf dem zweiten Gerät tippt dasselbe Kind dieselben zwei Felder. Danach
schreiben beide unter **derselben uid** — in der Tabelle stehen weiterhin zwei
Gerätenamen, aber eine Person.

**Was das noch nicht heißt:** „auf dem Laptop weitermachen, wo das Telefon
aufgehört hat". Der angezeigte Lernstand kommt weiter aus `localStorage`, einer
je Gerät. Das umzudrehen ist
[Der Server wird die Wahrheit](../feature-request-server-ist-die-wahrheit.md).
Dieses Feature ist dessen Voraussetzung, nicht schon sein Ergebnis — wer das
verwechselt, hält das Ausbleiben der Synchronisierung für einen Fehler.

### Sign-up und Sign-in sind verschiedene Leute

| | wer | womit | wo |
|---|---|---|---|
| **Sign-up**, das Konto entsteht | Thomas | `admin.createUser`, Service-Rolle | Dashboard |
| **Sign-in**, das Konto wird benutzt | das Kind | `signInWithPassword` | `anmelden.html` |

In der App gibt es Sign-up nicht — und mit abgeschalteten Sign-ups auch nicht
an der App vorbei. **Die anonyme Anmeldung fällt mit diesem Feature weg:** ab
hier ist das Formular der einzige Weg herein.

### Wie ein Kind an sein Passwort kommt

Von Thomas, direkt. Einen automatischen Weg gibt es nicht, und das ist der
Preis dafür, keine Mailadressen zu haben — jeder automatische Weg bräuchte
eine.

Praktisch: Konto anlegen, Name und Passwort auf einen Zettel, den das Kind
behält. **Beim ersten Anmelden dabeisein** — einmal gemeinsam eintippen, und
wenn iOS fragt, das Passwort im Schlüsselbund sichern lassen. Ab dann füllt es
sich selbst aus, und gebraucht wird es erst wieder auf einem fremden Gerät.

**Kein Zwang, es beim ersten Mal zu ändern.** Bei Zwölfjährigen erzeugt das
genau ein Ergebnis: ein vergessenes Passwort. Geht doch eines verloren, setzt
Thomas es im Dashboard neu.

## Matildas Stand: derselbe Nutzer, nur mit Adresse

Matilda übt seit Phase 1 anonym. Ihr bisheriger Stand soll ihrer bleiben — und
das geht, weil eine anonyme Sitzung ein **echter Nutzer mit echter uid** ist:
sie bekommt eine Mailadresse, und alle Zeilen bleiben liegen. Kein Umzug, keine
Zusammenführung, kein Sonderfall im Code.

**Der Weg dorthin ist aber ein anderer, als hier zuerst stand.** Aus der App
heraus ginge das mit `updateUser({ email })` — und genau das verschickt eine
Bestätigungsmail. Ohne Mailanbindung führt der Weg ins Leere: die Adresse bliebe
unbestätigt und die Umstellung unfertig.

Also läuft auch dieser Schritt über das Dashboard:
`auth.admin.updateUserById(uid, { email, password, email_confirm: true })`
setzt Adresse und Passwort und markiert die Adresse als bestätigt. Danach ist
es ein normales Konto wie jedes andere.

**Welche uid ihre ist, steht seit dem 04.09.2026 fest** und ist unten
aufgeschrieben. Vorher war das eine Suche: seit dem
[Umzug des Bestands](feature-umzug-des-bestands-2026-08-30-1815.md)
liegen mehrere anonyme Nutzer in `VocApp`, einer je Gerät, und welcher ihrer
war, stand nur in der Tabelle.

### Die uids, soweit sie erkannt sind

Nachgezählt am 05.09.2026. Sie stehen hier, weil sie **nirgends sonst im Repo
stehen** und sich später nicht mehr erraten lassen: eine anonyme uid trägt
keinen Namen, und wer die Zeilen einmal einem falschen Konto zuordnet, merkt es
an nichts.

| Wer | uid | Geräte | Zeilen |
|---|---|---|---|
| **Matilda** | `c815e627-4b69-4859-a025-a9f9d8ba5358` | `22f9adf2…` (iPhone) + `umzug-22f9adf2…` | 586 + 140 = **726**, zuletzt 05.09.2026 |
| **Thomas** | `739bfdea-8ba7-427a-a530-2907c784cae5` | `ef05d75a…` (MacBook) + `umzug-ef05d75a…` | 261 + 205 = **466**, zuletzt 04.09.2026 |
| **noch offen** | `5d68b27a-5d34-4688-90df-581ac69b1ca8` | `08ac754a…` + `umzug-08ac754a…` | 271 + 44 = **315**, zuletzt 03.09.2026 |
| Streuzeilen | fünf weitere uids | je ein Gerät, keins mit Umzug | 15 bis 60 Zeilen, zusammen 47 Antworten |

**Die zwei Gerätenamen je uid sind kein zweites Gerät**, sondern der
[Umzug des Bestands](feature-umzug-des-bestands-2026-08-30-1815.md):
er schrieb den mitgebrachten Vorrat unter `umzug-<geraet>`, und diese Zeilen
sind ausnahmslos Antworten — 140, 205 und 44 Zeilen, 140, 205 und 44 Antworten.
Jede dieser uids ist also **genau ein Browser-Speicher**, und genau das macht
die Zuordnung so eindeutig: ein Gerätename gehört zu genau einer uid.

**Damit ist eine frühere Annahme widerlegt.** Am 04.09.2026 stand hier, alles
außer Matilda seien Streuzeilen von Klicks auf die neue Adresse. Das gilt für
die fünf kleinen; die 466 und die 315 sind echtes Üben oder Testen über eine
Woche.

#### Das MacBook gehört Thomas: entschieden am 05.09.2026

**Was vom MacBook kam, wird mit Thomas' Konto verknüpft, nicht mit Matildas.**
Das sind Sitzungen aus dem Bauen und Ausprobieren, und sie haben in ihrem
Lernstand nichts verloren: eine Vokabel, die Thomas beim Testen zwanzigmal
richtig getippt hat, stünde bei ihr auf Tiefgrün und käme nie wieder dran.

**Ein Gerät ist keine uid**, und daran hing dieser Punkt: läge das MacBook
unter Matildas uid, wäre ein Trennen ein `update` auf `ereignisse` — und das
gibt es nicht, die Tabelle hat mit Absicht weder `update`- noch
`delete`-Policy.

**Abfrage 2 hat das am 05.09.2026 entschieden: das MacBook hat eine eigene
uid.** `ef05d75a…` und sein Umzug schreiben beide unter
`739bfdea-8ba7-427a-a530-2907c784cae5`, und unter Matildas uid steht
ausschließlich das iPhone. **Es bewegt sich keine einzige Zeile** — zwei
`updateUserById`, und jeder Stand liegt bei der Person, die ihn erzeugt hat.

### Die dritte uid ist noch niemandes

`5d68b27a-5d34-4688-90df-581ac69b1ca8`, 315 Zeilen mit 180 Antworten vom
30.08. bis 03.09.2026, ein Speicher `08ac754a…` mit 44 mitgebrachten Zeilen.
Der Verdacht steht in der Zeile darüber: **Safari neben der
Homebildschirm-App** — dieselbe Person, anderer Speicher, eigene anonyme uid.
Wessen Safari, sagen die Zahlen nicht.

**Sie bekommt vorerst kein Konto.** Ein Konto ist eine Behauptung darüber, wem
etwas gehört, und die lässt sich hier nicht belegen. Die Zeilen bleiben liegen,
die uid bleibt anonym — sie kostet nichts und verliert nichts. Klärt sich
später, wer dort geübt hat, ist das Nachreichen derselbe eine Handgriff.

Daneben standen am 04.09.2026 **7 Nutzer und 6 Geräte** in `VocApp`. Die
übrigen sind Streuzeilen ohne Besitzer, unter anderem von Klicks auf
vocappulary.online. **Entschieden am 04.09.2026: sicherzustellen ist nur
Matildas Stand**, alles andere wird vernachlässigt — deshalb ist keine dieser
uids hier aufgeschrieben.

### Nachzählen, bevor etwas angefasst wird

Die Zahlen oben sind vom 04.09.2026 und altern. Vor dem ersten `admin`-Aufruf
läuft das hier im SQL-Editor des Dashboards — es prüft die Tabelle oben nach
und beantwortet die eine offene Frage, ob das MacBook eine eigene uid hat.

```sql
-- 1. Wer schreibt, wie viel, von wie vielen Geraeten, wie lange schon
select u.id                                        as uid,
       u.email,
       u.is_anonymous                              as anonym,
       count(e.id)                                 as zeilen,
       count(distinct e.geraet)                    as geraete,
       min(e.zeit)::date                           as erste,
       max(e.zeit)                                 as letzte
from auth.users u
left join ereignisse e on e.nutzer = u.id
group by u.id, u.email, u.is_anonymous
order by zeilen desc;
```

```sql
-- 2. Welches Geraet unter welcher uid schreibt -- die MacBook-Frage
select nutzer,
       geraet,
       count(*)                                    as zeilen,
       count(*) filter (where art = 'antwort')     as antworten,
       min(zeit)::date                             as erste,
       max(zeit)                                   as letzte
from ereignisse
group by nutzer, geraet
order by nutzer, zeilen desc;
```

```sql
-- 3. Die 107 Doppelten: Melden und Umzug haben sich ueberschnitten.
--    Am 05.09.2026 nachgemessen: 107 Gruppen, 107 ueberzaehlige Zeilen -- je
--    Gruppe genau eine zu viel, und seit dem 04.09. unveraendert. Es kommen
--    also keine neuen dazu; es war einmalig der Umzug. Folgenlos, solange
--    lokal die Wahrheit ist, siehe feature-request-server-ist-die-wahrheit.md.
select count(*) as doppelte_gruppen,
       sum(anzahl - 1) as ueberzaehlige_zeilen
from (
  select count(*) as anzahl
  from ereignisse
  group by nutzer, karte, form, art, zeit
  having count(*) > 1
) g;
```

```sql
-- 4. Der Export VOR dem Handgriff. Am Fremdschluessel haengt
--    "on delete cascade": ein falsch verknuepftes oder geloeschtes Konto
--    raeumt diese Zeilen ab, und dann gibt es kein Zurueck.
--
--    Zweimal laufen lassen, einmal je uid aus Abfrage 2 -- Matildas und, wenn
--    das MacBook eine eigene hat, auch dessen. Gesichert wird vor BEIDEN
--    Aufrufen, nicht vor dem ersten.
select *
from ereignisse
where nutzer = 'c815e627-4b69-4859-a025-a9f9d8ba5358'
order by id;
```

Die Reihenfolge des Handgriffs steht damit fest: **zählen (1, 2), doppelte
messen (3), exportieren (4), dann erst `updateUserById`** — Matildas uid auf
ihre Adresse, die MacBook-uid auf Thomas'. Thomas' Konto folgt demselben
Muster wie die der Kinder, mit einem Pseudonym als lokalem Teil; ein zweiter
Kontentyp entsteht dadurch nicht.

Abfrage 1 und 2 lesen `auth.users` und fremde Zeilen — das geht **nur im
Dashboard**, mit der Service-Rolle. Aus der App heraus lässt RLS davon nichts
zu, und der `sb_secret_`-Schlüssel gehört dafür trotzdem in keine `.env`.

**Einmal von Hand, für ein Kind.** Das ist kein Feature, das ist ein Handgriff —
und der Grund, warum die anonyme Anmeldung in Phase 1 trotzdem richtig war: sie
hat den Stand über Wochen gerettet, und der Umstieg kostet jetzt fünf Minuten
statt einer Datenmigration.

Für alle anderen — die Kinder, deren Konten von vornherein mit Adresse
entstehen — stellt sich die Frage nicht.

Wer sich auf einem Gerät anmeldet, auf dem schon anonym geübt wurde, verwirft
dessen Sitzung. Was darin lag, gehörte dem Gerät, nicht der Person — mit der
einen Ausnahme oben, und die macht Thomas von Hand.

## Was gebaut wird

- **`anmelden.html` + `src/anmelden.js`**, vierter Einstiegspunkt in
  `vite.config.js` neben `index`, `fortschritt` und `fleiss`. Kein Router,
  keine neue Abhängigkeit — dieselbe Entscheidung wie bei den beiden
  Statistikseiten. Zwei Felder, ein Knopf; die Mailadresse baut die Seite
  selbst zusammen.
- **Der Domänenteil der Kennung** gehört an genau eine Stelle im Code, nicht in
  jede Datei, die anmeldet. Er ändert sich nie — und wenn doch, sperrt eine
  vergessene Kopie ein Kind aus.
- **Abmelden und „wer bin ich"** in `src/ui/menue.js`. Ein Name und ein Knopf,
  mehr nicht.
- **Ein Pseudonym als Anzeigename** in einer kleinen `profile`-Tabelle (uid,
  pseudonym). **Klarnamen kommen nicht hinein**, siehe
  [Wenn fremde Kinder mitüben](../feature-request-kinderdaten.md).

  Das Pseudonym ist seit dem 29.08.2026 **tragend und nicht mehr Zierde**: alle
  sehen den Fortschritt aller, und das Pseudonym ist genau das, woran sie
  einander erkennen. Daraus folgt dreierlei — **Thomas vergibt es** (nicht das
  Kind, sonst heißt eines nach einer Woche wie ein anderes), **er kann es
  ändern** (Anzeigenamen können beleidigend sein), und **es darf den Klarnamen
  nicht durchscheinen lassen**. „matilda-p" ist kein Pseudonym.

## Was ausdrücklich nicht gebaut wird

Alles, wofür ein anderer den Namen sehen müsste: **Rangliste, Missionen,
userübergreifender Punktestand.** Das hängt an der Frage *was ist ein Punkt?*
im [Backlog](../backlog.md) und wird hier nicht angefasst — auch nicht „schon mal
vorbereitet". Die `profile`-Tabelle bekommt deshalb genau zwei Spalten.

## Die Abnahme

- Anmelden, neu laden, **noch angemeldet**. Als Oberflächen-Test in
  `tests/oberflaeche/` — die Sitzung über einen Neustart zu verlieren ist genau
  der Fehler, den man von Hand nie bemerkt, weil man beim Testen nicht neu
  lädt. Und weil das Formular der einzige Weg herein ist, wäre es kein
  Schönheitsfehler, sondern ein ausgesperrtes Kind.
- **Falsches Passwort:** ein verständlicher Satz, kein Stacktrace, und kein
  Hinweis darauf, ob es den Namen überhaupt gibt.
- **Sign-ups sind aus.** Nachzuweisen wie in `supabase/README.md`: ein
  `signUp`-Aufruf mit dem Publishable Key muss abgelehnt werden. Das ist die
  Abnahme, die man vergisst, weil nichts kaputtgeht, wenn sie fehlschlägt.
- Aus einer anonymen Sitzung mit gefülltem Lernstand ein Konto machen: **der
  Stand ist noch da.**

## Voraussetzung

Phase 1 vollständig, also
[die Naht](feature-backend-naht-2026-08-29-2225.md),
[die Tabelle](feature-ereignistabelle-2026-08-30-0815.md),
[das Melden](feature-ereignisse-melden-2026-08-30-1000.md) und
[der Umzug](feature-umzug-des-bestands-2026-08-30-1815.md).

## Was danach kommt

Zwei Dinge, unabhängig voneinander:
[Der Server wird die Wahrheit](../feature-request-server-ist-die-wahrheit.md) und —
**bevor das erste fremde Kind mitübt** —
[Wenn fremde Kinder mitüben](../feature-request-kinderdaten.md).
