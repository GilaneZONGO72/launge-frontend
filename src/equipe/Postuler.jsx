import { useState } from "react";
import { Feuille, Champ } from "../restaurant/Champs";
import Ico from "./IconesEquipe";
import { appel } from "../stock/api";

// Bouton « Postuler » du menu client : un formulaire court, sans compte.
export default function Postuler({ restaurantId, poste }) {
  const [ouvert, setOuvert] = useState(false);
  const [b, setB] = useState({ nom: "", telephone: "", message: "" });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fini, setFini] = useState(false);
  const maj = (k, v) => { setB((x) => ({ ...x, [k]: v })); setErreur(""); };

  const envoyer = async () => {
    if (envoi) return;
    if (b.nom.trim().length < 2) return setErreur("Saisissez votre nom.");
    if (b.telephone.replace(/\D/g, "").length < 8) return setErreur("Saisissez un numéro de téléphone valide.");
    setEnvoi(true); setErreur("");
    try { await appel(`/api/restaurants/${restaurantId}/candidatures`, { method: "POST", body: JSON.stringify(b) }); setFini(true); }
    catch (e) { setErreur(e.message); }
    setEnvoi(false);
  };

  return (
    <>
      <button type="button" className="lg-btn lg-btn-nuit" style={{ width: "100%", marginTop: 4 }} onClick={() => setOuvert(true)}><Ico nom="mallette" taille={18} /> Postuler</button>
      {ouvert && (
        <Feuille titre={poste ? `Postuler : ${poste}` : "Postuler"} onFermer={() => setOuvert(false)}>
          {fini ? (
            <div className="lg-pile">
              <div className="lg-message-ok" role="status"><Ico nom="check" taille={18} /> Candidature envoyée. Le restaurant vous contactera.</div>
              <button type="button" className="lg-btn lg-btn-nuit lg-pleine" onClick={() => setOuvert(false)}>Fermer</button>
            </div>
          ) : (
            <div className="lg-form">
              <Champ label="Votre nom"><input className="lg-input" value={b.nom} maxLength={80} autoComplete="name" onChange={(e) => maj("nom", e.target.value)} /></Champ>
              <Champ label="Votre téléphone" aide="Le restaurant vous appellera sur ce numéro."><input className="lg-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="6 99 00 11 22" value={b.telephone} onChange={(e) => maj("telephone", e.target.value)} /></Champ>
              <Champ label="Message (facultatif)"><textarea className="lg-input lg-zone" rows={3} maxLength={800} placeholder="Votre expérience, vos disponibilités…" value={b.message} onChange={(e) => maj("message", e.target.value)} /></Champ>
              {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}
              <button type="button" className="lg-btn lg-btn-orange lg-pleine" disabled={envoi} onClick={envoyer}>{envoi ? "Envoi…" : "Envoyer ma candidature"}</button>
            </div>
          )}
        </Feuille>
      )}
    </>
  );
}
