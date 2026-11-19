import { useEffect, useRef, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "./restaurant.css";
import Ico from "../promos/IconesPromos";
import Dashboard from "./Dashboard";
import MenuGestion from "./MenuGestion";
import Reglages from "./Reglages";
import { Commandes } from "./Commandes";
import TableauCuisine from "../cuisine/TableauCuisine";
import EspaceStock from "../stock/EspaceStock";
import EspacePromos from "../promos/EspacePromos";
import EspaceEquipe from "../equipe/EspaceEquipe";
import { ongletsDe, nomPoste } from "../equipe/postes";
import { rechargerMenu } from "../stock/api";
import { enAlerte, niveau } from "../stock/outils";

const TOUS = [
  { id: "accueil", nom: "Accueil", icone: "accueil" },
  { id: "menu", nom: "Menu", icone: "couverts" },
  { id: "stock", nom: "Stock", icone: "boite" },
  { id: "commandes", nom: "Commandes", icone: "liste" },
  { id: "clients", nom: "Clients", icone: "etoile" },
  { id: "cuisine", nom: "Cuisine", icone: "flamme" },
  { id: "reglages", nom: "Réglages", icone: "reglages" },
];

export default function EspaceGerant(p) {
  const { gerant } = p;
  // Le gérant voit tout ; un membre du personnel ne voit que les onglets de son poste.
  const poste = gerant && gerant.poste;
  const permis = ongletsDe(poste);
  const ONGLETS = TOUS.filter((o) => permis.includes(o.id));
  const [onglet, setOnglet] = useState(() => permis[0]);
  // Les fonctions de chargement sont recréées à chaque affichage : on les garde dans une référence
  // pour ne recharger qu'à l'ouverture d'un onglet (sinon : boucle de requêtes).
  const chargeurs = useRef(p);
  chargeurs.current = p;
  const gerantId = gerant && gerant.id;
  useEffect(() => {
    if (!gerantId) return;
    if (onglet === "accueil") chargeurs.current.chargerStats(gerantId);
    if (onglet === "commandes") chargeurs.current.chargerCommandes(gerantId);
  }, [onglet, gerantId]);

  // Le stock baisse à chaque commande : on relit le menu toutes les 30 secondes (pause quand l'onglet du navigateur est caché).
  useEffect(() => {
    if (!gerantId) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      rechargerMenu(gerantId, (m) => chargeurs.current.setMenu(m)).catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, [gerantId]);

  // Alerte de seuil : quand un plat passe sous son seuil (ou s'épuise), un bandeau le signale (aux personnes qui voient le stock).
  const voitStock = permis.includes("stock");
  const [alerteStock, setAlerteStock] = useState(null);
  const connues = useRef(null);
  useEffect(() => {
    // Tant que le menu n'est pas arrivé, on n'a rien à comparer : le premier menu chargé sert d'état de départ (pas d'alerte pour l'existant).
    if (!p.menu || p.menu.length === 0) return;
    const maintenant = new Map(enAlerte(p.menu).map((x) => [x.id, niveau(x)]));
    if (connues.current === null) { connues.current = maintenant; return; }
    const nouveaux = [...maintenant].filter(([id, n]) => connues.current.get(id) !== n && (n === "epuise" || connues.current.get(id) !== "epuise"));
    connues.current = maintenant;
    if (nouveaux.length && voitStock) {
      const [id, n] = nouveaux[0];
      const plat = p.menu.find((x) => x.id === id);
      const plus = nouveaux.length > 1 ? ` (et ${nouveaux.length - 1} autre${nouveaux.length > 2 ? "s" : ""})` : "";
      setAlerteStock({ texte: n === "epuise" ? `${plat.nom} est épuisé${plus}` : `Stock bas : ${plat.nom}, il en reste ${plat.stock}${plus}` });
    }
  }, [p.menu, voitStock]);
  useEffect(() => {
    if (!alerteStock) return undefined;
    const t = setTimeout(() => setAlerteStock(null), 10000);
    return () => clearTimeout(t);
  }, [alerteStock]);
  const nbAlertes = enAlerte(p.menu).length;

  const ouvrir = (id) => { setOnglet(id); if (id === "cuisine") p.setNouvellesCommandes(0); window.scrollTo(0, 0); };
  // La liste garde un moment les commandes déjà servies : on ne les compte pas. (Elle peut être vide ou absente selon le poste.)
  const cuisine = Array.isArray(p.commandesCuisine) ? p.commandesCuisine : [];
  const enCours = cuisine.filter((c) => c.statut !== "servi").length;
  const aFaire = cuisine.filter((c) => c.statut === "en_cours" || c.statut === "acceptee").length;
  const titre = poste ? gerant.membre || "Équipe" : gerant && gerant.nom;
  const sousTitre = poste ? `${nomPoste(poste)} · ${gerant.nom}` : "Espace restaurant";
  const initiale = (poste ? gerant.membre || gerant.nom : gerant && gerant.nom) || "L";

  return (
    <div className="lg-page lg-appli">
      <audio ref={p.audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />
      <nav className="lg-nav" aria-label="Navigation principale">
        <div className="lg-nav-marque"><span className="lg-avatar">{initiale[0].toUpperCase()}</span><span><strong>{titre}</strong><small>{poste ? nomPoste(poste) : "Launge"}</small></span></div>
        {ONGLETS.map((o) => (
          <button key={o.id} className="lg-nav-item" aria-current={onglet === o.id || (o.id === "reglages" && onglet === "equipe") ? "page" : undefined} onClick={() => ouvrir(o.id)}>
            <span className="lg-nav-icone"><Ico nom={o.icone} taille={22} />
              {o.id === "cuisine" && (p.nouvellesCommandes > 0 || aFaire > 0) && <span className="lg-nav-pastille">{p.nouvellesCommandes > 0 ? p.nouvellesCommandes : aFaire}</span>}
              {o.id === "stock" && nbAlertes > 0 && <span className="lg-nav-pastille">{nbAlertes}</span>}
            </span>
            <span>{o.nom}</span>
          </button>
        ))}
      </nav>
      <div className="lg-principal">
        <header className="lg-haut">
          <span className="lg-avatar">{initiale[0].toUpperCase()}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div className="lg-titre lg-h3" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titre}</div><div className="lg-legende">{sousTitre}</div></div>
          <button className="lg-btn lg-btn-rond" onClick={p.onQuitter} aria-label="Se déconnecter"><Ico nom="deconnexion" /></button>
        </header>
        <main className="lg-contenu">
          {alerteStock && voitStock && (
            <div className="lg-alerte-stock" role="alert">
              <Ico nom="alerte" taille={20} /><span>{alerteStock.texte}</span>
              <button type="button" onClick={() => { setAlerteStock(null); ouvrir("stock"); }} aria-label="Voir le stock" style={{ width: "auto", padding: "0 12px", borderRadius: 16 }}>Voir</button>
              <button type="button" onClick={() => setAlerteStock(null)} aria-label="Fermer l'alerte"><Ico nom="fermer" taille={16} /></button>
            </div>
          )}
          {onglet === "accueil" && <Dashboard gerant={gerant} menu={p.menu} stats={p.stats} nbEnCours={enCours} allerCuisine={() => ouvrir("cuisine")} />}
          {onglet === "menu" && <MenuGestion gerant={gerant} menu={p.menu} setMenu={p.setMenu} />}
          {onglet === "stock" && <EspaceStock gerant={gerant} menu={p.menu} setMenu={p.setMenu} />}
          {onglet === "commandes" && <Commandes commandes={Array.isArray(p.commandes) ? p.commandes : []} />}
          {onglet === "clients" && <EspacePromos gerant={gerant} />}
          {onglet === "cuisine" && <TableauCuisine commandes={cuisine} />}
          {onglet === "reglages" && !poste && <Reglages {...p} onEquipe={() => ouvrir("equipe")} />}
          {onglet === "equipe" && !poste && <EspaceEquipe gerant={gerant} onRetour={() => ouvrir("reglages")} />}
        </main>
      </div>
    </div>
  );
}
