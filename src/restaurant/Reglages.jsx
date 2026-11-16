import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Ico from "./IconeGerant";
import { Champ, Interrupteur } from "./Champs";
import Profil from "./Profil";
export default function Reglages({ gerant, recrutement, setRecrutement, sauvegarderRecrutement, codeCuisine, nouveauCodeCuisine, setNouveauCodeCuisine, sauvegarderCodeCuisine, nbTables, setNbTables, lienQR, onQuitter }) {
  const [voirCode, setVoirCode] = useState(false);
  return (
    <div className="lg-pile">
      <h1 className="lg-titre lg-h1">Réglages</h1>
       <Profil gerant={gerant} /> 

      <section className="lg-bloc">
        <h2 className="lg-bloc-titre"><Ico nom="flamme" taille={18} /> Accès cuisine</h2>
        <p className="lg-legende" style={{ marginBottom: 12 }}>Ce code permet à votre cuisinier d'ouvrir uniquement la vue cuisine, sans voir vos chiffres.</p>
        <div className="lg-codes">
          <div><span className="lg-legende">Code restaurant</span><strong className="lg-code">{gerant && gerant.code_unique}</strong></div>
          <div>
            <span className="lg-legende">Code cuisine</span>
            <strong className="lg-code">{codeCuisine ? (voirCode ? codeCuisine : "••••") : "Non défini"}</strong>
            {codeCuisine && <button className="lg-lien-bouton" onClick={() => setVoirCode((v) => !v)}><Ico nom="oeil" taille={14} /> {voirCode ? "Masquer" : "Afficher"}</button>}
          </div>
        </div>
        <Champ label="Nouveau code cuisine" aide="4 caractères minimum.">
          <input className="lg-input" value={nouveauCodeCuisine} onChange={(e) => setNouveauCodeCuisine(e.target.value)} placeholder="Ex : 4321" />
        </Champ>
        <button className="lg-btn lg-btn-nuit lg-pleine" style={{ marginTop: 12 }} onClick={sauvegarderCodeCuisine}>Enregistrer le code</button>
      </section>

      <section className="lg-bloc">
        <h2 className="lg-bloc-titre"><Ico nom="mallette" taille={18} /> Recrutement</h2>
        <div className="lg-ligne-inter">
          <span><strong>Afficher « Nous recrutons »</strong><span className="lg-champ-aide">Visible par vos clients sur le menu.</span></span>
          <Interrupteur actif={Boolean(recrutement.actif)} onChange={(v) => setRecrutement({ ...recrutement, actif: v })} label="Recrutement actif" />
        </div>
        {recrutement.actif && (
          <div className="lg-form" style={{ marginTop: 14 }}>
            <Champ label="Poste recherché"><input className="lg-input" value={recrutement.poste || ""} onChange={(e) => setRecrutement({ ...recrutement, poste: e.target.value })} placeholder="Ex : Serveur, cuisinier…" /></Champ>
            <Champ label="Contact"><input className="lg-input" value={recrutement.contact || ""} onChange={(e) => setRecrutement({ ...recrutement, contact: e.target.value })} placeholder="Téléphone ou email" /></Champ>
            <Champ label="Conditions"><textarea className="lg-input lg-zone" rows={3} value={recrutement.conditions || ""} onChange={(e) => setRecrutement({ ...recrutement, conditions: e.target.value })} placeholder="Expérience, horaires, salaire…" /></Champ>
          </div>
        )}
        <button className="lg-btn lg-btn-nuit lg-pleine" style={{ marginTop: 14 }} onClick={sauvegarderRecrutement}>Enregistrer</button>
      </section>

      <section className="lg-bloc">
        <h2 className="lg-bloc-titre"><Ico nom="qr" taille={18} /> QR codes des tables</h2>
        <div className="lg-pas-tables">
          <span>Nombre de tables</span>
          <div className="lg-pas lg-pas-clair" role="group" aria-label="Nombre de tables">
            <button onClick={() => setNbTables((n) => Math.max(1, n - 1))} aria-label="Une table de moins"><Ico nom="moins" taille={18} /></button>
            <span>{nbTables}</span>
            <button onClick={() => setNbTables((n) => Math.min(100, n + 1))} aria-label="Une table de plus"><Ico nom="plus" taille={18} /></button>
          </div>
        </div>
        <div className="lg-qr-grille">
          {Array.from({ length: nbTables }, (_, i) => i + 1).map((t) => (
            <figure className="lg-qr" key={t}>
              <QRCodeSVG value={lienQR(t)} size={132} bgColor="#ffffff" fgColor="#111827" />
              <figcaption>Table {t}</figcaption>
            </figure>
          ))}
        </div>
        <button className="lg-btn lg-pleine lg-clair" style={{ marginTop: 14 }} onClick={() => window.print()}><Ico nom="imprimante" taille={18} /> Imprimer les QR codes</button>
      </section>

      <button className="lg-btn lg-danger lg-pleine" onClick={onQuitter}><Ico nom="deconnexion" taille={18} /> Se déconnecter</button>
    </div>
  );
}
