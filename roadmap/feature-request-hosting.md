# Feature: GitHub Pages ablösen

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `vite.config.js`, `playwright.config.js`,
`.github/workflows/deploy.yml`, `README.md`

Wahrscheinlich **Vercel**. Die Datei sagt, warum Pages nicht mehr reicht, was
der Wechsel kostet und — der wichtigste Teil — **wann er stattfinden darf und
wann nicht.**

## Warum Pages nicht mehr reicht

Pages hat lange genau gepasst: statisch, kostenlos, ein Workflow, den man einmal
schreibt und nie wieder anfasst. Was jetzt fehlt, fehlt erst, seit es zwei
Datenbanken gibt:

- **Eine Seite pro Repo.** Ein Test-Stand zum Anschauen ginge nur als
  Unterordner `/VocApp/test/` oder über ein zweites Repo. Deshalb bleibt der
  Test-Stand in [Test und Produktion](implemented/feature-releases-2026-08-30-0803.md) vorerst
  lokal.
- **Keine Vorschau je Pull Request.** Ein Oberflächen-Feature lässt sich vor
  dem Merge nur bewerten, indem man es selbst startet. Für eine Zwölfjährige,
  die die Oberfläche mitgestaltet, ist ein Link, den sie auf dem Telefon
  öffnet, etwas anderes als `npm run dev`.
- **Umgebungsvariablen kennt Pages nicht.** Es gibt nur Repo-Secrets für den
  Workflow; die Trennung Produktion/Vorschau muss man sich selbst bauen.

Vercel bringt alle drei mit, ohne dass man etwas dafür schreibt: Vorschau je
Branch, Produktion aus einem Branch oder Tag, Variablen je Umgebung.

## Der Grund, warum diese Datei nicht als Erstes drankommt

**Ein Umzug wechselt die Adresse — und mit ihr den Speicher.**

`README.md` sagt es für den Homebildschirm schon: *„eine App auf dem
Homebildschirm hat einen eigenen Speicher, getrennt von Safari."* Derselbe
Mechanismus trifft hier härter. `localStorage` gehört zur **Herkunft**
(Adresse), nicht zur App. Von `thomaspaulus21107.github.io` nach
`vocapp.vercel.app` heißt: neuer Ursprung, leerer Speicher.

Wer heute umzieht, wirft Matildas Lernstand weg — jede geübte Woche, jeden
gezählten Tag.

### Und es ist schlimmer, als es zuerst aussah

In der Schublade liegt nicht nur der Lernstand, sondern auch der
**Sitzungstoken** (`sb-…-auth-token`). Der ist der Ausweis: ein anonymer
Nutzer hat keine Mailadresse und kein Passwort, und das Einzige, was beweist
„ich bin diese uid", ist dieser Token.

Ist er weg, legt die App einen **neuen** anonymen Nutzer an. Die alten Zeilen
sind dann nicht gelöscht — sie liegen in Postgres und gehören einer uid, **in
die sich niemand mehr anmelden kann.**

Ein Umzug nach dem Umzug des Bestands, aber vor den Konten, kostet also genau
so viel wie ein Umzug ganz ohne Datenbank. Hier stand deshalb zuerst „Phase 1
vollständig, besser noch Konten dazu" — das war zu weich.

**Die Reihenfolge ist nicht verhandelbar:**

```
1-4  der Lernstand liegt auf dem Server
  5  Matildas Konto hat eine Mailadresse    <- feature-request-konten.md
     |
     v
     DANN erst umziehen
```

Danach ist der Umzug harmlos: ein Link auf der neuen Adresse öffnet dieselbe
uid, und die neue Schublade füllt sich beim ersten Start von selbst.

Ein Umzug vorher wäre nur mit einem Exportknopf und einer Import-Seite zu
machen — also mit einem Feature, das man danach wieder wegwirft.

## Was der Wechsel im Code kostet

Wenig, aber an drei Stellen, die zusammenhängen:

- **`base: '/VocApp/'` in `vite.config.js` fällt weg.** Vercel liefert an der
  Wurzel aus. Das ist die eine Zeile, an der alles andere hängt — und sie kann
  nicht beides: ohne sie ist GitHub Pages sofort kaputt, mit ihr Vercel.

  Am 30.08.2026 nachgesehen, wie sich das äußert: Vercel liefert das HTML aus,
  darin steht `src="/VocApp/assets/index-….js"`, und dieser Pfad gibt dort
  einen 404. Ergebnis ist eine weiße Seite. **Das ist der erwartete Zustand,
  solange dieses Feature nicht gebaut ist**, und kein Zeichen, dass am
  Vercel-Projekt etwas falsch eingerichtet wäre.
- **`playwright.config.js`** kennt dieselbe Adresse als `ADRESSE`. Sie zieht
  mit, sonst laufen die Oberflächen-Tests gegen einen 404.
- **`deploy.yml` schrumpft.** Vercel baut und liefert selbst aus; der Workflow
  behält die Tests und den `migrieren`-Job — Migrationen bleiben bei GitHub,
  weil dort die Secrets schon liegen und weil sie nichts mit dem Ausliefern zu
  tun haben.
- **`README.md`** nennt die Adresse. Sie zieht mit.

## Was der Wechsel sonst kostet

- **Ein Dritter mehr.** Bisher hängt alles an GitHub. Danach an GitHub und
  Vercel — und bei fremden Kinderdaten ist „wer hat Zugriff worauf" eine Frage,
  die jemand beantworten können muss, siehe
  [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).
- **Die Adresse ist entschieden: `vocappulary.online`**, seit dem 30.08.2026,
  von Thomas und Matilda gemeinsam. Eine **eigene Domäne**, nicht die von
  Vercel vergebene — `voc-app-zeta.vercel.app` bleibt Platzhalter, bis
  umgezogen wird.

  Das ist mehr wert, als es zuerst aussah: **mit einer eigenen Domäne ist
  dieser Umzug der letzte Ursprungswechsel überhaupt.** Wer je Vercel
  ersetzt, ändert nur, wer hinter derselben Adresse antwortet — der Ursprung
  bleibt, und damit bleiben `localStorage`, Sitzung und Lesezeichen. Vorher
  hätte jeder Hosterwechsel wieder alles gekostet.

### `www` oder nicht ist keine Geschmacksfrage

`https://vocappulary.online` und `https://www.vocappulary.online` sind für den
Browser **zwei verschiedene Ursprünge**, mit zwei getrennten
`localStorage`-Schubladen. Wer die eine benutzt hat und später auf die andere
geleitet wird, steht vor einem leeren Speicher und einer verlorenen Sitzung.

Deshalb **eine von beiden festlegen, bevor sie irgendwer benutzt**, und die
andere darauf umleiten. **Entschieden am 30.08.2026: `https://vocappulary.online`
ohne `www`**, die nackte Form, und `www` leitet dorthin um. Kürzer zu tippen,
und getippt wird sie genau einmal, beim Anlegen auf dem Homebildschirm; ein
Grund für `www` gäbe es nur bei einem zweiten Angebot unter derselben Domäne,
und das gibt es nicht.

Ab dann gilt: **nur diese eine Adresse wird weitergegeben** — auch als die,
unter der sich jemand anmeldet, siehe
[Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md). Eine
Sitzung, die unter der falschen Schreibweise entsteht, liegt in der falschen
Schublade.
- **Jeder muss die App neu auf den Homebildschirm legen.** Das alte Lesezeichen
  zeigt auf die alte Adresse und wird nicht von selbst umziehen. Ein Satz an
  alle, die schon eins haben.
- **Jede Vorschau ist ein eigener Ursprung.** Vercel vergibt für Branches
  Adressen wie `vocapp-git-<branch>-….vercel.app` — anderer Host, andere
  `localStorage`-Schublade. Eine Vorschau startet deshalb immer leer und zeigt
  nie den echten Lernstand. Zum Ausprobieren ist das richtig so; man muss es
  nur wissen, bevor man es für einen Fehler hält. Wer in einer Vorschau echte
  Daten sehen will, meldet sich dort an — was wieder heißt: Konten zuerst.

## Was danach möglich wird

- **Vorschau je Pull Request**, mit eigener Adresse. Matilda bewertet eine
  Änderung auf dem Telefon, bevor sie gemergt wird. Das ist der eigentliche
  Gewinn — nicht Technik, sondern dass sie mitentscheiden kann.
- **Der Release-Knopf**, der in
  [Test und Produktion](implemented/feature-releases-2026-08-30-0803.md) vertagt wurde.

## Die Domäne geht vorab live, der Umzug nicht

Am 30.08.2026 entschieden und noch am selben Abend gebaut: **`base` hängt von
der Bauumgebung ab.**

```js
base: process.env.VERCEL ? '/' : '/VocApp/',
```

Damit zeigt `vocappulary.online` schon jetzt den aktuellen Stand — gegen
`VocApp`, die echte Datenbank — und GitHub Pages läuft unverändert weiter. Der
Satz weiter oben, eine weiße Seite unter der Vercel-Adresse sei der erwartete
Zustand, gilt ab hier nicht mehr.

**Das ist kein Umzug.** Unter der neuen Adresse ist der Speicher leer und
bleibt es: eigener Ursprung, eigene `localStorage`-Schublade, keine Sitzung.
Wer dort übt, legt einen **neuen anonymen Nutzer** in `VocApp` an, dessen Stand
später niemandem gehört — genau der Schaden, den die Reihenfolge ganz oben
verhindern soll.

**Deshalb: die Adresse wird noch nicht weitergegeben.** Matilda übt auf der
Pages-Adresse, bis sie ein Konto hat. Was hier live geht, ist ein Schaufenster
zum Nachsehen, ob Auslieferung, Domäne und Variablen zusammenpassen — nicht der
Ort, an dem jemand lernt.

## Das Zielbild der Umgebungen

Entschieden am 30.08.2026 abends. Die Tabelle ist die kurze Fassung, darunter
steht, was daran nicht selbsterklärend ist.

| | Adresse | Supabase | Variablen aus | Migrationen |
|---|---|---|---|---|
| **Production** | `vocappulary.online` | `VocApp` | Vercel-Env *Production* | GitHub Actions bei Merge auf `main` |
| **Vorschau je PR** | `vocapp-git-<branch>-….vercel.app` | `VocApp TEST` | Vercel-Env *Preview* | keine — läuft gegen das Schema von `main` |
| **Lokal** | `localhost` | `VocApp TEST` | `.env` | von Hand |

### Eine Domäne kann keine Umgebung tragen

Die naheliegende Idee — „die vercel.app-Adresse zeigt auf TEST, die eigene
Domäne auf Produktion" — **geht nicht**, und zwar aus einem Grund, der sich
nicht umgehen lässt: bei Vercel gehören die Variablen zum **Deployment**, nicht
zur Domain. `voc-app-zeta.vercel.app` ist nur ein zweiter Name für dasselbe
Production-Deployment: gleicher Build, gleiche `VITE_`-Werte, gleiche
Datenbank.

Getrennt wird nach **Umgebung**, und die entsteht aus dem Branch: `main` wird
Production, alles andere Preview. Das ist der ganze Mechanismus; im Repo steht
dazu nichts.

Die vercel.app-Adresse bleibt damit schlicht das Zweitalias der Produktion. Man
gibt sie nicht weiter, mehr ist dazu nicht zu tun.

### Kein fester Test-Stand mit eigener Adresse

Erwogen und **verworfen**: ein Branch `test` mit einer Domäne
`test.vocappulary.online` daran. Er will gepflegt und nachgezogen werden, und
was er liefern würde — eine Adresse mit Testdatenbank zum Ausprobieren — gibt
Vercel für jeden offenen Pull Request ohnehin.

Gebaut wird er, wenn jemand eine dauerhafte Adresse braucht, **ohne** dass ein
PR offen ist. Vorher ist er Pflegeaufwand für einen Fall, den es nicht gibt.

## Wie die Reihenfolge Schema-vor-App gesichert wird

`supabase/README.md` verlangt: erst das Schema, dann die App. Heute ist das
umsonst zu haben — beides liegt in einem Workflow, nacheinander.

**Nach dem Umzug ist es das nicht mehr.** Vercel baut sofort beim Push,
GitHub Actions migriert daneben; für ein paar Minuten kann neuer Code gegen ein
altes Schema laufen. Schreibt er in eine Spalte, die es noch nicht gibt,
schlägt der Insert fehl.

**Die Entscheidung: eine Migration kommt in ihrem eigenen Pull Request, vor
dem Code, der sie benutzt.** Erst das Schema nach `main`, Actions spielt es
ein; danach der PR mit dem Code. Damit ist das Problem nicht gelöst, sondern
gar nicht erst vorhanden, und zwar ohne eine einzige Zeile CI.

Es passt zu der Regel, die ohnehin gilt: *eine Migration darf nichts wegnehmen,
was die laufende App noch braucht.* Alte App gegen neues Schema ist deshalb
immer verträglich — in beliebiger Reihenfolge und beliebig lange.

Verworfen wurden zwei Alternativen:

- **Auto-Deploy abschalten und aus dem Migrationsjob per Deploy Hook
  auslösen** (`vercel.json`, `git.deploymentEnabled`). Es funktioniert, aber es
  verlegt die Auslieferung in eine selbstgebaute Mechanik, die man ab dann
  pflegt und erklärt.
- **Den Promote-Knopf die Reihenfolge sichern lassen.** Siehe unten — er kann
  es, aber er bezahlt es mit einem schlechteren Tausch.

## Zwei Entscheidungen vom 30.08.2026

- **Ein Pull Request bekommt seine Migration NICHT vorab in TEST.** Sonst
  ändert jeder offene PR die gemeinsame Testdatenbank, und zwei offene PRs
  können sich widersprechen. Eine Vorschau läuft also gegen das Schema von
  `main`; wer für seine Änderung mehr braucht, schreibt das in die
  PR-Beschreibung.
- **Der Release-Knopf wird Vercels „Promote to Production"**, kein Git-Tag.
  Er sitzt neben der Vorschau, die man gerade bewertet hat, und das ist die
  richtige Stelle: befördert wird genau das, was man angesehen hat.

  **Aber er sichert die Reihenfolge nicht ab**, und er soll es auch nicht.
  Am Abend des 30.08.2026 durchgespielt: ein Knopf, der den Zeitpunkt des
  Produktionswechsels in Menschenhand legt, löst zwar das Timing — man klickt
  erst, wenn die Migration grün ist. Er setzt aber voraus, dass `main` **nicht**
  automatisch nach Production geht, denn sonst gäbe es nichts zu befördern. Und
  dann wandert ein Artefakt nach Production, das als *Preview* gebaut wurde.

  `VITE_`-Variablen werden beim Bauen eingebacken. Hängt „Promote" nur die
  Adresse um, statt neu zu bauen, zeigt die Produktion danach auf
  `VocApp TEST` — Matilda übt, die Zeilen landen in der Testdatenbank, und
  niemand sieht es.

  **Deshalb: Production baut automatisch aus `main`.** Dann sind garantiert
  die Production-Variablen drin, ohne dass jemand es nachhalten muss. Der Knopf
  bleibt für das, wofür er taugt — eine Vorschau, die Matilda auf dem Telefon
  abgenommen hat, ohne Umweg live schalten.

  **Vorher auszuprobieren, nicht anzunehmen:** ob eine beförderte Vorschau die
  Variablen ihrer eigenen Umgebung behält. Das ist der erste Test nach dem
  Umzug, und er entscheidet, wofür der Knopf überhaupt benutzt werden darf.

## Was bei Vercel einzustellen ist

Am 30.08.2026 ist das Projekt schon angelegt worden, um den Namen zu klaeren.
Was dabei gelernt wurde, damit es beim Bauen nicht noch einmal gesucht wird:

- **Vite wird von allein erkannt.** Framework-Preset `Vite`, Ausgabe `dist`,
  nichts einzustellen.
- **Die Supabase-Integration im Vercel-Marketplace NICHT benutzen.** Sie legt
  eigene Variablennamen an (`NEXT_PUBLIC_…`, `SUPABASE_…`) und will ein
  Projekt fuer einen verwalten. Es gibt aber schon zwei Projekte und eigene
  Namen — das gaebe nur zwei Wahrheiten.
- **Stattdessen von Hand**, unter Settings → Environment Variables. Vercel
  erlaubt denselben Namen mit verschiedenen Werten je Umgebung, und genau das
  ist der Grund fuer diesen ganzen Umzug:

  | Variable | Production | Preview | Development |
  |---|---|---|---|
  | `VITE_SUPABASE_URL` | VocApp | TEST | TEST |
  | `VITE_SUPABASE_PUBLISHABLE_KEY` | VocApp | TEST | TEST |

- **Vercel bekommt nie ein Datenbank-Passwort und nie den Access Token.** Es
  baut nur. Die Migrationen bleiben bei GitHub Actions, wo die Secrets schon
  liegen.
- **Die Domaene** unter Settings → Domains hinzufuegen; Vercel zeigt dann an,
  welche DNS-Eintraege beim Registrar zu setzen sind. `www` dazunehmen und auf
  die Form ohne `www` umleiten.

## Die Abnahme

- Die App läuft unter der neuen Adresse, und die Oberflächen-Tests laufen
  ebenfalls dagegen.
- **Zeigt die Produktion auf `VocApp` und die Vorschau auf `VocApp TEST`?**
  Nachzuzählen im ausgelieferten Bundle, das Rezept steht in
  [`supabase/README.md`](../supabase/README.md). Das ist zugleich der Test
  für den Vorbehalt beim Knopf: eine *beförderte* Vorschau könnte die
  Variablen ihrer eigenen Umgebung behalten haben.
- **Anmelden, Stand ist da.** Das ist der Test, der zeigt, dass die Reihenfolge
  oben eingehalten wurde.
- Die alte Pages-Adresse sagt, wo es weitergeht, statt eine tote Seite zu
  zeigen — mindestens so lange, wie noch jemand ein altes Lesezeichen hat.

## Voraussetzung

**Phase 1 vollständig** — [Naht](implemented/feature-backend-naht-2026-08-29-2225.md),
[Tabelle](implemented/feature-ereignistabelle-2026-08-30-0815.md),
[Melden](implemented/feature-ereignisse-melden-2026-08-30-1000.md),
[Umzug](implemented/feature-umzug-des-bestands-2026-08-30-1815.md) — **und
[Konten](feature-request-konten.md)**, ohne Ausnahme.

Siehe die Reihenfolge oben: vorher kostet dieser Umzug nicht nur den lokalen
Lernstand, sondern den Zugang zu dem, was schon auf dem Server liegt.
