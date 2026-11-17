// Petits outils de l'espace administrateur.

export const STATUTS = {
  en_attente: { texte: "En attente", classe: "lg-badge-orange" },
  valide: { texte: "Actif", classe: "lg-badge-vert" },
  refuse: { texte: "Refusé", classe: "lg-badge-rouge" },
};

// La base enregistre parfois les dates sans fuseau : on les lit comme UTC (même règle que la cuisine).
export function dateServeur(v) {
  if (!v) return null;
  const s = String(v);
  const d = new Date(/(Z|[+-]\d\d:?\d\d)$/.test(s) ? s : `${s.replace(" ", "T")}Z`);
  return isNaN(d.getTime()) ? null : d;
}

// « il y a 3 h », « il y a 2 jours », sinon la date.
export function ilYa(v, maintenant = Date.now()) {
  const d = dateServeur(v);
  if (!d) return "";
  const min = Math.max(0, Math.floor((maintenant - d.getTime()) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} jour${j > 1 ? "s" : ""}`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export const ACTIONS_JOURNAL = {
  valider: "a validé",
  refuser: "a refusé ou suspendu",
  supprimer: "a supprimé",
};

const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Filtre par onglet (statut) puis par recherche (nom, ville, adresse, email, code).
export function filtrer(restos, onglet, recherche) {
  const q = norm(recherche.trim());
  return restos.filter((r) => (onglet === "tous" || r.statut === onglet)
    && (!q || norm(`${r.nom} ${r.ville} ${r.adresse} ${r.email} ${r.code_unique}`).includes(q)));
}

export const compter = (restos) => ({
  tous: restos.length,
  en_attente: restos.filter((r) => r.statut === "en_attente").length,
  valide: restos.filter((r) => r.statut === "valide").length,
  refuse: restos.filter((r) => r.statut === "refuse").length,
});
