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
  Test-Stand in [Test und Produktion](feature-request-releases.md) vorerst
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

**Also gilt eine Reihenfolge, und sie ist nicht verhandelbar:**

```
1-4  der Lernstand liegt auf dem Server   <- implemented/feature-backend-naht-2026-08-29-2225.md ff.
     |
     v
     DANN erst umziehen
```

Danach ist der Umzug harmlos: die Daten liegen in Postgres, das Konto folgt der
Person, und die neue Adresse holt sich beim ersten Start denselben Stand.

Ein Umzug **vorher** wäre nur mit einem Exportknopf und einer Import-Seite zu
machen — also mit einem Feature, das man danach wieder wegwirft.

## Was der Wechsel im Code kostet

Wenig, aber an drei Stellen, die zusammenhängen:

- **`base: '/VocApp/'` in `vite.config.js` fällt weg.** Vercel liefert an der
  Wurzel aus. Das ist die eine Zeile, an der alles andere hängt.
- **`playwright.config.js`** kennt dieselbe Adresse als `ADRESSE`. Sie zieht
  mit, sonst laufen die Oberflächen-Tests gegen einen 404.
- **`deploy.yml` schrumpft.** Vercel baut selbst; der Workflow behält nur, was
  wirklich CI ist — die Tests. Der Release-Ablauf aus
  [Test und Produktion](feature-request-releases.md) wandert in die
  Vercel-Konfiguration, oder der Workflow ruft Vercel an. **Welches von beidem,
  entscheidet sich erst am Ende dieser Datei** — vorher ist es Spekulation über
  eine Oberfläche, die noch niemand von uns benutzt hat.
- **`README.md`** nennt die Adresse. Sie zieht mit.

## Was der Wechsel sonst kostet

- **Ein Dritter mehr.** Bisher hängt alles an GitHub. Danach an GitHub und
  Vercel — und bei fremden Kinderdaten ist „wer hat Zugriff worauf" eine Frage,
  die jemand beantworten können muss, siehe
  [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).
- **Die Adresse ändert sich noch einmal**, wenn später eine eigene Domäne
  dazukommt. Dann verliert der lokale Zwischenspeicher wieder seinen Inhalt —
  folgenlos, sobald der Server die Wahrheit ist, aber ein Grund, die Domäne
  gleich mitzuentscheiden statt in zwei Schritten umzuziehen.
- **Jeder muss die App neu auf den Homebildschirm legen.** Das alte Lesezeichen
  zeigt auf die alte Adresse und wird nicht von selbst umziehen. Ein Satz an
  alle, die schon eins haben.

## Was danach möglich wird

- **Der Test-Stand bekommt eine Adresse.** Damit gilt „TEST entspricht `main`"
  auch zum Anschauen und nicht nur lokal — der zurückgestellte Teil aus
  [Test und Produktion](feature-request-releases.md).
- **Vorschau je Pull Request.** Matilda bewertet eine Änderung auf dem Telefon,
  bevor sie gemergt wird.

## Die Abnahme

- Die App läuft unter der neuen Adresse, und die Oberflächen-Tests laufen
  ebenfalls dagegen.
- **Anmelden, Stand ist da.** Das ist der Test, der zeigt, dass die Reihenfolge
  oben eingehalten wurde.
- Die alte Pages-Adresse sagt, wo es weitergeht, statt eine tote Seite zu
  zeigen — mindestens so lange, wie noch jemand ein altes Lesezeichen hat.

## Voraussetzung

**Phase 1 vollständig** — [Naht](implemented/feature-backend-naht-2026-08-29-2225.md),
[Tabelle](feature-request-ereignistabelle.md),
[Melden](feature-request-ereignisse-melden.md),
[Umzug](feature-request-umzug-des-bestands.md) — und besser noch
[Konten](feature-request-konten.md) dazu. Siehe die Reihenfolge oben: **vorher
kostet dieser Umzug den Lernstand.**
