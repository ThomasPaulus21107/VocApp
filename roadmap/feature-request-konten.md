# Feature: Aus der anonymen Sitzung wird ein Konto

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `anmelden.html` und `src/anmelden.js` — neu, dazu
`vite.config.js`, `src/ui/menue.js`, `src/infra/backend.js`

Der Anfang von Phase 2. Ab hier gehört ein Lernstand einer **Person** und nicht
mehr einem Browser.

## Vorher zu entscheiden: wer legt Konten an?

Die Frage steht als offen in
[Ob die App mehrere Nutzer kennt](feature-request-mehrere-nutzer.md) und ist es
noch. **Solange sie offen ist, wird an dieser Datei nicht gebaut.**

Mein Vorschlag: **Thomas, von Hand im Dashboard. Keine Selbstregistrierung.**
Ein offenes Anmeldeformular im Netz ist bei Kinderdaten die Tür, die man nicht
aufmacht — und bei einem Dutzend Kindern sind zwölf Konten von Hand eine halbe
Stunde, kein Feature. Die Oberfläche kennt dann nur Anmelden, nicht
Registrieren.

## Der Schritt, der nichts kostet

`updateUser({ email, password })` macht aus der laufenden anonymen Sitzung ein
richtiges Konto. **Dieselbe uid, alle Zeilen bleiben liegen.**

Genau dafür stand die Entscheidung in
[Die zweite Naht zum Server](feature-request-backend-naht.md): Matilda übt seit
Phase 1 anonym, und in dem Moment, in dem sie eine Mailadresse hinterlegt, ist
ihr gesamter bisheriger Stand ihrer. Kein Umzug, keine Zusammenführung, kein
Sonderfall im Code.

Für alle anderen — die Kinder, deren Konten von Hand entstehen — gilt der
normale Weg: anmelden, und die anonyme Sitzung des Geräts wird verworfen. Was
darin lag, gehörte dem Gerät, nicht ihnen.

## Was gebaut wird

- **`anmelden.html` + `src/anmelden.js`**, vierter Einstiegspunkt in
  `vite.config.js` neben `index`, `fortschritt` und `fleiss`. Kein Router,
  keine neue Abhängigkeit — dieselbe Entscheidung wie bei den beiden
  Statistikseiten.
- **Abmelden und „wer bin ich"** in `src/ui/menue.js`. Ein Name und ein Knopf,
  mehr nicht.
- **Ein Pseudonym als Anzeigename** in einer kleinen `profile`-Tabelle (uid,
  pseudonym), RLS wie bei den Ereignissen: jeder sieht sein eigenes.
  **Klarnamen kommen nicht hinein**, siehe
  [Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).

## Was ausdrücklich nicht gebaut wird

Alles, wofür ein anderer den Namen sehen müsste: **Rangliste, Missionen,
userübergreifender Punktestand.** Das hängt an der Frage *was ist ein Punkt?*
im [Backlog](backlog.md) und wird hier nicht angefasst — auch nicht „schon mal
vorbereitet". Die `profile`-Tabelle bekommt deshalb genau zwei Spalten.

## Die Abnahme

- Anmelden, neu laden, noch angemeldet. Als Oberflächen-Test in
  `tests/oberflaeche/` — die Sitzung über einen Neustart zu verlieren ist genau
  der Fehler, den man von Hand nie bemerkt, weil man beim Testen nicht neu
  lädt.
- Aus einer anonymen Sitzung mit gefülltem Lernstand ein Konto machen: **der
  Stand ist noch da.**
- Abmelden und wieder anmelden: der Stand ist wieder da.

## Voraussetzung

Phase 1 vollständig, also
[die Naht](feature-request-backend-naht.md),
[die Tabelle](feature-request-ereignistabelle.md),
[das Melden](feature-request-ereignisse-melden.md) und
[der Umzug](feature-request-umzug-des-bestands.md). Dazu die Entscheidung ganz
oben.

## Was danach kommt

Zwei Dinge, unabhängig voneinander:
[Der Server wird die Wahrheit](feature-request-server-ist-die-wahrheit.md) und —
**bevor das erste fremde Kind mitübt** —
[Wenn fremde Kinder mitüben](feature-request-kinderdaten.md).
