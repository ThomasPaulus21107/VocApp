import { describe, it, expect } from 'vitest';
import { regeln, MODI } from '../src/domain/modus.js';

describe('regeln', () => {
  it('erlaubt im Übungsblatt Tipps und einen zweiten Versuch', () => {
    const regel = regeln(MODI.UEBUNGSBLATT);
    expect(regel.tippsErlaubt).toBe(true);
    expect(regel.zweiterVersuch).toBe(true);
  });

  it('zeigt im Übungsblatt nach jeder Karte das Ergebnis', () => {
    expect(regeln(MODI.UEBUNGSBLATT).zeigtErgebnis).toBe(true);
  });

  it('lässt in der Arbeit weder Tipp noch zweiten Versuch zu', () => {
    const regel = regeln(MODI.ARBEIT);
    expect(regel.tippsErlaubt).toBe(false);
    expect(regel.zweiterVersuch).toBe(false);
  });

  it('verrät in der Arbeit nach einer Karte nichts', () => {
    expect(regeln(MODI.ARBEIT).zeigtErgebnis).toBe(false);
  });

  it('lässt "keine Ahnung" nur im Übungsblatt folgenlos', () => {
    expect(regeln(MODI.UEBUNGSBLATT).hilferufOhneFolgen).toBe(true);
    expect(regeln(MODI.ARBEIT).hilferufOhneFolgen).toBe(false);
  });

  it('holt falsche Karten nur im Übungsblatt noch einmal', () => {
    expect(regeln(MODI.UEBUNGSBLATT).lernpotential).toBe(true);
    expect(regeln(MODI.ARBEIT).lernpotential).toBe(false);
  });

  it('übt im Zweifel, statt zu prüfen', () => {
    expect(regeln('quatsch')).toEqual(regeln(MODI.UEBUNGSBLATT));
    expect(regeln(undefined)).toEqual(regeln(MODI.UEBUNGSBLATT));
  });
});
