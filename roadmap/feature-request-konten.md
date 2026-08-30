# Feature: Aus der anonymen Sitzung wird ein Konto

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `anmelden.html` und `src/anmelden.js` — neu, dazu
`vite.config.js`, `src/ui/menue.js`, `src/infra/backend.js`

Der Anfang von Phase 2. Ab hier gehört ein Lernstand einer **Person** und nicht
mehr einem Browser.

## Wer legt Konten an: entschieden am 29.08.2026

**Thomas legt sie an. Jedes Kind bekommt einen eigenen Link, und es wird keine
Mail verschickt.**

Ein offenes Anmeldeformular im Netz ist bei Kinderdaten die Tür, die man nicht
aufmacht — und bei einem Dutzend Kindern sind zwölf Konten von Hand eine halbe
Stunde, kein Feature. Die Oberfläche kennt deshalb weder Registrieren noch ein
Passwortfeld.

### Ein Magic Link, den du selbst überbringst

`auth.admin.generateLink({ type: 'magiclink', email })` **erzeugt** einen Link,
ohne ihn zu verschicken. Damit braucht das Projekt keine Mailanbindung: du
kopierst den Link aus dem Dashboard und gibst ihn weiter, wie es gerade passt —
WhatsApp an die Eltern, QR-Code auf Papier, vorgelesen.

Drei Dinge, die daran hängen und beim ersten Mal überraschen:

- **Der Link ist ein Einrichtungsschritt, kein Anmeldeweg.** Er wird **einmal je
  Gerät** geöffnet; danach liegt die Sitzung im Gerät und wird stillschweigend
  erneuert. Wer die App auf den Homebildschirm legt — und das soll ohnehin
  jeder, siehe `README.md` — klickt nie wieder einen Link.
- **Er läuft ab.** Standard ist eine Stunde; die Frist gilt nur zwischen
  Erzeugen und erstem Öffnen, nicht für die Sitzung danach. Praktisch heißt
  das: Link erzeugen, wenn das Kind gerade da ist, nicht auf Vorrat.
- **Geht die Sitzung doch verloren** (neues Telefon, Browserdaten gelöscht,
  App vom Homebildschirm geworfen), gibt es keinen Selbstbedienungsweg zurück.
  Dann erzeugst du einen neuen Link. Bei zwölf Kindern ist das vertretbar —
  bei hundert wäre es das nicht, und dann bräuchte es eine echte Mailanbindung.

`generateLink` braucht die Service-Rolle und geht deshalb **nicht** aus dem
Browser. Es bleibt im Dashboard, so wie das Löschen in
[Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

### Was daraus für `anmelden.html` folgt

Fast nichts — und das ist der Punkt. Die Seite nimmt den Link entgegen,
tauscht ihn gegen eine Sitzung und schickt weiter zur App. **Kein Formular,
kein Passwort, kein „angemeldet bleiben"-Haken.** Was sie braucht, ist ein
verständlicher Satz für den Fall, dass der Link abgelaufen ist.

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
`auth.admin.updateUserById(uid, { email, email_confirm: true })` setzt die
Adresse und markiert sie als bestätigt. Danach ist es ein normales Konto, für
das du Links erzeugen kannst wie für jedes andere.

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
  Statistikseiten.
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

- Link öffnen, neu laden, noch angemeldet. Als Oberflächen-Test in
  `tests/oberflaeche/` — die Sitzung über einen Neustart zu verlieren ist genau
  der Fehler, den man von Hand nie bemerkt, weil man beim Testen nicht neu
  lädt. Und weil der Link der einzige Weg herein ist, wäre es hier kein
  Schönheitsfehler, sondern ein ausgesperrtes Kind.
- Aus einer anonymen Sitzung mit gefülltem Lernstand ein Konto machen: **der
  Stand ist noch da.**
- Einen abgelaufenen Link öffnen: ein verständlicher Satz, kein Stacktrace.

## Voraussetzung

Phase 1 vollständig, also
[die Naht](implemented/feature-backend-naht-2026-08-29-2225.md),
[die Tabelle](implemented/feature-ereignistabelle-2026-08-30-0815.md),
[das Melden](implemented/feature-ereignisse-melden-2026-08-30-1000.md) und
[der Umzug](feature-request-umzug-des-bestands.md).

## Was danach kommt

Zwei Dinge, unabhängig voneinander:
[Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) und —
**bevor das erste fremde Kind mitübt** —
[Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).
