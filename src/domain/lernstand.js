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
export const LEER = { rundeNr: 0, einheiten: {}, verlauf: [] };

// Etwa 50 Runden zu 15 Antworten. Der Verlauf ist das Gegengift gegen das
// Festlegen: aus ihm laesst sich ein anderes Koennen-Modell neu rechnen,
// statt es nur fortzuschreiben. Er waechst nicht -- was hinten hereinkommt,
// faellt vorne heraus.
export const VERLAUF_MAX = 750;

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
    einheiten[name] = { ...(einheiten[name] ?? frisch()), zuletzt: stand.rundeNr };
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
 */
export function verrechne(stand, ergebnis, jetzt) {
  const { id, form, ausgang, versuch, tipp, modus, punkte = 0 } = ergebnis;
  const name = schluessel(id, form);
  const alt = stand.einheiten[name] ?? frisch();

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
    { id, form, ausgang, versuch, tipp, modus, punkte, zeit: jetzt }];

  return {
    ...stand,
    einheiten: { ...stand.einheiten, [name]: neu },
    verlauf: verlauf.slice(-VERLAUF_MAX),
  };
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
