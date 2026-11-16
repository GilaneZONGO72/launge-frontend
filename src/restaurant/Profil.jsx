import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../restaurants/restaurants.css";
import Ico from "./IconeGerant";
import { Champ } from "./Champs";
import CarteRestaurant from "../restaurants/CarteRestaurant";

const API = "https://launge-backend-production.up.railway.app";

// Profil public du restaurant : la photo et l'adresse affichées dans la liste des restaurants.
export default function Profil({ gerant }) {
  const id = gerant && gerant.id;
  const [adresse, setAdresse] = useState("");
  const [image, setImage] = useState("");
  const [charge, setCharge] = useState(false);
  const [modifie, setModifie] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, texte }

  useEffect(() => {
    if (!id) return undefined;
    let vivant = true;
    fetch(`${API}/api/restaurants/${id}/info`)
      .then((r) => r.json())
      .then((d) => {
        if (!vivant) return;
        if (d.error) throw new Error(d.error);
        setAdresse(d.adresse || ""); setImage(d.image_url || ""); setCharge(true);
      })
      .catch(() => { if (vivant) setMsg({ ok: false, texte: "Impossible de charger le profil. Rechargez la page." }); });
    return () => { vivant = false; };
  }, [id]);

  const choisirPhoto = async (e) => {
    const fichier = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!fichier) return;
    setPhoto(true); setMsg(null);
    const nom = `${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("plats").upload(nom, fichier, { cacheControl: "3600", upsert: false });
    if (error) setMsg({ ok: false, texte: error.message });
    else { setImage(supabase.storage.from("plats").getPublicUrl(nom).data.publicUrl); setModifie(true); }
    setPhoto(false);
  };

  const enregistrer = async () => {
    setEnvoi(true); setMsg(null);
    try {
      const res = await fetch(`${API}/api/restaurants/${id}/profil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adresse: adresse.trim(), image_url: image || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "Enregistrement impossible.");
      setMsg({ ok: true, texte: "Profil enregistré. Il apparaît dans la liste des restaurants." });
      setModifie(false);
    } catch (e) {
      setMsg({ ok: false, texte: e instanceof TypeError ? "Pas de connexion. Réessayez dans un instant." : e.message });
    } finally { setEnvoi(false); }
  };

  return (
    <section className="lg-bloc">
      <h2 className="lg-bloc-titre"><Ico nom="photo" taille={18} /> Profil du restaurant</h2>
      <p className="lg-legende" style={{ marginBottom: 14 }}>Cette photo et cette adresse s'affichent dans la liste des restaurants que voient vos clients.</p>

      <label className="lg-photo-zone" style={{ height: 190 }}>
        {image ? <img src={image} alt="Photo du restaurant" /> : <span className="lg-photo-vide"><Ico nom="photo" taille={28} />{photo ? "Envoi de la photo…" : "Ajouter une photo du restaurant"}</span>}
        {image && <span className="lg-photo-changer"><Ico nom="photo" taille={16} /> {photo ? "Envoi…" : "Changer"}</span>}
        <input type="file" accept="image/*" onChange={choisirPhoto} disabled={photo || !charge} hidden />
      </label>
      {image && <button type="button" className="lg-retirer-photo" onClick={() => { setImage(""); setModifie(true); }}><Ico nom="corbeille" taille={14} /> Retirer la photo</button>}

      <div className="lg-form" style={{ marginTop: 10 }}>
        <Champ label="Adresse" aide="Quartier, rue ou repère. La ville est celle de votre inscription.">
          <input className="lg-input" value={adresse} maxLength={200} disabled={!charge} onChange={(e) => { setAdresse(e.target.value); setModifie(true); }} placeholder="Ex : Rue Joss, Bonanjo" />
        </Champ>
      </div>

      <div className="lg-profil-apercu">
        <span className="lg-legende" style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>Aperçu pour vos clients</span>
        <CarteRestaurant resto={{ nom: (gerant && gerant.nom) || "Votre restaurant", ville: gerant && gerant.ville, adresse: adresse.trim(), image_url: image }} />
      </div>

      {msg && (msg.ok
        ? <div className="lg-message-ok" role="status" style={{ marginTop: 14 }}><Ico nom="check" taille={18} /> {msg.texte}</div>
        : <div className="lg-bandeau" role="alert"><Ico nom="alerte" taille={18} /> {msg.texte}</div>)}
      <button className="lg-btn lg-btn-nuit lg-pleine" style={{ marginTop: 14 }} onClick={enregistrer} disabled={envoi || photo || !charge || !modifie}>
        {envoi ? "Enregistrement…" : "Enregistrer le profil"}
      </button>
    </section>
  );
}
