// ============================================================
//  src/supabaseClient.js — couche de compatibilité TEMPORAIRE
//  Le site ne parle plus directement à Supabase : tout passe par le
//  backend Launge (session, photos, statut des commandes, suivi).
//  App.jsx n'a pas besoin de changer. Ce fichier disparaîtra avec la refonte.
// ============================================================
const API = "https://launge-backend-production.up.railway.app";
const INTERVALLE_MS = 6000; // fréquence de mise à jour des commandes
const TAILLE_MAX_PHOTO = 1280; // px, côté le plus long
const TYPES_PHOTO = ["image/jpeg", "image/png", "image/webp"];

/* ───────────── Session : le jeton reçu à la connexion ───────────── */
let jeton = null;

if (typeof window !== "undefined" && !window.__launge_fetch) {
  window.__launge_fetch = true;
  const fetchNatif = window.fetch.bind(window);
  // Ajoute automatiquement le jeton aux appels vers le backend Launge
  // et mémorise le jeton renvoyé par les connexions.
  window.fetch = async (url, options = {}) => {
    if (typeof url !== "string" || !url.startsWith(API)) return fetchNatif(url, options);
    const headers = new Headers(options.headers || {});
    if (jeton && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${jeton}`);
    const res = await fetchNatif(url, { ...options, headers });
    if (res.ok && /\/connexion(-cuisine)?$/.test(new URL(url).pathname)) {
      try {
        const data = await res.clone().json();
        if (data && data.token) jeton = data.token;
      } catch { /* réponse sans jeton : ignoré */ }
    }
    if (res.status === 401 && jeton) jeton = null; // session expirée
    return res;
  };
}

/* ───────────── Photos des plats ───────────── */
async function reduirePhoto(fichier) {
  let image = null;
  if (typeof createImageBitmap === "function") {
    try { image = await createImageBitmap(fichier); } catch { image = null; }
  }
  if (!image) {
    if (TYPES_PHOTO.includes(fichier.type) && fichier.size <= 5 * 1024 * 1024) return fichier;
    throw new Error("Format de photo non pris en charge. Utilisez une photo JPEG ou PNG.");
  }
  const ratio = Math.min(1, TAILLE_MAX_PHOTO / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (image.close) image.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Impossible de traiter la photo.");
  return blob;
}

async function envoyerPhoto(fichier) {
  if (!jeton) throw new Error("Session expirée. Reconnectez-vous.");
  const image = await reduirePhoto(fichier);
  const res = await fetch(`${API}/api/menu/image`, {
    method: "POST",
    headers: { "Content-Type": image.type || "image/jpeg" },
    body: image,
  });
  let data = {};
  try { data = await res.json(); } catch { /* ignoré */ }
  if (!res.ok || !data.url) throw new Error(data.error || "Envoi de la photo impossible.");
  return data.url;
}

const urlsEnvoyees = new Map();
const stockage = {
  from: () => ({
    upload: async (nom, fichier) => {
      try {
        urlsEnvoyees.set(nom, await envoyerPhoto(fichier));
        return { data: { path: nom }, error: null };
      } catch (e) {
        return { data: null, error: { message: e.message } };
      }
    },
    getPublicUrl: (nom) => ({ data: { publicUrl: urlsEnvoyees.get(nom) || "" } }),
  }),
};

/* ───────────── Suivi des commandes (mise à jour automatique) ───────────── */
const canauxActifs = new Set();

function creerCanal() {
  const abonnements = [];
  let restaurantId = null;
  let minuteur = null;
  let instantane = null; // commandes en cours connues
  let enCours = false;
  let arrete = false;

  const emettre = (evenement, ligne) => {
    for (const a of abonnements) {
      if (a.evenement === evenement || a.evenement === "*") a.rappel({ eventType: evenement, new: ligne });
    }
  };

  const sonder = async () => {
    if (enCours || arrete || !restaurantId) return;
    enCours = true;
    try {
      const res = await fetch(`${API}/api/commandes/${restaurantId}`, { cache: "no-cache" });
      if (res.status === 401 || res.status === 403) {
        canal._arreter();
        alert("Session expirée. Reconnectez-vous pour continuer à recevoir les commandes.");
        return;
      }
      if (!res.ok) return;
      const lignes = await res.json();
      if (!Array.isArray(lignes)) return;
      const actives = new Map(lignes.filter((c) => c.statut !== "servi").map((c) => [c.id, c]));
      if (instantane) {
        for (const [id, c] of actives) {
          const avant = instantane.get(id);
          if (!avant) emettre("INSERT", c);
          else if (avant.statut !== c.statut) emettre("UPDATE", c);
        }
        for (const [id, avant] of instantane) {
          if (!actives.has(id)) emettre("UPDATE", lignes.find((l) => l.id === id) || { ...avant, statut: "servi" });
        }
      }
      instantane = actives;
    } catch { /* réseau instable : on réessaie au prochain passage */ } finally {
      enCours = false;
    }
  };

  const auRetour = () => { if (typeof document !== "undefined" && !document.hidden) sonder(); };

  const canal = {
    on(type, filtre, rappel) {
      abonnements.push({ evenement: filtre && filtre.event, rappel });
      const m = /restaurant_id=eq\.(.+)$/.exec((filtre && filtre.filter) || "");
      if (m) restaurantId = m[1];
      return canal;
    },
    subscribe() {
      canauxActifs.add(canal);
      minuteur = setInterval(() => { if (!document.hidden) sonder(); }, INTERVALLE_MS);
      if (typeof document !== "undefined") document.addEventListener("visibilitychange", auRetour);
      sonder();
      return canal;
    },
    // Appelé quand ce site vient lui-même de changer un statut : affichage immédiat.
    _notifier(ligne) {
      if (arrete || !ligne || ligne.restaurant_id !== restaurantId) return;
      emettre("UPDATE", ligne);
      if (instantane) {
        if (ligne.statut === "servi") instantane.delete(ligne.id);
        else instantane.set(ligne.id, ligne);
      }
    },
    _arreter() {
      arrete = true;
      clearInterval(minuteur);
      canauxActifs.delete(canal);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", auRetour);
    },
  };
  return canal;
}

/* ───────────── Lecture / modification des commandes ───────────── */
function lectureCommandes() {
  const filtres = {};
  const q = {
    select() { return q; },
    eq(colonne, valeur) { filtres[colonne] = valeur; return q; },
    neq(colonne, valeur) { filtres[`sauf_${colonne}`] = valeur; return q; },
    order() { return q; },
    then(ok, ko) { return executer().then(ok, ko); },
  };
  const executer = async () => {
    const id = filtres.restaurant_id;
    if (!id) return { data: null, error: { message: "Requête non prise en charge" } };
    const res = await fetch(`${API}/api/commandes/${id}`, { cache: "no-cache" });
    const data = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(data)) return { data: null, error: { message: (data && data.error) || "Chargement impossible" } };
    const exclu = filtres.sauf_statut;
    return { data: exclu ? data.filter((c) => c.statut !== exclu) : data, error: null };
  };
  return q;
}

function modificationCommande(patch) {
  return {
    eq: async (colonne, valeur) => {
      if (colonne !== "id" || !patch || typeof patch.statut !== "string") {
        return { data: null, error: { message: "Modification non prise en charge" } };
      }
      const res = await fetch(`${API}/api/commandes/${valeur}/statut`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: patch.statut }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Changement de statut impossible.");
        return { data: null, error: { message: data.error || "Changement impossible" } };
      }
      for (const c of canauxActifs) c._notifier(data);
      return { data, error: null };
    },
  };
}

export const supabase = {
  channel: () => creerCanal(),
  removeChannel: (canal) => { if (canal && canal._arreter) canal._arreter(); },
  from: (table) => {
    if (table !== "commandes") throw new Error(`Table non prise en charge : ${table}`);
    return { select: () => lectureCommandes(), update: (patch) => modificationCommande(patch) };
  },
  storage: stockage,
};
