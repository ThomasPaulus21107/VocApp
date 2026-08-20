import { describe, it, expect } from 'vitest';
import {
  normalisiere, stelleFrage, pruefeAntwort, mische, RICHTUNGEN,
} from '../src/domain/pruefung.js';

const bike = {
  id: 'l1-002',
  en: ['bike', 'bicycle'],
  de: ['Fahrrad', 'Rad'],
  wortart: 'Nomen',
  hinweise: { 'nach-de': 'zwei Räder', 'nach-en': 'you ride it' },
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
