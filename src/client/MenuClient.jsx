import { useMemo, useState } from "react";
import Icon from "../design/Icon";

const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR");

function PhotoPlat({ plat }) {
  const [erreur, setErreur] = useState(false);
  if (plat.image_url && !erreur) {
    return <img src={plat.image_url} alt={plat.nom} loading="lazy" onError={() => setErreur(true)} />;
  }
  return <span className="lg-plat-emoji" aria-hidden="true">{plat.emoji || "🍽️"}</span>;
}

function CartePlat({ plat, quantite, onModifier }) {
  const epuise = plat.stock <= 0;
  const indispo = plat.disponible === false;
  const bloque = epuise || indispo;
  const bientotEpuise = !bloque && plat.seuil_alerte > 0 && plat.stock <= plat.seuil_alerte;
  return (
    <article className="lg-plat" data-indispo={bloque}>
      <div className="lg-plat-photo">
        <PhotoPlat plat={plat} />
        <div className="lg-plat-badges">
          {indispo && <span className="lg-badge lg-badge-rouge">Indisponible</span>}
          {!indispo && epuise && <span className="lg-badge lg-badge-rouge">Épuisé</span>}
          {bientotEpuise && <span className="lg-badge lg-badge-orange">Plus que {plat.stock}</span>}
        </div>
        {!bloque && (
          <div className="lg-plat-action">
            {quantite === 0 ? (
              <button className="lg-ajout" onClick={() => onModifier(plat.id, 1)} aria-label={`Ajouter ${plat.nom}`}>
                <Icon nom="plus" taille={22} />
              </button>
            ) : (
              <div className="lg-pas" role="group" aria-label={`Quantité de ${plat.nom}`}>
                <button onClick={() => onModifier(plat.id, -1)} aria-label="Retirer un"><Icon nom="moins" taille={18} /></button>
                <span aria-live="polite">{quantite}</span>
                <button onClick={() => onModifier(plat.id, 1)} aria-label="Ajouter un"><Icon nom="plus" taille={18} /></button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="lg-plat-corps">
        <h3 className="lg-plat-nom">{plat.nom}</h3>
        {plat.categorie && <span className="lg-plat-cat">{plat.categorie}</span>}
        <div className="lg-prix">{fcfa(plat.prix)}<small>FCFA</small></div>
      </div>
    </article>
  );
}

export default function MenuClient({ menu, panier, modifier, totalPanier, restoInfo, numeroTable, onRetour, onCommander }) {
  const [categorie, setCategorie] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  const categories = useMemo(() => {
    const vues = [];
    for (const p of menu) if (p.categorie && !vues.includes(p.categorie)) vues.push(p.categorie);
    return ["Tous", ...vues];
  }, [menu]);

  const plats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return menu.filter((p) =>
      (categorie === "Tous" || p.categorie === categorie) && (!q || (p.nom || "").toLowerCase().includes(q)));
  }, [menu, categorie, recherche]);

  const nbArticles = Object.values(panier).reduce((a, n) => a + n, 0);
  const recrutement = restoInfo && restoInfo.recrutement;
  const chargement = !restoInfo;

  return (
    <div className="lg-page" style={{ paddingBottom: nbArticles > 0 ? 100 : 32 }}>
      <div className="lg-colonne">
        <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0 8px" }}>
          <button className="lg-btn lg-btn-rond" onClick={onRetour} aria-label="Retour"><Icon nom="retour" /></button>
          <div style={{ minWidth: 0 }}>
            <div className="lg-legende" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon nom="table" taille={14} /> Table {numeroTable}
            </div>
            <div className="lg-titre lg-h3" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {restoInfo ? restoInfo.nom : "Chargement…"}
            </div>
          </div>
        </header>

        <h1 className="lg-titre lg-h1" style={{ margin: "12px 0 16px" }}>Que souhaitez-vous<br />commander&nbsp;?</h1>

        <div className="lg-recherche">
          <Icon nom="recherche" taille={18} />
          <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un plat ou une boisson" aria-label="Rechercher dans le menu" />
        </div>

        {categories.length > 2 && (
          <div className="lg-chips" role="group" aria-label="Catégories" style={{ marginTop: 14 }}>
            {categories.map((c) => (
              <button key={c} className="lg-chip" aria-pressed={categorie === c} onClick={() => setCategorie(c)}>{c}</button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          {chargement ? (
            <div className="lg-grille">{[0, 1, 2, 3].map((i) => <div key={i} className="lg-squelette" />)}</div>
          ) : plats.length === 0 ? (
            <div className="lg-vide">
              <Icon nom="couverts" taille={32} />
              <div>{menu.length === 0 ? "Le menu n'est pas encore disponible." : "Aucun résultat pour cette recherche."}</div>
            </div>
          ) : (
            <div className="lg-grille">
              {plats.map((p) => <CartePlat key={p.id} plat={p} quantite={panier[p.id] || 0} onModifier={modifier} />)}
            </div>
          )}
        </div>

        {recrutement && recrutement.actif && (
          <section className="lg-carte" style={{ marginTop: 28 }} aria-label="Recrutement">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span className="lg-badge lg-badge-orange" style={{ padding: 8 }}><Icon nom="mallette" taille={18} /></span>
              <h2 className="lg-titre lg-h3" style={{ margin: 0, fontSize: 18 }}>Nous recrutons</h2>
            </div>
            {[["Poste recherché", recrutement.poste], ["Conditions", recrutement.conditions], ["Contact", recrutement.contact]]
              .filter(([, v]) => v).map(([l, v]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <div className="lg-legende" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>{l}</div>
                  <div style={{ fontWeight: l === "Contact" ? 700 : 400, color: l === "Contact" ? "#c4521f" : "var(--lg-texte)" }}>{v}</div>
                </div>
              ))}
          </section>
        )}
      </div>

      {nbArticles > 0 && (
        <div className="lg-panier">
          <button className="lg-panier-btn" onClick={onCommander} aria-label={`Voir ma commande, ${nbArticles} article${nbArticles > 1 ? "s" : ""}`}>
            <span className="lg-panier-nb">{nbArticles}</span>
            <span>Voir ma commande</span>
            <span className="lg-panier-total">{fcfa(totalPanier)}<small>FCFA</small></span>
          </button>
        </div>
      )}
    </div>
  );
}
