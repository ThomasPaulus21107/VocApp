// Prueft, WELCHE Karten drankommen. Der Kern ist nicht der Zufall, sondern
// die Abdeckung: dass kein Verb wochenlang durchrutscht.
import { describe, it, expect } from 'vitest';
import { zieheRunde, QUOTE } from '../src/domain/auswahl.js';
import { merkeGezogen, zuletztVon, schluessel, LEER } from '../src/domain/lernstand.js';

/** Ein paar erfundene Verben. Der Inhalt ist egal, die Struktur nicht. */
function verben(anzahl) {
  return Array.from({ length: anzahl }, (_, i) => ({
    id: `uv-${String(i).padStart(3, '0')}`,
    formen: {
      infinitive: { en: ['to go'], de: ['gehen'] },
      'simple-past': { en: ['went'], de: ['ging'] },
      'past-participle': { en: ['gone'], de: ['gegangen'] },
    },
  }));
}

/** Ein Wuerfel, der der Reihe nach vorgegebene Werte liefert. */
function wuerfel(...werte) {
  let i = 0;
  return () => werte[i++ % werte.length];
}

describe('zieheRunde', () => {
  it('zieht so viele Karten wie gewuenscht', () => {
    expect(zieheRunde(verben(20), 5)).toHaveLength(5);
  });

  it('nimmt alle, wenn weniger da sind als gewuenscht', () => {
    expect(zieheRunde(verben(3), 20)).toHaveLength(3);
  });

  it('bringt dieselbe Karte nie zweimal in einer Runde', () => {
    // Es gaebe genug Formen fuer 40 Einheiten -- trotzdem sind es 20 Karten.
    const gezogen = zieheRunde(verben(20), 20);
    const ids = gezogen.map((e) => e.karte.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nimmt zuerst, was noch nie dran war', () => {
    const karten = verben(10);
    // uv-000 bis uv-004 waren gerade eben dran, der Rest noch nie.
    const zuletzt = {};
    for (let i = 0; i < 5; i++) {
      zuletzt[schluessel(`uv-${String(i).padStart(3, '0')}`, 'infinitive')] = 3;
      zuletzt[schluessel(`uv-${String(i).padStart(3, '0')}`, 'simple-past')] = 3;
    }

    const gezogen = zieheRunde(karten, 5, zuletzt, 4);
    const ids = gezogen.map((e) => e.karte.id).sort();
    expect(ids).toEqual(['uv-005', 'uv-006', 'uv-007', 'uv-008', 'uv-009']);
  });

  it('wuerfelt, wenn alles gleich alt ist', () => {
    // Kleinster Wuerfelwert gewinnt. Steigend heisst: die zuerst gelisteten
    // Einheiten gewinnen -- das ist je Karte der Infinitiv.
    const steigend = zieheRunde(verben(4), 2, {}, 0, wuerfel(0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7));
    expect(steigend.map((e) => e.karte.id)).toEqual(['uv-000', 'uv-001']);
    expect(steigend.map((e) => e.form)).toEqual(['infinitive', 'infinitive']);

    // Fallend dreht beides um: die letzten Karten, und je Karte die zweite Form.
    const fallend = zieheRunde(verben(4), 2, {}, 0, wuerfel(0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0));
    expect(fallend.map((e) => e.karte.id)).toEqual(['uv-003', 'uv-002']);
    expect(fallend.map((e) => e.form)).toEqual(['simple-past', 'simple-past']);
  });

  it('gibt normalen Vokabeln keine Form', () => {
    const vokabel = [{ id: 'demo-001', en: ['dog'], de: ['Hund'] }];
    expect(zieheRunde(vokabel, 1)).toEqual([{ karte: vokabel[0], form: null }]);
  });
});

describe('die Abdeckung', () => {
  /** Spielt Runden und sammelt, was drankam. */
  function spiele(karten, anzahl, runden) {
    let stand = LEER;
    const gesehen = { karten: new Set(), einheiten: new Set() };

    for (let i = 0; i < runden; i++) {
      const zuletzt = zuletztVon(stand.einheiten);
      const gezogen = zieheRunde(karten, anzahl, zuletzt, stand.rundeNr);
      for (const e of gezogen) {
        gesehen.karten.add(e.karte.id);
        gesehen.einheiten.add(schluessel(e.karte.id, e.form));
      }
      stand = merkeGezogen(stand, gezogen);
    }
    return gesehen;
  }

  // 53 Verben, 15 Karten je Runde. Vorher dauerte es im Schnitt sechzehn
  // Runden, bis jedes einmal dran war -- und garantiert war es nie.
  it('hat nach vier Runden jedes der 53 Verben einmal gezeigt', () => {
    expect(spiele(verben(53), 15, 4).karten.size).toBe(53);
  });

  it('hat nach acht Runden jede Karte-Form-Einheit einmal gezeigt', () => {
    // 53 Verben mal zwei abgefragte Formen = 106 Einheiten.
    expect(spiele(verben(53), 15, 8).einheiten.size).toBe(106);
  });

  it('zeigt nach drei Runden noch nicht alles -- 45 von 53', () => {
    // Die Gegenprobe: der Test oben ist nicht zufaellig gruen.
    expect(spiele(verben(53), 15, 3).karten.size).toBe(45);
  });
});


describe('das Fach "in Arbeit" wird nach Punkten ausgesucht', () => {
  // Vokabeln OHNE Formen: eine Einheit je Karte. So ist die Reihenfolge im
  // Fach dieselbe wie die Reihenfolge der Karten, und der Test prueft die
  // Auswahl und nicht das Ueberspringen doppelter Karten.
  const woerter = (anzahl) => Array.from({ length: anzahl }, (_, i) => ({
    id: `v-${String(i).padStart(2, '0')}`,
  }));

  /** Alle in "arbeit", mit absteigender Punktsumme: v-00 hat am meisten. */
  function fachArbeit(anzahl) {
    const faecher = {};
    const summen = {};
    for (let i = 0; i < anzahl; i += 1) {
      faecher[`v-${String(i).padStart(2, '0')}`] = 'arbeit';
      summen[`v-${String(i).padStart(2, '0')}`] = anzahl - i;
    }
    return { faecher, summen };
  }

  it('nimmt top1, last1, mid1, top2, last2, mid2 -- in dieser Reihenfolge', () => {
    // Elf Eintraege, Summen 11 bis 1. Die Mitte ist Stelle 5, also v-05.
    const { faecher, summen } = fachArbeit(11);
    const gezogen = zieheRunde(woerter(11), 6, {}, 0, () => 0.5, faecher, summen);

    expect(gezogen.map((e) => e.karte.id))
      .toEqual(['v-00', 'v-10', 'v-05', 'v-01', 'v-09', 'v-06']);
  });

  it('fuellt die restlichen Plaetze aus demselben Fach auf', () => {
    // Acht Plaetze, sechs davon benannt -- zwei kommen aus dem Rest.
    const { faecher, summen } = fachArbeit(11);
    const gezogen = zieheRunde(woerter(11), 8, {}, 0, wuerfel(0.1, 0.9), faecher, summen);

    expect(gezogen).toHaveLength(8);
    expect(new Set(gezogen.map((e) => e.karte.id)).size).toBe(8);
  });

  it('kommt mit einem Fach klar, das kleiner ist als die benannten Plaetze', () => {
    // Bei drei Eintraegen faellt top1 mit last2 zusammen. Es darf trotzdem
    // keine Karte doppelt kommen und nichts fehlen.
    const { faecher, summen } = fachArbeit(3);
    const gezogen = zieheRunde(woerter(3), 8, {}, 0, () => 0.5, faecher, summen);

    expect(gezogen.map((e) => e.karte.id).sort()).toEqual(['v-00', 'v-01', 'v-02']);
  });

  it('nimmt die haerteste Vokabel mit, auch wenn sie nie Punkte macht', () => {
    // last1 ist der Platz, den es dafuer gibt: eine Vokabel mit 0 Punkten
    // waere nach jeder anderen Sortierung hinten.
    const { faecher, summen } = fachArbeit(11);
    summen['v-07'] = 0;
    const gezogen = zieheRunde(woerter(11), 6, {}, 0, () => 0.5, faecher, summen);

    expect(gezogen.map((e) => e.karte.id)).toContain('v-07');
  });
});

describe('die Quote', () => {
  it('ergibt zusammen eine ganze Runde', () => {
    // Wer eine Zahl aendert, aendert die anderen mit -- sonst zieht die
    // Runde still weniger oder mehr als fuenfzehn Karten.
    expect(QUOTE.nie + QUOTE.arbeit + QUOTE.sicher).toBe(15);
  });

  it('gibt "sicher" genau einen Platz', () => {
    // Seit dem 30.08.2026: was sitzt, muss nicht dreimal die Woche
    // vorgefuehrt werden.
    expect(QUOTE.sicher).toBe(1);
  });
});
