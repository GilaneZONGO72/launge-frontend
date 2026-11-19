import { useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "../comptes/comptes.css";
import Ico from "./IconesEquipe";
import Marque from "../comptes/Marque";

const API = "https://launge-backend-production.up.railway.app";

// Connexion du personnel : code du restaurant + identifiant + mot de passe donnés par le gérant.
export default function ConnexionPersonnel({ onConnecte, onRetour }) {
  const [code, setCode] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [err, setErr] = useState({});

  const valider = async (e) => {
    e.preventDefault();
    if (envoi) return;
    const x = {};
    if (!code.trim()) x.code = "Saisissez le code du restaurant.";
    if (!identifiant.trim()) x.identifiant = "Saisissez votre identifiant.";
    if (!mdp) x.mdp = "Saisissez votre mot de passe.";
    setErr(x);
    if (Object.keys(x).length) return;
    setEnvoi(true);
    try {
      const res = await fetch(`${API}/api/personnel/connexion`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code_unique: code.trim().toUpperCase(), identifiant: identifiant.trim().toLowerCase(), mot_de_passe: mdp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error || !data.token) {
        setErr({ general: data.error || (res.status === 429 ? "Trop de tentatives. Réessayez dans quelques minutes." : "Connexion impossible. Réessayez.") });
        setEnvoi(false);
        return;
      }
      onConnecte(data);
    } catch {
      setErr({ general: "Connexion impossible. Vérifiez votre réseau et réessayez." });
      setEnvoi(false);
    }
  };

  return (
    <div className="lg-page lg-cp">
      <div className="lg-cp-boite">
        <div className="lg-cp-haut">
          <button type="button" className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour"><Ico nom="retour" /></button>
          <Marque taille={34} />
          <span style={{ width: 44 }} aria-hidden="true" />
        </div>
        <div className="lg-cp-tete">
          <span className="lg-cp-badge"><Ico nom="equipe" taille={14} /> Personnel</span>
          <h1 className="lg-titre lg-h1">Espace du personnel</h1>
          <p>Connectez-vous avec les accès donnés par votre responsable.</p>
        </div>
        <form className="lg-cp-carte" onSubmit={valider} noValidate>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cp-code">Code du restaurant</label>
            <input id="cp-code" className="lg-input" placeholder="LNG-XXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-invalid={Boolean(err.code)} />
            {err.code && <span className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.code}</span>}
          </div>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cp-id">Identifiant</label>
            <input id="cp-id" className="lg-input" placeholder="Ex : awa" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} autoCapitalize="none" autoComplete="username" autoCorrect="off" spellCheck={false} aria-invalid={Boolean(err.identifiant)} />
            {err.identifiant && <span className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.identifiant}</span>}
          </div>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cp-mdp">Mot de passe</label>
            <span className="lg-cp-mdp">
              <input id="cp-mdp" className="lg-input" type={voir ? "text" : "password"} placeholder="Votre mot de passe" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" aria-invalid={Boolean(err.mdp)} />
              <button type="button" onClick={() => setVoir((v) => !v)} aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}><Ico nom={voir ? "oeilbarre" : "oeil"} taille={20} /></button>
            </span>
            {err.mdp && <span className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.mdp}</span>}
          </div>
          {err.general && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {err.general}</div>}
          <button type="submit" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 52 }} disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}</button>
        </form>
        <div className="lg-cp-pied">Vous avez perdu vos accès ? Demandez-les au gérant du restaurant.</div>
      </div>
    </div>
  );
}
