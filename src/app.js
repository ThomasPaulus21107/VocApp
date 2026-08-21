// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import { stelleFormFrage, pruefeAntwort, zieheRunde, RICHTUNGEN } from './domain/pruefung.js';
import * as ui from './ui/ui.js';

// Vorerst nur unregelmäßige Verben, und nur in eine Richtung: das deutsche
// Verb steht da, getippt wird die englische Form.
const RUNDENGROESSE = 20;
const RICHTUNG = RICHTUNGEN.NACH_EN;

// 0 = erster Versuch, 1 = Korrekturchance, 2 = erledigt
const ERLEDIGT = 2;

let stapel = [];
let frage = null;
let index = 0;
let versuch = 0;

function start() {
  stapel = zieheRunde(verben.karten, RUNDENGROESSE);
  index = 0;
  zeigeAktuelle();
}

function zeigeAktuelle() {
  versuch = 0;
  frage = stelleFormFrage(stapel[index], RICHTUNG);
  ui.zeigeKarte(frage, index + 1, stapel.length);
}

// Ein Knopf, zwei Bedeutungen: erst prüfen, dann weiter.
function aufAbsenden(eingabe) {
  if (versuch === ERLEDIGT) {
    weiter();
    return;
  }

  const ergebnis = pruefeAntwort(eingabe, frage);

  // Bei leerer Eingabe bleiben wir auf derselben Karte, ohne einen Versuch
  // zu verbrauchen.
  if (ergebnis.leer) {
    ui.zeigeLeer();
    return;
  }

  // "s" überspringt die Karte -- ohne Lösung, direkt zur nächsten.
  if (ergebnis.springen) {
    weiter();
    return;
  }

  // "keine Ahnung" ist kein Fehlversuch: die Karte bleibt stehen, es gibt
  // Zuspruch, und der Versuch ist noch nicht verbraucht.
  if (ergebnis.mutmachen) {
    ui.zeigeMutmacher();
    return;
  }

  if (ergebnis.richtig) {
    versuch = ERLEDIGT;
    ui.zeigeRichtig(frage.loesung, frage.gesuchteForm);
    return;
  }

  // Beim ersten Fehlversuch gibt es noch eine Chance, erst danach die Lösung.
  if (versuch === 0) {
    versuch = 1;
    ui.zeigeKorrekturchance();
    return;
  }

  versuch = ERLEDIGT;
  ui.zeigeFalsch(ergebnis.erwartet, frage.loesung, frage.gesuchteForm);
}

function weiter() {
  index += 1;
  if (index >= stapel.length) {
    ui.zeigeEnde(stapel.length);
    return;
  }
  zeigeAktuelle();
}

function aufTipp() {
  if (frage.hinweis) ui.zeigeTipp(frage.hinweis);
}

ui.verbinde({ aufAbsenden, aufNeustart: start, aufTipp });
start();
