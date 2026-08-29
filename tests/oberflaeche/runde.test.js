// Eine Runde von der Wahl bis zur Note -- im Browser, mit echten Klicks.
// Was hier gepruft wird, ist der Weg durch die App: dass die Karten
// weiterzaehlen, dass die beiden Modi sich unterscheiden und dass am Ende
// die Note steht, die zu den Punkten gehoert.

import { test, expect } from '@playwright/test';
import { NOTEN } from '../../src/domain/note.js';
import {
  oeffneUebung, starte, aktuelleKarte, antworteRichtig, antworteFalsch,
  spieleBisZumEnde, zaehler,
} from './hilfen.js';

test.beforeEach(async ({ page: seite }) => {
  await oeffneUebung(seite);
});

test('die App fragt zuerst, was man machen moechte', async ({ page: seite }) => {
  await expect(seite.locator('#start .frage')).toHaveText('Was möchtest du machen?');
  await expect(seite.locator('#start [data-modus="uebungsblatt"]')).toBeVisible();
  await expect(seite.locator('#start [data-modus="arbeit"]')).toBeVisible();
  await expect(seite.locator('#karte')).toBeHidden();
});

test('eine Runde beginnt bei Karte 1 von 15', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');

  await expect(seite.locator('#zaehler')).toHaveText('Karte 1 von 15');
  await expect(seite.locator('#frage')).not.toBeEmpty();
  // Unter der Frage steht, welche Form getippt werden soll -- ohne die
  // Angabe waere gar nicht klar, wonach gefragt ist.
  await expect(seite.locator('#beiwort')).toHaveText(/infinitive|simple past/);
  await expect(seite.locator('#eingabe')).toBeFocused();
});

test('eine richtige Antwort wird gelobt und zeigt alle drei Formen', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');
  const karte = await antworteRichtig(seite);

  await expect(seite.locator('#rueckmeldung')).toHaveText('Richtig!');
  await expect(seite.locator('#formen')).toBeVisible();
  // Die Form, nach der gefragt war, steht hervorgehoben in der Zeile.
  await expect(seite.locator(`#form-${karte.form}`)).toHaveClass(/formen__gefragt/);
  // Aus "Pruefen" wird "Weiter": dieselbe Taste bringt die naechste Karte.
  await expect(seite.locator('#knopf')).toHaveText('Weiter');
  await expect(seite.locator('#eingabe')).toBeDisabled();
});

test('im Uebungsblatt gibt es nach einem Fehler noch einen Versuch', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');
  await antworteFalsch(seite);

  await expect(seite.locator('#rueckmeldung'))
    .toHaveText('Noch nicht ganz. Du hast noch einen Versuch.');
  // Die Karte bleibt stehen, das Feld ist leer und wieder benutzbar.
  await expect(seite.locator('#zaehler')).toHaveText('Karte 1 von 15');
  await expect(seite.locator('#eingabe')).toHaveValue('');
  await expect(seite.locator('#eingabe')).toBeEnabled();
  await expect(seite.locator('#loesung')).toBeHidden();

  await antworteRichtig(seite);
  await expect(seite.locator('#rueckmeldung')).toHaveText('Richtig!');
});

test('nach dem zweiten Fehler steht das richtige Wort gross da', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');
  const karte = await antworteFalsch(seite);
  await antworteFalsch(seite);

  await expect(seite.locator('#rueckmeldung')).toHaveText('Leider nicht. Richtig ist:');
  await expect(seite.locator('#loesung')).toHaveText(karte.antwort);
});

test('der Tipp verraet den ersten Buchstaben und die Laenge', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');
  const karte = await aktuelleKarte(seite);

  await expect(seite.locator('#tipp')).toBeHidden();
  await seite.locator('#tipp-knopf').click();

  const tipp = await seite.locator('#tipp').textContent();
  expect(tipp).toHaveLength(karte.antwort.length);
  expect(tipp[0]).toBe(karte.antwort[0]);
  // Einmal geholt ist geholt -- ein zweiter Klick soll nichts mehr bringen.
  await expect(seite.locator('#tipp-knopf')).toBeDisabled();
});

test('in der Arbeit gibt es keinen Tipp und keine zweite Chance', async ({ page: seite }) => {
  await starte(seite, 'arbeit');
  await expect(seite.locator('#tipp-knopf')).toBeHidden();

  await antworteFalsch(seite);

  // Falsch ist falsch: ohne ein Wort, sofort zur naechsten Karte.
  await expect(seite.locator('#zaehler')).toHaveText('Karte 2 von 15');
  await expect(seite.locator('#rueckmeldung')).toBeEmpty();
  await expect(seite.locator('#loesung')).toBeHidden();
});

test('in der Arbeit wird auch eine richtige Antwort nicht kommentiert', async ({ page: seite }) => {
  await starte(seite, 'arbeit');
  await antworteRichtig(seite);

  await expect(seite.locator('#zaehler')).toHaveText('Karte 2 von 15');
  await expect(seite.locator('#rueckmeldung')).toBeEmpty();
  await expect(seite.locator('#formen')).toBeHidden();
});

test('eine fehlerfreie Runde endet mit der besten Note', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');
  await spieleBisZumEnde(seite);

  await expect(seite.locator('#ende')).toBeVisible();
  await expect(seite.locator('#note')).toHaveText(NOTEN.at(-1));
  await expect(seite.locator('#punkte')).toHaveText('15 von 15 Punkten');
  // Ohne einen einzigen Fehler gibt es nichts zu wiederholen.
  await expect(seite.locator('#lernpotential')).toBeHidden();
});

test('was danebenging, kommt am Ende noch einmal', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');

  // Karte 1 geht absichtlich zweimal daneben, die anderen vierzehn sitzen.
  const knopf = seite.locator('#knopf');
  await antworteFalsch(seite);
  await antworteFalsch(seite);
  await knopf.click();
  for (let karte = 2; karte <= 15; karte += 1) {
    await antworteRichtig(seite);
    await knopf.click();
  }

  // Erst die Zwischenseite. Ohne sie liefe die Wiederholung unbemerkt an.
  await expect(seite.locator('#zwischen')).toBeVisible();
  await expect(seite.locator('#zwischen-titel')).toHaveText('Die Runde ist durch!');
  await expect(seite.locator('#zwischen-text'))
    .toHaveText('Eine Karte hat noch Lernpotential. Die kommt jetzt noch einmal.');
  // Punkte und Note stehen hier bewusst NICHT: wer sie schon sieht, spielt
  // die Wiederholung nicht mehr ernsthaft.
  await expect(seite.locator('#note')).toBeHidden();

  await seite.locator('#zwischen-knopf').click();
  await expect(seite.locator('#zaehler')).toHaveText('Lernpotential 1 von 1');

  await antworteRichtig(seite);
  await knopf.click();

  // 14 von 15 Karten auf Anhieb -- die Wiederholung aendert die Note nicht mehr.
  await expect(seite.locator('#note')).toHaveText(NOTEN[14]);
  await expect(seite.locator('#punkte')).toHaveText('14 von 15 Punkten');
  await expect(seite.locator('#lernpotential'))
    .toHaveText('Lernpotential: alles noch einmal geübt und diesmal richtig!');
});

test('die Ergebnisliste steht erst da, wenn man sie aufklappt', async ({ page: seite }) => {
  await starte(seite, 'uebungsblatt');
  await spieleBisZumEnde(seite, { falschBei: [2] });

  const liste = seite.locator('#ergebnisse');
  const knopf = seite.locator('#ergebnisse-knopf');

  await expect(liste).toBeHidden();
  await expect(knopf).toHaveText('Ergebnisse ansehen');

  await knopf.click();
  await expect(liste).toBeVisible();
  await expect(knopf).toHaveText('Ergebnisse ausblenden');
  // Eine Zeile je Karte der ersten Runde -- die Wiederholung steht nicht
  // noch einmal darin.
  await expect(liste.locator('.ergebnis')).toHaveCount(15);
  await expect(liste.locator('.ergebnis--falsch')).toHaveCount(1);

  await knopf.click();
  await expect(liste).toBeHidden();
});

test('nach der Runde geht es ohne Umweg in die naechste', async ({ page: seite }) => {
  await starte(seite, 'arbeit');
  await spieleBisZumEnde(seite);

  await seite.locator('#ende [data-modus="uebungsblatt"]').click();

  await expect(seite.locator('#ende')).toBeHidden();
  await expect(seite.locator('#karte')).toBeVisible();
  expect(await zaehler(seite)).toMatchObject({ art: 'Karte', nummer: 1, gesamt: 15 });
});
