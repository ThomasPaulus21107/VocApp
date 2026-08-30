// Welche Karten in der naechsten Runde drankommen.
// Wie alles in domain/: reine Regeln, kein DOM, kein Speichern, kein Zufall
// von innen -- er wird hereingereicht, damit der Test das Ergebnis kennt.
//
// Vorher zog zieheRunde() in pruefung.js reinen Zufall: mischen, die ersten
// 15 nehmen. Bei 53 Verben und 15 Karten dauerte es im Schnitt SECHZEHN
// Runden, bis jedes Verb einmal dran war. Nach fuenf Runden -- etwa eine
// Woche Ueben -- waren im Schnitt zehn Verben noch nie zu sehen gewesen.

import { ABGEFRAGTE_FORMEN, hatFormen } from './pruefung.js';
// Der Name einer Einheit gehoert dorthin, wo gemerkt wird.
import { schluessel } from './lernstand.js';

/**
 * Jede Karte in ihre abfragbaren Einheiten zerlegt. Auch die
 * Fortschrittsseite fragt danach -- sie will wissen, wie viele es ueberhaupt
 * gibt, und soll dafuer nicht dieselbe Rechnung noch einmal aufschreiben.
 */
export function einheiten(karten) {
  return karten.flatMap((karte) =>
    hatFormen(karte)
      ? ABGEFRAGTE_FORMEN.map((form) => ({ karte, form }))
      : [{ karte, form: null }]
  );
}

/* =========================================================
   WIE SICH EINE RUNDE ZUSAMMENSETZT, MATILDA
   Links das Fach, rechts wie viele davon in eine Runde
   kommen. Zusammen sind es fuenfzehn.

   'nie'    -- die Vokabel war noch nie dran
   'arbeit' -- schon geuebt, sitzt aber noch nicht
   'sicher' -- stabil gelernt

   Wenn ein Fach nicht genug hergibt, gehen die freien
   Plaetze weiter -- in der Reihenfolge darunter.

   Am 30.08.2026 geaendert: 'sicher' hatte drei Plaetze und
   hat jetzt einen. Was sitzt, muss nicht dreimal die Woche
   vorgefuehrt werden -- die zwei Plaetze sind zu 'nie' und
   'arbeit' gewandert, dorthin, wo etwas zu holen ist.
   ========================================================= */
export const QUOTE = {
  nie: 6,
  arbeit: 8,
  sicher: 1,
};

/* ---------------------------------------------------------
   UND WIE DIE ACHT AUS 'arbeit' AUSGESUCHT WERDEN

   Nicht nach Alter wie in den anderen beiden Faechern,
   sondern nach der Punktsumme: alle bisherigen Ergebnisse
   einer Vokabel zu einer Zahl zusammengerechnet
   (summenVon() in lernstand.js). Sie traegt beides in sich,
   wie gut es lief und wie oft.

   Sechs Plaetze sind benannt, in dieser Reihenfolge:

     top1   die hoechste Summe -- laeuft gut, sitzt aber noch nicht
     last1  die niedrigste    -- die haerteste Vokabel
     mid1   die Mitte
     top2   die zweithoechste
     last2  die zweitniedrigste
     mid2   neben der Mitte

   Die restlichen zwei werden aus dem Fach gewuerfelt.

   ACHTUNG, und das faellt erst nach ein paar Wochen auf:
   die Summe waechst mit jeder Antwort und schrumpft fast
   nie. Wer oben steht, steht morgen wieder oben -- die
   benannten Plaetze zeigen also ueber Runden hinweg oft
   dieselben Vokabeln. Genau dagegen halten die beiden
   gewuerfelten und das Fach 'nie'.
   --------------------------------------------------------- */
const BENANNT = 6;

// In dieser Reihenfolge werden die Faecher bedient, und in derselben ruecken
// sie nach, wenn eines nicht liefert: zuerst die noch nie geuebten, dann die
// in Arbeit, zuletzt die stabilen.
const REIHENFOLGE = ['nie', 'arbeit', 'sicher'];

/**
 * Bringt das Fach 'arbeit' in seine Reihenfolge: erst die sechs benannten
 * Plaetze, dann der Rest gewuerfelt.
 *
 * Rein und ohne Netz wie alles hier -- der Zufall kommt als Argument.
 *
 * Die Indizes koennen zusammenfallen, wenn das Fach klein ist: bei drei
 * Eintraegen ist top1 zugleich last2. Das Set faengt es ab, und die Runde
 * laeuft dann eben mit weniger benannten Plaetzen voll. Ein Sonderfall ist
 * das nicht, nur ein kleines Fach.
 */
function nachPunkten(korb, summen, zufall) {
  const sortiert = [...korb].sort((a, b) =>
    (summen[schluessel(b.karte.id, b.form)] ?? 0)
    - (summen[schluessel(a.karte.id, a.form)] ?? 0)
    || a.wuerfel - b.wuerfel
  );

  const n = sortiert.length;
  const mitte = Math.floor((n - 1) / 2);
  // top1, last1, mid1, top2, last2, mid2 -- in genau dieser Reihenfolge.
  const stellen = [0, n - 1, mitte, 1, n - 2, mitte + 1].slice(0, BENANNT);

  const genommen = new Set();
  const reihe = [];
  for (const stelle of stellen) {
    if (stelle < 0 || stelle >= n || genommen.has(stelle)) continue;
    genommen.add(stelle);
    reihe.push(sortiert[stelle]);
  }

  // Der Rest gewuerfelt -- er hat seinen Wurf schon in `wuerfel` stehen.
  const rest = sortiert
    .filter((_, stelle) => !genommen.has(stelle))
    .sort((a, b) => a.wuerfel - b.wuerfel);

  return [...reihe, ...rest];
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
 * roadmap/implemented/feature-auswahl-2026-08-29-1327.md). Das ist ein Summand mehr, kein Umbau.
 */
export function zieheRunde(karten, anzahl, zuletzt = {}, rundeNr = 0, zufall = Math.random, faecher = {}, summen = {}) {
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

  // Drei Koerbe in der Reihenfolge von oben. Was `faecher` nicht kennt, war
  // noch nie dran -- der Lernstand weiss ja nur von dem, was schon lief.
  const koerbe = { nie: [], arbeit: [], sicher: [] };
  for (const eintrag of bewertet) {
    const name = schluessel(eintrag.karte.id, eintrag.form);
    koerbe[faecher[name] ?? 'nie'].push(eintrag);
  }

  // 'nie' und 'sicher' bleiben nach Alter sortiert. 'arbeit' bekommt seine
  // eigene Reihenfolge -- danach nimmt nimm() von vorn wie ueberall sonst.
  koerbe.arbeit = nachPunkten(koerbe.arbeit, summen, zufall);

  const gezogen = [];
  const schonDabei = new Set();

  /**
   * Nimmt bis zu `platz` Einheiten aus einem Fach und sagt, wie viele es
   * wirklich wurden. Eine Karte, die schon dabei ist, wird uebersprungen und
   * ist damit auch fuer die spaeteren Faecher verbraucht.
   */
  function nimm(fach, platz) {
    let genommen = 0;

    while (genommen < platz && koerbe[fach].length > 0) {
      const eintrag = koerbe[fach].shift();
      if (schonDabei.has(eintrag.karte.id)) continue;

      schonDabei.add(eintrag.karte.id);
      gezogen.push({ karte: eintrag.karte, form: eintrag.form });
      genommen += 1;
    }
    return genommen;
  }

  // Erst bekommt jedes Fach sein Kontingent.
  let frei = anzahl;
  for (const fach of REIHENFOLGE) frei -= nimm(fach, Math.min(QUOTE[fach], frei));

  // Dann gehen die uebrigen Plaetze noch einmal durch dieselbe Reihenfolge.
  // So laeuft die Runde auch dann voll, wenn ein Fach leer ist -- am Anfang
  // ist das 'sicher', am Ende sind es 'nie' und 'arbeit'.
  for (const fach of REIHENFOLGE) {
    if (frei <= 0) break;
    frei -= nimm(fach, frei);
  }

  return gezogen;
}
