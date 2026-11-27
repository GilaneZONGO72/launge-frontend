import { useState } from "react";
import Icon from "../design/Icon";
import "./client.css";
import PromoPanier from "../promos/PromoPanier";
import useVitrine from "../promos/useVitrine";
import { useSessionClient } from "../compte/clientApi";

const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR");
const MODES = [
  { nom: "Orange Money", sous: "Mobile Money", icone: "mobile" },
  { nom: "MTN Mobile Money", sous: "Mobile Money", icone: "mobile" },
  { nom: "Espèces", sous: "À régler à la table", icone: "billets" },
];

export default function Paiement({ menu, panier, totalPanier, restoId, onRetour, onPayer, onCompte }) {
  const session = useSessionClient();
  const [mode, setMode] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [promo, setPromo] = useState(null); // { code, remise } vérifié par le serveur
  const [telephone, setTelephone] = useState("");
  const vitrine = useVitrine(restoId);
  const fidelite = vitrine && vitrine.fidelite && vitrine.fidelite.actif ? vitrine.fidelite : null;

  const lignes = Object.entries(panier)
    .filter(([, q]) => q > 0)
    .map(([id, qte]) => ({ id, qte, plat: menu.find((p) => p.id === id) }))
    .filter((l) => l.plat);

  const confirmer = async () => {
    if (!mode || envoi) return; // empêche les doubles envois
    setEnvoi(true);
   try { await onPayer(mode, { code_promo: promo ? promo.code : undefined, telephone: fidelite && !session ? telephone : undefined }); } finally { setEnvoi(false); }
  };

  return (
    <div className="lg-page" style={{ paddingBottom: 110 }}>
      <div className="lg-colonne">
        <header className="lg-entete">
          <button className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour au menu"><Icon nom="retour" /></button>
          <h1 className="lg-titre lg-h3" style={{ fontSize: 20 }}>Ma commande</h1>
        </header>

        <div className="lg-carte" style={{ marginTop: 12 }}>
          {lignes.length === 0 && <div className="lg-vide" style={{ padding: 16 }}>Votre panier est vide.</div>}
          {lignes.map(({ id, qte, plat }) => (
            <div className="lg-ligne" key={id}>
              <span className="lg-ligne-qte">{qte}×</span>
              <span className="lg-ligne-nom">{plat.nom}</span>
              <span className="lg-ligne-prix">{fcfa(plat.prix * qte)} FCFA</span>
            </div>
          ))}
        </div>

        {restoId && lignes.length > 0 && <PromoPanier restaurantId={restoId} lignes={lignes} applique={promo} onChange={setPromo} />}

        {fidelite &&  !session && (
          <div className="lg-promo">
            <label className="lg-champ-label" htmlFor="lg-tel-fid" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>Votre téléphone (facultatif)</label>
            <input id="lg-tel-fid" className="lg-promo-champ" style={{ width: "100%", boxSizing: "border-box", textTransform: "none", letterSpacing: 0 }} type="tel" inputMode="tel" autoComplete="tel" placeholder="6 99 00 11 22" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            <p className="lg-legende" style={{ margin: "6px 0 0" }}>Gagnez des points à chaque commande : un cadeau vous attend après {fidelite.seuil_points} points ({fidelite.fcfa_par_point > 0 ? `1 point tous les ${Number(fidelite.fcfa_par_point).toLocaleString("fr-FR")} FCFA` : ""}).</p>
          </div>
        )}

        <div className="lg-total">
          {promo && <div className="lg-total-remise"><span>Code {promo.code}</span><span>-{fcfa(promo.remise)} FCFA</span></div>}
          <div className="lg-total-etiquette">Total à régler</div>
          <div className="lg-total-montant">{fcfa(totalPanier - (promo ? promo.remise : 0))}<small>FCFA</small></div>
        </div>
        {session && (
          <p className="lg-note" style={{ textAlign: "left", margin: "12px 0 0" }}>Connecté : cette commande sera ajoutée à votre compte{fidelite ? " et vos points y seront crédités" : ""}.</p>
        )}
        {!session && onCompte && (
          <button type="button" className="lg-cp-lien" style={{ margin: "12px 0 0" }} onClick={onCompte}>Se connecter ou créer un compte (facultatif)</button>
        )}

        <h2 className="lg-section-titre">Mode de paiement</h2>

        <div className="lg-modes" role="radiogroup" aria-label="Mode de paiement">
          {MODES.map((m) => (
            <button key={m.nom} className="lg-mode" role="radio" aria-checked={mode === m.nom} onClick={() => setMode(m.nom)}>
              <span className="lg-mode-icone"><Icon nom={m.icone} taille={22} /></span>
              <span>
                <span className="lg-mode-nom" style={{ display: "block" }}>{m.nom}</span>
                <span className="lg-mode-sous">{m.sous}</span>
              </span>
              <span className="lg-mode-coche">{mode === m.nom && <Icon nom="check" taille={14} />}</span>
            </button>
          ))}
        </div>
        <p className="lg-note">Aucun compte nécessaire. Vous suivrez votre commande en direct.<br />Le paiement en ligne sera disponible prochainement.{menu.some((i) => i.prix_base != null && i.prix !== i.prix_base) && <><br />Les prix incluent 1 % de frais de service Launge.</>}</p>
      </div>

      <div className="lg-pied">
        <button className="lg-btn lg-btn-orange" disabled={!mode || envoi || lignes.length === 0} onClick={confirmer}>
          {envoi ? "Envoi en cours…" : mode ? `Confirmer la commande · ${fcfa(totalPanier - (promo ? promo.remise : 0))} FCFA` : "Choisissez un mode de paiement"}
        </button>
      </div>
    </div>
  );
}
