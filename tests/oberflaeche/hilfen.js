// Werkzeug fuer die Oberflaechen-Tests. Hier steht, wie man die App bedient;
// in den Tests selbst steht dann nur noch, was dabei herauskommen soll.

import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { FORM_NAME } from '../../src/ui/formnamen.js';

// Dieselbe Vokabeldatei, die auch die App liest. Der Test muss wissen, was
// richtig ist -- auf dem Bildschirm steht ja nur die Frage.
const verben = JSON.parse(
  readFileSync(new URL('../../data/unregelmaessige-verben.json', import.meta.url), 'utf8')
);

// Nachschlagewerk: deutsches Verb -> Karte. Die Frage zeigt immer den
// deutschen Infinitiv, und der kommt in der Datei nur einmal vor.
const KARTEN = new Map(
  verben.karten.map((karte) => [karte.formen.infinitive.de[0], karte])
);

// FORM_NAME andersherum: aus "simple past" wird wieder "simple-past".
const FORM_SCHLUESSEL = new Map(
  Object.entries(FORM_NAME).map(([schluessel, name]) => [name, schluessel])
);

// Etwas, das garantiert falsch ist. Kurze Eingaben waeren hier gefaehrlich:
// "s" ueberspringt die Karte, und im Uebungsblatt laesst die App einen
// Tippfehler durchgehen -- beides waere kein Fehlversuch.
export const FALSCH_GETIPPT = 'falschgetippt';

/** Oeffnet die Uebungsseite. Der Speicher ist leer -- wie beim ersten Mal. */
export async function oeffneUebung(seite) {
  await seite.goto('index.html');
  await expect(seite.locator('#start')).toBeVisible();
}

/** Startet eine Runde: 'uebungsblatt' oder 'arbeit'. */
export async function starte(seite, modus) {
  await seite.locator(`#start [data-modus="${modus}"]`).click();
  await expect(seite.locator('#karte')).toBeVisible();
}

/**
 * Was gerade auf der Karte steht: das deutsche Verb, die gesuchte Form und
 * das englische Wort, das die App als Antwort erwartet.
 */
export async function aktuelleKarte(seite) {
  const verb = (await seite.locator('#frage').textContent()).trim();
  const formName = (await seite.locator('#beiwort').textContent()).trim();

  const karte = KARTEN.get(verb);
  if (!karte) throw new Error(`Kein Verb "${verb}" in unregelmaessige-verben.json.`);

  const form = FORM_SCHLUESSEL.get(formName);
  if (!form) throw new Error(`Unbekannte Form "${formName}" auf der Karte "${verb}".`);

  return { verb, form, antwort: karte.formen[form].en[0] };
}

/** Zerlegt "Karte 3 von 15" oder "Lernpotential 1 von 2". */
export async function zaehler(seite) {
  const text = (await seite.locator('#zaehler').textContent()).trim();
  const [art, nummer, , gesamt] = text.split(' ');
  return { art, nummer: Number(nummer), gesamt: Number(gesamt), text };
}

/** Tippt die richtige Antwort auf die aktuelle Karte und schickt sie ab. */
export async function antworteRichtig(seite) {
  const karte = await aktuelleKarte(seite);
  await seite.locator('#eingabe').fill(karte.antwort);
  await seite.locator('#knopf').click();
  return karte;
}

/** Tippt absichtlich daneben und schickt ab. */
export async function antworteFalsch(seite) {
  const karte = await aktuelleKarte(seite);
  await seite.locator('#eingabe').fill(FALSCH_GETIPPT);
  await seite.locator('#knopf').click();
  return karte;
}

/**
 * Spielt die angefangene Runde bis zum Ergebnis durch.
 *
 * `falschBei` sind die Kartennummern der ersten Runde, auf denen absichtlich
 * daneben getippt wird. So entsteht eine Lernpotential-Runde, ohne dass der
 * Test auf sein Glueck angewiesen waere.
 */
export async function spieleBisZumEnde(seite, { falschBei = [] } = {}) {
  const knopf = seite.locator('#knopf');
  const ende = seite.locator('#ende');
  const zwischen = seite.locator('#zwischen');

  // Eine Runde hat 15 Karten, dazu hoechstens 15 Wiederholungen und je Karte
  // zwei Versuche und einen Weiter-Klick. 200 Schritte sind keine Regel der
  // App, sondern eine Reissleine: bleibt sie stehen, soll der Test das sagen
  // und nicht ewig weiterklicken.
  for (let schritt = 0; schritt < 200; schritt += 1) {
    if (await ende.isVisible()) return;

    if (await zwischen.isVisible()) {
      await seite.locator('#zwischen-knopf').click();
      continue;
    }

    // Eine beantwortete Karte: aus "Pruefen" ist "Weiter" geworden, und
    // derselbe Knopf bringt die naechste.
    if ((await knopf.textContent()) === 'Weiter') {
      await knopf.click();
      continue;
    }

    const stand = await zaehler(seite);
    // In der Wiederholung wird immer richtig geantwortet -- `falschBei` meint
    // die Karten der ersten Runde.
    if (stand.art === 'Karte' && falschBei.includes(stand.nummer)) {
      await antworteFalsch(seite);
    } else {
      await antworteRichtig(seite);
    }
  }

  throw new Error('Die Runde ist nach 200 Schritten nicht am Ergebnis angekommen.');
}

/**
 * Alle Elemente, die das hidden-Attribut tragen und trotzdem gezeichnet
 * werden. Ist die Liste leer, ist alles in Ordnung -- steht etwas darin,
 * hat eine display-Angabe das Attribut ueberstimmt.
 */
export function trotzdemSichtbar(seite) {
  return seite.evaluate(() =>
    [...document.querySelectorAll('[hidden]')]
      .filter((knoten) => getComputedStyle(knoten).display !== 'none')
      .map((knoten) => knoten.id || knoten.className || knoten.tagName)
  );
}

/** Oeffnet die Lade an der rechten Seite. */
export async function oeffneMenue(seite) {
  await seite.locator('#menue-knopf').click();
  await expect(seite.locator('#menue')).toBeVisible();
}
