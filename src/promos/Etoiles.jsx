import Ico from "./IconesPromos";

// Note affichée (lecture seule) : étoiles pleines en orange, vides en gris.
export function Note({ valeur, taille = 16 }) {
  const arrondi = Math.round(Number(valeur) || 0);
  return (
    <span className="lg-etoiles" role="img" aria-label={`Note : ${valeur} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className="lg-etoile" data-pleine={i <= arrondi}><Ico nom="etoile" taille={taille} /></span>)}
    </span>
  );
}

// Choix de la note par le client : 5 boutons accessibles au clavier.
export function ChoixNote({ valeur, onChange }) {
  return (
    <div className="lg-etoiles lg-etoiles-choix" role="radiogroup" aria-label="Votre note">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={valeur === i} aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
          className="lg-etoile" data-pleine={i <= valeur} onClick={() => onChange(i)}>
          <Ico nom="etoile" taille={34} />
        </button>
      ))}
    </div>
  );
}
