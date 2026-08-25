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
src/domain/  die Regeln: was ist richtig, wie wird gemischt
src/ui/      alles, was mit Anzeige zu tun hat
src/app.js   steckt die Teile zusammen
tests/       automatische Tests für die Regeln
```

Der Grundsatz: `domain/` weiß nichts von der Anzeige, `ui/` weiß nichts von den
Regeln. Deshalb lassen sich die Regeln testen, ohne einen Browser zu starten.
