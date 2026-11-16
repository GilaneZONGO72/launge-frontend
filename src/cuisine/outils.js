// Outils de la cuisine (fonctions pures, sans effet de bord).

// Les 3 colonnes du tableau, dans l'ordre du parcours d'une commande.
export const COLONNES = [
  { cle: "en_cours", titre: "Nouvelles", vide: "Aucune nouvelle commande", action: "Accepter", vers: "acceptee", style: "lg-btn-orange" },
  { cle: "acceptee", titre: "En préparation", vide: "Rien en préparation", action: "Marquer prête", vers: "pret", style: "lg-btn-nuit" },
  { cle: "pret", titre: "Prêtes", vide: "Aucune commande prête", action: "Marquer servie", vers: "servi", style: "lg-btn-vert" },
];

// Une date sans fuseau horaire vient de la base (heure UTC) : on la lit comme telle.
export function dateServeur(valeur) {
  if (valeur instanceof Date) return valeur;
  const s = String(valeur || "");
  const sansFuseau = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s);
  return new Date(sansFuseau ? `${s.replace(" ", "T")}Z` : s);
}

export function minutesDepuis(valeur, maintenant = Date.now()) {
  const t = dateServeur(valeur).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, Math.floor((maintenant - t) / 60000));
}

// ok < 10 min, alerte de 10 à 19 min, retard à partir de 20 min.
export const niveauDelai = (min) => (min >= 20 ? "retard" : min >= 10 ? "alerte" : "ok");
export const texteDelai = (min) => (min < 1 ? "À l'instant" : min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`);

export function heureServeur(valeur) {
  const d = dateServeur(valeur);
  return isNaN(d) ? "" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Ordre du parcours : un statut ne fait qu'avancer.
const RANG = { en_cours: 0, acceptee: 1, pret: 2, servi: 3 };
const rang = (statut) => (Object.prototype.hasOwnProperty.call(RANG, statut) ? RANG[statut] : -1);

// Range les commandes par colonne, la plus ancienne en haut.
// `locaux` : changements déjà demandés au serveur mais pas encore revenus dans la liste ({ id: { vers, t } }).
// Tant que la liste est en retard, on affiche le statut le plus avancé ; au bout de 20 s, le serveur a toujours raison.
export function repartir(commandes, locaux = {}, maintenant = Date.now()) {
  const colonnes = { en_cours: [], acceptee: [], pret: [] };
  for (const c of commandes || []) {
    const o = locaux[c.id];
    const statut = o && maintenant - o.t < 20000 && rang(c.statut) >= 0 && rang(o.vers) > rang(c.statut) ? o.vers : c.statut;
    if (Object.prototype.hasOwnProperty.call(colonnes, statut)) colonnes[statut].push({ ...c, statut });
  }
  for (const liste of Object.values(colonnes)) liste.sort((a, b) => dateServeur(a.created_at) - dateServeur(b.created_at));
  return colonnes;
}
