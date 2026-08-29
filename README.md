# Vokabelkarten

Eine kleine Web-App zum Vokabeln lernen. Ein englisches Wort erscheint, man
tippt die deutsche Bedeutung ein, die App sagt richtig oder falsch.
Gebaut von Matilda und Thomas.

## Lokal starten

```bash
npm install     # einmalig, holt die Werkzeuge
npm run dev     # startet den Server, öffnet http://localhost:5173
```

## Weitere Befehle

```bash
npm test        # prüft, ob die Logik noch stimmt
npm run build   # baut die fertige Version nach dist/
```

## Aufs Handy legen

Die App läuft im Browser, kann aber wie eine richtige App auf dem
Homebildschirm liegen — mit Icon und ohne Adressleiste.

**Auf dem iPhone:** die Seite in Safari öffnen, unten auf das Teilen-Symbol
tippen, „Zum Home-Bildschirm".
**Auf Android:** in Chrome das Menü mit den drei Punkten, „App installieren".

Das ist keine Installation aus einem Store, sondern ein Lesezeichen mit Bild.
Es lohnt sich trotzdem: **iOS löscht sonst nach sieben Tagen ohne Benutzung
alles, was die App gespeichert hat.** Apps auf dem Homebildschirm sind davon
ausgenommen.

Ein Hinweis dazu, den man nur einmal falsch macht: eine App auf dem
Homebildschirm hat einen **eigenen Speicher**, getrennt von Safari. Wer sie
erst nach Wochen dorthin legt, fängt beim gespeicherten Stand von vorn an.
Also besser gleich.

## Vokabeln ändern

Alle Vokabeln stehen in `data/vokabeln.json`.
Wie das Format geht, steht in `data/README.md`.

## Was als Nächstes kommt

Der Fahrplan steht in [`roadmap/`](roadmap/). Der Dateiname sagt dort, was
schon steht: `feature-implemented-*` ist gebaut, `feature-request-*` ist
durchdacht und wartet, alles Übrige liegt im Backlog.

## Aufbau

```
data/        die Vokabeln (Daten, kein Code)
public/      wird unverändert mitgeliefert: Icons und manifest.json
src/domain/  die Regeln: was ist richtig, welche Karte kommt dran
src/infra/   das Einzige, was etwas speichert
src/ui/      alles, was mit Anzeige zu tun hat
src/app.js   steckt die Teile zusammen
tests/       automatische Tests für die Regeln
```

Der Grundsatz: `domain/` weiß nichts von der Anzeige, `ui/` weiß nichts von den
Regeln. Deshalb lassen sich die Regeln testen, ohne einen Browser zu starten.
