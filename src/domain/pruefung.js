// Domänenlogik. Kennt kein DOM, keinen localStorage, kein Netzwerk.
// Alles hier drin ist eine reine Funktion: Eingabe rein, Ergebnis raus.
// Genau deshalb laufen die Tests in Millisekunden ohne Browser.

export const RICHTUNGEN = {
  NACH_DE: 'nach-de', // englisches Wort gezeigt, deutsche Antwort gesucht
  NACH_EN: 'nach-en', // deutsches Wort gezeigt, englische Antwort gesucht
};

/**
 * Macht zwei Schreibweisen vergleichbar.
 * "  der Hund " und "DER HUND" werden beide zu "der hund".
 */
export function normalisiere(text) {
  return String(text)
    .trim()                 // Leerzeichen am Anfang und Ende weg
    .toLowerCase()          // Groß- und Kleinschreibung egal
    .replace(/\s+/g, ' ');  // mehrere Leerzeichen in der Mitte zu einem
}

/**
 * Dreht eine Karte in die gewünschte Richtung.
 * Die Karte selbst kennt keine Richtung -- die entscheidet erst die App.
 * Gezeigt wird immer das ERSTE Wort der Liste, gelten tun alle.
 */
export function stelleFrage(karte, richtung) {
  const nachDe = richtung === RICHTUNGEN.NACH_DE;
  const von = nachDe ? karte.en : karte.de;
  const nach = nachDe ? karte.de : karte.en;

  return {
    id: karte.id,
    frage: von[0],
    antworten: nach,
    hinweis: karte.hinweise?.[richtung] ?? null,
    // Bei gleich geschriebenen Wörtern (bank = Bank / Ufer) grenzt das die
    // Frage ein. Steht direkt an der Frage, nicht im versteckten Hinweis.
    bedeutung: karte.bedeutung ?? null,
    wortart: karte.wortart ?? null,
  };
}

export const FORMEN = ['infinitive', 'simple-past', 'past-participle'];

/**
 * Eine Karte mit drei Formen wird anders abgefragt als eine normale Vokabel.
 * Entscheidend ist, ob die Formen DA sind -- nicht, was in wortart steht.
 */
export function hatFormen(karte) {
  return Boolean(karte.formen);
}

// Gefragt wird nur nach diesen beiden. Das Partizip wird nach dem Lösen
// mitgezeigt, aber nie abgefragt.
export const ABGEFRAGTE_FORMEN = ['infinitive', 'simple-past'];

/**
 * Baut den Tipp zu einem Wort: erster Buchstabe, dann ein Unterstrich je
 * weiterem Buchstaben. Aus "wrote" wird "w____", aus "woke up" wird "w___ u_".
 *
 * Ein führendes "to" bleibt stehen -- das gehört zur Form und muss nicht
 * geraten werden. Die Unterstriche verraten dafür die Länge.
 */
export function baueHinweis(wort) {
  return String(wort)
    .split(' ')
    .map((teil, stelle) =>
      stelle === 0 && teil === 'to' ? teil : teil[0] + '_'.repeat(teil.length - 1)
    )
    .join(' ');
}

/**
 * Zieht eine Runde: mischen, dann die ersten n nehmen. Sind weniger Karten
 * da als gewünscht, kommen eben alle dran.
 */
export function zieheRunde(karten, anzahl, zufall = Math.random) {
  return mische(karten, zufall).slice(0, anzahl);
}

/**
 * Baut die Frage zu einem unregelmäßigen Verb zu einer BESTIMMTEN Form.
 * Gezeigt wird das Verb in der Fragesprache, gesucht ist die genannte Form
 * in der Antwortsprache.
 *
 * Gebraucht wird das für die Wiederholung: dort soll dieselbe Form noch
 * einmal drankommen und nicht eine andere -- sonst übt man eine neue
 * Aufgabe statt der, die danebenging.
 */
export function stelleFrageZuForm(karte, richtung, gesuchteForm) {
  const nachDe = richtung === RICHTUNGEN.NACH_DE;
  const antwortsprache = nachDe ? 'de' : 'en';
  const fragesprache = nachDe ? 'en' : 'de';

  const antworten = karte.formen[gesuchteForm][antwortsprache];

  return {
    id: karte.id,
    frage: karte.formen.infinitive[fragesprache][0],
    gesuchteForm,
    antworten,
    // Der Tipp wird gebaut, nicht aus der Karte gelesen: er soll bei der Form
    // helfen, nicht bei der Bedeutung.
    hinweis: baueHinweis(antworten[0]),
    // Erst wenn die Karte erledigt ist, werden alle drei Formen gezeigt --
    // auch das Partizip, nach dem nie gefragt wird.
    loesung: FORMEN.map((name) => ({
      name,
      wort: karte.formen[name][antwortsprache][0],
    })),
    bedeutung: karte.bedeutung ?? null,
    wortart: karte.wortart ?? null,
  };
}

/**
 * Dieselbe Frage, nur sucht hier der Zufall die Form aus ABGEFRAGTE_FORMEN
 * aus. So kommt eine Karte nicht immer mit derselben Form.
 *
 * Der Zufall wird hereingereicht, damit der Test das Ergebnis vorhersagen
 * kann. Gleiches Prinzip wie bei mische().
 */
export function stelleFormFrage(karte, richtung, zufall = Math.random) {
  const gesucht = ABGEFRAGTE_FORMEN[Math.floor(zufall() * ABGEFRAGTE_FORMEN.length)];
  return stelleFrageZuForm(karte, richtung, gesucht);
}

// Ein einzelnes "s" heißt: diese Karte überspringen. Als Antwort kommt es
// nicht in Frage -- keine englische Verbform besteht aus einem Buchstaben.
export const SPRINGEN = 's';

// "keine Ahnung" ist kein Fehlversuch, sondern ein Hilferuf. Die Karte bleibt
// offen, es gibt Zuspruch statt einer Bewertung.
export const AUFGEBEN = 'keine ahnung';

// Erst ab dieser Länge darf ein Tippfehler durchgehen. Bei kurzen Wörtern ist
// ein Zeichen zu viel Spielraum: "war" wäre sonst ein richtiges "was" --
// ausgerechnet das deutsche Wort. Gemessen wird die erwartete Antwort.
export const KURZ_GENUG_FUER_TOLERANZ = 5;

/**
 * Sind zwei Wörter bis auf höchstens EIN Zeichen gleich? Erlaubt sind: ein
 * Buchstabe vertauscht ("wrotr"), einer zu viel ("wrotee"), einer zu wenig
 * ("wrte").
 *
 * Kurze Wörter zählen nie als ähnlich -- siehe KURZ_GENUG_FUER_TOLERANZ.
 * Beide Wörter kommen bereits normalisiert herein.
 */
export function fastGleich(getippt, erwartet) {
  if (erwartet.length < KURZ_GENUG_FUER_TOLERANZ) return false;

  // Mehr als ein Zeichen Längenunterschied kann nie ein einzelner Tippfehler
  // sein. Das spart den Vergleich und macht die Schleife darunter einfacher.
  if (Math.abs(getippt.length - erwartet.length) > 1) return false;

  // Von vorne bis zur ersten Abweichung laufen ...
  let vorne = 0;
  while (vorne < getippt.length &&
         vorne < erwartet.length &&
         getippt[vorne] === erwartet[vorne]) {
    vorne++;
  }

  // ... und von hinten genauso. Was dazwischen übrig bleibt, ist der Fehler.
  let hinten = 0;
  while (hinten < getippt.length - vorne &&
         hinten < erwartet.length - vorne &&
         getippt[getippt.length - 1 - hinten] === erwartet[erwartet.length - 1 - hinten]) {
    hinten++;
  }

  // Höchstens ein Zeichen darf übrig bleiben, und zwar auf jeder Seite.
  return getippt.length - vorne - hinten <= 1 &&
         erwartet.length - vorne - hinten <= 1;
}

/**
 * Prüft eine getippte Antwort gegen eine gestellte Frage.
 * Gibt IMMER ein Ergebnis-Objekt zurück und verändert nichts.
 *
 * `tippfehlerErlaubt` kommt aus den Regeln des Modus: im Übungsblatt geht ein
 * Buchstabe daneben durch, in der Arbeit nicht. Ein so erkannter Tippfehler
 * ist richtig -- aber das Ergebnis sagt mit `tippfehler` dazu, dass die
 * richtige Schreibweise gezeigt werden muss. Sonst lernt man ihn mit.
 */
export function pruefeAntwort(eingabe, frage, tippfehlerErlaubt = false) {
  const getippt = normalisiere(eingabe);

  if (getippt === '') {
    return { richtig: false, leer: true, springen: false, mutmachen: false, tippfehler: false, erwartet: frage.antworten };
  }

  if (getippt === SPRINGEN) {
    return { richtig: false, leer: false, springen: true, mutmachen: false, tippfehler: false, erwartet: frage.antworten };
  }

  if (getippt === AUFGEBEN) {
    return { richtig: false, leer: false, springen: false, mutmachen: true, tippfehler: false, erwartet: frage.antworten };
  }

  const richtig = frage.antworten.some(
    (antwort) => normalisiere(antwort) === getippt
  );

  if (richtig) {
    return { richtig: true, leer: false, springen: false, mutmachen: false, tippfehler: false, erwartet: frage.antworten };
  }

  // Die Nachsicht kommt ganz zuletzt: erst die beiden Easter Eggs, dann der
  // genaue Vergleich, und erst wenn beides nicht greift, der nachsichtige.
  const tippfehler = tippfehlerErlaubt && frage.antworten.some(
    (antwort) => fastGleich(getippt, normalisiere(antwort))
  );

  return { richtig: tippfehler, leer: false, springen: false, mutmachen: false, tippfehler, erwartet: frage.antworten };
}

/**
 * Mischt einen Kartenstapel (Fisher-Yates).
 * Der Zufall wird hereingereicht, damit der Test das Ergebnis vorhersagen kann.
 * Das ist dasselbe Prinzip wie beim Datum: Seiteneffekte nach außen schieben.
 */
export function mische(karten, zufall = Math.random) {
  const kopie = [...karten];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}
