import { useCallback, useEffect, useState } from "react";
import Ico from "../comptes/IconesComptes";
import Confirmation from "../admin/Confirmation";
import { ilYa } from "../admin/outils";
import "./finances.css";
import { decaler, fcfa, libelleSemaine, phraseDu } from "./outils";

const API = "https://launge-backend-production.up.railway.app";
async function appel(chemin, options) {
  const res = await fetch(`${API}${chemin}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) { const e = new Error(data.error || "Une erreur est survenue."); e.statut = res.status; throw e; }
  return data;
}
const signe = (m) => (m > 0 ? "moins" : "zero");

// Finances de l'administrateur : commissions de la semaine, par restaurant, et marquage « réglé ».
export default function FinancesAdmin() {
  const [semaine, setSemaine] = useState(null); // null = semaine précédente (choix du serveur)
  const [d, setD] = useState(null);
  const [erreur, setErreur] = useState("");
  const [conf, setConf] = useState(null); // { type: "regler" | "annuler", r }
  const [occupe, setOccupe] = useState(false);
  const [erreurAction, setErreurAction] = useState("");
  const [formules, setFormules] = useState(null);
  const [confF, setConfF] = useState(null); // { r, vers }
  const chargerFormules = useCallback(async () => {
    try { setFormules(await appel("/api/admin/formules")); } catch { setFormules([]); }
  }, []);
  useEffect(() => { chargerFormules(); }, [chargerFormules]);
  const changerFormule = async () => {
    setOccupe(true); setErreurAction("");
    try {
      await appel(`/api/admin/restaurants/${confF.r.id}/formule`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formule: confF.vers }) });
      setConfF(null);
      await chargerFormules();
    } catch (e) { setErreurAction(e.message); }
    setOccupe(false);
  };

  const charger = useCallback(async () => {
    setErreur(""); setD(null);
    try { setD(await appel(`/api/admin/finances${semaine ? `?semaine=${semaine}` : ""}`)); }
    catch (e) { setErreur(e.statut === 401 || e.statut === 403 ? "Votre session a expiré. Reconnectez-vous." : "Impossible de charger les finances. Vérifiez que la mise à jour de la base de données a bien été faite."); }
  }, [semaine]);
  useEffect(() => { charger(); }, [charger]);

  const courante = d ? d.semaine_debut : semaine;
  const confirmer = async () => {
    setOccupe(true); setErreurAction("");
    try {
      const chemin = `/api/admin/finances/${conf.r.restaurant_id}/${d.semaine_debut}/regler`;
      await appel(chemin, { method: conf.type === "regler" ? "PUT" : "DELETE" });
      setConf(null);
      await charger();
    } catch (e) { setErreurAction(e.message); }
    setOccupe(false);
  };
  const aller = (n) => setSemaine(decaler(courante, n * 7));

  return (
    <div className="lg-pile">
      <div className="lg-fin-nav">
        <button type="button" className="lg-btn lg-btn-rond" onClick={() => aller(-1)} disabled={!courante} aria-label="Semaine précédente"><Ico nom="retour" /></button>
        <strong>{courante ? `Semaine du ${libelleSemaine(courante)}` : "Chargement…"}</strong>
        <button type="button" className="lg-btn lg-btn-rond" onClick={() => aller(1)} disabled={!courante} aria-label="Semaine suivante"><Ico nom="suivant" /></button>
      </div>

      <section className="lg-promo-carte" aria-label="Formules des restaurants">
        <h2 className="lg-titre lg-h3">Formules des restaurants</h2>
        <div className="lg-legende">Essai : prix sans majoration et aucune commission. Actif : +1 % sur les prix et commission sur chaque commande.</div>
        {formules && formules.length === 0 && <div className="lg-legende">Aucun restaurant validé.</div>}
        {(formules || []).map((r) => (
          <div key={r.id} className="lg-promo-tete" style={{ marginTop: 10 }}>
            <span style={{ minWidth: 0 }}><strong style={{ display: "block", overflowWrap: "anywhere" }}>{r.nom}</strong><span className="lg-legende">{r.formule === "actif" ? `Actif${r.formule_debut ? ` depuis ${ilYa(r.formule_debut)}` : ""}` : "Essai"}</span></span>
            {r.formule === "actif"
              ? <button type="button" className="lg-btn lg-clair" onClick={() => { setErreurAction(""); setConfF({ r, vers: "essai" }); }}>Repasser en essai</button>
              : <button type="button" className="lg-btn lg-btn-orange" onClick={() => { setErreurAction(""); setConfF({ r, vers: "actif" }); }}>Activer la facturation</button>}
          </div>
        ))}
      </section>

      {erreur && <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div><button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={charger}>Réessayer</button></div>}
      {!erreur && !d && <div className="lg-legende">Chargement…</div>}

      {d && (<>
        <section className="lg-fin-resume" aria-label="Totaux de la semaine">
          <Totaux t={d.totaux} nb={d.restaurants.length} />
          {!d.terminee && <div className="lg-fin-solde">Cette semaine n'est pas terminée : elle ne peut pas encore être réglée.</div>}
        </section>
        {d.restaurants.length === 0 && <div className="lg-vide"><Ico nom="recu" taille={32} /><div>Aucune commission cette semaine.</div></div>}
        <div className="lg-grille-2">
          {d.restaurants.map((r) => (
            <div key={r.restaurant_id} className="lg-promo-carte lg-fin-carte">
              <div className="lg-promo-tete"><span style={{ minWidth: 0 }}><strong style={{ display: "block", overflowWrap: "anywhere" }}>{r.nom}</strong>{r.ville && <span className="lg-legende">{r.ville}</span>}</span><span className={`lg-badge ${r.regle ? "lg-badge-vert" : "lg-badge-orange"}`}>{r.regle ? "Réglé" : "À régler"}</span></div>
              <div className="lg-fin-grille">
                <div><span className="lg-legende">Commandes</span><strong>{r.nb_commandes}</strong></div>
                <div><span className="lg-legende">Ventes</span><strong>{fcfa(r.ventes)}</strong></div>
                <div><span className="lg-legende">Commission</span><strong>{fcfa(r.commission)}</strong></div>
                <div><span className="lg-legende">Gardé par le restaurant</span><strong>{fcfa(r.part_resto)}</strong></div>
              </div>
              <div className="lg-fin-solde" data-signe={r.regle ? "zero" : signe(r.part_launge)}>{r.regle ? `Reçu : ${fcfa(r.part_launge)}` : phraseDu(r.part_launge, "admin")}</div>
              {r.regle && <div className="lg-legende">Réglé {ilYa(r.regle_le)}{r.note ? ` · ${r.note}` : ""}</div>}
              <div className="lg-promo-actions">
                {r.regle
                  ? <button type="button" className="lg-btn lg-clair" onClick={() => { setErreurAction(""); setConf({ type: "annuler", r }); }}>Annuler le règlement</button>
                  : <button type="button" className="lg-btn lg-btn-orange" disabled={!d.terminee} onClick={() => { setErreurAction(""); setConf({ type: "regler", r }); }}><Ico nom="check" taille={16} /> Marquer réglé</button>}
              </div>
            </div>
          ))}
        </div>
      </>)}

      {confF && (
        <Confirmation
          titre={confF.vers === "actif" ? "Activer la facturation ?" : "Repasser en essai ?"}
          texte={confF.vers === "actif"
            ? `${confF.r.nom} : les prix affichés aux clients seront majorés de 1 % et la commission s'appliquera aux nouvelles commandes. Les commandes passées pendant l'essai restent sans commission.`
            : `${confF.r.nom} : les nouveaux prix clients redeviennent identiques à ceux du gérant et plus aucune commission n'est calculée. Les commissions déjà calculées sont conservées.`}
          bouton={confF.vers === "actif" ? "Activer" : "Repasser en essai"}
          occupe={occupe}
          erreur={erreurAction}
          onConfirmer={changerFormule}
          onAnnuler={() => setConfF(null)}
        />
      )}
      {conf && (
        <Confirmation
          titre={conf.type === "regler" ? "Marquer cette semaine comme réglée ?" : "Annuler ce règlement ?"}
          texte={conf.type === "regler"
            ? `${conf.r.nom} : ${phraseDu(conf.r.part_launge, "admin")}. Confirmez seulement quand vous avez bien reçu cette somme : les chiffres de la semaine seront figés.`
            : `La semaine de « ${conf.r.nom} » repassera à « À régler ».`}
          bouton={conf.type === "regler" ? "Marquer réglé" : "Annuler le règlement"}
          danger={conf.type === "annuler"}
          occupe={occupe}
          erreur={erreurAction}
          onConfirmer={confirmer}
          onAnnuler={() => setConf(null)}
        />
      )}
    </div>
  );
}

function Totaux({ t, nb }) {
  return (
    <div className="lg-fin-grille">
      <div><span className="lg-legende">Restaurants</span><strong>{nb}</strong></div>
      <div><span className="lg-legende">Commandes</span><strong>{t.nb_commandes}</strong></div>
      <div><span className="lg-legende">Ventes</span><strong>{fcfa(t.ventes)}</strong></div>
      <div><span className="lg-legende">Commissions</span><strong>{fcfa(t.commission)}</strong></div>
      <div><span className="lg-legende">À récupérer pour Launge</span><strong>{fcfa(t.part_launge)}</strong></div>
      <div><span className="lg-legende">Gardé par les restaurants</span><strong>{fcfa(t.part_resto)}</strong></div>
    </div>
  );
}
