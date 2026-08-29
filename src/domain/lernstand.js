// Was die App sich ueber Wochen merkt: wie oft eine Vokabel dran war und wie
// es ausging. Reine Funktionen -- rein kommt der alte Stand, raus ein neuer.
// Kein DOM, kein Speichern, und vor allem kein new Date(): die Zeit wird
// hereingereicht, sonst waere kein Test vorhersagbar.
//
// Stufe 1 aus roadmap/implemented/feature-lernstand-2026-08-29-1531.md: alles liegt lokal und
// gehoert einer Person -- naemlich der, die dieses Geraet benutzt. Stufe 2
// schiebt dieselben Zahlen nach Postgres, wenn es mehrere Leute gibt.
//
// NICHT zu verwechseln mit lernpotential.js. Das holt zurueck, was in DIESER
// Runde danebenging, sofort. Hier geht es um die Geschichte ueber Wochen.

/** Wie eine Karte ausgegangen ist. Mehr Faelle gibt es nicht. */
export const AUSGAENGE = {
  RICHTIG: 'richtig',
  FALSCH: 'falsch',
  UEBERSPRUNGEN: 'uebersprungen',
  AUFGEGEBEN: 'aufgegeben',
};

/** Der Stand, bevor je etwas geuebt wurde. */
export const LEER = { rundeNr: 0, einheiten: {}, verlauf: [], tage: {} };

// Etwa 50 Runden zu 15 Antworten. Der Verlauf ist das Gegengift gegen das
// Festlegen: aus ihm laesst sich ein anderes Koennen-Modell neu rechnen,
// statt es nur fortzuschreiben. Er waechst nicht -- was hinten hereinkommt,
// faellt vorne heraus.
export const VERLAUF_MAX = 750;

// Wie viele Tage aufgehoben werden. Ein Tag kostet ein paar Dutzend Byte, ein
// Jahr also kaum mehr als eine Runde. Der Verlauf oben taugt dafuer NICHT:
// wer viel uebt, verliert dort die alten Tage nach ein paar Wochen.
export const TAGE_MAX = 400;

/**
 * Der Name, unter dem eine Einheit gemerkt wird.
 *
 * Die Einheit ist Karte PLUS Form: "to write" kann im simple past sitzen und
 * im Partizip nicht. Eine normale Vokabel hat keine Formen, dort ist der
 * Name einfach die id.
 */
export function schluessel(id, form) {
  return form ? `${id}|${form}` : id;
}

/** Eine Einheit, von der es noch nichts zu berichten gibt. */
function frisch() {
  return {
    zuletzt: -1,        // in welcher Runde zuletzt gezogen
    dran: 0,            // wie oft beantwortet
    summe: 0,           // die Kartenpunkte aller Antworten zusammen
    ersterVersuch: 0,   // auf Anhieb richtig
    zweiterVersuch: 0,  // richtig, aber erst nach der Korrekturchance
    falsch: 0,
    uebersprungen: 0,   // mit "s" weggeklickt
    aufgegeben: 0,      // "keine Ahnung"
    tipps: 0,           // wie oft ein Tipp geholt wurde
  };
}

/**
 * Ein Eintrag mit allen Feldern, die es HEUTE gibt.
 *
 * Ein Stand aus der Zeit vor dem Score kennt `summe` nicht -- ohne das hier
 * rechnet die App mit undefined weiter, und aus dem Score wird "NaN %".
 */
function vollstaendig(eintrag) {
  if (!eintrag) return frisch();

  // Geprueft wird der Eintrag SO WIE ER KAM. Nach dem Zusammenlegen unten
  // waere eine fehlende Summe nicht mehr von einer echten 0 zu unterscheiden.
  //
  // Fehlt sie, oder ist sie beim Speichern zu null geworden (JSON kennt kein
  // NaN), sind die Punkte dieser Vokabel nicht mehr zu retten: gezaehlt wird
  // neu, nur wann sie zuletzt dran war, bleibt stehen.
  if (typeof eintrag.summe !== 'number') return { ...frisch(), zuletzt: eintrag.zuletzt ?? -1 };

  return { ...frisch(), ...eintrag };
}

/**
 * Die gezogene Runde vermerken: jede Einheit bekommt die aktuelle
 * Rundennummer, dann zaehlt die Runde weiter.
 *
 * Das passiert beim ZIEHEN und nicht beim Beantworten. Wer eine Runde
 * abbricht, hat die Karten trotzdem gesehen -- sie sollen nicht sofort
 * wieder drankommen.
 */
export function merkeGezogen(stand, gezogen) {
  const einheiten = { ...stand.einheiten };

  for (const { karte, form } of gezogen) {
    const name = schluessel(karte.id, form);
    einheiten[name] = { ...vollstaendig(einheiten[name]), zuletzt: stand.rundeNr };
  }

  return { ...stand, rundeNr: stand.rundeNr + 1, einheiten };
}

/**
 * Eine beantwortete Karte verbuchen. `versuch` ist 0 beim ersten Anlauf und
 * 1 nach der Korrekturchance; `tipp` sagt, ob ein Tipp geholt wurde.
 *
 * `punkte` ist dieselbe Zahl zwischen 0 und 1, die auch in die Note eingeht --
 * app.js rechnet sie mit punkteFuerKarte() aus. Sie wird hier aufsummiert;
 * geteilt durch `dran` ergibt das den Score der Vokabel.
 *
 * Der Modus steht mit im Verlauf, und das ist wichtig: eine Antwort im
 * Uebungsblatt (mit Tipp und zweitem Versuch) ist nicht dieselbe Evidenz wie
 * eine in der Arbeit. Ohne dieses Feld waere die Auswertung spaeter nicht
 * mehr zu retten.
 *
 * `wiederholung` sagt dasselbe fuer die Lernpotential-Runde: dort wird eine
 * Vokabel gefragt, die eben erst danebenging und deren Loesung gerade auf
 * dem Bildschirm stand. Sie zaehlt, aber sie wiegt anders.
 */
export function verrechne(stand, ergebnis, jetzt) {
  const { id, form, ausgang, versuch, tipp, modus, punkte = 0, tag,
    wiederholung = false } = ergebnis;
  const name = schluessel(id, form);
  const alt = vollstaendig(stand.einheiten[name]);

  const neu = { ...alt, dran: alt.dran + 1, summe: alt.summe + punkte };
  if (tipp) neu.tipps += 1;

  if (ausgang === AUSGAENGE.RICHTIG) {
    if (versuch === 0) neu.ersterVersuch += 1;
    else neu.zweiterVersuch += 1;
  } else if (ausgang === AUSGAENGE.UEBERSPRUNGEN) {
    neu.uebersprungen += 1;
  } else if (ausgang === AUSGAENGE.AUFGEGEBEN) {
    neu.aufgegeben += 1;
  } else {
    neu.falsch += 1;
  }

  // Was hinten hereinkommt, faellt vorne heraus.
  const verlauf = [...stand.verlauf,
    { id, form, ausgang, versuch, tipp, modus, wiederholung, punkte, zeit: jetzt }];

  return {
    ...stand,
    einheiten: { ...stand.einheiten, [name]: neu },
    verlauf: verlauf.slice(-VERLAUF_MAX),
    tage: zaehleTag(stand.tage, tag, ausgang, punkte),
  };
}

/**
 * Schreibt eine Antwort auf ihren Tag. Der Tag kommt als "JJJJ-MM-TT" von
 * aussen -- welcher Tag gerade ist, weiss nur, wer die Uhr kennt.
 */
function zaehleTag(tage = {}, tag, ausgang, punkte) {
  if (!tag) return tage;

  const alt = tage[tag] ?? { antworten: 0, richtig: 0, summe: 0 };
  const neu = {
    ...tage,
    [tag]: {
      antworten: alt.antworten + 1,
      richtig: alt.richtig + (ausgang === AUSGAENGE.RICHTIG ? 1 : 0),
      summe: alt.summe + punkte,
    },
  };

  // Aeltestes fliegt raus, wenn es zu viel wird. Die Schluessel sind Datums-
  // texte, die sortieren sich von allein richtig.
  const schluessel = Object.keys(neu).sort();
  if (schluessel.length <= TAGE_MAX) return neu;

  for (const alt of schluessel.slice(0, schluessel.length - TAGE_MAX)) delete neu[alt];
  return neu;
}

/**
 * Nur die Rundennummern, so wie die Auswahl sie braucht.
 * Sie soll nichts von Zaehlern wissen muessen.
 */
export function zuletztVon(einheiten) {
  const nur = {};
  for (const [name, eintrag] of Object.entries(einheiten)) {
    nur[name] = eintrag.zuletzt;
  }
  return nur;
}

/**
 * Der Score einer Einheit in Prozent: die erreichten Kartenpunkte geteilt
 * durch die Zahl der Antworten.
 *
 * Es ist dieselbe Bewertung, aus der auch die Note entsteht -- auf Anhieb
 * richtig ist ein ganzer Punkt, im zweiten Versuch ein halber, ein Tipp
 * kostet ein Zehntel, falsch und uebersprungen bringen nichts. Wer eine
 * Vokabel fuenfmal geuebt und dabei 4,6 Punkte geholt hat, steht bei 92 %.
 *
 * `null`, wenn noch nie beantwortet. Ueber Unbekanntes laesst sich nichts
 * sagen, und eine 0 waere hier eine Luege.
 */
export function score(eintrag) {
  if (!eintrag || eintrag.dran === 0) return null;
  return Math.round((eintrag.summe / eintrag.dran) * 100);
}

// Ab hier gilt eine Einheit als sicher. Die Zahl ist eine Entscheidung und
// keine Wahrheit -- wer sie strenger will, aendert sie hier.
export const SICHER_AB_PROZENT = 75;

// Ab hier ist die Sammlung als Ganzes nicht mehr am Anfang, sondern
// unterwegs. Auch das ist eine Entscheidung und keine Wahrheit.
export const UNTERWEGS_AB_PROZENT = 25;

/**
 * Teilt alle Einheiten in drei Faecher: noch nie geuebt, in Arbeit, sicher.
 *
 * `namen` ist die Liste aller Einheiten, die es ueberhaupt gibt -- die kennt
 * der Lernstand nicht, die kommt von den Karten. Was dort steht und hier
 * keinen Eintrag hat, war noch nie dran.
 *
 * Sortiert wird so, dass oben steht, was zaehlt: in Arbeit der NIEDRIGSTE
 * Score zuerst (das ist die Arbeit, die ansteht), bei den sicheren der
 * hoechste (das ist der Lohn). Was noch nie dran war, behaelt die
 * Reihenfolge der Karten.
 */
export function verteile(stand, namen) {
  const faecher = { nie: [], arbeit: [], sicher: [] };

  for (const name of namen) {
    const eintrag = stand.einheiten[name];
    const wert = score(eintrag);

    if (wert === null) faecher.nie.push({ name, score: null, dran: 0 });
    else if (wert > SICHER_AB_PROZENT) faecher.sicher.push({ name, score: wert, dran: eintrag.dran });
    else faecher.arbeit.push({ name, score: wert, dran: eintrag.dran });
  }

  // Bei gleichem Score steht vorn, was oefter dran war -- das ist der
  // sicherere Befund.
  faecher.arbeit.sort((a, b) => a.score - b.score || b.dran - a.dran);
  faecher.sicher.sort((a, b) => b.score - a.score || b.dran - a.dran);
  return faecher;
}

/**
 * Die Zahlen fuer den Ueberblick. `namen` wie bei verteile().
 */
export function uebersicht(stand, namen) {
  const faecher = verteile(stand, namen);
  const beantwortet = Object.values(stand.einheiten).filter((e) => e.dran > 0);

  return {
    gesamt: namen.length,
    geuebt: faecher.arbeit.length + faecher.sicher.length,
    sicher: faecher.sicher.length,
    runden: stand.rundeNr,
    antworten: beantwortet.reduce((summe, e) => summe + e.dran, 0),
    zuletztGeuebt: stand.verlauf.at(-1)?.zeit ?? null,
  };
}

/**
 * Wie die Sammlung als Ganzes dasteht: 'anfang', 'unterwegs' oder 'gut'.
 *
 * Gemessen wird der Anteil der Formen, die SICHER sitzen -- an derselben
 * 75-%-Marke, die auch ueber eine einzelne Vokabel entscheidet. Wer 45 von
 * 106 Formen schon einmal geuebt hat, davon aber keine sicher, steht bei
 * 0 % und damit am Anfang. Genau das soll die Seite dann auch sagen, in
 * Worten und in der Farbe des Balkens.
 */
export function stufe({ sicher, gesamt }) {
  if (gesamt === 0) return 'anfang';

  const anteil = (sicher / gesamt) * 100;
  if (anteil >= SICHER_AB_PROZENT) return 'gut';
  if (anteil >= UNTERWEGS_AB_PROZENT) return 'unterwegs';
  return 'anfang';
}

/**
 * Die letzten `anzahl` Tage, aeltester zuerst -- auch die, an denen nichts
 * passiert ist. Ein Balkendiagramm mit Luecken zeigt Fleiss ehrlicher als
 * eines, das nur die guten Tage kennt.
 *
 * `heute` ist ein Datumstext "JJJJ-MM-TT". Date wird hier nur zum Rechnen
 * benutzt, nicht zum Fragen, wie spaet es ist -- das bleibt draussen.
 */
export function fleiss(stand, heute, anzahl = 30) {
  const tage = [];
  const ms = Date.parse(`${heute}T00:00:00Z`);

  for (let zurueck = anzahl - 1; zurueck >= 0; zurueck--) {
    const tag = new Date(ms - zurueck * 86400000).toISOString().slice(0, 10);
    const eintrag = stand.tage?.[tag] ?? { antworten: 0, richtig: 0, summe: 0 };

    tage.push({
      tag,
      antworten: eintrag.antworten,
      richtig: eintrag.richtig,
      // Die Trefferquote gibt es nur an Tagen, an denen geuebt wurde.
      quote: eintrag.antworten === 0
        ? null
        : Math.round((eintrag.richtig / eintrag.antworten) * 100),
    });
  }
  return tage;
}

/** Wie viele Tage am Stueck zuletzt geuebt wurde, heute mitgezaehlt. */
export function serie(tage) {
  let serie = 0;
  for (let i = tage.length - 1; i >= 0; i--) {
    if (tage[i].antworten === 0) break;
    serie += 1;
  }
  return serie;
}
