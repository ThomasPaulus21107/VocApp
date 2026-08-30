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
// Der Ausgangskorb liegt im localStorage, und den kennt im Projekt genau eine
// Datei. Auch von hier aus wird nicht daran vorbeigegriffen.
import * as storage from './storage.js';

/*
 * Die API, die hier einmal vollstaendig stehen wird. Sie steht schon jetzt
 * hier, damit spaeter niemand die Form neu erfindet:
 *
 *   melde(e)      ein Ereignis ablegen und im Hintergrund senden  <- gebaut
 *   angemeldet()  die uid der laufenden Sitzung, oder null         <- gebaut
 *   starte()      Sitzung holen oder anonym anmelden               <- gebaut, intern
 *   lade()        einmal alles holen, danach synchron              <- feature-request-server-ist-die-wahrheit.md
 */

// Was im localStorage liegt. Alles drei ist wegwerfbar: der Korb steht auch
// im lokalen Lernstand, und ein neues Geraet ist nur ein neuer Name.
const KORB = 'postausgang';
const GERAET = 'geraet';
const NUMMER = 'nummer';

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


/**
 * Aus einem Ereignis, wie es die App kennt, wird eine Tabellenzeile.
 *
 * Rein und ohne Netz, damit es sich pruefen laesst. Zwei Dinge passieren
 * hier: `id` heisst in der Tabelle `karte` -- neben der eigenen `id` der
 * Zeile waere das sonst nicht auseinanderzuhalten -- und `zeit` wird zu einem
 * Text, den Postgres versteht.
 *
 * Was eine Art nicht hat, steht als null da. Ein 'gezogen' kennt keinen
 * Ausgang, eine 'antwort' keine Runde.
 */
export function zuEreignis(ereignis, geraet, nummer) {
  const {
    art, id, form = null, runde = null, ausgang = null, versuch = null,
    tipp = null, tippfehler = null, modus = null, wiederholung = null,
    punkte = null, zeit, tag = null,
  } = ereignis;

  return {
    geraet, nummer, art, karte: id, form, runde,
    ausgang, versuch, tipp, tippfehler, modus, wiederholung, punkte,
    zeit: new Date(zeit).toISOString(), tag,
    // `nutzer` fehlt mit Absicht: den setzt der Server aus auth.uid(). Damit
    // kann eine Zeile schon im Korb liegen, bevor es eine Sitzung gibt.
  };
}

/**
 * Der Name dieses Geraets. Einmal gewuerfelt, dann bleibt er.
 *
 * Er ist kein Geheimnis und identifiziert niemanden -- er sorgt nur dafuer,
 * dass zwei Geraete derselben Person sich nicht in die Nummern geraten.
 */
function geraetName() {
  const da = storage.lesen(GERAET, null);
  if (da) return da;

  // crypto.randomUUID gibt es seit Safari 15.4. Faellt es aus, tut es auch
  // eine Zufallszahl: gebraucht wird Eindeutigkeit, nicht Unvorhersagbarkeit.
  const neu = globalThis.crypto?.randomUUID?.()
    ?? `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  storage.speichern(GERAET, neu);
  return neu;
}

/** Die naechste laufende Nummer dieses Geraets. Zaehlt ueber Runden hinweg. */
function naechsteNummer() {
  const neu = storage.lesen(NUMMER, 0) + 1;
  storage.speichern(NUMMER, neu);
  return neu;
}

/**
 * Ein Ereignis sichern.
 *
 * Es wird NICHT gesendet, sondern ABGELEGT. Kein Netz, Flugmodus, Server
 * aus, U-Bahn: die Zeile bleibt im Korb liegen und geht beim naechsten Mal
 * raus. Ohne den Korb waere jede Antwort ohne Empfang fuer immer weg -- und
 * geuebt wird auf einem Telefon.
 *
 * Gibt nichts zurueck, worauf man warten koennte. Das ist Absicht: die App
 * darf hier nie stehenbleiben.
 */
export function melde(ereignis) {
  try {
    const zeile = zuEreignis(ereignis, geraetName(), naechsteNummer());
    storage.speichern(KORB, [...storage.lesen(KORB, []), zeile]);
  } catch {
    // Ein misslungenes Sichern kostet die Sicherung, nicht die Runde.
    return;
  }
  versende();
}

// Nur ein Versand auf einmal. Sonst schickten fuenfzehn Antworten in Folge
// fuenfzehn ueberlappende Anfragen, die einander ueberholen.
let laeuft = false;

/**
 * Leert den Korb, so weit es geht. Wirft nie und wartet auf niemanden.
 *
 * ANGEMELDET WIRD HIER, nicht beim Laden der Seite. Sonst legte jeder
 * Seitenaufruf einen anonymen Nutzer an -- ein neugieriger Klick, ein
 * Crawler, ein privates Fenster, jedes Mal eine Zeile in auth.users. Wer die
 * Seite nur ansieht, bekommt kein Konto; wer eine Karte beantwortet, schon.
 */
async function versende() {
  if (laeuft) return;
  laeuft = true;

  try {
    while (storage.lesen(KORB, []).length > 0) {
      const korb = storage.lesen(KORB, []);

      // Ohne Sitzung bleibt alles liegen. Beim naechsten melde() oder beim
      // naechsten Start wird es wieder versucht.
      if (!(await starte())) return;

      const { error } = await client
        .from('ereignisse')
        // Bricht die Verbindung ab, nachdem der Server geschrieben, aber
        // bevor die App es erfahren hat, schickt der naechste Anlauf
        // dieselben Zeilen -- und es passiert nichts. Ohne das waere der
        // Korb eine Maschine, die Antworten vervielfaeltigt.
        .upsert(korb, { onConflict: 'nutzer,geraet,nummer', ignoreDuplicates: true });
      if (error) return;

      // Nur wegnehmen, was gerade wirklich rausging. Waehrend des Versands
      // koennen hinten neue Zeilen dazugekommen sein -- melde() haengt immer
      // an, nie davor.
      storage.speichern(KORB, storage.lesen(KORB, []).slice(korb.length));
    }
  } catch {
    // Bleibt liegen. Der naechste Anlauf kommt von allein.
  } finally {
    laeuft = false;
  }
}

/**
 * Was vom letzten Mal liegengeblieben ist, noch einmal versuchen.
 *
 * Gehoert an den Start der App. Ohne diesen Aufruf bleibt ein voller Korb
 * liegen, bis jemand die naechste Karte beantwortet -- wer im Flugmodus
 * geuebt und die App danach geschlossen hat, verloere seine Antworten bis zur
 * uebernaechsten Sitzung.
 *
 * Es ist KEIN Anmelden: ist der Korb leer, passiert gar nichts, und wer die
 * Seite nur ansieht, bekommt weiterhin kein Konto.
 */
export function holeNach() {
  versende();
}

/** Wie viele Zeilen noch auf ihren Versand warten. Fuer die Tests. */
export function korbGroesse() {
  return storage.lesen(KORB, []).length;
}
