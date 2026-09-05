// Die Lade an der rechten Seite. Jede Seite der App hat sie, und auf jeder
// verhält sie sich gleich: auf, zu, Escape, und der Fokus wandert mit.
//
// Diese Datei weiß nicht, WAS im Menü steht -- das entscheidet die jeweilige
// HTML-Datei. Sie weiß nichts von Karten und nichts vom Lernstand.
//
// Eine Ausnahme gibt es seit den Konten: den Abschnitt "Konto" füllt sie
// selbst. Er steht auf jeder Seite gleich, sieht auf jeder Seite gleich aus
// und tut auf jeder Seite dasselbe -- ihn dreimal in drei Einstiegspunkten
// zu verdrahten hieße, ihn dreimal reparieren zu müssen.

import * as backend from '../infra/backend.js';

const el = (id) => document.getElementById(id);

/** Auf und zu. Der Fokus wandert mit, sonst ist die Lade eine Falle. */
function zeige(offen) {
  el('menue').classList.toggle('menue--offen', offen);
  el('menue-schatten').classList.toggle('menue-schatten--offen', offen);
  el('menue-knopf').setAttribute('aria-expanded', String(offen));

  if (offen) el('menue-zu').focus();
  else el('menue-knopf').focus();
}

/**
 * Der Abschnitt "Konto": ein Name und ein Knopf, mehr nicht.
 *
 * OHNE SERVER BLEIBT ER WEG. Fehlen die Umgebungsvariablen, gibt es keine
 * Anmeldung, und ein Abmelden-Knopf, der nichts abmeldet, wäre schlimmer als
 * keiner -- er verspräche etwas.
 *
 * Der Name wird nachgereicht, nicht abgewartet: `pseudonym()` fragt den
 * Server, und bis die Antwort da ist, steht die Zeile leer da. Das Menü
 * deswegen später zu öffnen wäre der falsche Tausch.
 */
function verbindeKonto() {
  const abschnitt = el('menue-konto');
  if (!abschnitt) return;

  if (!backend.angemeldet()) {
    abschnitt.hidden = true;
    return;
  }

  el('menue-abmelden').addEventListener('click', async () => {
    await backend.abmelden();
    location.replace('anmelden.html');
  });

  // Bleibt der Name leer, ist das KEIN Fehler: dann hat Thomas dem Konto noch
  // kein Pseudonym gegeben. "Unbekannt" hinzuschreiben wäre eine Aussage über
  // das Kind, wo nur eine fehlende Zeile in `profile` steht.
  backend.pseudonym().then((name) => {
    if (name) el('menue-wer').textContent = name;
  });
}

/**
 * Hängt die drei Knöpfe und Escape an. Ruft jede Seite einmal auf, die ein
 * Menü im Markup stehen hat.
 */
export function verbindeMenue() {
  verbindeKonto();

  el('menue-knopf').addEventListener('click', () => zeige(true));
  el('menue-zu').addEventListener('click', () => zeige(false));
  el('menue-schatten').addEventListener('click', () => zeige(false));

  // Escape schließt, wie bei jedem Overlay. Ohne das säße man fest, sobald
  // die App ohne Adressleiste auf dem Homebildschirm läuft.
  document.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Escape' && el('menue').classList.contains('menue--offen')) {
      zeige(false);
    }
  });
}
