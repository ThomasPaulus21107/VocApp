// UI-Schicht. Kennt nur den DOM und die Töne.
// Weiß nichts davon, was richtig oder falsch bedeutet -- bekommt das gesagt.

import * as klang from './klang.js';
import { verbindeMenue } from './menue.js';
import * as effekte from './effekte.js';
import { FORM_NAME } from './formnamen.js';

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
  loesung: document.querySelector('#loesung'),
  start: document.querySelector('#start'),
  karte: document.querySelector('#karte'),
  zwischen: document.querySelector('#zwischen'),
  zwischenTitel: document.querySelector('#zwischen-titel'),
  zwischenText: document.querySelector('#zwischen-text'),
  zwischenKnopf: document.querySelector('#zwischen-knopf'),
  ende: document.querySelector('#ende'),
  note: document.querySelector('#note'),
  endeText: document.querySelector('#ende-text'),
  punkte: document.querySelector('#punkte'),
  lernpotential: document.querySelector('#lernpotential'),
  ergebnisseKnopf: document.querySelector('#ergebnisse-knopf'),
  ergebnisse: document.querySelector('#ergebnisse'),
  ergebnisVorlage: document.querySelector('#ergebnis-vorlage'),
  // Die vier Modus-Knöpfe: zwei auf der Startseite, zwei am Ende.
  modusKnoepfe: document.querySelectorAll('[data-modus]'),
  toene: document.querySelector('#toene'),
  richtung: document.querySelector('#richtung'),
  richtungen: document.querySelectorAll('input[name="richtung"]'),
  formen: document.querySelector('#formen'),
  formWerte: {
    'infinitive': document.querySelector('#form-infinitive'),
    'simple-past': document.querySelector('#form-simple-past'),
    'past-participle': document.querySelector('#form-past-participle'),
  },
};

/* =========================================================
   AUCH DAS HIER GEHÖRT DIR, MATILDA
   Zu jeder Note ein Satz. Er steht am Ende einer Runde unter
   der Note. Ändere den Text, speichere, spiel eine Runde.
   Die Noten links dürfen nicht umbenannt werden -- die kommen
   aus der Punktetabelle in src/domain/note.js.
   ========================================================= */
const NOTEN_TEXTE = {
  '1+': '👑 Einfach Aura gefarmt, besser geht’s nicht!',
  '1':  '✨ Komplett abgeliefert, richtig viel Aura!',
  '1−': '😎 Fast perfekt, bisschen Aura fehlt noch!',
  '2+': '🔥 Stark abgeliefert, du hast richtig geslayt!',
  '2':  '💅 Stabil, du hast’s echt drauf!',
  '2−': '😮‍💨 Schon ziemlich stark, da geht aber noch mehr!',
  '3+': '😎 Solide abgeliefert, noch nicht komplett cooked!',
  '3':  '🙂 Ganz gut, aber da geht noch was!',
  '3−': '💡 Du kannst das, du musst nur noch ein bisschen üben!',
  '4+': '🚀 Nicht perfekt, aber du bist auf dem richtigen Weg!',
  '4':  '💪 Noch nicht ganz, aber Aufgeben gilt nicht!',
  '4−': '🌱 Da ist noch Luft nach oben, aber du kannst das schaffen!',
  '5+': '🔥 Nicht dein bester Tag, aber davon geht die Welt nicht unter!',
  '5':  '❤️ Kopf hoch, beim nächsten Mal wird’s besser!',
  '5−': '💪 Das war nix, aber jetzt weißt du wenigstens, woran du arbeiten kannst!',
  '6':  '🫶 Okay, das war jetzt echt nicht dein Tag, aber jeder darf mal danebenliegen!',
};

// So heißt die gesuchte Form auf der Karte.
/**
 * Verbindet die Bedienelemente mit der App.
 * Ereignisse fließen nach oben: die UI meldet nur, WAS passiert ist.
 */
/**
 * Stellt den Töne-Schalter auf den gespeicherten Wert. Wird einmal beim Start
 * gerufen -- was gespeichert war, weiß nur app.js.
 */
export function setzeToene(an) {
  el.toene.checked = an;
  klang.schalte(an);
}

export function verbinde({ aufAbsenden, aufStart, aufRichtungswechsel, aufTipp, aufWeiter, aufToene }) {
  // Das Menü verhält sich auf jeder Seite gleich und liegt deshalb in einer
  // eigenen Datei -- die Statistikseiten benutzen dieselbe.
  verbindeMenue();

  // Der Schalter wirkt sofort, damit man den Unterschied hört. Gespeichert
  // wird er oben in app.js -- die UI kennt keinen Speicher.
  el.toene.addEventListener('change', () => {
    klang.schalte(el.toene.checked);
    aufToene(el.toene.checked);
  });

  el.formular.addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    aufAbsenden(el.eingabe.value);
  });

  // Welcher Modus das ist, steht im HTML am Knopf. Die UI gibt den Namen
  // nur weiter -- was er bedeutet, entscheidet die Domäne.
  el.modusKnoepfe.forEach((knopf) => {
    knopf.addEventListener('click', () => aufStart(knopf.dataset.modus));
  });

  el.tippKnopf.addEventListener('click', aufTipp);

  // Der Knopf auf der Zwischenseite startet die Wiederholung. Wann sie
  // überhaupt kommt, entscheidet app.js -- die UI fragt nur nach.
  el.zwischenKnopf.addEventListener('click', aufWeiter);

  // Das Auf- und Zuklappen der Liste geht die App nichts an: es steht nichts
  // auf dem Spiel, alle Daten sind schon da. Deshalb bleibt es hier.
  el.ergebnisseKnopf.addEventListener('click', () => {
    const zeigen = el.ergebnisse.hidden;
    el.ergebnisse.hidden = !zeigen;
    el.ergebnisseKnopf.textContent = zeigen
      ? 'Ergebnisse ausblenden'
      : 'Ergebnisse ansehen';
  });

  // Die Richtungswahl ist im Moment abgeschaltet. Ohne Handler bleibt sie
  // ausgeblendet -- die Auswahl selbst steht noch im HTML.
  el.richtung.hidden = !aufRichtungswechsel;
  if (!aufRichtungswechsel) return;

  el.richtungen.forEach((radio) => {
    radio.addEventListener('change', () => aufRichtungswechsel(radio.value));
  });
}

/**
 * Die nächste Karte. `tippsErlaubt` sagt, ob es den Tipp-Knopf überhaupt
 * gibt -- in der Arbeit gibt es ihn nicht. `istLernpotential` sagt, ob wir
 * schon in der zweiten Runde sind; die Karte sieht gleich aus, nur der
 * Zähler oben heißt anders.
 */
export function zeigeKarte(frage, nummer, gesamt, tippsErlaubt, istLernpotential = false) {
  el.start.hidden = true;
  el.karte.hidden = false;
  el.zwischen.hidden = true;
  el.ende.hidden = true;

  el.frage.textContent = frage.frage;

  // Unter der Frage steht, welche Form getippt werden soll. Ohne die Angabe
  // wäre gar nicht klar, wonach gefragt ist.
  el.beiwort.textContent = FORM_NAME[frage.gesuchteForm] ?? '';
  el.beiwort.hidden = el.beiwort.textContent === '';

  el.eingabeLabel.textContent = 'Deine Antwort';
  el.zaehler.textContent = istLernpotential
    ? `Lernpotential ${nummer} von ${gesamt}`
    : `Karte ${nummer} von ${gesamt}`;

  el.eingabe.value = '';
  el.eingabe.disabled = false;
  el.eingabe.focus();

  el.knopf.textContent = 'Prüfen';

  // Tipp ist bei jeder neuen Karte wieder eingeklappt.
  el.tipp.hidden = true;
  el.tipp.textContent = '';
  el.tippKnopf.hidden = !tippsErlaubt || frage.hinweis === null;
  el.tippKnopf.disabled = false;

  // Die drei Formen kommen erst, wenn die Karte erledigt ist.
  el.formen.hidden = true;

  // Und die große Lösung nur, wenn es schiefgeht.
  el.loesung.hidden = true;
  el.loesung.textContent = '';

  el.rueckmeldung.textContent = '';
  el.rueckmeldung.className = 'rueckmeldung';
}

/**
 * Die Zwischenseite zwischen Übung und Wiederholung. Sie bekommt nur die
 * Zahl der offenen Karten -- Punkte und Note stehen bewusst NICHT hier:
 * wer sie schon sieht, spielt die Wiederholung nicht mehr ernsthaft.
 */
export function zeigeZwischenstand(offene) {
  el.start.hidden = true;
  el.karte.hidden = true;
  el.zwischen.hidden = false;
  el.ende.hidden = true;

  el.zwischenTitel.textContent = 'Die Runde ist durch!';
  el.zwischenText.textContent = offene === 1
    ? 'Eine Karte hat noch Lernpotential. Die kommt jetzt noch einmal.'
    : `${offene} Karten haben noch Lernpotential. Die kommen jetzt noch einmal.`;

  klang.spiele('geschafft');
  el.zwischenKnopf.focus();
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
  // Nach der letzten Karte gibt es keine Karte mehr, auf der der Zuspruch
  // stehen könnte. Dann bleibt er weg.
  if (el.karte.hidden) return;

  el.rueckmeldung.textContent = 'DU SCHAFFST DAS';
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--richtig';
  klang.spiele('mutmachen');

  el.eingabe.value = '';
  el.eingabe.focus();
}

export function zeigeRichtig(loesung, gesuchteForm, tippfehler = false) {
  // Bei einem durchgelassenen Tippfehler zählt die Karte als richtig, aber
  // die Rückmeldung sagt es dazu. Die richtige Schreibweise steht ohnehin
  // gleich darunter in den drei Formen.
  el.rueckmeldung.textContent = tippfehler
    ? 'Richtig! Kleiner Tippfehler, schau dir die Schreibweise an:'
    : 'Richtig!';
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

/**
 * Falsche Antwort. Das richtige Wort steht groß unter der Rückmeldung und
 * nicht mehr mitten im Satz -- es ist das Einzige, was von dieser Karte
 * hängenbleiben soll.
 */
export function zeigeFalsch(erwartet, loesung, gesuchteForm) {
  el.rueckmeldung.textContent = 'Leider nicht. Richtig ist:';
  el.rueckmeldung.className = 'rueckmeldung rueckmeldung--falsch';

  el.loesung.textContent = erwartet.join(' oder ');
  el.loesung.hidden = false;

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

/**
 * Der Abschluss einer Runde: die Note, Matildas Satz dazu und die Punkte.
 * Die Note wird hier nicht ausgerechnet -- sie kommt fertig herein.
 * `lernpotential` ist null, wenn es keine zweite Runde gab.
 */
export function zeigeEnde(note, punkte, hoechstpunktzahl, ergebnisse, lernpotential = null, warArbeit = false) {
  el.start.hidden = true;
  el.karte.hidden = true;
  el.zwischen.hidden = true;
  el.ende.hidden = false;

  el.note.textContent = note;
  el.endeText.textContent = NOTEN_TEXTE[note] ?? '';
  el.punkte.textContent =
    `${schreibePunkte(punkte)} von ${hoechstpunktzahl} Punkten`;

  zeigeLernpotential(lernpotential);
  fuelleErgebnisse(ergebnisse);

  // Nach einer neuen Runde ist die Liste wieder zugeklappt.
  el.ergebnisse.hidden = true;
  el.ergebnisseKnopf.textContent = 'Ergebnisse ansehen';

  // Der erste der beiden Modus-Knöpfe ist das Übungsblatt.
  el.ende.querySelector('[data-modus]').focus();

  // Ganz zum Schluss die Belohnung: welche Note welchen Effekt bekommt,
  // steht in effekte.js. Ohne Effekt bleibt es auch still.
  const effekt = effekte.zeige(note);
  if (!effekt) return;

  // Eine 1+ in einer ARBEIT ist das Größte, was es hier zu holen gibt: ohne
  // Tipp, ohne zweite Chance, ohne einen einzigen Fehler. Dafür gibt es die
  // lange Melodie statt des kurzen Raketentons -- im Übungsblatt nicht, sonst
  // wäre sie nach drei Runden nichts Besonderes mehr.
  klang.spiele(warArbeit && note === '1+' ? 'tetris' : effekt);
}

/**
 * Die Bilanz der Lernpotential-Runde, klein unter den Punkten. Die Note
 * ändert sie nicht mehr -- gezählt wird nur, was im zweiten Anlauf saß.
 * Ohne zweite Runde steht hier nichts.
 */
function zeigeLernpotential(bilanz) {
  el.lernpotential.hidden = bilanz === null;
  if (bilanz === null) return;

  el.lernpotential.textContent =
    bilanz.geschafft === bilanz.gesamt
      ? `Lernpotential: alles noch einmal geübt und diesmal richtig!`
      : `Lernpotential: ${bilanz.geschafft} von ${bilanz.gesamt} saßen im zweiten Anlauf.`;
}

/**
 * Baut die Liste neu auf: eine Zeile je Karte, in der Reihenfolge, in der
 * sie drankamen. Die Zeile selbst kommt aus der Vorlage im HTML -- hier
 * wird nur Text eingesetzt.
 */
function fuelleErgebnisse(ergebnisse) {
  el.ergebnisse.textContent = '';

  for (const ergebnis of ergebnisse) {
    const zeile = el.ergebnisVorlage.content.cloneNode(true);
    const wurzel = zeile.querySelector('.ergebnis');
    const teil = (name) => zeile.querySelector(`.ergebnis__${name}`);

    wurzel.classList.add(ergebnis.richtig ? 'ergebnis--richtig' : 'ergebnis--falsch');

    teil('zeichen').textContent = ergebnis.richtig ? '✓' : '✗';
    teil('frage').textContent = FORM_NAME[ergebnis.gesuchteForm]
      ? `${ergebnis.frage} · ${FORM_NAME[ergebnis.gesuchteForm]}`
      : ergebnis.frage;
    teil('punkte').textContent = schreibePunkte(ergebnis.punkte);
    teil('loesung').textContent = ergebnis.erwartet;

    // "du: ..." nur, wenn wirklich etwas getippt wurde. Übersprungene
    // Karten und "keine Ahnung" haben keine Antwort, die man zeigen könnte.
    const getippt = teil('getippt');
    getippt.textContent = ergebnis.getippt ? `du: ${ergebnis.getippt}` : '';
    getippt.hidden = !ergebnis.getippt;

    el.ergebnisse.append(zeile);
  }
}

/**
 * Punkte, wie man sie hinschreibt: 12,4 statt 12.4 und 15 statt 15,0.
 * Das Runden ist nötig, weil sich beim Addieren von Zehnteln sonst
 * Nachkommastellen einschleichen, die niemand sehen will.
 */
function schreibePunkte(punkte) {
  return Number(punkte.toFixed(1)).toString().replace('.', ',');
}
