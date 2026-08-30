// Die Fortschrittsseite. Eigener Einstiegspunkt, eigene HTML-Datei -- kein
// Router, keine neue Abhängigkeit. Sie liest nur; geübt wird nebenan.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import { einheiten } from './domain/auswahl.js';
import {
  uebersicht, verteile, stufe, verlaufZu, punkteVon, schluessel,
  arbeitsstufe, ARBEITSSTUFEN,
  LEER, SICHER_AB_PROZENT, SICHER_AB_ANTWORTEN,
} from './domain/lernstand.js';
import { FORM_NAME } from './ui/formnamen.js';
import * as storage from './infra/storage.js';
import { verbindeMenue } from './ui/menue.js';

// Wie viele Beispiele je Fach. Mehr wäre keine Übersicht mehr, sondern eine
// zweite Vokabelliste -- die Menge darüber sagt ja schon, wie groß das Fach ist.
const BEISPIELE = 10;

const el = (id) => document.getElementById(id);

// Auch wenn hier nichts steht: der Weg zu den anderen Seiten geht immer.
verbindeMenue();

const stand = storage.lesen('lernstand', LEER);

// Alle Einheiten, die es überhaupt gibt -- auch die, von denen der Lernstand
// noch nie gehört hat. Ohne sie wüsste die Seite nicht, was fehlt.
const alle = einheiten(verben.karten);
const namen = alle.map(({ karte, form }) => schluessel(karte.id, form));

const zahlen = uebersicht(stand, namen);
const faecher = verteile(stand, namen);

// Zu jeder id das Verb, damit in der Liste "brechen" steht und nicht "uv-003".
const karten = new Map(verben.karten.map((karte) => [karte.id, karte]));

/** Aus "uv-003|simple-past" wird "brechen · simple past". */
function beschriftung(name) {
  const [id, form] = name.split('|');
  const karte = karten.get(id);
  const wort = karte?.formen.infinitive.de[0] ?? id;
  return `${wort} · ${FORM_NAME[form] ?? form}`;
}

/** "heute", "gestern" oder ein Datum. Näher braucht es niemand. */
function wann(zeit) {
  if (!zeit) return '–';

  const tage = Math.floor((Date.now() - zeit) / 86400000);
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'gestern';
  if (tage < 7) return `vor ${tage} Tagen`;
  return new Date(zeit).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

/**
 * Ein Satz, der die drei Zahlen einordnet -- freundlich, aber ehrlich. Der
 * erste Teil sagt, wie es steht, der zweite, was noch offen ist. Bei null
 * sicheren Formen faellt das Lob weg: dann ist noch nichts geschafft, und
 * die Seite tut auch nicht so.
 */
function lagesatz(zahlen, wieWeit) {
  const arbeit = zahlen.geuebt - zahlen.sicher;
  const nie = zahlen.gesamt - zahlen.geuebt;

  const anfang = zahlen.sicher === 0
    ? 'Noch ist keine einzige Form stabil gelernt.'
    : {
      anfang: 'Der Anfang ist gemacht.',
      unterwegs: 'Ein gutes Stück ist geschafft.',
      gut: 'Das meiste ist stabil.',
    }[wieWeit];

  // Was null ist, wird nicht erwähnt. "0 sind in Arbeit" ist keine Nachricht.
  const offen = [];
  if (arbeit > 0) offen.push(`${arbeit} ${arbeit === 1 ? 'ist' : 'sind'} in Arbeit`);
  if (nie > 0) offen.push(`${nie} ${nie === 1 ? 'war' : 'waren'} noch nie dran`);
  if (offen.length === 0) return `${anfang} Mehr geht nicht.`;

  return `${anfang} ${offen.join(', ')}.`;
}

function span(klasse, text) {
  const knoten = document.createElement('span');
  knoten.className = klasse;
  knoten.textContent = text;
  return knoten;
}

/** "29.08. um 16:40" -- wann eine einzelne Antwort gefallen ist. */
function wannGenau(zeit) {
  const wann = new Date(zeit);
  const tag = wann.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  const uhr = wann.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${tag} um ${uhr}`;
}

/**
 * Was der Verlauf über diese eine Form weiß: wann sie dran war und was sie
 * dabei geholt hat. Der Prozentwert ist derselbe wie der Score, nur für eine
 * einzelne Antwort -- ganz richtig ist 100 %, im zweiten Anlauf 50 %.
 */
function historie(name) {
  const eintraege = verlaufZu(stand, name);

  if (eintraege.length === 0) {
    const hinweis = document.createElement('p');
    hinweis.className = 'fach__ohne';
    hinweis.textContent =
      'Dazu ist nichts mehr gespeichert — der Verlauf reicht 750 Antworten zurück.';
    return hinweis;
  }

  const liste = document.createElement('ol');
  liste.className = 'fach__historie';

  for (const eintrag of eintraege) {
    const knoten = document.createElement('li');
    knoten.className = 'fach__antwort';
    knoten.append(span('fach__wann', wannGenau(eintrag.zeit)));

    // Eine Wiederholung wiegt weniger -- das soll man auch hier sehen.
    if (eintrag.wiederholung) knoten.append(span('fach__vermerk', 'Wiederholung'));
    else if (eintrag.modus === 'arbeit') knoten.append(span('fach__vermerk', 'Arbeit'));

    knoten.append(span('fach__punkte', `${Math.round(punkteVon(eintrag) * 100)} %`));
    liste.append(knoten);
  }
  return liste;
}

/**
 * Eine Zeile der Liste: das Wort und, wo einer gemessen wurde, sein Score.
 * Sie klappt auf und zeigt dann, wann die Form dran war.
 *
 * <details> macht das Auf und Zu von allein -- mit der Tastatur, mit dem
 * Finger und für den Screenreader, ohne eine Zeile dafür.
 */
function zeile({ name, score }) {
  const knoten = document.createElement('li');
  const lade = document.createElement('details');

  const kopf = document.createElement('summary');
  kopf.className = 'fach__zeile';
  kopf.append(span('fach__pfeil', '▸'));
  kopf.append(span('fach__wort', beschriftung(name)));
  if (score !== null) kopf.append(span('fach__score', `${score} %`));
  lade.append(kopf);

  // Erst beim Aufklappen bauen. Für hundert Formen im Voraus Listen zu füllen
  // wäre Arbeit für etwas, das niemand ansieht.
  lade.addEventListener('toggle', () => {
    if (lade.open && lade.children.length === 1) lade.append(historie(name));
  });

  knoten.append(lade);
  return knoten;
}

/**
 * Füllt ein Fach: die Menge, bis zu zehn Beispiele und, wenn mehr da sind,
 * einen Knopf, der den Rest nachreicht.
 */
/**
 * Teilt den orangen Teil des Balkens nach dem Koennen auf: ein Stueck je
 * Stufe, so breit wie sein Anteil an den Vokabeln in Arbeit.
 *
 * Warum ueberhaupt: "in Arbeit" ist eine Spanne. Die Vokabel, die zweimal
 * knapp danebenlag, stand im Balken neben der, die schon fast sitzt, und
 * beide sahen gleich aus. Jetzt sieht man, ob das Orange nach rot zieht oder
 * nach gruen -- und damit, ob eine Woche Ueben etwas gebracht hat.
 *
 * Die Stufen kommen aus arbeitsstufe() in domain/lernstand.js, die Farben aus
 * --arbeit-0 bis --arbeit-6 in styles.css. Hier wird nur gezaehlt und
 * gerechnet.
 */
function stufeInDenBalken(eintraege) {
  const teil = el('balken-geuebt');
  teil.replaceChildren();
  // Kein Fach, kein Balken -- und der bleibt dann einfarbig, wie er im CSS
  // steht. Ohne diese Zeile teilte man durch null.
  if (eintraege.length === 0) return;

  const zaehler = new Array(ARBEITSSTUFEN).fill(0);
  for (const eintrag of eintraege) zaehler[arbeitsstufe(eintrag.score)] += 1;

  for (const [stufeNr, anzahl] of zaehler.entries()) {
    if (anzahl === 0) continue;
    const stueck = document.createElement('span');
    stueck.className = `balken__stufe balken__stufe--${stufeNr}`;
    stueck.style.width = `${(anzahl / eintraege.length) * 100}%`;
    teil.append(stueck);
  }
}

function fuelle(fach, eintraege) {
  el(`menge-${fach}`).textContent = eintraege.length;

  const liste = el(`liste-${fach}`);
  for (const eintrag of eintraege.slice(0, BEISPIELE)) liste.append(zeile(eintrag));

  if (eintraege.length <= BEISPIELE) return;

  // Zehn Zeilen sind eine Übersicht, hundert wären eine zweite Vokabelliste.
  // Wer sie trotzdem sehen will, sagt es -- dann kommen sie alle.
  const mehr = el(`mehr-${fach}`);
  mehr.textContent = `… und ${eintraege.length - BEISPIELE} weitere zeigen`;
  mehr.hidden = false;

  mehr.addEventListener('click', () => {
    for (const eintrag of eintraege.slice(BEISPIELE)) liste.append(zeile(eintrag));
    // Der Knopf hat getan, wofür er da war.
    mehr.hidden = true;
  }, { once: true });
}

// Ohne eine einzige Antwort gibt es nichts zu zeigen. Drei Zahlen aus drei
// Antworten wären keine Aussage, sondern ein Zufall.
if (zahlen.geuebt === 0) {
  el('leer').hidden = false;
} else {
  el('ueberblick').hidden = false;
  el('faecher').hidden = false;

  el('sicher').textContent = zahlen.sicher;
  el('gesamt').textContent = zahlen.gesamt;
  el('geuebt').textContent = zahlen.geuebt;
  el('runden').textContent = zahlen.runden;
  el('antworten').textContent = zahlen.antworten;
  el('zuletzt').textContent = wann(zahlen.zuletztGeuebt);
  // Beide Bedingungen stehen im Satz und beide kommen aus lernstand.js:
  // "stabil gelernt" verlangt genug Antworten UND genug Punkte. Wer eine der
  // Zahlen dort aendert, aendert sie hier mit.
  el('schwelle').textContent = SICHER_AB_PROZENT;
  el('mindestens').textContent = SICHER_AB_ANTWORTEN;

  // Zwei Balken nebeneinander: was sicher sitzt, und was erst in Arbeit ist.
  // Der Rest der Leiste ist, was noch kommt.
  const breite = (zahl) => `${(zahl / zahlen.gesamt) * 100}%`;
  el('balken-sicher').style.width = breite(zahlen.sicher);
  el('balken-geuebt').style.width = breite(zahlen.geuebt - zahlen.sicher);
  stufeInDenBalken(faecher.arbeit);

  // Die Farben im Balken gehören den drei Fächern und sagen nichts über den
  // Gesamtstand -- den sagt der Satz darunter. Dafür ist die Stufe da.
  el('lage').textContent = lagesatz(zahlen, stufe(zahlen));

  fuelle('nie', faecher.nie);
  fuelle('arbeit', faecher.arbeit);
  fuelle('sicher', faecher.sicher);
}
