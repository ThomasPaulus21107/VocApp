// Prueft die Dateien fuer den Homebildschirm. Wie daten.test.js kein
// Code-Test, sondern ein Test gegen Tippfehler: ein fehlendes Icon oder eine
// falsche Groesse faellt sonst erst auf dem Telefon auf -- und dort auch nur,
// wenn jemand genau hinsieht.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import manifest from '../public/manifest.json';

const seite = readFileSync('index.html', 'utf8');
const stil = readFileSync('src/ui/styles.css', 'utf8');

/** Liest Breite und Hoehe aus dem PNG-Kopf. Sie stehen ab Byte 16. */
function masse(datei) {
  const bytes = readFileSync(`public/${datei}`);
  return { breite: bytes.readUInt32BE(16), hoehe: bytes.readUInt32BE(20) };
}

describe('das Manifest', () => {
  it('nennt Name, Startadresse und Anzeigeart', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.start_url).toBe('.');
    expect(manifest.display).toBe('standalone');
  });

  // start_url und die Icons stehen bewusst RELATIV drin. Absolut ("/") wuerde
  // auf GitHub Pages ins Leere zeigen, weil die App unter /VocApp/ liegt.
  it('benutzt nur relative Adressen', () => {
    const adressen = [manifest.start_url, manifest.scope, ...manifest.icons.map((i) => i.src)];
    for (const adresse of adressen) {
      expect(adresse.startsWith('/'), `${adresse} faengt mit einem Schraegstrich an`).toBe(false);
    }
  });
});

describe('die Icons', () => {
  it('liegen alle da und haben die Groesse, die im Manifest steht', () => {
    for (const icon of manifest.icons) {
      const [breite, hoehe] = icon.sizes.split('x').map(Number);
      expect(masse(icon.src), `${icon.src} hat die falsche Groesse`)
        .toEqual({ breite, hoehe });
    }
  });

  it('haben ein apple-touch-icon mit 180 Pixeln', () => {
    // iOS liest das Manifest erst ab Version 16.4. Bis dahin gilt nur dieses
    // Bild -- es muss deshalb eine eigene Datei bleiben.
    expect(masse('apple-touch-icon.png')).toEqual({ breite: 180, hoehe: 180 });
  });
});

describe('die Seite verweist auf beides', () => {
  it('verlinkt das Manifest und das apple-touch-icon', () => {
    expect(seite).toContain('rel="manifest"');
    expect(seite).toContain('rel="apple-touch-icon"');
  });
});

describe('die Farbe steht an drei Stellen', () => {
  // styles.css, index.html und manifest.json muessen dieselbe Farbe nennen,
  // sonst blitzt beim Start kurz die alte auf. Wer --hintergrund aendert,
  // aendert alle drei -- und dieser Test sagt es, wenn er es vergisst.
  it('und ueberall dieselbe', () => {
    const ausCss = stil.match(/--hintergrund:\s*(#[0-9a-f]{6})/i)[1];
    const ausSeite = seite.match(/name="theme-color" content="(#[0-9a-f]{6})"/i)[1];

    expect(ausSeite.toLowerCase()).toBe(ausCss.toLowerCase());
    expect(manifest.theme_color.toLowerCase()).toBe(ausCss.toLowerCase());
    expect(manifest.background_color.toLowerCase()).toBe(ausCss.toLowerCase());
  });
});
