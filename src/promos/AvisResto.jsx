import { useState } from "react";
import { Feuille } from "../restaurant/Champs";
import { appel } from "../stock/api";
import Ico from "./IconesPromos";
import { Note } from "./Etoiles";
import { ilYa } from "./outils";
import "./promos.css";

// Pastille « 4,5 · 12 avis » dans l'en-tête du menu ; un clic ouvre la liste des avis.
export default function AvisResto({ restaurantId, vitrine }) {
  const [ouvert, setOuvert] = useState(false);
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState(false);
  if (!vitrine || !vitrine.nb_avis) return null;
  const ouvrir = async () => {
    setOuvert(true); setErreur(false);
    try { const d = await appel(`/api/restaurants/${restaurantId}/avis`); setListe(Array.isArray(d) ? d : []); } catch { setErreur(true); }
  };
  return (
    <>
      <button type="button" className="lg-avis-pastille" onClick={ouvrir} aria-label={`Voir les ${vitrine.nb_avis} avis`}>
        <span className="lg-etoile" data-pleine="true"><Ico nom="etoile" taille={14} /></span> <strong>{String(vitrine.note_moyenne).replace(".", ",")}</strong> <span>· {vitrine.nb_avis} avis</span>
      </button>
      {ouvert && (
        <Feuille titre="Avis des clients" onFermer={() => setOuvert(false)}>
          {erreur ? <div className="lg-legende" role="alert">Impossible de charger les avis.</div>
            : liste === null ? <div className="lg-legende">Chargement…</div>
            : <ul className="lg-avis-liste">{liste.map((a, i) => (
              <li key={i}>
                <div className="lg-avis-ligne"><Note valeur={a.note} /><span className="lg-legende">{ilYa(a.created_at)}</span></div>
                {a.commentaire && <p>{a.commentaire}</p>}
                {a.reponse && <div className="lg-avis-reponse"><strong>Réponse du restaurant</strong><p>{a.reponse}</p></div>}
              </li>))}
            </ul>}
        </Feuille>
      )}
    </>
  );
}
