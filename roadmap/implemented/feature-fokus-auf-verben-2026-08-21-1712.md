# Feature: Fokus auf das aktuelle Lernziel

**Status:** umgesetzt am 21.08.2026 um 17:12, [PR #10](https://github.com/ThomasPaulus21107/VocApp/pull/10)
**Wo im Code:** `src/app.js`, `src/domain/pruefung.js`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-02.md`.

Die App übt genau das, was Matilda gerade in der Schule braucht: unregelmäßige
Verben. Nur die Verbenliste, nur eine Richtung — das deutsche Verb steht da,
getippt wird die englische Form.

## Was entstanden ist

- **Nur noch Verben.** Der gemischte Stapel aus beiden Listen ist dabei
  herausgefallen. Bewusst: eine App, die alles ein bisschen übt, übt nichts
  richtig.
- **Eine Runde hat eine feste Länge.** `zieheRunde()` in `pruefung.js`,
  `RUNDENGROESSE` in `app.js`. Nicht mehr alle Karten am Stück.

## Was das gekostet hat

Die normalen Vokabeln in `data/vokabeln.json` sind seitdem **unerreichbar** —
die App lädt sie nicht mehr. Ebenso werden `wortart` und `bedeutung` nicht
mehr angezeigt, obwohl das Datenformat sie vorsieht: `el.beiwort` trägt seit
dem Umbau den Formnamen („simple past").

Beides ist kein Fehler, sondern der Preis des Fokus. Es kommt zurück, wenn der
Vokabel-Strang wieder aufgenommen wird — der steht dafür in `backlog.md`.

## Die Rundengröße

Stand hier zunächst auf 20, ohne dass die Zahl je entschieden wurde. Sie ist
mit [dem Ergebnis als Schulnote](feature-schulnoten-2026-08-22-1115.md)
auf **15** festgelegt worden: eine Karte, ein Punkt, und die Punkteskala der
Oberstufe endet bei 15.
