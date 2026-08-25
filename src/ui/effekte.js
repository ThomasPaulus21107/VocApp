// Die Belohnung für eine sehr gute Runde. Zweite Schwester von klang.js:
// diese Datei bekommt eine Note gesagt und zeigt den passenden Effekt.
// Sie rechnet keine Note aus und entscheidet nicht, ob eine Runde gut war.
//
// Alles ist DOM und CSS, kein Canvas und keine Bibliothek. Ein Schnipsel ist
// ein <span> aus einer Vorlage im HTML, die Bewegung macht styles.css.

/* =========================================================
   AUCH DAS HIER GEHÖRT DIR, MATILDA
   Welche Note welchen Effekt bekommt. Links steht die Note,
   rechts der Name des Effekts. Tauschen, speichern, Runde
   spielen.

   Die drei Namen gibt es: 'rakete', 'konfetti', 'sterne'.
   Eine Note, die hier nicht steht, bekommt keinen Effekt --
   sonst wäre es keine Belohnung mehr.

   ACHTUNG bei "1−": das ist ein echtes Minuszeichen und
   kein Bindestrich. Es kommt aus der Notentabelle in
   src/domain/note.js und darf nicht neu getippt werden --
   am besten kopieren.
   ========================================================= */
const EFFEKTE = {
  '1+': 'rakete',
  '1':  'konfetti',
  '1−': 'sterne',
};

// Wie viele Teilchen ein Effekt bekommt. Mehr sieht voller aus und kostet
// mehr Rechenzeit -- auf einem alten Handy merkt man das.
//
// Bei der Rakete ist das ERSTE Teilchen die Rakete selbst, alle weiteren sind
// die Funken ihrer Spur. 1 + 13 also.
const TEILCHEN = {
  rakete: 14,
  konfetti: 30,
  sterne: 12,
};

// Wie lange ein Teilchen fliegt: eine feste Grundzeit und ein Zufallszuschlag
// obendrauf, damit nicht alles gleichzeitig ankommt. In Sekunden.
//
// Die Rakete braucht am längsten -- sie zittert erst und hebt dann ab. Wer
// sie länger fliegen lassen will, ändert hier die Zahl und in styles.css
// nichts: die Bewegung richtet sich nach der Dauer.
const DAUER = {
  rakete:   { grund: 2.8, zufall: 0 },
  funke:    { grund: 1.2, zufall: 0.4 },
  konfetti: { grund: 1.4, zufall: 0.8 },
  sterne:   { grund: 1.4, zufall: 0.8 },
};

// Wann die Funken der Raketenspur loslegen: erst wenn die Rakete abgehoben
// hat. Vorher zittert sie noch, da wäre eine Spur unter ihr Unsinn.
const ABHEBEN = 0.9;

const el = {
  buehne: document.querySelector('#effekt'),
  vorlage: document.querySelector('#teilchen-vorlage'),
};

/**
 * Wer Bewegung im Browser abgeschaltet hat, bekommt keine. Der Ton bleibt --
 * das ist die Einstellung für Bewegung, nicht für Belohnung.
 */
function bewegungErwuenscht() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Zeigt den Effekt zu einer Note und gibt seinen Namen zurück, damit die
 * UI den passenden Ton dazu spielen kann. Gibt es zur Note keinen Effekt,
 * kommt null zurück und es passiert nichts.
 */
export function zeige(note) {
  // Reste einer vorherigen Runde weg, bevor neue dazukommen. Das steht vor
  // allem anderen, damit auch eine Runde ohne Effekt sauber aufräumt.
  el.buehne.textContent = '';

  const effekt = EFFEKTE[note] ?? null;
  if (effekt === null) return null;
  if (!bewegungErwuenscht()) return effekt;

  for (let nummer = 0; nummer < TEILCHEN[effekt]; nummer++) {
    el.buehne.append(baueTeilchen(effekt, nummer));
  }

  return effekt;
}

/**
 * Ein einzelnes Teilchen. Das Markup kommt aus der Vorlage im HTML und wird
 * geklont -- kein innerHTML, wie überall in dieser Schicht.
 *
 * Gesetzt werden nur zwei Dinge: die Klasse für die Bewegung und ein paar
 * Zahlen als CSS-Variablen. Wohin es fliegt und wie schnell, steht in
 * styles.css.
 */
function baueTeilchen(effekt, nummer) {
  const teilchen = el.vorlage.content.firstElementChild.cloneNode(true);

  // Bei der Rakete sieht das erste Teilchen anders aus als alle weiteren:
  // eins ist die Rakete, der Rest ist ihre Spur.
  const art = effekt === 'rakete' && nummer > 0 ? 'funke' : effekt;
  teilchen.classList.add(`teilchen--${art}`);

  // Ohne Zufall sähen alle dreißig Schnipsel gleich aus und fielen im
  // Gleichschritt. Der Zufall darf hier stehen: das ist Anzeige, keine Regel.
  const dauer = DAUER[art];
  teilchen.style.setProperty('--links', `${Math.random() * 100}%`);
  teilchen.style.setProperty('--drehung', `${Math.random() * 720 - 360}deg`);
  teilchen.style.setProperty('--dauer', `${dauer.grund + Math.random() * dauer.zufall}s`);
  teilchen.style.setProperty('--warten',
    art === 'funke' ? `${ABHEBEN + nummer * 0.05}s` : `${nummer * 0.04}s`);
  // Nur die Sternfunken brauchen eine Höhe: sie springen rund um die Note,
  // statt wie das Konfetti von oben zu fallen.
  teilchen.style.setProperty('--hoch', `${20 + Math.random() * 40}%`);
  // Die Raketenspur weht leicht zur Seite, sonst wäre sie ein Strich.
  teilchen.style.setProperty('--seite', `${Math.random() * 3 - 1.5}rem`);

  if (art === 'rakete') teilchen.textContent = '🚀';
  if (art === 'sterne') teilchen.textContent = '✨';
  if (art === 'funke') teilchen.textContent = '✦';

  // Aufräumen, sobald das Teilchen ausgeflogen ist. Sonst sammeln sich über
  // mehrere Runden hunderte unsichtbare Elemente an.
  teilchen.addEventListener('animationend', () => teilchen.remove());

  return teilchen;
}
