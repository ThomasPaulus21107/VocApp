// Prueft, was sich die App ueber Wochen merkt. Reine Funktionen -- der alte
// Stand geht rein, ein neuer kommt raus, und der alte bleibt unangetastet.
import { describe, it, expect } from 'vitest';
import {
  merkeGezogen, verrechne, zuletztVon, schluessel,
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

  it('schreibt den Modus und die Zeit in den Verlauf', () => {
    // Ohne den Modus waere die Auswertung spaeter nicht zu retten: eine
    // Antwort in der Arbeit ist nicht dieselbe Evidenz wie eine im Uebungsblatt.
    const stand = verrechne(LEER, antwort({ modus: 'arbeit' }), 1234);
    expect(stand.verlauf).toEqual([{
      id: 'uv-001', form: 'simple-past', ausgang: 'richtig',
      versuch: 0, tipp: false, modus: 'arbeit', zeit: 1234,
    }]);
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
