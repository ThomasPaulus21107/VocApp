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
Abhängigkeit und keine Zeile hinzu, die Matilda liest, und Sprint 2 hätte ihn
ohnehin gebracht. Nur Build und Deploy sind vorgezogen; **CI im Sinne von
Tests als Merge-Bedingung bleibt Sprint 2.**

---

## Architektur: der eine Schnitt, der alles trägt

```
data/          Vokabeln als JSON. Daten, kein Code.
src/domain/    Regeln: was ist richtig, wie wird gemischt, wie gedreht.
src/ui/        Alles, was den DOM anfasst.
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
- `ui.js` kennt nur `textContent`, `classList`, `hidden` und
  Event-Registrierung. Keine Lernlogik, keine Entscheidung über richtig
  oder falsch.
- Datenfluss nach unten (App sagt der UI, was sie zeigen soll), Ereignisse
  nach oben (UI meldet nur, *was* passiert ist).
- `app.js` ist der einzige Ort mit veränderlichem Zustand.

---

## Das Datenformat

Maßgeblich ist `data/vokabeln.json`, so wie Matilda sie angelegt hat. Wenn
diese Beschreibung und die Datei sich widersprechen, hat **die Datei recht**
und diese Beschreibung wird nachgezogen — nicht umgekehrt.

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
- `wortart`: freier Text auf Deutsch, so wie im Schulheft — `"Nomen"`,
  `"Verb"`, `"unregelmäßiges Verb"`. Keine feste Auswahlliste, kein Test
  darauf.
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

### `id` ist heilig

Niemals eine bestehende `id` ändern, umbenennen oder neu vergeben. In Sprint 3
hängt der Lernstand daran. Frage-Text darf sich ändern, die `id` nie.

---

## Bereiche, die Matilda gehören

Hier bitte **nicht ungefragt aufräumen, umbauen oder "optimieren"**:

| Datei | Was daran wichtig ist |
|---|---|
| `data/vokabeln.json` | ihr Inhalt. Nicht sortieren, nicht umformatieren. |
| `data/README.md` | die Anleitung in ihrer Sprache. Bei Formatänderung mitpflegen. |
| `src/ui/styles.css` | der Variablenblock ganz oben mit deutschen Kommentaren. Nicht in eine andere Datei verschieben, nicht umbenennen, nicht durch ein Framework ersetzen. |
| UI-Texte in `ui.js` | "Prüfen", "Richtig!", "Leider nicht ..." formuliert sie selbst. |

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
- Der Workflow prüft bewusst **nicht**, ob die Tests grün sind. Das kommt in
  Sprint 2 dazu. Bis dahin gilt: vor dem Pull Request einmal `npm test`.

---

## Tests

Zwei Sorten, beide relevant:

- `tests/pruefung.test.js` — die Domänenlogik.
- `tests/daten.test.js` — die Vokabeldatei selbst: `titel` und `karten`
  vorhanden, `id` eindeutig, beide Sprachen gefüllt, `wortart` gesetzt, beide
  Hinweise vorhanden. `bedeutung` wird **nicht** eingefordert, sie ist
  freiwillig. Meldet die betroffene `id`.

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

## Fahrplan (zur Einordnung, nicht zum Vorziehen)

| Sprint | Inhalt |
|---|---|
| 1 | Kartenabfrage, beide Richtungen, Hinweise, Deploy auf Pages |
| 2 | Punkte und Streak über `localStorage`, CI/CD mit GitHub Actions |
| 3 | Leitner-Algorithmus für gesteuerte Wiederholung |
| 4 | optional: Accounts und Sync über Supabase |

Beim Übergang zu Sprint 2 entsteht `src/infra/storage.js` als **einziger**
Ort, der Persistenz kennt. Das ist die Naht, an der in Sprint 4 Supabase
eingesetzt wird. Sie muss sauber bleiben.
