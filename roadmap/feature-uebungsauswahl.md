# Feature: Auswählen, was geübt wird

**Status:** in [Sprint 3](sprint-03.md)
**Wo im Code:** `src/app.js`, `src/ui/ui.js`

Vokabeln, unregelmäßige Verben — oder beides gemischt.

## Das gab es schon einmal

Der gemischte Stapel war bis PR #10 gebaut und ist beim Fokus-Umbau bewusst
herausgeflogen. Im alten `app.js` stand:

```js
// Beide Listen kommen in einen gemeinsamen Stapel. Auswählen, welche Liste
// geübt wird, kommt in einem späteren Sprint.
const alleKarten = [...vokabeln.karten, ...verben.karten];
```

`stelleFrage`, `hatFormen` und `mische` stehen alle noch in `pruefung.js` und
sind getestet. **Die Domäne kann das bereits** — es ist überwiegend ein
Wiederanschließen.

## Was in der UI wirklich zu tun ist

Dort ist es kein Revert. `el.beiwort` trägt seit dem Umbau den Formnamen
(„simple past"); früher stand dort `wortart · bedeutung` („Nomen · Geld"). Die
Fallunterscheidung muss zurück:

| Kartensorte | `beiwort` zeigt | Formenzeile |
|---|---|---|
| unregelmäßiges Verb | die gesuchte Form | sichtbar |
| normale Vokabel | `wortart · bedeutung` | versteckt |

Ein Konflikt ist das nicht — eine Karte ist immer nur eins von beidem, es ist
derselbe Platz. `wortart` und `bedeutung` werden aktuell **gar nicht**
angezeigt, obwohl `AGENTS.md` beschreibt, dass sie offen unter der Frage
stehen. Das kommt hier zurück.

## Die Richtung gehört dazu

Bei Verben wird nur nach der englischen Form gefragt. Bei normalen Vokabeln
sind beide Richtungen sinnvoll — der Richtungsschalter auf der
[Optionsseite](feature-optionsseite.md) wird also erst mit diesem Feature
wirklich nützlich.

## Voraussetzungen

- [Optionsseite](feature-optionsseite.md) als Ort für den Schalter
- [Lektionsdateien](feature-lektionsdateien.md) liefern die Vokabelseite

## Später: einzelne Lektionen

Statt „alle Vokabeln" auch „nur Unit 3". Die Liste muss dafür nirgends
gepflegt werden — sie ergibt sich aus den gefundenen Dateien und ihrem
`titel`. Kommt, sobald es genug Lektionen gibt, dass die grobe Auswahl nicht
mehr reicht.
