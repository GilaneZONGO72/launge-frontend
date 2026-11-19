import { useCallback, useEffect, useState } from "react";
import Confirmation from "../admin/Confirmation";
import Ico from "./IconesEquipe";
import { appel } from "../stock/api";
import { ilYa } from "../admin/outils";

const STATUTS = [
  { id: "nouvelle", texte: "Nouvelle", classe: "lg-badge-orange" },
  { id: "a_contacter", texte: "À contacter", classe: "" },
  { id: "retenue", texte: "Retenue", classe: "lg-badge-vert" },
  { id: "refusee", texte: "Refusée", classe: "lg-badge-rouge" },
];
const tel = (t) => `+${t}`;

export default function Candidatures({ gerant }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const [suppr, setSuppr] = useState(null);
  const [occupe, setOccupe] = useState(false);
  const [erreurAction, setErreurAction] = useState("");
  const [filtre, setFiltre] = useState("toutes");

  const charger = useCallback(async () => {
    setErreur("");
    try { const d = await appel(`/api/candidatures/${gerant.id}`); setListe(Array.isArray(d) ? d : []); }
    catch { setErreur("Impossible de charger les candidatures. Vérifiez que les tables ont bien été créées."); }
  }, [gerant.id]);
  useEffect(() => { charger(); }, [charger]);

  const changer = async (c, statut) => {
    try { const d = await appel(`/api/candidatures/${gerant.id}/${c.id}`, { method: "PUT", body: JSON.stringify({ statut }) }); setListe((l) => l.map((x) => (x.id === d.id ? d : x))); }
    catch (e) { setErreur(e.message); }
  };
  const supprimer = async () => {
    setOccupe(true); setErreurAction("");
    try { await appel(`/api/candidatures/${gerant.id}/${suppr.id}`, { method: "DELETE" }); setListe((l) => l.filter((x) => x.id !== suppr.id)); setSuppr(null); }
    catch (e) { setErreurAction(e.message); }
    setOccupe(false);
  };

  if (erreur && liste === null) return <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div><button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={charger}>Réessayer</button></div>;
  if (liste === null) return <div className="lg-legende">Chargement…</div>;
  if (!liste.length) return <div className="lg-vide"><Ico nom="mallette" taille={32} /><div>Aucune candidature pour le moment. Activez « Nous recrutons » dans les Réglages : un bouton « Postuler » apparaît alors sur votre menu.</div></div>;
  const visibles = filtre === "toutes" ? liste : liste.filter((c) => c.statut === filtre);
  const nb = (s) => liste.filter((c) => c.statut === s).length;
  return (
    <>
      {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {erreur}</div>}
      <div className="lg-chips" role="group" aria-label="Filtrer les candidatures">
        <button type="button" className="lg-chip" aria-pressed={filtre === "toutes"} onClick={() => setFiltre("toutes")}>Toutes ({liste.length})</button>
        {STATUTS.map((s) => <button key={s.id} type="button" className="lg-chip" aria-pressed={filtre === s.id} onClick={() => setFiltre(s.id)}>{s.texte} ({nb(s.id)})</button>)}
      </div>
      {!visibles.length && <div className="lg-legende">Aucune candidature dans cette catégorie.</div>}
      <div className="lg-grille-2">
        {visibles.map((c) => {
          const s = STATUTS.find((x) => x.id === c.statut) || STATUTS[0];
          return (
            <div key={c.id} className="lg-promo-carte">
              <div className="lg-promo-tete"><strong style={{ overflowWrap: "anywhere" }}>{c.nom}</strong><span className={`lg-badge ${s.classe}`}>{s.texte}</span></div>
              <div className="lg-promo-detail"><span>{ilYa(c.created_at)}</span>{c.poste && <span>Poste : {c.poste}</span>}</div>
              {c.message && <p style={{ margin: 0, fontSize: 14, overflowWrap: "anywhere" }}>{c.message}</p>}
              <a className="lg-btn lg-btn-nuit" href={`tel:${tel(c.telephone)}`} style={{ textDecoration: "none" }}><Ico nom="telephone" taille={16} /> {tel(c.telephone)}</a>
              <div className="lg-chips" role="group" aria-label={`Statut de ${c.nom}`}>
                {STATUTS.map((x) => <button key={x.id} type="button" className="lg-chip" aria-pressed={c.statut === x.id} onClick={() => c.statut !== x.id && changer(c, x.id)}>{x.texte}</button>)}
              </div>
              <div className="lg-promo-actions"><button type="button" className="lg-btn lg-clair" onClick={() => { setErreurAction(""); setSuppr(c); }} aria-label={`Supprimer la candidature de ${c.nom}`}><Ico nom="corbeille" taille={16} /></button></div>
            </div>
          );
        })}
      </div>
      {suppr && <Confirmation titre="Supprimer cette candidature ?" texte={`La candidature de ${suppr.nom} sera définitivement supprimée.`} bouton="Supprimer" occupe={occupe} erreur={erreurAction} onConfirmer={supprimer} onAnnuler={() => setSuppr(null)} />}
    </>
  );
}
