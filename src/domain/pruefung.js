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

/**
 * Prüft eine getippte Antwort gegen eine gestellte Frage.
 * Gibt IMMER ein Ergebnis-Objekt zurück und verändert nichts.
 */
export function pruefeAntwort(eingabe, frage) {
  const getippt = normalisiere(eingabe);

  if (getippt === '') {
    return { richtig: false, leer: true, erwartet: frage.antworten };
  }

  const richtig = frage.antworten.some(
    (antwort) => normalisiere(antwort) === getippt
  );

  return { richtig, leer: false, erwartet: frage.antworten };
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
