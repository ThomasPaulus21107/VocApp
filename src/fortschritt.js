// Die Fortschrittsseite. Eigener Einstiegspunkt, eigene HTML-Datei -- kein
// Router, keine neue Abhängigkeit. Sie liest nur; geübt wird nebenan.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import { einheiten } from './domain/auswahl.js';
import { uebersicht, verteile, schluessel, LEER, SICHER_AB_PROZENT } from './domain/lernstand.js';
import { FORM_NAME } from './ui/formnamen.js';
import * as storage from './infra/storage.js';

// Wie viele Beispiele je Fach. Mehr wäre keine Übersicht mehr, sondern eine
// zweite Vokabelliste -- die Menge darüber sagt ja schon, wie groß das Fach ist.
const BEISPIELE = 10;

const el = (id) => document.getElementById(id);

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

function span(klasse, text) {
  const knoten = document.createElement('span');
  knoten.className = klasse;
  knoten.textContent = text;
  return knoten;
}

/**
 * Füllt ein Fach: die Menge, bis zu zehn Beispiele und, wenn mehr da sind,
 * eine Zeile die sagt, wie viele nicht gezeigt werden.
 */
function fuelle(fach, eintraege) {
  el(`menge-${fach}`).textContent = eintraege.length;

  for (const { name, score } of eintraege.slice(0, BEISPIELE)) {
    const zeile = document.createElement('li');
    zeile.className = 'fach__zeile';
    zeile.append(span('fach__wort', beschriftung(name)));
    // Ein Score steht nur da, wo einer gemessen wurde.
    if (score !== null) zeile.append(span('fach__score', `${score} %`));
    el(`liste-${fach}`).append(zeile);
  }

  if (eintraege.length > BEISPIELE) {
    const mehr = el(`mehr-${fach}`);
    mehr.textContent = `… und ${eintraege.length - BEISPIELE} weitere`;
    mehr.hidden = false;
  }
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
  el('schwelle').textContent = SICHER_AB_PROZENT;

  // Zwei Balken übereinandergelegt: was sicher sitzt, und was schon einmal
  // dran war. Der Rest der Leiste ist, was noch kommt.
  const breite = (zahl) => `${(zahl / zahlen.gesamt) * 100}%`;
  el('balken-sicher').style.width = breite(zahlen.sicher);
  el('balken-geuebt').style.width = breite(zahlen.geuebt - zahlen.sicher);

  fuelle('nie', faecher.nie);
  fuelle('arbeit', faecher.arbeit);
  fuelle('sicher', faecher.sicher);
}
