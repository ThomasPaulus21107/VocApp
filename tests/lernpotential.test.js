import { describe, it, expect } from 'vitest';
import { lernpotential } from '../src/domain/lernpotential.js';

// Ein Stapel, wie er gespielt wurde. Mehr als die id braucht die Funktion
// nicht zu kennen -- sie sucht aus, sie fragt nicht ab.
const stapel = [
  { id: 'uv-001' },
  { id: 'uv-002' },
  { id: 'uv-003' },
  { id: 'uv-004' },
];

describe('lernpotential', () => {
  it('gibt genau die Karten zurück, die vorgemerkt sind', () => {
    const zweiteRunde = lernpotential(stapel, ['uv-002', 'uv-004']);
    expect(zweiteRunde.map((karte) => karte.id)).toEqual(['uv-002', 'uv-004']);
  });

  it('behält die Reihenfolge des gespielten Stapels', () => {
    const zweiteRunde = lernpotential(stapel, ['uv-004', 'uv-001']);
    expect(zweiteRunde.map((karte) => karte.id)).toEqual(['uv-001', 'uv-004']);
  });

  it('gibt einen leeren Stapel zurück, wenn nichts vorgemerkt ist', () => {
    expect(lernpotential(stapel, [])).toEqual([]);
  });

  it('übergeht ids, die im Stapel gar nicht vorkommen', () => {
    const zweiteRunde = lernpotential(stapel, ['uv-002', 'gibt-es-nicht']);
    expect(zweiteRunde.map((karte) => karte.id)).toEqual(['uv-002']);
  });

  it('verändert den übergebenen Stapel nicht', () => {
    const vorher = [...stapel];
    lernpotential(stapel, ['uv-001']);
    expect(stapel).toEqual(vorher);
  });
});
