# Feature: Töne für die Rückmeldung

**Status:** umgesetzt am 21.08.2026 um 17:12, [PR #10](https://github.com/ThomasPaulus21107/VocApp/pull/10)
**Wo im Code:** `src/ui/klang.js`

Rückwirkend aufgeschrieben am 25.08.2026 aus `sprint-02.md`. Dort stand es
unter „ungeplant" — es war nicht vorgesehen und ist geblieben.

Fünf Melodien: richtig, noch ein Versuch, falsch, Zuspruch, leere Eingabe.

## Wie es gebaut ist

`klang.js` ist die zweite Datei der UI-Schicht. Sie fasst keinen DOM an,
bekommt nur einen Namen gesagt (`spiele('richtig')`) und entscheidet nichts
selbst.

**Die Töne werden im Browser gerechnet — es gibt bewusst keine Sounddateien.**
Damit besteht eine Melodie aus Zahlen, die man ändern kann. `MELODIEN` gehört
deshalb Matilda, wie der Farbblock im CSS: Zahlen ändern, hören, fertig.

## Was fehlt

Ein **Ton-Schalter**. Es gibt keine Möglichkeit, die Melodien abzustellen —
das braucht einen Ort für Einstellungen und etwas, das sie speichert. Beides
kommt mit [Die Speicher-Naht am Gerät](feature-storage-2026-08-29-1327.md),
wo der Töne-Schalter der erste Kunde der Speicher-Naht ist.
