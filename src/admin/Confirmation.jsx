import { useState } from "react";
import { Feuille } from "../restaurant/Champs";
import Ico from "../comptes/IconesComptes";

// Fenêtre de confirmation (remplace les confirm() du navigateur).
// Avec `motAConfirmer`, la personne doit retaper ce mot avant de pouvoir valider (actions irréversibles).
export default function Confirmation({ titre, texte, bouton, danger = false, motAConfirmer, occupe = false, erreur = "", onConfirmer, onAnnuler }) {
  const [saisie, setSaisie] = useState("");
  const pret = !motAConfirmer || saisie.trim().toLowerCase() === motAConfirmer.trim().toLowerCase();
  return (
    <Feuille titre={titre} onFermer={occupe ? () => {} : onAnnuler}>
      <div className="lg-form">
        <p style={{ margin: 0, color: "var(--lg-texte-2)" }}>{texte}</p>
        {motAConfirmer && (
          <label className="lg-champ">
            <span className="lg-champ-label">Pour confirmer, tapez « {motAConfirmer} »</span>
            <input className="lg-input" value={saisie} onChange={(e) => setSaisie(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} autoFocus />
          </label>
        )}
        {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {erreur}</div>}
        <button type="button" className={`lg-btn lg-pleine ${danger ? "lg-btn-rouge" : "lg-btn-orange"}`} style={{ minHeight: 50 }} disabled={!pret || occupe} onClick={onConfirmer}>
          {occupe ? "En cours…" : bouton}
        </button>
        <button type="button" className="lg-btn lg-clair lg-pleine" style={{ minHeight: 50 }} disabled={occupe} onClick={onAnnuler}>Annuler</button>
      </div>
    </Feuille>
  );
}
