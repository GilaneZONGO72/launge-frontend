// Appels du stock : même règles que le reste de l'application (jeton ajouté automatiquement).
export const API = "https://launge-backend-production.up.railway.app";

export async function appel(chemin, options) {
  const res = await fetch(`${API}${chemin}`, options && options.body
    ? { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } }
    : options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const e = new Error(data.error || "Une erreur est survenue.");
    e.statut = res.status;
    throw e;
  }
  return data;
}

// Relit le menu (donc les stocks à jour) et le range dans l'état de l'application.
export async function rechargerMenu(restaurantId, setMenu) {
  const data = await appel(`/api/menu/${restaurantId}`);
  if (Array.isArray(data)) setMenu(data);
  return data;
}
