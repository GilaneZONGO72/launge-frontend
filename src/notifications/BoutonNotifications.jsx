import { useCallback, useEffect, useState } from "react";
import Icon from "../design/Icon";
import { Feuille } from "../restaurant/Champs";
import { activerNotifications, desactiverNotifications, etatNotifications } from "./push";
import "./notifications.css";

// Panneau d'activation. variante : "icone" (bouton rond + fenêtre), "nav" (ligne du menu) ou "carte" (bloc dans la page).
export default function BoutonNotifications({ cible, titre = "Notifications", texte, variante = "carte", classe = "lg-btn lg-btn-rond" }) {
  const [etat, setEtat] = useState("chargement");
  const [ouvert, setOuvert] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");

  const relire = useCallback(() => etatNotifications(cible.id).then(setEtat), [cible.id]);
  useEffect(() => { relire(); }, [relire]);

  const activer = async () => {
    if (occupe) return;
    setOccupe(true); setErreur("");
    try { await activerNotifications(cible); } catch (e) { setErreur(e.message); }
    await relire();
    setOccupe(false);
  };
  const couper = async () => { setOccupe(true); await desactiverNotifications(cible.id); await relire(); setOccupe(false); };

  if (etat === "chargement" || etat === "non-supporte") return null;

  const panneau = (
    <div className="lg-notif">
      {texte && <p className="lg-notif-texte">{texte}</p>}
      {etat === "installer" && (
        <div className="lg-notif-guide">
          <p><strong>Sur iPhone, ajoutez d'abord Launge à l'écran d'accueil :</strong></p>
          <ol>
            <li>Ouvrez cette page dans <strong>Safari</strong>.</li>
            <li>Touchez le bouton <strong>Partager</strong> (le carré avec une flèche vers le haut).</li>
            <li>Choisissez <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.</li>
            <li>Ouvrez Launge depuis la nouvelle icône, puis revenez ici pour activer les notifications.</li>
          </ol>
          <p className="lg-legende">Il faut iOS 16.4 ou plus récent. L'application installée ne partage rien avec Safari : dedans, ouvrez « Mon compte », connectez-vous (ou créez un compte), puis activez les notifications depuis l'onglet Compte.</p>
        </div>
      )}
      {etat === "refuse" && <p className="lg-notif-info">Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages de votre navigateur, puis revenez ici.</p>}
      {etat === "actif" && <p className="lg-notif-ok"><Icon nom="check" taille={18} /> Notifications activées sur cet appareil.</p>}
      {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Icon nom="alerte" taille={18} /> {erreur}</div>}
      {etat === "inactif" && <button type="button" className="lg-btn lg-btn-orange lg-pleine" onClick={activer} disabled={occupe}><Icon nom="cloche" taille={18} /> {occupe ? "Activation…" : "Activer les notifications"}</button>}
      {etat === "actif" && <button type="button" className="lg-btn lg-pleine" onClick={couper} disabled={occupe}>{occupe ? "…" : "Désactiver sur cet appareil"}</button>}
    </div>
  );

  if (variante === "carte") {
    return (
      <section className="lg-carte lg-notif-carte" aria-label={titre}>
        <h2 className="lg-titre lg-h3" style={{ fontSize: 17, margin: "0 0 8px" }}>{titre}</h2>
        {panneau}
      </section>
    );
  }
  const actif = etat === "actif";
  return (
    <>
      {variante === "nav" ? (
        <button type="button" className="lg-nav-item lg-nav-notif" onClick={() => setOuvert(true)}>
          <span className="lg-nav-icone"><Icon nom="cloche" taille={22} />{actif && <span className="lg-notif-point" />}</span>
          <span>Notifications</span>
        </button>
      ) : (
        <button type="button" className={classe} onClick={() => setOuvert(true)} aria-label={actif ? "Notifications activées" : "Activer les notifications"}>
          <Icon nom="cloche" />{actif && <span className="lg-notif-point" />}
        </button>
      )}
      {ouvert && <Feuille titre={titre} onFermer={() => setOuvert(false)}>{panneau}</Feuille>}
    </>
  );
}
