// Welche Karten in der naechsten Runde drankommen.
// Wie alles in domain/: reine Regeln, kein DOM, kein Speichern, kein Zufall
// von innen -- er wird hereingereicht, damit der Test das Ergebnis kennt.
//
// Vorher zog zieheRunde() in pruefung.js reinen Zufall: mischen, die ersten
// 15 nehmen. Bei 53 Verben und 15 Karten dauerte es im Schnitt SECHZEHN
// Runden, bis jedes Verb einmal dran war. Nach fuenf Runden -- etwa eine
// Woche Ueben -- waren im Schnitt zehn Verben noch nie zu sehen gewesen.

import { ABGEFRAGTE_FORMEN, hatFormen } from './pruefung.js';

/**
 * Der Name, unter dem eine Einheit gemerkt wird.
 *
 * Die Einheit ist Karte PLUS Form, nicht die Karte: "to write" kann im
 * simple past sitzen und im Partizip nicht. Eine normale Vokabel hat keine
 * Formen, dort ist der Name einfach die id.
 */
export function schluessel(id, form) {
  return form ? `${id}|${form}` : id;
}

/** Jede Karte in ihre abfragbaren Einheiten zerlegt. */
function einheiten(karten) {
  return karten.flatMap((karte) =>
    hatFormen(karte)
      ? ABGEFRAGTE_FORMEN.map((form) => ({ karte, form }))
      : [{ karte, form: null }]
  );
}

/**
 * Zieht eine Runde: die Einheiten, die am laengsten nicht dran waren, bei
 * Gleichstand gewuerfelt.
 *
 * `zuletzt` bildet den Namen einer Einheit auf die Rundennummer ab, in der
 * sie zuletzt dran war. Was nicht darin steht, war noch nie dran und gilt
 * als am aeltesten.
 *
 * Deshalb ist die Abdeckung keine Sonderregel, sondern faellt aus der
 * Sortierung: bei 53 Verben und 15 Karten war nach VIER Runden jedes Verb
 * einmal dran, nach acht jede Karte-Form-Einheit.
 *
 * Eine Karte kommt in einer Runde hoechstens einmal vor, auch wenn zwei
 * ihrer Formen lange warten. Zwei Gruende: die Runde soll sich abwechslungs-
 * reich anfuehlen, und der Merkzettel der Lernpotential-Runde fuehrt je
 * Karte genau einen Eintrag.
 *
 * Spaeter kommt in den Sortierschluessel die Schwierigkeit dazu (Stufe 2 in
 * roadmap/feature-request-auswahl.md). Das ist ein Summand mehr, kein Umbau.
 */
export function zieheRunde(karten, anzahl, zuletzt = {}, rundeNr = 0, zufall = Math.random) {
  const alle = einheiten(karten);

  // Wie lange ist eine KARTE nicht mehr drangewesen -- egal in welcher Form?
  // Das ist der wichtigere der beiden Werte, siehe die Sortierung unten.
  const kartenAlter = new Map();
  for (const { karte, form } of alle) {
    const gesehen = zuletzt[schluessel(karte.id, form)] ?? -1;
    kartenAlter.set(karte.id, Math.max(kartenAlter.get(karte.id) ?? -1, gesehen));
  }

  const bewertet = alle.map((einheit) => ({
    ...einheit,
    // Noch nie dran gewesen zaehlt als -1, ist also immer aelter als alles,
    // was schon einmal drankam.
    alter: rundeNr - (zuletzt[schluessel(einheit.karte.id, einheit.form)] ?? -1),
    kartenAlter: rundeNr - kartenAlter.get(einheit.karte.id),
    wuerfel: zufall(),
  }));

  // Zwei Stufen, und die Reihenfolge ist der ganze Trick.
  //
  // ZUERST die laengst nicht gesehene KARTE. Sortierte man nur nach der
  // Einheit, wuerde die noch ungefragte zweite Form einer eben gezogenen
  // Karte genauso alt aussehen wie ein Verb, das noch NIE dran war -- beide
  // stehen ja nicht im Merkzettel. Dann rutschen ganze Verben durch, und
  // genau das sollte hier aufhoeren.
  //
  // DANN innerhalb der Karte die Form, die am laengsten wartet. So kommt
  // nach vier Runden jedes Verb einmal dran und nach acht jede seiner Formen.
  //
  // ZULETZT der Wuerfel. In der allerersten Runde ist alles gleich alt --
  // dann ist es reiner Zufall, genau wie vorher.
  bewertet.sort((a, b) =>
    b.kartenAlter - a.kartenAlter || b.alter - a.alter || a.wuerfel - b.wuerfel
  );

  const gezogen = [];
  const schonDabei = new Set();
  for (const eintrag of bewertet) {
    if (gezogen.length === anzahl) break;
    if (schonDabei.has(eintrag.karte.id)) continue;

    schonDabei.add(eintrag.karte.id);
    gezogen.push({ karte: eintrag.karte, form: eintrag.form });
  }
  return gezogen;
}

/**
 * Schreibt die gezogenen Einheiten auf die aktuelle Rundennummer fort.
 * Rein kommt der alte Stand, raus ein neuer -- das alte Objekt bleibt, wie
 * es war.
 */
export function merke(zuletzt, rundeNr, gezogen) {
  const neu = { ...zuletzt };
  for (const { karte, form } of gezogen) {
    neu[schluessel(karte.id, form)] = rundeNr;
  }
  return neu;
}
