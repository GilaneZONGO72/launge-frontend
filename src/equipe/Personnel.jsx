import { useCallback, useEffect, useState } from "react";
import { Feuille, Champ, Interrupteur } from "../restaurant/Champs";
import Confirmation from "../admin/Confirmation";
import Ico from "./IconesEquipe";
import { appel } from "../stock/api";
import { ilYa } from "../admin/outils";
import { ORDRE_POSTES, POSTES, nomPoste } from "./postes";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // sans lettres ambiguës (l, i, o, 0, 1)
const motDePasseAleatoire = () => {
  const octets = new Uint32Array(8);
  (window.crypto || window.msCrypto).getRandomValues(octets);
  return Array.from(octets, (n) => ALPHABET[n % ALPHABET.length]).join("");
};
const identifiantSuggere = (nom) => nom.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 30);

function ChoixPoste({ valeur, onChange }) {
  return (
    <div className="lg-postes" role="radiogroup" aria-label="Poste">
      {ORDRE_POSTES.map((p) => (
        <button key={p} type="button" role="radio" aria-checked={valeur === p} className="lg-poste-choix" data-actif={valeur === p} onClick={() => onChange(p)}>
          <strong>{POSTES[p].nom}</strong><span>{POSTES[p].texte}</span>
        </button>
      ))}
    </div>
  );
}

// Remis une seule fois au gérant : on ne peut plus relire un mot de passe ensuite.
function Acces({ code, identifiant, mdp, onFermer }) {
  const [copie, setCopie] = useState(false);
  const texte = `Launge - connexion du personnel\nCode du restaurant : ${code}\nIdentifiant : ${identifiant}\nMot de passe : ${mdp}`;
  const copier = async () => { try { await navigator.clipboard.writeText(texte); setCopie(true); setTimeout(() => setCopie(false), 2500); } catch { /* ignoré */ } };
  return (
    <Feuille titre="Compte créé" onFermer={onFermer}>
      <div className="lg-pile">
        <p className="lg-legende">Transmettez ces accès à la personne. Le mot de passe ne sera plus affichable : notez-le maintenant (vous pourrez en définir un nouveau).</p>
        <div className="lg-acces" aria-label="Accès du compte">
          <div><span className="lg-legende">Code du restaurant</span><strong>{code}</strong></div>
          <div><span className="lg-legende">Identifiant</span><strong>{identifiant}</strong></div>
          <div><span className="lg-legende">Mot de passe</span><strong>{mdp}</strong></div>
        </div>
        <button type="button" className="lg-btn lg-clair lg-pleine" onClick={copier}><Ico nom={copie ? "check" : "copie"} taille={18} /> {copie ? "Copié" : "Copier les accès"}</button>
        <button type="button" className="lg-btn lg-btn-nuit lg-pleine" onClick={onFermer}>Terminer</button>
      </div>
    </Feuille>
  );
}

function FormMembre({ gerant, membre, onFermer, onEnregistre }) {
  const edition = Boolean(membre);
  const [b, setB] = useState({ nom: membre ? membre.nom : "", identifiant: membre ? membre.identifiant : "", poste: membre ? membre.poste : "caissier", mot_de_passe: edition ? "" : motDePasseAleatoire(), actif: membre ? membre.actif : true });
  const [identifiantModifie, setIdentifiantModifie] = useState(false);
  const [voir, setVoir] = useState(!edition);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const maj = (k, v) => { setB((x) => ({ ...x, [k]: v })); setErreur(""); };

  const enregistrer = async () => {
    if (envoi) return;
    if (b.nom.trim().length < 2) return setErreur("Saisissez le nom de la personne.");
    if (!edition && !/^[a-z0-9._-]{3,30}$/.test(b.identifiant)) return setErreur("L'identifiant doit contenir de 3 à 30 lettres minuscules, chiffres, points ou tirets.");
    if ((!edition || b.mot_de_passe) && (b.mot_de_passe.length < 6 || b.mot_de_passe.length > 64)) return setErreur("Le mot de passe doit contenir de 6 à 64 caractères.");
    setEnvoi(true);
    try {
      if (edition) {
        const corps = { nom: b.nom.trim(), poste: b.poste, actif: b.actif };
        if (b.mot_de_passe) corps.mot_de_passe = b.mot_de_passe;
        const d = await appel(`/api/personnel/${gerant.id}/${membre.id}`, { method: "PUT", body: JSON.stringify(corps) });
        onEnregistre(d, b.mot_de_passe ? { identifiant: d.identifiant, mdp: b.mot_de_passe } : null);
      } else {
        const d = await appel(`/api/personnel/${gerant.id}`, { method: "POST", body: JSON.stringify({ nom: b.nom.trim(), identifiant: b.identifiant, poste: b.poste, mot_de_passe: b.mot_de_passe }) });
        onEnregistre(d, { identifiant: d.identifiant, mdp: b.mot_de_passe }, true);
      }
    } catch (e) { setErreur(e.message); setEnvoi(false); }
  };

  return (
    <Feuille titre={edition ? "Modifier le compte" : "Nouveau membre"} onFermer={onFermer}>
      <div className="lg-form">
        <Champ label="Nom de la personne"><input className="lg-input" value={b.nom} maxLength={80} placeholder="Ex : Awa Ndiaye" onChange={(e) => { const nom = e.target.value; setB((x) => ({ ...x, nom, identifiant: edition || identifiantModifie ? x.identifiant : identifiantSuggere(nom) })); setErreur(""); }} /></Champ>
        <Champ label="Poste"><ChoixPoste valeur={b.poste} onChange={(p) => maj("poste", p)} /></Champ>
        <Champ label="Identifiant" aide={edition ? "L'identifiant ne peut pas être modifié." : "Lettres minuscules, chiffres, points ou tirets. Sert à se connecter."}>
          <input className="lg-input" value={b.identifiant} disabled={edition} maxLength={30} autoCapitalize="none" spellCheck={false} onChange={(e) => { setIdentifiantModifie(true); maj("identifiant", e.target.value.toLowerCase()); }} />
        </Champ>
        <Champ label={edition ? "Nouveau mot de passe (facultatif)" : "Mot de passe"} aide={edition ? "Laissez vide pour le conserver." : "Généré pour vous : vous pouvez le changer."}>
          <div className="lg-stk-rang">
            <input className="lg-input" type={voir ? "text" : "password"} value={b.mot_de_passe} maxLength={64} autoComplete="new-password" onChange={(e) => maj("mot_de_passe", e.target.value)} />
            <button type="button" className="lg-btn lg-clair" onClick={() => { maj("mot_de_passe", motDePasseAleatoire()); setVoir(true); }}><Ico nom="cle" taille={16} /> Générer</button>
          </div>
        </Champ>
        {edition && (
          <div className="lg-ligne-inter">
            <span><strong>Compte actif</strong><span className="lg-champ-aide">Désactivé, il perd l'accès presque aussitôt.</span></span>
            <Interrupteur actif={b.actif} onChange={(v) => maj("actif", v)} label="Compte actif" />
          </div>
        )}
        {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}
        <button type="button" className="lg-btn lg-btn-orange lg-pleine" disabled={envoi} onClick={enregistrer}>{envoi ? "Enregistrement…" : edition ? "Enregistrer" : "Créer le compte"}</button>
      </div>
    </Feuille>
  );
}

export default function Personnel({ gerant }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState(null); // null | "nouveau" | membre
  const [acces, setAcces] = useState(null);
  const [suppr, setSuppr] = useState(null);
  const [occupe, setOccupe] = useState(false);
  const [erreurAction, setErreurAction] = useState("");

  const charger = useCallback(async () => {
    setErreur("");
    try { const d = await appel(`/api/personnel/${gerant.id}`); setListe(Array.isArray(d) ? d : []); }
    catch { setErreur("Impossible de charger l'équipe. Vérifiez que les tables ont bien été créées."); }
  }, [gerant.id]);
  useEffect(() => { charger(); }, [charger]);

  const apresEnregistrement = (membre, motDePasse, nouveau) => {
    setListe((l) => (nouveau ? [...(l || []), membre] : (l || []).map((x) => (x.id === membre.id ? membre : x))));
    setForm(null);
    if (motDePasse) setAcces(motDePasse);
  };
  const supprimer = async () => {
    setOccupe(true); setErreurAction("");
    try { await appel(`/api/personnel/${gerant.id}/${suppr.id}`, { method: "DELETE" }); setListe((l) => l.filter((x) => x.id !== suppr.id)); setSuppr(null); }
    catch (e) { setErreurAction(e.message); }
    setOccupe(false);
  };

  return (
    <>
      <button type="button" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 50 }} onClick={() => setForm("nouveau")}><Ico nom="plus" taille={18} /> Ajouter un membre</button>
      {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {erreur}</div>}
      {liste === null && !erreur && <div className="lg-legende">Chargement…</div>}
      {liste && !liste.length && <div className="lg-vide"><Ico nom="equipe" taille={32} /><div>Aucun compte pour le moment. Créez un accès pour votre caissier, votre cuisinier ou votre responsable de stock.</div></div>}
      {liste && liste.length > 0 && (
        <div className="lg-grille-2">
          {liste.map((m) => (
            <div key={m.id} className="lg-promo-carte" data-inactif={!m.actif}>
              <div className="lg-promo-tete">
                <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span className="lg-avatar" aria-hidden="true">{m.nom[0].toUpperCase()}</span>
                  <span style={{ minWidth: 0 }}><strong style={{ display: "block", overflowWrap: "anywhere" }}>{m.nom}</strong><span className="lg-legende">@{m.identifiant}</span></span>
                </span>
                <span className={`lg-badge ${m.actif ? "lg-badge-vert" : ""}`}>{m.actif ? "Actif" : "Désactivé"}</span>
              </div>
              <div className="lg-promo-detail"><strong>{nomPoste(m.poste)}</strong><span>{m.derniere_connexion ? `Connecté ${ilYa(m.derniere_connexion)}` : "Jamais connecté"}</span></div>
              <div className="lg-promo-actions">
                <button type="button" className="lg-btn lg-clair" onClick={() => setForm(m)}><Ico nom="pencil" taille={16} /> Modifier</button>
                <button type="button" className="lg-btn lg-clair" onClick={() => { setErreurAction(""); setSuppr(m); }} aria-label={`Supprimer ${m.nom}`}><Ico nom="corbeille" taille={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {form && <FormMembre gerant={gerant} membre={form === "nouveau" ? null : form} onFermer={() => setForm(null)} onEnregistre={apresEnregistrement} />}
      {acces && <Acces code={gerant.code_unique} identifiant={acces.identifiant} mdp={acces.mdp} onFermer={() => setAcces(null)} />}
      {suppr && <Confirmation titre="Supprimer ce compte ?" texte={`${suppr.nom} ne pourra plus se connecter. Pour garder le compte mais couper l'accès, utilisez plutôt « Modifier » puis désactivez-le.`} bouton="Supprimer" occupe={occupe} erreur={erreurAction} onConfirmer={supprimer} onAnnuler={() => setSuppr(null)} />}
    </>
  );
}
