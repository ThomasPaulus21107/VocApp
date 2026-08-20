import { describe, it, expect } from 'vitest';
import {
  normalisiere, stelleFrage, stelleFormFrage, pruefeAntwort, mische, RICHTUNGEN,
} from '../src/domain/pruefung.js';

const bike = {
  id: 'l1-002',
  en: ['bike', 'bicycle'],
  de: ['Fahrrad', 'Rad'],
  wortart: 'Nomen',
  hinweise: { 'nach-de': 'zwei Räder', 'nach-en': 'you ride it' },
};

const write = {
  id: 'uv-053',
  wortart: 'unregelmäßiges Verb',
  formen: {
    'infinitive': { en: ['to write'], de: ['schreiben'] },
    'simple-past': { en: ['wrote'], de: ['schrieb'] },
    'past-participle': { en: ['written'], de: ['geschrieben'] },
  },
  hinweise: { 'nach-de': 'mit einem Stift', 'nach-en': 'with a pen' },
};

describe('normalisiere', () => {
  it('entfernt Leerzeichen und macht alles klein', () => {
    expect(normalisiere('  Der HUND ')).toBe('der hund');
  });
});

describe('stelleFrage', () => {
  it('zeigt bei nach-de das englische Wort', () => {
    const frage = stelleFrage(bike, RICHTUNGEN.NACH_DE);
    expect(frage.frage).toBe('bike');
    expect(frage.antworten).toEqual(['Fahrrad', 'Rad']);
    expect(frage.hinweis).toBe('zwei Räder');
  });

  it('dreht bei nach-en die Karte um', () => {
    const frage = stelleFrage(bike, RICHTUNGEN.NACH_EN);
    expect(frage.frage).toBe('Fahrrad');
    expect(frage.antworten).toEqual(['bike', 'bicycle']);
    expect(frage.hinweis).toBe('you ride it');
  });

  it('kommt ohne Hinweise klar', () => {
    const ohne = { id: 'x', en: ['cat'], de: ['Katze'] };
    expect(stelleFrage(ohne, RICHTUNGEN.NACH_DE).hinweis).toBeNull();
  });
});

describe('stelleFormFrage', () => {
  // 0.5 * 3 = 1.5, abgerundet 1 -> simple past wird zur Lücke
  const wuerfel = () => 0.5;

  it('lässt genau eine Form frei', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_EN, wuerfel);
    const luecken = frage.formen.filter((form) => form.wort === null);
    expect(luecken.length).toBe(1);
    expect(luecken[0].name).toBe('simple-past');
  });

  it('erwartet bei nach-en die englische Form', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_EN, wuerfel);
    expect(frage.frage).toBe('schreiben');
    expect(frage.antworten).toEqual(['wrote']);
    expect(frage.formen[0].wort).toBe('to write');
  });

  it('dreht bei nach-de auf die deutschen Formen', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_DE, wuerfel);
    expect(frage.frage).toBe('to write');
    expect(frage.antworten).toEqual(['schrieb']);
    expect(frage.formen[0].wort).toBe('schreiben');
  });

  it('nimmt den Hinweis passend zur Richtung', () => {
    expect(stelleFormFrage(write, RICHTUNGEN.NACH_DE, wuerfel).hinweis).toBe('mit einem Stift');
    expect(stelleFormFrage(write, RICHTUNGEN.NACH_EN, wuerfel).hinweis).toBe('with a pen');
  });
});

describe('pruefeAntwort', () => {
  const frageDe = stelleFrage(bike, RICHTUNGEN.NACH_DE);
  const frageEn = stelleFrage(bike, RICHTUNGEN.NACH_EN);

  it('erkennt die richtige Antwort', () => {
    expect(pruefeAntwort('Fahrrad', frageDe).richtig).toBe(true);
  });

  it('ignoriert Groß-/Kleinschreibung und Leerzeichen', () => {
    expect(pruefeAntwort('  fahrrad ', frageDe).richtig).toBe(true);
  });

  it('akzeptiert auch die zweite gültige Antwort', () => {
    expect(pruefeAntwort('Rad', frageDe).richtig).toBe(true);
  });

  it('gilt in der anderen Richtung genauso', () => {
    expect(pruefeAntwort('bicycle', frageEn).richtig).toBe(true);
  });

  it('erkennt eine falsche Antwort', () => {
    expect(pruefeAntwort('Auto', frageDe).richtig).toBe(false);
  });

  it('behandelt eine leere Eingabe gesondert', () => {
    const ergebnis = pruefeAntwort('   ', frageDe);
    expect(ergebnis.leer).toBe(true);
    expect(ergebnis.richtig).toBe(false);
  });
});

describe('mische', () => {
  it('behält alle Karten', () => {
    const stapel = [1, 2, 3, 4, 5];
    expect(mische(stapel).sort()).toEqual(stapel);
  });

  it('verändert den ursprünglichen Stapel nicht', () => {
    const stapel = [1, 2, 3];
    mische(stapel, () => 0);
    expect(stapel).toEqual([1, 2, 3]);
  });
});
