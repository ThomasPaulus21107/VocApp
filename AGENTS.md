# AGENTS.md

Kontext für KI-Assistenten, die in diesem Repo arbeiten (Claude Code, Copilot,
Cursor). Bitte vor der ersten Änderung lesen.

---

## Was das hier ist

Eine Vokabel-Lern-App. **Hobbyprojekt eines Vaters mit seiner 12-jährigen
Tochter.** Das ist keine Randnotiz, sondern die wichtigste Randbedingung:

- Matilda (12) ist Co-Autorin, nicht nur Nutzerin. Sie pflegt die Vokabeln
  und gestaltet die Oberfläche. Einen eigenen GitHub-Account hat sie noch
  nicht — dort liegt die Altersgrenze bei 13. Sie arbeitet an Thomas' Rechner
  mit, er übernimmt den GitHub-Teil.
- Code muss deshalb **lesbar bleiben**, auch wenn kompakter ginge. Ein
  cleverer Einzeiler, den sie nicht versteht, ist hier ein Rückschritt.
- Kommentare auf Deutsch, Bezeichner auf Deutsch. Konsistent bleiben.
- Fehlermeldungen und UI-Texte in ganzen, freundlichen Sätzen.

Ziel des Projekts ist zu gleichen Teilen eine funktionierende App **und** eine
gemeinsame Lernerfahrung. Vorschläge, die das Erste auf Kosten des Zweiten
optimieren, sind hier falsch.

---

## Aktueller Stand: Sprint 1

**Ziel:** Eine Karte erscheint, man tippt die Antwort, die App sagt richtig
oder falsch, das Ganze läuft unter einer öffentlichen URL.

**Fertig, wenn** die App auf GitHub Pages liegt, die Vokabeln aus dem JSON
kommen, die Tests grün sind und mindestens eine Änderung von Matilda in `main`
gemergt ist.

### Ausdrücklich NICHT in Sprint 1

Punkte, Streaks, Leitner-Algorithmus, Accounts, PWA, Supabase, TypeScript,
Framework.

Wenn eine Aufgabe eines dieser Themen berührt: **nicht einbauen, sondern
nachfragen.** Alle sind bewusst für spätere Sprints zurückgestellt. Das
Projekt soll klein bleiben und früh laufen.

**GitHub Actions stand hier ursprünglich mit auf der Liste und wurde bewusst
vorgezogen.** Der Deploy von Hand über einen `gh-pages`-Branch wären fünf
Befehle bei jedem Veröffentlichen — gegenüber einer Workflow-Datei, die man
einmal schreibt und nie wieder anfasst. Vor allem aber hat der Handbetrieb
einen Fehlermodus, den der Workflow nicht kennt: `npm run build` vergessen und
einen alten Stand hochladen, ohne dass es auffällt. Der Workflow fügt keine
Abhängigkeit und keine Zeile hinzu, die Matilda liest, und ein späterer Sprint
hätte ihn ohnehin gebracht. Nur Build und Deploy sind vorgezogen; **CI im
Sinne von Tests als Merge-Bedingung ist ein eigenes Vorhaben**, siehe
`roadmap/feature-tests-in-ci.md`.

---

## Architektur: der eine Schnitt, der alles trägt

```
data/          Vokabellisten und die Wortartenliste als JSON. Daten, kein Code.
src/domain/    Regeln: was ist richtig, wie wird gemischt, wie gedreht.
src/ui/        Alles, was der Nutzer sieht und hört: DOM und Töne.
src/app.js     Steckt die Schichten zusammen.
tests/         Tests auf domain/ und auf die Daten.
```

**Die Regel:** `domain/` kennt kein DOM, keinen `localStorage`, kein
Netzwerk, kein `Date.now()`. Alles dort sind reine Funktionen: Eingabe rein,
Ergebnis raus, keine Seiteneffekte.

**Warum das nicht verhandelbar ist:** Die Tests laufen dadurch in
Millisekunden ohne Browser. Und in Sprint 4 soll Supabase dazukommen, ohne
dass Domänenlogik oder UI davon erfahren. Jede Verletzung dieses Schnitts
macht beides kaputt.

**Konkrete Konsequenzen:**

- Zufall wird hereingereicht: `mische(karten, zufall = Math.random)`.
- Das Datum wird später genauso hereingereicht: `berechneStreak(zustand, heute)`.
  Niemals `new Date()` innerhalb einer Domänenfunktion.
- `ui.js` kennt nur `textContent`, `classList`, `hidden`,
  Event-Registrierung und die Töne aus `klang.js`. Keine Lernlogik, keine
  Entscheidung über richtig oder falsch.
- `klang.js` ist die zweite Datei der UI-Schicht: sie erzeugt die
  Rückmeldungstöne, fasst aber keinen DOM an. Sie bekommt nur einen Namen
  gesagt (`spiele('richtig')`) und entscheidet nichts selbst. Die Töne
  werden im Browser gerechnet -- es gibt bewusst keine Sounddateien, damit
  eine Melodie aus Zahlen besteht, die man ändern kann.
- Datenfluss nach unten (App sagt der UI, was sie zeigen soll), Ereignisse
  nach oben (UI meldet nur, *was* passiert ist).
- `app.js` ist der einzige Ort mit veränderlichem Zustand.

---

## Das Datenformat

Maßgeblich sind die Dateien in `data/`, so wie Matilda sie angelegt hat. Wenn
diese Beschreibung und eine Datei sich widersprechen, hat **die Datei recht**
und diese Beschreibung wird nachgezogen — nicht umgekehrt.

Es gibt inzwischen mehr als eine Liste:

| Datei | Inhalt |
|---|---|
| `data/vokabeln.json` | gemischte Vokabeln, Matildas Lektionen |
| `data/unregelmaessige-verben.json` | nur unregelmäßige Verben, mit allen drei Formen |
| `data/wortarten.json` | die erlaubten Werte für `wortart`, eine flache Liste |

**Unregelmäßige Verben stehen nur in der Verbendatei.** Eine Karte mit
`"wortart": "unregelmäßiges Verb"` ohne `formen` ist ein Fehler, und eine
Karte mit `formen` und einer anderen `wortart` genauso. Der Daten-Test prüft
beide Richtungen.

### Die Datei als Ganzes

Die Datei ist ein Objekt mit einer Überschrift und der Kartenliste:

```json
{
  "titel": "Lektion Demo",
  "karten": [ ... ]
}
```

- `titel`: der Name der Lektion, wird in der App angezeigt.
- `karten`: die Liste der Vokabelkarten.

Der Code liest also `daten.karten`, nicht die Datei selbst als Liste.

### Eine Karte

Eine Karte kennt **beide Sprachen**. Die Abfragerichtung entscheidet erst die
App über `stelleFrage(karte, richtung)`.

```json
{
  "id": "demo-002",
  "en": ["bike", "bicycle"],
  "de": ["Fahrrad", "Rad"],
  "wortart": "Nomen",
  "hinweise": {
    "nach-de": "hat Räder und einen Lenker",
    "nach-en": "you ride it to school"
  }
}
```

Pflicht auf jeder Karte: `id`, `en`, `de`, `wortart` und `hinweise` mit
beiden Richtungen.

- `id`: Präfix der Lektion plus laufende Nummer, z. B. `demo-002`. Innerhalb
  der Datei eindeutig.
- `en` / `de`: Listen. **Das erste Wort wird als Frage gezeigt**, alle gelten
  als richtige Antwort.
- `wortart`: einer der Werte aus `data/wortarten.json`, sonst nichts. Die
  Liste ist bewusst Daten und kein Code: fehlt eine Wortart, wird sie **dort**
  eingetragen und steht danach überall zur Verfügung. Frei auf die Karte
  schreiben geht nicht mehr — ein Tippfehler wäre sonst eine stille Wortart,
  die nur einmal vorkommt. Der Daten-Test setzt das durch.
- `hinweise.nach-de` erscheint, wenn auf Deutsch geantwortet werden soll,
  `hinweise.nach-en` entsprechend andersherum. Der Hinweis ist eingeklappt
  hinter einem Knopf.
- Synonyme (Fahrrad / Rad) kommen in **eine Liste**.

### `bedeutung` — freiwillig, für mehrdeutige Wörter

`bedeutung` steht bisher auf keiner Karte und ist deshalb **optional**. Es
wird erst gebraucht, wenn ein Wort ohne Zusatz nicht eindeutig beantwortbar
ist:

```json
{
  "id": "l1-014",
  "en": ["bank"],
  "de": ["Bank"],
  "bedeutung": "Geld",
  "wortart": "Nomen",
  "hinweise": {
    "nach-de": "da liegt das Geld",
    "nach-en": "you keep your money there"
  }
}
```

Verschiedene Bedeutungen (Bank / Ufer) brauchen **zwei Karten** mit
unterschiedlicher `bedeutung`.

`wortart` und `bedeutung` stehen **offen** unter der Frage, weil sie zur
Aufgabe gehören — anders als die Hinweise, die man sich erst holen muss.
Fehlt `bedeutung`, zeigt die UI an dieser Stelle einfach nichts an.

### `formen` — die drei Formen unregelmäßiger Verben

Ein unregelmäßiges Verb hat **statt** `en` und `de` das Feld `formen` mit drei
Paaren. Jedes Paar kennt wieder beide Sprachen:

```json
{
  "id": "uv-053",
  "wortart": "unregelmäßiges Verb",
  "formen": {
    "infinitive": { "en": ["to write"], "de": ["schreiben"] },
    "simple-past": { "en": ["wrote"], "de": ["schrieb"] },
    "past-participle": { "en": ["written"], "de": ["geschrieben"] }
  },
  "hinweise": { "nach-de": "...", "nach-en": "..." }
}
```

Abgefragt wird so eine Karte anders als eine normale Vokabel: **alle drei
Formen werden gezeigt, eine davon bleibt leer und wird getippt.** Welche,
entscheidet der Zufall — und der wird wie überall hereingereicht, nicht in der
Domänenfunktion gezogen.

- Die drei Schlüssel heißen wie die Spalten im Schulheft und liegen fest.
- **Nur der Infinitiv trägt alle Bedeutungen.** `to break` heißt „brechen,
  zerbrechen, kaputtmachen"; die zweite und dritte Form stehen nur in der
  Hauptbedeutung da („brach", „gebrochen"). Sonst wachsen die Listen ins
  Unlesbare, ohne dass jemand mehr davon lernt. Preis: wer „zerbrach" tippt,
  bekommt ein Falsch.
- `en` und `de` sind auch hier Listen, und auch hier gilt: **das erste Wort
  wird gezeigt**, alle gelten als richtig.
- `hinweise` steht einmal pro Karte, nicht pro Form. Der Tipp beschreibt die
  Bedeutung des Verbs, und die ändert sich über die Formen nicht.

Eine Karte hat entweder `en`/`de` oder `formen` — nie beides, nie keins.

### `id` ist heilig

Niemals eine bestehende `id` ändern, umbenennen oder neu vergeben. Sobald es
einen gespeicherten Lernstand gibt (siehe `roadmap/backlog.md`), hängt er
daran. Frage-Text darf sich ändern, die `id` nie.

---

## Zwei Easter Eggs im Eingabefeld

`pruefeAntwort()` behandelt zwei Eingaben gesondert. Beide stehen als benannte
Konstanten in `domain/pruefung.js` und sind **Absicht, kein toter Code**:

| Eingabe | Konstante | Was passiert |
|---|---|---|
| `s` | `SPRINGEN` | Karte überspringen, sofort zur nächsten, ohne Lösung |
| `keine ahnung` | `AUFGEBEN` | „DU SCHAFFST DAS" — die Karte bleibt offen, kein Versuch verbraucht |

**In der Oberfläche steht bewusst nichts davon.** Sie sollen gefunden werden,
nicht erklärt. Also bitte weder ins Label schreiben noch in `data/README.md`
erwähnen — die Anleitung liest Matilda.

Dass sie in der Domänenschicht liegen und nicht in `ui.js`, hat einen Grund:
was eine Eingabe *bedeutet*, ist eine Regel. Die UI erfährt nur, was sie
anzeigen soll.

Als Antwort können die beiden nicht kollidieren — keine englische Verbform ist
einen Buchstaben lang, und „keine ahnung" ist kein englisches Wort.

## Bereiche, die Matilda gehören

Hier bitte **nicht ungefragt aufräumen, umbauen oder "optimieren"**:

| Datei | Was daran wichtig ist |
|---|---|
| `data/vokabeln.json` | ihr Inhalt. Nicht sortieren, nicht umformatieren. |
| `data/README.md` | die Anleitung in ihrer Sprache. Bei Formatänderung mitpflegen. |
| `src/ui/styles.css` | der Variablenblock ganz oben mit deutschen Kommentaren. Nicht in eine andere Datei verschieben, nicht umbenennen, nicht durch ein Framework ersetzen. |
| UI-Texte in `ui.js` | "Prüfen", "Richtig!", "Leider nicht ..." formuliert sie selbst. |
| `MELODIEN` in `src/ui/klang.js` | wie die fünf Rückmeldungen klingen. Zahlen ändern, hören, fertig -- wie der Farbblock im CSS. |

Der CSS-Variablenblock ist Absicht: eine Farbe ändern, speichern, sofort
Wirkung sehen. Das ist ihr erster Kontakt mit Code.

---

## Werkzeuge und Befehle

```bash
npm install     # Abhängigkeiten
npm run dev     # Dev-Server auf localhost:5173
npm test        # Vitest, einmalig
npm run build   # Produktionsstand nach dist/
```

- **Vite** als Build-Tool, Vanilla JS, kein Framework.
- **Vitest** für Tests.
- Keine weiteren Abhängigkeiten hinzufügen ohne Rückfrage. Jede neue
  Abhängigkeit ist etwas, das Matilda nicht mehr überblickt.
- `vite.config.js` enthält `base: '/VocApp/'` — nötig für GitHub Pages.
  Nicht entfernen. Der Pfad muss zum Repo-Namen passen, sonst lädt die
  veröffentlichte Seite leer.
- `.github/workflows/deploy.yml` baut bei jedem Push auf `main` und
  veröffentlicht auf Pages. Pages steht in den Repo-Einstellungen auf Quelle
  **GitHub Actions**, nicht auf „Deploy from a branch".
- `dist/` gehört deshalb **nie** ins Repo — es entsteht bei jedem Lauf neu und
  steht in der `.gitignore`.
- Der Workflow prüft bewusst **nicht**, ob die Tests grün sind. Das kommt mit
  `roadmap/feature-tests-in-ci.md` dazu. Bis dahin gilt: vor dem Pull Request
  einmal `npm test`.

---

## Tests

Zwei Sorten, beide relevant:

- `tests/pruefung.test.js` — die Domänenlogik.
- `tests/daten.test.js` — die Vokabeldateien selbst, **alle** aus `data/`:
  `titel` und `karten` vorhanden, `id` über alle Dateien hinweg eindeutig,
  beide Sprachen gefüllt, `wortart` aus `wortarten.json`, `formen` und
  `wortart` passen zueinander, beide Hinweise vorhanden. `bedeutung` wird
  **nicht** eingefordert, sie ist freiwillig. Meldet die betroffene `id`.

  Die ids müssen über alle Dateien zusammen eindeutig sein, nicht nur je
  Datei — die App lädt sie in einen gemeinsamen Stapel, und ein späterer
  Lernstand hängt an der id.

**Der Daten-Test ist der praktisch wichtigste.** Er fängt Matildas Tippfehler
ab, bevor sie in der App auffallen. Bei Änderungen am Format muss er
mitwachsen.

Neue Tests bitte im gleichen Stil: deutsche Beschreibungen, ein Verhalten pro
Test, keine Mocks (die Domänenschicht braucht keine).

Faustregel zum Umfang: Tests auf die Domänenlogik, Tests auf die Daten. Keine
Tests auf `ui.js` in Sprint 1. Bei einem gefundenen Fehler einen Test
schreiben, der ihn festhält.

---

## Git-Workflow

`main` ist geschützt und immer deploybar. Jede Änderung läuft über einen
Branch und einen Pull Request.

```bash
git switch main && git pull
git switch -c thema-des-branches
# arbeiten
git add <datei>
git commit -m "Beschreibung der Aenderung"
git push -u origin thema-des-branches
# Pull Request auf GitHub, Review, Merge, Branch löschen
```

- Kleine Commits, eine Sache pro Commit.
- Commit-Nachrichten auf Deutsch, ohne Umlaute im Betreff
  (Terminal-Kompatibilität). Hauptsache, man versteht später, was passiert
  ist — eine feste grammatische Form gibt es hier nicht. Auf Imperativ oder
  sonstige Stilvorgaben bitte **nicht** hinweisen.
- `git add .` vermeiden, lieber gezielt Dateien nennen.
- Kein `--force` auf `main`.
- Branches nach dem Merge löschen. Einen `gh-pages`-Branch gibt es nicht —
  der Deploy läuft über Actions, das Build-Ergebnis landet nie in Git.
- Nach dem Löschen eines Branches auf GitHub räumt `git fetch --prune` die
  veralteten Einträge unter `git branch -r` weg.

**Für KI-Assistenten:** keine Commits oder Pushes ohne ausdrückliche
Aufforderung. Der Git-Ablauf ist hier Teil des Lernziels und wird bewusst von
Hand gemacht.

---

## Was ein guter Beitrag hier ist

1. **Erst fragen, dann bauen**, wenn eine Aufgabe über Sprint 1 hinausgeht.
2. **Kleinstmögliche Änderung.** Kein Umbau nebenbei, keine Umbenennungen
   "bei der Gelegenheit".
3. **Den Schichtschnitt respektieren.** Im Zweifel: gehört es zu den Regeln
   (`domain/`) oder zur Anzeige (`ui/`)?
4. **Erklären statt nur liefern.** Ein Satz dazu, *warum* eine Lösung so
   aussieht, ist hier wertvoller als der Code selbst.
5. **Auf Deutsch antworten.**

## Was ein schlechter Beitrag ist

- Ein Framework, ein State-Management, ein CSS-Preprozessor einführen.
- `localStorage` oder `fetch` in `domain/` benutzen.
- Die Vokabeldatei umformatieren oder sortieren.
- Den CSS-Variablenblock "aufräumen".
- Features aus späteren Sprints vorziehen, weil sie schnell gehen.
- Bestehende `id`-Werte ändern.

---

## Out of Scope

Diese Punkte scheitern an keiner Voraussetzung — sie sind **entschieden**. Sie
stehen deshalb hier und nicht im Backlog: was im Backlog steht, wollen wir
bauen. Wer einen davon doch aufnehmen will, ändert zuerst diesen Abschnitt.

| Nicht | Warum |
|---|---|
| **PWA / Offline-Installation** | Die App lädt in unter einer Sekunde. Der Gewinn wäre klein, der Aufwand (Service Worker, Cache-Invalidierung) dauerhaft. |
| **TypeScript** | Würde Matilda eine zweite Sprache zumuten, bevor sie die erste kann. |
| **Ein Framework** | Die App hat zwei Bildschirme. React würde mehr Code hinzufügen, als es entfernt. |
| **Ein CSS-Preprozessor** | Der Variablenblock in `styles.css` ist Matildas Einstieg in Code. Er muss im Browser direkt wirken. |

Das ist die Produktseite derselben Entscheidung, die oben unter „Was hier
nicht passieren soll" als Arbeitsregel steht.

---

## Fahrplan (zur Einordnung, nicht zum Vorziehen)

**Der Fahrplan steht in [`roadmap/`](roadmap/), nicht hier.** Dort liegen der
laufende Sprint, die abgeschlossenen, je eine `feature-*.md` pro
durchdachtem Feature und alles Weitere in `backlog.md`. Eine zweite Liste an
dieser Stelle würde nur veralten. `roadmap/README.md` erklärt den Weg vom
Backlog über das Refinement bis in einen Sprint.

Was wir bewusst **nicht** bauen, steht dagegen oben unter „Out of Scope" —
nicht in der Roadmap, damit es dort nicht als Vorhaben missverstanden wird.

Was für die Architektur wichtig ist: `src/infra/storage.js` entsteht in
Sprint 3 als **einziger** Ort, der Persistenz kennt — zunächst
ausschließlich für **Einstellungen** (Töne an/aus, was geübt wird, Richtung).
Ein Lernstand **pro Karte** geht bewusst noch nicht durch diese Naht:
Einstellungen kann man jederzeit erweitern, ein gespeicherter Lernstand legt
sein Format dagegen fest und müsste später migriert werden. Dieselbe Naht wird
später gegen Supabase getauscht, ohne dass Domäne oder UI davon erfahren. Sie
muss sauber bleiben.
