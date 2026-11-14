import { useEffect } from "react";
import Ico from "./IconeGerant";

export function Champ({ label, aide, children }) {
  return (
    <label className="lg-champ">
      <span className="lg-champ-label">{label}</span>
      {children}
      {aide && <span className="lg-champ-aide">{aide}</span>}
    </label>
  );
}

export function Interrupteur({ actif, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={actif} aria-label={label} className="lg-inter" onClick={() => onChange(!actif)}>
      <span className="lg-inter-bille" />
    </button>
  );
}

// Fenêtre qui monte du bas (mobile) ou s'affiche au centre (ordinateur). Échap ou clic à côté pour fermer.
export function Feuille({ titre, onFermer, children }) {
  useEffect(() => {
    const touche = (e) => { if (e.key === "Escape") onFermer(); };
    document.addEventListener("keydown", touche);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", touche); document.body.style.overflow = avant; };
  }, [onFermer]);
  return (
    <div className="lg-fond" onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}>
      <div className="lg-feuille" role="dialog" aria-modal="true" aria-label={titre}>
        <div className="lg-feuille-tete">
          <h2 className="lg-titre lg-h3" style={{ fontSize: 20 }}>{titre}</h2>
          <button className="lg-btn lg-btn-rond" onClick={onFermer} aria-label="Fermer"><Ico nom="fermer" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
