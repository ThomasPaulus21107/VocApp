// UI-Schicht. Kennt nur den DOM und die Töne.
// Weiß nichts davon, was richtig oder falsch bedeutet -- bekommt das gesagt.

import * as klang from './klang.js';

const el = {
  frage: document.querySelector('#frage'),
  beiwort: document.querySelector('#beiwort'),
  eingabe: document.querySelector('#eingabe'),
  eingabeLabel: document.querySelector('#eingabe-label'),
  formular: document.querySelector('#antwort-formular'),
  knopf: document.querySelector('#knopf'),
  tippKnopf: document.querySelector('#tipp-knopf'),
  tipp: document.querySelector('#tipp'),
  rueckmeldung: document.querySelector('#rueckmeldung'),
  zaehler: document.querySelector('#zaehler'),
  karte: document.querySelector('#karte'),
  ende: document.querySelector('#ende'),
  nochmal: document.querySelector('#nochmal'),
  richtung: document.querySelector('#richtung'),
  richtungen: document.querySelectorAll('input[name="richtung"]'),
  formen: document.querySelector('#formen'),
  formWerte: {
    'infinitive': document.querySelector('#form-infinitive'),
    'simple-past': document.querySelector('#form-simple-past'),
    'past-participle': document.querySelector('#form-past-participle'),
  },
};

// So heißt die gesuchte Form auf der Karte.
const FORM_NAME = {
  'infinitive': 'infinitive',
  'simple-past': 'simple past',
  'past-participle': 'past participle',
};

/**
 * Verbindet die Bedienelemente mit der App.
 * Ereignisse fließen nach oben: die UI meldet nur, WAS passiert ist.
 */
export function verbinde({ aufAbsenden, aufNeustart, aufRichtungswechsel, aufTipp }) {
  el.formular.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    aufAbsenden(el.eingabe.value);
  });

  el.nochmal.addEventListener('click', aufNeustart);
  el.tippKnopf.addEventListener('click', aufTipp);

  // Die Richtungswahl ist im Moment abgeschaltet. Ohne Handler bleibt sie
  // ausgeblendet -- die Auswahl selbst steht noch im HTML.
  el.richtung.hidden = !aufRichtungswechsel;
  if (!aufRichtungswechsel) return;

  el.richtungen.forEach((radio) => {
    radio.addEventListener('change', () => aufRichtungswechsel(radio.value));
  });
}

export function zeigeKarte(frage, nummer, gesamt) {
  el.karte.hidden = false;
  el.ende.hidden = true;

  el.frage.textContent = frage.frage;

  // Unter der Frage steht, welche Form getippt werden soll. Ohne die Angabe
  // wäre gar nicht klar, wonach gefragt ist.
  el.beiwort.textContent = FORM_NAME[frage.gesuchteForm] ?? '';
  el.beiwort.hidden = el.beiwort.textContent === '';

  el.eingabeLabel.textContent = 'Deine Antwort';
  el.zaehler.textContent = `Karte ${nummer} von ${gesamt}`;

  el.eingabe.value = '';
  el.eingabe.disabled = false;
  el.eingabe.focus();

  el.knopf.textContent = 'Prüfen';

  // Tipp ist bei jeder neuen Karte wieder eingeklappt.
  el.tipp.hidden = true;
  el.tipp.textContent = '';
  el.tippKnopf.hidden = frage.hinweis === null;
  el.tippKnopf.disabled = false;

  // Die drei Formen kommen erst, wenn die Karte erledigt ist.
  el.formen.hidden = true;

  el.rueckmeldung.textContent = '';
  el.rueckmeldung.className = 'rueckmeldung';
}

export function zeigeTipp(text) {
  el.tipp.textContent = text;
  el.tipp.hidden = false;
  el.tippKnopf.disabled = true;
  el.eingabe.focus();
}

export function zeigeLeer() {
  el.rueckmeldung.textContent = 'Tipp erst eine Antwort ein.';
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--hinweis';
  klang.spiele('leer');
  el.eingabe.focus();
}

/**
 * Antwort auf "keine Ahnung": kein Ergebnis, sondern Zuspruch. Sieht aus wie
 * ein Richtig, zählt aber nicht als einer -- die Karte bleibt offen.
 */
export function zeigeMutmacher() {
  el.rueckmeldung.textContent = 'DU SCHAFFST DAS';
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--richtig';
  klang.spiele('mutmachen');

  el.eingabe.value = '';
  el.eingabe.focus();
}

export function zeigeRichtig(loesung, gesuchteForm) {
  el.rueckmeldung.textContent = 'Richtig!';
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--richtig';
  klang.spiele('richtig');
  zeigeLoesung(loesung, gesuchteForm);
  schliesseKarteAb();
}

/**
 * Erster Fehlversuch: die Karte bleibt offen, das Feld wird geleert.
 * Die Lösung gibt es hier noch nicht.
 */
export function zeigeKorrekturchance() {
  el.rueckmeldung.textContent = 'Noch nicht ganz. Du hast noch einen Versuch.';
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--hinweis';
  klang.spiele('nochmal');

  el.eingabe.value = '';
  el.eingabe.focus();
}

export function zeigeFalsch(erwartet, loesung, gesuchteForm) {
  el.rueckmeldung.textContent = `Leider nicht. Richtig wäre: ${erwartet.join(' oder ')}`;
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--falsch';
  klang.spiele('falsch');
  zeigeLoesung(loesung, gesuchteForm);
  schliesseKarteAb();
}

/**
 * Alle drei Formen, jetzt vollständig ausgefüllt. Die Form, nach der gefragt
 * war, wird hervorgehoben -- deshalb kann die Angabe über der Frage weg,
 * sonst stünde sie zweimal da.
 */
function zeigeLoesung(loesung, gesuchteForm) {
  el.beiwort.hidden = true;

  el.formen.hidden = false;
  for (const { name, wort } of loesung) {
    el.formWerte[name].textContent = wort;
    el.formWerte[name].classList.toggle('formen__gefragt', name === gesuchteForm);
  }
}

// Aus "Prüfen" wird "Weiter": dieselbe Taste bringt die nächste Karte.
function schliesseKarteAb() {
  el.eingabe.disabled = true;
  el.tippKnopf.disabled = true;
  el.knopf.textContent = 'Weiter';
  el.knopf.focus();
}

export function zeigeEnde(anzahl) {
  el.karte.hidden = true;
  el.ende.hidden = false;
  el.ende.querySelector('#ende-text').textContent =
    `Du hast alle ${anzahl} Karten durch.`;
  el.nochmal.focus();
}
