# Feature: Namensfeld statt Login

**Status:** bereit — noch keinem Sprint zugeordnet
**Wo im Code:** `optionen.html`, `src/infra/storage.js`

Ein Textfeld auf der Optionsseite. Der eingetragene Name wird dem
Speicherschlüssel vorangestellt — mehr passiert nicht.

## Das Problem, das es löst

Matilda arbeitet an Thomas' Rechner. Gleicher Browser heißt gleicher
`localStorage`: ihre Einstellungen und später ihre Punkte mischen sich mit
seinen. Zwei Browserprofile wären die Alternative, aber das ist eine Hürde vor
jedem Üben.

## Bewusst kein Login

Kein Passwort, keine Anmeldung, keine Prüfung. Wer den Namen kennt, sieht den
Stand. Für zwei Leute an einem Rechner reicht das vollständig — und alles
darüber hinaus wäre echtes User Management, das ohne Server ohnehin nicht
geht.

## Was es schafft

Es zieht die Trennlinie zwischen Personen an genau der Stelle, an der später
Accounts ansetzen. Wer das hier baut, muss den Speicherzugriff später nicht
noch einmal umbauen — der Schlüssel ist dann schon personengebunden.

## Voraussetzungen

- [Einstellungen speichern](feature-einstellungen-speichern.md)
- [Optionsseite](feature-optionsseite.md) als Ort für das Feld

## Zu beachten

- Beim Wechsel des Namens ändert sich der Stand sofort — das muss die Seite
  sagen, sonst wirkt es wie Datenverlust.
- Kein Name eingetragen heißt: der bisherige Speicher gilt weiter. Niemand
  soll erst etwas eintippen müssen, um die App zu benutzen.
