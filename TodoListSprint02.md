# Sprint 2: Runden, Ergebnis und ein Gedächtnis

Ziel: Eine Runde hat einen Anfang und ein Ende. Nicht mehr alle 62 Karten am
Stück, sondern eine feste Menge, danach ein Ergebnis — und der Punktestand ist
beim nächsten Öffnen noch da.

## Übrig aus Sprint 1
- [ ] Entscheiden, wie streng die App prüft *(stand schon in Sprint 1)*
- [ ] Matildas drei Punkte tatsächlich aufschreiben — das Häkchen ist gesetzt,
      im Repo steht nichts davon

## Ungeplant dazugekommen
Der Formen-Modus für unregelmäßige Verben war in Sprint 1 nicht vorgesehen und
ist mit PR #7 gelandet: 53 Verben in einer eigenen Liste, drei Formen
nebeneinander, eine davon als Lücke. Was daran noch offen ist, steht unten bei
den einzelnen Punkten.

## Zusammen
- [ ] **Wie viele Karten hat eine Runde?** 10, 15, oder auswählbar. Davon hängt
      ab, wie der Ergebnisbildschirm aussieht.
- [ ] **Wie streng prüft die App?** Drei offene Fälle:
  - Zählt ein Tippfehler als falsch? („writte" statt „write")
  - **Muss man beim Infinitiv „to" mittippen?** Aktuell ja — wer „write" statt
    „to write" tippt, bekommt ein Falsch. Bei „to hit something" wird es
    richtig unangenehm.
  - Bei `to be` ist das simple past „was" **und** „were". Beides zählt gerade
    als richtig. Soll das so bleiben?
- [ ] **Was passiert nach einer falschen Antwort?** Im Moment geht es einfach
      weiter. Nochmal tippen dürfen? Einmal, oder beliebig oft?
- [ ] **Wie weit geht das Nachsitzen?** Drei Stufen, aufsteigend teuer:
  1. Falsche Karten kommen am Ende der Runde nochmal — nur im Speicher,
     nichts wird gemerkt
  2. Falsche Karten werden innerhalb der Runde häufiger gezogen
  3. Echte Leitner-Fächer mit Wiedervorlage-Datum über mehrere Tage
      Stufe 1 und 2 gehören in diesen Sprint. Stufe 3 nicht — siehe unten.
- [ ] Entscheiden, ob eine Liste ausgewählt werden kann (nur Verben, nur
      Lektion) oder weiter alles in einem Stapel liegt

## Matilda
- [ ] **Die Tipps bei den unregelmäßigen Verben umschreiben.** Sie erklären
      gerade die *Bedeutung* („das machst du im Kopf") — gefragt ist aber eine
      *Form*. Besser wären Tipps auf das Muster:
  - `think / thought` gehört zu `buy / bought`, `fight / fought`,
    `catch / caught` — die „-ought/-aught"-Gruppe
  - `sing / sang / sung` gehört zu `swim / swam / swum`,
    `drink / drank / drunk`
  - `know / knew / known` gehört zu `grow / grew / grown`,
    `throw / threw / thrown`
  - `put`, `let`, `hit` ändern sich gar nicht
- [ ] Die Texte für den Ergebnisbildschirm formulieren — anerkennend, und auch
      etwas Nettes für den Fall, dass es mal nicht so gut lief
- [ ] Tipps von `demo-006` reparieren: die Karte heißt jetzt „to jump", der
      Tipp sagt aber noch „man kriegt einen pokal"
- [ ] Abstand der Formenzeile in `styles.css` — sie klebt unter der Wortart
- [ ] Am Ende wieder drei Dinge aufschreiben, die stören *(und diesmal in eine
      Datei)*

## Thomas
- [ ] **Mobile Ansicht reparieren.** Bei 390px Breite läuft die Karte rechts
      aus dem Bild, bei 560px passt alles. Es ist keine Schriftgröße —
      irgendwo sitzt eine Mindestbreite um die 480px, die das Schrumpfen
      verhindert. Erst suchen, dann fixen.
- [ ] Rundengröße einbauen: nur so viele Karten ziehen wie festgelegt
- [ ] Ergebnisbildschirm: wie viele richtig, wie viele falsch
- [ ] `src/infra/storage.js` anlegen — der **einzige** Ort, der `localStorage`
      kennt. Das ist die Naht, an der in Sprint 4 Supabase eingesetzt wird.
- [ ] Punkte und Streak über diese Naht speichern
- [ ] Prüfung an den Formen-Modus anpassen, sobald oben entschieden ist
- [ ] **Nachsitz-Runde einbauen.** Die falschen Karten stehen für den
      Ergebnisbildschirm sowieso schon fest — daraus einen zweiten Durchgang
      zu bauen, kostet fast nichts extra. Als reine Domänenfunktion, damit
      Sprint 3 darauf aufbauen kann statt sie zu ersetzen:
      `nachsitzen(stapel, falscheIds)` rein, neuer Stapel raus, kein
      Speichern, kein Datum.
- [ ] CI: Tests als Merge-Bedingung. Der Deploy-Workflow prüft sie bewusst noch
      nicht — das war für diesen Sprint zurückgestellt.
- [ ] **Entscheiden, wie die Oberfläche getestet wird.** In Sprint 1 ist ein
      Fehler durchgerutscht, den kein Test finden konnte: `display: flex` hat
      das `hidden`-Attribut überstimmt, die Formenzeile blieb stehen. Reine
      Funktionstests sehen so etwas nie. Ein Browser-Test bräuchte aber eine
      neue Abhängigkeit (jsdom oder Playwright) — das ist eine bewusste
      Entscheidung, keine Nebensache.

## Fertig, wenn
- [ ] Eine Runde hat eine feste Länge und endet mit einem Ergebnis
- [ ] Der Punktestand überlebt das Schließen der Seite
- [ ] Die App ist auf dem Handy vollständig sichtbar und bedienbar
- [ ] Ein Pull Request kann nicht mehr gemergt werden, wenn Tests rot sind
- [ ] Die Tipps bei den unregelmäßigen Verben helfen bei der Form, nicht bei
      der Bedeutung
- [ ] Was man falsch hatte, kommt in derselben Sitzung nochmal dran
- [ ] Wieder mindestens eine Änderung von Matilda in `main`

## Später, nicht jetzt
Accounts und Supabase (Sprint 4), PWA, TypeScript, Framework.

**Die Grenze beim Nachsitzen verläuft am Gedächtnis, nicht am Algorithmus.**
Innerhalb einer Sitzung darf die App gern klüger werden — falsche Karten
nochmal, falsche Karten öfter. Was in Sprint 2 **nicht** entsteht, ist ein
gespeicherter Lernstand pro Karte: keine Fächer, keine Wiedervorlage-Termine,
kein „diese Karte erst in drei Tagen wieder".

Der Grund ist keine Prinzipienreiterei. Sobald ein Lernstand pro Karte auf der
Platte liegt, ist sein Format festgelegt, und Sprint 3 müsste es entweder
übernehmen oder Bestandsdaten umziehen. Solange alles nur im Speicher steht,
kostet ein Umbau nichts. Dazu kommt: ab dem Moment, wo Termine im Spiel sind,
braucht es das Datum — und das wird laut `AGENTS.md` hereingereicht
(`berechneStreak(zustand, heute)`), nie in der Domänenfunktion gezogen. Diese
Naht will man einmal bauen und nicht zweimal.

Offene Kleinigkeit ohne Eile: `to read` heißt in allen drei Formen „read". Wenn
diese Karte drankommt, ist die Frage geschenkt. Der Unterschied liegt nur in
der Aussprache, und die kann eine getippte Antwort nicht prüfen.
