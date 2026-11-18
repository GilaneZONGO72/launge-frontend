import { useCallback, useEffect, useMemo, useState } from "react";
import Ico from "./IconesStock";
import Confirmation from "../admin/Confirmation";
import { appel, rechargerMenu } from "./api";
import { dateServeur } from "../admin/outils";
import { fcfa } from "../restaurant/calculs";
import { signe } from "./outils";

const quand = (v) => { const d = dateServeur(v); return d ? d.toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""; };
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const valeur = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fcfa(Math.abs(n))} FCFA`;

function Detail({ lignes }) {
  const ecarts = lignes.filter((l) => l.ecart !== 0);
  if (!ecarts.length) return <div className="lg-legende">Aucun écart : le stock correspondait au comptage.</div>;
  return <>{ecarts.map((l) => <div key={l.plat_id}><span>{l.plat_nom} <span className="lg-legende">({l.theorique} prévu, {l.compte} compté)</span></span><strong className="lg-inv-ecart" data-s={l.ecart > 0 ? "plus" : "moins"}>{signe(l.ecart)}</strong></div>)}</>;
}

function CarteInventaire({ inv, gerantId, ouvertParDefaut = false, lignesInitiales }) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const [lignes, setLignes] = useState(lignesInitiales || null);
  const [erreur, setErreur] = useState("");
  const basculer = async () => {
    const o = !ouvert; setOuvert(o);
    if (o && !lignes) { try { const d = await appel(`/api/inventaires/${gerantId}/${inv.id}`); setLignes(d.lignes || []); } catch { setErreur("Détail indisponible."); } }
  };
  return (
    <div className="lg-inv-carte">
      <button type="button" className="lg-inv-tete" onClick={basculer} aria-expanded={ouvert}>
        <span><strong>{quand(inv.created_at)}</strong><br /><span className="lg-legende">{inv.nb_plats} plat{inv.nb_plats > 1 ? "s" : ""} compté{inv.nb_plats > 1 ? "s" : ""} · {inv.nb_ecarts} écart{inv.nb_ecarts > 1 ? "s" : ""}</span></span>
        <span className="lg-inv-ecart" data-s={inv.valeur_ecart > 0 ? "plus" : inv.valeur_ecart < 0 ? "moins" : ""}>{inv.nb_ecarts ? valeur(Number(inv.valeur_ecart)) : "Aucun écart"}</span>
      </button>
      {ouvert && <div className="lg-inv-detail">{erreur ? <span className="lg-legende">{erreur}</span> : lignes ? <Detail lignes={lignes} /> : <span className="lg-legende">Chargement…</span>}</div>}
    </div>
  );
}

// Inventaire : on compte physiquement, Launge compare au stock prévu, corrige et garde la trace des écarts.
export default function Inventaire({ gerant, menu, setMenu }) {
  const [mode, setMode] = useState("accueil"); // accueil | comptage | resultat
  const [comptes, setComptes] = useState({});
  const [recherche, setRecherche] = useState("");
  const [historique, setHistorique] = useState(null);
  const [erreurHist, setErreurHist] = useState("");
  const [confirmer, setConfirmer] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultat, setResultat] = useState(null);

  const chargerHist = useCallback(async () => {
    setErreurHist("");
    try { const d = await appel(`/api/inventaires/${gerant.id}`); setHistorique(Array.isArray(d) ? d : []); }
    catch { setErreurHist("Historique indisponible. Vérifiez que les tables d'inventaire ont bien été créées."); }
  }, [gerant.id]);
  useEffect(() => { chargerHist(); }, [chargerHist]);

  const plats = useMemo(() => [...menu].sort((a, b) => String(a.nom).localeCompare(String(b.nom), "fr")), [menu]);
  const q = norm(recherche.trim());
  const visibles = plats.filter((p) => !q || norm(p.nom).includes(q));
  const saisis = plats.filter((p) => comptes[p.id] !== undefined && comptes[p.id] !== "");
  const invalides = saisis.filter((p) => !/^\d+$/.test(comptes[p.id]));
  const ecarts = saisis.filter((p) => /^\d+$/.test(comptes[p.id]) && Number(comptes[p.id]) !== (Number(p.stock) || 0));
  const valeurEcarts = ecarts.reduce((s, p) => s + (Number(comptes[p.id]) - (Number(p.stock) || 0)) * (Number(p.prix) || 0), 0);

  const valider = async () => {
    setEnvoi(true); setErreur("");
    try {
      const inv = await appel(`/api/inventaires/${gerant.id}`, { method: "POST", body: JSON.stringify({ lignes: saisis.map((p) => ({ plat_id: p.id, compte: Number(comptes[p.id]) })) }) });
      let detail = null;
      try { detail = await appel(`/api/inventaires/${gerant.id}/${inv.id}`); } catch { /* le résumé reste affiché sans le détail */ }
      try { await rechargerMenu(gerant.id, setMenu); } catch { /* sera relu au prochain rafraîchissement */ }
      setResultat({ inv, lignes: detail ? detail.lignes : null });
      setConfirmer(false); setMode("resultat"); setComptes({}); chargerHist();
    } catch (e) { setErreur(e.message); }
    setEnvoi(false);
  };

  if (mode === "resultat" && resultat) {
    return (
      <>
        <div className="lg-message-ok" role="status"><Ico nom="check" taille={18} /> Inventaire enregistré. Le stock a été mis à jour.</div>
        <CarteInventaire inv={resultat.inv} gerantId={gerant.id} ouvertParDefaut lignesInitiales={resultat.lignes} />
        <button type="button" className="lg-btn lg-btn-nuit lg-pleine" style={{ minHeight: 50 }} onClick={() => { setResultat(null); setMode("accueil"); }}>Terminer</button>
      </>
    );
  }

  if (mode === "comptage") {
    return (
      <>
        <div className="lg-legende">Comptez ce qu'il y a réellement. Les plats que vous laissez vides ne sont pas modifiés.</div>
        <div className="lg-recherche"><Ico nom="recherche" taille={18} /><input type="search" placeholder="Rechercher un plat" value={recherche} onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher un plat" /></div>
        <div className="lg-stk-liste">
          {visibles.map((p) => {
            const v = comptes[p.id] ?? "";
            const ok = /^\d+$/.test(v);
            const e = ok ? Number(v) - (Number(p.stock) || 0) : null;
            return (
              <label key={p.id} className="lg-inv-ligne">
                <span><span className="lg-stk-nom">{p.nom}</span><span className="lg-stk-sous" style={{ display: "block" }}>Prévu : {p.stock}{e !== null && e !== 0 && <> · <span className="lg-inv-ecart" data-s={e > 0 ? "plus" : "moins"}>écart {signe(e)}</span></>}</span></span>
                <input className="lg-input" type="number" inputMode="numeric" min="0" placeholder="Compté" value={v} aria-label={`Quantité comptée de ${p.nom}`} aria-invalid={v !== "" && !ok} onChange={(ev) => setComptes((c) => ({ ...c, [p.id]: ev.target.value }))} />
              </label>
            );
          })}
        </div>
        {!visibles.length && <div className="lg-vide"><Ico nom="recherche" taille={32} /><div>Aucun plat ne correspond.</div></div>}
        <div className="lg-inv-barre">
          <span>{saisis.length} compté{saisis.length > 1 ? "s" : ""} · {ecarts.length} écart{ecarts.length > 1 ? "s" : ""}</span>
          <span style={{ display: "flex", gap: 8 }}>
            <button type="button" className="lg-btn lg-clair" onClick={() => { setMode("accueil"); setComptes({}); }}>Annuler</button>
            <button type="button" className="lg-btn lg-btn-orange" disabled={!saisis.length || invalides.length > 0} onClick={() => { setErreur(""); setConfirmer(true); }}>Valider</button>
          </span>
        </div>
        {confirmer && (
          <Confirmation
            titre="Valider l'inventaire ?"
            texte={`${saisis.length} plat${saisis.length > 1 ? "s" : ""} compté${saisis.length > 1 ? "s" : ""}, ${ecarts.length} écart${ecarts.length > 1 ? "s" : ""}${ecarts.length ? ` (${valeur(valeurEcarts)} en prix de vente)` : ""}. Le stock sera remplacé par vos comptages et l'inventaire sera conservé dans l'historique.`}
            bouton="Valider l'inventaire"
            occupe={envoi}
            erreur={erreur}
            onConfirmer={valider}
            onAnnuler={() => setConfirmer(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="lg-bloc">
        <h2 className="lg-bloc-titre"><Ico nom="inventaire" taille={18} /> Faire un inventaire</h2>
        <p className="lg-legende" style={{ marginBottom: 14 }}>Comptez vos plats en cuisine, saisissez les quantités : Launge les compare au stock prévu, corrige le stock et garde la trace de chaque écart.</p>
        <button type="button" className="lg-btn lg-btn-orange lg-pleine" style={{ minHeight: 50 }} disabled={!menu.length} onClick={() => { setComptes({}); setRecherche(""); setMode("comptage"); }}>Commencer un inventaire</button>
        {!menu.length && <p className="lg-legende" style={{ marginTop: 8 }}>Ajoutez d'abord des plats dans l'onglet Menu.</p>}
      </div>
      <h3 className="lg-titre lg-h3">Inventaires précédents</h3>
      {erreurHist ? <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {erreurHist}</div>
        : historique === null ? <div className="lg-legende">Chargement…</div>
        : !historique.length ? <div className="lg-vide"><Ico nom="inventaire" taille={32} /><div>Aucun inventaire pour le moment.</div></div>
        : <div className="lg-pile">{historique.map((i) => <CarteInventaire key={i.id} inv={i} gerantId={gerant.id} />)}</div>}
    </>
  );
}
