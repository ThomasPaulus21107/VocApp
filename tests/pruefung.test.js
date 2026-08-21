import { describe, it, expect } from 'vitest';
import {
  normalisiere, stelleFrage, stelleFormFrage, baueHinweis, zieheRunde,
  pruefeAntwort, mische, RICHTUNGEN,
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

describe('baueHinweis', () => {
  it('lässt den ersten Buchstaben stehen und zählt den Rest', () => {
    expect(baueHinweis('wrote')).toBe('w____');
  });

  it('lässt ein führendes "to" stehen', () => {
    expect(baueHinweis('to write')).toBe('to w____');
  });

  it('behandelt jedes Wort einzeln', () => {
    expect(baueHinweis('woke up')).toBe('w___ u_');
  });
});

describe('zieheRunde', () => {
  const zwanzig = Array.from({ length: 20 }, (_, i) => i);

  it('zieht nicht mehr Karten als gewünscht', () => {
    expect(zieheRunde(zwanzig, 5).length).toBe(5);
  });

  it('nimmt alle, wenn weniger da sind als gewünscht', () => {
    expect(zieheRunde([1, 2, 3], 20).length).toBe(3);
  });

  it('verändert den ursprünglichen Stapel nicht', () => {
    const stapel = [1, 2, 3];
    zieheRunde(stapel, 2, () => 0);
    expect(stapel).toEqual([1, 2, 3]);
  });
});

describe('stelleFormFrage', () => {
  // 0.5 * 2 = 1, also simple past. Mit 0 kommt der Infinitiv.
  const simplePast = () => 0.5;
  const infinitiv = () => 0;

  it('fragt bei nach-en nach der englischen Form', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_EN, simplePast);
    expect(frage.frage).toBe('schreiben');
    expect(frage.gesuchteForm).toBe('simple-past');
    expect(frage.antworten).toEqual(['wrote']);
  });

  it('fragt auch nach dem Infinitiv', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_EN, infinitiv);
    expect(frage.gesuchteForm).toBe('infinitive');
    expect(frage.antworten).toEqual(['to write']);
  });

  it('fragt nie nach dem Partizip', () => {
    for (const wurf of [0, 0.25, 0.5, 0.75, 0.99]) {
      expect(stelleFormFrage(write, RICHTUNGEN.NACH_EN, () => wurf).gesuchteForm)
        .not.toBe('past-participle');
    }
  });

  it('baut den Hinweis aus der gesuchten Form', () => {
    expect(stelleFormFrage(write, RICHTUNGEN.NACH_EN, simplePast).hinweis).toBe('w____');
    expect(stelleFormFrage(write, RICHTUNGEN.NACH_EN, infinitiv).hinweis).toBe('to w____');
  });

  it('hält alle drei Formen als Lösung bereit', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_EN, simplePast);
    expect(frage.loesung.map((form) => form.wort)).toEqual(['to write', 'wrote', 'written']);
  });

  it('dreht bei nach-de auf die deutschen Formen', () => {
    const frage = stelleFormFrage(write, RICHTUNGEN.NACH_DE, simplePast);
    expect(frage.frage).toBe('to write');
    expect(frage.antworten).toEqual(['schrieb']);
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

  it('erkennt "s" als Überspringen', () => {
    const ergebnis = pruefeAntwort('s', frageDe);
    expect(ergebnis.springen).toBe(true);
    expect(ergebnis.richtig).toBe(false);
  });

  it('erkennt "s" auch mit Leerzeichen und groß geschrieben', () => {
    expect(pruefeAntwort('  S ', frageDe).springen).toBe(true);
  });

  it('hält ein längeres Wort mit s nicht für Überspringen', () => {
    expect(pruefeAntwort('sat', frageDe).springen).toBe(false);
  });

  it('erkennt "keine Ahnung" als Hilferuf', () => {
    const ergebnis = pruefeAntwort('Keine Ahnung', frageDe);
    expect(ergebnis.mutmachen).toBe(true);
    expect(ergebnis.richtig).toBe(false);
    expect(ergebnis.springen).toBe(false);
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
