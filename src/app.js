// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import vokabeln from '../data/vokabeln.json';
import { stelleFrage, pruefeAntwort, mische, RICHTUNGEN } from './domain/pruefung.js';
import * as ui from './ui/ui.js';

let richtung = RICHTUNGEN.NACH_DE;
let stapel = [];
let frage = null;
let index = 0;
let beantwortet = false;

function start() {
  stapel = mische(vokabeln.karten);
  index = 0;
  zeigeAktuelle();
}

function zeigeAktuelle() {
  beantwortet = false;
  frage = stelleFrage(stapel[index], richtung);
  ui.zeigeKarte(frage, richtung, index + 1, stapel.length);
}

// Ein Knopf, zwei Bedeutungen: erst prüfen, dann weiter.
function aufAbsenden(eingabe) {
  if (beantwortet) {
    weiter();
    return;
  }

  const ergebnis = pruefeAntwort(eingabe, frage);
  ui.zeigeErgebnis(ergebnis);

  // Bei leerer Eingabe bleiben wir auf derselben Karte.
  if (!ergebnis.leer) {
    beantwortet = true;
  }
}

function weiter() {
  index += 1;
  if (index >= stapel.length) {
    ui.zeigeEnde(stapel.length);
    return;
  }
  zeigeAktuelle();
}

// Richtung wechseln startet eine frische Runde -- sonst stünde man
// mitten im Stapel plötzlich vor der anderen Sprache.
function aufRichtungswechsel(neueRichtung) {
  richtung = neueRichtung;
  start();
}

function aufTipp() {
  if (frage.hinweis) ui.zeigeTipp(frage.hinweis);
}

ui.verbinde({ aufAbsenden, aufNeustart: start, aufRichtungswechsel, aufTipp });
start();
