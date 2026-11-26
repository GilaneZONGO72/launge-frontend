// Launge — service worker : reçoit les notifications et ouvre la bonne page au toucher.
const API = "https://launge-backend-production.up.railway.app";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {}; }
  const titre = typeof d.titre === "string" && d.titre ? d.titre : "Launge";
  e.waitUntil(self.registration.showNotification(titre, {
    body: typeof d.corps === "string" ? d.corps : "",
    tag: typeof d.tag === "string" ? d.tag : undefined,
    renotify: typeof d.tag === "string",
    icon: `${API}/icones/192.png`,
    badge: `${API}/icones/192.png`,
    data: { url: typeof d.url === "string" && d.url.startsWith("/") && !d.url.startsWith("//") ? d.url : "/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil((async () => {
    const fenetres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const f of fenetres) {
      if (new URL(f.url).origin === self.location.origin && "focus" in f) {
        // Le personnel garde sa session (en mémoire) : on ne recharge pas sa page, on la remet au premier plan.
        if (url.includes("/suivi/") && "navigate" in f) { try { await f.navigate(url); } catch (err) { /* ignoré */ } }
        return f.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
