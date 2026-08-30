# Feature: Aus der anonymen Sitzung wird ein Konto

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `anmelden.html` und `src/anmelden.js` — neu, dazu
`vite.config.js`, `src/ui/menue.js`, `src/infra/backend.js`, und ein Schalter
in der Supabase-Konfiguration (Sign-ups aus)

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
müssen. Siehe [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

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

**Nimm die uid ihres iPhones**, nicht die des MacBooks: seit dem
[Umzug des Bestands](implemented/feature-umzug-des-bestands-2026-08-30-1815.md)
liegen mehrere anonyme Nutzer in `VocApp`, einer je Gerät. Welcher ihrer ist,
steht in der Tabelle — das Gerät mit den meisten Zeilen aus ihrem Alltag.

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
  [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

  Das Pseudonym ist seit dem 29.08.2026 **tragend und nicht mehr Zierde**: alle
  sehen den Fortschritt aller, und das Pseudonym ist genau das, woran sie
  einander erkennen. Daraus folgt dreierlei — **Thomas vergibt es** (nicht das
  Kind, sonst heißt eines nach einer Woche wie ein anderes), **er kann es
  ändern** (Anzeigenamen können beleidigend sein), und **es darf den Klarnamen
  nicht durchscheinen lassen**. „matilda-p" ist kein Pseudonym.

## Was ausdrücklich nicht gebaut wird

Alles, wofür ein anderer den Namen sehen müsste: **Rangliste, Missionen,
userübergreifender Punktestand.** Das hängt an der Frage *was ist ein Punkt?*
im [Backlog](backlog.md) und wird hier nicht angefasst — auch nicht „schon mal
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
[die Naht](implemented/feature-backend-naht-2026-08-29-2225.md),
[die Tabelle](implemented/feature-ereignistabelle-2026-08-30-0815.md),
[das Melden](implemented/feature-ereignisse-melden-2026-08-30-1000.md) und
[der Umzug](implemented/feature-umzug-des-bestands-2026-08-30-1815.md).

## Was danach kommt

Zwei Dinge, unabhängig voneinander:
[Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) und —
**bevor das erste fremde Kind mitübt** —
[Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).
