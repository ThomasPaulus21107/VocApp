# Feature: Die zweite Naht zum Server

**Status:** umgesetzt am 29.08.2026 um 22:25, PR #44
**Wo im Code:** `src/infra/backend.js` — neu, dazu `package.json`,
`.env.example`, `.gitignore`, `.github/workflows/deploy.yml`

Die erste von vier Dateien, die den Lernstand nach Postgres bringen. Diese hier
baut **nur die Leitung**: den Client, die Konfiguration und eine Sitzung. Es
fließt noch nichts durch sie.

Das ist Absicht und derselbe Fall wie
[Die Speicher-Naht am Gerät](feature-storage-2026-08-29-1327.md):
sie macht allein nichts sichtbar, blockiert nichts und macht drei anderen
Features den Weg frei. `roadmap/README.md` nennt das Punkt 1 der
Aufnahmekriterien.

## Warum es diese Naht überhaupt gibt

`storage.js` sagt es im eigenen Kopf: *„Was einer Person gehört (Lernstand,
Punkte), gehört später nach Postgres und nicht hierher."* `AGENTS.md`
beschreibt die Trennung seit Wochen als Tabelle:

| | `infra/storage.js` | `infra/backend.js` |
|---|---|---|
| Gehört zu | dem **Gerät** | der **Person** |
| Inhalt | Töne an/aus, Aufgabenart, Kartenbeutel | Lernstand, Punkte, Missionen |
| Technik | `localStorage`, synchron | Supabase, asynchron |

Der Druck dahinter steht in `README.md`: **iOS löscht `localStorage` nach
sieben Tagen ohne Benutzung.** Ein Lernstand im fremden Browser ist weder zu
prüfen noch zu sichern noch wiederherzustellen.

## Einmalig im Dashboard

1. **Auth → Providers → Anonymous sign-ins: an.** Ohne das scheitert
   `signInAnonymously()` mit einem 422.
2. **Settings → API:** die Projekt-URL und den Publishable Key
   (`sb_publishable_…`) notieren.

## Anonyme Anmeldung — die Entscheidung, die alles Weitere trägt

Die Reihenfolge ist „erst die Datenbank, dann die Anmeldung". Dabei entsteht
eine Lücke: **wem gehört eine Zeile, solange es keinen Login gibt?**

Die Antwort ist `supabase.auth.signInAnonymously()`. Es legt einen echten
Nutzer an — mit einer echten `auth.uid()`, nur ohne Mailadresse. Damit gilt:

- **Row Level Security greift ab der ersten Zeile.** Kein „das härten wir
  später", was hier auch nichts wert wäre: der Key steht im ausgelieferten
  Bundle, RLS ist das Einzige zwischen den Daten und dem offenen Netz.
- **Für Matilda ändert sich nichts.** Keine Maske, kein Knopf, keine Frage.
- **Später kostet der Umstieg nichts.** Eine anonyme Sitzung ist ein echter
  Nutzer; er bekommt nachträglich eine Mailadresse und behält dieselbe uid mit
  allen Zeilen. Weil es ohne Mailanbindung keine Bestätigungsmail gibt, macht
  Thomas diesen einen Handgriff im Dashboard — siehe
  [Aus der anonymen Sitzung wird ein Konto](feature-konten-2026-09-05-1830.md).

Die Alternative wäre ein selbst erfundener Geräteschlüssel in `localStorage`
gewesen. Der hat den Fehler, dass RLS nichts prüfen kann: die Tabelle wäre für
jeden im Netz les- und schreibbar, und der Umstieg auf Konten wäre ein Umzug
aller Zeilen. Verworfen.

## Die API

Das Muster steht in [Ob die App mehrere Nutzer kennt](../feature-request-mehrere-nutzer.md)
und lautet: **einmal beim Start laden, danach aus dem Speicher im RAM lesen.**
Damit färbt die Asynchronität nicht durch die ganze App.

```js
export async function starte()   // Sitzung holen oder anonym anmelden
export function melde(ereignis)  // schreibt im Hintergrund   -> Datei 3
export async function lade()     // einmal alles holen        -> Datei 6
export function angemeldet()     // uid oder null
```

Gebaut wird hier `starte()` und `angemeldet()`. Die anderen beiden stehen schon
im Kopf der Datei, damit später niemand die Form neu erfindet.

## Zwei Eigenschaften, die nicht verhandelbar sind

**Fehlt die Konfiguration, schaltet sich `backend.js` still ab.** Kein Fehler,
keine Meldung, die App läuft wie bisher rein lokal weiter. Ein vergessenes
Secret im Workflow darf keine weiße Seite ergeben — und die Oberflächen-Tests
in `tests/oberflaeche/` laufen dadurch ohne Server und ohne Netz.

**Nie werfen.** Dieselbe Haltung wie in `storage.js`: ein fehlgeschlagenes
Speichern darf die App nie anhalten.

## Zwei Projekte: VocApp TEST und VocApp

**Lokal zeigt auf VocApp TEST, veröffentlicht wird gegen VocApp.** Nichts, was
beim Ausprobieren passiert, berührt Matildas Stand — und ausprobiert wird hier
viel: eine Tabelle, die dreimal neu angelegt wird, ein Ausgangskorb, der
absichtlich kaputtgeht, Testläufe, die Unsinn schreiben.

Zwei Wertepaare heißen zwei Wertepaare, die man verwechseln kann. Deshalb
heißen die Projekte im Dashboard erkennbar verschieden, und die Abnahme unten
schaut nach, in welchem die Zeile gelandet ist.

**Wie das Schema in beide kommt und was ein Release ist**, steht in
[Test und Produktion](feature-releases-2026-08-30-0803.md) — kurz: nicht von Hand.

## Die Schlüssel

`.env` lokal (gehört in `.gitignore`) — die Werte von **VocApp TEST**.
`.env.example` im Repo ohne Werte:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Im Deploy-Workflow zwei Secrets mit den Werten von **VocApp**, die beim
`npm run build`-Schritt als `env:` hereinkommen. Sie gehören in eine
geschützte Environment, siehe [Test und Produktion](feature-releases-2026-08-30-0803.md).

**Beide Werte sind öffentlich gedacht** — sie landen im Bundle, das GitHub
Pages ausliefert, und das ist bei Supabase der vorgesehene Weg. Der Grund für
die Variablen ist nicht Geheimhaltung, sondern Rotation: ein getauschter Key
soll keine Code-Änderung sein. **Was schützt, ist RLS**, siehe
[Die Ereignistabelle mit Row Level Security](feature-ereignistabelle-2026-08-30-0815.md).

## Die neue Abhängigkeit

`@supabase/supabase-js` ist die **erste echte Laufzeit-Abhängigkeit** des
Projekts — bisher sind alle vier `devDependencies`. `AGENTS.md` verlangt dafür
eine Rückfrage; sie ist am 29.08.2026 gestellt und mit ja beantwortet worden.

Die Alternative war `fetch` von Hand: PostgREST und GoTrue sind normale
REST-Endpunkte, ein Insert ist ein POST. Das trägt genau bis zur Anmeldung.
Danach kommen Sitzungsspeicherung und Token-Erneuerung dazu — die Teile, die
von Hand still kaputtgehen, und zwar erst nach einer Stunde und nur bei dem,
der die App wirklich benutzt.

## Tests

`tests/backend.test.js`, neu, nach dem Muster von `tests/storage.test.js`: der
interessante Teil ist nicht der Erfolgsfall, sondern was passiert, wenn es
nicht geht.

- Ohne Konfiguration wirft nichts, und `angemeldet()` ist `null`.
- `verbinde(client)` nimmt einen falschen Client entgegen — so wie
  `storage.test.js` heute einen falschen `localStorage` einsetzt. Ohne diese
  Naht wäre die Datei nur mit Netz zu testen, und das wäre keiner.
- Eine gescheiterte Anmeldung hält die App nicht an.

## Die Abnahme

- `npm run dev`, dann in der Konsole nachsehen, dass eine Sitzung existiert und
  `angemeldet()` eine uid liefert.
- **Die Zeile landet in VocApp TEST, nicht in VocApp.** Beide Dashboards offen,
  in einem muss es leer bleiben.
- `.env` umbenennen und neu starten: die App läuft vollständig, nur eben
  lokal. Das ist derselbe Zustand, in dem die Oberflächen-Tests laufen.

## Voraussetzung

Keine. Diese Datei kommt zuerst.

## Was danach kommt

[Die Ereignistabelle](feature-ereignistabelle-2026-08-30-0815.md) (parallel möglich),
dann [Jede Antwort geht zum Server](feature-ereignisse-melden-2026-08-30-1000.md).
