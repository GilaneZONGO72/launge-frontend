import { useMemo } from "react";
import Ico from "./IconeGerant";
import { alertesStock, fcfa, resumer } from "./calculs";

const jourSemaine = (d) => d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");

export default function Dashboard({ gerant, menu, stats, nbEnCours, allerCuisine }) {
  const r = useMemo(() => resumer(stats, menu), [stats, menu]);
  const alertes = useMemo(() => alertesStock(menu), [menu]);
  const maxJour = Math.max(1, ...r.sept.map((j) => j.ca));
  const maxTop = r.top.length ? r.top[0].qte : 1;
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="lg-pile">
      <div>
        <div className="lg-legende" style={{ textTransform: "capitalize" }}>{date}</div>
        <h1 className="lg-titre lg-h1" style={{ marginTop: 2 }}>Bonjour, {gerant && gerant.nom}</h1>
      </div>

      <button className="lg-attente" onClick={allerCuisine}>
        <span className="lg-attente-nb">{nbEnCours}</span>
        <span style={{ flex: 1, textAlign: "left" }}>
          <strong>{nbEnCours === 0 ? "Aucune commande en attente" : nbEnCours === 1 ? "1 commande en cours" : `${nbEnCours} commandes en cours`}</strong>
          <span className="lg-attente-sous">Ouvrir la cuisine</span>
        </span>
        <Ico nom="flamme" taille={22} />
      </button>

      <div className="lg-kpis">
        <div className="lg-kpi lg-kpi-fort"><span>Aujourd'hui</span><strong>{fcfa(r.aujourdhui.ca)}<small>FCFA</small></strong></div>
        <div className="lg-kpi"><span>Commandes aujourd'hui</span><strong>{r.aujourdhui.nb}</strong></div>
        <div className="lg-kpi"><span>30 derniers jours</span><strong>{fcfa(r.ca)}<small>FCFA</small></strong></div>
        <div className="lg-kpi"><span>Panier moyen</span><strong>{fcfa(r.panierMoyen)}<small>FCFA</small></strong></div>
      </div>

      <section className="lg-bloc" aria-label="Chiffre d'affaires des 7 derniers jours">
        <h2 className="lg-bloc-titre"><Ico nom="graphique" taille={18} /> Les 7 derniers jours</h2>
        <div className="lg-barres" role="list">
          {r.sept.map((j) => (
            <div key={j.cle} className="lg-barre-col" role="listitem" title={`${jourSemaine(j.date)} : ${fcfa(j.ca)} FCFA, ${j.nb} commande${j.nb > 1 ? "s" : ""}`}>
              <span className="lg-barre-val">{j.ca > 0 ? (j.ca >= 1000 ? `${Math.round(j.ca / 100) / 10}k` : j.ca) : ""}</span>
              <div className="lg-barre-piste"><div className="lg-barre" style={{ height: `${Math.max(j.ca > 0 ? 6 : 0, Math.round((j.ca / maxJour) * 100))}%` }} /></div>
              <span className="lg-barre-jour">{jourSemaine(j.date)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lg-bloc">
        <h2 className="lg-bloc-titre">Stock à surveiller</h2>
        {alertes.length === 0 ? (
          <span className="lg-badge lg-badge-vert">Tout est en stock</span>
        ) : alertes.map((i) => (
          <div className="lg-rang" key={i.id}>
            <span style={{ fontSize: 22 }}>{i.emoji || "🍽️"}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{i.nom}</span>
            <span className={`lg-badge ${i.stock <= 0 ? "lg-badge-rouge" : "lg-badge-orange"}`}>{i.stock <= 0 ? "Épuisé" : `${i.stock} restants`}</span>
          </div>
        ))}
      </section>

      <section className="lg-bloc">
        <h2 className="lg-bloc-titre">Plats les plus vendus</h2>
        {r.top.length === 0 && <p className="lg-legende">Pas encore de ventes sur 30 jours.</p>}
        {r.top.slice(0, 5).map((t, i) => (
          <div className="lg-top" key={t.nom}>
            <span className="lg-top-rang" data-premier={i === 0}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontWeight: 600 }}>{t.nom}</span>
                <span className="lg-top-qte">{t.qte}×</span>
              </div>
              <div className="lg-jauge"><div style={{ width: `${Math.round((t.qte / maxTop) * 100)}%` }} /></div>
            </div>
          </div>
        ))}
      </section>

      <section className="lg-bloc">
        <h2 className="lg-bloc-titre">Historique par jour</h2>
        {r.jours.length === 0 && <p className="lg-legende">Aucune donnée pour le moment.</p>}
        {r.jours.slice(0, 14).map((j) => (
          <details className="lg-jour" key={j.cle}>
            <summary>
              <span style={{ flex: 1, textTransform: "capitalize" }}>{j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
              <span className="lg-legende">{j.nb} cmd</span>
              <strong>{fcfa(j.ca)} F</strong>
            </summary>
            {[["Plats", j.plats], ["Boissons", j.boissons]].filter(([, l]) => l.length).map(([titre, liste]) => (
              <div key={titre} style={{ marginTop: 8 }}>
                <div className="lg-legende" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>{titre}</div>
                {liste.map((e) => <div className="lg-ligne" key={e.nom}><span className="lg-ligne-nom">{e.nom}</span><span className="lg-ligne-qte">{e.qte}×</span></div>)}
              </div>
            ))}
          </details>
        ))}
      </section>
    </div>
  );
}
