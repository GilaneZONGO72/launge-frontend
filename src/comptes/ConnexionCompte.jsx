import { useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "./comptes.css";
import Ico from "./IconesComptes";
import Marque from "./Marque";

const API = "https://launge-backend-production.up.railway.app";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Connexion par email + mot de passe. Sert au gérant et à l'administrateur (seuls le texte et l'adresse d'appel changent).
export default function ConnexionCompte({ chemin, titre, sousTitre, badge, onConnecte, onRetour, onInscription, onPersonnel }) {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [err, setErr] = useState({}); // { email, mdp, general }

  const valider = async (e) => {
    e.preventDefault();
    if (envoi) return;
    const x = {};
    if (!email.trim()) x.email = "Saisissez votre adresse email.";
    else if (!EMAIL.test(email.trim())) x.email = "Cette adresse email n'est pas valide.";
    if (!mdp) x.mdp = "Saisissez votre mot de passe.";
    setErr(x);
    if (Object.keys(x).length) return;

    setEnvoi(true);
    try {
      const res = await fetch(`${API}${chemin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), mot_de_passe: mdp }),
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
          <button type="button" className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour à l'accueil"><Ico nom="retour" /></button>
          <Marque taille={34} />
          <span style={{ width: 44 }} aria-hidden="true" />
        </div>

        <div className="lg-cp-tete">
          {badge && <span className="lg-cp-badge"><Ico nom={badge.icone} taille={14} /> {badge.texte}</span>}
          <h1 className="lg-titre lg-h1">{titre}</h1>
          <p>{sousTitre}</p>
        </div>

        <form className="lg-cp-carte" onSubmit={valider} noValidate>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cc-email">Adresse email</label>
            <input id="cc-email" className="lg-input" type="email" inputMode="email" placeholder="vous@restaurant.com" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              aria-invalid={Boolean(err.email)} aria-describedby={err.email ? "cc-email-e" : undefined} />
            {err.email && <span id="cc-email-e" className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.email}</span>}
          </div>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="cc-mdp">Mot de passe</label>
            <span className="lg-cp-mdp">
              <input id="cc-mdp" className="lg-input" type={voir ? "text" : "password"} placeholder="Votre mot de passe" value={mdp}
                onChange={(e) => setMdp(e.target.value)} autoComplete="current-password"
                aria-invalid={Boolean(err.mdp)} aria-describedby={err.mdp ? "cc-mdp-e" : undefined} />
              <button type="button" onClick={() => setVoir((v) => !v)} aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}><Ico nom={voir ? "oeilbarre" : "oeil"} taille={20} /></button>
            </span>
            {err.mdp && <span id="cc-mdp-e" className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.mdp}</span>}
          </div>
          {err.general && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {err.general}</div>}
          <button type="submit" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 52 }} disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}</button>
        </form>

        {onInscription && (
          <div className="lg-cp-pied">Pas encore sur Launge ? <button type="button" className="lg-cp-lien" onClick={onInscription}>Inscrire mon restaurant</button></div>
        )}
        {onPersonnel && (
          <div className="lg-cp-pied">Vous travaillez dans un restaurant ? <button type="button" className="lg-cp-lien" onClick={onPersonnel}>Connexion du personnel</button></div>
        )}
      </div>
    </div>
  );
}
