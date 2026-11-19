import { useEffect, useState } from "react";
import Ico from "./IconesPromos";
import { ChoixNote, Note } from "./Etoiles";
import { appel } from "../stock/api";
import { fcfa } from "./outils";
import "./promos.css";

// Sous la commande, sur la page de suivi : code promo utilisé, cadeau de fidélité et avis une fois servie.
export default function SuiviPlus({ reference, data }) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [avis, setAvis] = useState(null);
  const [cadeau, setCadeau] = useState(null);
  const [copie, setCopie] = useState(false);
  const servi = data.statut === "servi";
  const codeCadeau = cadeau || data.recompense_code;
  const mon = avis || data.avis;

  // Les points sont crédités un instant après le service : on relit quelques fois pour afficher le cadeau.
  useEffect(() => {
    if (!servi || !data.fidelite_attente || codeCadeau) return undefined;
    let essais = 0; let fini = false; let t;
    const relire = async () => {
      if (fini || essais++ >= 6) return;
      try { const d = await appel(`/api/suivi/${encodeURIComponent(reference)}`, { cache: "no-store" }); if (d.recompense_code) { setCadeau(d.recompense_code); return; } if (!d.fidelite_attente) return; } catch { /* on réessaie */ }
      t = setTimeout(relire, 2000);
    };
    t = setTimeout(relire, 1500);
    return () => { fini = true; clearTimeout(t); };
  }, [servi, data.fidelite_attente, codeCadeau, reference]);

  const envoyer = async () => {
    if (!note || envoi) return;
    setEnvoi(true); setErreur("");
    try { const d = await appel(`/api/suivi/${encodeURIComponent(reference)}/avis`, { method: "POST", body: JSON.stringify({ note, commentaire }) }); setAvis(d); }
    catch (e) { setErreur(e.message); }
    setEnvoi(false);
  };
  const copier = async () => { try { await navigator.clipboard.writeText(codeCadeau); setCopie(true); setTimeout(() => setCopie(false), 2500); } catch { /* ignoré */ } };

  return (
    <>
      {data.remise > 0 && <div className="lg-promo-ok" role="status"><Ico nom="etiquette" taille={18} /><span>Code <strong>{data.code_promo}</strong> : -{fcfa(data.remise)} FCFA déjà déduits</span></div>}
      {codeCadeau && (
        <section className="lg-cadeau" aria-label="Cadeau de fidélité">
          <span className="lg-cadeau-icone"><Ico nom="cadeau" taille={24} /></span>
          <div>
            <strong>Un cadeau pour votre fidélité</strong>
            <p>Utilisez ce code à votre prochaine commande. Valable 60 jours, une seule fois.</p>
            <div className="lg-cadeau-code"><code>{codeCadeau}</code><button type="button" className="lg-btn" onClick={copier}><Ico nom={copie ? "check" : "copie"} taille={16} />{copie ? "Copié" : "Copier"}</button></div>
          </div>
        </section>
      )}
      {servi && (
        <section className="lg-carte lg-avis-form" aria-label="Votre avis">
          {mon ? (
            <>
              <h2 className="lg-titre lg-h3">Merci pour votre avis !</h2>
              <Note valeur={mon.note} taille={22} />
              {mon.commentaire && <p className="lg-legende" style={{ marginTop: 8 }}>{mon.commentaire}</p>}
            </>
          ) : (
            <>
              <h2 className="lg-titre lg-h3">Comment était votre repas ?</h2>
              <ChoixNote valeur={note} onChange={setNote} />
              <textarea className="lg-avis-texte" rows={3} maxLength={600} placeholder="Un commentaire (facultatif)" aria-label="Commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
              {erreur && <div className="lg-promo-erreur" role="alert">{erreur}</div>}
              <button type="button" className="lg-btn lg-btn-orange" style={{ width: "100%" }} disabled={!note || envoi} onClick={envoyer}>{envoi ? "Envoi…" : "Envoyer mon avis"}</button>
            </>
          )}
        </section>
      )}
    </>
  );
}
