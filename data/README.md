# So trägst du Vokabeln ein

Alle Vokabeln stehen in `vokabeln.json`. Du brauchst dafür keinen Code
anzufassen. Eine Karte sieht so aus:

```json
{
  "id": "demo-007",
  "en": ["house"],
  "de": ["Haus"],
  "wortart": "Nomen",
  "hinweise": {
    "nach-de": "da wohnt man drin",
    "nach-en": "you live in it"
  }
}
```

## Wo die Karte hin muss

Die Datei hat oben eine Überschrift und darunter die Liste aller Karten:

```json
{
  "titel": "Lektion Demo",
  "karten": [
    ... hier stehen die Karten ...
  ]
}
```

Neue Karten kommen **zwischen die eckigen Klammern von `karten`**, hinter die
letzte Karte. Der `titel` ist der Name der Lektion — den zeigt die App oben
an, und du kannst ihn jederzeit ändern.

## Die Felder

| Feld       | Pflicht? | Was rein muss                                              |
|------------|----------|------------------------------------------------------------|
| `id`       | ja       | Name der Lektion + Nummer, z.B. `demo-007`. Jede id nur einmal! |
| `en`       | ja       | Liste der englischen Wörter                                |
| `de`       | ja       | Liste der deutschen Wörter                                 |
| `wortart`  | ja       | Nomen, Verb, unregelmäßiges Verb, Adjektiv ...             |
| `bedeutung`| nein     | nur nötig, wenn ein Wort zwei Bedeutungen hat (siehe unten)|
| `hinweise` | ja       | ein Tipp für jede Richtung                                 |

Bei `wortart` darfst du reinschreiben, was du im Heft stehen hast. Es gibt
keine feste Liste, aus der du auswählen musst.

## Warum zwei Listen statt Frage und Antwort?

Weil die App in beide Richtungen abfragt. Du entscheidest oben in der App,
ob du Englisch → Deutsch übst oder andersherum. Die Karte selbst weiß nichts
davon; sie kennt nur beide Seiten.

**Das erste Wort in der Liste wird als Frage angezeigt.** Alle anderen gelten
trotzdem als richtige Antwort. Bei `"de": ["Fahrrad", "Rad"]` steht also
"Fahrrad" auf der Karte, aber "Rad" wird auch akzeptiert.

## Die beiden Hinweise

`nach-de` erscheint, wenn du auf **Deutsch** antworten sollst.
`nach-en` erscheint, wenn du auf **Englisch** antworten sollst.

Du siehst den Tipp nur, wenn du auf "Tipp anzeigen" drückst.

Schreib den `nach-en`-Tipp ruhig auf Englisch. Das ist dann gleich nochmal
eine kleine Übung.

Guter Tipp: *"an animal that barks"*
Schlechter Tipp: *"dog"* — verrät die Antwort.

## Wenn ein Wort zwei Bedeutungen hat

"bank" heißt Bank (Geld) **oder** Ufer (Fluss). Das sind eigentlich zwei
Vokabeln. Also machst du zwei Karten und schreibst dazu, welche gemeint ist:

```json
{ "id": "l1-004", "en": ["bank"], "de": ["Bank"], "bedeutung": "Geld", ... },
{ "id": "l1-005", "en": ["bank"], "de": ["Ufer"], "bedeutung": "Fluss", ... }
```

Die `bedeutung` steht dann klein unter der Frage. Ohne sie könntest du die
Frage gar nicht beantworten.

Vorsicht beim Unterschied: **"Fahrrad" und "Rad" sind dasselbe** und kommen in
eine Liste. **"Bank" und "Ufer" sind zwei verschiedene Dinge** und brauchen
zwei Karten.

## Die drei Regeln

1. **Listen haben eckige Klammern**, auch bei nur einem Wort: `["Haus"]`.
2. **Zwischen zwei Karten steht ein Komma**, hinter der letzten Karte nicht.
3. **`id` niemals nachträglich ändern.** Später merkt sich die App daran,
   welche Vokabeln du schon kannst.

## Groß- und Kleinschreibung

Musst du dir keine Gedanken machen. Die App vergleicht so, dass "hund",
"Hund" und " Hund " alle als richtig zählen.

## Prüfen, ob alles stimmt

```bash
npm test
```

Der Test schaut nach, ob jede id nur einmal vorkommt, ob überall beide
Sprachen ausgefüllt sind, ob die Wortart dasteht und ob es beide Hinweise
gibt. Wenn etwas fehlt, sagt er dir, bei welcher id. Nach der `bedeutung`
fragt er nicht — die ist ja freiwillig.

Meistens fehlt sonst ein Komma oder eine Klammer. VS Code färbt die Stelle
rot ein.
