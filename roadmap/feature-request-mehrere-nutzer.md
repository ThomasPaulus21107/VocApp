# Feature: Entscheiden, ob die App mehrere Nutzer kennt

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/infra/backend.js` — neu, dazu `AGENTS.md`

Kein Feature für die App, sondern eine Richtungsentscheidung — wie
[Richtung](feature-request-richtung.md) und [UI-Tests](feature-request-ui-tests.md).
Sie steht hier, weil sie alles darunter bestimmt und weil sie nicht
nebenbei getroffen werden sollte.

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

`infra/backend.js`, neben [`storage.js`](feature-request-storage.md) und
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
- [ ] **Wer legt Konten an** — du von Hand, oder gibt es eine Registrierung?
- [ ] **Was steht in der Rangliste** — Pseudonym und Zahl, mehr nicht?
- [ ] **Wer darf wessen Fortschritt sehen?** Eltern den ihres Kindes, nicht
      den der anderen. Das ist eine RLS-Regel und keine Frage der Oberfläche.

Solange Punkt 1 offen ist, wird hier nichts gebaut. Alles andere in der
Roadmap kann trotzdem weiterlaufen.

## Zu beachten

- [Namensfeld statt Login](backlog.md) ist damit hinfällig und am 29.08.2026
  in den Backlog zurückgewandert. Es war der bewusste Verzicht auf Konten.
- `AGENTS.md` führt Accounts, Punkte, Streaks und Supabase unter „Nicht
  ungefragt einbauen" und beschreibt eine Einzelplatz-App. **Wer hier ja sagt,
  ändert zuerst diese Datei.**
- Ab dem ersten fremden Kind ist [technisches Monitoring](feature-request-monitoring.md)
  keine Kür mehr.
