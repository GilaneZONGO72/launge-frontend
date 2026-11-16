import { useEffect, useMemo, useState } from "react";
import "../design/tokens.css";
import "./restaurants.css";
import Ico from "./IconesRestaurants";
import CarteRestaurant from "./CarteRestaurant";

const API = "https://launge-backend-production.up.railway.app";
// « Café » et « cafe » doivent se retrouver : on compare sans accents ni majuscules.
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Page « Restaurants » : recherche, puis une carte photo par restaurant (même esprit que la page menu).
export default function ListeRestaurants({ onRetour, onChoisir }) {
  const [liste, setListe] = useState(null); // null = chargement en cours
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [occupe, setOccupe] = useState(null);
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setListe(null); setErreur("");
    fetch(`${API}/api/restaurants`, { signal: ctrl.signal })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !Array.isArray(data)) throw new Error("liste");
        setListe(data);
      })
      .catch((e) => { if (e.name !== "AbortError") setErreur("Impossible de charger les restaurants. Vérifiez votre connexion."); });
    return () => ctrl.abort();
  }, [essai]);

  const q = norm(recherche.trim());
  const affiches = useMemo(
    () => (liste || []).filter((r) => !q || norm(`${r.nom} ${r.ville} ${r.adresse}`).includes(q)),
    [liste, q]
  );

  const choisir = async (r) => {
    if (occupe) return;
    setOccupe(r.id);
    try { await onChoisir(r); } finally { setOccupe(null); }
  };

  return (
    <div className="lg-page lg-restos">
      <header className="lg-restos-haut">
        <div className="lg-restos-cadre">
          <div className="lg-restos-ligne">
            <button type="button" className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour à l'accueil"><Ico nom="retour" /></button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="lg-titre lg-h2" style={{ fontSize: 26, lineHeight: 1.1 }}>Restaurants</h1>
              <div className="lg-legende" aria-live="polite">
                {liste === null && !erreur ? "Chargement…" : liste ? `${affiches.length} restaurant${affiches.length > 1 ? "s" : ""}` : ""}
              </div>
            </div>
          </div>
          <div className="lg-recherche">
            <Ico nom="recherche" taille={18} />
            <input type="search" placeholder="Rechercher un restaurant ou une ville" value={recherche} onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher un restaurant" />
          </div>
        </div>
      </header>

      <main className="lg-restos-cadre">
        {erreur && (
          <div className="lg-vide" role="alert" style={{ marginTop: 24 }}>
            <Ico nom="alerte" taille={32} />
            <div>{erreur}</div>
            <button type="button" className="lg-btn lg-btn-nuit" style={{ marginTop: 14 }} onClick={() => setEssai((n) => n + 1)}><Ico nom="actualiser" taille={18} /> Réessayer</button>
          </div>
        )}

        {liste === null && !erreur && (
          <div className="lg-restos-grille" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div className="lg-resto lg-resto-fantome" key={i}>
                <div className="lg-resto-photo lg-squelette" />
                <div className="lg-resto-corps"><span className="lg-resto-texte"><span className="lg-squelette" style={{ height: 18, width: "60%", borderRadius: 8 }} /><span className="lg-squelette" style={{ height: 14, width: "80%", borderRadius: 8 }} /></span></div>
              </div>
            ))}
          </div>
        )}

        {liste && liste.length === 0 && (
          <div className="lg-vide" style={{ marginTop: 24 }}><Ico nom="couverts" taille={32} /><div>Aucun restaurant n'est disponible pour le moment.</div></div>
        )}
        {liste && liste.length > 0 && affiches.length === 0 && (
          <div className="lg-vide" style={{ marginTop: 24 }}><Ico nom="recherche" taille={32} /><div>Aucun restaurant ne correspond à votre recherche.</div></div>
        )}

        {affiches.length > 0 && (
          <div className="lg-restos-grille">
            {affiches.map((r) => <CarteRestaurant key={r.id} resto={r} onChoisir={choisir} occupe={occupe === r.id} />)}
          </div>
        )}
      </main>
    </div>
  );
}
