// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import vokabeln from '../data/vokabeln.json';
import verben from '../data/unregelmaessige-verben.json';
import {
  stelleFrage, stelleFormFrage, hatFormen, pruefeAntwort, mische, RICHTUNGEN,
} from './domain/pruefung.js';
import * as ui from './ui/ui.js';

// Beide Listen kommen in einen gemeinsamen Stapel. Auswählen, welche Liste
// geübt wird, kommt in einem späteren Sprint.
const alleKarten = [...vokabeln.karten, ...verben.karten];

let richtung = RICHTUNGEN.NACH_DE;
let stapel = [];
let frage = null;
let index = 0;
let beantwortet = false;

function start() {
  stapel = mische(alleKarten);
  index = 0;
  zeigeAktuelle();
}

// Unregelmäßige Verben werden anders gefragt: drei Formen, eine davon leer.
function zeigeAktuelle() {
  beantwortet = false;
  const karte = stapel[index];
  frage = hatFormen(karte)
    ? stelleFormFrage(karte, richtung)
    : stelleFrage(karte, richtung);
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
