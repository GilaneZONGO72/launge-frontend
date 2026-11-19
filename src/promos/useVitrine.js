import { useEffect, useState } from "react";
import { appel } from "../stock/api";

// Note moyenne et programme de fidélité d'un restaurant (public). Reste null tant que ce n'est pas chargé ou si ça échoue.
export default function useVitrine(restaurantId) {
  const [vitrine, setVitrine] = useState(null);
  useEffect(() => {
    if (!restaurantId) return undefined;
    let actif = true;
    appel(`/api/restaurants/${restaurantId}/vitrine`).then((d) => { if (actif) setVitrine(d); }).catch(() => {});
    return () => { actif = false; };
  }, [restaurantId]);
  return vitrine;
}
