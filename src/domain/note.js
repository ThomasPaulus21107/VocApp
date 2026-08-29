// Aus einer gespielten Runde wird eine Schulnote.
// Wie alles in domain/: reine Regeln, kein DOM, kein Speichern, kein Zufall.

/**
 * Die Punkteskala der Oberstufe. Der Index ist die Punktzahl:
 * NOTEN[15] ist die beste Note, NOTEN[0] die schlechteste.
 *
 * Die Tabelle steht als Liste da und wird nicht gerechnet -- sie ist kurz
 * genug, um sie hinzuschreiben, und der Test prüft sie vollständig.
 * Sie passt nur, solange eine Runde 15 Karten hat: eine Karte, ein Punkt.
 */
export const NOTEN = [
  '6',   //  0 Punkte
  '5−',  //  1
  '5',   //  2
  '5+',  //  3
  '4−',  //  4
  '4',   //  5
  '4+',  //  6
  '3−',  //  7
  '3',   //  8
  '3+',  //  9
  '2−',  // 10
  '2',   // 11
  '2+',  // 12
  '1−',  // 13
  '1',   // 14
  '1+',  // 15
];

// Auf Anhieb richtig ist ein ganzer Punkt.
export const PUNKTE_ERSTER_VERSUCH = 1;

// Im zweiten Versuch gibt es den halben: gewusst hat sie es, aber nicht sofort.
export const PUNKTE_ZWEITER_VERSUCH = 0.5;

// Ein Tipp kostet ein Zehntel. Wenig genug, dass man ihn benutzen darf,
// ohne dass die Note davon umkippt.
export const ABZUG_TIPP = 0.1;

// Ein durchgelassener Tippfehler kostet zwei Zehntel -- doppelt so viel wie
// ein Tipp. Die Vokabel saß, die Schreibweise nicht, und beides gehört zum
// Wort. Der Abzug gibt es nur im Übungsblatt: in der Arbeit ist ein
// Tippfehler gar nicht erst richtig.
export const ABZUG_TIPPFEHLER = 0.2;

/**
 * Was eine RICHTIG beantwortete Karte einbringt.
 * `versuch` ist 0 beim ersten Anlauf und 1 nach der Korrekturchance.
 * Eine falsche oder übersprungene Karte bringt nichts -- für die wird diese
 * Funktion gar nicht erst gefragt.
 *
 * Die Abzüge summieren sich: wer einen Tipp holt und dann auch noch
 * verschreibt, bekommt beide abgezogen.
 */
export function punkteFuerKarte({ versuch, tipp, tippfehler = false }) {
  const grundwert = versuch === 0 ? PUNKTE_ERSTER_VERSUCH : PUNKTE_ZWEITER_VERSUCH;
  const abzug = (tipp ? ABZUG_TIPP : 0) + (tippfehler ? ABZUG_TIPPFEHLER : 0);

  // Unter null geht es nicht: die Abzüge machen eine Karte höchstens wertlos.
  return Math.max(0, grundwert - abzug);
}

/**
 * Die Note zu einer Punktzahl. Weil Tipps Zehntel abziehen, kommen hier
 * krumme Zahlen an -- gerundet wird kaufmännisch, 12,5 wird also zur 13.
 * Deshalb verdirbt ein einzelner Tipp keine sonst perfekte Runde.
 */
export function note(punkte) {
  const gerundet = Math.round(punkte);
  const inDerTabelle = Math.min(Math.max(gerundet, 0), NOTEN.length - 1);
  return NOTEN[inDerTabelle];
}
