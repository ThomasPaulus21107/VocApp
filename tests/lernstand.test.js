// Prueft, was sich die App ueber Wochen merkt. Reine Funktionen -- der alte
// Stand geht rein, ein neuer kommt raus, und der alte bleibt unangetastet.
import { describe, it, expect } from 'vitest';
import {
  merkeGezogen, verrechne, zuletztVon, schluessel,
  score, verteile, uebersicht, stufe, verlaufZu, punkteVon, runden, PAUSE_MS, fleiss, serie,
  SICHER_AB_PROZENT, TAGE_MAX,
  AUSGAENGE, LEER, VERLAUF_MAX,
} from '../src/domain/lernstand.js';

const karte = (id) => ({ id, formen: {} });
const gezogen = (...ids) => ids.map((id) => ({ karte: karte(id), form: 'simple-past' }));

/** Eine Antwort, wie app.js sie meldet. */
function antwort(ueberschreiben = {}) {
  return {
    id: 'uv-001',
    form: 'simple-past',
    ausgang: AUSGAENGE.RICHTIG,
    versuch: 0,
    tipp: false,
    modus: 'uebungsblatt',
    punkte: 1,          // auf Anhieb richtig, ohne Tipp
    tag: '2026-08-29',
    ...ueberschreiben,
  };
}

describe('schluessel', () => {
  it('haengt die Form an die id', () => {
    expect(schluessel('uv-001', 'simple-past')).toBe('uv-001|simple-past');
  });

  it('laesst normale Vokabeln ohne Form', () => {
    expect(schluessel('demo-001', null)).toBe('demo-001');
  });
});

describe('merkeGezogen', () => {
  it('schreibt die gezogenen Einheiten auf die Rundennummer und zaehlt weiter', () => {
    const stand = merkeGezogen(LEER, gezogen('uv-001', 'uv-002'));

    expect(stand.rundeNr).toBe(1);
    expect(stand.einheiten['uv-001|simple-past'].zuletzt).toBe(0);
    expect(stand.einheiten['uv-002|simple-past'].zuletzt).toBe(0);
  });

  it('laesst gezaehlte Antworten in Ruhe', () => {
    // Ziehen sagt nur "war dran", nicht "ging gut aus".
    let stand = verrechne(LEER, antwort(), 1000);
    stand = merkeGezogen(stand, gezogen('uv-001'));

    expect(stand.einheiten['uv-001|simple-past'].ersterVersuch).toBe(1);
    expect(stand.einheiten['uv-001|simple-past'].zuletzt).toBe(0);
  });

  it('laesst den alten Stand unveraendert', () => {
    merkeGezogen(LEER, gezogen('uv-001'));
    expect(LEER).toEqual({ rundeNr: 0, einheiten: {}, verlauf: [], tage: {} });
  });
});

describe('verrechne', () => {
  it('zaehlt einen Treffer auf Anhieb', () => {
    const e = verrechne(LEER, antwort(), 1000).einheiten['uv-001|simple-past'];
    expect(e).toMatchObject({ dran: 1, ersterVersuch: 1, zweiterVersuch: 0, falsch: 0 });
  });

  it('unterscheidet den zweiten Versuch vom ersten', () => {
    const e = verrechne(LEER, antwort({ versuch: 1 }), 1000).einheiten['uv-001|simple-past'];
    expect(e).toMatchObject({ dran: 1, ersterVersuch: 0, zweiterVersuch: 1 });
  });

  it('haelt Falsch, Uebersprungen und Aufgegeben auseinander', () => {
    // Drei verschiedene Dinge: nicht gekonnt, weggeklickt, um Hilfe gerufen.
    let stand = LEER;
    for (const ausgang of [AUSGAENGE.FALSCH, AUSGAENGE.UEBERSPRUNGEN, AUSGAENGE.AUFGEGEBEN]) {
      stand = verrechne(stand, antwort({ ausgang }), 1000);
    }

    expect(stand.einheiten['uv-001|simple-past']).toMatchObject({
      dran: 3, falsch: 1, uebersprungen: 1, aufgegeben: 1,
    });
  });

  it('zaehlt Tipps getrennt vom Ausgang', () => {
    const e = verrechne(LEER, antwort({ tipp: true }), 1000).einheiten['uv-001|simple-past'];
    expect(e).toMatchObject({ ersterVersuch: 1, tipps: 1 });
  });

  it('trennt die Formen derselben Karte', () => {
    let stand = verrechne(LEER, antwort({ form: 'infinitive' }), 1000);
    stand = verrechne(stand, antwort({ form: 'simple-past', ausgang: AUSGAENGE.FALSCH }), 1000);

    expect(stand.einheiten['uv-001|infinitive'].ersterVersuch).toBe(1);
    expect(stand.einheiten['uv-001|simple-past'].falsch).toBe(1);
  });

  it('schreibt Modus, Punkte und Zeit in den Verlauf', () => {
    // Ohne den Modus waere die Auswertung spaeter nicht zu retten: eine
    // Antwort in der Arbeit ist nicht dieselbe Evidenz wie eine im Uebungsblatt.
    const stand = verrechne(LEER, antwort({ modus: 'arbeit' }), 1234);
    expect(stand.verlauf).toEqual([{
      id: 'uv-001', form: 'simple-past', ausgang: 'richtig',
      versuch: 0, tipp: false, tippfehler: false, modus: 'arbeit',
      wiederholung: false, punkte: 1, zeit: 1234,
    }]);
  });

  it('merkt sich, ob die Antwort aus der Wiederholung kam', () => {
    // Die Lernpotential-Runde zaehlt mit, aber sie wiegt anders: dort war die
    // Loesung eben noch zu sehen. Ohne das Feld waere das spaeter nicht mehr
    // auseinanderzuhalten.
    const stand = verrechne(LEER, antwort({ wiederholung: true }), 1234);

    expect(stand.verlauf[0].wiederholung).toBe(true);
    // Gezaehlt wird sie wie jede andere Antwort.
    expect(stand.einheiten['uv-001|simple-past']).toMatchObject({ dran: 1, summe: 1 });
  });

  it('summiert die Punkte auf', () => {
    let stand = verrechne(LEER, antwort({ punkte: 1 }), 1);
    stand = verrechne(stand, antwort({ punkte: 0.5, versuch: 1 }), 2);
    stand = verrechne(stand, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 3);

    expect(stand.einheiten['uv-001|simple-past']).toMatchObject({ dran: 3, summe: 1.5 });
  });

  it('laesst den Verlauf nicht wachsen', () => {
    let stand = LEER;
    for (let i = 0; i < VERLAUF_MAX + 10; i++) {
      stand = verrechne(stand, antwort({ versuch: i }), i);
    }

    expect(stand.verlauf).toHaveLength(VERLAUF_MAX);
    // Was hinten hereinkommt, faellt vorne heraus: die zehn aeltesten sind weg.
    expect(stand.verlauf[0].zeit).toBe(10);
  });

  it('laesst den alten Stand unveraendert', () => {
    const vorher = verrechne(LEER, antwort(), 1000);
    verrechne(vorher, antwort(), 2000);

    expect(vorher.einheiten['uv-001|simple-past'].dran).toBe(1);
    expect(vorher.verlauf).toHaveLength(1);
  });
});

describe('zuletztVon', () => {
  it('gibt der Auswahl nur die Rundennummern', () => {
    // Die Auswahl soll nichts von Zaehlern wissen muessen.
    const stand = merkeGezogen(LEER, gezogen('uv-001', 'uv-002'));
    expect(zuletztVon(stand.einheiten)).toEqual({
      'uv-001|simple-past': 0,
      'uv-002|simple-past': 0,
    });
  });
});

describe('score', () => {
  it('ist null, solange noch nichts beantwortet wurde', () => {
    // Ueber Unbekanntes laesst sich nichts sagen, und eine 0 waere eine Luege.
    expect(score(undefined)).toBe(null);
    expect(score(merkeGezogen(LEER, gezogen('uv-001'))
      .einheiten['uv-001|simple-past'])).toBe(null);
  });

  it('ist 100, wenn immer auf Anhieb richtig', () => {
    let stand = LEER;
    for (let i = 0; i < 3; i++) stand = verrechne(stand, antwort(), i);
    expect(score(stand.einheiten['uv-001|simple-past'])).toBe(100);
  });

  it('ist die Summe der Punkte durch die Zahl der Antworten', () => {
    // Fuenf Durchlaeufe, 4,6 Punkte zusammen -> 92 %.
    const punkte = [1, 1, 0.9, 0.9, 0.8];
    let stand = LEER;
    for (const [i, p] of punkte.entries()) stand = verrechne(stand, antwort({ punkte: p }), i);

    expect(stand.einheiten['uv-001|simple-past'].summe).toBeCloseTo(4.6);
    expect(score(stand.einheiten['uv-001|simple-past'])).toBe(92);
  });

  it('zaehlt einen halben Punkt fuer den zweiten Versuch', () => {
    const stand = verrechne(LEER, antwort({ versuch: 1, punkte: 0.5 }), 1);
    expect(score(stand.einheiten['uv-001|simple-past'])).toBe(50);
  });

  it('rundet auf ganze Prozent', () => {
    let stand = LEER;
    stand = verrechne(stand, antwort(), 1);
    stand = verrechne(stand, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 2);
    stand = verrechne(stand, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 3);
    expect(score(stand.einheiten['uv-001|simple-past'])).toBe(33);
  });
});

describe('verteile', () => {
  const namen = ['uv-001|simple-past', 'uv-002|simple-past', 'uv-003|simple-past'];

  it('legt alles ins Fach "nie", solange nichts beantwortet wurde', () => {
    const faecher = verteile(LEER, namen);
    expect(faecher.nie.map((e) => e.name)).toEqual(namen);
    expect(faecher.arbeit).toHaveLength(0);
    expect(faecher.sicher).toHaveLength(0);
  });

  it('zaehlt gezogen, aber nicht beantwortet weiter als "nie"', () => {
    // Gesehen ist nicht geuebt.
    const stand = merkeGezogen(LEER, gezogen('uv-001'));
    expect(verteile(stand, namen).nie).toHaveLength(3);
  });

  it('trennt bei mehr als 75 Prozent', () => {
    expect(SICHER_AB_PROZENT).toBe(75);

    // uv-001: 3 von 4 Punkten = 75 % -> genau NICHT sicher.
    let stand = LEER;
    for (let i = 0; i < 3; i++) stand = verrechne(stand, antwort(), i);
    stand = verrechne(stand, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 4);

    // uv-002: 4 von 4 = 100 % -> sicher.
    for (let i = 0; i < 4; i++) stand = verrechne(stand, antwort({ id: 'uv-002' }), i);

    const faecher = verteile(stand, namen);
    expect(faecher.arbeit.map((e) => e.name)).toEqual(['uv-001|simple-past']);
    expect(faecher.sicher.map((e) => e.name)).toEqual(['uv-002|simple-past']);
    expect(faecher.nie.map((e) => e.name)).toEqual(['uv-003|simple-past']);
  });

  it('sortiert "in Arbeit" mit dem niedrigsten Score oben', () => {
    let stand = verrechne(LEER, antwort({ id: 'uv-001', punkte: 0, ausgang: AUSGAENGE.FALSCH }), 1);
    stand = verrechne(stand, antwort({ id: 'uv-002' }), 2);
    stand = verrechne(stand, antwort({ id: 'uv-002', punkte: 0, ausgang: AUSGAENGE.FALSCH }), 3);

    // uv-001 hat 0 %, uv-002 hat 50 %.
    expect(verteile(stand, namen).arbeit.map((e) => e.score)).toEqual([0, 50]);
  });

  it('sortiert "sitzt" mit dem hoechsten Score oben', () => {
    // uv-001: 4 von 4 = 100 %. uv-002: 4 von 5 = 80 %.
    let stand = LEER;
    for (let i = 0; i < 4; i++) stand = verrechne(stand, antwort(), i);
    for (let i = 0; i < 4; i++) stand = verrechne(stand, antwort({ id: 'uv-002' }), i);
    stand = verrechne(stand, antwort({ id: 'uv-002', punkte: 0, ausgang: AUSGAENGE.FALSCH }), 9);

    expect(verteile(stand, namen).sicher.map((e) => e.score)).toEqual([100, 80]);
  });
});

describe('uebersicht', () => {
  it('zaehlt geuebt und sicher auseinander', () => {
    const namen = ['uv-001|simple-past', 'uv-002|simple-past', 'uv-003|simple-past'];

    // uv-001 zweimal auf Anhieb richtig, uv-003 einmal falsch, uv-002 nie.
    let stand = merkeGezogen(LEER, gezogen('uv-001', 'uv-002', 'uv-003'));
    stand = verrechne(stand, antwort(), 1);
    stand = verrechne(stand, antwort(), 2);
    stand = verrechne(stand, antwort({ id: 'uv-003', punkte: 0, ausgang: AUSGAENGE.FALSCH }), 3);

    expect(uebersicht(stand, namen)).toMatchObject({
      gesamt: 3, geuebt: 2, sicher: 1, runden: 1, antworten: 3, zuletztGeuebt: 3,
    });
  });
});

describe('alte Staende', () => {
  // Bis Commit 4a7514e gab es kein `summe`. Wer damals schon geuebt hat, hat
  // solche Eintraege im localStorage -- und sah danach "NaN %".
  const alt = {
    ...LEER,
    einheiten: {
      'uv-001|simple-past': {
        zuletzt: 3, dran: 4, ersterVersuch: 3, zweiterVersuch: 0,
        falsch: 1, uebersprungen: 0, aufgegeben: 0, tipps: 0,
      },
    },
  };

  it('rechnet einen Eintrag ohne "summe" nicht kaputt', () => {
    const stand = verrechne(alt, antwort(), 9);
    const eintrag = stand.einheiten['uv-001|simple-past'];

    // Gezaehlt wird neu: eine Antwort, ein Punkt.
    expect(eintrag.summe).toBe(1);
    expect(eintrag.dran).toBe(1);
    expect(score(eintrag)).toBe(100);
  });

  it('behandelt eine als null zurueckgelesene Summe genauso', () => {
    // JSON kennt kein NaN -- ein einmal verdorbener Wert kommt als null wieder.
    const kaputt = {
      ...LEER,
      einheiten: { 'uv-001|simple-past': { ...alt.einheiten['uv-001|simple-past'], summe: null } },
    };

    const stand = verrechne(kaputt, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 9);
    expect(score(stand.einheiten['uv-001|simple-past'])).toBe(0);
  });

  it('behaelt beim Ziehen, wann die Karte zuletzt dran war', () => {
    const stand = merkeGezogen(alt, gezogen('uv-001'));
    expect(stand.einheiten['uv-001|simple-past']).toMatchObject({ zuletzt: 0, summe: 0, dran: 0 });
  });
});

describe('stufe', () => {
  it('nennt einen Stand ohne eine einzige sichere Form "anfang"', () => {
    // 45 von 106 schon geuebt, aber nichts davon sicher: das ist der Anfang.
    expect(stufe({ sicher: 0, gesamt: 106 })).toBe('anfang');
  });

  it('misst an derselben Marke wie eine einzelne Vokabel', () => {
    expect(stufe({ sicher: 24, gesamt: 100 })).toBe('anfang');
    expect(stufe({ sicher: 25, gesamt: 100 })).toBe('unterwegs');
    expect(stufe({ sicher: 74, gesamt: 100 })).toBe('unterwegs');
    expect(stufe({ sicher: 75, gesamt: 100 })).toBe('gut');
  });

  it('kommt mit einer leeren Sammlung klar', () => {
    expect(stufe({ sicher: 0, gesamt: 0 })).toBe('anfang');
  });
});

describe('punkteVon', () => {
  it('nimmt die gespeicherte Zahl, wenn es eine gibt', () => {
    expect(punkteVon({ punkte: 0.5, ausgang: AUSGAENGE.RICHTIG })).toBe(0.5);
    expect(punkteVon({ punkte: 0, ausgang: AUSGAENGE.FALSCH })).toBe(0);
  });

  it('rechnet sie fuer alte Zeilen nach, die das Feld nicht haben', () => {
    // Vor dem Score gab es `punkte` im Verlauf nicht. Ohne Nachrechnen
    // staende bei einer richtigen Antwort 0 -- und genau das war auf der
    // Fortschrittsseite zu sehen.
    expect(punkteVon({ ausgang: AUSGAENGE.RICHTIG, versuch: 0, tipp: false })).toBe(1);
    expect(punkteVon({ ausgang: AUSGAENGE.RICHTIG, versuch: 1, tipp: false })).toBe(0.5);
    expect(punkteVon({ ausgang: AUSGAENGE.RICHTIG, versuch: 0, tipp: true })).toBeCloseTo(0.9);
  });

  it('gibt fuer alles, was nicht richtig war, null', () => {
    expect(punkteVon({ ausgang: AUSGAENGE.FALSCH, versuch: 0, tipp: false })).toBe(0);
    expect(punkteVon({ ausgang: AUSGAENGE.AUFGEGEBEN, versuch: 0, tipp: false })).toBe(0);
  });
});

describe('verlaufZu', () => {
  it('gibt nur die Antworten dieser einen Einheit, neueste zuerst', () => {
    let stand = verrechne(LEER, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 1);
    stand = verrechne(stand, antwort({ id: 'uv-002' }), 2);
    stand = verrechne(stand, antwort(), 3);

    const meine = verlaufZu(stand, 'uv-001|simple-past');
    expect(meine.map((e) => e.zeit)).toEqual([3, 1]);
  });

  it('ist leer, wenn der Ringpuffer die Antwort nicht mehr hat', () => {
    expect(verlaufZu(LEER, 'uv-001|simple-past')).toEqual([]);
  });
});

describe('runden', () => {
  const MINUTE = 60 * 1000;

  /** `anzahl` Antworten im Minutentakt, ab `ab`. */
  function spiele(stand, anzahl, ab, extra = {}) {
    for (let i = 0; i < anzahl; i++) {
      stand = verrechne(stand, antwort(extra), ab + i * MINUTE);
    }
    return stand;
  }

  it('trennt nach der Rundengroesse', () => {
    // Zwei volle Runden am Stueck, ohne Pause dazwischen.
    const stand = spiele(LEER, 30, 0);

    const alle = runden(stand);
    expect(alle).toHaveLength(2);
    expect(alle.map((r) => r.antworten)).toEqual([15, 15]);
  });

  it('zaehlt die Wiederholung zur selben Runde', () => {
    // 15 Karten, dann drei Antworten aus dem Lernpotential.
    let stand = spiele(LEER, 15, 0);
    stand = spiele(stand, 3, 15 * MINUTE, { wiederholung: true });

    const alle = runden(stand);
    expect(alle).toHaveLength(1);
    expect(alle[0].antworten).toBe(18);
  });

  it('faengt nach der Wiederholung eine neue Runde an', () => {
    let stand = spiele(LEER, 15, 0);
    stand = spiele(stand, 2, 15 * MINUTE, { wiederholung: true });
    // Direkt weiter, ohne dass 15 neue Karten voll waeren.
    stand = spiele(stand, 4, 17 * MINUTE);

    expect(runden(stand).map((r) => r.antworten)).toEqual([4, 17]);
  });

  it('trennt beim Wechsel des Modus', () => {
    let stand = spiele(LEER, 5, 0);
    stand = spiele(stand, 5, 5 * MINUTE, { modus: 'arbeit' });

    const alle = runden(stand);
    expect(alle).toHaveLength(2);
    expect(alle.map((r) => r.modus)).toEqual(['arbeit', 'uebungsblatt']);
  });

  it('trennt nach einer langen Pause, auch wenn die Runde nicht voll war', () => {
    // Abgebrochen nach sieben Karten, Stunden spaeter neu angefangen.
    let stand = spiele(LEER, 7, 0);
    stand = spiele(stand, 7, PAUSE_MS + 10 * MINUTE);

    expect(runden(stand)).toHaveLength(2);
  });

  it('rechnet die Quote je Runde', () => {
    let stand = spiele(LEER, 3, 0);
    stand = verrechne(stand, antwort({ punkte: 0, ausgang: AUSGAENGE.FALSCH }), 4 * MINUTE);

    expect(runden(stand)[0]).toMatchObject({ antworten: 4, richtig: 3, quote: 75 });
  });

  it('hat ohne Verlauf nichts zu zeigen', () => {
    expect(runden(LEER)).toEqual([]);
  });
});

describe('die Tage', () => {
  it('zaehlt Antworten, Treffer und Punkte je Tag', () => {
    let stand = verrechne(LEER, antwort({ tag: '2026-08-28' }), 1);
    stand = verrechne(stand, antwort({ tag: '2026-08-29' }), 2);
    stand = verrechne(stand, antwort({
      tag: '2026-08-29', ausgang: AUSGAENGE.FALSCH, punkte: 0,
    }), 3);

    expect(stand.tage['2026-08-28']).toEqual({ antworten: 1, richtig: 1, summe: 1 });
    expect(stand.tage['2026-08-29']).toEqual({ antworten: 2, richtig: 1, summe: 1 });
  });

  it('vergisst die aeltesten Tage, wenn es zu viele werden', () => {
    let stand = LEER;
    // Ein Tag mehr als erlaubt -- der erste muss verschwinden.
    for (let i = 0; i <= TAGE_MAX; i++) {
      const tag = new Date(Date.UTC(2020, 0, 1) + i * 86400000).toISOString().slice(0, 10);
      stand = verrechne(stand, antwort({ tag }), i);
    }

    expect(Object.keys(stand.tage)).toHaveLength(TAGE_MAX);
    expect(stand.tage['2020-01-01']).toBeUndefined();
    expect(stand.tage['2020-01-02']).toBeDefined();
  });
});

describe('fleiss', () => {
  it('gibt genau so viele Tage zurueck wie gewuenscht, aeltester zuerst', () => {
    const tage = fleiss(LEER, '2026-08-29', 30);

    expect(tage).toHaveLength(30);
    expect(tage[0].tag).toBe('2026-07-31');
    expect(tage.at(-1).tag).toBe('2026-08-29');
  });

  it('zeigt auch die Tage, an denen nichts passiert ist', () => {
    // Ein Diagramm, das nur die guten Tage kennt, zeigt keinen Fleiss.
    const stand = verrechne(LEER, antwort({ tag: '2026-08-29' }), 1);
    const tage = fleiss(stand, '2026-08-29', 3);

    expect(tage.map((t) => t.antworten)).toEqual([0, 0, 1]);
    expect(tage.map((t) => t.quote)).toEqual([null, null, 100]);
  });

  it('rechnet die Trefferquote aus Treffern und Antworten', () => {
    let stand = verrechne(LEER, antwort({ tag: '2026-08-29' }), 1);
    stand = verrechne(stand, antwort({
      tag: '2026-08-29', ausgang: AUSGAENGE.FALSCH, punkte: 0,
    }), 2);
    stand = verrechne(stand, antwort({
      tag: '2026-08-29', ausgang: AUSGAENGE.UEBERSPRUNGEN, punkte: 0,
    }), 3);

    expect(fleiss(stand, '2026-08-29', 1)[0]).toMatchObject({
      antworten: 3, richtig: 1, quote: 33,
    });
  });
});

describe('serie', () => {
  it('zaehlt die Tage am Stueck bis heute', () => {
    let stand = LEER;
    for (const tag of ['2026-08-25', '2026-08-27', '2026-08-28', '2026-08-29']) {
      stand = verrechne(stand, antwort({ tag }), 1);
    }
    // Der 26. fehlt, also reicht die Serie nur bis zum 27.
    expect(serie(fleiss(stand, '2026-08-29', 30))).toBe(3);
  });

  it('ist null, wenn heute noch nichts war', () => {
    const stand = verrechne(LEER, antwort({ tag: '2026-08-28' }), 1);
    expect(serie(fleiss(stand, '2026-08-29', 30))).toBe(0);
  });
});
