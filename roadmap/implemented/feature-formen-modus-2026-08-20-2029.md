# Feature: Unregelmäßige Verben mit drei Formen

**Status:** umgesetzt am 20.08.2026 um 20:29, [PR #7](https://github.com/ThomasPaulus21107/VocApp/pull/7) und [PR #8](https://github.com/ThomasPaulus21107/VocApp/pull/8)
**Wo im Code:** `data/unregelmaessige-verben.json`, `src/domain/pruefung.js`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-01.md`. Dort stand es
unter „Ungeplant dazugekommen" — es war nicht vorgesehen und ist die Grundlage
von allem geworden, was danach kam.

## Was entstanden ist

53 unregelmäßige Verben in einer eigenen Liste. Eine solche Karte hat
**statt** `en` und `de` das Feld `formen` mit drei Paaren: `infinitive`,
`simple-past`, `past-participle`. Abgefragt wird sie anders als eine normale
Vokabel — alle drei Formen werden gezeigt, eine bleibt leer und wird getippt.

Dazu kam `data/wortarten.json`: die erlaubten Werte für `wortart` als Daten,
nicht als Code. Fehlt eine Wortart, wird sie dort eingetragen. Frei auf die
Karte schreiben geht nicht mehr — ein Tippfehler wäre sonst eine stille
Wortart, die nur einmal vorkommt.

## Zwei Entscheidungen, die geblieben sind

- **Nur der Infinitiv trägt alle Bedeutungen.** `to break` heißt „brechen,
  zerbrechen, kaputtmachen"; zweite und dritte Form stehen nur in der
  Hauptbedeutung da. Preis: wer „zerbrach" tippt, bekommt ein Falsch.
- **Nach dem Partizip wird nie gefragt.** Es wird nach dem Lösen mitgezeigt.
  `ABGEFRAGTE_FORMEN` enthält nur `infinitive` und `simple-past`.

## Der Bugfix in PR #8

`display: flex` hat das `hidden`-Attribut überstimmt, die Formenzeile blieb
sichtbar stehen. Kein Test konnte das finden — Funktionstests kennen kein
Layout. Das ist bis heute der Anlass für
[Wie die Oberfläche getestet wird](../feature-request-ui-tests.md).
