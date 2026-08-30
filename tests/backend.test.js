// Prueft die zweite Naht. Wie bei storage.test.js ist der interessante Teil
// nicht der Erfolgsfall, sondern was passiert, wenn es NICHT geht: keine
// Konfiguration, kein Netz, abgeschaltete anonyme Anmeldung. Nichts davon
// darf die App anhalten.
//
// Getestet wird gegen einen falschen Client, nicht gegen Supabase -- genau
// dafuer gibt es verbinde(). Ein Test, der ein Netz braucht, ist keiner.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  verbinde, starte, angemeldet, melde, zuEreignis, korbGroesse, holeNach, umzug,
} from '../src/infra/backend.js';

/** Ein localStorage aus einer Map -- wie in storage.test.js. */
function fakeSpeicher() {
  const inhalt = new Map();
  return {
    inhalt,
    getItem: (k) => (inhalt.has(k) ? inhalt.get(k) : null),
    setItem: (k, v) => inhalt.set(k, v),
  };
}

function setzeSpeicher(wert) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: wert, configurable: true, writable: true,
  });
}

/** Wartet, bis der Versand im Hintergrund durch ist. */
const gleich = () => new Promise((f) => setTimeout(f, 0));

/**
 * Ein Supabase-Client aus Pappe. `sitzung` ist die schon vorhandene Sitzung
 * (oder null), `anmeldung` das, was signInAnonymously() liefern soll.
 */
function fakeClient({ sitzung = null, anmeldung = { user: { id: 'neu-1' } }, fehler = null } = {}) {
  const aufrufe = { getSession: 0, signInAnonymously: 0 };
  return {
    aufrufe,
    auth: {
      getSession: async () => {
        aufrufe.getSession += 1;
        return { data: { session: sitzung } };
      },
      signInAnonymously: async () => {
        aufrufe.signInAnonymously += 1;
        return { data: anmeldung, error: fehler };
      },
    },
  };
}

describe('starte', () => {
  it('meldet anonym an, wenn es noch keine Sitzung gibt', async () => {
    const c = fakeClient();
    verbinde(c);

    expect(await starte()).toBe('neu-1');
    expect(angemeldet()).toBe('neu-1');
    expect(c.aufrufe.signInAnonymously).toBe(1);
  });

  it('nimmt die vorhandene Sitzung und meldet sich NICHT neu an', async () => {
    // Ohne diesen Fall entstuende bei jedem Start ein neuer anonymer Nutzer,
    // und der Lernstand waere jedes Mal leer. Das ist der teuerste Fehler,
    // den diese Datei machen kann.
    const c = fakeClient({ sitzung: { user: { id: 'schon-da' } } });
    verbinde(c);

    expect(await starte()).toBe('schon-da');
    expect(c.aufrufe.signInAnonymously).toBe(0);
  });
});

describe('wenn es schiefgeht', () => {
  beforeEach(() => verbinde(null));

  it('laeuft ohne Konfiguration weiter, statt zu werfen', async () => {
    // Der Normalfall in den Oberflaechen-Tests und der Notfall, wenn im
    // Workflow ein Secret fehlt. Eine weisse Seite waere schlimmer als
    // keine Sicherung.
    await expect(starte()).resolves.toBeNull();
    expect(angemeldet()).toBeNull();
  });

  it('haelt nicht an, wenn die anonyme Anmeldung abgelehnt wird', async () => {
    // Genau das passiert, wenn im Dashboard "Anonymous sign-ins" aus ist:
    // Supabase antwortet mit 422.
    verbinde(fakeClient({ anmeldung: null, fehler: { status: 422 } }));

    expect(await starte()).toBeNull();
    expect(angemeldet()).toBeNull();
  });

  it('haelt nicht an, wenn der Client wirft', async () => {
    verbinde({ auth: { getSession: async () => { throw new Error('kein Netz'); } } });

    expect(await starte()).toBeNull();
  });

  it('vergisst die uid, wenn ein anderer Client eingesetzt wird', async () => {
    verbinde(fakeClient());
    await starte();
    expect(angemeldet()).toBe('neu-1');

    verbinde(null);
    expect(angemeldet()).toBeNull();
  });
});


describe('zuEreignis', () => {
  const antwort = {
    art: 'antwort', id: 'uv-003', form: 'simple-past', ausgang: 'richtig',
    versuch: 0, tipp: false, tippfehler: false, modus: 'uebungsblatt',
    wiederholung: false, punkte: 1, tag: '2026-08-30', zeit: 1756531200000,
  };

  it('macht aus id die Spalte karte', () => {
    // Die Zeile hat eine eigene id. Zwei Spalten namens id waeren in einem
    // halben Jahr nicht mehr auseinanderzuhalten.
    const zeile = zuEreignis(antwort, 'g-1', 7);
    expect(zeile.karte).toBe('uv-003');
    expect(zeile.id).toBeUndefined();
  });

  it('traegt geraet und nummer ein, aber keinen nutzer', () => {
    // `nutzer` setzt der Server aus auth.uid(). Nur deshalb darf eine Zeile
    // im Korb liegen, bevor es eine Sitzung gibt.
    const zeile = zuEreignis(antwort, 'g-1', 7);
    expect(zeile.geraet).toBe('g-1');
    expect(zeile.nummer).toBe(7);
    expect(zeile.nutzer).toBeUndefined();
  });

  it('macht aus der Zeit einen Text, den Postgres versteht', () => {
    expect(zuEreignis(antwort, 'g-1', 1).zeit).toBe('2025-08-30T05:20:00.000Z');
  });

  it('fuellt auf, was eine gezogene Karte nicht hat', () => {
    const zeile = zuEreignis(
      { art: 'gezogen', id: 'uv-003', form: null, runde: 4, zeit: 1756531200000 },
      'g-1', 2
    );
    expect(zeile.art).toBe('gezogen');
    expect(zeile.runde).toBe(4);
    expect(zeile.ausgang).toBeNull();
    expect(zeile.punkte).toBeNull();
  });
});

describe('melde und der Ausgangskorb', () => {
  const ereignis = (n) => ({ art: 'antwort', id: `uv-00${n}`, zeit: 1756531200000 });

  beforeEach(() => setzeSpeicher(fakeSpeicher()));
  afterEach(() => { delete globalThis.localStorage; });

  it('legt ab und versendet, wenn es geht', async () => {
    const gesendet = [];
    verbinde({
      ...fakeClient(),
      from: () => ({ upsert: async (zeilen) => { gesendet.push(...zeilen); return {}; } }),
    });

    melde(ereignis(1));
    melde(ereignis(2));
    await gleich();

    expect(gesendet.map((z) => z.karte)).toEqual(['uv-001', 'uv-002']);
    expect(korbGroesse()).toBe(0);
  });

  it('zaehlt die Nummern hoch und faengt nach dem Leeren nicht neu an', async () => {
    const gesendet = [];
    verbinde({
      ...fakeClient(),
      from: () => ({ upsert: async (zeilen) => { gesendet.push(...zeilen); return {}; } }),
    });

    melde(ereignis(1));
    await gleich();
    melde(ereignis(2));
    await gleich();

    expect(gesendet.map((z) => z.nummer)).toEqual([1, 2]);
  });

  it('behaelt alles im Korb, wenn der Versand scheitert', async () => {
    // Flugmodus, U-Bahn, Server aus. Ohne den Korb waere die Antwort weg.
    verbinde({
      ...fakeClient(),
      from: () => ({ upsert: async () => ({ error: { message: 'kein Netz' } }) }),
    });

    melde(ereignis(1));
    melde(ereignis(2));
    await gleich();

    expect(korbGroesse()).toBe(2);
  });

  it('schickt dieselbe Zeile nach einem Fehlschlag unveraendert wieder', async () => {
    // Die Nummer darf sich dabei NICHT aendern -- sonst legte der zweite
    // Anlauf eine zweite Zeile an, statt am unique abzuprallen.
    let antworte = { error: { message: 'kein Netz' } };
    const gesendet = [];
    verbinde({
      ...fakeClient(),
      from: () => ({ upsert: async (z) => { gesendet.push(...z); return antworte; } }),
    });

    melde(ereignis(1));
    await gleich();
    antworte = {};
    melde(ereignis(2));
    await gleich();

    expect(gesendet.map((z) => [z.karte, z.nummer]))
      .toEqual([['uv-001', 1], ['uv-001', 1], ['uv-002', 2]]);
    expect(korbGroesse()).toBe(0);
  });

  it('haelt nicht an, wenn es gar keinen Server gibt', async () => {
    verbinde(null);

    expect(() => melde(ereignis(1))).not.toThrow();
    await gleich();
    expect(korbGroesse()).toBe(1);
  });

  it('schickt beim Start nach, was liegengeblieben ist', async () => {
    // Wer im Flugmodus geuebt und die App geschlossen hat: ohne diesen Weg
    // blieben die Antworten liegen, bis jemand die naechste Karte
    // beantwortet.
    let netz = false;
    const gesendet = [];
    const c = {
      ...fakeClient(),
      from: () => ({ upsert: async (z) => {
        if (!netz) return { error: { message: 'kein Netz' } };
        gesendet.push(...z); return {};
      } }),
    };
    verbinde(c);

    melde(ereignis(1));
    await gleich();
    expect(korbGroesse()).toBe(1);

    netz = true;
    holeNach();
    await gleich();

    expect(gesendet.map((z) => z.karte)).toEqual(['uv-001']);
    expect(korbGroesse()).toBe(0);
  });

  it('meldet sich beim Start NICHT an, wenn der Korb leer ist', async () => {
    // Sonst legte jeder Seitenaufruf einen anonymen Nutzer an.
    const c = { ...fakeClient(), from: () => ({ upsert: async () => ({}) }) };
    verbinde(c);

    holeNach();
    await gleich();

    expect(c.aufrufe.signInAnonymously).toBe(0);
  });

  it('meldet sich erst an, wenn etwas zu senden ist', async () => {
    const c = { ...fakeClient(), from: () => ({ upsert: async () => ({}) }) };
    verbinde(c);

    // Die Seite ist geladen, aber niemand hat geuebt.
    expect(c.aufrufe.signInAnonymously).toBe(0);

    melde(ereignis(1));
    await gleich();
    expect(c.aufrufe.signInAnonymously).toBe(1);
  });
});


describe('der Bestand zieht um', () => {
  // Der Verlauf, wie ihn verrechne() schreibt: kein `art`, kein `tag`, und
  // die Karte heisst dort noch `id`.
  const eintrag = (n, zeit = Date.parse('2026-08-30T12:00:00Z')) => ({
    id: `uv-00${n}`, form: 'simple-past', ausgang: 'richtig', versuch: 0,
    tipp: false, tippfehler: false, modus: 'uebungsblatt', wiederholung: false,
    punkte: 1, zeit,
  });

  /** Ein Client, der mitschreibt, was er zu sehen bekommt. */
  function mitschrift() {
    const gesendet = [];
    return {
      gesendet,
      client: {
        ...fakeClient(),
        from: () => ({ upsert: async (z) => { gesendet.push(...z); return {}; } }),
      },
    };
  }

  beforeEach(() => setzeSpeicher(fakeSpeicher()));
  afterEach(() => { delete globalThis.localStorage; });

  it('legt jede Zeile des Verlaufs ab, in seiner Reihenfolge', async () => {
    const { gesendet, client } = mitschrift();
    verbinde(client);

    umzug([eintrag(1), eintrag(2), eintrag(3)]);
    holeNach();
    await gleich();

    expect(gesendet.map((z) => [z.karte, z.nummer]))
      .toEqual([['uv-001', 0], ['uv-002', 1], ['uv-003', 2]]);
    expect(gesendet.every((z) => z.art === 'antwort')).toBe(true);
  });

  it('nimmt einen eigenen Geraetenamen, damit die Nummern sich nicht treffen', async () => {
    // Der Bestand zaehlt Stellen im Verlauf ab 0, der laufende Betrieb zaehlt
    // eigene Nummern ab 1. Unter einem Namen setzten sie sich gegenseitig auf
    // das unique der Tabelle und verdraengten einander.
    const { gesendet, client } = mitschrift();
    verbinde(client);

    umzug([eintrag(1), eintrag(2)]);
    melde({ art: 'antwort', id: 'uv-009', zeit: Date.now() });
    await gleich();

    const [bestand, laufend] = [gesendet[0], gesendet.at(-1)];
    expect(bestand.geraet).toMatch(/^umzug-/);
    expect(laufend.geraet).not.toMatch(/^umzug-/);
    expect(bestand.geraet).toBe(`umzug-${laufend.geraet}`);
    // Dieselbe Nummer waere unter demselben Namen eine Kollision gewesen.
    expect(gesendet.map((z) => z.nummer)).toEqual([0, 1, 1]);
  });

  it('zieht nur einmal um, auch ueber Neustarts hinweg', async () => {
    const { gesendet, client } = mitschrift();
    verbinde(client);

    umzug([eintrag(1), eintrag(2)]);
    holeNach();
    await gleich();
    expect(gesendet).toHaveLength(2);

    // Der zweite Start der App, derselbe Speicher.
    umzug([eintrag(1), eintrag(2)]);
    holeNach();
    await gleich();

    expect(gesendet).toHaveLength(2);
    expect(korbGroesse()).toBe(0);
  });

  it('rechnet den Tag aus der Zeit zurueck, statt ihn leer zu lassen', () => {
    // Der Verlauf kennt keine Spalte `tag` -- an ihr haengt aber die
    // Fleiss-Seite. Zurueckrechnen darf man ihn, weil der Umzug auf demselben
    // Geraet laeuft, das die Zeile geschrieben hat.
    //
    // 12:00 UTC gewaehlt, damit der lokale Tag in jeder Zeitzone von UTC-12
    // bis UTC+11 derselbe ist -- der Test soll nicht davon abhaengen, wo er
    // laeuft.
    verbinde(null);
    umzug([eintrag(1)]);

    const [zeile] = JSON.parse(globalThis.localStorage.getItem('vokabelkarten.postausgang'));
    expect(zeile.tag).toBe('2026-08-30');
  });

  it('meldet niemanden an, wenn es nichts umzuziehen gibt', async () => {
    // Wer die App zum ersten Mal oeffnet, hat keinen Bestand -- und soll
    // dafuer auch keinen anonymen Nutzer bekommen.
    const { client } = mitschrift();
    verbinde(client);

    umzug([]);
    holeNach();
    await gleich();

    expect(client.aufrufe.signInAnonymously).toBe(0);
    expect(korbGroesse()).toBe(0);
  });

  it('haelt nicht an, wenn im Verlauf Unsinn steht', async () => {
    // Kein Merker bei einem Fehlschlag: der naechste Start versucht es noch
    // einmal. Was hier nicht durchgeht, darf die App nicht anhalten.
    verbinde(null);

    expect(() => umzug([{ id: 'uv-001', zeit: 'gestern' }])).not.toThrow();
    expect(korbGroesse()).toBe(0);
  });
});
