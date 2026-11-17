import { useEffect, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "./cuisine.css";
import "../comptes/comptes.css";
import Ico from "./IconesCuisine";

const API = "https://launge-backend-production.up.railway.app";

// Connexion du cuisinier : code du restaurant + code cuisine (donnés par le gérant).
export default function ConnexionCuisine({ onConnecte, onRetour }) {
  const [code, setCode] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resto, setResto] = useState(null); // null | "cherche" | "introuvable" | { nom }

  // Dès que le code restaurant est complet (LNG- + 6 caractères), on affiche le nom du restaurant pour confirmer qu'on est au bon endroit.
  useEffect(() => {
    if (!/^LNG-[A-Z0-9]{6}$/.test(code)) { setResto(null); return undefined; }
    const ctrl = new AbortController();
    setResto("cherche");
    fetch(`${API}/api/restaurants/code/${encodeURIComponent(code)}`, { signal: ctrl.signal })
      .then(async (r) => { const d = await r.json().catch(() => ({})); setResto(r.ok && d.nom ? { nom: d.nom } : "introuvable"); })
      .catch((e) => { if (e.name !== "AbortError") setResto(null); });
    return () => ctrl.abort();
  }, [code]);

  const valider = async (e) => {
    e.preventDefault();
    if (envoi) return;
    if (!code.trim() || !mdp) return setErreur("Saisissez le code du restaurant et le code cuisine.");
    setEnvoi(true); setErreur("");
    try {
      const res = await fetch(`${API}/api/restaurants/connexion-cuisine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_unique: code.trim().toUpperCase(), code_cuisine: mdp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error || !data.restaurant) { setErreur(data.error || "Connexion impossible."); setEnvoi(false); return; }
      onConnecte(data.restaurant);
    } catch {
      setErreur("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setEnvoi(false);
    }
  };

  return (
    <div className="lg-page lg-conn">
      <div className="lg-conn-carte">
        <button type="button" className="lg-btn lg-btn-rond" style={{ justifySelf: "start" }} onClick={onRetour} aria-label="Retour à l'accueil"><Ico nom="retour" /></button>
        <div className="lg-conn-tete">
          <span className="lg-conn-logo"><Ico nom="chef" taille={30} /></span>
          <h1 className="lg-titre lg-h1">Espace cuisine</h1>
          <p>Accès réservé à votre équipe. Les codes vous sont donnés par le gérant.</p>
        </div>
        <form className="lg-conn-form" onSubmit={valider} noValidate>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cu-code">Code restaurant</label>
            <input id="cu-code" className="lg-input" placeholder="LNG-XXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} autoFocus />
              {resto === "cherche" && <span className="lg-cp-bande lg-cp-bande-attente" role="status">Recherche du restaurant…</span>}
              {resto === "introuvable" && <span className="lg-cp-bande lg-cp-bande-ko" role="status"><Ico nom="alerte" taille={16} /> Aucun restaurant avec ce code</span>}
              {resto && resto.nom && <span className="lg-cp-bande lg-cp-bande-ok" role="status"><Ico nom="check" taille={16} /> {resto.nom}</span>}
          </div>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cu-mdp">Code cuisine</label>
            <span className="lg-mdp">
              <input id="cu-mdp" className="lg-input" type={voir ? "text" : "password"} placeholder="••••" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="off" />
              <button type="button" onClick={() => setVoir((v) => !v)} aria-label={voir ? "Masquer le code" : "Afficher le code"}><Ico nom={voir ? "oeilbarre" : "oeil"} taille={20} /></button>
            </span>
          </div>
          {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {erreur}</div>}
          <button type="submit" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 52 }} disabled={envoi}>{envoi ? "Connexion…" : "Ouvrir la cuisine"}</button>
        </form>
      </div>
    </div>
  );
}
