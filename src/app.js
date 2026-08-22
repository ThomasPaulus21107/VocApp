// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import { stelleFormFrage, pruefeAntwort, zieheRunde, RICHTUNGEN } from './domain/pruefung.js';
import { note, punkteFuerKarte } from './domain/note.js';
import * as ui from './ui/ui.js';

// Vorerst nur unregelmäßige Verben, und nur in eine Richtung: das deutsche
// Verb steht da, getippt wird die englische Form.
//
// 15 Karten, weil jede Karte einen Punkt wert ist und die Punkteskala der
// Oberstufe bei 15 endet. Wer die Rundengröße ändert, muss die Notentabelle
// in domain/note.js mitändern -- die beiden hängen zusammen.
const RUNDENGROESSE = 15;
const RICHTUNG = RICHTUNGEN.NACH_EN;

// 0 = erster Versuch, 1 = Korrekturchance, 2 = erledigt
const ERLEDIGT = 2;

let stapel = [];
let frage = null;
let index = 0;
let versuch = 0;
let punkte = 0;
let tippBenutzt = false;

function start() {
  stapel = zieheRunde(verben.karten, RUNDENGROESSE);
  index = 0;
  punkte = 0;
  zeigeAktuelle();
}

function zeigeAktuelle() {
  versuch = 0;
  tippBenutzt = false;
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
    // Punkte gibt es nur hier: für eine falsche oder übersprungene Karte
    // wird gar nicht erst gezählt.
    punkte += punkteFuerKarte({ versuch, tipp: tippBenutzt });
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
    // Die Höchstpunktzahl ist die Zahl der Karten -- eine Karte, ein Punkt.
    ui.zeigeEnde(note(punkte), punkte, stapel.length);
    return;
  }
  zeigeAktuelle();
}

function aufTipp() {
  if (!frage.hinweis) return;

  // Der Tipp kostet ein Zehntel. Gemerkt wird das hier, abgezogen erst,
  // wenn die Karte auch richtig beantwortet wird.
  tippBenutzt = true;
  ui.zeigeTipp(frage.hinweis);
}

ui.verbinde({ aufAbsenden, aufNeustart: start, aufTipp });
start();
