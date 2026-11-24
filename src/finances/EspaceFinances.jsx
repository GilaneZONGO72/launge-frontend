import { useCallback, useEffect, useState } from "react";
import "../design/tokens.css";
import "../restaurant/restaurant.css";
import "../promos/promos.css";
import "./finances.css";
import Ico from "../equipe/IconesEquipe";
import { Feuille } from "../restaurant/Champs";
import { appel } from "../stock/api";
import { ilYa } from "../admin/outils";
import { COMMISSION_MIN, COMMISSION_PCT, MAJORATION_PCT, PART_RESTO_PCT, fcfa, libelleSemaine, phraseDu } from "./outils";

const heure = (v) => { const d = new Date(/(Z|[+-]\d\d:?\d\d)$/.test(String(v)) ? v : `${String(v).replace(" ", "T")}Z`); return isNaN(d) ? "" : d.toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" }); };

function Chiffres({ s }) {
  return (
    <div className="lg-fin-grille">
      <div><span className="lg-legende">Commandes</span><strong>{s.nb_commandes}</strong></div>
      <div><span className="lg-legende">Ventes encaissées</span><strong>{fcfa(s.ventes)}</strong></div>
      <div><span className="lg-legende">Commission totale</span><strong>{fcfa(s.commission)}</strong></div>
      <div><span className="lg-legende">Vous gardez</span><strong>{fcfa(s.part_resto)}</strong></div>
    </div>
  );
}
const signe = (m) => (m > 0 ? "moins" : "zero");

function Detail({ gerant, semaine, onFermer }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    let vivant = true;
    appel(`/api/finances/${gerant.id}/detail?semaine=${semaine}`).then((d) => { if (vivant) setListe(Array.isArray(d) ? d : []); }).catch(() => { if (vivant) setErreur("Impossible de charger le détail."); });
    return () => { vivant = false; };
  }, [gerant.id, semaine]);
  return (
    <Feuille titre={`Semaine du ${libelleSemaine(semaine)}`} onFermer={onFermer}>
      {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}
      {!erreur && liste === null && <div className="lg-legende">Chargement…</div>}
      {liste && !liste.length && <div className="lg-legende">Aucune commande cette semaine.</div>}
      {liste && liste.length > 0 && (
        <div>
          {liste.map((c) => (
            <div key={c.id} className="lg-fin-ligne">
              <span><strong style={{ whiteSpace: "normal", textAlign: "left" }}>{fcfa(c.total)}</strong><small>{heure(c.created_at)} · Table {c.numero_table || "?"} · {c.mode_paiement || "Paiement"}</small></span>
              <span style={{ textAlign: "right" }}><strong>{fcfa(c.commission)}</strong><small>commission</small></span>
            </div>
          ))}
        </div>
      )}
    </Feuille>
  );
}

// Finances du restaurant : chiffres de la semaine, historique et état des règlements. Réservé au gérant.
export default function EspaceFinances({ gerant, onRetour }) {
  const [d, setD] = useState(null);
  const [erreur, setErreur] = useState("");
  const [detail, setDetail] = useState(null);
  const charger = useCallback(async () => {
    setErreur("");
    try { setD(await appel(`/api/finances/${gerant.id}`)); }
    catch { setErreur("Impossible de charger les finances. Vérifiez que la mise à jour de la base de données a bien été faite."); }
  }, [gerant.id]);
  useEffect(() => { charger(); }, [charger]);

  const regles = d && d.regles ? d.regles : { commission_pct: COMMISSION_PCT, commission_min: COMMISSION_MIN, part_resto_pct: PART_RESTO_PCT, majoration_pct: MAJORATION_PCT };
  const courante = d && d.semaines && d.semaines[0];
  return (
    <div className="lg-pile">
      <div className="lg-titre-ligne" style={{ alignItems: "center", gap: 12 }}>
        <button type="button" className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour aux réglages"><Ico nom="retour" /></button>
        <div style={{ flex: 1 }}><h1 className="lg-titre lg-h1">Finances</h1><div className="lg-legende">Commissions et règlement hebdomadaire.</div></div>
      </div>

      {erreur && <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div><button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={charger}>Réessayer</button></div>}
      {!erreur && !d && <div className="lg-legende">Chargement…</div>}

      {d && d.formule === "essai" && (
        <section className="lg-promo-carte" aria-label="Période d'essai">
          <h2 className="lg-titre lg-h3">Période d'essai</h2>
          <div className="lg-legende">Votre restaurant est en essai : vos clients voient exactement vos prix et aucune commission n'est prélevée. La facturation sera activée par l'équipe Launge à la signature.</div>
        </section>
      )}

      {courante && d.formule !== "essai" && (
        <section className="lg-fin-resume" aria-label="Semaine en cours">
          <div><span className="lg-legende">Semaine en cours</span><div className="lg-titre lg-h3" style={{ color: "#fff" }}>Du {libelleSemaine(courante.semaine_debut)}</div></div>
          <Chiffres s={courante} />
          <div className="lg-fin-solde" data-signe={signe(courante.part_launge)}>{phraseDu(courante.part_launge, "resto")} (à ce jour)</div>
        </section>
      )}

      {d && d.formule !== "essai" && (
        <section className="lg-pile" aria-label="Semaines précédentes">
          <h2 className="lg-titre lg-h3">Semaines précédentes</h2>
          <div className="lg-grille-2">
            {d.semaines.slice(1).map((s) => (
              <div key={s.semaine_debut} className="lg-promo-carte lg-fin-carte">
                <div className="lg-promo-tete"><strong>{libelleSemaine(s.semaine_debut)}</strong><span className={`lg-badge ${s.regle ? "lg-badge-vert" : s.nb_commandes ? "lg-badge-orange" : ""}`}>{s.regle ? "Réglé" : s.nb_commandes ? "À régler" : "Aucune vente"}</span></div>
                {s.nb_commandes > 0 && <><Chiffres s={s} /><div className="lg-fin-solde" data-signe={s.regle ? "zero" : signe(s.part_launge)}>{s.regle ? `Payé à Launge : ${fcfa(s.part_launge)}` : phraseDu(s.part_launge, "resto")}</div></>}
                {s.regle && s.regle_le && <div className="lg-legende">Réglé {ilYa(s.regle_le)}</div>}
                {s.nb_commandes > 0 && <div className="lg-promo-actions"><button type="button" className="lg-btn lg-clair" onClick={() => setDetail(s.semaine_debut)}><Ico nom="recu" taille={16} /> Voir les commandes</button></div>}
              </div>
            ))}
          </div>
          {courante && courante.nb_commandes > 0 && <button type="button" className="lg-btn lg-clair lg-pleine" onClick={() => setDetail(courante.semaine_debut)}><Ico nom="recu" taille={16} /> Commandes de la semaine en cours</button>}
        </section>
      )}

      {!(d && d.formule === "essai") && <section className="lg-promo-carte" aria-label="Comment ça marche">
        <h2 className="lg-titre lg-h3">Comment ça marche</h2>
        <div className="lg-fin-regles">
          <span><strong>Prix affichés :</strong> vos clients voient le prix que vous saisissez, majoré de {regles.majoration_pct} % (arrondi aux 5 FCFA supérieurs).</span>
          <span><strong>Commission :</strong> {regles.commission_pct} % de chaque commande, avec un minimum de {fcfa(regles.commission_min)}. Exemple : une commande de 3 000 FCFA donne une commission de {fcfa(regles.commission_min)} ; une commande de 18 000 FCFA donne 180 FCFA.</span>
          <span><strong>Partage :</strong> {100 - regles.part_resto_pct} % pour Launge, {regles.part_resto_pct} % pour vous.</span>
          <span><strong>Règlement :</strong> vous encaissez la totalité de vos ventes, quel que soit le mode de paiement. À la fin de chaque semaine (du lundi au dimanche), l'équipe Launge vient récupérer sa part de la commission : c'est le montant « À reverser à Launge ».</span>
        </div>
      </section>}
      {detail && <Detail gerant={gerant} semaine={detail} onFermer={() => setDetail(null)} />}
    </div>
  );
}
