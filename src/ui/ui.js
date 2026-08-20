// UI-Schicht. Kennt nur den DOM.
// Weiß nichts davon, was richtig oder falsch bedeutet -- bekommt das gesagt.

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
  formen: document.querySelector('#formen'),
  formWerte: {
    'infinitive': document.querySelector('#form-infinitive'),
    'simple-past': document.querySelector('#form-simple-past'),
    'past-participle': document.querySelector('#form-past-participle'),
  },
  ende: document.querySelector('#ende'),
  nochmal: document.querySelector('#nochmal'),
  richtungen: document.querySelectorAll('input[name="richtung"]'),
};

const LABEL = {
  'nach-de': 'Was heißt das auf Deutsch?',
  'nach-en': 'What is this in English?',
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

  el.richtungen.forEach((radio) => {
    radio.addEventListener('change', () => aufRichtungswechsel(radio.value));
  });
}

export function zeigeKarte(frage, richtung, nummer, gesamt) {
  el.karte.hidden = false;
  el.ende.hidden = true;

  el.frage.textContent = frage.frage;

  // Wortart und Bedeutung stehen direkt an der Frage, nicht im Tipp:
  // ohne sie wäre "bank" nicht eindeutig beantwortbar.
  const beiwort = [frage.wortart, frage.bedeutung].filter(Boolean).join(' · ');
  el.beiwort.textContent = beiwort;
  el.beiwort.hidden = beiwort === '';

  el.eingabeLabel.textContent = frage.formen ? 'Welche Form fehlt?' : LABEL[richtung];
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

  el.rueckmeldung.textContent = '';
  el.rueckmeldung.className = 'rueckmeldung';

  zeigeFormen(frage.formen);
}

// Ohne formen bleibt die Zeile weg -- normale Vokabeln haben keine.
function zeigeFormen(formen) {
  el.formen.hidden = !formen;
  if (!formen) return;

  for (const { name, wort } of formen) {
    el.formWerte[name].textContent = wort ?? '?';
    el.formWerte[name].classList.toggle('formen__luecke', wort === null);
  }
}

export function zeigeTipp(text) {
  el.tipp.textContent = text;
  el.tipp.hidden = false;
  el.tippKnopf.disabled = true;
  el.eingabe.focus();
}

export function zeigeErgebnis(ergebnis) {
  if (ergebnis.leer) {
    el.rueckmeldung.textContent = 'Tipp erst eine Antwort ein.';
    el.rueckmeldung.className = 'rueckmeldung rueckmeldung--hinweis';
    el.eingabe.focus();
    return;
  }

  if (ergebnis.richtig) {
    el.rueckmeldung.textContent = 'Richtig!';
    el.rueckmeldung.className = 'rueckmeldung rueckmeldung--richtig';
  } else {
    el.rueckmeldung.textContent =
      `Leider nicht. Richtig wäre: ${ergebnis.erwartet.join(' oder ')}`;
    el.rueckmeldung.className = 'rueckmeldung rueckmeldung--falsch';
  }

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
