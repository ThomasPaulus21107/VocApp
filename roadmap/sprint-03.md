# Sprint 3: Auswählen, üben, eine Note bekommen

Ziel: Eine Runde hat 15 Karten und endet mit einer Schulnote. Man kann
einstellen, was geübt wird — und die Einstellung ist beim nächsten Öffnen noch
da. Und es sind endlich die richtigen Vokabeln drin.

## Die Features in diesem Sprint

Jedes ist in einer eigenen Datei ausgearbeitet. Hier steht nur, was dazugehört
und wer es macht.

| Feature | Wer |
|---|---|
| [Eine Datei pro Lektion](feature-lektionsdateien.md) — Datenformat und automatisches Einsammeln | Thomas |
| [Die Vokabeln der 5. Klasse](feature-vokabeln-klasse-5.md) | Matilda |
| [Einstellungen, die bleiben](feature-einstellungen-speichern.md) — `storage.js` | Thomas |
| [Die Optionsseite](feature-optionsseite.md) — zweite Seite, drei Schalter | Thomas, Gestaltung Matilda |
| [Auswählen, was geübt wird](feature-uebungsauswahl.md) — Vokabeln, Verben oder beides | Thomas |
| [Das Ergebnis als Schulnote](feature-schulnoten.md) — 15 Karten, 15 Punkte, eine Note | Thomas, Texte Matilda |
| [Übungsblatt oder Arbeit](feature-arbeit-oder-uebungsblatt.md) — Startseite mit zwei Modi | Idee Matilda, Umsetzung Thomas |
| [Die Ergebnisse nachlesen](feature-ergebnisliste.md) — Liste unter der Note | Idee Matilda, Umsetzung Thomas |
| [Tipps, die bei der Form helfen](feature-verbtipps.md) | Matilda |
| [Die App passt auf ein schmales Handy](feature-mobile-390.md) | Thomas |
| [Rote Tests blockieren den Merge](feature-tests-in-ci.md) | Thomas |

Die Reihenfolge ist nicht beliebig: die Lektionsdateien und `storage.js` sind
der Unterbau. Matilda kann erst anfangen, wenn das Dateiformat steht — dieses
Feature gehört deshalb an den Anfang und nicht irgendwohin.

## Zuerst entscheiden

Drei Fragen blockieren Code. Sie gehören an den Anfang der nächsten
gemeinsamen Sitzung, nicht neben die Bauaufgaben — als Todo-Punkt ist die
erste davon schon zwei Sprints lang liegen geblieben.

- [ ] **Wie streng prüft die App?** Drei Fälle:
  - Zählt ein Tippfehler als falsch? („writte" statt „write")
  - Muss man beim Infinitiv „to" mittippen? Aktuell ja — bei „to hit
    something" wird das unangenehm.
  - Bei `to be` gelten „was" und „were" beide. Soll das so bleiben?
- [x] **Zählt eine im zweiten Versuch richtige Karte als Punkt?** Einen halben.
      Ein Tipp kostet zusätzlich 0,1 — siehe
      [feature-schulnoten.md](feature-schulnoten.md).
- [x] **Wird die Note auch bei 0 von 15 gezeigt?** Ja, dann steht da eine 6.

## Kleinkram

Zu klein für eine eigene Datei, zu konkret zum Vergessen.

- [x] `RUNDENGROESSE` von 20 auf **15** — gehört zur Note, ist aber eine Zeile
- [ ] Tipp von `demo-006` reparieren: die Karte heißt jetzt „to jump", der
      Tipp sagt aber noch „man kriegt einen pokal" *(Matilda)*
- [ ] Abstand der Formenzeile in `styles.css` — sie klebt unter der Wortart
      *(Matilda)*
- [ ] Am Ende wieder drei Dinge aufschreiben, die stören — und diesmal in eine
      Datei *(Matilda)*

## Fertig, wenn

- [x] 15 Karten ergeben eine Note
- [x] Man kann vor einer Runde zwischen Übungsblatt und Arbeit wählen
- [x] Nach einer Runde ist nachlesbar, welche Karte richtig war und was
      richtig gewesen wäre
- [ ] Man kann einstellen, was geübt wird, und die Einstellung überlebt das
      Schließen der Seite
- [ ] Die Vokabeln der 5. Klasse sind drin und lassen sich üben
- [ ] Die App ist bei 390px vollständig sichtbar und bedienbar
- [ ] Ein Pull Request kann nicht mehr gemergt werden, wenn Tests rot sind
- [ ] Die Tipps bei den Verben helfen bei der Form, nicht bei der Bedeutung
- [ ] Wieder mindestens eine Änderung von Matilda in `main`
