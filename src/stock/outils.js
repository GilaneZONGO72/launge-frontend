// Outils du stock : niveaux, tri, libellés.
export { ilYa } from "../admin/outils";

// Niveau d'un plat : "epuise" (0), "bas" (sous le seuil d'alerte) ou "ok".
export function niveau(p) {
  const stock = Number(p.stock);
  const seuil = Number(p.seuil_alerte);
  if (!isFinite(stock) || stock <= 0) return "epuise";
  if (isFinite(seuil) && seuil > 0 && stock <= seuil) return "bas";
  return "ok";
}

export const NIVEAUX = {
  epuise: { texte: "Épuisé", classe: "lg-badge-rouge", rang: 0 },
  bas: { texte: "Stock bas", classe: "lg-badge-orange", rang: 1 },
  ok: { texte: "Suffisant", classe: "lg-badge-vert", rang: 2 },
};

// Les plats à surveiller d'abord, puis par ordre alphabétique.
export const trier = (menu) => [...(menu || [])].sort((a, b) =>
  NIVEAUX[niveau(a)].rang - NIVEAUX[niveau(b)].rang || String(a.nom).localeCompare(String(b.nom), "fr"));

export const compterNiveaux = (menu) => {
  const c = { epuise: 0, bas: 0, ok: 0 };
  (menu || []).forEach((p) => { c[niveau(p)] += 1; });
  return c;
};

// Plats en alerte qui comptent pour la clientèle (un plat masqué volontairement n'alerte pas).
export const enAlerte = (menu) => (menu || []).filter((p) => p.disponible !== false && niveau(p) !== "ok");

// Part de la barre de niveau : 100 % = trois fois le seuil (ou 10 si aucun seuil).
export const part = (p) => {
  const plafond = Math.max(10, (Number(p.seuil_alerte) || 0) * 3);
  return Math.max(0, Math.min(100, Math.round((Number(p.stock) || 0) / plafond * 100)));
};

export const MOTIFS = {
  commande: "Commande client",
  reapprovisionnement: "Réception de marchandise",
  correction: "Correction",
  inventaire: "Inventaire",
  annulation: "Commande annulée",
};

export const signe = (n) => (n > 0 ? `+${n}` : `${n}`);
