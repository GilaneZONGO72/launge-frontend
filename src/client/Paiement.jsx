import { useState } from "react";
import Icon from "../design/Icon";
import "./client.css";

const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR");
const MODES = [
  { nom: "Orange Money", sous: "Mobile Money", icone: "mobile" },
  { nom: "MTN Mobile Money", sous: "Mobile Money", icone: "mobile" },
  { nom: "Espèces", sous: "À régler à la table", icone: "billets" },
];

export default function Paiement({ menu, panier, totalPanier, onRetour, onPayer }) {
  const [mode, setMode] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const lignes = Object.entries(panier)
    .filter(([, q]) => q > 0)
    .map(([id, qte]) => ({ id, qte, plat: menu.find((p) => p.id === id) }))
    .filter((l) => l.plat);

  const confirmer = async () => {
    if (!mode || envoi) return; // empêche les doubles envois
    setEnvoi(true);
    try { await onPayer(mode); } finally { setEnvoi(false); }
  };

  return (
    <div className="lg-page" style={{ paddingBottom: 110 }}>
      <div className="lg-colonne">
        <header className="lg-entete">
          <button className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour au menu"><Icon nom="retour" /></button>
          <h1 className="lg-titre lg-h3" style={{ fontSize: 20 }}>Ma commande</h1>
        </header>

        <div className="lg-carte" style={{ marginTop: 12 }}>
          {lignes.length === 0 && <div className="lg-vide" style={{ padding: 16 }}>Votre panier est vide.</div>}
          {lignes.map(({ id, qte, plat }) => (
            <div className="lg-ligne" key={id}>
              <span className="lg-ligne-qte">{qte}×</span>
              <span className="lg-ligne-nom">{plat.nom}</span>
              <span className="lg-ligne-prix">{fcfa(plat.prix * qte)} FCFA</span>
            </div>
          ))}
        </div>

        <div className="lg-total">
          <div className="lg-total-etiquette">Total à régler</div>
          <div className="lg-total-montant">{fcfa(totalPanier)}<small>FCFA</small></div>
        </div>

        <h2 className="lg-section-titre">Mode de paiement</h2>
        <div className="lg-modes" role="radiogroup" aria-label="Mode de paiement">
          {MODES.map((m) => (
            <button key={m.nom} className="lg-mode" role="radio" aria-checked={mode === m.nom} onClick={() => setMode(m.nom)}>
              <span className="lg-mode-icone"><Icon nom={m.icone} taille={22} /></span>
              <span>
                <span className="lg-mode-nom" style={{ display: "block" }}>{m.nom}</span>
                <span className="lg-mode-sous">{m.sous}</span>
              </span>
              <span className="lg-mode-coche">{mode === m.nom && <Icon nom="check" taille={14} />}</span>
            </button>
          ))}
        </div>
        <p className="lg-note">Aucun compte nécessaire. Vous suivrez votre commande en direct.<br />Le paiement en ligne sera disponible prochainement.</p>
      </div>

      <div className="lg-pied">
        <button className="lg-btn lg-btn-orange" disabled={!mode || envoi || lignes.length === 0} onClick={confirmer}>
          {envoi ? "Envoi en cours…" : mode ? `Confirmer la commande · ${fcfa(totalPanier)} FCFA` : "Choisissez un mode de paiement"}
        </button>
      </div>
    </div>
  );
}
