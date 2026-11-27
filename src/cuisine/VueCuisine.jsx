import { useEffect, useState } from "react";
import "../design/tokens.css";
import "../client/client.css";
import "../restaurant/restaurant.css";
import "./cuisine.css";
import Ico from "./IconesCuisine";
import TableauCuisine from "./TableauCuisine";
import BoutonNotifications from "../notifications/BoutonNotifications";

// Écran du cuisinier (connecté avec le code cuisine) : le tableau en plein écran.
export default function VueCuisine({ restaurant, commandes, audioRef, onQuitter }) {
  const [muet, setMuet] = useState(false);

  useEffect(() => { if (audioRef && audioRef.current) audioRef.current.muted = muet; }, [muet, audioRef]);

  // Garde l'écran allumé pendant le service (tablette de cuisine).
  useEffect(() => {
    let verrou = null;
    const demander = async () => {
      try { if (navigator.wakeLock && !document.hidden) verrou = await navigator.wakeLock.request("screen"); } catch { /* non pris en charge : ignoré */ }
    };
    const retour = () => { if (!document.hidden) demander(); };
    demander();
    document.addEventListener("visibilitychange", retour);
    return () => {
      document.removeEventListener("visibilitychange", retour);
      try { if (verrou) verrou.release(); } catch { /* ignoré */ }
    };
  }, []);

  return (
    <div className="lg-page lg-cuisine">
      <audio ref={audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />
      <header className="lg-cuisine-haut">
        <span className="lg-cuisine-logo"><Ico nom="chef" taille={22} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lg-cuisine-nom">{restaurant && restaurant.nom}</div>
          <div className="lg-cuisine-sous"><span className="lg-point" /> Mise à jour automatique</div>
        </div>
        <button className="lg-cuisine-btn" aria-pressed={muet} aria-label={muet ? "Activer le son des nouvelles commandes" : "Couper le son"} onClick={() => setMuet((m) => !m)}>
          <Ico nom={muet ? "sourdine" : "son"} />
        </button>
        <BoutonNotifications variante="icone" classe="lg-cuisine-btn" titre="Notifications de commandes" texte="Soyez prévenu sur cet appareil à chaque nouvelle commande, même quand l'écran est éteint." cible={{ id: "equipe", chemin: "/api/push/equipe" }} />
        <button className="lg-cuisine-btn" aria-label="Se déconnecter" onClick={onQuitter}><Ico nom="deconnexion" /></button>
      </header>
      <main className="lg-cuisine-contenu"><TableauCuisine commandes={commandes} /></main>
    </div>
  );
}
