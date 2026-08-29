# Feature: Auf dem Homebildschirm

**Status:** umgesetzt am 29.08.2026 um 13:27, [PR #19](https://github.com/ThomasPaulus21107/VocApp/pull/19) und [PR #21](https://github.com/ThomasPaulus21107/VocApp/pull/21)
**Wo im Code:** `manifest.json` — neu, `index.html`, `vite.config.js`

Ein Icon auf Matildas iPhone, das die App öffnet. Kein Umweg über Safari, kein
Tippen einer URL, keine Adressleiste über der Karte.

Das ist die Bequemlichkeit. Der eigentliche Grund ist ein anderer.

## Der Grund: iOS löscht sonst die Statistik

Safari löscht seit 2020 **sämtlichen skriptgeschriebenen Speicher** —
`localStorage` eingeschlossen — wenn eine Seite sieben Tage lang nicht benutzt
wurde. Android-Chrome kennt diese Regel nicht; dort wird nur bei Speicherdruck
geräumt.

Die Uhr wird bei jeder Benutzung zurückgesetzt. Wer regelmäßig übt, merkt nie
etwas. Gefährlich sind genau die Lücken: Krankheit, zwei Wochen Ferien, das
Ende des Schuljahrs — **also ausgerechnet die Momente, nach denen eine über
Monate gewachsene [Statistik](../feature-request-lernstand.md) am meisten wert
wäre.**

**Web-Apps auf dem Homebildschirm sind von der Löschung ausgenommen.** Das ist
der ganze Grund, warum diese Datei existiert.

## Das ist nicht die PWA, die Out of Scope steht

`AGENTS.md` führt „PWA / Offline-Installation" unter Out of Scope, und die
Begründung dort ist der dauerhafte Aufwand für **Service Worker und
Cache-Invalidierung**. Beides kommt hier nicht vor:

| | Out of Scope | Hier |
|---|---|---|
| Service Worker | ja | **nein** |
| Cache-Invalidierung | ja | **nein** |
| Offline funktionieren | ja | nein — ohne Netz lädt sie nicht |
| Was dazukommt | ein Wartungsthema | eine Datei und ein Meta-Tag |

Ein `manifest.json` ist eine Textdatei mit Name, Farbe und Icon. Es ändert
nichts daran, wie die App lädt oder aktualisiert wird. Die Entscheidung gegen
die PWA bleibt unangetastet.

## Was gebaut wird

- `manifest.json` mit Name, Startadresse, `display: standalone` und Icon
- `<link rel="manifest">` in `index.html`, dazu das Apple-Meta-Tag
- ein Icon — **Matildas Teil**, die Rakete bietet sich an
- alles davon in einem neuen Ordner `public/`. Vite kopiert dessen Inhalt
  unverändert in den Build; `vite.config.js` bleibt unangetastet.

Dazu ein Satz in der `README.md`, wie man es aufs Telefon legt. Das ist ein
Menüpunkt in Safari und keine Installation.

## Zuerst installieren, dann sammeln

Die Falle, die man nur einmal erlebt: **eine Web-App auf dem Homebildschirm
hat unter iOS ihren eigenen Speicher, getrennt von Safari.** Was vorher in
Safari geübt wurde, ist im Icon-Start nicht da — die Statistik sieht leer aus,
obwohl nichts verloren ist.

Also: das Icon aufs Telefon legen, **bevor** die Statistik anfängt zu wachsen.
Diese Datei gehört deshalb vor
[Der Lernstand je Vokabel](../feature-request-lernstand.md) und nicht danach.

## Voraussetzungen

Keine. Kann sofort passieren und dauert einen Abend.

## Zu beachten

- **Der Sicherungsknopf ersetzt das hier nicht und umgekehrt.** Der
  Homebildschirm verhindert den Verlust, der Knopf repariert ihn. Auf einem
  Telefon als Hauptgerät will man beides.
- **`display: standalone` nimmt die Adressleiste weg.** Damit gibt es keinen
  Zurück-Knopf mehr — sobald es
  [Seitenmenü](feature-seitenmenue-2026-08-29-1348.md) und
  [Fortschritt](../feature-request-fortschritt.md) als eigene Seiten gibt, muss
  jede davon einen sichtbaren Weg zurück haben. In Safari trägt das der
  Browser, hier nicht mehr.
- Die Farbe der Browserleiste ist schon gesetzt (`theme-color`, aus
  [Kleinkram](feature-kleinkram-2026-08-25-2231.md)) und wird
  hier wiederverwendet.
