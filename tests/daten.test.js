// Prüft die Vokabeldateien selbst. Kein Code-Test, sondern ein Daten-Test:
// er fängt Tippfehler ab, bevor sie in der App auffallen.
import { describe, it, expect } from 'vitest';
import vokabeln from '../data/vokabeln.json';
import verben from '../data/unregelmaessige-verben.json';
import WORTARTEN from '../data/wortarten.json';

const dateien = {
  'vokabeln.json': vokabeln,
  'unregelmaessige-verben.json': verben,
};

// Die App lädt beide Listen in einen gemeinsamen Stapel. Geprüft wird
// deshalb auch über beide zusammen -- vor allem bei den ids.
const alleKarten = Object.values(dateien).flatMap((datei) => datei.karten);

describe('die Vokabeldateien', () => {
  it('haben jede eine Überschrift und Karten', () => {
    for (const [name, datei] of Object.entries(dateien)) {
      expect(datei.titel, `titel fehlt in ${name}`).toBeTruthy();
      expect(datei.karten.length, `keine Karten in ${name}`).toBeGreaterThan(0);
    }
  });

  it('vergeben jede id nur einmal, über alle Dateien hinweg', () => {
    const ids = alleKarten.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('haben auf jeder Karte mindestens ein Wort je Sprache', () => {
    for (const karte of alleKarten) {
      // Normale Vokabel: en/de stehen direkt auf der Karte.
      // Unregelmäßiges Verb: einmal je Form.
      const paare = karte.formen ? Object.values(karte.formen) : [karte];
      for (const paar of paare) {
        expect(paar.en?.length, `en fehlt bei ${karte.id}`).toBeGreaterThan(0);
        expect(paar.de?.length, `de fehlt bei ${karte.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('kennen nur Wortarten aus der Liste', () => {
    for (const karte of alleKarten) {
      expect(WORTARTEN, `unbekannte Wortart bei ${karte.id}`).toContain(karte.wortart);
    }
  });

  // Unregelmäßige Verben gehören in ihre eigene Datei und haben drei Formen.
  // Beides zusammen ist dieselbe Regel, von zwei Seiten geprüft.
  it('koppeln formen und wortart aneinander', () => {
    for (const karte of alleKarten) {
      const istVerb = karte.wortart === 'unregelmäßiges Verb';
      expect(Boolean(karte.formen), `formen und wortart passen nicht bei ${karte.id}`)
        .toBe(istVerb);
    }
  });

  it('haben auf jeder Karte beide Hinweise', () => {
    for (const karte of alleKarten) {
      expect(karte.hinweise?.['nach-de'], `Hinweis nach-de fehlt bei ${karte.id}`).toBeTruthy();
      expect(karte.hinweise?.['nach-en'], `Hinweis nach-en fehlt bei ${karte.id}`).toBeTruthy();
    }
  });
});
