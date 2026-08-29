// Geuebt wird auf Matildas iPhone. Das ist seit dem 29.08.2026 eine
// Randbedingung und keine Nebensache -- also wird auch dort getestet:
// alle Tests dieser Sorte laufen auf 390 px in WebKit, der Maschine hinter
// Safari (siehe playwright.config.js).
//
// Diese Datei prueft, was nur auf einem Telefon schiefgehen kann.

import { test, expect } from '@playwright/test';
import { oeffneUebung, starte, spieleBisZumEnde, oeffneMenue } from './hilfen.js';

// Ueber der offenen Tastatur bleiben auf dem Geraet rund 350 px. Was zum
// Antworten gebraucht wird -- Frage, Feld und Knopf -- muss dort hineinpassen,
// sonst tippt man auf etwas, das man nicht sieht.
const PLATZ_UEBER_TASTATUR = 350;

// Unter 16 px zoomt iOS beim Antippen ins Eingabefeld hinein und die Seite
// steht danach schief. Das ist kein Geschmack, das ist eine Safari-Regel.
const KLEINSTE_SCHRIFT_OHNE_ZOOM = 16;

/** Wie weit die Seite ueber den Bildschirmrand hinausragt. Null ist richtig. */
function ueberstand(seite) {
  return seite.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

for (const seitenname of ['index.html', 'fortschritt.html', 'fleiss.html']) {
  test(`${seitenname} laesst sich nicht seitlich schieben`, async ({ page: seite }) => {
    await seite.goto(seitenname);
    expect(await ueberstand(seite)).toBe(0);
  });
}

test('auch mit Karte, Ergebnis und offenem Menue bleibt es bei der Breite', async ({ page: seite }) => {
  await oeffneUebung(seite);
  expect(await ueberstand(seite)).toBe(0);

  await starte(seite, 'uebungsblatt');
  expect(await ueberstand(seite)).toBe(0);

  await oeffneMenue(seite);
  expect(await ueberstand(seite)).toBe(0);
  await seite.keyboard.press('Escape');

  // Die laengste Zeile der App: drei Formen nebeneinander in einer
  // Grid-Spalte je Form.
  await spieleBisZumEnde(seite, { falschBei: [1] });
  expect(await ueberstand(seite)).toBe(0);

  await seite.locator('#ergebnisse-knopf').click();
  expect(await ueberstand(seite)).toBe(0);
});

test('Frage, Feld und Knopf passen ueber die Tastatur', async ({ page: seite }) => {
  await oeffneUebung(seite);
  await starte(seite, 'uebungsblatt');

  const oben = await seite.locator('#frage').boundingBox();
  const unten = await seite.locator('#knopf').boundingBox();
  const hoehe = unten.y + unten.height - oben.y;

  expect(hoehe).toBeLessThanOrEqual(PLATZ_UEBER_TASTATUR);
});

test('das Eingabefeld ist gross genug, dass iOS nicht hineinzoomt', async ({ page: seite }) => {
  await oeffneUebung(seite);
  await starte(seite, 'uebungsblatt');

  const schriftgroesse = await seite.locator('#eingabe').evaluate(
    (feld) => parseFloat(getComputedStyle(feld).fontSize)
  );
  expect(schriftgroesse).toBeGreaterThanOrEqual(KLEINSTE_SCHRIFT_OHNE_ZOOM);
});

test('die Knoepfe sind gross genug zum Treffen', async ({ page: seite }) => {
  await oeffneUebung(seite);

  // Apple nennt 44 px als kleinste Flaeche, die ein Finger zuverlaessig
  // trifft. Darunter tippt man daneben.
  for (const knopf of await seite.locator('#start [data-modus]').all()) {
    const kasten = await knopf.boundingBox();
    expect(kasten.height).toBeGreaterThanOrEqual(44);
  }

  await starte(seite, 'uebungsblatt');
  const pruefen = await seite.locator('#knopf').boundingBox();
  expect(pruefen.height).toBeGreaterThanOrEqual(44);
});

test('die drei Faecher stehen auf dem Telefon untereinander', async ({ page: seite }) => {
  await oeffneUebung(seite);
  await starte(seite, 'uebungsblatt');
  await spieleBisZumEnde(seite);
  await seite.goto('fortschritt.html');

  // Drei Spalten auf 390 px waeren drei Spalten, in die nichts passt.
  const faecher = await seite.locator('#faecher .fach').all();
  expect(faecher).toHaveLength(3);

  const kaesten = await Promise.all(faecher.map((fach) => fach.boundingBox()));
  expect(kaesten[0].x).toBe(kaesten[1].x);
  expect(kaesten[1].y).toBeGreaterThan(kaesten[0].y + kaesten[0].height - 1);
  expect(kaesten[2].y).toBeGreaterThan(kaesten[1].y + kaesten[1].height - 1);
});
