// Les postes de l'équipe et ce que chacun voit dans l'espace restaurant.
// (Le serveur applique les mêmes règles : ces listes servent seulement à n'afficher que l'utile.)
export const POSTES = {
  manager: { nom: "Manager", texte: "Menu, stock, commandes, clients et chiffres. Ne gère ni l'équipe ni les réglages.", onglets: ["accueil", "menu", "stock", "commandes", "clients", "cuisine"] },
  caissier: { nom: "Caissier", texte: "Voit les commandes et les fait avancer.", onglets: ["commandes", "cuisine"] },
  cuisinier: { nom: "Cuisinier", texte: "Voit uniquement la cuisine, sans les chiffres.", onglets: ["cuisine"] },
  stock: { nom: "Responsable de stock", texte: "Gère les stocks, les réceptions et les inventaires.", onglets: ["stock"] },
};
export const ORDRE_POSTES = ["manager", "caissier", "cuisinier", "stock"];
export const TOUS_ONGLETS = ["accueil", "menu", "stock", "commandes", "clients", "cuisine", "reglages"];
// Le gérant (sans poste) voit tout.
export const ongletsDe = (poste) => (poste && POSTES[poste] ? POSTES[poste].onglets : TOUS_ONGLETS);
export const nomPoste = (poste) => (POSTES[poste] ? POSTES[poste].nom : poste);
