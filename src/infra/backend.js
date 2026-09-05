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
// Was durch diese Datei laeuft: die Sitzung (wer ist da), die Anmeldung (wie
// kommt jemand herein) und der Postausgang (was geht raus). Was noch nicht
// laeuft, ist die Gegenrichtung -- gelesen wird der Lernstand weiter aus
// localStorage. Siehe roadmap/feature-request-server-ist-die-wahrheit.md.

import { createClient } from '@supabase/supabase-js';
// Der Ausgangskorb liegt im localStorage, und den kennt im Projekt genau eine
// Datei. Auch von hier aus wird nicht daran vorbeigegriffen.
import * as storage from './storage.js';

/*
 * Die API, die hier einmal vollstaendig stehen wird. Sie steht schon jetzt
 * hier, damit spaeter niemand die Form neu erfindet:
 *
 *   melde(e)           ein Ereignis ablegen und im Hintergrund senden  <- gebaut
 *   angemeldet()       die uid der laufenden Sitzung, oder null         <- gebaut
 *   starte()           nachsehen, ob eine Sitzung da ist               <- gebaut, intern
 *   anmelden(n, p)     Name und Passwort gegen eine Sitzung tauschen   <- gebaut
 *   abmelden()         die Sitzung wegwerfen                          <- gebaut
 *   pseudonym()        der eigene Anzeigename, oder null               <- gebaut
 *   verlangeSitzung()  ohne Sitzung geht es zum Anmelden               <- gebaut
 *   lade()             einmal alles holen, danach synchron             <- feature-request-server-ist-die-wahrheit.md
 */

// Der Teil hinter dem @ einer Kontokennung. Er steht hier EINMAL, und das ist
// der ganze Punkt: eine vergessene Kopie in einer zweiten Datei sperrte ein
// Kind aus, und es faende nie heraus, warum.
//
// Die Kennung ist eine KENNUNG UND KEIN POSTFACH. Auf dieser Subdomaene steht
// nie ein Mailserver; angelegt wird ein Konto mit `email_confirm: true`, es
// wird nichts verschickt und es gibt nichts zu bestaetigen. Damit sammeln wir
// von keinem fremden Kind eine Kontaktadresse ein -- was nicht da ist, kann
// nicht abfliessen und nicht falsch adressiert werden.
//
// Auf dem Bildschirm steht sie nirgends: das Kind tippt "blauer-otter", den
// Rest haengt anmelden() an. Siehe roadmap/feature-request-konten.md.
const KONTEN_DOMAENE = 'konten.vocappulary.online';

// Was im localStorage liegt. Alles drei ist wegwerfbar: der Korb steht auch
// im lokalen Lernstand, und ein neues Geraet ist nur ein neuer Name.
const KORB = 'postausgang';
const GERAET = 'geraet';
const NUMMER = 'nummer';
const UMGEZOGEN = 'umgezogen';

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
 * Sieht nach, ob eine Sitzung da ist. Gibt die uid zurueck, oder null.
 *
 * FRUEHER STAND HIER EIN signInAnonymously(), und es war richtig, solange es
 * keine Anmeldung gab: eine anonyme Sitzung ist ein echter Nutzer mit echter
 * auth.uid(), nur ohne Kennung. Damit griff RLS ab der ersten Zeile, und der
 * Lernstand war ueber Wochen gesichert, bevor irgendjemand ein Konto hatte.
 *
 * Seit es Konten gibt, faellt sie weg -- und zwar ganz. Ein Geraet ist kein
 * Nutzer: solange jeder Browser sich seine eigene uid holt, gehoert ein
 * Lernstand einem Speicher und nicht einem Kind, und niemand kann die beiden
 * spaeter zusammenfuehren. Das Formular in anmelden.html ist ab hier der
 * einzige Weg herein. Siehe roadmap/feature-request-konten.md.
 *
 * Wirft nie. Dieselbe Haltung wie in storage.js: eine fehlende Sitzung darf
 * die App nicht anhalten, sie kostet nur die Sicherung.
 */
export async function starte() {
  if (client === undefined) client = ausDerUmgebung();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    nutzer = data?.session?.user?.id ?? null;
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
 * Name und Passwort gegen eine Sitzung tauschen. true, wenn es geklappt hat.
 *
 * Das Kind tippt "blauer-otter"; die Domaene haengt diese Zeile an, und auf
 * dem Bildschirm steht sie nirgends.
 *
 * NUR true ODER false, kein Fehlertext. Supabase unterscheidet "den Namen
 * gibt es nicht" nicht von "das Passwort ist falsch", und das soll es auch
 * nicht: ein Formular, das beides trennt, verraet jedem, der es ausprobiert,
 * welche Pseudonyme es gibt. Das Kind liest ohnehin denselben Satz.
 */
export async function anmelden(name, passwort) {
  if (client === undefined) client = ausDerUmgebung();
  if (!client) return false;

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: `${name}@${KONTEN_DOMAENE}`,
      password: passwort,
    });
    if (error || !data?.user) return false;

    nutzer = data.user.id;
    return true;
  } catch {
    return false;
  }
}

/**
 * Die Sitzung wegwerfen.
 *
 * WAS IM SPEICHER LIEGEN BLEIBT: Lernstand, Toene, Korb, Geraetename. Das ist
 * Absicht und keine Vergesslichkeit -- storage.js gehoert dem GERAET,
 * backend.js der PERSON, und die Tabelle ganz oben in dieser Datei sagt,
 * warum das zwei Dinge sind. Wer sich abmeldet, gibt sein Konto zurueck, nicht
 * den Laptop.
 *
 * Der Korb bleibt besonders bewusst liegen: was darin steht, ist beantwortet
 * worden und gehoert der uid, die es beantwortet hat. Es geht raus, sobald
 * dieselbe Person wieder da ist.
 */
export async function abmelden() {
  nutzer = null;
  if (!client) return;

  try {
    await client.auth.signOut();
  } catch {
    // Die Sitzung ist hier ohnehin schon vergessen. Bleibt der Token im
    // Speicher liegen, faengt ihn der naechste getSession() wieder ein -- und
    // das ist immer noch besser als eine Ausnahme beim Abmelden.
  }
}

/**
 * Der eigene Anzeigename aus `profile`, oder null.
 *
 * NULL IST KEIN FEHLER, sondern ein Konto, dem noch niemand ein Pseudonym
 * gegeben hat. Angelegt werden die Zeilen im Dashboard; die Tabelle hat mit
 * Absicht keine insert-Policy.
 *
 * Es kommt genau eine Zeile zurueck, dafuer sorgt RLS -- deshalb `maybeSingle`
 * und kein Filter auf die eigene uid. Ein zweiter Ort, an dem "wem gehoert
 * das" steht, waere ein zweiter Ort, an dem es falsch stehen kann.
 */
export async function pseudonym() {
  if (!client) return null;

  try {
    const { data, error } = await client.from('profile').select('pseudonym').maybeSingle();
    if (error) return null;
    return data?.pseudonym ?? null;
  } catch {
    return null;
  }
}

/**
 * Ohne Sitzung geht es zum Anmelden. true heisst: die Seite darf weiterlaufen.
 *
 * OHNE CLIENT KEIN ZWANG. Fehlen die Umgebungsvariablen, laeuft die App wie
 * bisher ohne Server weiter -- das ist der Normalfall in den
 * Oberflaechen-Tests und der Notfall, wenn jemand ein Secret im Workflow
 * vergisst. Ein vergessenes Secret darf kein ausgesperrtes Kind ergeben; es
 * kostet die Sicherung, nicht das Ueben.
 *
 * `replace` und nicht `href`: sonst fuehrte der Zurueck-Knopf auf die Seite,
 * die gerade weggeschickt hat, und von dort wieder hierher.
 */
export async function verlangeSitzung(ziel = 'anmelden.html') {
  if (client === undefined) client = ausDerUmgebung();
  if (!client) return true;
  if (await starte()) return true;

  location.replace(ziel);
  return false;
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
 * OHNE SITZUNG BLEIBT ALLES LIEGEN. Frueher meldete sich diese Stelle im
 * Notfall selbst an -- anonym, damit ein Seitenaufruf allein noch kein Konto
 * anlegt. Beides ist mit den Konten weg: angemeldet wird im Formular, und
 * ohne Anmeldung kommt niemand bis zu einer Karte. Was hier ankommt, gehoert
 * also immer schon jemandem.
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

/**
 * Der lokale Tag eines Bestandsereignisses, aus seiner Zeit zurueckgerechnet.
 *
 * Der Verlauf im Lernstand kennt die Spalte `tag` nicht -- verrechne() legt
 * sie nur in `tage` ab, nicht in die einzelne Zeile. Sie hier auf null zu
 * lassen waere aber teuer: an `tag` haengt die Fleiss-Seite, und ein Bestand
 * ohne Tage waere ein Bestand ohne Serie.
 *
 * Zurueckrechnen darf man ihn genau hier, weil der Umzug auf DEMSELBEN Geraet
 * laeuft, das die Zeile geschrieben hat -- dieselbe Zeitzone, also dasselbe
 * Ergebnis wie damals in app.js. Aus einer fremden Zeitzone waere es geraten.
 */
function tagVon(zeit) {
  return new Date(zeit).toLocaleDateString('sv');
}

/**
 * Der Bestand aus dem lokalen Verlauf geht einmalig in den Korb.
 *
 * Ohne diesen Handgriff kennt der Server nur, was seit dem Einbau passiert
 * ist -- Matildas bisher geuebte Wochen stuenden weiter allein im Browser.
 * Siehe roadmap/implemented/feature-umzug-des-bestands-2026-08-30-1815.md.
 *
 * EIGENER GERAETENAME, `umzug-<geraet>`: die Nummern des Bestands sind
 * Stellen im Verlauf und faengen bei 0 an, die des laufenden Betriebs zaehlt
 * naechsteNummer() hoch. Unter einem Namen wuerden sie sich gegenseitig auf
 * das `unique (nutzer, geraet, nummer)` setzen und einander verdraengen.
 *
 * Der Merker wird gesetzt, sobald die Zeilen IM KORB liegen, nicht erst nach
 * dem Versand. Er spart Arbeit, er ist nicht die Sicherung -- die ist das
 * unique aus der Migration, an dem ein zweiter Anlauf folgenlos abprallt.
 *
 * Versendet wird hier NICHT: der Aufruf steht in app.js unmittelbar vor
 * holeNach(), und der leert den Korb ohnehin gleich mit.
 */
export function umzug(verlauf) {
  if (storage.lesen(UMGEZOGEN, false)) return;

  try {
    const geraet = `umzug-${geraetName()}`;
    const zeilen = verlauf.map((eintrag, stelle) => zuEreignis(
      { art: 'antwort', ...eintrag, tag: tagVon(eintrag.zeit) }, geraet, stelle
    ));

    storage.speichern(KORB, [...storage.lesen(KORB, []), ...zeilen]);
    storage.speichern(UMGEZOGEN, true);
  } catch {
    // Kein Merker, kein Schaden: beim naechsten Start noch einmal. Dieselbe
    // Haltung wie in melde() -- ein misslungener Umzug kostet die Sicherung,
    // nicht die Runde.
  }
}

/** Wie viele Zeilen noch auf ihren Versand warten. Fuer die Tests. */
export function korbGroesse() {
  return storage.lesen(KORB, []).length;
}
