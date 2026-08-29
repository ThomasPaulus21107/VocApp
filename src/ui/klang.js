// Töne für die Rückmeldung. Kennt keinen DOM und keine Lernlogik --
// bekommt nur gesagt, welcher Ton kommen soll.
//
// Die Töne werden im Browser gerechnet, es gibt also keine Sounddateien.
// Wer eine Melodie ändern will, ändert hier die Zahlen:
//   hertz = Tonhöhe (höher klingt fröhlicher, tiefer klingt ernster)
//   ab    = wann der Ton losgeht, in Sekunden nach dem Start
//   dauer = wie lange er klingt
//   laut  = freiwillig. Ohne Angabe gilt STANDARD_LAUT.

// Wie laut ein Ton normalerweise ist. 1 wäre viel zu laut, 0 wäre still.
const STANDARD_LAUT = 0.2;

// Die Töne unterscheiden sich in Richtung (auf oder ab), Anzahl und
// Lautstärke -- nicht nur in der Tonhöhe. So hört man den Unterschied auch
// nebenbei, ohne hinzusehen. Beim Umbauen sollte das erhalten bleiben.
const MELODIEN = {
  // Zwei Töne aufwärts: das klingt wie "geschafft".
  richtig: [
    { hertz: 660, ab: 0, dauer: 0.12 },
    { hertz: 880, ab: 0.1, dauer: 0.18 },
  ],
  // Ein einzelner Ton in der Mitte: kein Lob, aber auch kein Urteil.
  nochmal: [
    { hertz: 520, ab: 0, dauer: 0.14 },
  ],
  // Zwei Töne abwärts: freundlich, nicht wie ein Fehlerpiepsen.
  falsch: [
    { hertz: 330, ab: 0, dauer: 0.16 },
    { hertz: 220, ab: 0.14, dauer: 0.26 },
  ],
  // Zuspruch auf "keine Ahnung". Drei Töne statt zwei -- freundlich, aber
  // hörbar anders als das echte Richtig.
  mutmachen: [
    { hertz: 587, ab: 0, dauer: 0.1 },
    { hertz: 587, ab: 0.12, dauer: 0.1 },
    { hertz: 784, ab: 0.24, dauer: 0.2 },
  ],
  // Leere Eingabe. Kurz, tief und leise -- ein Stupser, kein Urteil.
  leer: [
    { hertz: 300, ab: 0, dauer: 0.07, laut: 0.08 },
  ],

  /* =====================================================
     UND DIESE VIER GEHÖREN DIR AUCH, MATILDA
     Der erste kommt auf der Zwischenseite, wenn die Runde
     durch ist. Die anderen drei gehören zu den Effekten
     bei den drei besten Noten -- der Ton zur Rakete, zum
     Konfetti und zum Sternenregen.
     ===================================================== */

  // Die Runde ist geschafft. Vier Töne aufwärts: länger und größer als das
  // Richtig einer einzelnen Karte, aber noch keine Fanfare -- die Note
  // steht ja noch aus.
  geschafft: [
    { hertz: 523, ab: 0, dauer: 0.12 },
    { hertz: 659, ab: 0.1, dauer: 0.12 },
    { hertz: 784, ab: 0.2, dauer: 0.12 },
    { hertz: 1047, ab: 0.3, dauer: 0.3 },
  ],
  // Zur Rakete: erst drei tiefe Ticks wie ein Countdown, waehrend sie noch
  // zittert -- dann schraubt sich der Ton hoch, wie ein Abheben.
  rakete: [
    { hertz: 200, ab: 0, dauer: 0.08, laut: 0.12 },
    { hertz: 200, ab: 0.3, dauer: 0.08, laut: 0.12 },
    { hertz: 200, ab: 0.6, dauer: 0.08, laut: 0.12 },
    { hertz: 262, ab: 0.9, dauer: 0.12 },
    { hertz: 392, ab: 1.02, dauer: 0.12 },
    { hertz: 523, ab: 1.14, dauer: 0.12 },
    { hertz: 659, ab: 1.26, dauer: 0.12 },
    { hertz: 784, ab: 1.38, dauer: 0.12 },
    { hertz: 1047, ab: 1.5, dauer: 0.16 },
    { hertz: 1568, ab: 1.66, dauer: 0.55 },
  ],
  // Zum Konfetti: ein heller Dreiklang, der oben stehen bleibt.
  konfetti: [
    { hertz: 659, ab: 0, dauer: 0.12 },
    { hertz: 880, ab: 0.12, dauer: 0.12 },
    { hertz: 1319, ab: 0.24, dauer: 0.36 },
  ],
  // Zum Einhorn: eine kleine Zauberleiter, die oben stehen bleibt und dann
  // noch zweimal funkelt. Laenger als die anderen -- das Einhorn steht ja
  // fuenf Sekunden da.
  einhorn: [
    { hertz: 523, ab: 0, dauer: 0.1 },
    { hertz: 659, ab: 0.1, dauer: 0.1 },
    { hertz: 784, ab: 0.2, dauer: 0.1 },
    { hertz: 1047, ab: 0.3, dauer: 0.1 },
    { hertz: 1319, ab: 0.4, dauer: 0.3 },
    { hertz: 1568, ab: 0.9, dauer: 0.12, laut: 0.14 },
    { hertz: 2093, ab: 1.1, dauer: 0.12, laut: 0.12 },
    { hertz: 1568, ab: 1.7, dauer: 0.12, laut: 0.12 },
    { hertz: 2093, ab: 1.9, dauer: 0.35, laut: 0.1 },
  ],
  // Zum Sternenregen: drei kurze Funken, leiser als die anderen beiden.
  sterne: [
    { hertz: 1047, ab: 0, dauer: 0.09, laut: 0.14 },
    { hertz: 1319, ab: 0.12, dauer: 0.09, laut: 0.14 },
    { hertz: 1568, ab: 0.24, dauer: 0.22, laut: 0.14 },
  ],
};

/* =========================================================
   DIE TETRIS-MELODIE, MATILDA
   Sie kommt nur bei einer 1+ in einer ARBEIT -- das Beste,
   was die App zu vergeben hat.

   Die Melodie ist zu lang, um jeden Ton einzeln zu tippen.
   Deshalb steht sie als Folge von [Ton, Länge] da: 'E5' ist
   das E in der fünften Oktave, die Zahl daneben sagt, wie
   viele Achtel er klingt. 'pause' ist Stille.

   Ändern? Tausch Töne aus oder häng welche an. Wie lange
   ein Achtel dauert, steht in ACHTEL -- kleiner heißt
   schneller.
   ========================================================= */

// Die Töne, die in der Melodie vorkommen, mit ihrer Höhe in Hertz.
const TOENE = {
  A4: 440, B4: 494, C5: 523, D5: 587, E5: 659,
  F5: 698, G5: 784, A5: 880, pause: 0,
};

// Wie lange ein Achtel dauert, in Sekunden.
const ACHTEL = 0.15;

// Korobeiniki, ein russisches Volkslied -- die Melodie, die jeder als
// Tetris kennt. Vier Zeilen hin, vier Zeilen zurück: rund zehn Sekunden.
const TETRIS = [
  ['E5', 2], ['B4', 1], ['C5', 1], ['D5', 2], ['C5', 1], ['B4', 1],
  ['A4', 2], ['A4', 1], ['C5', 1], ['E5', 2], ['D5', 1], ['C5', 1],
  ['B4', 3], ['C5', 1], ['D5', 2], ['E5', 2],
  ['C5', 2], ['A4', 2], ['A4', 2], ['pause', 2],

  ['D5', 3], ['F5', 1], ['A5', 2], ['G5', 1], ['F5', 1],
  ['E5', 3], ['C5', 1], ['E5', 2], ['D5', 1], ['C5', 1],
  ['B4', 2], ['B4', 1], ['C5', 1], ['D5', 2], ['E5', 2],
  ['C5', 2], ['A4', 2], ['A4', 2], ['pause', 2],
];

/**
 * Rechnet eine Folge aus [Ton, Länge] in die Form um, die spiele() versteht:
 * jeder Ton bekommt seine Startzeit, Pausen fallen einfach heraus.
 */
function ausNoten(folge, achtel = ACHTEL) {
  const melodie = [];
  let ab = 0;

  for (const [ton, laenge] of folge) {
    const dauer = laenge * achtel;
    // Ein bisschen Luft zwischen zwei Tönen, sonst klingt es wie ein
    // einziger langer -- besonders bei zwei gleichen hintereinander.
    if (TOENE[ton]) melodie.push({ hertz: TOENE[ton], ab, dauer: dauer * 0.9 });
    ab += dauer;
  }
  return melodie;
}

MELODIEN.tetris = ausNoten(TETRIS);

// Browser erlauben Töne erst, nachdem jemand geklickt oder getippt hat.
// Deshalb entsteht der AudioContext beim ersten Ton und wird danach
// wiederverwendet -- nicht schon beim Laden der Seite.
let hoerer = null;

function holeHoerer() {
  if (hoerer === null) hoerer = new AudioContext();
  if (hoerer.state === 'suspended') hoerer.resume();
  return hoerer;
}

/**
 * Spielt eine der Melodien ab. Ein unbekannter Name bleibt still --
 * ein fehlender Ton soll die App nicht anhalten.
 */
// Ob ueberhaupt Toene kommen. Der Schalter steht hier und nicht in ui.js:
// diese Datei weiss, ob und wie ein Ton klingt -- also weiss sie auch, dass
// gerade keiner klingen soll.
let angeschaltet = true;

/** Toene an oder aus. Wer nichts einstellt, hoert sie -- Standard ist an. */
export function schalte(an) {
  angeschaltet = an;
}

export function spiele(name) {
  if (!angeschaltet) return;

  const melodie = MELODIEN[name];
  if (!melodie) return;

  const hoer = holeHoerer();
  const jetzt = hoer.currentTime;

  for (const { hertz, ab, dauer, laut } of melodie) {
    const schwingung = hoer.createOscillator();
    const lautstaerke = hoer.createGain();

    schwingung.type = 'sine';           // weich, kein schriller Piepser
    schwingung.frequency.value = hertz;

    // Ohne Ausblenden knackst es am Ende. Deshalb fällt die Lautstärke
    // von ihrem Startwert sanft gegen null.
    lautstaerke.gain.setValueAtTime(laut ?? STANDARD_LAUT, jetzt + ab);
    lautstaerke.gain.exponentialRampToValueAtTime(0.001, jetzt + ab + dauer);

    schwingung.connect(lautstaerke).connect(hoer.destination);
    schwingung.start(jetzt + ab);
    schwingung.stop(jetzt + ab + dauer);
  }
}
