import "./admin.css";
import Ico from "../comptes/IconesComptes";
import { STATUTS, ilYa } from "./outils";

// Une ligne par restaurant : photo, identité, contact, statut et actions possibles selon le statut.
export default function CarteAdmin({ resto, occupe, onAction }) {
  const st = STATUTS[resto.statut] || { texte: resto.statut || "Inconnu", classe: "" };
  const lieu = [resto.adresse, resto.ville].filter((x) => x && String(x).trim()).join(", ");
  return (
    <article className="lg-adm-carte" data-statut={resto.statut}>
      <div className="lg-adm-photo">
        {resto.image_url ? <img src={resto.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <Ico nom="couverts" taille={26} />}
      </div>
      <div className="lg-adm-corps">
        <div className="lg-adm-ligne">
          <h3 className="lg-adm-nom">{resto.nom}</h3>
          <span className={`lg-badge ${st.classe}`}>{st.texte}</span>
        </div>
        <div className="lg-adm-meta"><Ico nom="lieu" taille={14} /> <span>{lieu || "Adresse non renseignée"}</span></div>
        <div className="lg-adm-meta"><Ico nom="utilisateur" taille={14} /> <span>{resto.email}{resto.telephone ? ` · ${resto.telephone}` : ""}</span></div>
        <div className="lg-adm-meta lg-adm-discret">Code {resto.code_unique || "—"} · inscrit {ilYa(resto.created_at)}</div>
        <div className="lg-adm-actions">
          {resto.statut === "en_attente" && (<>
            <button type="button" className="lg-btn lg-btn-vert" disabled={occupe} onClick={() => onAction("valider", resto)}>Valider</button>
            <button type="button" className="lg-btn lg-danger" disabled={occupe} onClick={() => onAction("refuser", resto)}>Refuser</button>
          </>)}
          {resto.statut === "valide" && <button type="button" className="lg-btn lg-clair" disabled={occupe} onClick={() => onAction("refuser", resto)}>Suspendre</button>}
          {resto.statut === "refuse" && <button type="button" className="lg-btn lg-clair" disabled={occupe} onClick={() => onAction("valider", resto)}>Réactiver</button>}
          <button type="button" className="lg-btn lg-adm-supprimer" disabled={occupe} onClick={() => onAction("supprimer", resto)} aria-label={`Supprimer ${resto.nom}`}><Ico nom="corbeille" taille={16} /></button>
        </div>
      </div>
    </article>
  );
}
