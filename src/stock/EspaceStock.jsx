import { useState } from "react";
import "../design/tokens.css";
import "../restaurant/restaurant.css";
import "./stock.css";
import Ico from "./IconesStock";
import Niveaux from "./Niveaux";
import Inventaire from "./Inventaire";
import Historique from "./Historique";

const ONGLETS = [
  { id: "niveaux", texte: "Niveaux" },
  { id: "inventaire", texte: "Inventaire" },
  { id: "historique", texte: "Historique" },
];

// Onglet Stock du gérant : niveaux et alertes, inventaires, historique des mouvements.
export default function EspaceStock({ gerant, menu, setMenu }) {
  const [onglet, setOnglet] = useState("niveaux");
  return (
    <div className="lg-pile">
      <div className="lg-titre-ligne"><div><h1 className="lg-titre lg-h1">Stock</h1><div className="lg-legende">Le stock baisse automatiquement à chaque commande.</div></div></div>
      <div className="lg-chips" role="tablist" aria-label="Sections du stock">
        {ONGLETS.map((o) => <button key={o.id} type="button" role="tab" className="lg-chip" aria-pressed={onglet === o.id} aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}>{o.texte}</button>)}
      </div>
      {onglet === "niveaux" && <Niveaux menu={menu} setMenu={setMenu} />}
      {onglet === "inventaire" && <Inventaire gerant={gerant} menu={menu} setMenu={setMenu} />}
      {onglet === "historique" && <Historique gerant={gerant} />}
    </div>
  );
}
