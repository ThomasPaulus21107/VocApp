// Was nicht auf Anhieb saß, kommt in derselben Sitzung noch einmal.
// Nicht morgen, nicht in drei Tagen -- sofort, solange man noch dabei ist.
//
// Der Name ist Absicht: "Nachsitzen" klingt nach Strafe. Was man noch nicht
// kann, ist aber genau das, wo Üben etwas bringt.
//
// Wie alles in domain/: reine Funktion, kein Speichern, kein Datum, kein
// Zufall von innen.

/**
 * Sucht aus dem gespielten Stapel die Karten heraus, die noch einmal
 * drankommen sollen. Rein kommt die Runde, wie sie gespielt wurde, und die
 * Liste ihrer ids. Raus kommt ein neuer Stapel, in derselben Reihenfolge
 * wie der alte.
 *
 * WELCHE ids das sind, entscheidet app.js -- diese Funktion wählt nur aus.
 * Sie muss deshalb nicht wissen, ob eine Karte falsch war, erst im zweiten
 * Versuch saß oder einen Tipp gebraucht hat.
 *
 * Ist die Liste leer, ist auch der neue Stapel leer.
 */
export function lernpotential(stapel, ids) {
  return stapel.filter((karte) => ids.includes(karte.id));
}
