# Feature: Technisches Monitoring

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/app.js` (eine Stelle), `package.json`

Läuft die App, gibt es Fehler, lädt sie schnell genug. Nicht zu verwechseln
mit [Den Lernfortschritt sehen](implemented/feature-fortschritt-2026-08-29-1531.md) — das ist die
inhaltliche Auswertung und hat damit nur das Wort „Monitoring" gemeinsam.

## Warum es ab einem bestimmten Punkt Pflicht wird

Heute ist ein Fehler ein Ärgernis: Matilda sagt es beim Abendessen, Thomas
schaut nach. Sobald [ein Dutzend Kinder](feature-request-mehrere-nutzer.md)
die App benutzen, sagt niemand mehr etwas — **sie hören einfach auf.** Ein
kaputter Deploy fällt dann wochenlang nicht auf.

Deshalb: **nicht vorher bauen, aber spätestens mit dem ersten fremden Konto.**

## Was gebraucht wird

| | Warum |
|---|---|
| Unbehandelte Fehler im Browser | Das ist der Fall, der still passiert |
| Fehlgeschlagene Supabase-Aufrufe | Netz weg, RLS falsch, Tabelle umbenannt |
| Sind heute überhaupt Runden gespielt worden? | Die billigste Antwort auf „läuft es" |

Der dritte Punkt fällt aus dem [Lernstand](implemented/feature-lernstand-2026-08-29-1531.md) ab
und kostet nichts: keine Zeilen heute heißt entweder Ferien oder kaputt, und
beides will man wissen.

## Wie klein es bleiben darf

Ein `window.onerror`, der in eine Supabase-Tabelle schreibt, reicht für den
Anfang vollständig — dieselbe Datenbank, die ohnehin dasteht, eine Tabelle
mehr, keine neue Abhängigkeit und kein zweiter Anbieter.

Ein fertiger Dienst (Sentry) ist die Alternative und bringt Stacktraces und
Benachrichtigung mit. Das ist eine Abwägung wie bei
[UI-Tests](implemented/feature-ui-tests-2026-08-29-1943.md) und keine Selbstverständlichkeit.
Dort ist sie zugunsten der großen Abhängigkeit ausgegangen — das ist ein
Präzedenzfall und keine Regel.

## Vercel Speed Insights lag am 30.08.2026 kurz im Projekt

`@vercel/speed-insights` stand einen Abend lang in `package.json` und ist wieder
entfernt worden, **ohne je eingebaut worden zu sein**. Der Grund, damit ihn
niemand ein zweites Mal sucht:

- **Es hätte dort, wo geübt wird, gar nicht messen können.** Das Paket schickt
  seine Werte an `/_vercel/insights` — einen Pfad, den nur Vercel bedient. Auf
  GitHub Pages, wo Matilda übt, wäre jeder Aufruf ein 404 gewesen.
- **Es ist ein weiterer Empfänger von Besuchsdaten.** Vertretbar, aber eine
  Entscheidung, die hierher gehört und nicht als Nebeneffekt eines
  `npm install` passieren sollte. Siehe
  [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

Sinnvoll wird es frühestens, wenn Vercel die Produktion ist — also nach den
[Konten](feature-request-konten.md), zusammen mit dem Rest dieser Datei. Der
Einbau wäre dann ein `inject()` beim Start, mehr nicht.

## Zu entscheiden

- [ ] Selbst gebaut in Supabase, oder ein fertiger Dienst?
- [ ] Wer wird benachrichtigt, und wie? Ein Fehlerzähler, den niemand ansieht,
      ist dasselbe wie kein Monitoring.

## Zu beachten

- **Keine Vokabeln, keine Antworten, keine Namen in Fehlermeldungen.** Es sind
  Daten von Kindern. Was in die Fehlerzeile darf, ist die `karten_id` — nie,
  was getippt wurde.
- **Monitoring darf die App nie aufhalten.** Dieselbe Regel wie beim Melden von
  Ereignissen: im Zweifel geht der Fehlerbericht verloren und die Runde weiter.
