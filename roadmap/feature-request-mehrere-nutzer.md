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
| 1 | [Die zweite Naht zum Server](feature-request-backend-naht.md) | `infra/backend.js`, Client, Konfiguration, anonyme Sitzung |
| 2 | [Die Ereignistabelle mit RLS](feature-request-ereignistabelle.md) | `supabase/schema.sql` |
| 3 | [Jede Antwort geht zum Server](feature-request-ereignisse-melden.md) | `melde()`, Ausgangskorb, Anschlüsse in `app.js` |
| 4 | [Der Bestand zieht um](feature-request-umzug-des-bestands.md) | den vorhandenen `verlauf` einmalig hochschieben |
| 5 | [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md) | Anmeldung |
| 6 | [Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) | `lade()`, Zustand aus Ereignissen |
| 7 | [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md) | Löschen, Pseudonyme, der eine Satz |

**Was hier bleibt, ist die Frage, an der es wirklich hängt: was ist ein
Punkt?** Und alles, was daran hängt — Rangliste, Missionen, der
userübergreifende Punktestand. Der Lernstand darf nach Postgres, weil er
Ereignisse speichert und keine Punktekonten. Eine Rangliste darf es nicht,
solange niemand sagen kann, was in ihr steht.

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

Gebaut wird sie in [Die zweite Naht zum Server](feature-request-backend-naht.md);
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

## Was vorher entschieden sein muss

- [ ] **Was ist ein Punkt?** Ohne diese Antwort ist keine Tabelle zu bauen.
      `note.js` liefert heute eine Note **je Runde**, 0–15. Das ist kein
      Kontostand: wer viele Runden spielt, sammelt mehr, und eine „2+" ist
      nicht addierbar. Zu klären: was zählt, über welchen Zeitraum, und wie
      unterschiedlich schwere Runden vergleichbar werden.
- [ ] **Was steht in der Rangliste** — Pseudonym und Zahl, mehr nicht?
- [ ] **Wer darf wessen Fortschritt sehen?** Eltern den ihres Kindes, nicht
      den der anderen. Das ist eine RLS-Regel und keine Frage der Oberfläche.
- [x] **Wer legt Konten an** — steht als offene Entscheidung in
      [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md),
      wo sie hingehört. Vorschlag dort: von Hand, keine Selbstregistrierung.

Solange Punkt 1 offen ist, wird an der **Rangliste, den Missionen und dem
Punktestand** nichts gebaut. Der Datenbank-Strang oben hängt nicht daran und
läuft weiter — ebenso alles andere in der Roadmap.

## Zu beachten

- [Namensfeld statt Login](backlog.md) ist damit hinfällig und am 29.08.2026
  in den Backlog zurückgewandert. Es war der bewusste Verzicht auf Konten.
- `AGENTS.md` führte Accounts, Punkte, Streaks und Supabase unter „Nicht
  ungefragt einbauen" und beschrieb eine Einzelplatz-App. **Wer hier ja sagt,
  ändert zuerst diese Datei** — am 29.08.2026 geschehen, für Supabase und
  Accounts. Punkte, Streaks und Rangliste stehen dort weiter.
- Ab dem ersten fremden Kind ist [technisches Monitoring](feature-request-monitoring.md)
  keine Kür mehr.
