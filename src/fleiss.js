// Die Fleiß-Seite: an welchem Tag wie viel geübt wurde, und wie gut.
// Eigener Einstiegspunkt wie fortschritt.html. Sie liest nur.

import './ui/styles.css';
import { fleiss, serie, runden, LEER } from './domain/lernstand.js';
import * as storage from './infra/storage.js';
import { verbindeMenue } from './ui/menue.js';

// Ein Monat zurück. Mehr Balken würden auf einem Telefon zu Strichen.
const TAGE = 30;

const el = (id) => document.getElementById(id);

// Auch wenn hier nichts steht: der Weg zu den anderen Seiten geht immer.
verbindeMenue();

const stand = storage.lesen('lernstand', LEER);
// Welcher Tag heute ist, weiß nur, wer die Uhr kennt -- also diese Datei.
// "sv" liefert JJJJ-MM-TT in der Zeitzone des Geräts.
const tage = fleiss(stand, new Date().toLocaleDateString('sv'), TAGE);

const geuebt = tage.filter((tag) => tag.antworten > 0);
const antworten = tage.reduce((summe, tag) => summe + tag.antworten, 0);
const treffer = tage.reduce((summe, tag) => summe + tag.richtig, 0);

function span(klasse, text) {
  const knoten = document.createElement('span');
  knoten.className = klasse;
  knoten.textContent = text;
  return knoten;
}

/** "29.08. um 16:40" -- wann eine Runde angefangen hat. */
function wannGenau(zeit) {
  const wann = new Date(zeit);
  const tag = wann.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  const uhr = wann.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${tag} um ${uhr}`;
}

/** "29.08." -- kurz genug für die Achse. */
function kurz(tag) {
  const [, monat, datum] = tag.split('-');
  return `${datum}.${monat}.`;
}

/** Was über einen Tag zu sagen ist. Steht unter dem Diagramm und wird auch
 *  vorgelesen, wenn jemand die Balken mit der Tastatur durchgeht. */
function satzZu(tag) {
  if (tag.antworten === 0) return `${kurz(tag.tag)} nichts geübt`;
  return `${kurz(tag.tag)} ${tag.antworten} Antworten, ${tag.quote} % davon richtig`;
}

if (geuebt.length === 0) {
  el('leer').hidden = false;
} else {
  el('inhalt').hidden = false;

  el('serie').textContent = serie(tage);
  el('tage').textContent = geuebt.length;
  el('antworten').textContent = antworten;
  el('quote').textContent = `${Math.round((treffer / antworten) * 100)} %`;
  el('von').textContent = kurz(tage[0].tag);
  el('bis').textContent = kurz(tage.at(-1).tag);

  const bester = geuebt.reduce((a, b) => (b.antworten > a.antworten ? b : a));
  el('bester').textContent = `${bester.antworten} am ${kurz(bester.tag)}`;

  // Der höchste Balken ist der vollste Tag. Ein fester Maßstab wäre bei
  // einer Runde am Tag ein Diagramm aus lauter Stummeln.
  const hoechster = bester.antworten;

  // Ein Knopf je Tag statt eines title-Tooltips. Der brauchte Hover, und auf
  // dem Telefon gibt es keinen -- ausgerechnet dort war der Tag also nicht
  // zu lesen. Angetippt schreibt er sich in die Zeile unter dem Diagramm.
  let gewaehlt = null;

  for (const tag of tage) {
    const saeule = document.createElement('button');
    saeule.type = 'button';
    saeule.className = 'diagramm__tag';
    saeule.setAttribute('aria-label', satzZu(tag));

    saeule.addEventListener('click', () => {
      gewaehlt?.classList.remove('diagramm__tag--gewaehlt');
      saeule.classList.add('diagramm__tag--gewaehlt');
      gewaehlt = saeule;
      el('gewaehlt').textContent = satzZu(tag);
    });

    if (tag.antworten > 0) {
      // Zwei Balken uebereinander, beide vom Boden aus gemessen: hinten alle
      // Antworten, davor die Treffer. Beide am selben Massstab, damit der
      // gruene Balken direkt ablesbar ist und nicht erst im Verhaeltnis zum
      // Balken dahinter.
      const gesamt = document.createElement('div');
      gesamt.className = 'diagramm__gesamt';
      gesamt.style.height = `${(tag.antworten / hoechster) * 100}%`;

      const richtig = document.createElement('div');
      richtig.className = 'diagramm__richtig';
      richtig.style.height = `${(tag.richtig / hoechster) * 100}%`;

      saeule.append(gesamt, richtig);
    }
    el('diagramm').append(saeule);
  }
}

/**
 * Jede Runde als eigene Zeile: wann sie war, in welchem Modus, wie viel
 * beantwortet wurde, und ein liegender Balken dazu.
 *
 * Der Balken zeigt NUR die Quote -- volle Breite sind 100 %. Er misst
 * bewusst nicht auch noch die Menge: als der Balken das versuchte, hatte
 * eine Runde mit 45 Antworten und 91 % einen kürzeren grünen Balken als
 * eine mit 75 Antworten und 59 %, weil die Länge am längsten Tag hing. Zwei
 * Größen in einem Balken liest niemand richtig. Wie viel beantwortet wurde,
 * steht als Zahl daneben.
 */
const alleRunden = runden(stand);

if (alleRunden.length > 0) {
  el('runden-karte').hidden = false;

  for (const runde of alleRunden) {
    const zeile = document.createElement('li');
    zeile.className = 'runde';

    const kopf = document.createElement('p');
    kopf.className = 'runde__kopf';
    kopf.append(span('runde__wann', wannGenau(runde.beginn)));
    // Der Modus gehört dazu: eine Arbeit ohne Hilfen ist etwas anderes als
    // ein Übungsblatt mit Tipps und zweiter Chance.
    kopf.append(span('runde__zahlen',
      `${runde.modus === 'arbeit' ? 'Arbeit' : 'Übungsblatt'} · ${runde.antworten} · ${runde.quote} %`));

    const leiste = document.createElement('div');
    leiste.className = 'runde__leiste';

    const richtig = document.createElement('div');
    richtig.className = 'runde__richtig';
    richtig.style.width = `${runde.quote}%`;

    leiste.append(richtig);
    zeile.append(kopf, leiste);
    el('runden-liste').append(zeile);
  }

  // Ehrlich sagen, wo die Liste aufhört: der Verlauf reicht nur so weit.
  el('runden-ende').textContent =
    `Weiter zurück reicht der Verlauf nicht — er merkt sich die letzten 750 Antworten.`;
}
