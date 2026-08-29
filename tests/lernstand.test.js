// Prueft, was sich die App ueber Wochen merkt. Reine Funktionen -- der alte
// Stand geht rein, ein neuer kommt raus, und der alte bleibt unangetastet.
import { describe, it, expect } from 'vitest';
import {
  merkeGezogen, verrechne, zuletztVon, schluessel,
  score, verteile, uebersicht, SICHER_AB_PROZENT,
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
    expect(LEER).toEqual({ rundeNr: 0, einheiten: {}, verlauf: [] });
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
      versuch: 0, tipp: false, modus: 'arbeit', punkte: 1, zeit: 1234,
    }]);
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
