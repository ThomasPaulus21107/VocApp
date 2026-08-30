# Feature: Wenn fremde Kinder mitüben

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `datenschutz.html` — neu, dazu `src/infra/backend.js`,
`supabase/schema.sql`, `src/ui/menue.js`

Klein zu bauen und trotzdem keine Kür: **Pflicht, bevor das erste fremde Kind
mitübt**, nicht danach. Solange nur Matilda übt, ist es ihre eigene App auf
ihrem eigenen Gerät. Ab dem zweiten Kind liegen fremde Daten auf einem Server,
der Thomas gehört.

Die Liste kommt unverändert aus
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md); sie steht
hier als eigenes Feature, weil sie sonst zwischen Anmeldung und Rangliste
liegen bleibt.

## Minderjährige

In Deutschland liegt die Altersgrenze für eine eigene Einwilligung bei 16;
darunter braucht es die der Eltern. Praktisch heißt das vier Dinge:

- **Die Mailadresse der Eltern**, nicht die der Kinder. Das Konto gehört
  formal den Eltern, geübt wird vom Kind.
- **Pseudonyme statt Klarnamen.** Die `profile`-Tabelle aus
  [Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md) nimmt
  gar nichts anderes entgegen. Seit dem 29.08.2026 trägt das Pseudonym mehr
  als vorher: es ist das, woran die anderen Kinder einander erkennen.
- **Ein Löschknopf, der wirklich löscht.**
- **Eine Seite, die in einem Satz sagt, was gespeichert wird.**

Kommt es je im Unterricht zum Einsatz, gelten zusätzlich die Regeln der Schule.

## Der Löschknopf

Er löscht den **Nutzer**, nicht die Zeilen. Das
`on delete cascade` an `ereignisse.nutzer` räumt hinterher — deshalb steht es
schon in [der Ereignistabelle](implemented/feature-ereignistabelle-2026-08-30-0815.md), obwohl es
dort noch nichts tut.

Zwei Dinge gehören dazu:

- Löschen braucht die Service-Rolle und geht deshalb **nicht** aus dem Browser.
  Entweder von Hand im Dashboard — bei einem Dutzend Kindern vertretbar — oder
  über eine Edge Function. Bei „von Hand" muss der Knopf ehrlich sein: er sagt
  dann, an wen die Bitte geht, und behauptet nicht, schon gelöscht zu haben.
- **Nachsehen, dass nichts übrig ist.** In der Tabelle zählen, nicht glauben.

## Die eine Seite

`datenschutz.html`, fünfter Einstiegspunkt, verlinkt aus dem Seitenmenü. Kein
Rechtstext — ein Absatz in der Sprache, in der auch `data/README.md`
geschrieben ist: was gespeichert wird (jede Antwort mit Zeitpunkt), wo es liegt
(Supabase), wer es sehen kann und wie man es loswird.

**Der dritte Punkt hat sich am 29.08.2026 geändert und ist der wichtigste.**
Vorher wäre dort „nur du" gestanden. Jetzt gilt:

> Deinen Fortschritt — wie viele Punkte du diese Woche geholt hast und wie viel
> schon sitzt — sehen die anderen, die mitüben. Sie sehen dich unter deinem
> Spitznamen, nicht unter deinem richtigen. Was du wann geantwortet hast, sieht
> niemand außer dir.

Diese drei Sätze sind der Unterschied zwischen einer Einwilligung und einer
Überraschung. **Sie gehören auf die Seite, bevor das erste fremde Kind
mitübt** — und sie gehören auch in das, was du den Eltern sagst, wenn du den
Link weitergibst. Eltern, die zustimmen, stimmen jetzt einer Gruppe zu und
nicht mehr nur einer App.

## Jemand ist zuständig

Unspektakulär und real: **Anzeigenamen können beleidigend sein, und irgendwer
muss sie ändern können.** Das ist keine Zeile Code, sondern eine Person —
Thomas, mit Zugang zum Dashboard. Es steht hier, damit es nicht erst auffällt,
wenn es so weit ist.

## Voraussetzung

[Aus der anonymen Sitzung wird ein Konto](feature-request-konten.md).

## Hängt damit zusammen

Ab dem ersten fremden Kind ist
[Technisches Monitoring](feature-request-monitoring.md) ebenfalls keine Kür
mehr: „kaputt heißt, zwölf Leute merken es" — und im Zweifel merkt es niemand,
der es reparieren kann.
