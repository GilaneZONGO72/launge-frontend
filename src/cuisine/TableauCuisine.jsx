import { useEffect, useMemo, useRef, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "./cuisine.css";
import Ico from "./IconesCuisine";
import { COLONNES, dateServeur, heureServeur, minutesDepuis, niveauDelai, repartir, texteDelai } from "./outils";

const API = "https://launge-backend-production.up.railway.app";

// Tableau de la cuisine : Nouvelles → En préparation → Prêtes.
// Sur téléphone : une colonne à la fois (onglets). Sur grand écran : les 3 colonnes côte à côte.
export default function TableauCuisine({ commandes }) {
  const [onglet, setOnglet] = useState("en_cours");
  const [locaux, setLocaux] = useState({});
  const [occupes, setOccupes] = useState({});
  const [erreur, setErreur] = useState("");
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [neufs, setNeufs] = useState([]);
  const vus = useRef(null);

  // Les minutes d'attente se mettent à jour toutes seules.
  useEffect(() => {
    const m = setInterval(() => setMaintenant(Date.now()), 20000);
    return () => clearInterval(m);
  }, []);

  // Une commande qui vient d'arriver est mise en évidence quelques secondes.
  useEffect(() => {
    const liste = commandes || [];
    if (vus.current === null) { vus.current = new Set(liste.map((c) => c.id)); return; }
    const fraiches = liste.filter((c) => !vus.current.has(c.id));
    if (!fraiches.length) return;
    fraiches.forEach((c) => vus.current.add(c.id));
    const recentes = fraiches
      .filter((c) => c.statut === "en_cours" && Date.now() - dateServeur(c.created_at).getTime() < 120000)
      .map((c) => c.id);
    if (!recentes.length) return;
    setNeufs((n) => [...n, ...recentes]);
    setTimeout(() => setNeufs((n) => n.filter((id) => !recentes.includes(id))), 10000);
  }, [commandes]);

  const colonnes = useMemo(() => repartir(commandes, locaux, maintenant), [commandes, locaux, maintenant]);

  const avancer = async (c, col) => {
    setErreur("");
    setOccupes((o) => ({ ...o, [c.id]: true }));
    setLocaux((l) => ({ ...l, [c.id]: { vers: col.vers, t: Date.now() } })); // affichage immédiat
    try {
      const res = await fetch(`${API}/api/commandes/${c.id}/statut`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: col.vers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = new Error(data.error || "Changement impossible.");
        e.http = res.status;
        throw e;
      }
    } catch (e) {
      setLocaux((l) => { const reste = { ...l }; delete reste[c.id]; return reste; });
      setErreur(
        e.http === 409 ? "Cette commande vient d'être modifiée ailleurs. La liste se met à jour."
          : e.http === 401 || e.http === 403 ? "Session expirée. Reconnectez-vous pour continuer."
          : e.http ? e.message : "Pas de connexion. Réessayez dans un instant."
      );
    } finally {
      setOccupes((o) => { const reste = { ...o }; delete reste[c.id]; return reste; });
    }
  };

  return (
    <div className="lg-kds">
      {erreur && (
        <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}>
          <Ico nom="alerte" taille={18} />
          <span style={{ flex: 1 }}>{erreur}</span>
          <button className="lg-kds-fermer" onClick={() => setErreur("")} aria-label="Fermer le message"><Ico nom="fermer" taille={16} /></button>
        </div>
      )}

      <div className="lg-kds-onglets" role="group" aria-label="Choisir une colonne">
        {COLONNES.map((k) => (
          <button key={k.cle} className="lg-kds-onglet" aria-pressed={onglet === k.cle}
            data-alerte={k.cle === "en_cours" && colonnes.en_cours.length > 0 && onglet !== "en_cours"}
            onClick={() => setOnglet(k.cle)}>
            <span>{k.titre}</span>
            <strong>{colonnes[k.cle].length}</strong>
          </button>
        ))}
      </div>

      <div className="lg-kds-colonnes">
        {COLONNES.map((k) => {
          const liste = colonnes[k.cle];
          return (
            <section key={k.cle} className="lg-kds-col" data-actif={onglet === k.cle} aria-label={k.titre}>
              <div className="lg-kds-col-tete"><h2 className="lg-titre">{k.titre}</h2><span className="lg-kds-compte">{liste.length}</span></div>
              {liste.length === 0 && <div className="lg-kds-vide">{k.vide}</div>}
              {liste.map((c) => {
                const min = minutesDepuis(c.created_at, maintenant);
                return (
                  <article key={c.id} className="lg-ticket" data-col={k.cle} data-neuf={neufs.includes(c.id)}>
                    <div className="lg-ticket-tete">
                      <strong className="lg-ticket-table">Table {c.numero_table || "—"}</strong>
                      <span className="lg-delai" data-niveau={niveauDelai(min)} title={`Reçue à ${heureServeur(c.created_at)}`}>
                        <Ico nom="horloge" taille={14} /> {texteDelai(min)}
                      </span>
                    </div>
                    <ul className="lg-ticket-lignes">
                      {(c.items || []).map((it, i) => (
                        <li key={i}><span className="lg-ticket-qte">{it.qte}×</span><span>{it.nom}</span></li>
                      ))}
                    </ul>
                    <button className={`lg-btn lg-pleine lg-ticket-action ${k.style}`} disabled={Boolean(occupes[c.id])} onClick={() => avancer(c, k)}>
                      {occupes[c.id] ? "…" : k.action}
                    </button>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
}
