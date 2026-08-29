// Infrastruktur. Die EINZIGE Stelle im Projekt, die localStorage kennt.
//
// domain/ darf keine Persistenz kennen, ui/ auch nicht -- deshalb dieser
// dritte Ort. Was hier liegt, gehoert dem GERAET: Einstellungen, der Stand
// der Kartenauswahl. Was einer Person gehoert (Lernstand, Punkte), gehoert
// spaeter nach Postgres und nicht hierher.
//
// Faustregel: hier darf nur liegen, was man jederzeit wegwerfen wuerde.

// Damit sich nichts mit anderen Projekten beisst, die unter localhost:5173
// laufen. Ohne den Praefix teilt sich jede Vite-App denselben Speicher.
const PRAEFIX = 'vokabelkarten.';

/**
 * Holt den Speicher, oder null, wenn es keinen gibt.
 *
 * Der try/catch ist kein Uebereifer: Safari wirft im privaten Fenster schon
 * beim ZUGRIFF auf localStorage, nicht erst beim Schreiben. Und in den Tests
 * laeuft Node, wo es die Variable gar nicht gibt.
 */
function speicher() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Legt einen Wert ab. Gibt zurueck, ob es geklappt hat -- aber niemand muss
 * hinsehen: ein fehlgeschlagenes Speichern darf die App nie anhalten.
 * Im Zweifel gilt beim naechsten Start eben der Standardwert.
 */
export function speichern(schluessel, wert) {
  const s = speicher();
  if (!s) return false;

  try {
    s.setItem(PRAEFIX + schluessel, JSON.stringify(wert));
    return true;
  } catch {
    // Voller Speicher, privates Fenster, abgeschaltete Cookies. Alles drei
    // ist ein Grund weiterzuspielen und keiner, stehen zu bleiben.
    return false;
  }
}

/**
 * Liest einen Wert. Ist nichts da oder steht dort Unsinn, kommt der
 * Standardwert zurueck -- kaputtes JSON ist derselbe Fall wie "noch nie
 * gespeichert", nur unangenehmer zu bemerken.
 */
export function lesen(schluessel, standard) {
  const s = speicher();
  if (!s) return standard;

  try {
    const roh = s.getItem(PRAEFIX + schluessel);
    return roh === null ? standard : JSON.parse(roh);
  } catch {
    return standard;
  }
}
