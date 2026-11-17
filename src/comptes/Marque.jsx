import "../design/tokens.css";
import "./comptes.css";
import Ico from "./IconesComptes";

// Logo Launge : pastille orange avec une cloche de service, suivie du nom écrit en entier.
export default function Marque({ taille = 40, clair = false, nom = true }) {
  return (
    <span className={`lg-marque${clair ? " lg-marque-clair" : ""}`} aria-label="Launge">
      <span className="lg-marque-logo" style={{ width: taille, height: taille, borderRadius: taille * 0.3 }}><Ico nom="cloche" taille={taille * 0.58} /></span>
      {nom && <span className="lg-marque-nom" style={{ fontSize: taille * 0.6 }}>Launge</span>}
    </span>
  );
}
