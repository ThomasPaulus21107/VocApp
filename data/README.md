# So trägst du Vokabeln ein

Die Vokabeln stehen in `vokabeln.json`. Du brauchst dafür keinen Code
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
| `wortart`  | ja       | einer der Werte aus `wortarten.json` (siehe unten)          |
| `bedeutung`| nein     | nur nötig, wenn ein Wort zwei Bedeutungen hat (siehe unten)|
| `hinweise` | ja       | ein Tipp für jede Richtung                                 |

## Die Wortart kommt aus einer Liste

Bei `wortart` darfst du nicht mehr frei reinschreiben. Erlaubt ist nur, was in
`wortarten.json` steht — im Moment das hier:

```json
["Nomen", "Verb", "unregelmäßiges Verb", "Adjektiv"]
```

**Fehlt eine Wortart, trag sie dort ein.** Du darfst das, die Datei gehört
genauso dir wie die Vokabeln. Nur eben an einer Stelle und bewusst, nicht
nebenbei auf einer einzelnen Karte.

Der Grund ist langweilig, aber wichtig: wenn du einmal „Nomen" und einmal
„nomen" schreibst, hält die App das für zwei verschiedene Wortarten und sagt
dir nichts davon. Mit der Liste merkt es der Test sofort.

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

## Unregelmäßige Verben haben eine eigene Datei

Die kommen **nicht** in `vokabeln.json`, sondern in
`unregelmaessige-verben.json`. Der Grund: sie haben drei Formen statt einer,
und die App fragt sie deshalb anders ab.

So eine Karte hat kein `en` und kein `de`, sondern `formen`:

```json
{
  "id": "uv-053",
  "wortart": "unregelmäßiges Verb",
  "formen": {
    "infinitive": { "en": ["to write"], "de": ["schreiben"] },
    "simple-past": { "en": ["wrote"], "de": ["schrieb"] },
    "past-participle": { "en": ["written"], "de": ["geschrieben"] }
  },
  "hinweise": {
    "nach-de": "das lernt man in der Grundschule",
    "nach-en": "you do this with a pen in your exercise book"
  }
}
```

In der App siehst du dann alle drei Formen nebeneinander, und **eine davon ist
leer** — die tippst du. Welche leer bleibt, wird jedes Mal neu ausgewürfelt.

Zwei Dinge dazu:

- **Nur beim Infinitiv schreibst du alle Bedeutungen rein.** `to break` heißt
  brechen, zerbrechen und kaputtmachen — aber bei `simple-past` und
  `past-participle` steht nur die erste davon. Sonst wird die Datei so lang,
  dass keiner mehr durchblickt.
- **Die Tipps stehen einmal pro Karte**, nicht bei jeder Form. Ein Tipp
  erklärt ja, was das Verb bedeutet, und das ist bei allen drei Formen gleich.

Eine Karte hat entweder `en` und `de`, oder `formen`. Niemals beides.

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

Der Test schaut sich **beide** Vokabeldateien an: ob jede id nur einmal
vorkommt (über beide Dateien zusammen!), ob überall beide Sprachen ausgefüllt
sind, ob die Wortart aus `wortarten.json` kommt, ob `formen` und Wortart
zusammenpassen und ob es beide Hinweise gibt. Wenn etwas fehlt, sagt er dir,
bei welcher id. Nach der `bedeutung` fragt er nicht — die ist ja freiwillig.

Meistens fehlt sonst ein Komma oder eine Klammer. VS Code färbt die Stelle
rot ein.
