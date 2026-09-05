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

import { punkteFuerKarte } from './note.js';

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
    wiederholung = false, tippfehler = false } = ergebnis;
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
    { id, form, ausgang, versuch, tipp, tippfehler, modus, wiederholung, punkte, zeit: jetzt }];

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
 * kostet ein Zehntel, ein durchgelassener Tippfehler zwei, falsch und
 * uebersprungen bringen nichts. Wer eine
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

// So oft muss eine Einheit mindestens beantwortet worden sein, bevor sie als
// stabil gelernt gilt. Ohne diese Huerde stuende eine Vokabel, die genau
// einmal richtig war, sofort bei 100 Prozent -- ein einziger Treffer ist
// aber kein Beweis, sondern ein Zufall.
export const SICHER_AB_ANTWORTEN = 3;

/**
 * Teilt alle Einheiten in drei Faecher: noch nie geuebt, in Arbeit, sicher.
 *
 * `namen` ist die Liste aller Einheiten, die es ueberhaupt gibt -- die kennt
 * der Lernstand nicht, die kommt von den Karten. Was dort steht und hier
 * keinen Eintrag hat, war noch nie dran.
 *
 * Sortiert wird so, dass oben steht, was gerade an der Kippe ist: in Arbeit
 * der HOECHSTE Score zuerst (das ist fast geschafft), bei den stabilen der
 * NIEDRIGSTE (das rutscht als Erstes wieder ab). Was noch nie dran war,
 * behaelt die Reihenfolge der Karten.
 */
function zaehlerAusVerlauf(verlauf) {
  const zu = {};

  for (const eintrag of verlauf) {
    const name = schluessel(eintrag.id, eintrag.form);
    const alt = zu[name] ?? { dran: 0, summe: 0 };
    zu[name] = { dran: alt.dran + 1, summe: alt.summe + punkteVon(eintrag) };
  }
  return zu;
}

/**
 * Die Zaehler einer Einheit -- und wenn die nichts taugen, die aus dem
 * Verlauf.
 *
 * Zwei Faelle brauchen das, beide aus der Zeit vor dem Score:
 *
 *   - Ein Eintrag, den vollstaendig() zurueckgesetzt hat, weil ihm die Summe
 *     fehlte. Er steht auf null und die Vokabel saehe aus, als waere sie nie
 *     dran gewesen -- obwohl der Verlauf ihre Antworten noch kennt.
 *   - Ein alter Eintrag, der seitdem nicht wieder beantwortet wurde. Er hat
 *     `dran`, aber keine `summe`, und der Score kaeme als NaN heraus.
 *
 * In beiden Faellen weiss der Verlauf mehr als der Zaehler, und dann hat der
 * Verlauf recht. Er reicht 750 Antworten zurueck; was aelter ist, bleibt
 * verloren.
 */
function brauchbar(eintrag, vomVerlauf) {
  const wert = score(eintrag);
  if (wert !== null && Number.isFinite(wert)) return eintrag;
  return vomVerlauf ?? eintrag ?? null;
}

/* =========================================================
   WIE GRUEN EINE VOKABEL IST, MATILDA

   Eine Farbe je Vokabel, und sie sagt zweierlei auf einmal:
   wie gut es lief UND wie oft. Gerechnet wird mit der
   PUNKTSUMME -- allen Einzelergebnissen zusammen.

     dreimal mit 0,5 abgeschlossen  ->  1,5
     fuenfmal voll getroffen        ->  5,0

   Daraus werden elf Stufen:

     0            rot        noch nichts geholt
     1 bis 9      der Verlauf von rot ueber orange nach gruen
     10           tiefgruen  ab 3,0 Punkten

   Der Deckel bei 3,0 ist eine Entscheidung und keine
   Wahrheit: er ist erreicht, wenn eine Vokabel dreimal
   sauber sass. Wer strenger will, aendert ihn hier.

   Warum die Summe und nicht der Score: 100 Prozent aus einer
   einzigen Antwort sind kein Beweis, sondern ein Zufall. Die
   Summe waechst nur, wenn wirklich geuebt wurde.
   ========================================================= */
export const FARBSTUFEN = 11;
export const TIEFGRUEN_AB = 3;

export function farbstufe(summe) {
  // Auch Minuspunkte sind rot: Tipps koennen eine Vokabel unter null druecken.
  if (!Number.isFinite(summe) || summe <= 0) return 0;
  if (summe >= TIEFGRUEN_AB) return FARBSTUFEN - 1;

  // Zehn gleich breite Schritte bis zum Deckel. Ein Hauch von Punkten hebt
  // schon auf Stufe 1 -- "hat angefangen" soll man sehen.
  const schritt = TIEFGRUEN_AB / (FARBSTUFEN - 1);
  return Math.ceil(summe / schritt);
}

/**
 * Wie weit eine Vokabel auf der Skala ist, in Prozent -- dieselbe Rechnung wie
 * farbstufe(), nur als Zahl statt als Farbe.
 *
 * 3,0 Punkte sind 100 %, 0 Punkte sind 0 %. Ueber dem Deckel wird nicht weiter
 * gezaehlt: 4,5 Punkte sind auch 100 %, sonst haetten Vokabeln, die seit
 * Wochen sitzen, dreistellige Zahlen.
 *
 * NICHT zu verwechseln mit score(): der sagt, welchen ANTEIL der moeglichen
 * Punkte eine Vokabel geholt hat -- 100 % kann dort auch aus einer einzigen
 * Antwort kommen. Hier zaehlt, was zusammengekommen ist.
 */
export function reifegrad(summe) {
  if (!Number.isFinite(summe) || summe <= 0) return 0;
  return Math.min(100, Math.round((summe / TIEFGRUEN_AB) * 100));
}

export function verteile(stand, namen) {
  const faecher = { nie: [], arbeit: [], sicher: [] };
  const ausVerlauf = zaehlerAusVerlauf(stand.verlauf);

  for (const name of namen) {
    const eintrag = brauchbar(stand.einheiten[name], ausVerlauf[name]);
    const wert = score(eintrag);

    // Die Summe wandert mit: an ihr haengt die Farbe, siehe farbstufe().
    const summe = eintrag?.summe ?? 0;

    if (wert === null) faecher.nie.push({ name, score: null, dran: 0, summe: 0 });
    // Stabil ist nur, was gut UND oft genug war. Wer die Huerde reisst,
    // bleibt in Arbeit -- auch mit 100 Prozent aus einer einzigen Antwort.
    else if (wert > SICHER_AB_PROZENT && eintrag.dran >= SICHER_AB_ANTWORTEN) {
      faecher.sicher.push({ name, score: wert, dran: eintrag.dran, summe });
    } else faecher.arbeit.push({ name, score: wert, dran: eintrag.dran, summe });
  }

  // Oben steht jeweils, was gerade an der Kippe ist: in Arbeit das, was fast
  // geschafft ist, und bei den stabilen das, was als Erstes wieder
  // abzurutschen droht. Bei gleichem Score steht vorn, was oefter dran war --
  // das ist der sicherere Befund.
  faecher.arbeit.sort((a, b) => b.score - a.score || b.dran - a.dran);
  faecher.sicher.sort((a, b) => a.score - b.score || b.dran - a.dran);
  return faecher;
}

/**
 * Zu jeder Einheit ihr Fach: 'nie', 'arbeit' oder 'sicher'.
 *
 * Dieselbe Einteilung wie verteile(), nur andersherum aufgeschrieben -- die
 * Auswahl fragt nach dem Fach EINER Einheit und nicht nach ganzen Listen.
 */
export function faecherVon(stand, namen) {
  const zu = {};
  const faecher = verteile(stand, namen);

  for (const fach of Object.keys(faecher)) {
    for (const { name } of faecher[fach]) zu[name] = fach;
  }
  return zu;
}

/**
 * Die Punktsumme je Einheit -- alle bisherigen Einzelergebnisse zu EINER Zahl
 * zusammengerechnet. Fuer die Auswahl innerhalb des Fachs "in Arbeit", siehe
 * QUOTE in domain/auswahl.js.
 *
 * Warum die Summe und nicht der Score: der Score sagt, wie GUT es lief, die
 * Zahl der Antworten, wie OFT. Die Summe traegt beides in sich, weil jede
 * Antwort sie um ihren eigenen Wert weiterschiebt -- 1 auf Anhieb, 0,5 im
 * zweiten Versuch, minus 0,1 fuer einen Tipp. Zwanzig knappe Runden stehen
 * damit ueber zwei glatten.
 *
 * Was nie dran war, hat 0. Das ist kein Sonderfall: es hat auch nichts
 * gesammelt.
 */
export function summenVon(stand, namen) {
  const zu = {};
  const ausVerlauf = zaehlerAusVerlauf(stand.verlauf);

  for (const name of namen) {
    const eintrag = brauchbar(stand.einheiten[name], ausVerlauf[name]);
    zu[name] = eintrag?.summe ?? 0;
  }
  return zu;
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
 * Was eine einzelne Antwort im Verlauf wert war.
 *
 * Alte Zeilen kennen das Feld `punkte` nicht -- es kam erst mit dem Score
 * dazu. Ohne diese Rechnung stuende bei ihnen 0, auch wenn sie richtig
 * waren. Nachgerechnet wird mit derselben Formel, aus der die Zahl damals
 * entstanden waere.
 */
export function punkteVon(eintrag) {
  if (typeof eintrag.punkte === 'number') return eintrag.punkte;
  if (eintrag.ausgang !== AUSGAENGE.RICHTIG) return 0;
  return punkteFuerKarte({
    versuch: eintrag.versuch, tipp: eintrag.tipp, tippfehler: eintrag.tippfehler,
  });
}

/**
 * Was der Verlauf ueber EINE Einheit weiss, neueste Antwort zuerst.
 *
 * Der Ringpuffer reicht 750 Antworten zurueck -- was aelter ist, steht nicht
 * mehr drin. Eine leere Liste heisst also nicht "nie geuebt", sondern nur
 * "nicht mehr im Verlauf". Die Zaehler in `einheiten` wissen es weiter.
 */
export function verlaufZu(stand, name) {
  return stand.verlauf
    .filter((eintrag) => schluessel(eintrag.id, eintrag.form) === name)
    .reverse();
}

// Nach dieser Pause hat jemand aufgehoert und spaeter neu angefangen -- eine
// abgebrochene Runde wird dadurch nicht mit der naechsten verklebt.
export const PAUSE_MS = 30 * 60 * 1000;

/**
 * Der Verlauf, in Runden zerlegt: neueste zuerst.
 *
 * Der Verlauf schreibt keine Rundennummer mit, also wird sie hier
 * zurueckgerechnet. Eine neue Runde faengt an, wenn eines davon zutrifft:
 *
 *   1. es ist die erste Antwort ueberhaupt
 *   2. der Modus wechselt -- Uebungsblatt und Arbeit sind nie dieselbe Runde
 *   3. eben lief die Wiederholung, jetzt nicht mehr: die Wiederholung ist
 *      das Ende einer Runde, was danach kommt, ist die naechste
 *   4. die laufende Runde hat ihre `groesse` Karten voll (die Wiederholung
 *      zaehlt dabei NICHT mit, sie zieht keine neuen Karten)
 *   5. es lag eine lange Pause dazwischen -- jemand hat abgebrochen
 *
 * Warum nicht einfach ein Feld mitschreiben? Weil das nur fuer alles gaelte,
 * was ab heute dazukommt. So gilt es auch fuer den Bestand: alte Antworten
 * kennen die Wiederholung noch gar nicht, bei ihnen greift Regel 4 allein --
 * und das ist genau richtig, denn frueher stand die Wiederholung nicht im
 * Verlauf.
 *
 * Sollte die Rundengroesse einmal schwanken (Leitner), traegt diese Rechnung
 * nicht mehr, und dann ist eine mitgeschriebene Nummer faellig.
 */
export function runden(stand, groesse = 15, pause = PAUSE_MS) {
  const alle = [];
  let vorige = null;

  for (const eintrag of stand.verlauf) {
    const laufend = alle.at(-1);

    const neueRunde = !laufend
      || eintrag.modus !== vorige.modus
      || (vorige.wiederholung && !eintrag.wiederholung)
      // Nur eine neue KARTE kann die Runde vollmachen. Eine Wiederholung
      // zieht keine, sie gehoert immer noch zur laufenden Runde.
      || (!eintrag.wiederholung && laufend.karten >= groesse)
      || eintrag.zeit - laufend.ende > pause;

    if (neueRunde) {
      alle.push({
        beginn: eintrag.zeit, ende: eintrag.zeit, modus: eintrag.modus,
        antworten: 0, karten: 0, richtig: 0, punkte: 0,
      });
    }

    const runde = alle.at(-1);
    runde.ende = eintrag.zeit;
    runde.antworten += 1;
    // `karten` zaehlt nur den ersten Durchgang -- daran haengt Regel 4.
    if (!eintrag.wiederholung) runde.karten += 1;
    runde.punkte += eintrag.punkte ?? 0;
    if (eintrag.ausgang === AUSGAENGE.RICHTIG) runde.richtig += 1;

    vorige = eintrag;
  }

  // Die Quote ist dieselbe Rechnung wie bei den Tagen: Treffer durch
  // Antworten. Ohne Antworten gibt es keine Runde, also teilt hier niemand
  // durch null.
  for (const runde of alle) {
    runde.quote = Math.round((runde.richtig / runde.antworten) * 100);
  }

  return alle.reverse();
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
