// Die Fleiß-Seite: an welchem Tag wie viel geübt wurde, und wie gut.
// Eigener Einstiegspunkt wie fortschritt.html. Sie liest nur.

import './ui/styles.css';
import { fleiss, serie, LEER } from './domain/lernstand.js';
import * as storage from './infra/storage.js';

// Ein Monat zurück. Mehr Balken würden auf einem Telefon zu Strichen.
const TAGE = 30;

const el = (id) => document.getElementById(id);

const stand = storage.lesen('lernstand', LEER);
// Welcher Tag heute ist, weiß nur, wer die Uhr kennt -- also diese Datei.
// "sv" liefert JJJJ-MM-TT in der Zeitzone des Geräts.
const tage = fleiss(stand, new Date().toLocaleDateString('sv'), TAGE);

const geuebt = tage.filter((tag) => tag.antworten > 0);
const antworten = tage.reduce((summe, tag) => summe + tag.antworten, 0);
const treffer = tage.reduce((summe, tag) => summe + tag.richtig, 0);

/** "29.08." -- kurz genug für die Achse. */
function kurz(tag) {
  const [, monat, datum] = tag.split('-');
  return `${datum}.${monat}.`;
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

  for (const tag of tage) {
    const saeule = document.createElement('div');
    saeule.className = 'diagramm__tag';
    saeule.title = tag.antworten === 0
      ? `${kurz(tag.tag)} nichts geübt`
      : `${kurz(tag.tag)} ${tag.antworten} Antworten, ${tag.quote} % Treffer`;

    if (tag.antworten > 0) {
      const balken = document.createElement('div');
      balken.className = 'diagramm__balken';
      balken.style.height = `${(tag.antworten / hoechster) * 100}%`;

      // Der grüne Teil sind die Treffer. Was darüber steht, ging daneben.
      const richtig = document.createElement('div');
      richtig.className = 'diagramm__richtig';
      richtig.style.height = `${(tag.richtig / tag.antworten) * 100}%`;

      balken.append(richtig);
      saeule.append(balken);
    }
    el('diagramm').append(saeule);
  }
}
