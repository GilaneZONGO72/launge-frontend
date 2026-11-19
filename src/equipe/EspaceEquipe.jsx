import { useState } from "react";
import "../design/tokens.css";
import "../restaurant/restaurant.css";
import "../promos/promos.css";
import "./equipe.css";
import Ico from "./IconesEquipe";
import Personnel from "./Personnel";
import Candidatures from "./Candidatures";

const ONGLETS = [
  { id: "personnel", texte: "Personnel" },
  { id: "candidatures", texte: "Candidatures" },
];

// Équipe du restaurant : comptes du personnel (par poste) et candidatures reçues. Réservé au gérant.
export default function EspaceEquipe({ gerant, onRetour }) {
  const [onglet, setOnglet] = useState("personnel");
  return (
    <div className="lg-pile">
      <div className="lg-titre-ligne" style={{ alignItems: "center", gap: 12 }}>
        <button type="button" className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour aux réglages"><Ico nom="retour" /></button>
        <div><h1 className="lg-titre lg-h1">Équipe</h1><div className="lg-legende">Accès du personnel et recrutement.</div></div>
      </div>
      <div className="lg-chips" role="tablist" aria-label="Sections de l'équipe">
        {ONGLETS.map((o) => <button key={o.id} type="button" role="tab" className="lg-chip" aria-pressed={onglet === o.id} aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}>{o.texte}</button>)}
      </div>
      {onglet === "personnel" && <Personnel gerant={gerant} />}
      {onglet === "candidatures" && <Candidatures gerant={gerant} />}
    </div>
  );
}
