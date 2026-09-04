import { describe, it, expect } from 'vitest';
import { regeln, MODI, lernpunkte, BONUS_ARBEIT } from '../src/domain/modus.js';

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

  it('lässt Tippfehler nur im Übungsblatt durchgehen', () => {
    expect(regeln(MODI.UEBUNGSBLATT).tippfehlerErlaubt).toBe(true);
    expect(regeln(MODI.ARBEIT).tippfehlerErlaubt).toBe(false);
  });

  it('übt im Zweifel, statt zu prüfen', () => {
    expect(regeln('quatsch')).toEqual(regeln(MODI.UEBUNGSBLATT));
    expect(regeln(undefined)).toEqual(regeln(MODI.UEBUNGSBLATT));
  });
});


describe('lernpunkte', () => {
  // Der Bonus wirkt NUR im Lernstand. Die Runde selbst zaehlt ohne ihn --
  // sonst gaebe es 18 von 15 Punkten und eine Note besser als 1.

  it('laesst das Uebungsblatt, wie es ist', () => {
    expect(lernpunkte(1, MODI.UEBUNGSBLATT)).toBe(1);
    expect(lernpunkte(0.5, MODI.UEBUNGSBLATT)).toBe(0.5);
  });

  it('legt in der Arbeit zwanzig Prozent drauf', () => {
    // Ohne Tipp, ohne zweite Chance, ohne Rueckmeldung getroffen: das ist ein
    // staerkerer Befund als dieselbe Vokabel im Uebungsblatt.
    expect(lernpunkte(1, MODI.ARBEIT)).toBe(BONUS_ARBEIT);
  });

  it('macht aus nichts auch mit Bonus nichts', () => {
    expect(lernpunkte(0, MODI.ARBEIT)).toBe(0);
  });

  it('rundet den Gleitkomma-Rest weg', () => {
    // 0,9 * 1,2 ergibt in Gleitkomma 1.0799999999999998, und diese Zahl
    // landete so in Postgres.
    expect(lernpunkte(0.9, MODI.ARBEIT)).toBe(1.08);
  });

  it('nimmt fuer einen unbekannten Modus das Uebungsblatt', () => {
    // Dieselbe Haltung wie regeln(): im Zweifel wird geuebt, nicht geprueft --
    // und dann gibt es auch keinen Bonus.
    expect(lernpunkte(1, 'gibtsnicht')).toBe(1);
  });
});
