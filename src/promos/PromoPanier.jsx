import { useState } from "react";
import Ico from "./IconesPromos";
import { appel } from "../stock/api";
import { fcfa } from "./outils";
import "./promos.css";

// Champ « code promo » du paiement. L'aperçu vient du serveur ; la commande recalcule tout de son côté.
export default function PromoPanier({ restaurantId, lignes, applique, onChange }) {
  const [code, setCode] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const appliquer = async () => {
    const c = code.trim().toUpperCase();
    if (!c || envoi) return;
    setEnvoi(true); setErreur("");
    try {
      const d = await appel("/api/promotions/verifier", { method: "POST", body: JSON.stringify({ restaurant_id: restaurantId, code: c, items: lignes.map((l) => ({ id: l.id, qte: l.qte })) }) });
      onChange({ code: d.code, remise: d.remise });
      setCode("");
    } catch (e) { setErreur(e.message); }
    setEnvoi(false);
  };

  if (applique) {
    return (
      <div className="lg-promo-ok" role="status">
        <Ico nom="etiquette" taille={18} />
        <span><strong>{applique.code}</strong> appliqué : -{fcfa(applique.remise)} FCFA</span>
        <button type="button" onClick={() => onChange(null)} aria-label="Retirer le code promo"><Ico nom="fermer" taille={16} /></button>
      </div>
    );
  }
  return (
    <div className="lg-promo">
      <div className="lg-promo-rang">
        <input className="lg-promo-champ" value={code} placeholder="Code promo" autoCapitalize="characters" autoComplete="off" spellCheck="false" maxLength={30}
          aria-label="Code promo" aria-invalid={Boolean(erreur)} onChange={(e) => { setCode(e.target.value); setErreur(""); }} onKeyDown={(e) => { if (e.key === "Enter") appliquer(); }} />
        <button type="button" className="lg-btn lg-btn-nuit" disabled={!code.trim() || envoi} onClick={appliquer}>{envoi ? "…" : "Appliquer"}</button>
      </div>
      {erreur && <div className="lg-promo-erreur" role="alert">{erreur}</div>}
    </div>
  );
}
