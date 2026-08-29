// Prueft die zweite Naht. Wie bei storage.test.js ist der interessante Teil
// nicht der Erfolgsfall, sondern was passiert, wenn es NICHT geht: keine
// Konfiguration, kein Netz, abgeschaltete anonyme Anmeldung. Nichts davon
// darf die App anhalten.
//
// Getestet wird gegen einen falschen Client, nicht gegen Supabase -- genau
// dafuer gibt es verbinde(). Ein Test, der ein Netz braucht, ist keiner.
import { describe, it, expect, beforeEach } from 'vitest';
import { verbinde, starte, angemeldet } from '../src/infra/backend.js';

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
