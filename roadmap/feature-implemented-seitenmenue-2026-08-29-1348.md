# Feature: Das Seitenmenü

**Status:** umgesetzt am 29.08.2026 um 13:48, [PR #22](https://github.com/ThomasPaulus21107/VocApp/pull/22)
**Wo im Code:** `index.html`, `src/ui/ui.js`, `src/ui/styles.css`, `src/ui/klang.js`

Ein Knopf oben rechts, der eine Lade von der Seite hereinfahren lässt. Darin
steht, was nicht auf die Karte gehört: die Töne an und aus, und der Weg zur
Lernstatistik.

Ersetzt am 29.08.2026 `feature-request-optionsseite.md`. Die alte Fassung
liegt in der Git-Historie.

## Warum jetzt eine Klappe und vorher eine Seite

Die Optionsseite hat das ausdrücklich abgelehnt: „Nicht als Klappe oder Dialog
in der Karte, sondern als zweite Seite." Das war richtig gedacht — Üben und
Einstellen sind zwei Situationen, und die Karte soll leer bleiben.

Zwei Dinge haben sich seitdem geändert:

**Im Standalone-Modus gibt es keinen Zurück-Knopf.** Seit
[Auf dem Homebildschirm](feature-implemented-homebildschirm-2026-08-29-1327.md) startet die App
ohne Adressleiste. Jede eigene Seite muss ihren Weg zurück selbst mitbringen,
und wer ihn übersieht, sitzt fest. Ein Overlay hat das Problem nicht: es liegt
über der Karte, und das X schließt es.

**Es gab nie zwei Schalter.** Die Optionsseite hat auf einen zweiten gewartet,
den Vokabel-Strang oder die Richtung liefern sollten — beide sind bis heute
nicht da. Eine ganze Seite für einen Schalter zu bauen war die falsche Größe;
eine Lade ist es nicht.

Der Kern der alten Entscheidung bleibt: **die Karte bleibt leer.** Das Menü ist
zu, solange es niemand öffnet.

## Was drinsteht

| Eintrag | Art | Wann |
|---|---|---|
| **Töne an/aus** | ein Schalter, direkt im Menü | mit dem Menü |
| **Lernstatistik** | ein Weg dorthin, kein Inhalt im Menü | steht |

Der Unterschied zwischen den beiden ist Absicht: ein Schalter ist eine Zeile
und gehört ins Menü, die Statistik ist Inhalt zum Scrollen und gehört auf eine
eigene Seite.

Gebaut wurde in dieser Reihenfolge, und sie ist leicht falsch herum zu bauen:
erst [das Mitschreiben](feature-request-lernstand.md), dann
[die Seite](feature-request-fortschritt.md), dann die Zeile hier. Wer mit der
Seite anfängt, hat sie am Tag ihrer Fertigstellung leer — und für Wochen.

Der Unterschied ist Absicht. Ein Schalter ist eine Zeile und gehört ins Menü.
Die [Statistik](feature-request-fortschritt.md) sind 106 Einheiten, nach
Mustern gruppiert, plus die letzten Runden — das ist Inhalt zum Scrollen und
gehört auf eine eigene Seite, auch auf einem Telefon. Sie bekommt dann einen
sichtbaren Weg zurück, siehe oben.

Später kommen weitere Zeilen dazu: die Aufgabenart aus
[Alle drei Zeiten](feature-request-drei-zeiten.md), was geübt wird aus dem
[Vokabel-Import](feature-request-vokabel-import-klasse-5.md), die
[Richtung](feature-request-richtung.md). Jede ist eine Zeile mehr, kein Umbau
— das war schon der Anspruch an die Optionsseite und gilt hier weiter.

## Der Töne-Schalter

Er stand in [`storage.js`](feature-implemented-storage-2026-08-29-1327.md) als erster Kunde der
Speicher-Naht und ist dort beim Bauen liegengeblieben, weil der Auswahlstand
diesen Zweck besser erfüllt hat. Hier kommt er nach.

`klang.js` bekommt dafür einen Schalter. Er gehört dorthin und nicht in
`ui.js`: die Datei weiß bereits, ob und wie ein Ton klingt, also weiß sie auch,
dass gerade keiner klingen soll. Der Wert liegt unter `toene` in `storage.js`
— Standard ist **an**, wer nichts einstellt, hört die Töne wie bisher.

## Zu beachten

- **Die Lade muss sich mit der Tastatur bedienen lassen.** Escape schließt,
  der Fokus wandert beim Öffnen hinein und beim Schließen zurück auf den
  Knopf. Sonst ist sie für Vorlesesoftware eine Falle.
- **Kein Bibliothek und kein `<dialog>`-Polyfill.** Ein `aside`, eine Klasse
  und ein `transform` reichen. Die App hat kein Framework.
- **Nicht während einer laufenden Frage aufdrängen.** Der Knopf ist immer da,
  aber klein und leise — er ist kein zweiter Hauptknopf neben „Prüfen".
- **Auf 390 px** ist die Lade fast so breit wie der Bildschirm. Das ist in
  Ordnung; sie ist ja modal.

## Matildas Teil

Die Gestaltung: wie die Lade hereinkommt, wie der Knopf aussieht, wie der
Schalter aussieht. Was hier gebaut wird, ist absichtlich schmucklos.
