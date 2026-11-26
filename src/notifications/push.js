// Notifications push : abonnement de cet appareil, puis envoi de l'abonnement au serveur Launge.
export const API = "https://launge-backend-production.up.railway.app";

const lire = (cle) => { try { return window.localStorage.getItem(cle); } catch { return null; } };
const ecrire = (cle, val) => { try { if (val === null) window.localStorage.removeItem(cle); else window.localStorage.setItem(cle, val); } catch { /* ignoré */ } };
const CLE = (id) => `launge_push_${id}`;

export const pushSupporte = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const estIphone = () =>
  typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const estInstallee = () => {
  try { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true; } catch { return false; }
};

// 'non-supporte' | 'installer' (iPhone, pas encore sur l'écran d'accueil) | 'refuse' | 'actif' | 'inactif'
export async function etatNotifications(id) {
  if (estIphone() && !estInstallee()) return "installer";
  if (!pushSupporte()) return "non-supporte";
  if (Notification.permission === "denied") return "refuse";
  if (Notification.permission !== "granted" || lire(CLE(id)) !== "1") return "inactif";
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = reg && (await reg.pushManager.getSubscription());
    return sub ? "actif" : "inactif";
  } catch { return "inactif"; }
}

function versOctets(b64u) {
  const b64 = (b64u + "=".repeat((4 - (b64u.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const sortie = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) sortie[i] = bin.charCodeAt(i);
  return sortie;
}

// cible = { id, chemin, headers }  — à appeler directement depuis un clic (l'autorisation s'y demande).
export async function activerNotifications(cible) {
  if (!pushSupporte()) throw new Error("Ce navigateur ne gère pas les notifications.");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notifications refusées. Vous pouvez les autoriser dans les réglages du navigateur.");
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const rc = await fetch(`${API}/api/push/cle`);
  const dc = await rc.json().catch(() => ({}));
  if (!rc.ok || !dc.cle) throw new Error("Service de notifications indisponible. Réessayez plus tard.");
  const options = { userVisibleOnly: true, applicationServerKey: versOctets(dc.cle) };
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe(options);
  const envoyer = (s) => fetch(`${API}${cible.chemin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cible.headers || {}) },
    body: JSON.stringify({ subscription: s.toJSON() }),
  });
  let res = await envoyer(sub);
  if (res.status === 400) { // abonnement ancien ou invalide : on en crée un neuf
    await sub.unsubscribe().catch(() => {});
    sub = await reg.pushManager.subscribe(options);
    res = await envoyer(sub);
  }
  const d = await res.json().catch(() => ({}));
  if (!res.ok || d.error) throw new Error(d.error || "Activation impossible. Réessayez.");
  ecrire(CLE(cible.id), "1");
  return true;
}

// Coupe les notifications de cet appareil (le serveur oublie l'abonnement, le navigateur aussi).
export async function desactiverNotifications(id) {
  ecrire(CLE(id), null);
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = reg && (await reg.pushManager.getSubscription());
    if (sub) {
      await fetch(`${API}/api/push/retirer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
  } catch { /* ignoré */ }
}

// À la déconnexion d'un compte : l'appareil ne doit plus recevoir les notifications de ce compte.
export async function oublierAppareil(id) { await desactiverNotifications(id); }
