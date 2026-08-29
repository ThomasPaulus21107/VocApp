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

## Aktueller Stand

**Die App übt unregelmäßige Verben.** Eine Runde hat 15 Karten und endet mit
einer Schulnote; vorher wählt man zwischen Übungsblatt und Arbeit. Was im
Übungsblatt nicht auf Anhieb saß, kommt am Ende noch einmal. Das Ganze liegt
unter einer öffentlichen URL.

**Der Fokus liegt auf den Verben.** Die normalen Vokabeln in
`data/vokabeln.json` sind bis heute nicht erreichbar. Der Vokabel-Strang ist
am 29.08.2026 wieder aufgenommen worden, gebaut ist davon aber noch nichts —
siehe `roadmap/feature-request-vokabel-import-klasse-5.md`.

**Welche Karte drankommt, ist nicht mehr zufällig.** Die App merkt sich je
Karte und Form, wann sie zuletzt dran war, und zieht die, die am längsten
warten. Seit dem 29.08.2026 merkt sie sich auch, wie es ausging: je Einheit
ein paar Zähler und die Summe der erreichten Kartenpunkte, dazu ein Verlauf
der letzten 750 Antworten — alles in `localStorage`. Aus Summe geteilt durch
Anzahl wird der **Score** je Vokabel, in derselben Währung wie die Note.

**Eine Quote entscheidet die Mischung einer Runde:** 5 noch nie geübte, 7 in
Arbeit, 3 stabil gelernte (`QUOTE` in `auswahl.js`). Ohne sie waren sieben
Runden lang alle fünfzehn Karten neu und danach nie wieder eine — ein
Kippschalter statt einer Lernkurve. Gibt ein Fach nicht genug her, rücken die
freien Plätze nach: erst an die neuen, dann an die in Arbeit.

Dazu gibt es ein **Seitenmenü** auf jeder Seite (Töne an/aus, Weg zu den
Statistiken) und zwei weitere Seiten. `fortschritt.html` zeigt in drei
Fächern, was stabil gelernt ist und was nicht; jede Vokabel klappt auf und
zeigt, wann sie dran war und was sie geholt hat. `fleiss.html` zeigt als
Balkendiagramm, an welchen der letzten 30 Tage wie viel geübt wurde, und
darunter jede einzelne Runde mit Uhrzeit und Trefferquote.

**Geübt wird primär auf Matildas iPhone.** Seit dem 29.08.2026 ist das eine
Randbedingung und keine Nebensache: Layouts werden für ein Telefon mit offener
Tastatur entworfen, nicht für einen Bildschirm, der danach auch mal klein wird.
Über der Tastatur bleiben rund 350 px.

Es hat auch eine unsichtbare Folge. **Safari löscht `localStorage` nach sieben
Tagen ohne Benutzung.** Alles, was gespeichert wird, muss damit rechnen —
siehe `roadmap/implemented/feature-homebildschirm-2026-08-29-1327.md`, das
genau deshalb existiert. Die App darf deswegen auf den Homebildschirm.

Was gebaut ist, liegt in `roadmap/implemented/` mit Datum im Namen; was
durchdacht ist und wartet, direkt in `roadmap/` als `feature-request-*.md`.

### Die Richtung hat sich am 29.08.2026 erweitert

Aus der Einzelplatz-App soll ein kleiner Dienst für Matilda und **ein Dutzend
Kinder** werden: Konten, gespeicherter Lernstand je Vokabel, gemeinsame
Lernmissionen und ein userübergreifend sichtbarer Punktestand.

**Der Strang ist seit dem 29.08.2026 zweigeteilt**, weil er an zwei
verschiedenen Dingen hängt:

- **Der Lernstand darf nach Postgres.** Supabase ist eingerichtet, und der
  Weg dorthin steht in sieben Dateien ab
  `roadmap/implemented/feature-backend-naht-2026-08-29-2225.md` — erst die Datenbank, dann die
  Anmeldung, jede Datei einzeln baubar. Der Grund, warum das nicht wartet: der
  Lernstand speichert **Ereignisse und keine Punktekonten**, und `localStorage`
  in einem fremden Browser ist weder zu prüfen noch zu sichern noch
  wiederherzustellen.
- **Was ein Punkt ist, steht seit dem 29.08.2026 fest:** eine Karte, die saß —
  1 auf Anhieb, 0,5 im zweiten Versuch, Tipp −0,1. Also genau
  `punkteFuerKarte()` aus `domain/note.js`, gezählt über die laufende Woche.
  Damit sind **gemeinsame Missionen** frei, siehe
  `roadmap/feature-request-missionen.md`.
- **Alle sehen den Fortschritt aller, unter Pseudonymen** — aber **nicht** über
  eine Lesepolicy auf `ereignisse`. Geteilt wird eine Zusammenfassung aus einer
  Funktion, die anonyme Sitzungen ausschließt. Grund: `signInAnonymously()`
  steht jedem offen, der die Seite lädt, und die Ereignistabelle ist ein
  Tagebuch, kein Punktestand. **Wer eine Lesepolicy auf `ereignisse` aufmacht,
  öffnet die App fürs offene Netz, und zwar still.**
- **Merksatz für jede Policy: `to authenticated` schließt niemanden aus.** Eine
  anonyme Sitzung hat genau diese Rolle. Was schützt, ist immer die Bedingung
  dahinter — `using (nutzer = auth.uid())`, nie `using (true)`.
- **Eine Rangliste ist weiter nicht freigegeben.** Entschieden ist nur die
  Richtung: wenn ein Vergleich kommt, dann **würdigend statt rangordnend**.
  Die Form ist offen, siehe `roadmap/feature-request-wuerdigung.md`.
- **Die Serie wird weiter nur gezählt**, nicht belohnt.

Die Abwägung samt der Pflichten, die mit fremden Kinderdaten dazukommen
(Anmeldung, Row Level Security, Minderjährige), steht in
`roadmap/feature-request-mehrere-nutzer.md` und in
`roadmap/feature-request-kinderdaten.md`.

### Nicht ungefragt einbauen

Punkte, Streaks, Leitner-Algorithmus (seit dem 29.08.2026 durchdacht und in
`roadmap/feature-request-leitner.md` beschrieben, aber weiter nicht
freigegeben), Accounts, PWA, Supabase, TypeScript,
Framework.

Wenn eine Aufgabe eines dieser Themen berührt: **nicht einbauen, sondern
nachfragen.** Alle sind bewusst zurückgestellt oder stehen unter „Out of
Scope". Das Projekt soll klein bleiben und früh laufen.

Eine Serie über mehrere Tage wird auf der Fleiß-Seite inzwischen **gezählt**,
aber nicht belohnt — beschreiben ist erlaubt, aus einer Zahl eine Währung zu
machen nicht. Das ist am 29.08.2026 bestätigt worden und keine Übergangslösung:
eine belohnte Serie bestraft den Tag, an dem jemand krank ist.

Für Punkte, Accounts und Supabase gilt das seit dem 29.08.2026 nicht mehr
gleich:

- **Supabase und Accounts sind freigegeben.** Das Projekt ist eingerichtet,
  das Refinement steht in sieben Dateien ab
  `roadmap/implemented/feature-backend-naht-2026-08-29-2225.md`. Wer daran baut, hält sich an die
  Reihenfolge dort und fragt nicht mehr jedes Mal nach — aber baut auch
  nichts, was in keiner der sieben Dateien steht.
- **Punkte sind definiert, aber nicht überall erlaubt.** Was ein Punkt ist,
  steht seit dem 29.08.2026 fest (oben nachzulesen), und **gemeinsame
  Missionen** sind damit freigegeben:
  `roadmap/feature-request-missionen.md`. Eine Zahl an anderer Stelle in eine
  Währung zu verwandeln, bleibt eine Rückfrage wert.
- **Rangliste und Streaks bleiben stehen.** Bei der Rangliste ist die Antwort
  nicht mehr „erst, wenn die Punktefrage beantwortet ist", sondern: erst, wenn
  eine Form gefunden ist, die **würdigt statt Ränge zu vergeben** — und die
  entsteht nicht am Schreibtisch. Die Serie wird gezählt und nicht belohnt.

**GitHub Actions stand hier ursprünglich mit auf der Liste und wurde bewusst
vorgezogen.** Der Deploy von Hand über einen `gh-pages`-Branch wären fünf
Befehle bei jedem Veröffentlichen — gegenüber einer Workflow-Datei, die man
einmal schreibt und nie wieder anfasst. Vor allem aber hat der Handbetrieb
einen Fehlermodus, den der Workflow nicht kennt: `npm run build` vergessen und
einen alten Stand hochladen, ohne dass es auffällt. Der Workflow fügt keine
Abhängigkeit und keine Zeile hinzu, die Matilda liest, und irgendwann hätte
es ihn ohnehin gebraucht. Nur Build und Deploy sind vorgezogen; **CI im
Sinne von Tests als Merge-Bedingung ist ein eigenes Vorhaben** und kam
später dazu, siehe `roadmap/implemented/feature-tests-in-ci-2026-08-25-2243.md`.

---

## Architektur: der eine Schnitt, der alles trägt

```
data/          Vokabellisten und die Wortartenliste als JSON. Daten, kein Code.
public/        wird unverändert mitgeliefert: Icons und manifest.json.
src/domain/    Regeln: was ist richtig, wie wird gemischt, wie gewählt.
src/infra/     das Einzige, was Persistenz kennt. Zwei Nähte, siehe unten:
               storage.js (Geraet, localStorage) und backend.js (Person,
               Supabase).
src/ui/        Alles, was der Nutzer sieht und hört: DOM und Töne.
src/app.js     Steckt die Schichten zusammen.
tests/         Tests auf domain/, auf infra/ und auf die Daten.
tests/oberflaeche/
               Die Oberfläche, in einem echten Browser bedient (Playwright).
```

**Die Regel:** `domain/` kennt kein DOM, keinen `localStorage`, kein
Netzwerk, kein `Date.now()`. Alles dort sind reine Funktionen: Eingabe rein,
Ergebnis raus, keine Seiteneffekte.

**Warum das nicht verhandelbar ist:** Die Tests laufen dadurch in
Millisekunden ohne Browser. Und irgendwann soll Supabase dazukommen, ohne
dass Domänenlogik oder UI davon erfahren. Jede Verletzung dieses Schnitts
macht beides kaputt.

**Konkrete Konsequenzen:**

- Zufall wird hereingereicht: `mische(karten, zufall = Math.random)`.
- Das Datum wird später genauso hereingereicht: `berechneStreak(zustand, heute)`.
  Niemals `new Date()` innerhalb einer Domänenfunktion.
- `ui.js` kennt nur `textContent`, `classList`, `hidden`,
  Event-Registrierung und die Töne aus `klang.js`. Keine Lernlogik, keine
  Entscheidung über richtig oder falsch. Einzige Ausnahme ist die
  Ergebnisliste: sie ist unterschiedlich lang und muss deshalb Zeilen
  erzeugen. Das Markup dafür steht als `<template>` in `index.html` und wird
  geklont — **kein `innerHTML`, keine zusammengebauten HTML-Strings.**
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
Domänenfunktion gezogen. Dafür gibt es zwei Funktionen:
`stelleFrageZuForm(karte, richtung, form)` baut die Frage zu einer genannten
Form, `stelleFormFrage(karte, richtung, zufall)` würfelt die Form aus und ruft
sie auf. Die Lernpotential-Runde nimmt die erste — dort wird dieselbe Form
wiederholt, nicht neu gewürfelt.

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
| `keine ahnung` | `AUFGEBEN` | „DU SCHAFFST DAS" — im Übungsblatt bleibt die Karte offen, kein Versuch verbraucht. In der Arbeit kommt der Zuspruch auch, aber die Karte ist danach durch (siehe `roadmap/implemented/feature-arbeit-oder-uebungsblatt-2026-08-24-2022.md`). |

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
| `NOTEN_TEXTE` in `src/ui/ui.js` | ihr Satz zu jeder Schulnote. Wie der Farbblock im CSS: Text ändern, speichern, Runde spielen. Die Noten als Schlüssel gehören dagegen zur Tabelle in `domain/note.js` und dürfen nicht umbenannt werden. |
| `MELODIEN` in `src/ui/klang.js` | wie die fünf Rückmeldungen klingen. Zahlen ändern, hören, fertig -- wie der Farbblock im CSS. |

Der CSS-Variablenblock ist Absicht: eine Farbe ändern, speichern, sofort
Wirkung sehen. Das ist ihr erster Kontakt mit Code.

---

## Werkzeuge und Befehle

```bash
npm install     # Abhängigkeiten
npm run dev     # Dev-Server auf localhost:5173
npm test        # Vitest, einmalig -- Domäne, infra, Daten
npm run build   # Produktionsstand nach dist/

npm run test:oberflaeche   # Playwright, die Oberfläche im echten Browser
npx playwright install webkit   # einmalig, holt den Browser dazu
```

- **Vite** als Build-Tool, Vanilla JS, kein Framework.
- **Vitest** für die Tests auf Domäne, `infra` und Daten.
- **Playwright** für die Oberfläche. Am 29.08.2026 bewusst dazugenommen und
  damit die bisher einzige Ausnahme von der Regel darunter — warum, steht
  unter „Tests".
- **`@supabase/supabase-js`** ist die erste echte Laufzeit-Abhängigkeit — alle
  anderen sind `devDependencies` und landen nie im Bundle. Am 29.08.2026
  nachgefragt und freigegeben; die Begründung steht in
  `roadmap/implemented/feature-backend-naht-2026-08-29-2225.md`.
- **Die Supabase-CLI** kommt dazu, aber **nur im Workflow** — nicht in
  `package.json`, nicht in `npm install`. Sie spielt Migrationen ein, siehe
  `roadmap/feature-request-releases.md`.
- **Es gibt zwei Supabase-Projekte:** `VocApp TEST` entspricht `main` und ist
  das, worauf `npm run dev` zeigt; `VocApp` entspricht dem letzten Release-Tag.
  Wer eine Migration schreibt, ändert nie eines von Hand — sonst driften sie.
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
- `.github/workflows/tests.yml` lässt bei jedem Pull Request **zwei** Jobs
  laufen. `testen` ist `npm test` und dauert Sekunden; `oberflaeche` lädt
  WebKit herunter und spielt die App durch. Getrennt, damit die schnellen
  Tests nicht auf den Browser warten.
  `testen` ist im Ruleset von `main` als required check eingetragen: **ist er
  rot, lässt sich der Pull Request nicht mergen.** **`oberflaeche` gehört dort
  ebenfalls hinein** und muss noch eingetragen werden — solange das fehlt,
  läuft der Job zwar, blockiert aber nichts.
  Vor dem Pull Request trotzdem einmal selbst `npm test` — das spart die
  Wartezeit auf den Lauf.

---

## Tests

Drei Sorten, alle relevant. Die ersten beiden laufen ohne Browser in
Millisekunden, die dritte startet einen:

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

- `tests/oberflaeche/*.test.js` — die Oberfläche, mit **Playwright** in einem
  echten Browser bedient. Sie laufen nicht mit `npm test` mit, sondern mit
  `npm run test:oberflaeche`; `vite.config.js` nimmt sie für Vitest deshalb
  ausdrücklich aus.

Neue Tests bitte im gleichen Stil: deutsche Beschreibungen, ein Verhalten pro
Test, keine Mocks (die Domänenschicht braucht keine).

Faustregel zum Umfang: Tests auf die Domänenlogik, Tests auf die Daten, Tests
auf das, was man sieht und anfassen kann. Bei einem gefundenen Fehler einen
Test schreiben, der ihn festhält.

### Warum die Oberfläche einen echten Browser bekommt

Die Frage war bis zum 29.08.2026 offen und ist jetzt entschieden. Der Anlass
war ein Fehler, den kein Funktionstest finden konnte
([PR #8](https://github.com/ThomasPaulus21107/VocApp/pull/8)): `display: flex`
hat das `hidden`-Attribut überstimmt, die Formenzeile blieb sichtbar stehen —
mitsamt der Lösung, nach der gerade gefragt war. Im Markup stand alles
richtig. **Ein nachgebautes DOM (jsdom) hätte genau diesen Fehler nicht
gefunden**, weil es kein Layout kennt. Deshalb die große Abhängigkeit statt
der kleinen.

Zwei Dinge folgen daraus für jeden, der dort etwas dazuschreibt:

- **Getestet wird auf dem iPhone**, in WebKit auf 390 px — der Maschine hinter
  Safari und dem Gerät, auf dem tatsächlich geübt wird. Ein grüner Lauf in
  Chrome hätte über genau den Browser nichts gesagt.
- **Es wird gemessen, nicht abgefragt.** `toBeHidden()` statt „steht das
  Attribut da": ob ein Element wirklich weg ist, kann nur der Browser sagen.
  `tests/oberflaeche/sichtbarkeit.test.js` prüft das für jede Seite auf einmal.

Die Abwägung samt der verworfenen Möglichkeiten steht in
`roadmap/implemented/feature-ui-tests-2026-08-29-1943.md`.

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

**Für KI-Assistenten:** Commits, Pushes und Pull Requests sind seit dem
29.08.2026 freigegeben — auf einem Branch, mit nachgezogener Doku und grünen
Tests. Bis dahin galt hier „keine Commits ohne ausdrückliche Aufforderung",
weil der Git-Ablauf Teil des Lernziels war; inzwischen sitzt er, und die
Nachfrage kostete nur einen Zug.

**Der Merge ist seit dem 29.08.2026 geteilt**, und zwar entlang der Frage, ob
eine Änderung bei Matilda ankommen kann:

| Was im Diff steht | Wer merged |
|---|---|
| nur `roadmap/`, `AGENTS.md`, `README.md`, `data/README.md` | die KI, sobald **beide** Checks grün sind |
| irgendetwas aus `src/`, `data/*.json`, `public/`, `package.json`, `.github/` | **ein Mensch** |

Der Grund für den Schnitt: ein Merge auf `main` löst den Pages-Deploy aus.
Bei Text ändert das eine Seite, die niemand beim Üben aufhat; bei Code ändert
es die App auf dem Telefon. **Der Merge ist die Stelle, an der jemand
hinschaut** — und hinschauen muss man dort, wo etwas kaputtgehen kann.

Wer mergen will, prüft vorher `gh pr diff --name-only` und verlässt sich nicht
darauf, was er zu ändern glaubte.

---

## Was ein guter Beitrag hier ist

1. **Erst fragen, dann bauen**, wenn eine Aufgabe eines der zurückgestellten
   Themen berührt oder über das hinausgeht, was gerade dran ist.
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
- Zurückgestellte Themen vorziehen, weil sie schnell gehen.
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

**Nicht mit der PWA zu verwechseln** ist das Icon auf dem Homebildschirm
(`roadmap/implemented/feature-homebildschirm-2026-08-29-1327.md`). Was oben abgelehnt wird, ist der
Service Worker samt Cache-Invalidierung — ein `manifest.json` ist eine
Textdatei mit Name, Farbe und Icon, ändert nichts am Laden und macht die App
nicht offline-fähig. Es steht dort, weil iOS `localStorage` sonst nach sieben
Tagen löscht und Web-Apps auf dem Homebildschirm davon ausgenommen sind.

Das ist die Produktseite derselben Entscheidung, die oben unter „Was hier
nicht passieren soll" als Arbeitsregel steht.

---

## Fahrplan (zur Einordnung, nicht zum Vorziehen)

**Der Fahrplan steht in [`roadmap/`](roadmap), nicht hier.** Dort liegt je
eine Feature-Datei pro durchdachtem Feature und alles Weitere in `backlog.md`.
Eine zweite Liste an dieser Stelle würde nur veralten. `roadmap/README.md`
erklärt den Weg vom Backlog über das Refinement bis in den Code.

Sprint-Dateien gab es bis zum 25.08.2026, sie sind aufgelöst. Wer sie in einem
alten Stand sieht: ihr Inhalt steckt in den Feature-Dateien.

**Der Ort sagt den Zustand:** was direkt in `roadmap/` liegt, ist offen; was
in `roadmap/implemented/` liegt, ist gebaut — mit dem Zeitpunkt des Merges im
Namen. Verschoben wird beim Merge, und wer verschiebt, zieht die Links in der
Roadmap und hier nach. (Bis zum 29.08.2026 stand der Zustand stattdessen im
Dateinamen; alte Pfade `roadmap/feature-implemented-*` meinen dieselben
Dateien.)

Was wir bewusst **nicht** bauen, steht dagegen oben unter „Out of Scope" —
nicht in der Roadmap, damit es dort nicht als Vorhaben missverstanden wird.

Was für die Architektur wichtig ist: `src/infra/` bekommt **zwei** Nähte, und
sie dürfen nicht vermischt werden.

| | `infra/storage.js` | `infra/backend.js` |
|---|---|---|
| Gehört zu | dem **Gerät** | der **Person** |
| Inhalt | Töne an/aus, Aufgabenart, Kartenbeutel | Lernstand, Punkte, Missionen |
| Technik | `localStorage`, synchron | Supabase, asynchron |
| Wird getauscht | nie | ist von Anfang an das Ziel |
| Zustand | gebaut am 29.08.2026 | beschlossen am 29.08.2026, sieben Dateien in `roadmap/` |

Ob am Küchentisch der Ton an ist, gehört dem Laptop. Ob `caught` sitzt, gehört
Matilda und muss ihr auf jedes Gerät folgen.

**In `storage.js` darf nur liegen, was man jederzeit wegwerfen würde.**
`localStorage` in fremden Browsern ist weder zu prüfen noch zu sichern noch
wiederherzustellen; ein Lernstand gehört deshalb nach Postgres, sobald es mehr
als einen Nutzer gibt.

Davon gibt es **eine benannte Ausnahme**: die lokale Statistik je Vokabel
(`feature-request-lernstand.md`, Stufe 1). Sie liegt in `storage.js`, solange
die App einen Nutzer hat, und nur mit einem Knopf, der sie als Datei sichert —
auf einem iPhone ist das die einzige Kopie, die eine Ferienlücke übersteht. Gespeichert werden dort **Ereignisse** (eine Zeile je Antwort), nicht
errechnete Zustände — das ist das einzige Format, das sich später nicht
festlegt. Siehe `roadmap/implemented/feature-lernstand-2026-08-29-1531.md`.

`domain/` erfährt von beidem nichts: dort kommen Ereignisse als Argumente
herein und Bewertungen heraus.
