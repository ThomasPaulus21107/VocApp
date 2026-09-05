# Feature: Der Server wird die Wahrheit

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `src/domain/lernstand.js`, `src/app.js`, `src/fortschritt.js`,
`src/fleiss.js`, `src/infra/backend.js`

Das größte der sieben und deshalb allein. Bis hierher war der Server ein
Spiegel; ab hier ist er die Quelle, und der Lernstand folgt einer Person auf
jedes Gerät.

## Das eine `await`

Das Muster steht seit dem Refinement von
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md) fest:

```js
await backend.lade();     // genau ein await, beim Start
backend.lernstand()       // danach synchron
backend.melde(ereignis)   // schreibt im Hintergrund, blockiert nie
```

`lade()` kommt in `app.js`, `fortschritt.js` und `fleiss.js` an den Anfang.
Danach ist wieder alles synchron. **Damit färbt die Asynchronität nicht durch
die ganze App** — der Grund, warum es überhaupt so aufgeschrieben wurde.

Die drei Seiten sind heute reine Skripte ohne `await`. Sie bekommen es beim
Start und sonst nichts.

## Der Reducer

`standAusVerlauf(ereignisse)` in `domain/lernstand.js`, neu: aus dem
vollständigen Ereignisstrom werden `einheiten`, `tage` und `rundeNr`
ausgerechnet.

**Die Bausteine liegen schon da.** `zaehlerAusVerlauf()` und `punkteVon()` tun
fast genau das — sie sind entstanden, um kaputte Zähler aus dem Verlauf zu
reparieren. Aus dem Notbehelf wird jetzt der Normalfall.

`domain/` bleibt rein: kein Netz, kein `Date.now()`, die Ereignisse kommen als
Argument herein.

## Die Ringpuffer fallen weg

`VERLAUF_MAX` (750 Antworten) und `TAGE_MAX` (400 Tage) gab es aus **einem**
Grund: `localStorage` ist klein. Postgres ist es nicht.

Damit verschwindet auch der Grund für `brauchbar()`: die Funktion holt heute
Zähler aus dem Verlauf zurück, wenn der Eintrag nichts taugt, und ihr Kommentar
sagt selbst, dass es nur 750 Antworten weit trägt. Wenn alles da ist, ist das
nicht mehr die Reparatur, sondern die Rechnung.

**Das ist der Teil, der wirklich Arbeit macht** — die Tests in
`tests/lernstand.test.js` prüfen die Ringpuffer ausdrücklich. Sie ziehen mit
um: aus „das Älteste fällt raus" wird „alles bleibt".

## Was mit localStorage passiert

Er bleibt — als **Ausfallnetz**, wenn der Server nicht antwortet. Der zuletzt
geladene Stand liegt weiter lokal, und wer ohne Netz übt, übt weiter. Der
Ausgangskorb aus
[Jede Antwort geht zum Server](implemented/feature-ereignisse-melden-2026-08-30-1000.md) sorgt
dafür, dass nichts verlorengeht.

Die Rollenverteilung aus `AGENTS.md` bleibt unangetastet: `storage.js` gehört
dem Gerät, `backend.js` der Person. Ein zwischengelagerter Lernstand ist etwas,
das man jederzeit wegwerfen würde — er steht ja auf dem Server.

## Beim Einlesen muss entdoppelt werden

**Am 30.08.2026 im laufenden Betrieb aufgefallen, nicht am Schreibtisch.**

Zwischen dem Einbau von
[Jede Antwort geht zum Server](implemented/feature-ereignisse-melden-2026-08-30-1000.md)
(10:00) und dem
[Umzug des Bestands](implemented/feature-umzug-des-bestands-2026-08-30-1815.md)
(18:15) lagen neun Stunden. Alles, was in diesem Fenster beantwortet wurde,
ging **zweimal** zum Server: einmal sofort als reguläre Zeile, und einmal beim
Umzug, weil es im lokalen `verlauf` steht.

Dasselbe passiert bei jedem Gerät, das seinen Umzug später nachholt — dort ist
das Fenster nicht neun Stunden, sondern alles seit dem 30.08.2026.

**Das `unique (nutzer, geraet, nummer)` greift dagegen nicht**, und das ist
kein Fehler: die beiden Zeilen haben verschiedene Gerätenamen (`umzug-<g>`
gegen `<g>`) und verschiedene Nummern. Der Schlüssel schützt gegen einen
doppelten Versand derselben Zeile, nicht gegen zwei Wege derselben Antwort.

Solange lokal die Wahrheit ist, ist das folgenlos — niemand liest die Tabelle.
**Ab diesem Feature ist es das nicht mehr:** eine doppelt gezählte Antwort
verdoppelt ihre Punkte und ihren `dran`-Zähler.

`standAusVerlauf()` muss deshalb entdoppeln, und der Schlüssel dafür ist
**nicht** die Zeilen-`id`, sondern das, was die Antwort ausmacht:

```
(nutzer, karte, form, zeit)
```

`zeit` kommt vom Gerät und ist bei beiden Kopien dieselbe Millisekunde — sie
stammen ja aus einem einzigen Tastendruck. Zwei echte Antworten auf dieselbe
Karte in derselben Millisekunde gibt es nicht.

Aufräumen lässt sich das nicht: die App kann keine Zeilen löschen, das ist in
der Migration so gewollt. Die Dubletten bleiben also liegen und werden beim
Lesen übergangen — was ohnehin die haltbarere Lösung ist, denn dasselbe kann
bei jedem künftigen Nachzügler wieder passieren.

## Die Abnahme

**Auf einem zweiten Gerät anmelden: derselbe Stand.** Das ist der ganze Zweck
des Features, und es ist der einzige Test, der ihn wirklich prüft.

Dazu: Netz aus, üben, Netz an, neu laden — nichts fehlt.

## Voraussetzung

[Aus der anonymen Sitzung wird ein Konto](implemented/feature-konten-2026-09-05-1830.md).

Ohne Konten hätte das Feature keinen Sinn: ein anonymer Nutzer je Gerät heißt,
dass „der Server ist die Wahrheit" und „jedes Gerät hat seinen eigenen Stand"
dasselbe bedeuten.
