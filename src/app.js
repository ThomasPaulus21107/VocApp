// Anwendungssteuerung. Der einzige Ort, an dem die Schichten zusammenkommen
// und an dem es einen veränderlichen Zustand gibt.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import {
  stelleFrageZuForm,
  pruefeAntwort,
  RICHTUNGEN,
} from './domain/pruefung.js';
import { zieheRunde, einheiten } from './domain/auswahl.js';
import {
  merkeGezogen, verrechne, zuletztVon, faecherVon, schluessel, AUSGAENGE, LEER,
} from './domain/lernstand.js';
import { note, punkteFuerKarte } from './domain/note.js';
import { regeln, MODI } from './domain/modus.js';
import { lernpotential } from './domain/lernpotential.js';
import * as storage from './infra/storage.js';
import * as backend from './infra/backend.js';
import * as ui from './ui/ui.js';

// Vorerst nur unregelmäßige Verben, und nur in eine Richtung: das deutsche
// Verb steht da, getippt wird die englische Form.
//
// 15 Karten, weil jede Karte einen Punkt wert ist und die Punkteskala der
// Oberstufe bei 15 endet. Wer die Rundengröße ändert, muss die Notentabelle
// in domain/note.js mitändern -- die beiden hängen zusammen.
const RUNDENGROESSE = 15;

// Alle Einheiten, die es ueberhaupt gibt -- einmal ausgerechnet, denn die
// Kartenliste aendert sich waehrend einer Sitzung nicht. Die Auswahl braucht
// sie, um zu wissen, was noch nie dran war: der Lernstand kennt ja nur, was
// schon einmal lief.
const NAMEN = einheiten(verben.karten).map(
  ({ karte, form }) => schluessel(karte.id, form)
);
const RICHTUNG = RICHTUNGEN.NACH_EN;

// 0 = erster Versuch, 1 = Korrekturchance, 2 = erledigt
const ERLEDIGT = 2;

// Töne an oder aus. Ein true/false, der erste Schalter, der durch die
// Speicher-Naht geht. Standard ist an: wer nichts einstellt, hört sie.
const TOENE = 'toene';

// Was die App sich über Wochen merkt: je Karte-Form-Einheit, wann sie zuletzt
// dran war und wie es ausging. Zwei Dinge hängen daran -- die Abdeckung beim
// Ziehen und die Statistik -- und beide lesen denselben Datensatz.
//
// Er überlebt das Schließen des Browsers. Geht er verloren, ist die Auswahl
// nicht kaputt: dann sehen alle Karten gleich alt aus, es wird zufällig
// gezogen, und nach vier Runden ist die Abdeckung von selbst wieder da. Die
// gezählten Wochen sind dann allerdings weg -- deshalb gehört der Stand
// später nach Postgres und nicht in den Browser.
const LERNSTAND = 'lernstand';
let lernstand = storage.lesen(LERNSTAND, LEER);

// Der Stapel ist eine Liste aus { karte, form }: WAS gefragt wird, steht
// schon beim Ziehen fest und nicht erst beim Anzeigen.
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
// Der Name des Modus, so wie er vom Knopf kam. `regel` selbst kennt ihn
// nicht -- sie ist nur die Tabelle dahinter, und der Lernstand will wissen,
// unter welchen Bedingungen eine Antwort zustande kam.
let gespielterModus = null;

function start(modus) {
  gespielterModus = modus;
  regel = regeln(modus);
  stapel = zieheRunde(
    verben.karten, RUNDENGROESSE,
    zuletztVon(lernstand.einheiten), lernstand.rundeNr, Math.random,
    // Die Quote braucht zu jeder Einheit ihr Fach. Wie die Faecher heissen
    // und wie viele aus jedem kommen, steht in auswahl.js.
    faecherVon(lernstand, NAMEN)
  );
  merkeAuswahl();
  hoechstpunktzahl = stapel.length;
  index = 0;
  punkte = 0;
  ergebnisse = [];
  zuWiederholen = [];
  imLernpotential = false;
  lernpotentialGeschafft = 0;
  zeigeAktuelle();
}

/**
 * Schreibt die gezogene Runde in den Auswahlstand fort und legt ihn ab.
 * Auch in der Arbeit -- eine Karte, die drankam, kam dran, egal in welchem
 * Modus. Die Lernpotential-Runde zaehlt dagegen nicht mit: sie zieht nichts
 * Neues, sie wiederholt.
 */
function merkeAuswahl() {
  // Die Nummer VOR merkeGezogen lesen: dort bekommen die Einheiten die
  // laufende Runde, und erst danach zählt sie hoch.
  const runde = lernstand.rundeNr;
  const jetzt = Date.now();

  lernstand = merkeGezogen(lernstand, stapel);
  storage.speichern(LERNSTAND, lernstand);

  // Dasselbe noch einmal für den Server. Eine gezogene Karte sieht nach
  // nichts aus und ist trotzdem ein Ereignis: die Auswahl entscheidet
  // danach, was am längsten nicht dran war. Ohne diese Zeilen wüsste ein
  // zweites Gerät das nicht.
  for (const { karte, form } of stapel) {
    backend.melde({ art: 'gezogen', id: karte.id, form, runde, zeit: jetzt });
  }
}

function zeigeAktuelle() {
  versuch = 0;
  tippBenutzt = false;

  // Welche Form gefragt ist, steht schon im Stapel: in der ersten Runde hat
  // die Auswahl sie bestimmt, in der Wiederholung der Merkzettel.
  const { karte, form } = stapel[index];
  frage = stelleFrageZuForm(karte, RICHTUNG, form);

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
 * Die LISTE zeigt die gespielte Runde. Was danach im Lernpotential passiert,
 * ändert sie nicht mehr -- sonst stünde dieselbe Karte zweimal darin.
 *
 * Der LERNSTAND sieht die Wiederholung dagegen sehr wohl. Sie ist eine echte
 * Antwort auf eine echte Frage, und eine Übungseinheit hat deshalb mehr
 * Antworten als der Stapel Karten hatte.
 */
function merkeErgebnis({ ausgang, getippt, kartenpunkte, tippfehler = false }) {
  if (!imLernpotential) {
    ergebnisse.push({
      frage: frage.frage,
      gesuchteForm: frage.gesuchteForm,
      erwartet: frage.antworten.join(' oder '),
      richtig: ausgang === AUSGAENGE.RICHTIG,
      getippt,
      punkte: kartenpunkte,
    });
  }

  // Dieselbe Karte wandert in den Lernstand -- dort zählt sie über Wochen und
  // nicht nur für diese Runde. Die Zeit kommt von hier, nie aus der Domäne.
  //
  // Gespeichert wird nach jeder Karte und nicht am Rundenende: am Handy wird
  // eine Runde oft unterbrochen, und was beantwortet wurde, wurde beantwortet.
  const jetzt = Date.now();
  const ereignis = {
    id: frage.id,
    form: frage.gesuchteForm,
    ausgang,
    versuch,
    tipp: tippBenutzt,
    // Ein durchgelassener Tippfehler steht mit im Verlauf, wie der Tipp:
    // beide sagen etwas darüber, wie sicher die Antwort war.
    tippfehler,
    modus: gespielterModus,
    // Eine Wiederholung wiegt anders: die Lösung stand eben noch da.
    // Gezählt wird sie trotzdem, nur eben als das, was sie ist.
    wiederholung: imLernpotential,
    // Dieselbe Zahl, die auch in die Note eingeht. Aufsummiert und durch
    // die Zahl der Antworten geteilt ergibt sie den Score der Vokabel.
    punkte: kartenpunkte,
    // Welcher Tag gerade ist, weiß nur, wer die Uhr kennt -- also hier.
    // "sv" liefert das Datum als JJJJ-MM-TT, und zwar in der Zeitzone des
    // Geräts: um halb eins nachts gehört die Runde noch zum Vortag, so wie
    // Matilda es auch empfinden würde.
    tag: new Date().toLocaleDateString('sv'),
  };

  lernstand = verrechne(lernstand, ereignis, jetzt);
  storage.speichern(LERNSTAND, lernstand);

  // Genau dasselbe Ereignis geht zum Server -- nicht etwas daraus
  // Errechnetes. Der Lernstand hier und die Zeile dort sind zwei Sichten auf
  // dieselbe Antwort, und deshalb können sie nicht auseinanderlaufen.
  backend.melde({ art: 'antwort', ...ereignis, zeit: jetzt });
}

// Ein Knopf, zwei Bedeutungen: erst prüfen, dann weiter.
function aufAbsenden(eingabe) {
  if (versuch === ERLEDIGT) {
    weiter();
    return;
  }

  const ergebnis = pruefeAntwort(eingabe, frage, regel.tippfehlerErlaubt);

  // Bei leerer Eingabe bleiben wir auf derselben Karte, ohne einen Versuch
  // zu verbrauchen.
  if (ergebnis.leer) {
    ui.zeigeLeer();
    return;
  }

  // "s" überspringt die Karte -- ohne Lösung, direkt zur nächsten.
  if (ergebnis.springen) {
    merkeErgebnis({ ausgang: AUSGAENGE.UEBERSPRUNGEN, getippt: null, kartenpunkte: 0 });
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
    merkeErgebnis({ ausgang: AUSGAENGE.AUFGEGEBEN, getippt: null, kartenpunkte: 0 });
    weiter();
    ui.zeigeMutmacher();
    return;
  }

  if (ergebnis.richtig) {
    zaehleRichtig(ergebnis.tippfehler);

    // In der Arbeit erfährt man zwischendurch nichts, auch kein Lob.
    if (!regel.zeigtErgebnis) {
      weiter();
      return;
    }

    versuch = ERLEDIGT;
    // Ein durchgelassener Tippfehler wird gezeigt, nicht verschwiegen --
    // sonst übt man die falsche Schreibweise ein.
    ui.zeigeRichtig(frage.loesung, frage.gesuchteForm, ergebnis.tippfehler);
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

  merkeErgebnis({ ausgang: AUSGAENGE.FALSCH, getippt: eingabe.trim(), kartenpunkte: 0 });

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
function zaehleRichtig(tippfehler = false) {
  if (imLernpotential) lernpotentialGeschafft += 1;

  // Richtig, aber nicht auf Anhieb: die Karte kommt trotzdem noch einmal.
  // Der zweite Versuch, der Tipp und der durchgelassene Tippfehler sind genau
  // die Stellen, an denen eine Karte Punkte kostet -- also ist sie noch nicht
  // sicher. (In der Wiederholung selbst hält merkeFuerSpaeter sich zurück.)
  if (versuch > 0 || tippBenutzt || tippfehler) merkeFuerSpaeter();

  // Punkte gibt es nur hier: für eine falsche oder übersprungene Karte wird
  // gar nicht erst gezählt.
  const kartenpunkte = punkteFuerKarte({ versuch, tipp: tippBenutzt, tippfehler });

  // Für die NOTE zählt nur die erste Runde -- die Note stand vor der
  // Zwischenseite fest. Im Lernstand zählt die Wiederholung mit.
  if (!imLernpotential) punkte += kartenpunkte;

  merkeErgebnis({ ausgang: AUSGAENGE.RICHTIG, getippt: null, kartenpunkte, tippfehler });
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
  ui.zeigeEnde(
    note(punkte), punkte, hoechstpunktzahl, ergebnisse, bilanz(),
    // Ob es eine Arbeit war, entscheidet hier oben -- die UI kennt die Modi
    // nicht, sie bekommt nur gesagt, ob die große Melodie dran ist.
    gespielterModus === MODI.ARBEIT
  );
}

/**
 * Der Knopf auf der Zwischenseite: ab hier läuft die Wiederholung.
 * Für die NOTE zählt sie nicht mehr, die stand vor der Zwischenseite fest.
 * Für den Lernstand zählt sie wie jede andere Antwort.
 */
function starteLernpotential() {
  imLernpotential = true;

  // Dieselben Karten wie eben, und zu jeder die Form, die danebenging.
  const karten = lernpotential(
    stapel.map((eintrag) => eintrag.karte),
    zuWiederholen.map((eintrag) => eintrag.id)
  );
  stapel = karten.map((karte) => ({
    karte,
    form: zuWiederholen.find((eintrag) => eintrag.id === karte.id).form,
  }));
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
ui.setzeToene(storage.lesen(TOENE, true));

ui.verbinde({
  aufAbsenden,
  aufStart: start,
  aufTipp,
  aufWeiter: starteLernpotential,
  aufToene: (an) => storage.speichern(TOENE, an),
});

// Was beim letzten Mal nicht rausging, geht jetzt raus -- wer im Flugmodus
// geübt und die App danach geschlossen hat, verlöre seine Antworten sonst bis
// zur übernächsten Sitzung.
//
// Das ist ausdrücklich KEIN Anmelden: ist der Korb leer, passiert nichts, und
// wer die Seite nur ansieht, bekommt weiterhin kein Konto. Angemeldet wird
// erst, wenn es etwas zu sichern gibt.
//
// Kein await. In dieser Datei wartet nichts auf den Server; das eine `await`
// aus dem Muster in roadmap/feature-request-mehrere-nutzer.md kommt erst,
// wenn der Server die Wahrheit wird.
backend.holeNach();
