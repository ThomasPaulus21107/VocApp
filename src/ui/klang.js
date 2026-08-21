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

// Die fünf Töne unterscheiden sich in Richtung (auf oder ab), Anzahl und
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
};

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
export function spiele(name) {
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
