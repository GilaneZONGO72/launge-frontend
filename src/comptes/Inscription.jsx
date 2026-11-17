import { useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "./comptes.css";
import Ico from "./IconesComptes";
import Marque from "./Marque";

const API = "https://launge-backend-production.up.railway.app";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ETAPES = [
  { titre: "Votre restaurant", aide: "Comment vos clients vous retrouvent." },
  { titre: "Vos coordonnées", aide: "Pour que nous puissions vous joindre." },
  { titre: "Votre mot de passe", aide: "Il protège l'accès à votre espace." },
];
const VIDE = { nom: "", ville: "", adresse: "", telephone: "", email: "", mdp: "", mdp2: "" };

// Inscription d'un restaurant en 3 courtes étapes, puis écran de confirmation avec le code du restaurant.
export default function Inscription({ onRetour, onTerminee }) {
  const [etape, setEtape] = useState(0);
  const [f, setF] = useState(VIDE);
  const [err, setErr] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [code, setCode] = useState(null);
  const [copie, setCopie] = useState(false);
  const [voir, setVoir] = useState(false);
  const maj = (k, v) => { setF((x) => ({ ...x, [k]: v })); if (err[k] || err.general) setErr((e) => ({ ...e, [k]: undefined, general: undefined })); };

  const verifier = (n) => {
    const x = {};
    if (n === 0) {
      if (!f.nom.trim()) x.nom = "Indiquez le nom de votre restaurant.";
      if (!f.ville.trim()) x.ville = "Indiquez votre ville.";
    }
    if (n === 1) {
      if (f.telephone.replace(/\D/g, "").length < 8) x.telephone = "Saisissez un numéro de téléphone valide.";
      if (!f.email.trim()) x.email = "Saisissez votre adresse email.";
      else if (!EMAIL.test(f.email.trim())) x.email = "Cette adresse email n'est pas valide.";
    }
    if (n === 2) {
      if (f.mdp.length < 8) x.mdp = "Le mot de passe doit contenir au moins 8 caractères.";
      else if (f.mdp !== f.mdp2) x.mdp2 = "Les deux mots de passe ne correspondent pas.";
    }
    return x;
  };

  const suivant = async (e) => {
    e.preventDefault();
    if (envoi) return;
    const x = verifier(etape);
    setErr(x);
    if (Object.keys(x).length) return;
    if (etape < 2) return setEtape(etape + 1);

    setEnvoi(true);
    try {
      const res = await fetch(`${API}/api/restaurants/inscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: f.nom.trim(), ville: f.ville.trim(), adresse: f.adresse.trim(), telephone: f.telephone.trim(), email: f.email.trim().toLowerCase(), mot_de_passe: f.mdp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error || !data.code_unique) {
        const m = data.error || (res.status === 429 ? "Trop de tentatives. Réessayez plus tard." : "Inscription impossible. Réessayez.");
        // On renvoie la personne à l'étape concernée avec le message sous le bon champ.
        if (/email/i.test(m)) { setEtape(1); setErr({ email: m }); }
        else if (/mot de passe/i.test(m)) { setEtape(2); setErr({ mdp: m }); }
        else if (/nom|ville/i.test(m)) { setEtape(0); setErr({ nom: m }); }
        else setErr({ general: m });
        setEnvoi(false);
        return;
      }
      setCode(data.code_unique);
    } catch {
      setErr({ general: "Connexion impossible. Vérifiez votre réseau et réessayez." });
    }
    setEnvoi(false);
  };

  const copier = async () => {
    try { await navigator.clipboard.writeText(code); setCopie(true); setTimeout(() => setCopie(false), 2000); } catch { /* copie non disponible */ }
  };

  if (code) {
    return (
      <div className="lg-page lg-cp">
        <div className="lg-cp-boite">
          <div className="lg-cp-haut" style={{ justifyContent: "center" }}><Marque taille={34} /></div>
          <div className="lg-cp-carte" style={{ textAlign: "center" }}>
            <span className="lg-succes-rond"><Ico nom="check" taille={30} /></span>
            <h1 className="lg-titre lg-h1">Demande envoyée</h1>
            <p style={{ margin: 0, color: "var(--lg-texte-2)" }}>Notre équipe valide votre restaurant. Vous pourrez ensuite vous connecter avec votre adresse email.</p>
            <div style={{ textAlign: "left" }}>
              <div className="lg-legende" style={{ marginBottom: 6 }}>Code de votre restaurant</div>
              <div className="lg-code-boite">
                <strong>{code}</strong>
                <button type="button" className="lg-btn lg-clair" onClick={copier}><Ico nom={copie ? "check" : "copie"} taille={16} /> {copie ? "Copié" : "Copier"}</button>
              </div>
              <p className="lg-legende" style={{ marginTop: 8 }}>Gardez-le : vous le donnerez à votre équipe de cuisine pour qu'elle accède à l'espace cuisine.</p>
            </div>
            <button type="button" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 52 }} onClick={onTerminee}>Aller à la connexion</button>
          </div>
        </div>
      </div>
    );
  }

  const champ = (k, label, props = {}) => (
    <div className="lg-champ">
      <label className="lg-champ-label" htmlFor={`in-${k}`}>{label}</label>
      <input id={`in-${k}`} className="lg-input" value={f[k]} onChange={(e) => maj(k, e.target.value)} aria-invalid={Boolean(err[k])} {...props} />
      {err[k] && <span className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err[k]}</span>}
    </div>
  );

  return (
    <div className="lg-page lg-cp">
      <div className="lg-cp-boite">
        <div className="lg-cp-haut">
          <button type="button" className="lg-btn lg-btn-rond" onClick={etape === 0 ? onRetour : () => { setErr({}); setEtape(etape - 1); }} aria-label={etape === 0 ? "Retour à la connexion" : "Étape précédente"}><Ico nom="retour" /></button>
          <Marque taille={34} />
          <span style={{ width: 44 }} aria-hidden="true" />
        </div>

        <div className="lg-ins-etapes" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={etape + 1} aria-label="Progression de l'inscription">
          {ETAPES.map((_, i) => <span key={i} data-fait={i <= etape} />)}
        </div>

        <form className="lg-cp-carte" onSubmit={suivant} noValidate>
          <div className="lg-etape-titre">
            <small>Étape {etape + 1} sur 3</small>
            <h1 className="lg-titre lg-h1" style={{ fontSize: 24 }}>{ETAPES[etape].titre}</h1>
            <span style={{ color: "var(--lg-texte-2)" }}>{ETAPES[etape].aide}</span>
          </div>

          {etape === 0 && (<>
            {champ("nom", "Nom du restaurant", { placeholder: "Ex : Chez Mama Africa", autoComplete: "organization", autoFocus: true })}
            {champ("ville", "Ville", { placeholder: "Ex : Douala", autoComplete: "address-level2" })}
            {champ("adresse", "Adresse (facultatif)", { placeholder: "Ex : Rue Joss, Bonanjo", autoComplete: "street-address" })}
          </>)}
          {etape === 1 && (<>
            {champ("telephone", "Téléphone", { placeholder: "6 90 00 00 00", type: "tel", inputMode: "tel", autoComplete: "tel", autoFocus: true })}
            {champ("email", "Adresse email", { placeholder: "vous@restaurant.com", type: "email", inputMode: "email", autoComplete: "email", autoCapitalize: "none", spellCheck: false })}
          </>)}
          {etape === 2 && (<>
            <div className="lg-champ">
              <label className="lg-champ-label" htmlFor="in-mdp">Mot de passe</label>
              <span className="lg-cp-mdp">
                <input id="in-mdp" className="lg-input" type={voir ? "text" : "password"} placeholder="8 caractères minimum" value={f.mdp} onChange={(e) => maj("mdp", e.target.value)} autoComplete="new-password" aria-invalid={Boolean(err.mdp)} autoFocus />
                <button type="button" onClick={() => setVoir((v) => !v)} aria-label={voir ? "Masquer les mots de passe" : "Afficher les mots de passe"}><Ico nom={voir ? "oeilbarre" : "oeil"} taille={20} /></button>
              </span>
              {err.mdp && <span className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.mdp}</span>}
            </div>
            <div className="lg-champ">
              <label className="lg-champ-label" htmlFor="in-mdp2">Confirmer le mot de passe</label>
              <input id="in-mdp2" className="lg-input" type={voir ? "text" : "password"} placeholder="Saisissez-le à nouveau" value={f.mdp2} onChange={(e) => maj("mdp2", e.target.value)} autoComplete="new-password" aria-invalid={Boolean(err.mdp2)} />
              {err.mdp2 && <span className="lg-champ-erreur"><Ico nom="alerte" taille={15} /> {err.mdp2}</span>}
            </div>
          </>)}

          {err.general && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {err.general}</div>}
          <button type="submit" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 52 }} disabled={envoi}>
            {envoi ? "Création…" : etape < 2 ? "Continuer" : "Créer mon compte"}
          </button>
        </form>

        <div className="lg-cp-pied">Déjà inscrit ? <button type="button" className="lg-cp-lien" onClick={onRetour}>Se connecter</button></div>
      </div>
    </div>
  );
}
