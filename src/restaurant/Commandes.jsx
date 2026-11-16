import { useState } from "react";
import Ico from "./IconeGerant";
import { STATUTS, fcfa, heure, jourCourt } from "./calculs";

const FILTRES = [["tout", "Toutes"], ["en_cours", "Nouvelles"], ["acceptee", "En préparation"], ["pret", "Prêtes"], ["servi", "Servies"]];
const estAujourdhui = (d) => new Date(d).toDateString() === new Date().toDateString();

export function Commandes({ commandes }) {
  const [filtre, setFiltre] = useState("tout");
  const [max, setMax] = useState(30);
  const liste = commandes.filter((c) => filtre === "tout" || c.statut === filtre);
  return (
    <div className="lg-pile">
      <div><h1 className="lg-titre lg-h1">Commandes</h1><div className="lg-legende">{commandes.length} au total</div></div>
      <div className="lg-chips" role="group" aria-label="Filtrer par statut">
        {FILTRES.map(([k, l]) => (
          <button key={k} className="lg-chip" aria-pressed={filtre === k} onClick={() => { setFiltre(k); setMax(30); }}>
            {l}{k !== "tout" && <span className="lg-chip-nb"> {commandes.filter((c) => c.statut === k).length}</span>}
          </button>
        ))}
      </div>
      {liste.length === 0 && <div className="lg-vide"><Ico nom="liste" taille={32} /><div>Aucune commande.</div></div>}
      {liste.slice(0, max).map((c) => {
        const st = STATUTS[c.statut] || { label: c.statut, classe: "" };
        return (
          <article className="lg-cmd" key={c.id}>
            <div className="lg-cmd-tete">
              <strong className="lg-titre" style={{ fontSize: 17 }}>Table {c.numero_table || "—"}</strong>
              <span className={`lg-badge ${st.classe}`} style={st.classe ? undefined : { background: "var(--lg-ivoire)", color: "var(--lg-texte-2)" }}>{st.label}</span>
              <span className="lg-legende" style={{ marginLeft: "auto" }}>{estAujourdhui(c.created_at) ? heure(c.created_at) : `${jourCourt(c.created_at)} · ${heure(c.created_at)}`}</span>
            </div>
            {(c.items || []).map((it, i) => <div className="lg-ligne" key={i}><span className="lg-ligne-qte">{it.qte}×</span><span className="lg-ligne-nom">{it.nom}</span></div>)}
            <div className="lg-cmd-pied"><span className="lg-legende">{c.mode_paiement || "—"}</span><strong>{fcfa(c.total)} FCFA</strong></div>
          </article>
        );
      })}
      {liste.length > max && <button className="lg-btn lg-btn-rond lg-pleine" style={{ width: "100%" }} onClick={() => setMax((m) => m + 30)}>Voir plus</button>}
    </div>
  );
}
