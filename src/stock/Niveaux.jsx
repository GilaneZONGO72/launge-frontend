import { useState } from "react";
import { Feuille, Champ } from "../restaurant/Champs";
import Ico from "./IconesStock";
import { appel } from "./api";
import { NIVEAUX, compterNiveaux, niveau, part, trier } from "./outils";

const entierPositif = (v) => /^\d+$/.test(String(v).trim()) ? Number(v) : null;

// Fenêtre de gestion d'un plat : réception de marchandise, correction exacte, seuil d'alerte.
function FeuillePlat({ plat, onFermer, onMaj }) {
  const [ajout, setAjout] = useState("");
  const [exact, setExact] = useState("");
  const [seuil, setSeuil] = useState(String(plat.seuil_alerte ?? 0));
  const [envoi, setEnvoi] = useState("");
  const [msg, setMsg] = useState(null);

  const lancer = async (cle, fonction, ok) => {
    setEnvoi(cle); setMsg(null);
    try { const maj = await fonction(); onMaj(maj); setMsg({ ok: true, texte: ok }); }
    catch (e) { setMsg({ ok: false, texte: e.message }); }
    setEnvoi("");
  };
  const n = niveau(plat);
  const ajouter = () => {
    const q = entierPositif(ajout);
    if (!q) return setMsg({ ok: false, texte: "Saisissez une quantité supérieure à zéro." });
    lancer("ajout", () => appel(`/api/stock/${plat.id}/ajuster`, { method: "POST", body: JSON.stringify({ delta: q }) }), `${q} ajouté${q > 1 ? "s" : ""} au stock.`).then(() => setAjout(""));
  };
  const corriger = () => {
    const q = entierPositif(exact);
    if (q === null) return setMsg({ ok: false, texte: "Saisissez la quantité réellement en stock." });
    lancer("exact", () => appel(`/api/stock/${plat.id}`, { method: "PUT", body: JSON.stringify({ stock: q }) }), "Stock corrigé.").then(() => setExact(""));
  };
  const regler = () => {
    const q = entierPositif(seuil);
    if (q === null) return setMsg({ ok: false, texte: "Saisissez un seuil (0 pour désactiver l'alerte)." });
    lancer("seuil", () => appel(`/api/menu/${plat.id}`, { method: "PUT", body: JSON.stringify({ seuil_alerte: q }) }), "Seuil d'alerte enregistré.");
  };

  return (
    <Feuille titre={plat.nom} onFermer={onFermer}>
      <div className="lg-stk-bloc">
        <div className="lg-stk-actuel"><b>{plat.stock}</b><span className={`lg-badge ${NIVEAUX[n].classe}`}>{NIVEAUX[n].texte}</span></div>
      </div>
      <div className="lg-stk-bloc">
        <h4>Réception de marchandise</h4>
        <div className="lg-stk-rang">
          <input className="lg-input" type="number" inputMode="numeric" min="1" placeholder="Quantité reçue" value={ajout} onChange={(e) => setAjout(e.target.value)} aria-label="Quantité reçue" />
          <button type="button" className="lg-btn lg-btn-orange" disabled={Boolean(envoi)} onClick={ajouter}>{envoi === "ajout" ? "…" : "Ajouter"}</button>
        </div>
      </div>
      <div className="lg-stk-bloc">
        <h4>Corriger la quantité</h4>
        <div className="lg-stk-rang">
          <input className="lg-input" type="number" inputMode="numeric" min="0" placeholder="Quantité réelle" value={exact} onChange={(e) => setExact(e.target.value)} aria-label="Quantité réelle" />
          <button type="button" className="lg-btn lg-clair" disabled={Boolean(envoi)} onClick={corriger}>{envoi === "exact" ? "…" : "Corriger"}</button>
        </div>
      </div>
      <div className="lg-stk-bloc">
        <Champ label="Seuil d'alerte" aide="Vous êtes prévenu quand le stock atteint ce niveau. 0 = alerte seulement à l'épuisement.">
          <div className="lg-stk-rang">
            <input className="lg-input" type="number" inputMode="numeric" min="0" value={seuil} onChange={(e) => setSeuil(e.target.value)} />
            <button type="button" className="lg-btn lg-clair" disabled={Boolean(envoi)} onClick={regler}>{envoi === "seuil" ? "…" : "Enregistrer"}</button>
          </div>
        </Champ>
      </div>
      {msg && (msg.ok
        ? <div className="lg-message-ok" role="status"><Ico nom="check" taille={18} /> {msg.texte}</div>
        : <div className="lg-bandeau" role="alert" style={{ marginTop: 0 }}><Ico nom="alerte" taille={18} /> {msg.texte}</div>)}
    </Feuille>
  );
}

export default function Niveaux({ menu, setMenu }) {
  const [ouvert, setOuvert] = useState(null);
  const c = compterNiveaux(menu);
  const plat = ouvert && menu.find((p) => p.id === ouvert);
  const remplacer = (maj) => setMenu((m) => m.map((x) => (x.id === maj.id ? { ...x, ...maj } : x)));

  if (!menu.length) return <div className="lg-vide"><Ico nom="boite" taille={32} /><div>Votre menu est vide. Ajoutez d'abord des plats dans l'onglet Menu.</div></div>;
  return (
    <>
      <div className="lg-stk-resume" aria-label="Résumé des stocks">
        <div className="lg-stk-chiffre" data-t="epuise"><b>{c.epuise}</b><span>Épuisés</span></div>
        <div className="lg-stk-chiffre" data-t="bas"><b>{c.bas}</b><span>Stock bas</span></div>
        <div className="lg-stk-chiffre"><b>{c.ok}</b><span>Suffisants</span></div>
      </div>
      <div className="lg-stk-liste">
        {trier(menu).map((p) => {
          const n = niveau(p);
          return (
            <button type="button" key={p.id} className="lg-stk-ligne" data-n={n} onClick={() => setOuvert(p.id)} aria-label={`Gérer le stock de ${p.nom}`}>
              <span className="lg-stk-photo">{p.image_url ? <img src={p.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <Ico nom="couverts" taille={22} />}</span>
              <span>
                <div className="lg-stk-nom">{p.nom}</div>
                <div className="lg-stk-sous">Seuil d'alerte : {p.seuil_alerte > 0 ? p.seuil_alerte : "aucun"}</div>
                <div className="lg-stk-barre"><i style={{ width: `${part(p)}%` }} /></div>
              </span>
              <span className="lg-stk-qte"><b>{p.stock}</b><span className={`lg-badge ${NIVEAUX[n].classe}`}>{NIVEAUX[n].texte}</span></span>
            </button>
          );
        })}
      </div>
      {plat && <FeuillePlat plat={plat} onFermer={() => setOuvert(null)} onMaj={remplacer} />}
    </>
  );
}
