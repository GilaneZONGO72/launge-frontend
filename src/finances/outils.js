// Règles et petits outils des finances. (Le serveur applique les mêmes règles : ces valeurs servent à l'affichage.)
export const MAJORATION_PCT = 1;
export const COMMISSION_PCT = 1;
export const COMMISSION_MIN = 100;
export const PART_RESTO_PCT = 25;

export const fcfa = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;

// Prix affiché aux clients pour un prix saisi par le gérant : +1 %, arrondi aux 5 FCFA supérieurs.
export function prixClient(prix) {
  const p = Math.round(Number(prix) || 0);
  return p <= 0 ? 0 : Math.ceil((p * (100 + MAJORATION_PCT)) / 500) * 5;
}

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const lire = (jour) => { const [a, m, j] = String(jour).slice(0, 10).split("-").map(Number); return { a, m, j }; };
// « 16 au 22 nov. » ou « 28 oct. au 3 nov. »
export function libelleSemaine(debut) {
  const d = new Date(`${String(debut).slice(0, 10)}T00:00:00Z`);
  const f = new Date(d.getTime() + 6 * 86400000);
  const a = { j: d.getUTCDate(), m: d.getUTCMonth() }, b = { j: f.getUTCDate(), m: f.getUTCMonth(), a: f.getUTCFullYear() };
  return a.m === b.m ? `${a.j} au ${b.j} ${MOIS[b.m]} ${b.a}` : `${a.j} ${MOIS[a.m]} au ${b.j} ${MOIS[b.m]} ${b.a}`;
}
export const decaler = (jour, n) => { const { a, m, j } = lire(jour); const d = new Date(Date.UTC(a, m - 1, j + n)); return d.toISOString().slice(0, 10); };

// Le restaurant encaisse tout ; chaque semaine il doit à Launge sa part de la commission.
export function phraseDu(montant, perspective) {
  const m = Number(montant || 0);
  if (m <= 0) return "Rien à payer à Launge";
  return perspective === "admin" ? `Le restaurant doit ${fcfa(m)}` : `À reverser à Launge : ${fcfa(m)}`;
}
