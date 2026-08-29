// Prueft, WELCHE Karten drankommen. Der Kern ist nicht der Zufall, sondern
// die Abdeckung: dass kein Verb wochenlang durchrutscht.
import { describe, it, expect } from 'vitest';
import { zieheRunde, merke, schluessel } from '../src/domain/auswahl.js';

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
    let stand = { rundeNr: 0, zuletzt: {} };
    const gesehen = { karten: new Set(), einheiten: new Set() };

    for (let i = 0; i < runden; i++) {
      const gezogen = zieheRunde(karten, anzahl, stand.zuletzt, stand.rundeNr);
      for (const e of gezogen) {
        gesehen.karten.add(e.karte.id);
        gesehen.einheiten.add(schluessel(e.karte.id, e.form));
      }
      stand = {
        rundeNr: stand.rundeNr + 1,
        zuletzt: merke(stand.zuletzt, stand.rundeNr, gezogen),
      };
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

describe('merke', () => {
  it('schreibt die gezogenen Einheiten auf die Rundennummer', () => {
    const karten = verben(2);
    const gezogen = [{ karte: karten[0], form: 'simple-past' }];
    expect(merke({}, 7, gezogen)).toEqual({ 'uv-000|simple-past': 7 });
  });

  it('laesst den alten Stand in Ruhe', () => {
    const alt = { 'uv-000|infinitive': 1 };
    const neu = merke(alt, 2, [{ karte: verben(1)[0], form: 'infinitive' }]);

    expect(alt).toEqual({ 'uv-000|infinitive': 1 });
    expect(neu).toEqual({ 'uv-000|infinitive': 2 });
  });
});
