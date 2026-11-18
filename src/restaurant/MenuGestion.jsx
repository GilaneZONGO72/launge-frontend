import { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import Ico from "./IconeGerant";
import { Champ, Feuille, Interrupteur } from "./Champs";
import { fcfa } from "./calculs";

const API = "https://launge-backend-production.up.railway.app";
const VIDE = { nom: "", prix: "", categorie: "Plats", stock: "", seuil_alerte: "", image_url: "", disponible: true };
const CATEGORIES_SUGGEREES = ["Plats", "Boissons", "Entrées", "Desserts"];

async function appel(url, options) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

function FormulairePlat({ initial, gerantId, categories, onFermer, onEnregistre, onRetire }) {
  const edition = Boolean(initial && initial.id);
  const [b, setB] = useState({ ...VIDE, ...(initial || {}) });
  const [envoi, setEnvoi] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [erreur, setErreur] = useState("");
  const maj = (k, v) => setB((x) => ({ ...x, [k]: v }));

  const choisirPhoto = async (e) => {
    const fichier = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!fichier) return;
    setPhoto(true); setErreur("");
    const nom = `${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("plats").upload(nom, fichier, { cacheControl: "3600", upsert: false });
    if (error) setErreur(error.message); else maj("image_url", supabase.storage.from("plats").getPublicUrl(nom).data.publicUrl);
    setPhoto(false);
  };

  const enregistrer = async () => {
    if (!b.nom.trim()) return setErreur("Donnez un nom au plat.");
    if (b.prix === "" || isNaN(Number(b.prix)) || Number(b.prix) < 0) return setErreur("Indiquez un prix valide.");
    setEnvoi(true); setErreur("");
    const corps = {
      nom: b.nom.trim(), prix: Number(b.prix), categorie: (b.categorie || "Plats").trim(),
     ...(edition ? {} : { stock: b.stock === "" ? 0 : Number(b.stock) }), seuil_alerte
      image_url: b.image_url || null, disponible: b.disponible !== false,
    };
    try {
      const data = edition
        ? await appel(`${API}/api/menu/${b.id}`, { method: "PUT", body: JSON.stringify(corps) })
        : await appel(`${API}/api/menu`, { method: "POST", body: JSON.stringify({ ...corps, emoji: "", restaurant_id: gerantId }) });
      onEnregistre(data, edition);
    } catch (e) { setErreur(e.message); setEnvoi(false); }
  };

  const retirer = async () => {
    if (!window.confirm(`Retirer « ${b.nom} » du menu ?`)) return;
    setEnvoi(true);
    try { await appel(`${API}/api/menu/${b.id}`, { method: "DELETE" }); onRetire(b.id); }
    catch (e) { setErreur(e.message); setEnvoi(false); }
  };

  return (
    <Feuille titre={edition ? "Modifier le plat" : "Ajouter un plat"} onFermer={onFermer}>
      <label className="lg-photo-zone">
        {b.image_url ? <img src={b.image_url} alt="" /> : <span className="lg-photo-vide"><Ico nom="photo" taille={28} />{photo ? "Envoi de la photo…" : "Ajouter une photo"}</span>}
        {b.image_url && <span className="lg-photo-changer"><Ico nom="photo" taille={16} /> {photo ? "Envoi…" : "Changer"}</span>}
        <input type="file" accept="image/*" onChange={choisirPhoto} disabled={photo} hidden />
      </label>
      <div className="lg-form">
        <Champ label="Nom du plat"><input className="lg-input" value={b.nom} onChange={(e) => maj("nom", e.target.value)} placeholder="Ex : Ndolé spécial" autoFocus /></Champ>
        <Champ label="Prix (FCFA)"><input className="lg-input" type="number" inputMode="numeric" min="0" value={b.prix} onChange={(e) => maj("prix", e.target.value)} placeholder="2500" /></Champ>
        <Champ label="Catégorie">
          <input className="lg-input" list="lg-categories" value={b.categorie} onChange={(e) => maj("categorie", e.target.value)} />
          <datalist id="lg-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </Champ>
        <div className="lg-form-duo">
          {!edition && <Champ label="Stock de départ"><input className="lg-input" type="number" inputMode="numeric" min="0" value={b.stock} onChange={(e) => maj("stock", e.target.value)} placeholder="20" /></Champ>}
          <Champ label="Seuil d'alerte"><input className="lg-input" type="number" inputMode="numeric" min="0" value={b.seuil_alerte} onChange={(e) => maj("seuil_alerte", e.target.value)} placeholder="5" /></Champ>
        </div>
        {edition && <p className="lg-legende" style={{ margin: 0 }}>Pour changer la quantité en stock, utilisez l'onglet Stock : chaque changement y est enregistré.</p>}
   
          <span><strong>Disponible à la commande</strong><span className="lg-champ-aide">Désactivez pour masquer temporairement le plat.</span></span>
          <Interrupteur actif={b.disponible !== false} onChange={(v) => maj("disponible", v)} label="Disponible à la commande" />
        </div>
        {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}
        <button className="lg-btn lg-btn-orange lg-pleine" onClick={enregistrer} disabled={envoi || photo}>{envoi ? "Enregistrement…" : edition ? "Enregistrer" : "Ajouter au menu"}</button>
        {edition && <button className="lg-btn lg-danger lg-pleine" onClick={retirer} disabled={envoi}><Ico nom="corbeille" taille={18} /> Retirer du menu</button>}
      </div>
    </Feuille>
  );
}

export default function MenuGestion({ gerant, menu, setMenu }) {
  const [filtre, setFiltre] = useState("Toutes");
  const [recherche, setRecherche] = useState("");
  const [feuille, setFeuille] = useState(null); // null | {} (nouveau) | plat (modification)
  const [erreur, setErreur] = useState("");

  const categories = useMemo(() => [...new Set([...CATEGORIES_SUGGEREES, ...menu.map((m) => m.categorie).filter(Boolean)])], [menu]);
  const presentes = useMemo(() => ["Toutes", ...new Set(menu.map((m) => m.categorie).filter(Boolean))], [menu]);
  const plats = menu.filter((p) => (filtre === "Toutes" || p.categorie === filtre) && (!recherche.trim() || (p.nom || "").toLowerCase().includes(recherche.trim().toLowerCase())));

  const basculer = async (p) => {
    setErreur("");
    try {
      const data = await appel(`${API}/api/menu/${p.id}`, { method: "PUT", body: JSON.stringify({ disponible: p.disponible === false }) });
      setMenu((m) => m.map((x) => (x.id === data.id ? data : x)));
    } catch (e) { setErreur(e.message); }
  };

  return (
    <div className="lg-pile">
      <div className="lg-titre-ligne">
        <div><h1 className="lg-titre lg-h1">Menu</h1><div className="lg-legende">{menu.length} plat{menu.length > 1 ? "s" : ""}</div></div>
        <button className="lg-btn lg-btn-orange" onClick={() => setFeuille({})}><Ico nom="plus" taille={18} /> Ajouter</button>
      </div>
      <div className="lg-recherche"><Ico nom="recherche" taille={18} /><input type="search" placeholder="Rechercher un plat" value={recherche} onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher dans le menu" /></div>
      {presentes.length > 2 && (
        <div className="lg-chips" role="group" aria-label="Catégories">
          {presentes.map((c) => <button key={c} className="lg-chip" aria-pressed={filtre === c} onClick={() => setFiltre(c)}>{c}</button>)}
        </div>
      )}
      {erreur && <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {erreur}</div>}

      {plats.length === 0 ? (
        <div className="lg-vide"><Ico nom="couverts" taille={32} /><div>{menu.length === 0 ? "Votre menu est vide. Ajoutez votre premier plat." : "Aucun plat trouvé."}</div></div>
      ) : (
        <div className="lg-grille">
          {plats.map((p) => {
            const epuise = p.stock <= 0;
            const bas = !epuise && typeof p.seuil_alerte === "number" && p.seuil_alerte > 0 && p.stock <= p.seuil_alerte;
            return (
              <article className="lg-plat" key={p.id} data-indispo={p.disponible === false || epuise}>
                <button className="lg-plat-photo lg-plat-bouton" onClick={() => setFeuille(p)} aria-label={`Modifier ${p.nom}`}>
                  {p.image_url ? <img src={p.image_url} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <span className="lg-plat-vide"><Ico nom="couverts" taille={44} /></span>}
                  <div className="lg-plat-badges">
                    {p.disponible === false && <span className="lg-badge lg-badge-rouge">Masqué</span>}
                    {epuise && <span className="lg-badge lg-badge-rouge">Épuisé</span>}
                    {bas && <span className="lg-badge lg-badge-orange">Plus que {p.stock}</span>}
                  </div>
                  <span className="lg-plat-edit"><Ico nom="crayon" taille={16} /></span>
                </button>
                <div className="lg-plat-corps">
                  <h3 className="lg-plat-nom">{p.nom}</h3>
                  <span className="lg-plat-cat">{p.categorie} · {p.stock} en stock</span>
                  <div className="lg-prix">{fcfa(p.prix)}<small>FCFA</small></div>
                  <div className="lg-ligne-inter" style={{ marginTop: 8 }}>
                    <span className="lg-legende">Disponible</span>
                    <Interrupteur actif={p.disponible !== false} onChange={() => basculer(p)} label={`Disponibilité de ${p.nom}`} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {feuille && (
        <FormulairePlat
          initial={feuille.id ? feuille : null}
          gerantId={gerant.id}
          categories={categories}
          onFermer={() => setFeuille(null)}
          onEnregistre={(data, edition) => { setMenu((m) => (edition ? m.map((x) => (x.id === data.id ? data : x)) : [...m, data])); setFeuille(null); }}
          onRetire={(id) => { setMenu((m) => m.filter((x) => x.id !== id)); setFeuille(null); }}
        />
      )}
    </div>
  );
}
