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
- **Die Adresse ist noch nicht entschieden.** Entschieden ist nur: eine
  `*.vercel.app`-Adresse, **keine eigene Domäne** — also genau ein
  Ursprungswechsel und nicht zwei.

  `vocapp` war am 30.08.2026 vergeben; Vercel hat beim Anlegen
  `voc-app-zeta.vercel.app` daraus gemacht. Das ist ein **Platzhalter**, kein
  Beschluss: unter Settings → Domains lässt sich jede freie
  `*.vercel.app`-Adresse dazunehmen, ohne am Projekt etwas zu ändern.

  **Der Name muss erst stehen, wenn dieses Feature gebaut wird** — vorher
  kennt die Adresse niemand und ändern kostet nichts. Danach kostet es jeden
  eine neue Anmeldung und ein neues Lesezeichen auf dem Homebildschirm.
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

## Zwei Entscheidungen vom 30.08.2026

- **Ein Pull Request bekommt seine Migration NICHT vorab in TEST.** Sonst
  ändert jeder offene PR die gemeinsame Testdatenbank, und zwei offene PRs
  können sich widersprechen. Eine Vorschau läuft also gegen das Schema von
  `main`; wer für seine Änderung mehr braucht, schreibt das in die
  PR-Beschreibung.
- **Der Release-Knopf wird Vercels „Promote to Production"**, kein Git-Tag.
  Er sitzt neben der Vorschau, die man gerade bewertet hat, und das ist die
  richtige Stelle: befördert wird genau das, was man angesehen hat.

  **Vorher auszuprobieren, nicht anzunehmen:** `VITE_`-Variablen werden beim
  Bauen eingebacken. Wird eine Vorschau *befördert* statt neu gebaut, könnte
  die beförderte Fassung weiter auf `VocApp TEST` zeigen — also auf die
  falsche Datenbank, ohne dass es jemand sieht. Das ist der erste Test nach
  dem Umzug, und er entscheidet, ob der Knopf so bleiben kann.

## Die Abnahme

- Die App läuft unter der neuen Adresse, und die Oberflächen-Tests laufen
  ebenfalls dagegen.
- **Anmelden, Stand ist da.** Das ist der Test, der zeigt, dass die Reihenfolge
  oben eingehalten wurde.
- Die alte Pages-Adresse sagt, wo es weitergeht, statt eine tote Seite zu
  zeigen — mindestens so lange, wie noch jemand ein altes Lesezeichen hat.

## Voraussetzung

**Phase 1 vollständig** — [Naht](implemented/feature-backend-naht-2026-08-29-2225.md),
[Tabelle](implemented/feature-ereignistabelle-2026-08-30-0815.md),
[Melden](implemented/feature-ereignisse-melden-2026-08-30-1000.md),
[Umzug](feature-request-umzug-des-bestands.md) — **und
[Konten](feature-request-konten.md)**, ohne Ausnahme.

Siehe die Reihenfolge oben: vorher kostet dieser Umzug nicht nur den lokalen
Lernstand, sondern den Zugang zu dem, was schon auf dem Server liegt.
