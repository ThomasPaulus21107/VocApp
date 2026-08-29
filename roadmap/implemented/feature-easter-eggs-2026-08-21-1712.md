# Feature: Zwei Easter Eggs im Eingabefeld

**Status:** umgesetzt am 21.08.2026 um 17:12, [PR #10](https://github.com/ThomasPaulus21107/VocApp/pull/10)
**Wo im Code:** `src/domain/pruefung.js`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-02.md`.

Zwei Eingaben behandelt `pruefeAntwort()` gesondert:

| Eingabe | Konstante | Was passiert |
|---|---|---|
| `s` | `SPRINGEN` | Karte überspringen, sofort zur nächsten, ohne Lösung |
| `keine ahnung` | `AUFGEBEN` | „DU SCHAFFST DAS" statt einer Bewertung |

## Warum sie in der Domäne stehen

Was eine Eingabe *bedeutet*, ist eine Regel. Die UI erfährt nur, was sie
anzeigen soll. Beide stehen deshalb als benannte Konstanten in
`pruefung.js` — es ist **Absicht, kein toter Code**.

Kollidieren können sie nicht: keine englische Verbform ist einen Buchstaben
lang, und „keine ahnung" ist kein englisches Wort.

## In der Oberfläche steht bewusst nichts davon

Sie sollen gefunden werden, nicht erklärt. Also weder ins Label schreiben noch
in `data/README.md` erwähnen — die Anleitung liest Matilda.

## Was später dazukam

Im Übungsblatt bleibt die Karte nach „keine Ahnung" offen und kostet keinen
Versuch. In der Arbeit kommt der Zuspruch auch, aber die Karte ist danach
durch — `hilferufOhneFolgen` in der Regeltabelle. Für die
[Lernpotential-Runde](feature-lernpotential-2026-08-24-2211.md)
zählen beide Eingaben nicht: da wurde es nicht versucht.
