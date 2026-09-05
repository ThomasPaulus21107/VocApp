// Die Anmeldeseite. Eigener Einstiegspunkt, eigene HTML-Datei -- kein Router,
// keine neue Abhaengigkeit, dieselbe Entscheidung wie bei den beiden
// Statistikseiten.
//
// Sie ist die einzige Seite, die OHNE Sitzung etwas anzeigt. Alle anderen
// schicken hierher, und deshalb darf hier nichts stehen, was zurueckfuehrt.

import './ui/styles.css';
import * as backend from './infra/backend.js';

const el = (id) => document.getElementById(id);

const formular = el('anmeldung');
const knopf = el('knopf');
const fehler = el('fehler');

// Ein Satz, der nicht verraet, woran es lag. Weder das Kind noch jemand, der
// Namen durchprobiert, erfaehrt, ob es "blauer-otter" ueberhaupt gibt --
// zwischen "Namen gibt es nicht" und "Passwort falsch" wird bewusst nicht
// unterschieden.
const NICHT_GEPASST = 'Das hat nicht gepasst. Sieh noch mal nach Name und Passwort.';

/**
 * Wer schon eine Sitzung hat, hat auf dieser Seite nichts verloren.
 *
 * Der Fall tritt oefter ein, als er aussieht: das Kind legt die App auf den
 * Homebildschirm, waehrend anmelden.html offen ist, und startet danach immer
 * hier. Ohne diese Zeilen saehe es jedes Mal ein Formular, das es nicht mehr
 * braucht.
 */
backend.starte().then((uid) => {
  if (uid) location.replace('index.html');
});

formular.addEventListener('submit', async (ereignis) => {
  ereignis.preventDefault();

  const name = el('name').value.trim();
  const passwort = el('passwort').value;
  if (!name || !passwort) return;

  // Waehrend es laeuft, ist der Knopf zu. Sonst schickt ein zweites Tippen
  // eine zweite Anfrage los, und die Antworten ueberholen einander.
  knopf.disabled = true;
  fehler.hidden = true;

  const drin = await backend.anmelden(name, passwort);

  if (drin) {
    // `replace` und nicht `href`: sonst fuehrte der Zurueck-Knopf auf das
    // Formular zurueck, und das schickt sofort wieder nach vorn.
    location.replace('index.html');
    return;
  }

  fehler.textContent = NICHT_GEPASST;
  fehler.hidden = false;
  knopf.disabled = false;
  el('passwort').value = '';
  el('passwort').focus();
});
