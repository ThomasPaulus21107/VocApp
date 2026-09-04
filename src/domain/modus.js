// Wie streng eine Runde gespielt wird.
// Reine Regeln, kein DOM: hier steht nur, WAS in einem Modus gilt --
// nicht, wie es aussieht.

export const MODI = {
  // Üben: mit Tipps, mit zweiter Chance, mit Rückmeldung nach jeder Karte.
  UEBUNGSBLATT: 'uebungsblatt',
  // Ernstfall: eine Antwort, keine Hilfe, kein Zwischenstand.
  ARBEIT: 'arbeit',
};

/**
 * Die Unterschiede zwischen den beiden Modi, als Tabelle.
 * Wer einen dritten Modus will, schreibt hier eine Zeile dazu.
 *
 * tippsErlaubt       Gibt es den Tipp-Knopf? (Er kostet 0,1 Punkte.)
 * zweiterVersuch     Gibt es nach einem Fehler noch eine Chance? (0,5 Punkte)
 * zeigtErgebnis      Erfährt man nach jeder Karte, ob sie richtig war?
 * hilferufOhneFolgen Bleibt die Karte nach "keine Ahnung" offen?
 * lernpotential      Kommen falsche Karten am Ende noch einmal?
 * tippfehlerErlaubt  Zählt "writte" statt "write" als richtig?
 * bonus              Womit die Kartenpunkte für den LERNSTAND multipliziert
 *                    werden. Siehe BONUS_ARBEIT.
 */
// Was eine richtige Antwort in der Arbeit fuer den Lernstand mehr wert ist.
//
// Der Grund: in der Arbeit gibt es keinen Tipp, keine zweite Chance und keine
// Rueckmeldung. Wer eine Vokabel DORT trifft, kann sie -- das ist ein
// staerkerer Befund als dieselbe Vokabel im Uebungsblatt, und der Lernstand
// darf das wissen.
//
// NUR im Lernstand. Die Note der Runde bleibt bei 15 von 15 gedeckelt, sonst
// gaebe es 18 von 15 Punkten und eine Note besser als 1.
export const BONUS_ARBEIT = 1.2;

export const REGELN = {
  [MODI.UEBUNGSBLATT]: {
    tippsErlaubt: true,
    zweiterVersuch: true,
    zeigtErgebnis: true,
    hilferufOhneFolgen: true,
    lernpotential: true,
    tippfehlerErlaubt: true,
    bonus: 1,
  },
  [MODI.ARBEIT]: {
    tippsErlaubt: false,
    zweiterVersuch: false,
    zeigtErgebnis: false,
    hilferufOhneFolgen: false,
    lernpotential: false,
    tippfehlerErlaubt: false,
    bonus: BONUS_ARBEIT,
  },
};

/**
 * Die Regeln zu einem Modus. Ein unbekannter Name ergibt das Übungsblatt --
 * im Zweifel wird geübt und nicht geprüft.
 */
export function regeln(modus) {
  return REGELN[modus] ?? REGELN[MODI.UEBUNGSBLATT];
}

/**
 * Was eine Karte dem LERNSTAND einbringt: die Punkte der Runde mal dem Bonus
 * des Modus.
 *
 * Auf zwei Stellen gerundet, weil 0,9 * 1,2 in Gleitkomma sonst
 * 1.0799999999999998 ergibt -- und diese Zahl landet so in Postgres.
 */
export function lernpunkte(kartenpunkte, modus) {
  return Math.round(kartenpunkte * regeln(modus).bonus * 100) / 100;
}
