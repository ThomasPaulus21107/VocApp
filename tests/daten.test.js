// Prüft die Vokabeldatei selbst. Kein Code-Test, sondern ein Daten-Test:
// er fängt Tippfehler ab, bevor sie in der App auffallen.
import { describe, it, expect } from 'vitest';
import vokabeln from '../data/vokabeln.json';

describe('vokabeln.json', () => {
  it('hat mindestens eine Karte', () => {
    expect(vokabeln.karten.length).toBeGreaterThan(0);
  });

  it('vergibt jede id nur einmal', () => {
    const ids = vokabeln.karten.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hat auf jeder Karte mindestens ein Wort je Sprache', () => {
    for (const karte of vokabeln.karten) {
      expect(karte.en?.length, `en fehlt bei ${karte.id}`).toBeGreaterThan(0);
      expect(karte.de?.length, `de fehlt bei ${karte.id}`).toBeGreaterThan(0);
    }
  });

  it('hat auf jeder Karte beide Hinweise', () => {
    for (const karte of vokabeln.karten) {
      expect(karte.hinweise?.['nach-de'], `Hinweis nach-de fehlt bei ${karte.id}`).toBeTruthy();
      expect(karte.hinweise?.['nach-en'], `Hinweis nach-en fehlt bei ${karte.id}`).toBeTruthy();
    }
  });
});
