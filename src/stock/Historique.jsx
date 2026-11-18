import { useCallback, useEffect, useState } from "react";
import Ico from "./IconesStock";
import { appel } from "./api";
import { MOTIFS, ilYa, signe } from "./outils";

// Les 100 derniers mouvements de stock : commandes, réceptions, corrections, inventaires.
export default function Historique({ gerant }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const charger = useCallback(async () => {
    setErreur("");
    try { const d = await appel(`/api/stock/${gerant.id}/mouvements`); setListe(Array.isArray(d) ? d : []); }
    catch { setErreur("Impossible de charger l'historique. Vérifiez que la table du stock a bien été créée."); }
  }, [gerant.id]);
  useEffect(() => { charger(); }, [charger]);

  if (erreur) return <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div><button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={charger}><Ico nom="actualiser" taille={18} /> Réessayer</button></div>;
  if (liste === null) return <div className="lg-legende" aria-live="polite">Chargement…</div>;
  if (!liste.length) return <div className="lg-vide"><Ico nom="historique" taille={32} /><div>Aucun mouvement de stock pour le moment. Ils apparaîtront ici dès la prochaine commande, réception ou correction.</div></div>;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><button type="button" className="lg-btn lg-clair" onClick={charger}><Ico nom="actualiser" taille={16} /> Actualiser</button></div>
      <ul className="lg-hist-liste">
        {liste.map((m) => (
          <li key={m.id}>
            <span className="lg-hist-pastille" data-s={m.delta < 0 ? "moins" : "plus"}><Ico nom={m.delta < 0 ? "bas" : "haut"} taille={18} /></span>
            <span><strong>{m.plat_nom || "Plat supprimé"}</strong><br /><span className="lg-legende">{MOTIFS[m.motif] || m.motif} · {ilYa(m.created_at)}</span></span>
            <span className="lg-hist-delta">{signe(m.delta)}<small>reste {m.stock_apres ?? "-"}</small></span>
          </li>
        ))}
      </ul>
    </>
  );
}
