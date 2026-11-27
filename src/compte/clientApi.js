// Compte client (facultatif) : le jeton reste dans le navigateur de la personne, jamais mélangé à celui du personnel.
import { useEffect, useState } from "react";

export const API = "https://launge-backend-production.up.railway.app";
const CLE = "launge_client";
let session = null; // { token, client }
const ecoutes = new Set();

try { const brut = window.localStorage.getItem(CLE); if (brut) { const s = JSON.parse(brut); if (s && typeof s.token === "string") session = s; } } catch { session = null; }

const prevenir = () => ecoutes.forEach((f) => f());
const sauver = () => { try { if (session) window.localStorage.setItem(CLE, JSON.stringify(session)); else window.localStorage.removeItem(CLE); } catch { /* ignoré */ } };

export const jetonClient = () => (session ? session.token : null);
export const entetesClient = () => (session ? { Authorization: `Bearer ${session.token}` } : {});
export function memoriserSession(token, client) { session = { token, client }; sauver(); prevenir(); }
export function majClient(client) { if (session) { session = { ...session, client }; sauver(); prevenir(); } }
export function oublierSession() { session = null; sauver(); prevenir(); }

// Pour les écrans : se met à jour quand la personne se connecte ou se déconnecte.
export function useSessionClient() {
  const [, rendre] = useState(0);
  useEffect(() => { const f = () => rendre((n) => n + 1); ecoutes.add(f); return () => ecoutes.delete(f); }, []);
  return session;
}

export async function appelClient(chemin, options = {}) {
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...entetesClient(), ...(options.headers || {}) };
  const res = await fetch(`${API}${chemin}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && session && !chemin.includes("ouvrir-session")) oublierSession(); // session expirée
  if (!res.ok || data.error) {
    const e = new Error(data.error || (res.status === 429 ? "Trop de tentatives. Réessayez dans quelques minutes." : "Une erreur est survenue."));
    e.statut = res.status;
    throw e;
  }
  return data;
}
