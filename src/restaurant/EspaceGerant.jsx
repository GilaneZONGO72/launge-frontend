import { useEffect, useRef, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "./restaurant.css";
import Ico from "./IconeGerant";
import Dashboard from "./Dashboard";
import MenuGestion from "./MenuGestion";
import Reglages from "./Reglages";
import { Commandes, Cuisine } from "./Commandes";

const ONGLETS = [
  { id: "accueil", nom: "Accueil", icone: "accueil" },
  { id: "menu", nom: "Menu", icone: "couverts" },
  { id: "commandes", nom: "Commandes", icone: "liste" },
  { id: "cuisine", nom: "Cuisine", icone: "flamme" },
  { id: "reglages", nom: "Réglages", icone: "reglages" },
];

export default function EspaceGerant(p) {
  const [onglet, setOnglet] = useState("accueil");
  const { gerant } = p;
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

  const ouvrir = (id) => { setOnglet(id); if (id === "cuisine") p.setNouvellesCommandes(0); window.scrollTo(0, 0); };
  const enCours = p.commandesCuisine.length;

  return (
    <div className="lg-page lg-appli">
      <audio ref={p.audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />
      <nav className="lg-nav" aria-label="Navigation principale">
        <div className="lg-nav-marque"><span className="lg-avatar">{gerant && gerant.nom ? gerant.nom[0].toUpperCase() : "L"}</span><span><strong>{gerant && gerant.nom}</strong><small>Launge</small></span></div>
        {ONGLETS.map((o) => (
          <button key={o.id} className="lg-nav-item" aria-current={onglet === o.id ? "page" : undefined} onClick={() => ouvrir(o.id)}>
            <span className="lg-nav-icone"><Ico nom={o.icone} taille={22} />
              {o.id === "cuisine" && (p.nouvellesCommandes > 0 || enCours > 0) && <span className="lg-nav-pastille">{p.nouvellesCommandes > 0 ? p.nouvellesCommandes : enCours}</span>}
            </span>
            <span>{o.nom}</span>
          </button>
        ))}
      </nav>
      <div className="lg-principal">
        <header className="lg-haut">
          <span className="lg-avatar">{gerant && gerant.nom ? gerant.nom[0].toUpperCase() : "L"}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div className="lg-titre lg-h3" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gerant && gerant.nom}</div><div className="lg-legende">Espace restaurant</div></div>
          <button className="lg-btn lg-btn-rond" onClick={p.onQuitter} aria-label="Se déconnecter"><Ico nom="deconnexion" /></button>
        </header>
        <main className="lg-contenu">
          {onglet === "accueil" && <Dashboard gerant={gerant} menu={p.menu} stats={p.stats} nbEnCours={enCours} allerCuisine={() => ouvrir("cuisine")} />}
          {onglet === "menu" && <MenuGestion gerant={gerant} menu={p.menu} setMenu={p.setMenu} />}
          {onglet === "commandes" && <Commandes commandes={p.commandes} />}
          {onglet === "cuisine" && <Cuisine commandesCuisine={p.commandesCuisine} changerStatut={p.changerStatut} />}
          {onglet === "reglages" && <Reglages {...p} />}
        </main>
      </div>
    </div>
  );
}
