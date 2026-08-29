// Die Fortschrittsseite. Eigener Einstiegspunkt, eigene HTML-Datei -- kein
// Router, keine neue Abhängigkeit. Sie liest nur; geübt wird nebenan.

import './ui/styles.css';
import verben from '../data/unregelmaessige-verben.json';
import { einheiten } from './domain/auswahl.js';
import { uebersicht, schwaechste, LEER } from './domain/lernstand.js';
import { FORM_NAME } from './ui/formnamen.js';
import * as storage from './infra/storage.js';

// Wie viele Einträge die Liste "Das sitzt noch nicht" höchstens zeigt. Mehr
// wäre keine Hilfe mehr, sondern eine Anklage.
const HOECHSTENS = 8;

const el = (id) => document.getElementById(id);

/** Ein beschriftetes span, wie es die Ergebnisliste auch benutzt. */
function teil(klasse, text) {
  const span = document.createElement('span');
  span.className = klasse;
  span.textContent = text;
  return span;
}

const stand = storage.lesen('lernstand', LEER);
const zahlen = uebersicht(stand, einheiten(verben.karten).length);

// Zu jeder id das Verb, damit in der Liste "brechen" steht und nicht "uv-003".
const karten = new Map(verben.karten.map((karte) => [karte.id, karte]));

/** Aus "uv-003|simple-past" wird { wort, form, loesung }. */
function lies(name) {
  const [id, form] = name.split('|');
  const karte = karten.get(id);

  return {
    wort: karte?.formen.infinitive.de[0] ?? id,
    form: FORM_NAME[form] ?? '',
    loesung: karte?.formen[form]?.en[0] ?? '',
  };
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

// Ohne eine einzige Antwort gibt es nichts zu zeigen. Drei Zahlen aus drei
// Antworten wären keine Aussage, sondern ein Zufall.
if (zahlen.geuebt === 0) {
  el('leer').hidden = false;
} else {
  el('ueberblick').hidden = false;

  el('sicher').textContent = zahlen.sicher;
  el('gesamt').textContent = zahlen.gesamt;
  el('geuebt').textContent = zahlen.geuebt;
  el('runden').textContent = zahlen.runden;
  el('antworten').textContent = zahlen.antworten;
  el('zuletzt').textContent = wann(zahlen.zuletztGeuebt);

  // Zwei Balken übereinandergelegt: was sicher sitzt, und was schon einmal
  // dran war. Der Rest der Leiste ist, was noch kommt.
  const breite = (zahl) => `${(zahl / zahlen.gesamt) * 100}%`;
  el('balken-sicher').style.width = breite(zahlen.sicher);
  el('balken-geuebt').style.width = breite(zahlen.geuebt - zahlen.sicher);

  const schwach = schwaechste(stand, HOECHSTENS);
  if (schwach.length > 0) {
    el('schwaechen').hidden = false;

    for (const { name, eintrag } of schwach) {
      const { wort, form, loesung } = lies(name);
      const zeile = document.createElement('li');
      zeile.className = 'ergebnis';

      // textContent statt innerHTML -- wie in ui.js. Hier stehen zwar nur
      // eigene Vokabeln drin, aber die Gewohnheit soll stimmen.
      zeile.append(
        teil('ergebnis__frage', `${wort} · ${form}`),
        teil('ergebnis__loesung', loesung),
        teil('ergebnis__punkte', `${eintrag.dran}× dran`)
      );
      el('liste').append(zeile);
    }
  }
}
