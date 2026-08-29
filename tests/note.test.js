import { describe, it, expect } from 'vitest';
import { note, punkteFuerKarte, NOTEN } from '../src/domain/note.js';

describe('note', () => {
  // Die ganze Tabelle einmal von oben nach unten. Sie ist kurz genug,
  // um sie vollständig zu prüfen -- und genau dafür ist sie eine Liste.
  const tabelle = [
    [15, '1+'], [14, '1'], [13, '1−'], [12, '2+'],
    [11, '2'], [10, '2−'], [9, '3+'], [8, '3'],
    [7, '3−'], [6, '4+'], [5, '4'], [4, '4−'],
    [3, '5+'], [2, '5'], [1, '5−'], [0, '6'],
  ];

  for (const [punkte, erwartet] of tabelle) {
    it(`gibt bei ${punkte} Punkten die Note ${erwartet}`, () => {
      expect(note(punkte)).toBe(erwartet);
    });
  }

  it('zeigt auch die 6 -- keine Runde wird verschwiegen', () => {
    expect(note(0)).toBe('6');
  });

  it('rundet krumme Punktzahlen kaufmännisch', () => {
    expect(note(12.4)).toBe('2+');
    expect(note(12.5)).toBe('1−');
  });

  it('lässt einen einzelnen Tipp die 1+ nicht verderben', () => {
    expect(note(14.9)).toBe('1+');
  });

  it('bleibt auch außerhalb der Skala in der Tabelle', () => {
    expect(note(-3)).toBe('6');
    expect(note(99)).toBe('1+');
  });

  it('hat für jede Punktzahl von 0 bis 15 eine Note', () => {
    expect(NOTEN.length).toBe(16);
  });
});

describe('punkteFuerKarte', () => {
  it('gibt für den ersten Versuch einen ganzen Punkt', () => {
    expect(punkteFuerKarte({ versuch: 0, tipp: false })).toBe(1);
  });

  it('gibt für den zweiten Versuch einen halben Punkt', () => {
    expect(punkteFuerKarte({ versuch: 1, tipp: false })).toBe(0.5);
  });

  it('zieht für einen Tipp ein Zehntel ab', () => {
    expect(punkteFuerKarte({ versuch: 0, tipp: true })).toBeCloseTo(0.9);
  });

  it('zieht den Tipp auch vom halben Punkt ab', () => {
    expect(punkteFuerKarte({ versuch: 1, tipp: true })).toBeCloseTo(0.4);
  });

  it('geht nie unter null', () => {
    expect(punkteFuerKarte({ versuch: 1, tipp: true })).toBeGreaterThanOrEqual(0);
  });
});

describe('punkteFuerKarte mit Tippfehler', () => {
  it('zieht zwei Zehntel ab, wenn ein Tippfehler durchging', () => {
    // "writte" statt "write" zaehlt im Uebungsblatt als richtig -- die
    // Vokabel sass, die Schreibweise nicht.
    expect(punkteFuerKarte({ versuch: 0, tipp: false, tippfehler: true })).toBeCloseTo(0.8);
  });

  it('zieht Tipp und Tippfehler zusammen ab', () => {
    expect(punkteFuerKarte({ versuch: 0, tipp: true, tippfehler: true })).toBeCloseTo(0.7);
  });

  it('rechnet auch im zweiten Versuch weiter vom halben Punkt', () => {
    expect(punkteFuerKarte({ versuch: 1, tipp: false, tippfehler: true })).toBeCloseTo(0.3);
  });

  it('bleibt ohne Angabe bei der alten Rechnung', () => {
    expect(punkteFuerKarte({ versuch: 0, tipp: false })).toBe(1);
  });
});
