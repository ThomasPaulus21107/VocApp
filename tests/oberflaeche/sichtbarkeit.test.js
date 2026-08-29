// Der Anlass fuer diese ganze Test-Sorte.
//
// Am 20.08.2026 ist ein Fehler durchgerutscht, den kein Funktionstest finden
// konnte (PR #8): `display: flex` hat das hidden-Attribut ueberstimmt, und
// die Formenzeile blieb sichtbar stehen -- mitsamt der Loesung, nach der
// gerade gefragt war. Im Markup stand alles richtig, nur gezeichnet wurde es
// trotzdem.
//
// Deshalb pruefen diese Tests nicht, ob ein Attribut gesetzt ist, sondern ob
// das Element wirklich weg ist. Das kann nur ein echter Browser sagen.

import { test, expect } from '@playwright/test';
import {
  oeffneUebung, starte, antworteRichtig, antworteFalsch, spieleBisZumEnde,
  trotzdemSichtbar,
} from './hilfen.js';

const SEITEN = ['index.html', 'fortschritt.html', 'fleiss.html'];

for (const seitenname of SEITEN) {
  test(`auf ${seitenname} ist alles wirklich weg, was hidden traegt`, async ({ page: seite }) => {
    await seite.goto(seitenname);
    expect(await trotzdemSichtbar(seite)).toEqual([]);
  });
}

test('die Regel haelt auch mitten in einer Runde und am Ende', async ({ page: seite }) => {
  await oeffneUebung(seite);
  expect(await trotzdemSichtbar(seite)).toEqual([]);

  await starte(seite, 'uebungsblatt');
  expect(await trotzdemSichtbar(seite)).toEqual([]);

  await antworteRichtig(seite);
  expect(await trotzdemSichtbar(seite)).toEqual([]);

  await spieleBisZumEnde(seite, { falschBei: [3] });
  expect(await trotzdemSichtbar(seite)).toEqual([]);
});

test('die Formenzeile steht erst da, wenn die Karte geloest ist', async ({ page: seite }) => {
  await oeffneUebung(seite);
  await starte(seite, 'uebungsblatt');

  // Genau hier ist der Fehler passiert: waere die Zeile jetzt zu sehen,
  // stuende die Antwort auf der Karte, nach der gerade gefragt wird.
  const formen = seite.locator('#formen');
  await expect(formen).toBeHidden();

  await antworteRichtig(seite);
  await expect(formen).toBeVisible();

  // Und auf der naechsten Karte ist sie wieder weg.
  await seite.locator('#knopf').click();
  await expect(seite.locator('#zaehler')).toHaveText('Karte 2 von 15');
  await expect(formen).toBeHidden();
});

test('auf der Startseite ist nur die Wahl zu sehen', async ({ page: seite }) => {
  await oeffneUebung(seite);

  await expect(seite.locator('#start')).toBeVisible();
  await expect(seite.locator('#karte')).toBeHidden();
  await expect(seite.locator('#zwischen')).toBeHidden();
  await expect(seite.locator('#ende')).toBeHidden();
  await expect(seite.locator('#formen')).toBeHidden();
  // Die Richtungswahl ist abgeschaltet: sie steht noch im Markup, aber ohne
  // Handler blendet ui.js sie aus. Man darf sie also nicht anklicken koennen.
  await expect(seite.locator('#richtung')).toBeHidden();
});

test('die Loesung kommt nur, wenn die Antwort falsch war', async ({ page: seite }) => {
  await oeffneUebung(seite);
  await starte(seite, 'uebungsblatt');

  const loesung = seite.locator('#loesung');
  await antworteRichtig(seite);
  await expect(loesung).toBeHidden();

  await seite.locator('#knopf').click();
  await antworteFalsch(seite);
  await antworteFalsch(seite);
  await expect(loesung).toBeVisible();
});

test('das Menue liegt zu, bis es jemand oeffnet', async ({ page: seite }) => {
  await oeffneUebung(seite);

  // Die Lade wird geschoben und nicht ausgeblendet -- sie ist trotzdem
  // unsichtbar und darf keine Klicks annehmen.
  await expect(seite.locator('#menue')).toBeHidden();
  await expect(seite.locator('#menue-knopf')).toHaveAttribute('aria-expanded', 'false');
});
