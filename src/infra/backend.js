// Infrastruktur, zweite Naht. Die EINZIGE Stelle im Projekt, die Supabase
// kennt -- so wie storage.js die einzige ist, die localStorage kennt.
//
// Der Unterschied zwischen den beiden ist keine Geschmacksfrage, sondern der
// Grund, warum es zwei Dateien sind:
//
//                storage.js              backend.js
//   gehoert      dem GERAET              der PERSON
//   Inhalt       Toene, Kartenbeutel     Lernstand, Punkte
//   Technik      localStorage, synchron  Supabase, asynchron
//
// Ob am Kuechentisch der Ton an ist, gehoert dem Laptop. Ob `caught` sitzt,
// gehoert Matilda und muss ihr auf jedes Geraet folgen.
//
// Diese Datei baut vorerst nur die LEITUNG: Client, Konfiguration, Sitzung.
// Es fliesst noch nichts durch sie. Siehe
// roadmap/feature-request-backend-naht.md.

import { createClient } from '@supabase/supabase-js';

/*
 * Die API, die hier einmal vollstaendig stehen wird. Sie steht schon jetzt
 * hier, damit spaeter niemand die Form neu erfindet:
 *
 *   starte()      Sitzung holen oder anonym anmelden        <- gebaut
 *   angemeldet()  die uid der laufenden Sitzung, oder null  <- gebaut
 *   melde(e)      ein Ereignis in den Ausgangskorb          <- feature-request-ereignisse-melden.md
 *   lade()        einmal alles holen, danach synchron       <- feature-request-server-ist-die-wahrheit.md
 */

// Der Client, oder null wenn abgeschaltet.
//
// `undefined` heisst "noch nicht nachgesehen" und ist NICHT dasselbe wie
// null: null ist die Entscheidung, ohne Server zu laufen. Deshalb liest
// starte() die Umgebung nur, solange hier undefined steht -- ein verbinde(null)
// aus einem Test wuerde sonst beim naechsten Aufruf wieder ueberschrieben.
let client;

// Die uid der laufenden Sitzung. Kein Zustand, den jemand anders braucht --
// wer sie will, fragt angemeldet().
let nutzer = null;

/**
 * Baut den Client aus den Umgebungsvariablen, oder gibt null zurueck.
 *
 * Fehlt eine der beiden, laeuft die App ohne Server weiter. Das ist der
 * Normalfall in den Oberflaechen-Tests und der Notfall, wenn jemand ein
 * Secret im Workflow vergisst: ein vergessenes Secret darf keine weisse Seite
 * ergeben.
 *
 * Beide Werte sind oeffentlich gedacht -- sie landen im Bundle, das auf
 * GitHub Pages liegt, und das ist bei Supabase der vorgesehene Weg. Was
 * schuetzt, ist Row Level Security und nicht Geheimhaltung.
 */
function ausDerUmgebung() {
  const adresse = import.meta.env?.VITE_SUPABASE_URL;
  const schluessel = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!adresse || !schluessel) return null;

  try {
    return createClient(adresse, schluessel);
  } catch {
    // In Safaris privatem Fenster wirft schon der Zugriff auf localStorage,
    // und der Client legt seine Sitzung genau dort ab.
    return null;
  }
}

/**
 * Setzt einen eigenen Client ein -- fuer die Tests.
 *
 * `verbinde(null)` schaltet den Server ausdruecklich ab, auch wenn eine .env
 * dasteht. Ohne diese Naht waere die Datei nur mit Netz zu pruefen, und das
 * waere kein Test.
 */
export function verbinde(eigener) {
  client = eigener ?? null;
  nutzer = null;
}

/**
 * Holt die Sitzung, oder legt eine anonyme an. Gibt die uid zurueck, oder
 * null, wenn es keinen Server gibt oder es nicht geklappt hat.
 *
 * WARUM ANONYM, obwohl es noch keine Anmeldung gibt: die Reihenfolge lautet
 * "erst die Datenbank, dann die Anmeldung", und dazwischen entsteht eine
 * Luecke -- wem gehoert eine Zeile, solange niemand angemeldet ist? Eine
 * anonyme Sitzung ist ein ECHTER Nutzer mit echter auth.uid(), nur ohne
 * Mailadresse. Damit greift RLS ab der ersten Zeile, und spaeter wird aus
 * demselben Nutzer ein Konto: dieselbe uid, alle Zeilen bleiben liegen.
 *
 * Die Alternative -- ein selbst erfundener Geraeteschluessel -- haette den
 * Fehler, dass RLS nichts pruefen kann. Die Tabelle waere fuer jeden im Netz
 * les- und schreibbar.
 *
 * Wirft nie. Dieselbe Haltung wie in storage.js: ein fehlgeschlagenes
 * Anmelden darf die App nicht anhalten, es kostet nur die Sicherung.
 */
export async function starte() {
  if (client === undefined) client = ausDerUmgebung();
  if (!client) return null;

  try {
    // Erst nachsehen, ob schon eine da ist. Sonst entstuende bei jedem Start
    // ein neuer anonymer Nutzer, und der Lernstand waere jedes Mal leer.
    const { data } = await client.auth.getSession();
    if (data?.session?.user) {
      nutzer = data.session.user.id;
      return nutzer;
    }

    const { data: neue, error } = await client.auth.signInAnonymously();
    // Der haeufigste Grund fuer einen Fehler hier ist ein Schalter im
    // Dashboard: Auth -> Providers -> Anonymous sign-ins. Ohne ihn kommt 422.
    if (error || !neue?.user) return null;

    nutzer = neue.user.id;
    return nutzer;
  } catch {
    return null;
  }
}

/** Die uid der laufenden Sitzung, oder null. Synchron -- nach dem Start. */
export function angemeldet() {
  return nutzer;
}
