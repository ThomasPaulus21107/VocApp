// Das Seitenmenue und die beiden Statistikseiten. Bis hierher hat kein Test
// je geschaut: fortschritt.html und fleiss.html haben eigene Einstiegspunkte,
// eigenen Zustand und auf der Fleiss-Seite auch eigenes Verhalten -- die
// Balken sind Knoepfe.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { einheiten } from '../../src/domain/auswahl.js';
import { SICHER_AB_ANTWORTEN, SICHER_AB_PROZENT } from '../../src/domain/lernstand.js';
import { oeffneUebung, starte, spieleBisZumEnde, oeffneMenue } from './hilfen.js';

const verben = JSON.parse(
  readFileSync(new URL('../../data/unregelmaessige-verben.json', import.meta.url), 'utf8')
);

// So viele Karte-Form-Einheiten gibt es ueberhaupt. Ausgerechnet und nicht
// hingeschrieben: sonst waere der Test rot, sobald Matilda ein Verb ergaenzt.
const ALLE_EINHEITEN = einheiten(verben.karten).length;

/** Spielt eine fehlerfreie Runde, damit die Statistikseiten etwas zu zeigen haben. */
async function uebeEineRunde(seite) {
  await oeffneUebung(seite);
  await starte(seite, 'uebungsblatt');
  await spieleBisZumEnde(seite);
  await expect(seite.locator('#ende')).toBeVisible();
}

test.describe('Das Seitenmenue', () => {
  for (const seitenname of ['index.html', 'fortschritt.html', 'fleiss.html']) {
    test(`geht auf ${seitenname} auf und wieder zu`, async ({ page: seite }) => {
      await seite.goto(seitenname);
      const menue = seite.locator('#menue');
      const knopf = seite.locator('#menue-knopf');

      await expect(menue).toBeHidden();
      await oeffneMenue(seite);
      await expect(knopf).toHaveAttribute('aria-expanded', 'true');
      // Der Fokus wandert mit, sonst ist die Lade eine Falle.
      await expect(seite.locator('#menue-zu')).toBeFocused();

      // Escape schliesst, wie bei jedem Overlay. Ohne das saesse man fest,
      // sobald die App ohne Adressleiste auf dem Homebildschirm laeuft.
      await seite.keyboard.press('Escape');
      await expect(menue).toBeHidden();
      await expect(knopf).toHaveAttribute('aria-expanded', 'false');
      await expect(knopf).toBeFocused();
    });
  }

  test('der Schatten schliesst die Lade auch', async ({ page: seite }) => {
    await seite.goto('index.html');
    const lade = await oeffneMenue(seite);

    // Nicht in die Mitte tippen. Der Schatten liegt ueber der ganzen Seite,
    // aber die offene Lade deckt auf 390 px alles rechts von x = 70 ab -- die
    // Mitte gehoert also der Lade und nicht dem Schatten. Getippt wird da, wo
    // ein Finger auch hinginge: auf den Streifen daneben.
    const kasten = await lade.boundingBox();
    expect(kasten.x).toBeGreaterThan(40);

    await seite.locator('#menue-schatten').click({ position: { x: 20, y: 300 } });
    await expect(seite.locator('#menue')).toBeHidden();
  });

  test('fuehrt vom Ueben zu beiden Statistikseiten und zurueck', async ({ page: seite }) => {
    await oeffneUebung(seite);

    await oeffneMenue(seite);
    await seite.locator('#menue a[href="fortschritt.html"]').click();
    await expect(seite.locator('h1')).toHaveText('Dein Fortschritt');

    await oeffneMenue(seite);
    await seite.locator('#menue a[href="fleiss.html"]').click();
    await expect(seite.locator('h1')).toHaveText('Dein Fleiß');

    // Der Weg zurueck steht auf jeder Statistikseite auch ohne Menue da --
    // auf dem Homebildschirm gibt es keine Adressleiste.
    await seite.locator('.zurueck').click();
    await expect(seite.locator('h1')).toHaveText('vocAPPulary.online');
  });

  test('der Abmelden-Knopf fuehrt zurueck ans Formular', async ({ page: seite }) => {
    // Und zwar von jeder Seite aus: der Abschnitt "Konto" steht in allen drei
    // HTML-Dateien und wird von derselben Datei verdrahtet.
    await oeffneUebung(seite);
    await oeffneMenue(seite);

    await expect(seite.locator('#menue-konto')).toBeVisible();
    await seite.locator('#menue-abmelden').click();

    await expect(seite).toHaveURL(/anmelden\.html$/);

    // Und zurueck geht es nicht: die Sitzung ist weg, der Waechter greift.
    await seite.goto('index.html');
    await expect(seite).toHaveURL(/anmelden\.html$/);
  });

  test('der Ton-Schalter merkt sich, wie er stand', async ({ page: seite }) => {
    await oeffneUebung(seite);
    await oeffneMenue(seite);

    const schalter = seite.locator('#toene');
    await expect(schalter).toBeChecked();
    await schalter.uncheck();

    await seite.reload();
    await oeffneMenue(seite);
    await expect(seite.locator('#toene')).not.toBeChecked();
  });
});

test.describe('Dein Fortschritt', () => {
  test('sagt vor der ersten Runde, dass es nichts zu zeigen gibt', async ({ page: seite }) => {
    await seite.goto('fortschritt.html');

    await expect(seite.locator('#leer')).toBeVisible();
    await expect(seite.locator('#ueberblick')).toBeHidden();
    await expect(seite.locator('#faecher')).toBeHidden();
  });

  test('zaehlt nach einer Runde fuenfzehn geuebte Formen', async ({ page: seite }) => {
    await uebeEineRunde(seite);
    await seite.goto('fortschritt.html');

    await expect(seite.locator('#leer')).toBeHidden();
    await expect(seite.locator('#ueberblick')).toBeVisible();

    await expect(seite.locator('#gesamt')).toHaveText(String(ALLE_EINHEITEN));
    await expect(seite.locator('#geuebt')).toHaveText('15');
    await expect(seite.locator('#runden')).toHaveText('1');
    await expect(seite.locator('#antworten')).toHaveText('15');
    await expect(seite.locator('#zuletzt')).toHaveText('heute');

    // Der Satz unter der grossen Zahl nennt beide Bedingungen fuer "stabil
    // gelernt", und beide Zahlen kommen aus dem Lernstand -- nicht aus dem
    // Markup. Wer sie dort aendert, aendert sie hier mit.
    await expect(seite.locator('.fortschritt__dazu')).toHaveText(
      `Formen sind stabil gelernt — mindestens ${SICHER_AB_ANTWORTEN}-mal `
      + `geübt und über ${SICHER_AB_PROZENT} % der möglichen Punkte getroffen`
    );

    // Eine Runde reicht nicht fuer "stabil gelernt": dafuer muss eine Form
    // mehrmals gesessen haben, nicht einmal.
    await expect(seite.locator('#sicher')).toHaveText('0');
    await expect(seite.locator('#lage'))
      .toHaveText(/^Noch ist keine einzige Form stabil gelernt\./);

    await expect(seite.locator('#menge-arbeit')).toHaveText('15');
    await expect(seite.locator('#menge-sicher')).toHaveText('0');
    await expect(seite.locator('#menge-nie')).toHaveText(String(ALLE_EINHEITEN - 15));
  });

  test('zeigt zehn Beispiele je Fach und den Rest auf Wunsch', async ({ page: seite }) => {
    await uebeEineRunde(seite);
    await seite.goto('fortschritt.html');

    const liste = seite.locator('#liste-arbeit li');
    const mehr = seite.locator('#mehr-arbeit');

    await expect(liste).toHaveCount(10);
    await expect(mehr).toHaveText('… und 5 weitere zeigen');

    await mehr.click();
    await expect(liste).toHaveCount(15);
    await expect(mehr).toBeHidden();
  });

  test('jede Vokabel klappt auf und zeigt, wann sie dran war', async ({ page: seite }) => {
    await uebeEineRunde(seite);
    await seite.goto('fortschritt.html');

    const erste = seite.locator('#liste-arbeit details').first();
    const verlauf = erste.locator('.fach__historie');

    await expect(verlauf).toBeHidden();
    await erste.locator('summary').click();

    await expect(verlauf).toBeVisible();
    // Eine Runde, eine Antwort, und die sass auf Anhieb.
    await expect(verlauf.locator('.fach__antwort')).toHaveCount(1);

    // Hinter der Antwort steht ein Punkt und keine Prozentzahl. Im
    // Uebungsblatt ist 1,0 das Hoechste, das dunkle Gruen bleibt der Arbeit
    // vorbehalten -- also Stufe 9 von 10.
    const punkt = verlauf.locator('.fach__punkt');
    await expect(punkt).toHaveClass(/fach__punkt--9/);
    // Die Zahl ist nicht weg, sie ist nur leise: fuer den Screenreader.
    await expect(punkt).toHaveAttribute('aria-label', '1 von 1,2 Punkten');
  });
});

test.describe('Dein Fleiss', () => {
  test('sagt vor der ersten Runde, dass es nichts zu zeigen gibt', async ({ page: seite }) => {
    await seite.goto('fleiss.html');

    await expect(seite.locator('#leer')).toBeVisible();
    await expect(seite.locator('#inhalt')).toBeHidden();
    await expect(seite.locator('#runden-karte')).toBeHidden();
  });

  test('zeigt nach einer Runde dreissig Tage und die Zahlen dazu', async ({ page: seite }) => {
    await uebeEineRunde(seite);
    await seite.goto('fleiss.html');

    await expect(seite.locator('#inhalt')).toBeVisible();
    await expect(seite.locator('#serie')).toHaveText('1');
    await expect(seite.locator('#tage')).toHaveText('1');
    await expect(seite.locator('#antworten')).toHaveText('15');
    await expect(seite.locator('#quote')).toHaveText('100 %');

    // Ein Balken je Tag -- auch an den Tagen, an denen nichts war.
    await expect(seite.locator('.diagramm__tag')).toHaveCount(30);
    // Nur der heutige Tag hat etwas zu zeigen.
    await expect(seite.locator('.diagramm__gesamt')).toHaveCount(1);
  });

  test('ein angetippter Balken erzaehlt, wie der Tag lief', async ({ page: seite }) => {
    await uebeEineRunde(seite);
    await seite.goto('fleiss.html');

    const gewaehlt = seite.locator('#gewaehlt');
    await expect(gewaehlt)
      .toHaveText('Tippe auf einen Balken, dann steht hier, wie der Tag lief.');

    const heute = seite.locator('.diagramm__tag').last();
    await heute.click();

    await expect(gewaehlt).toHaveText(/15 Antworten, 100 % davon richtig$/);
    await expect(heute).toHaveClass(/diagramm__tag--gewaehlt/);

    // Ein Tag ohne Ueben sagt das auch, statt stumm zu bleiben.
    const gestern = seite.locator('.diagramm__tag').nth(28);
    await gestern.click();
    await expect(gewaehlt).toHaveText(/nichts geübt$/);
    await expect(heute).not.toHaveClass(/diagramm__tag--gewaehlt/);
  });

  test('listet die gespielte Runde einzeln auf', async ({ page: seite }) => {
    await uebeEineRunde(seite);
    await seite.goto('fleiss.html');

    await expect(seite.locator('#runden-karte')).toBeVisible();
    await expect(seite.locator('.runde')).toHaveCount(1);
    await expect(seite.locator('.runde__zahlen')).toHaveText('Übungsblatt · 15 · 100 %');
    await expect(seite.locator('.runde__wann')).toHaveText(/^\d\d\.\d\d\. um \d\d:\d\d$/);
  });

  test('eine Arbeit steht als Arbeit in der Liste', async ({ page: seite }) => {
    await oeffneUebung(seite);
    await starte(seite, 'arbeit');
    await spieleBisZumEnde(seite);
    await seite.goto('fleiss.html');

    await expect(seite.locator('.runde__zahlen')).toHaveText('Arbeit · 15 · 100 %');
  });
});
