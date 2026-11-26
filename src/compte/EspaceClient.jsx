import { useCallback, useEffect, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "../comptes/comptes.css";
import "./compteClient.css";
import Icon from "../design/Icon";
import Ico from "../comptes/IconesComptes";
import Marque from "../comptes/Marque";
import BoutonNotifications from "../notifications/BoutonNotifications";
import { desactiverNotifications } from "../notifications/push";
import { appelClient, entetesClient, majClient, memoriserSession, oublierSession, useSessionClient } from "./clientApi";

const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR");
const STATUTS = { en_cours: "Reçue", acceptee: "En préparation", pret: "Prête", servi: "Servie" };
const quand = (d) => { try { return new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

function Formulaire({ onRetour }) {
  const [mode, setMode] = useState("connexion");
  const [tel, setTel] = useState("");
  const [nom, setNom] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const inscrire = mode === "inscription";

  const valider = async (e) => {
    e.preventDefault();
    if (envoi) return;
    if (!tel.trim()) return setErreur("Saisissez votre numéro de téléphone.");
    if (!mdp) return setErreur("Saisissez votre mot de passe.");
    if (inscrire && mdp.length < 6) return setErreur("Le mot de passe doit contenir au moins 6 caractères.");
    setEnvoi(true); setErreur("");
    try {
      const d = await appelClient(inscrire ? "/api/clients/creer-compte" : "/api/clients/ouvrir-session", { method: "POST", body: JSON.stringify({ telephone: tel.trim(), mot_de_passe: mdp, ...(inscrire ? { nom: nom.trim() } : {}) }) });
      memoriserSession(d.token, d.client);
    } catch (x) { setErreur(x.message); setEnvoi(false); }
  };

  return (
    <div className="lg-page lg-cp">
      <div className="lg-cp-boite">
        <div className="lg-cp-haut">
          <button type="button" className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour"><Icon nom="retour" /></button>
          <Marque taille={34} />
          <span style={{ width: 44 }} aria-hidden="true" />
        </div>
        <div className="lg-cp-tete">
          <h1 className="lg-titre lg-h1">{inscrire ? "Créer mon compte" : "Mon compte"}</h1>
          <p>{inscrire ? "Retrouvez vos commandes, vos points et vos cadeaux. Le compte est facultatif." : "Connectez-vous pour retrouver vos commandes et vos points."}</p>
        </div>
        <form className="lg-cp-carte" onSubmit={valider} noValidate>
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="ec-tel">Numéro de téléphone</label>
            <input id="ec-tel" className="lg-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="6 99 00 11 22" value={tel} onChange={(e) => setTel(e.target.value)} />
          </div>
          {inscrire && (
            <div className="lg-champ">
              <label className="lg-champ-label" htmlFor="ec-nom">Votre prénom (facultatif)</label>
              <input id="ec-nom" className="lg-input" type="text" autoComplete="given-name" maxLength={60} value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
          )}
          <div className="lg-champ">
            <label className="lg-champ-label" htmlFor="ec-mdp">Mot de passe</label>
            <span className="lg-cp-mdp">
              <input id="ec-mdp" className="lg-input" type={voir ? "text" : "password"} autoComplete={inscrire ? "new-password" : "current-password"} placeholder={inscrire ? "6 caractères minimum" : "Votre mot de passe"} value={mdp} onChange={(e) => setMdp(e.target.value)} />
              <button type="button" onClick={() => setVoir((v) => !v)} aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}><Ico nom={voir ? "oeilbarre" : "oeil"} taille={20} /></button>
            </span>
          </div>
          {inscrire && <p className="lg-legende" style={{ margin: 0 }}>Retenez bien votre mot de passe : il ne peut pas encore être récupéré par SMS.</p>}
          {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Icon nom="alerte" taille={18} /> {erreur}</div>}
          <button type="submit" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 52 }} disabled={envoi}>{envoi ? "Patientez…" : inscrire ? "Créer mon compte" : "Me connecter"}</button>
        </form>
        <div className="lg-cp-pied">
          {inscrire ? "Déjà un compte ? " : "Pas encore de compte ? "}
          <button type="button" className="lg-cp-lien" onClick={() => { setMode(inscrire ? "connexion" : "inscription"); setErreur(""); }}>{inscrire ? "Me connecter" : "Créer un compte"}</button>
        </div>
      </div>
    </div>
  );
}

function Commandes({ onSuivi }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => { appelClient("/api/clients/historique").then(setListe).catch((e) => setErreur(e.message)); }, []);
  if (erreur) return <div className="lg-bandeau" role="alert"><Icon nom="alerte" taille={18} /> {erreur}</div>;
  if (!liste) return <div className="lg-squelette" style={{ height: 120 }} />;
  if (!liste.length) return <div className="lg-vide"><Icon nom="recu" taille={32} /><p>Aucune commande pour l'instant.<br />Les commandes passées une fois connecté apparaissent ici.</p></div>;
  return (
    <ul className="lg-cc-liste">
      {liste.map((c) => (
        <li key={c.reference_suivi}>
          <button type="button" className="lg-cc-ligne" onClick={() => onSuivi(c.reference_suivi)}>
            <span className="lg-cc-corps">
              <strong>{c.restaurant}</strong>
              <span className="lg-legende">{quand(c.created_at)} · {c.nb_articles} article{c.nb_articles > 1 ? "s" : ""}{c.resume ? ` · ${c.resume}` : ""}</span>
            </span>
            <span className="lg-cc-droite"><strong>{fcfa(c.total)} FCFA</strong><span className="lg-badge lg-badge-vert" data-statut={c.statut}>{STATUTS[c.statut] || c.statut}</span></span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Fidelite() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState("");
  useEffect(() => { appelClient("/api/clients/fidelite").then(setListe).catch((e) => setErreur(e.message)); }, []);
  const copier = async (code) => { try { await navigator.clipboard.writeText(code); setCopie(code); setTimeout(() => setCopie(""), 2000); } catch { /* ignoré */ } };
  if (erreur) return <div className="lg-bandeau" role="alert"><Icon nom="alerte" taille={18} /> {erreur}</div>;
  if (!liste) return <div className="lg-squelette" style={{ height: 120 }} />;
  if (!liste.length) return <div className="lg-vide"><Icon nom="sourire" taille={32} /><p>Pas encore de points.<br />Commandez dans un restaurant qui propose la fidélité, connecté à votre compte.</p></div>;
  return (
    <div className="lg-pile">
      {liste.map((f) => {
        const pct = Math.min(100, Math.round((f.points / Math.max(1, f.seuil_points)) * 100));
        return (
          <section key={f.restaurant_id} className="lg-carte">
            <h3 className="lg-titre lg-h3" style={{ fontSize: 17, margin: 0 }}>{f.restaurant}</h3>
            <p className="lg-legende" style={{ margin: "4px 0 10px" }}>{f.points} / {f.seuil_points} points · cadeau de {fcfa(f.valeur_recompense)} FCFA</p>
            <div className="lg-cc-barre" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
            {f.codes.map((c) => (
              <div key={c.code} className="lg-cc-code" data-etat={c.utilisable ? "ok" : "non"}>
                <span><strong>{c.code}</strong><span className="lg-legende"> · {fcfa(c.valeur)} FCFA · {c.utilisable ? "à utiliser" : c.utilise ? "déjà utilisé" : "expiré"}</span></span>
                {c.utilisable && <button type="button" className="lg-btn" onClick={() => copier(c.code)}><Icon nom={copie === c.code ? "check" : "copie"} taille={16} />{copie === c.code ? "Copié" : "Copier"}</button>}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Reglages({ client, onSortie }) {
  const [nom, setNom] = useState(client.nom || "");
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [msg, setMsg] = useState("");
  const [erreur, setErreur] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [suppr, setSuppr] = useState(false);
  const [mdpSuppr, setMdpSuppr] = useState("");

  const enregistrer = async (e) => {
    e.preventDefault();
    if (occupe) return;
    const corps = {};
    if (nom.trim() !== (client.nom || "")) corps.nom = nom.trim();
    if (nouveau) { corps.nouveau_mot_de_passe = nouveau; corps.ancien_mot_de_passe = ancien; }
    if (!Object.keys(corps).length) return setErreur("Rien à modifier.");
    setOccupe(true); setErreur(""); setMsg("");
    try { const d = await appelClient("/api/clients/moi", { method: "PUT", body: JSON.stringify(corps) }); majClient(d); setAncien(""); setNouveau(""); setMsg("Modifications enregistrées."); }
    catch (x) { setErreur(x.message); }
    setOccupe(false);
  };
  const supprimer = async () => {
    if (occupe) return;
    setOccupe(true); setErreur("");
    try { await appelClient("/api/clients/supprimer", { method: "POST", body: JSON.stringify({ mot_de_passe: mdpSuppr }) }); await desactiverNotifications("compte"); oublierSession(); onSortie(); }
    catch (x) { setErreur(x.message); setOccupe(false); }
  };

  return (
    <div className="lg-pile">
      <form className="lg-carte lg-cc-form" onSubmit={enregistrer}>
        <h3 className="lg-titre lg-h3" style={{ fontSize: 17, margin: 0 }}>Mes informations</h3>
        <p className="lg-legende" style={{ margin: 0 }}>Téléphone : {client.telephone}</p>
        <div className="lg-champ"><label className="lg-champ-label" htmlFor="rc-nom">Prénom</label><input id="rc-nom" className="lg-input" maxLength={60} value={nom} onChange={(e) => setNom(e.target.value)} /></div>
        <div className="lg-champ"><label className="lg-champ-label" htmlFor="rc-anc">Ancien mot de passe</label><input id="rc-anc" className="lg-input" type="password" autoComplete="current-password" value={ancien} onChange={(e) => setAncien(e.target.value)} /></div>
        <div className="lg-champ"><label className="lg-champ-label" htmlFor="rc-nou">Nouveau mot de passe</label><input id="rc-nou" className="lg-input" type="password" autoComplete="new-password" placeholder="6 caractères minimum" value={nouveau} onChange={(e) => setNouveau(e.target.value)} /></div>
        {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Icon nom="alerte" taille={18} /> {erreur}</div>}
        {msg && <p className="lg-notif-ok" role="status"><Icon nom="check" taille={18} /> {msg}</p>}
        <button type="submit" className="lg-btn lg-btn-nuit lg-pleine" disabled={occupe}>Enregistrer</button>
      </form>

      <BoutonNotifications variante="carte" titre="Notifications" texte="Soyez prévenu sur cet appareil quand une de vos commandes est prête." cible={{ id: "compte", chemin: "/api/push/compte", headers: entetesClient() }} />

      <section className="lg-carte lg-cc-form">
        <button type="button" className="lg-btn lg-pleine" onClick={async () => { await desactiverNotifications("compte"); oublierSession(); onSortie(); }}><Ico nom="deconnexion" taille={18} /> Me déconnecter</button>
        {!suppr ? (
          <button type="button" className="lg-cp-lien" style={{ color: "var(--lg-rouge)" }} onClick={() => setSuppr(true)}>Supprimer mon compte</button>
        ) : (
          <div className="lg-cc-danger">
            <p style={{ margin: 0, fontSize: 14 }}>Votre compte, vos points et vos cadeaux seront supprimés. Entrez votre mot de passe pour confirmer.</p>
            <input className="lg-input" type="password" aria-label="Mot de passe" autoComplete="current-password" value={mdpSuppr} onChange={(e) => setMdpSuppr(e.target.value)} />
            <button type="button" className="lg-btn lg-pleine" style={{ background: "var(--lg-rouge)", color: "#fff" }} onClick={supprimer} disabled={occupe || !mdpSuppr}>Supprimer définitivement</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function EspaceClient({ onRetour, onSuivi }) {
  const session = useSessionClient();
  const [onglet, setOnglet] = useState("commandes");
  const sortie = useCallback(() => onRetour(), [onRetour]);

  useEffect(() => {
    if (!session) return;
    appelClient("/api/clients/moi").then(majClient).catch(() => {});
  }, [session && session.token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return <Formulaire onRetour={onRetour} />;
  const moi = session.client || {};
  return (
    <div className="lg-page" style={{ paddingBottom: 40 }}>
      <div className="lg-colonne">
        <header className="lg-entete">
          <button className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour"><Icon nom="retour" /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="lg-titre lg-h3" style={{ fontSize: 20, margin: 0 }}>{moi.nom ? `Bonjour ${moi.nom}` : "Mon compte"}</h1>
            <div className="lg-legende">{moi.telephone}</div>
          </div>
        </header>
        <div className="lg-cc-onglets" role="tablist">
          {[["commandes", "Commandes"], ["fidelite", "Fidélité"], ["compte", "Compte"]].map(([id, nomOnglet]) => (
            <button key={id} role="tab" aria-selected={onglet === id} className="lg-cc-onglet" onClick={() => setOnglet(id)}>{nomOnglet}</button>
          ))}
        </div>
        {onglet === "commandes" && <Commandes onSuivi={onSuivi} />}
        {onglet === "fidelite" && <Fidelite />}
        {onglet === "compte" && <Reglages client={moi} onSortie={sortie} />}
      </div>
    </div>
  );
}
