import { useEffect, useState } from "react";
import { Champ, Interrupteur } from "../restaurant/Champs";
import Ico from "./IconesPromos";
import { appel } from "../stock/api";
import { entierPositif, fcfa } from "./outils";

export default function Fidelite({ gerant }) {
  const [cfg, setCfg] = useState(null);
  const [b, setB] = useState(null);
  const [erreur, setErreur] = useState("");
  const [msg, setMsg] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    appel(`/api/fidelite/${gerant.id}`)
      .then((d) => { setCfg(d); setB({ actif: d.actif, fcfa_par_point: String(d.fcfa_par_point), seuil_points: String(d.seuil_points), valeur_recompense: String(d.valeur_recompense) }); })
      .catch(() => setErreur("Impossible de charger la fidélité. Vérifiez que les tables ont bien été créées."));
  }, [gerant.id]);

  if (erreur && !b) return <div className="lg-vide" role="alert"><Ico nom="alerte" taille={32} /><div>{erreur}</div></div>;
  if (!b) return <div className="lg-legende">Chargement…</div>;

  const maj = (k, v) => { setB((x) => ({ ...x, [k]: v })); setMsg(""); setErreur(""); };
  const f = entierPositif(b.fcfa_par_point), s = entierPositif(b.seuil_points), v = entierPositif(b.valeur_recompense);
  const enregistrer = async () => {
    if (!f || f < 100 || !s || !v || v < 100) return setErreur("Renseignez des valeurs valides (au moins 100 FCFA).");
    setEnvoi(true); setErreur(""); setMsg("");
    try { const d = await appel(`/api/fidelite/${gerant.id}`, { method: "PUT", body: JSON.stringify({ actif: b.actif, fcfa_par_point: f, seuil_points: s, valeur_recompense: v }) }); setCfg((c) => ({ ...c, ...d })); setMsg("Programme enregistré."); }
    catch (e) { setErreur(e.message); }
    setEnvoi(false);
  };
  return (
    <>
      <div className="lg-bloc">
        <h2 className="lg-bloc-titre"><Ico nom="cadeau" taille={18} /> Programme de fidélité</h2>
        <p className="lg-legende" style={{ marginBottom: 14 }}>Vos clients laissent leur numéro de téléphone au paiement. Chaque commande servie leur rapporte des points ; au seuil, ils reçoivent un code cadeau à utiliser sur leur prochaine commande.</p>
        <div className="lg-ligne-inter" style={{ marginBottom: 14 }}>
          <span><strong>Activer la fidélité</strong><span className="lg-champ-aide">Le champ téléphone apparaît au paiement.</span></span>
          <Interrupteur actif={b.actif} onChange={(x) => maj("actif", x)} label="Activer la fidélité" />
        </div>
        <div className="lg-form">
          <Champ label="1 point gagné tous les (FCFA)"><input className="lg-input" type="number" inputMode="numeric" min="100" value={b.fcfa_par_point} onChange={(e) => maj("fcfa_par_point", e.target.value)} /></Champ>
          <div className="lg-form-duo">
            <Champ label="Points pour un cadeau"><input className="lg-input" type="number" inputMode="numeric" min="1" value={b.seuil_points} onChange={(e) => maj("seuil_points", e.target.value)} /></Champ>
            <Champ label="Valeur du cadeau (FCFA)"><input className="lg-input" type="number" inputMode="numeric" min="100" value={b.valeur_recompense} onChange={(e) => maj("valeur_recompense", e.target.value)} /></Champ>
          </div>
          {f && s && v && <div className="lg-fid-apercu">Un client qui dépense {fcfa(f * s)} FCFA reçoit un cadeau de {fcfa(v)} FCFA, soit {Math.round((v / (f * s)) * 100)} % de ses dépenses.</div>}
          {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}
          {msg && <div className="lg-message-ok" role="status"><Ico nom="check" taille={18} /> {msg}</div>}
          <button type="button" className="lg-btn lg-btn-orange lg-pleine" disabled={envoi} onClick={enregistrer}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </div>
      <div className="lg-legende">{cfg && cfg.nb_clients > 0 ? `${cfg.nb_clients} client${cfg.nb_clients > 1 ? "s" : ""} dans le programme.` : "Aucun client dans le programme pour le moment."}</div>
    </>
  );
}
