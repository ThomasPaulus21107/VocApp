// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import { stelleFormFrage, pruefeAntwort, zieheRunde, RICHTUNGEN } from './domain/pruefung.js';
import { note, punkteFuerKarte } from './domain/note.js';
import { regeln } from './domain/modus.js';
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
// Was auf jeder Karte passiert ist, in der Reihenfolge, in der sie drankamen.
// Am Ende wird daraus die Ergebnisliste -- und in der Arbeit ist das der
// einzige Ort, an dem die richtigen Wörter überhaupt auftauchen.
let ergebnisse = [];
// Die Regeln der laufenden Runde: Übungsblatt oder Arbeit. Sie werden beim
// Start einmal geholt und gelten dann für die ganze Runde.
let regel = regeln(null);

function start(modus) {
  regel = regeln(modus);
  stapel = zieheRunde(verben.karten, RUNDENGROESSE);
  index = 0;
  punkte = 0;
  ergebnisse = [];
  zeigeAktuelle();
}

function zeigeAktuelle() {
  versuch = 0;
  tippBenutzt = false;
  frage = stelleFormFrage(stapel[index], RICHTUNG);
  ui.zeigeKarte(frage, index + 1, stapel.length, regel.tippsErlaubt);
}

/**
 * Schreibt auf, wie die aktuelle Karte ausgegangen ist. `getippt` bleibt
 * leer, wenn es keine echte Antwort gab -- bei "s" und bei "keine Ahnung".
 */
function merkeErgebnis({ richtig, getippt, kartenpunkte }) {
  ergebnisse.push({
    frage: frage.frage,
    gesuchteForm: frage.gesuchteForm,
    erwartet: frage.antworten.join(' oder '),
    richtig,
    getippt,
    punkte: kartenpunkte,
  });
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
    merkeErgebnis({ richtig: false, getippt: null, kartenpunkte: 0 });
    weiter();
    return;
  }

  // "keine Ahnung" ist im Übungsblatt kein Fehlversuch: die Karte bleibt
  // stehen, es gibt Zuspruch, und der Versuch ist noch nicht verbraucht.
  // In der Arbeit ist auch das eine Antwort -- der Zuspruch kommt trotzdem,
  // er bleibt dann auf der nächsten Karte stehen.
  if (ergebnis.mutmachen) {
    if (regel.hilferufOhneFolgen) {
      ui.zeigeMutmacher();
      return;
    }
    merkeErgebnis({ richtig: false, getippt: null, kartenpunkte: 0 });
    weiter();
    ui.zeigeMutmacher();
    return;
  }

  if (ergebnis.richtig) {
    // Punkte gibt es nur hier: für eine falsche oder übersprungene Karte
    // wird gar nicht erst gezählt.
    const kartenpunkte = punkteFuerKarte({ versuch, tipp: tippBenutzt });
    punkte += kartenpunkte;
    merkeErgebnis({ richtig: true, getippt: null, kartenpunkte });

    // In der Arbeit erfährt man zwischendurch nichts, auch kein Lob.
    if (!regel.zeigtErgebnis) {
      weiter();
      return;
    }

    versuch = ERLEDIGT;
    ui.zeigeRichtig(frage.loesung, frage.gesuchteForm);
    return;
  }

  // Beim ersten Fehlversuch gibt es noch eine Chance, erst danach die Lösung.
  // In der Arbeit gibt es diese Chance nicht.
  if (regel.zweiterVersuch && versuch === 0) {
    versuch = 1;
    ui.zeigeKorrekturchance();
    return;
  }

  // Ab hier ist die Karte endgültig danebengegangen -- in beiden Modi.
  merkeErgebnis({ richtig: false, getippt: eingabe.trim(), kartenpunkte: 0 });

  // Falsch ist falsch: in der Arbeit ohne ein Wort, sofort zur nächsten Karte.
  if (!regel.zeigtErgebnis) {
    weiter();
    return;
  }

  versuch = ERLEDIGT;
  ui.zeigeFalsch(ergebnis.erwartet, frage.loesung, frage.gesuchteForm);
}

function weiter() {
  index += 1;
  if (index >= stapel.length) {
    // Die Höchstpunktzahl ist die Zahl der Karten -- eine Karte, ein Punkt.
    ui.zeigeEnde(note(punkte), punkte, stapel.length, ergebnisse);
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

// Kein start() beim Laden: zuerst steht die Wahl zwischen Übungsblatt und
// Arbeit auf dem Bildschirm, und die stößt die Runde an.
ui.verbinde({ aufAbsenden, aufStart: start, aufTipp });
