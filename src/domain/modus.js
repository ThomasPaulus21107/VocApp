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
 */
export const REGELN = {
  [MODI.UEBUNGSBLATT]: {
    tippsErlaubt: true,
    zweiterVersuch: true,
    zeigtErgebnis: true,
    hilferufOhneFolgen: true,
    lernpotential: true,
  },
  [MODI.ARBEIT]: {
    tippsErlaubt: false,
    zweiterVersuch: false,
    zeigtErgebnis: false,
    hilferufOhneFolgen: false,
    lernpotential: false,
  },
};

/**
 * Die Regeln zu einem Modus. Ein unbekannter Name ergibt das Übungsblatt --
 * im Zweifel wird geübt und nicht geprüft.
 */
export function regeln(modus) {
  return REGELN[modus] ?? REGELN[MODI.UEBUNGSBLATT];
}
