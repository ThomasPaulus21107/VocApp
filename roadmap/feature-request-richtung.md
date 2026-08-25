# Feature: Entscheiden, ob die Abfragerichtung umschaltbar wird

**Status:** bereit — durchdacht, noch nicht gebaut
**Wo im Code:** `index.html`, `src/ui/ui.js`, `src/app.js`

Kein Feature für die App, sondern eine Entscheidung — wie
[Wie die Oberfläche getestet wird](feature-request-ui-tests.md). Sie steht hier,
weil sie sonst als halb fertiger Code im Repo weiterlebt, ohne dass jemand
sagt, ob er je angeschaltet werden soll.

## Der Zustand heute

Die Richtungswahl ist **zur Hälfte gebaut**:

- Das Markup steht in `index.html` als `<fieldset id="richtung">`
- `ui.js` verdrahtet die Radios in `verbinde()`
- `app.js` reicht kein `aufRichtungswechsel` durch, deshalb blendet `ui.js`
  das Feld aus und steigt aus
- `RICHTUNG` steht fest auf `NACH_EN`

Anschalten wären wenige Zeilen. Die Domäne kann es längst: `stelleFrage()`,
`stelleFrageZuForm()` und `stelleFormFrage()` nehmen die Richtung alle
entgegen.

## Warum es trotzdem nicht einfach angeschaltet wird

**Die Gegenrichtung ist eine andere, leichtere Übung.** Heute steht das
deutsche Verb da und die englische Form wird getippt — man muss sie
*produzieren*. Andersherum steht „wrote" da und gefragt ist „schrieb": man
muss nur *wiedererkennen*, und das kann man oft aus der Ähnlichkeit raten.

Dazu kommt: laut `AGENTS.md` trägt **nur der Infinitiv alle Bedeutungen**. Die
zweite und dritte Form stehen nur in der Hauptbedeutung da. In Richtung
Deutsch heißt das, dass „brach" gilt und „zerbrach" nicht — bei einer Frage,
die ohnehin schon leichter ist.

## Wofür es dagegen spricht

Für normale Vokabeln (nicht für die Formen) ist beide Richtungen zu üben genau
richtig, und dort trägt jede Karte beide Sprachen vollständig. Sobald der
Vokabel-Strang wieder aufgenommen wird, ändert sich die Rechnung.

## Zu entscheiden

- [ ] Bleibt die Richtung fest auf Deutsch → Englisch, solange nur Verben
      geübt werden?
- [ ] Falls ja: bleibt das tote Markup liegen, oder fliegt es raus und kommt
      mit dem Vokabel-Strang zurück?

Solange nichts entschieden ist, gilt der Zustand von heute: fest auf
`NACH_EN`, Markup bleibt liegen.
