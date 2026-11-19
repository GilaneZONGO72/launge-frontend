import { useCallback, useEffect, useState } from "react";
import Ico from "./IconesPromos";
import { Note } from "./Etoiles";
import { appel } from "../stock/api";
import { ilYa } from "./outils";

function CarteAvis({ avis, gerantId, onMaj }) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const repondre = async () => {
    if (!texte.trim() || envoi) return;
    setEnvoi(true); setErreur("");
    try { const d = await appel(`/api/avis/${gerantId}/${avis.id}/reponse`, { method: "PUT", body: JSON.stringify({ reponse: texte }) }); onMaj(d); setOuvert(false); }
    catch (e) { setErreur(e.message); }
    setEnvoi(false);
  };
  return (
    <li className="lg-promo-carte">
      <div className="lg-avis-ligne"><Note valeur={avis.note} /><span className="lg-legende">{ilYa(avis.created_at)}</span></div>
      {avis.commentaire ? <p style={{ margin: 0, fontSize: 14, overflowWrap: "anywhere" }}>{avis.commentaire}</p> : <span className="lg-legende">Aucun commentaire.</span>}
      {avis.reponse && <div className="lg-avis-reponse"><strong>Votre réponse</strong><p>{avis.reponse}</p></div>}
      {!avis.reponse && !ouvert && <div className="lg-promo-actions"><button type="button" className="lg-btn lg-clair" onClick={() => setOuvert(true)}><Ico nom="message" taille={16} /> Répondre</button></div>}
      {ouvert && (
        <>
          <textarea className="lg-avis-texte" rows={3} maxLength={500} placeholder="Votre réponse, visible par tous les clients" aria-label="Votre réponse" value={texte} onChange={(e) => setTexte(e.target.value)} />
          {erreur && <div className="lg-promo-erreur" role="alert">{erreur}</div>}
          <div className="lg-promo-actions">
            <button type="button" className="lg-btn lg-clair" onClick={() => setOuvert(false)}>Annuler</button>
            <button type="button" className="lg-btn lg-btn-orange" disabled={!texte.trim() || envoi} onClick={repondre}>{envoi ? "Envoi…" : "Publier"}</button>
          </div>
        </>
      )}
    </li>
  );
}

export default function AvisGerant({ gerant }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const charger = useCallback(async () => {
    setErreur("");
    try { const d = await appel(`/api/avis/${gerant.id}`); setListe(Array.isArray(d) ? d : []); }
    catch { setErreur("Impossible de charger les avis. Vérifiez que les tables ont bien été créées."); }
  }, [gerant.id]);
  useEffect(() => { charger(); }, [charger]);

  if (erreur) return <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div><button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={charger}>Réessayer</button></div>;
  if (liste === null) return <div className="lg-legende">Chargement…</div>;
  if (!liste.length) return <div className="lg-vide"><Ico nom="etoile" taille={32} /><div>Aucun avis pour le moment. Vos clients pourront noter leur repas une fois la commande servie.</div></div>;
  const moyenne = liste.reduce((s, a) => s + a.note, 0) / liste.length;
  const sansReponse = liste.filter((a) => !a.reponse).length;
  return (
    <>
      <div className="lg-avis-resume">
        <b>{(Math.round(moyenne * 10) / 10).toString().replace(".", ",")}</b>
        <div><Note valeur={moyenne} taille={18} /><div className="lg-legende">{liste.length} avis · {sansReponse} sans réponse</div></div>
      </div>
      <ul className="lg-avis-liste lg-grille-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {liste.map((a) => <CarteAvis key={a.id} avis={a} gerantId={gerant.id} onMaj={(m) => setListe((l) => l.map((x) => (x.id === m.id ? m : x)))} />)}
      </ul>
    </>
  );
}
