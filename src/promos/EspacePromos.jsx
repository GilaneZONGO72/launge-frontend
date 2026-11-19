import { useState } from "react";
import "../design/tokens.css";
import "../restaurant/restaurant.css";
import "./promos.css";
import Promotions from "./Promotions";
import AvisGerant from "./AvisGerant";
import Fidelite from "./Fidelite";

const ONGLETS = [
  { id: "promos", texte: "Promotions" },
  { id: "avis", texte: "Avis" },
  { id: "fidelite", texte: "Fidélité" },
];

// Onglet « Clients » du gérant : codes promo, avis des clients, programme de fidélité.
export default function EspacePromos({ gerant }) {
  const [onglet, setOnglet] = useState("promos");
  return (
    <div className="lg-pile">
      <div className="lg-titre-ligne"><div><h1 className="lg-titre lg-h1">Clients</h1><div className="lg-legende">Promotions, avis et fidélité.</div></div></div>
      <div className="lg-chips" role="tablist" aria-label="Sections clients">
        {ONGLETS.map((o) => <button key={o.id} type="button" role="tab" className="lg-chip" aria-pressed={onglet === o.id} aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}>{o.texte}</button>)}
      </div>
      {onglet === "promos" && <Promotions gerant={gerant} />}
      {onglet === "avis" && <AvisGerant gerant={gerant} />}
      {onglet === "fidelite" && <Fidelite gerant={gerant} />}
    </div>
  );
}
