// Outils des promotions, avis et fidélité.
export { ilYa } from "../admin/outils";
export { fcfa } from "../restaurant/calculs";

export const libelleRemise = (p) => (p.type === "pourcent" ? `-${p.valeur} %` : `-${Number(p.valeur).toLocaleString("fr-FR")} FCFA`);

const jour = (v) => (v ? new Date(v) : null);
// État d'une promotion : "active", "inactive", "expiree", "epuisee" ou "a_venir".
export function etatPromo(p, maintenant = Date.now()) {
  if (!p.actif) return "inactive";
  if (p.fin && maintenant > jour(p.fin)) return "expiree";
  if (p.max_usages != null && p.usages >= p.max_usages) return "epuisee";
  if (p.debut && maintenant < jour(p.debut)) return "a_venir";
  return "active";
}
export const ETATS = {
  active: { texte: "Active", classe: "lg-badge-vert" },
  inactive: { texte: "Désactivée", classe: "" },
  expiree: { texte: "Expirée", classe: "lg-badge-rouge" },
  epuisee: { texte: "Épuisée", classe: "lg-badge-rouge" },
  a_venir: { texte: "À venir", classe: "lg-badge-orange" },
};

export const dateCourte = (v) => (v ? new Date(v).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "");
export const entierPositif = (v) => (/^\d+$/.test(String(v).trim()) ? Number(v) : null);
