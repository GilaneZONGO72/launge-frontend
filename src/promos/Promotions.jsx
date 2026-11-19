import { useCallback, useEffect, useState } from "react";
import { Feuille, Champ } from "../restaurant/Champs";
import Confirmation from "../admin/Confirmation";
import Ico from "./IconesPromos";
import { appel } from "../stock/api";
import { ETATS, dateCourte, entierPositif, etatPromo, fcfa, libelleRemise } from "./outils";

const VIDE = { code: "", type: "pourcent", valeur: "", min_commande: "", max_usages: "", debut: "", fin: "" };

function FormPromo({ restaurantId, onFermer, onCree }) {
  const [b, setB] = useState(VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const maj = (k, v) => { setB((x) => ({ ...x, [k]: v })); setErreur(""); };
  const enregistrer = async () => {
    if (envoi) return;
    const valeur = entierPositif(b.valeur);
    if (!b.code.trim()) return setErreur("Saisissez un code (par exemple BIENVENUE).");
    if (!valeur) return setErreur(b.type === "pourcent" ? "Saisissez un pourcentage entre 1 et 100." : "Saisissez un montant en FCFA.");
    setEnvoi(true);
    try {
      const d = await appel(`/api/promotions/${restaurantId}`, { method: "POST", body: JSON.stringify({ ...b, code: b.code.trim().toUpperCase(), valeur }) });
      onCree(d);
    } catch (e) { setErreur(e.message); setEnvoi(false); }
  };
  return (
    <Feuille titre="Nouveau code promo" onFermer={onFermer}>
      <div className="lg-form">
        <Champ label="Code" aide="Lettres, chiffres et tirets. Le client le saisit au paiement.">
          <input className="lg-input" value={b.code} maxLength={20} autoCapitalize="characters" placeholder="BIENVENUE" onChange={(e) => maj("code", e.target.value.toUpperCase())} />
        </Champ>
        <div className="lg-bascule" role="radiogroup" aria-label="Type de réduction">
          <button type="button" role="radio" aria-checked={b.type === "pourcent"} className="lg-chip" aria-pressed={b.type === "pourcent"} onClick={() => maj("type", "pourcent")}>Pourcentage</button>
          <button type="button" role="radio" aria-checked={b.type === "montant"} className="lg-chip" aria-pressed={b.type === "montant"} onClick={() => maj("type", "montant")}>Montant fixe</button>
        </div>
        <Champ label={b.type === "pourcent" ? "Réduction (%)" : "Réduction (FCFA)"}>
          <input className="lg-input" type="number" inputMode="numeric" min="1" value={b.valeur} placeholder={b.type === "pourcent" ? "10" : "1000"} onChange={(e) => maj("valeur", e.target.value)} />
        </Champ>
        <div className="lg-form-duo">
          <Champ label="Commande minimum (FCFA)"><input className="lg-input" type="number" inputMode="numeric" min="0" value={b.min_commande} placeholder="Aucun" onChange={(e) => maj("min_commande", e.target.value)} /></Champ>
          <Champ label="Utilisations maximum"><input className="lg-input" type="number" inputMode="numeric" min="1" value={b.max_usages} placeholder="Illimité" onChange={(e) => maj("max_usages", e.target.value)} /></Champ>
        </div>
        <div className="lg-form-duo">
          <Champ label="Début"><input className="lg-input" type="date" value={b.debut} onChange={(e) => maj("debut", e.target.value)} /></Champ>
          <Champ label="Fin (inclus)"><input className="lg-input" type="date" value={b.fin} onChange={(e) => maj("fin", e.target.value)} /></Champ>
        </div>
        {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}
        <button type="button" className="lg-btn lg-btn-orange lg-pleine" disabled={envoi} onClick={enregistrer}>{envoi ? "Enregistrement…" : "Créer le code"}</button>
      </div>
    </Feuille>
  );
}

export default function Promotions({ gerant }) {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const [creer, setCreer] = useState(false);
  const [suppr, setSuppr] = useState(null);
  const [occupe, setOccupe] = useState(false);
  const [erreurAction, setErreurAction] = useState("");

  const charger = useCallback(async () => {
    setErreur("");
    try { const d = await appel(`/api/promotions/${gerant.id}`); setListe(Array.isArray(d) ? d : []); }
    catch { setErreur("Impossible de charger les promotions. Vérifiez que les tables ont bien été créées."); }
  }, [gerant.id]);
  useEffect(() => { charger(); }, [charger]);

  const basculer = async (p) => {
    try { const d = await appel(`/api/promotions/${gerant.id}/${p.id}`, { method: "PUT", body: JSON.stringify({ actif: !p.actif }) }); setListe((l) => l.map((x) => (x.id === d.id ? d : x))); }
    catch (e) { setErreur(e.message); }
  };
  const supprimer = async () => {
    setOccupe(true); setErreurAction("");
    try { await appel(`/api/promotions/${gerant.id}/${suppr.id}`, { method: "DELETE" }); setListe((l) => l.filter((x) => x.id !== suppr.id)); setSuppr(null); }
    catch (e) { setErreurAction(e.message); }
    setOccupe(false);
  };

  return (
    <>
      <button type="button" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 50 }} onClick={() => setCreer(true)}><Ico nom="plus" taille={18} /> Nouveau code promo</button>
      {erreur && <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {erreur}</div>}
      {liste === null && !erreur && <div className="lg-legende">Chargement…</div>}
      {liste && !liste.length && <div className="lg-vide"><Ico nom="etiquette" taille={32} /><div>Aucun code promo. Créez-en un pour attirer ou remercier vos clients.</div></div>}
      {liste && liste.length > 0 && (
        <div className="lg-grille-2">
          {liste.map((p) => {
            const e = etatPromo(p);
            return (
              <div key={p.id} className="lg-promo-carte">
                <div className="lg-promo-tete"><span className="lg-promo-code">{p.code}</span><span className={`lg-badge ${ETATS[e].classe}`}>{ETATS[e].texte}</span></div>
                <div className="lg-promo-detail">
                  <strong>{libelleRemise(p)}</strong>
                  {p.min_commande > 0 && <span>dès {fcfa(p.min_commande)} FCFA</span>}
                  <span>{p.usages}{p.max_usages != null ? ` / ${p.max_usages}` : ""} utilisation{p.usages > 1 ? "s" : ""}</span>
                  {(p.debut || p.fin) && <span>{p.debut ? `du ${dateCourte(p.debut)} ` : ""}{p.fin ? `jusqu'au ${dateCourte(p.fin)}` : ""}</span>}
                </div>
                <div className="lg-promo-actions">
                  <button type="button" className="lg-btn lg-clair" onClick={() => basculer(p)}>{p.actif ? "Désactiver" : "Activer"}</button>
                  <button type="button" className="lg-btn lg-clair" onClick={() => { setErreurAction(""); setSuppr(p); }} aria-label={`Supprimer ${p.code}`}><Ico nom="corbeille" taille={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {creer && <FormPromo restaurantId={gerant.id} onFermer={() => setCreer(false)} onCree={(d) => { setListe((l) => [d, ...(l || [])]); setCreer(false); }} />}
      {suppr && <Confirmation titre="Supprimer ce code ?" texte={`Le code ${suppr.code} ne pourra plus être utilisé. Les commandes déjà passées ne changent pas.`} bouton="Supprimer" occupe={occupe} erreur={erreurAction} onConfirmer={supprimer} onAnnuler={() => setSuppr(null)} />}
    </>
  );
}
