import { useState } from "react";
import "../design/tokens.css";
import "./restaurants.css";
import Ico from "./IconesRestaurants";

// « 12 rue des Palmiers, Douala » (ou seulement la ville quand l'adresse n'est pas renseignée).
export const lieu = (r) => [r.adresse, r.ville].filter((x) => x && String(x).trim()).join(", ");

// Carte d'un restaurant : photo en haut, nom, adresse. Sans `onChoisir`, c'est un simple aperçu (non cliquable).
export default function CarteRestaurant({ resto, onChoisir, occupe = false }) {
  const [urlCassee, setUrlCassee] = useState(null);
  const photoOk = resto.image_url && urlCassee !== resto.image_url;
  const contenu = (
    <>
      <span className="lg-resto-photo">
        {photoOk
          ? <img src={resto.image_url} alt="" loading="lazy" onError={() => setUrlCassee(resto.image_url)} />
          : <span className="lg-resto-vide"><Ico nom="couverts" taille={44} /></span>}
      </span>
      <span className="lg-resto-corps">
        <span className="lg-resto-texte">
          <span className="lg-resto-nom">{resto.nom}</span>
          <span className="lg-resto-lieu"><Ico nom="lieu" taille={15} /><span>{lieu(resto) || "Adresse non renseignée"}</span></span>
        </span>
        <span className="lg-resto-fleche"><Ico nom="fleche" taille={18} /></span>
      </span>
    </>
  );
  if (typeof onChoisir !== "function") return <div className="lg-resto lg-resto-apercu">{contenu}</div>;
  return (
    <button type="button" className="lg-resto" onClick={() => onChoisir(resto)} disabled={occupe} aria-busy={occupe} aria-label={`Voir le menu de ${resto.nom}`}>
      {contenu}
    </button>
  );
}
