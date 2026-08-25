// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import {
  stelleFormFrage,
  stelleFrageZuForm,
  pruefeAntwort,
  zieheRunde,
  RICHTUNGEN,
} from './domain/pruefung.js';
import { note, punkteFuerKarte } from './domain/note.js';
import { regeln } from './domain/modus.js';
import { lernpotential } from './domain/lernpotential.js';
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
// Der Merkzettel für die Lernpotential-Runde: je ein { id, form } für jede
// Karte, die nicht auf Anhieb und ohne Hilfe saß -- falsch beantwortet, erst
// im zweiten Versuch richtig, oder mit Tipp. Übersprungene Karten und
// "keine Ahnung" stehen bewusst nicht drin: da wurde es nicht versucht.
//
// Die Form steht mit drin, weil die zweite Runde eine reine Wiederholung ist:
// dieselbe Karte MIT derselben Form, sonst übt man eine neue Aufgabe.
let zuWiederholen = [];
// Läuft gerade die zweite Runde? Es gibt nur diese eine -- wer eine Karte
// zweimal falsch hat, hat sie heute nicht mehr im Kopf.
let imLernpotential = false;
// Wie viele der zweiten Runde gesessen haben. Zählt nur für den Satz am
// Ende, nicht für die Note.
let lernpotentialGeschafft = 0;
// Wie viele Karten die erste Runde hatte, und damit die Höchstpunktzahl.
// Die Lernpotential-Runde ist kürzer und darf diese Zahl nicht verändern.
let hoechstpunktzahl = 0;
// Die Regeln der laufenden Runde: Übungsblatt oder Arbeit. Sie werden beim
// Start einmal geholt und gelten dann für die ganze Runde.
let regel = regeln(null);

function start(modus) {
  regel = regeln(modus);
  stapel = zieheRunde(verben.karten, RUNDENGROESSE);
  hoechstpunktzahl = stapel.length;
  index = 0;
  punkte = 0;
  ergebnisse = [];
  zuWiederholen = [];
  imLernpotential = false;
  lernpotentialGeschafft = 0;
  zeigeAktuelle();
}

function zeigeAktuelle() {
  versuch = 0;
  tippBenutzt = false;

  const karte = stapel[index];
  if (imLernpotential) {
    // Wiederholung heißt: genau dieselbe Frage wie beim ersten Mal.
    const gemerkt = zuWiederholen.find((eintrag) => eintrag.id === karte.id);
    frage = stelleFrageZuForm(karte, RICHTUNG, gemerkt.form);
  } else {
    frage = stelleFormFrage(karte, RICHTUNG);
  }

  ui.zeigeKarte(frage, index + 1, stapel.length, regel.tippsErlaubt, imLernpotential);
}

/**
 * Merkt eine Karte für die Lernpotential-Runde vor -- mit der Form, nach der
 * gerade gefragt war. In der zweiten Runde selbst wächst der Zettel nicht
 * mehr: es gibt nur diese eine Wiederholung.
 */
function merkeFuerSpaeter() {
  if (imLernpotential) return;
  zuWiederholen.push({ id: frage.id, form: frage.gesuchteForm });
}

/**
 * Schreibt auf, wie die aktuelle Karte ausgegangen ist. `getippt` bleibt
 * leer, wenn es keine echte Antwort gab -- bei "s" und bei "keine Ahnung".
 *
 * Die Liste zeigt die gespielte Runde. Was danach im Lernpotential passiert,
 * ändert sie nicht mehr -- sonst stünde dieselbe Karte zweimal darin.
 */
function merkeErgebnis({ richtig, getippt, kartenpunkte }) {
  if (imLernpotential) return;

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
    zaehleRichtig();

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
  merkeFuerSpaeter();

  merkeErgebnis({ richtig: false, getippt: eingabe.trim(), kartenpunkte: 0 });

  // Falsch ist falsch: in der Arbeit ohne ein Wort, sofort zur nächsten Karte.
  if (!regel.zeigtErgebnis) {
    weiter();
    return;
  }

  versuch = ERLEDIGT;
  ui.zeigeFalsch(ergebnis.erwartet, frage.loesung, frage.gesuchteForm);
}

/**
 * Eine richtige Karte verbuchen. In der ersten Runde gibt es dafür Punkte und
 * eine Zeile in der Ergebnisliste. In der Lernpotential-Runde wird nur noch
 * mitgezählt: die Note stand da längst fest.
 */
function zaehleRichtig() {
  if (imLernpotential) {
    lernpotentialGeschafft += 1;
    return;
  }

  // Richtig, aber nicht auf Anhieb: die Karte kommt trotzdem noch einmal.
  // Der zweite Versuch und der Tipp sind genau die beiden Stellen, an denen
  // eine Karte Punkte kostet -- also ist sie noch nicht sicher.
  if (versuch > 0 || tippBenutzt) merkeFuerSpaeter();

  // Punkte gibt es nur hier: für eine falsche oder übersprungene Karte wird
  // gar nicht erst gezählt.
  const kartenpunkte = punkteFuerKarte({ versuch, tipp: tippBenutzt });
  punkte += kartenpunkte;
  merkeErgebnis({ richtig: true, getippt: null, kartenpunkte });
}

function weiter() {
  index += 1;
  if (index >= stapel.length) {
    beendeStapel();
    return;
  }
  zeigeAktuelle();
}

/**
 * Der Stapel ist durch. Jetzt kommt entweder die Lernpotential-Runde oder
 * die Note -- die Note zuletzt, weil sie den Bildschirm abschließt.
 */
function beendeStapel() {
  if (regel.lernpotential && !imLernpotential && zuWiederholen.length > 0) {
    // Erst die Zwischenseite. Sie hält den Ablauf einmal an und sagt, was
    // jetzt kommt -- ohne sie liefe die Wiederholung unbemerkt an.
    ui.zeigeZwischenstand(zuWiederholen.length);
    return;
  }

  // Die Höchstpunktzahl ist die Zahl der Karten der ERSTEN Runde --
  // eine Karte, ein Punkt.
  ui.zeigeEnde(note(punkte), punkte, hoechstpunktzahl, ergebnisse, bilanz());
}

/**
 * Der Knopf auf der Zwischenseite: ab hier läuft die Wiederholung.
 * Sie zählt nicht mehr -- die Note stand vor der Zwischenseite fest.
 */
function starteLernpotential() {
  imLernpotential = true;
  stapel = lernpotential(stapel, zuWiederholen.map((eintrag) => eintrag.id));
  index = 0;
  zeigeAktuelle();
}

/**
 * Was die Lernpotential-Runde gebracht hat, oder null, wenn es keine gab.
 * Nur die Zahlen gehen an die UI -- den Satz daraus formuliert sie selbst.
 */
function bilanz() {
  if (!imLernpotential) return null;
  return { gesamt: zuWiederholen.length, geschafft: lernpotentialGeschafft };
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
ui.verbinde({
  aufAbsenden,
  aufStart: start,
  aufTipp,
  aufWeiter: starteLernpotential,
});
