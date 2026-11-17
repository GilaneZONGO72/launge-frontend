import { useCallback, useEffect, useMemo, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "../comptes/comptes.css";
import "./admin.css";
import Ico from "../comptes/IconesComptes";
import Marque from "../comptes/Marque";
import CarteAdmin from "./CarteAdmin";
import Confirmation from "./Confirmation";
import { ACTIONS_JOURNAL, compter, filtrer, ilYa } from "./outils";

const API = "https://launge-backend-production.up.railway.app";
const ONGLETS = [
  { id: "en_attente", texte: "En attente" },
  { id: "valide", texte: "Actifs" },
  { id: "refuse", texte: "Refusés" },
  { id: "tous", texte: "Tous" },
  { id: "journal", texte: "Journal" },
];
const TEXTES = {
  valider: { titre: "Valider ce restaurant ?", texte: (r) => `« ${r.nom} » pourra se connecter et apparaîtra dans la liste des restaurants.`, bouton: "Valider", danger: false },
  refuser: { titre: "Refuser ou suspendre ce restaurant ?", texte: (r) => `« ${r.nom} » ne pourra plus se connecter et disparaîtra de la liste des restaurants. Vous pourrez le réactiver plus tard.`, bouton: "Confirmer", danger: true },
  supprimer: { titre: "Supprimer ce restaurant ?", texte: (r) => `Cette action est définitive : « ${r.nom} », son menu, ses commandes et ses photos seront effacés.`, bouton: "Supprimer définitivement", danger: true },
};
const PHRASE = { valider: "Restaurant validé.", refuser: "Restaurant refusé.", supprimer: "Restaurant supprimé." };

async function appel(chemin, options) {
  const res = await fetch(`${API}${chemin}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = new Error(data.error || "Une erreur est survenue.");
    e.statut = res.status;
    throw e;
  }
  return data;
}

// Espace administrateur : valider, suspendre ou supprimer les restaurants, et consulter le journal des actions.
export default function EspaceAdmin({ onQuitter }) {
  const [restos, setRestos] = useState(null);
  const [journal, setJournal] = useState(null);
  const [onglet, setOnglet] = useState("en_attente");
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState("");
  const [confirmation, setConfirmation] = useState(null); // { action, resto }
  const [occupe, setOccupe] = useState(null); // id du restaurant en cours de traitement
  const [erreurAction, setErreurAction] = useState("");
  const [info, setInfo] = useState("");
  const [essai, setEssai] = useState(0);
  const [defautFait, setDefautFait] = useState(false);

  const charger = useCallback(async () => {
    setErreur("");
    try {
      const liste = await appel("/api/admin/restaurants");
      setRestos(Array.isArray(liste) ? liste : []);
    } catch (e) {
      setErreur(e.statut === 401 || e.statut === 403 ? "Votre session a expiré. Reconnectez-vous." : "Impossible de charger les restaurants. Vérifiez votre connexion.");
    }
    try {
      const j = await appel("/api/admin/journal");
      setJournal(Array.isArray(j) ? j : []);
    } catch { setJournal(null); }
  }, []);

  useEffect(() => { charger(); }, [charger, essai]);

  const nombres = useMemo(() => compter(restos || []), [restos]);

  // Au premier chargement : s'il n'y a rien en attente, on montre directement les restaurants actifs.
  useEffect(() => {
    if (restos && !defautFait) { setDefautFait(true); if (nombres.en_attente === 0) setOnglet(nombres.valide > 0 ? "valide" : "tous"); }
  }, [restos, defautFait, nombres]);

  const visibles = useMemo(() => filtrer(restos || [], onglet === "journal" ? "tous" : onglet, recherche), [restos, onglet, recherche]);

  const lancer = (action, resto) => { setErreurAction(""); setConfirmation({ action, resto }); };

  const confirmer = async () => {
    const { action, resto } = confirmation;
    setOccupe(resto.id); setErreurAction("");
    try {
      if (action === "supprimer") await appel(`/api/admin/restaurants/${resto.id}`, { method: "DELETE" });
      else await appel(`/api/admin/restaurants/${resto.id}/${action}`, { method: "PUT" });
      setConfirmation(null);
      setInfo(`${PHRASE[action]} (${resto.nom})`);
      setTimeout(() => setInfo(""), 4000);
      await charger();
    } catch (e) {
      setErreurAction(e.message);
    }
    setOccupe(null);
  };

  const quitter = async () => {
    try { await fetch(`${API}/api/auth/deconnexion`, { method: "POST" }); } catch { /* on quitte quand même */ }
    onQuitter();
  };

  return (
    <div className="lg-page lg-adm">
      <header className="lg-adm-haut">
        <div className="lg-adm-cadre lg-adm-haut-ligne">
          <div className="lg-adm-marque"><Marque taille={32} /><span className="lg-cp-badge"><Ico nom="bouclier" taille={14} /> Administration</span></div>
          <div className="lg-adm-haut-actions">
            <button type="button" className="lg-btn lg-btn-rond" onClick={() => setEssai((n) => n + 1)} aria-label="Actualiser"><Ico nom="actualiser" /></button>
            <button type="button" className="lg-btn lg-btn-rond" onClick={quitter} aria-label="Se déconnecter"><Ico nom="deconnexion" /></button>
          </div>
        </div>
      </header>

      <main className="lg-adm-cadre lg-adm-main">
        <section className="lg-adm-stats" aria-label="Résumé">
          {[["Restaurants", nombres.tous, ""], ["En attente", nombres.en_attente, nombres.en_attente ? "attention" : ""], ["Actifs", nombres.valide, ""], ["Refusés", nombres.refuse, ""]].map(([l, n, c]) => (
            <div key={l} className={`lg-adm-stat ${c}`}><span className="lg-adm-stat-n">{restos ? n : "–"}</span><span className="lg-adm-stat-l">{l}</span></div>
          ))}
        </section>

        {info && <div className="lg-message-ok" role="status"><Ico nom="check" taille={18} /> {info}</div>}
        {erreur && (
          <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div>
            <button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={() => setEssai((n) => n + 1)}><Ico nom="actualiser" taille={18} /> Réessayer</button>
          </div>
        )}

        {!erreur && (<>
          <div className="lg-chips" role="tablist" aria-label="Filtrer">
            {ONGLETS.map((o) => (
              <button key={o.id} type="button" role="tab" className="lg-chip" aria-pressed={onglet === o.id} aria-selected={onglet === o.id} onClick={() => setOnglet(o.id)}>
                {o.texte}{o.id !== "journal" && restos ? ` (${nombres[o.id]})` : ""}
              </button>
            ))}
          </div>

          {onglet !== "journal" && (
            <div className="lg-recherche"><Ico nom="recherche" taille={18} /><input type="search" placeholder="Rechercher par nom, ville, email ou code" value={recherche} onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher un restaurant" /></div>
          )}

          {onglet !== "journal" && restos === null && (
            <div className="lg-adm-liste" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="lg-adm-carte"><div className="lg-adm-photo lg-squelette" style={{ aspectRatio: "1/1" }} /><div className="lg-adm-corps"><span className="lg-squelette" style={{ display: "block", aspectRatio: "auto", height: 16, width: "55%", borderRadius: 8 }} /></div></div>)}</div>
          )}
          {onglet !== "journal" && restos && visibles.length === 0 && (
            <div className="lg-vide"><Ico nom="couverts" taille={32} /><div>{recherche.trim() ? "Aucun restaurant ne correspond à votre recherche." : onglet === "en_attente" ? "Aucune demande en attente." : "Aucun restaurant dans cette catégorie."}</div></div>
          )}
          {onglet !== "journal" && visibles.length > 0 && (
            <div className="lg-adm-liste">{visibles.map((r) => <CarteAdmin key={r.id} resto={r} occupe={occupe === r.id} onAction={lancer} />)}</div>
          )}

          {onglet === "journal" && (
            journal === null
              ? <div className="lg-vide"><Ico nom="alerte" taille={32} /><div>Le journal n'est pas disponible. Vérifiez que la table du journal a bien été créée.</div></div>
              : journal.length === 0
                ? <div className="lg-vide"><Ico nom="recu" taille={32} /><div>Aucune action enregistrée pour le moment.</div></div>
                : <ul className="lg-adm-journal">{journal.map((j) => (
                  <li key={j.id}><span className="lg-adm-point" data-action={j.action} /><span><strong>{j.cible_nom || "Restaurant"}</strong> : l'administrateur {ACTIONS_JOURNAL[j.action] || j.action}<span className="lg-adm-discret"> · {ilYa(j.created_at)}</span></span></li>
                ))}</ul>
          )}
        </>)}
      </main>

      {confirmation && (
        <Confirmation
          titre={TEXTES[confirmation.action].titre}
          texte={TEXTES[confirmation.action].texte(confirmation.resto)}
          bouton={TEXTES[confirmation.action].bouton}
          danger={TEXTES[confirmation.action].danger}
          motAConfirmer={confirmation.action === "supprimer" ? confirmation.resto.nom : undefined}
          occupe={occupe === confirmation.resto.id}
          erreur={erreurAction}
          onConfirmer={confirmer}
          onAnnuler={() => setConfirmation(null)}
        />
      )}
    </div>
  );
}
