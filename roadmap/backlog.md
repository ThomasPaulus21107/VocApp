# Backlog

Alles, was wir bauen wollen, aber noch nicht durchdacht haben. Einträge hier
sind **kurz** — ein Satz, was es ist, und was fehlt.

Zwei Zeilen können darunter stehen:

- `braucht:` — was es voraussetzt, und wo das liegt
- `offen:` — was geklärt sein muss, bevor es refined ist

Ein Eintrag verlässt diese Datei, sobald jemand ihn durchdenkt und eine
`feature-request-*.md` dafür schreibt. Das ist das Refinement: **entweder es
gibt die Datei, oder das Feature ist noch nicht so weit.** Eine Liste
„bereit" gibt es nicht — die Request-Dateien sind sie.

Umgekehrt geht es auch: was refined war und wieder ruht, kommt hierher zurück.
Die durchdachte Fassung ist dann nicht weg, sie liegt in der Git-Historie.

---

## Der Vokabel-Strang

Ruhte vom 25.08. bis zum 29.08.2026. Aufgenommen als
[Die Vokabeln der 5. Klasse hereinholen](feature-request-vokabel-import-klasse-5.md) —
dort steht jetzt alles, was hier in vier Einträgen stand: eine Datei je
Lektion, die Vokabeln selbst, das Wiederanschließen von `wortart` und
`bedeutung` und die Auswahl, was geübt wird. Die alten Einzelfassungen liegen
in der Git-Historie.

## Lernen und Wiederholen

- **Schwere Karten häufiger dran nehmen.** Stufe 2 der
  [Kartenauswahl](feature-implemented-auswahl-2026-08-29-1327.md): ein zweiter
  Summand in der Gewichtsformel, dazu die Zeile `auswahlGewichtet` in
  `modus.js` und der Verhältnis-Deckel, damit eine Übungsrunde nicht nur aus
  Karten besteht, die wehtun.
  `braucht:` [den Lernstand](feature-request-lernstand.md) — **steht**, dort
  zählt schon, was danebengeht
  `offen:` nichts Grundsätzliches. Es ist die ausführlichste Beschreibung im
  Ordner und wartet nur darauf, gebaut zu werden.

- **Leitner-Fächer mit Wiedervorlage.** „Diese Karte erst in drei Tagen wieder."
  `braucht:` [Der Lernstand je Vokabel](feature-request-lernstand.md) —
  refined. Danach ist Leitner nur noch ein anderes Modell über denselben
  Zeilen: es ersetzt die Gewichtsformel aus
  [Welche Karten drankommen](feature-implemented-auswahl-2026-08-29-1327.md), nicht das Ziehen.
  `offen:` wie viele Fächer, welche Abstände, und was beim ersten Start passiert

Der Punkt „Lernstand pro Karte speichern" ist am 29.08.2026 hier
ausgezogen — er steht jetzt als
[Der Lernstand je Vokabel](feature-request-lernstand.md). Sein `offen:`
war das Format, und das ist beantwortet: Ereignisse statt Zustände, weil man
sich damit gerade **nicht** festlegt.

## Punkte

- **Was ist ein Punkt?** Die eine Frage, an der alles Userübergreifende hängt.
  `note.js` liefert heute eine Note **je Runde**, 0–15. Das ist kein
  Kontostand: wer viele Runden spielt, sammelt mehr, und eine „2+" ist nicht
  addierbar.
  `offen:` was zählt, über welchen Zeitraum, und wie unterschiedlich schwere
  Runden vergleichbar werden. **Gehört Thomas und Matilda gemeinsam** — es ist
  eine Frage danach, was belohnt werden soll, keine technische.
  Solange sie offen ist, wird an [Mehrere Nutzer](feature-request-mehrere-nutzer.md)
  nichts gebaut.

- **Streak über mehrere Tage.** „Vier Tage hintereinander geübt."
  `braucht:` die Antwort oben, und
  [den Lernstand](feature-request-lernstand.md) — dort steht das Datum ohnehin
  in jeder Zeile
  `braucht:` das Datum von außen: `berechneStreak(ereignisse, heute)`, nie
  `new Date()` in der Domäne

## Über ein Gerät hinaus

Dieser Abschnitt ist am 29.08.2026 weitgehend ausgezogen. Supabase, Accounts
und „gleicher Stand auf Handy und Laptop" waren drei Einträge für dieselbe
Sache und stehen jetzt als
[Entscheiden, ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md).

- **Namensfeld statt Login.** Ein Textfeld, dessen Inhalt dem
  Speicherschlüssel vorangestellt wird — zwei Leute an einem Rechner, ohne
  Anmeldung. War refined und ist am 29.08.2026 hierher zurückgewandert: mit
  echten Konten aus [Mehrere Nutzer](feature-request-mehrere-nutzer.md) ist es
  hinfällig, es war ja gerade der Verzicht darauf.
  `offen:` nur noch, ob es als Übergangslösung lohnt, bis die Konten stehen.
  Die ausführliche Fassung liegt in der Git-Historie unter
  `roadmap/feature-request-namensfeld.md`.

## Kleinigkeiten

- **`to read` ist in allen drei Formen gleich.** Wenn die Karte drankommt, ist
  die Frage geschenkt — in der Arbeit ein Freipunkt. Der Unterschied liegt in
  der Aussprache, und die kann eine getippte Antwort nicht prüfen.
  `offen:` Karte rausnehmen, drinlassen, oder anders behandeln? Gehört
  Matilda, es ist ihre Vokabeldatei.
  **Wird dringender mit** [Alle drei Zeiten](feature-request-drei-zeiten.md):
  dort wiegt die Karte drei Punkte statt einem.

## Rund ums Projekt

- **Matildas eigener GitHub-Account.** Ab ihrem 13. Geburtstag — vorher liegt
  dort die Altersgrenze. Bis dahin arbeitet sie an Thomas' Rechner mit, er
  übernimmt den GitHub-Teil.
