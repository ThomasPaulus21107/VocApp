# Feature: Kleinkram in der Oberfläche

**Status:** umgesetzt am 25.08.2026 um 22:31
**Wo im Code:** `index.html`, `src/ui/styles.css`

Drei Kleinigkeiten, die einzeln zu klein für eine Datei sind. Diese Datei hieß
vorher `feature-request-feinschliff.md`; der Trenner zwischen Übung und
Wiederholung ist daraus zu
[Der Moment nach der Runde](feature-implemented-nach-der-runde-2026-08-25-2212.md)
umgezogen, weil er zu einer echten Zwischenseite gewachsen ist.

## 1. Der Abstand der Formenzeile

Die Zeile mit den drei Formen klebte unter dem Fragewort und sah aus, als
gehörte sie dazu. Jetzt hat sie oben mehr Luft als unten (`1.75rem` gegen
`0.5rem`) und steht für sich.

Matildas Punkt aus der alten `sprint-03.md`.

## 2. Ein Bildchen im Browser-Tab

Es gab keins — und damit bei jedem Laden einen 404 auf `favicon.ico`, den
außer der Entwicklerkonsole niemand gesehen hat.

Das Bildchen ist **keine Datei**, sondern ein Emoji, das als winziges SVG
direkt im `<head>` steht. Damit gibt es nichts hochzuladen, nichts zu
verkleinern und keine zweite Datei, die zum Repo-Namen passen muss.

**Für Matilda:** das Emoji zwischen `>` und `<` austauschen, speichern, Seite
neu laden. Mehr ist es nicht.

## 3. Die Farbe der Browserleiste am Handy

`<meta name="theme-color">` färbt die Leiste über der Seite in der
Hintergrundfarbe. Ohne die Zeile bleibt sie weiß und die App sieht aus, als
klebte sie in einem fremden Fenster.

**Achtung, doppelte Wahrheit:** die Farbe steht als Hexwert im HTML und noch
einmal als `--hintergrund` in `styles.css`. Wer die eine ändert, muss die
andere mitändern. Der Kommentar an der Zeile sagt das auch.

## Was hier stand und wieder zurück ist

`to read` ist in allen drei Formen gleich — kommt die Karte dran, ist die
Frage geschenkt. Die Entscheidung (Karte rausnehmen, drinlassen oder anders
behandeln) gehört Matilda und ist noch offen. Der Punkt steht deshalb wieder
in `backlog.md`, wo er hergekommen ist.
