// Die Anmeldung. Der einzige Test, der ABGEMELDET anfaengt -- alle anderen
// bekommen ihre Sitzung aus playwright.config.js untergeschoben.
//
// WARUM EINE ATTRAPPE UND KEIN ECHTES KONTO: ein echtes braeuchte ein echtes
// Projekt, eine echte Adresse und ein echtes Passwort. In der CI gibt es
// nichts davon, der Test waere dort uebersprungen -- und ein Test, der genau
// da nicht laeuft, wo er blockieren soll, ist keiner. Abgefangen wird
// stattdessen die eine Anfrage, die Supabase beim Anmelden stellt.

import { test, expect } from '@playwright/test';

// Abgemeldet. Ueberschreibt den Speicher aus der Konfiguration.
test.use({ storageState: { cookies: [], origins: [] } });

// Was Supabase auf ein richtiges Passwort antwortet, auf das Noetigste
// gekuerzt. `expires_in` steht hoch genug, dass der Client waehrend des Tests
// nicht auf die Idee kommt, das Token erneuern zu wollen.
const SITZUNG = {
  access_token: 'attrappe',
  refresh_token: 'attrappe',
  expires_in: 3600 * 24 * 365,
  token_type: 'bearer',
  user: {
    id: '00000000-0000-4000-8000-000000000000',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'blauer-otter@konten.vocappulary.online',
  },
};

/** Faengt den Anmeldeversuch ab und antwortet wie Supabase. */
async function antworteMit(seite, status, koerper) {
  await seite.route('**/auth/v1/token*', (weg) => weg.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(koerper),
  }));
}

/** Tippt Name und Passwort und schickt ab. */
async function melde(seite, name = 'blauer-otter', passwort = 'drei einfache woerter') {
  await seite.locator('#name').fill(name);
  await seite.locator('#passwort').fill(passwort);
  await seite.locator('#knopf').click();
}

test.describe('ohne Sitzung', () => {
  // Das Formular ist der einzige Weg herein -- auch auf die Seiten, die nur
  // lesen. Ein Kind, das ueber das Menue dorthin kommt, versteht nicht, warum
  // die eine Seite eine Anmeldung verlangt und die andere nicht.
  for (const seitenname of ['index.html', 'fortschritt.html', 'fleiss.html']) {
    test(`fuehrt ${seitenname} zum Anmelden`, async ({ page: seite }) => {
      await seite.goto(seitenname);
      await expect(seite).toHaveURL(/anmelden\.html$/);
      await expect(seite.locator('#anmeldung')).toBeVisible();
    });
  }

  test('das Formular bietet dem Schluesselbund an, was es soll', async ({ page: seite }) => {
    // Ohne diese zwei Attribute bietet iOS das Passwort nicht an, und dann
    // tippt ein Zwoelfjaehriger es jedes Mal neu -- nach einer Woche heisst
    // es "aaa". Sie fallen bei einer Umgestaltung als Erstes raus, weil man
    // ihnen nicht ansieht, wozu sie da sind.
    await seite.goto('anmelden.html');
    await expect(seite.locator('#name')).toHaveAttribute('autocomplete', 'username');
    await expect(seite.locator('#passwort')).toHaveAttribute('autocomplete', 'current-password');
  });
});

test.describe('die Anmeldung', () => {
  test('haelt ueber ein Neuladen hinweg', async ({ page: seite }) => {
    // DER TEST, DEN MAN VON HAND NIE MACHT, weil man beim Ausprobieren nicht
    // neu laedt. Ginge die Sitzung dabei verloren, waere das kein
    // Schoenheitsfehler: das Formular ist der einzige Weg herein, und ein
    // Kind ohne Passwort zur Hand kaeme nicht mehr an seinen Lernstand.
    await antworteMit(seite, 200, SITZUNG);
    await seite.goto('anmelden.html');
    await melde(seite);

    await expect(seite).toHaveURL(/index\.html$/);
    await expect(seite.locator('#start')).toBeVisible();

    await seite.reload();
    await expect(seite).toHaveURL(/index\.html$/);
    await expect(seite.locator('#start')).toBeVisible();
  });

  test('schickt den Namen mit der Domaene los, die nirgends auf dem Schirm steht', async ({ page: seite }) => {
    // Das Kind tippt "blauer-otter". Was daraus wird, entscheidet allein
    // src/infra/backend.js -- hier wird nachgesehen, dass es unterwegs auch
    // wirklich so aussieht.
    let gesendet = null;
    await seite.route('**/auth/v1/token*', (weg) => {
      gesendet = weg.request().postDataJSON();
      return weg.fulfill({
        status: 200, contentType: 'application/json', body: JSON.stringify(SITZUNG),
      });
    });

    await seite.goto('anmelden.html');
    await melde(seite);
    await expect(seite).toHaveURL(/index\.html$/);

    expect(gesendet.email).toBe('blauer-otter@konten.vocappulary.online');
  });

  test('sagt bei falschem Passwort einen Satz und keinen Stacktrace', async ({ page: seite }) => {
    await antworteMitFehler(seite);
    await seite.goto('anmelden.html');
    await melde(seite, 'blauer-otter', 'daneben');

    const fehler = seite.locator('#fehler');
    await expect(fehler).toBeVisible();
    await expect(fehler).toContainText('Das hat nicht gepasst');

    // Die Seite bleibt, und es geht weiter: der Knopf ist wieder zu haben.
    await expect(seite).toHaveURL(/anmelden\.html$/);
    await expect(seite.locator('#knopf')).toBeEnabled();
  });

  test('verraet nicht, ob es den Namen ueberhaupt gibt', async ({ page: seite }) => {
    // Supabase antwortet auf "Name gibt es nicht" und "Passwort falsch"
    // dasselbe, und die App macht daraus denselben Satz. Sonst koennte jeder,
    // der die Seite kennt, Pseudonyme durchprobieren.
    await antworteMitFehler(seite);
    await seite.goto('anmelden.html');
    await melde(seite, 'gibt-es-nicht', 'egal');

    await expect(seite.locator('#fehler')).toContainText('Das hat nicht gepasst');
  });
});

/** Die Antwort auf ein falsches Passwort: 400 und eine Meldung. */
async function antworteMitFehler(seite) {
  await antworteMit(seite, 400, {
    error: 'invalid_grant',
    error_description: 'Invalid login credentials',
  });
}
