// Die Lade an der rechten Seite. Jede Seite der App hat sie, und auf jeder
// verhält sie sich gleich: auf, zu, Escape, und der Fokus wandert mit.
//
// Diese Datei weiß nicht, WAS im Menü steht -- das entscheidet die jeweilige
// HTML-Datei. Sie weiß auch nichts von Karten und nichts vom Speicher. Sie
// macht auf und zu, mehr nicht.

const el = (id) => document.getElementById(id);

/** Auf und zu. Der Fokus wandert mit, sonst ist die Lade eine Falle. */
function zeige(offen) {
  el('menue').classList.toggle('menue--offen', offen);
  el('menue-schatten').classList.toggle('menue-schatten--offen', offen);
  el('menue-knopf').setAttribute('aria-expanded', String(offen));

  if (offen) el('menue-zu').focus();
  else el('menue-knopf').focus();
}

/**
 * Hängt die drei Knöpfe und Escape an. Ruft jede Seite einmal auf, die ein
 * Menü im Markup stehen hat.
 */
export function verbindeMenue() {
  el('menue-knopf').addEventListener('click', () => zeige(true));
  el('menue-zu').addEventListener('click', () => zeige(false));
  el('menue-schatten').addEventListener('click', () => zeige(false));

  // Escape schließt, wie bei jedem Overlay. Ohne das säße man fest, sobald
  // die App ohne Adressleiste auf dem Homebildschirm läuft.
  document.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Escape' && el('menue').classList.contains('menue--offen')) {
      zeige(false);
    }
  });
}
