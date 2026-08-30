# Feature: Entscheiden, ob die App mehrere Nutzer kennt

**Status:** bereit — die Richtung ist entschieden, die Punktefrage nicht
**Wo im Code:** `AGENTS.md`

Kein Feature für die App, sondern eine Richtungsentscheidung — wie
[Richtung](feature-request-richtung.md) und [UI-Tests](implemented/feature-ui-tests-2026-08-29-1943.md).
Sie steht hier, weil sie alles darunter bestimmt und weil sie nicht
nebenbei getroffen werden sollte.

## Die Hälfte davon ist seit dem 29.08.2026 ausgezogen

Supabase ist eingerichtet und mit dem GitHub-Konto verbunden. Damit ist der
**Datenbank-Strang** entschieden und in sieben eigene Dateien zerlegt — jede
einzeln baubar und einzeln mergebar:

| # | Datei | Was sie baut |
|---|---|---|
| 1 | [Die zweite Naht zum Server](implemented/feature-backend-naht-2026-08-29-2225.md) | `infra/backend.js`, Client, Konfiguration, anonyme Sitzung |
| 2 | [Die Ereignistabelle mit RLS](implemented/feature-ereignistabelle-2026-08-30-0815.md) | `supabase/schema.sql` |
| 3 | [Jede Antwort geht zum Server](implemented/feature-ereignisse-melden-2026-08-30-1000.md) | `melde()`, Ausgangskorb, Anschlüsse in `app.js` |
| 4 | [Der Bestand zieht um](feature-request-umzug-des-bestands.md) | den vorhandenen `verlauf` einmalig hochschieben |
| 5 | [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md) | Anmeldung |
| 6 | [Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) | `lade()`, Zustand aus Ereignissen |
| 7 | [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md) | Löschen, Pseudonyme, der eine Satz |

**Und am selben Tag ist auch die Frage beantwortet worden, an der der Rest
hing: was ist ein Punkt?** Siehe unten. Damit ist der Weg zu gemeinsamen
Missionen frei; offen bleibt nur noch, wie der Vergleich zwischen Kindern
aussieht.

## Worum es geht

Aus der Einzelplatz-Lern-App soll ein kleiner Dienst werden: Matilda und **ein
Dutzend Kinder aus ihrem Umfeld** üben, sehen ihren Fortschritt, vergleichen
sich und arbeiten an gemeinsamen Lernmissionen. Der Punktestand ist
userübergreifend sichtbar.

Das ist kein größerer Ausbau derselben App. Es ist ein anderes Produkt mit
anderen Pflichten.

## Was sich damit ändert

| Bisher | Danach |
|---|---|
| Ein Browser, ein Stand | Konten, Geräte-übergreifend |
| Kein Server | Supabase, Postgres, Auth |
| Daten gehören dem Browser | Daten gehören Kindern — fremden |
| Kaputt heißt: neu laden | Kaputt heißt: zwölf Leute merken es |

## Drei Dinge, die dann nicht mehr optional sind

1. **Echte Anmeldung.** Kein Namensfeld, kein „wer den Namen kennt, sieht den
   Stand". Supabase Auth mit Konten, die jemand vergibt.
2. **Row Level Security ab der ersten Zeile.** GitHub Pages ist statisch, der
   anon key steht im ausgelieferten Bundle. **RLS ist damit das Einzige
   zwischen den Daten und dem offenen Netz** — keine Härtung für später. Ohne
   sie liest und schreibt jeder mit den Entwicklertools jede Zeile.
3. **Minderjährige.** In Deutschland liegt die Altersgrenze für eine eigene
   Einwilligung bei 16; darunter braucht es die der Eltern. Praktisch:
   Pseudonyme statt Klarnamen, die Mailadresse der Eltern statt der der
   Kinder, ein Löschknopf, der wirklich löscht, und eine Seite, die in einem
   Satz sagt, was gespeichert wird. Kommt es je im Unterricht zum Einsatz,
   gelten zusätzlich die Regeln der Schule.

Dazu kommt, unspektakulär aber real: **jemand ist zuständig.** Anzeigenamen
können beleidigend sein, und irgendwer muss sie ändern können.

## Missionen vor Rangliste

Von den gewünschten Teilen ist der userübergreifende Punktestand der sozial
riskanteste: **in einer Gruppe gibt es immer ein letztes Kind, und das hört
auf zu üben.**

Gemeinsame Lernmissionen haben dieses Problem nicht. „Zusammen 500 Verben
diese Woche" hat keinen Letzten, sondern ein Ziel. Technisch ist es derselbe
Unterbau — eine geteilte Zahl auf dem Server — pädagogisch ist es das bessere
Feature.

**Vorschlag: Missionen zuerst, Rangliste danach und abschaltbar.** Erweist sie
sich als schädlich, ist sie dann ein Schalter und kein Rückbau.

## Die zweite Naht

Gebaut wird sie in [Die zweite Naht zum Server](implemented/feature-backend-naht-2026-08-29-2225.md);
das Muster steht hier, weil es für alles gilt, was noch dazukommt.

`infra/backend.js`, neben [`storage.js`](implemented/feature-storage-2026-08-29-1327.md) und
scharf von ihr getrennt: Gerät gegen Person, synchron gegen asynchron.

Damit die Asynchronität nicht durch die ganze App färbt, gilt ein Muster:
**einmal beim Start laden, danach aus dem Speicher im RAM lesen.**

```js
await backend.lade();     // genau ein await, in app.js beim Start
backend.lernstand(id)     // danach synchron
backend.melde(ereignis)   // schreibt im Hintergrund, blockiert nie
```

`domain/` erfährt davon nichts — dort kommen Ereignisse als Argumente herein
und Bewertungen heraus.

## Was ist ein Punkt? Beantwortet am 29.08.2026

Die Frage, an der alles Userübergreifende hing. Sie war offen, weil `note.js`
eine Note **je Runde** liefert, 0–15 — und das ist kein Kontostand: wer viele
Runden spielt, sammelt mehr, und eine „2+" ist nicht addierbar.

**Ein Punkt ist eine Karte, die saß.** Genau die Zahl, die `punkteFuerKarte()`
in `domain/note.js` heute schon ausrechnet:

| | |
|---|---|
| auf Anhieb richtig | **1** |
| erst im zweiten Versuch | **0,5** |
| mit Tipp | −0,1 |
| durchgelassener Tippfehler | −0,2 |
| falsch, übersprungen, aufgegeben | **0** |

Sie steht bereits in jeder Verlaufszeile als `punkte` und je Tag als
`tage[].summe`. **Es ist nichts zu erfinden und nichts nachzurechnen** — die
Antwort war die ganze Zeit da, sie war nur nicht als Währung benannt.

Warum diese und nicht die naheliegendere „eine Antwort ist ein Punkt": weil
reiner Fleiß blind für Qualität ist. Fünfzehnmal danebenhauen zählte dann wie
fünfzehnmal richtig, und schnell falsch klicken wäre die beste Strategie. Mit
den Kartenpunkten lohnt sich nur, was auch geübt hat.

### Zwei Zahlen, die nie addiert werden

- **Die Woche** — montags auf null. Das ist die Zahl zum Vergleichen und
  Mitmachen. Sie löst das Problem, das eine ewige Summe hat: wer im November
  dazukommt, ist am Montag gleichauf mit allen anderen, und es gibt ein Ende
  statt endlosem Grinden.
- **Insgesamt** — seit dem ersten Tag, als Blick zurück auf der eigenen
  Fleiß-Seite. Sie wird nicht verglichen.

Beide zusammenzuzählen ergibt keinen Sinn und darf die Oberfläche deshalb
niemals anbieten.

### Das Können bleibt davon getrennt

Der Score je Vokabel und die 75-%-Marke in `domain/lernstand.js` sind **keine**
Punkte und werden keine. Punkte sind ein Fluss (was diese Woche passiert ist),
das Können ein Bestand (was sitzt). Wer beides in eine Zahl presst, verliert
beide.

### Was daraus folgt

Gemeinsame Missionen sind damit refinebar und stehen in
[Gemeinsame Lernmissionen](feature-request-missionen.md).

## Wer darf wessen Fortschritt sehen? Beantwortet am 29.08.2026

**Alle sehen den Fortschritt aller — unter Pseudonymen.** Das war ursprünglich
enger gedacht („Eltern den ihres Kindes, nicht den der anderen") und ist
bewusst geöffnet worden: gemeinsam üben heißt auch, voneinander zu wissen.

Bei der Umsetzung ist daraus **keine** Lesepolicy auf `ereignisse` geworden,
und dafür gibt es zwei Gründe, die beide zählen:

1. **`signInAnonymously()` steht jedem offen, der die Seite lädt.** „Alle
   Angemeldeten dürfen lesen" hieße wörtlich: das offene Netz darf lesen. Wer
   die URL kennt, hat in einer Sekunde eine Sitzung.
2. **`ereignisse` ist ein Tagebuch, kein Punktestand.** Jede Antwort mit
   Zeitstempel — wer um 23:40 übt, wer eine Vokabel elfmal falsch hatte, wer
   drei Wochen weg war. Das ist mehr, als „den Fortschritt sehen" verlangt.

Geteilt wird deshalb eine **Zusammenfassung**: Pseudonym, Wochenpunkte, Anteil
sicher. Sie kommt aus `fortschritte()` in
[Gemeinsame Lernmissionen](feature-request-missionen.md), schließt anonyme
Sitzungen aus und gibt Zahlen zurück, keine Zeilen.

Daraus folgen zwei Dinge, die anderswo stehen:

- **Das Pseudonym ist jetzt tragend** — es ist das, was die anderen sehen.
  Siehe [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md).
- **Die Datenschutzseite muss es sagen.** „Nur du siehst deinen Stand" stimmt
  nicht mehr. Siehe [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

## Was noch entschieden werden muss

- [x] **Was ist ein Punkt** — oben beantwortet.
- [x] **Wer legt Konten an** — entschieden in
      [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md):
      Thomas, von Hand, mit einem Link je Kind und ohne Mailanbindung.
- [x] **Wer darf wessen Fortschritt sehen** — oben beantwortet.
- [ ] **Wie aus den Zahlen eine Würdigung wird.** Steht als eigene Datei in
      [Würdigung statt Rangliste](feature-request-wuerdigung.md). Entschieden
      ist nur, dass es keine Rangliste von Platz 1 bis 12 gibt; die Form soll
      nicht am Schreibtisch entstehen.

**Damit ist diese Datei bis auf einen Punkt abgearbeitet.** Der Rest steht in
den neun Dateien, auf die sie oben verweist, und keiner davon blockiert den
Datenbank-Strang.

## Zu beachten

- [Namensfeld statt Login](backlog.md) ist damit hinfällig und am 29.08.2026
  in den Backlog zurückgewandert. Es war der bewusste Verzicht auf Konten.
- `AGENTS.md` führte Accounts, Punkte, Streaks und Supabase unter „Nicht
  ungefragt einbauen" und beschrieb eine Einzelplatz-App. **Wer hier ja sagt,
  ändert zuerst diese Datei** — am 29.08.2026 geschehen, für Supabase und
  Accounts. Punkte, Streaks und Rangliste stehen dort weiter.
- Ab dem ersten fremden Kind ist [technisches Monitoring](feature-request-monitoring.md)
  keine Kür mehr.
