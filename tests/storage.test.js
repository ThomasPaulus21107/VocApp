// Prueft die Speicher-Naht. Der interessante Teil ist nicht das Speichern,
// sondern was passiert, wenn es NICHT geht: privates Fenster, voller
// Speicher, kaputter Inhalt. Nichts davon darf die App anhalten.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { speichern, lesen } from '../src/infra/storage.js';

/** Ein localStorage aus einer Map. Optional einer, der beim Schreiben wirft. */
function fakeSpeicher({ wirftBeimSchreiben = false } = {}) {
  const inhalt = new Map();
  return {
    inhalt,
    getItem: (k) => (inhalt.has(k) ? inhalt.get(k) : null),
    setItem: (k, v) => {
      if (wirftBeimSchreiben) throw new Error('QuotaExceededError');
      inhalt.set(k, v);
    },
  };
}

function setzeSpeicher(wert) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: wert,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  delete globalThis.localStorage;
});

describe('speichern und lesen', () => {
  beforeEach(() => setzeSpeicher(fakeSpeicher()));

  it('gibt zurueck, was abgelegt wurde', () => {
    speichern('auswahl', { rundeNr: 3, zuletzt: { 'uv-001|infinitive': 2 } });
    expect(lesen('auswahl', null)).toEqual({
      rundeNr: 3,
      zuletzt: { 'uv-001|infinitive': 2 },
    });
  });

  it('kann auch mit true und false umgehen', () => {
    // Der erste Schalter, der hier durchgeht, ist "Toene an/aus".
    speichern('toene', false);
    expect(lesen('toene', true)).toBe(false);
  });

  it('gibt den Standardwert, wenn noch nichts da ist', () => {
    expect(lesen('gibtesnicht', 'Standard')).toBe('Standard');
  });

  it('haengt einen Praefix an, damit sich nichts mit anderen Apps beisst', () => {
    speichern('toene', true);
    expect([...globalThis.localStorage.inhalt.keys()]).toEqual(['vokabelkarten.toene']);
  });
});

describe('wenn es schiefgeht', () => {
  it('gibt den Standardwert zurueck, wenn dort Unsinn steht', () => {
    const s = fakeSpeicher();
    s.inhalt.set('vokabelkarten.auswahl', '{kaputt');
    setzeSpeicher(s);

    expect(lesen('auswahl', { rundeNr: 0 })).toEqual({ rundeNr: 0 });
  });

  it('haelt die App nicht an, wenn der Speicher voll ist', () => {
    setzeSpeicher(fakeSpeicher({ wirftBeimSchreiben: true }));

    expect(() => speichern('auswahl', { rundeNr: 1 })).not.toThrow();
    expect(speichern('auswahl', { rundeNr: 1 })).toBe(false);
  });

  it('kommt ohne localStorage aus', () => {
    // In Node gibt es ihn gar nicht -- und in Safaris privatem Fenster wirft
    // schon der Zugriff auf die Variable.
    setzeSpeicher(undefined);

    expect(speichern('toene', true)).toBe(false);
    expect(lesen('toene', 'Standard')).toBe('Standard');
  });
});
