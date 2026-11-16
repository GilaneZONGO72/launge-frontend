// Calculs du tableau de bord (fonctions pures, sans effet de bord).
export const STATUTS = {
  en_cours: { label: "Nouvelle", classe: "lg-badge-rouge" },
  acceptee: { label: "En préparation", classe: "lg-badge-orange" },
  pret: { label: "Prête", classe: "lg-badge-vert" },
  servi: { label: "Servie", classe: "" },
};
export const STATUT_SUIVANT = { en_cours: "acceptee", acceptee: "pret", pret: "servi" };

// « Poulet rôti » et « poulet rôti  » comptent pour le même plat.
export const cle = (nom) => String(nom || "").trim().toLowerCase().replace(/\s+/g, " ");

const jourCle = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
const trier = (m) => [...m.values()].sort((a, b) => b.qte - a.qte);

export function resumer(stats, menu, maintenant = new Date()) {
  const categorieDe = new Map((menu || []).map((m) => [cle(m.nom), m.categorie]));
  const jours = new Map();
  const top = new Map();
  let ca = 0;
  let nb = 0;
  for (const c of stats || []) {
    if (isNaN(new Date(c.created_at))) continue;
    const k = jourCle(c.created_at);
    let j = jours.get(k);
    if (!j) { j = { cle: k, date: new Date(c.created_at), ca: 0, nb: 0, plats: new Map(), boissons: new Map() }; jours.set(k, j); }
    const total = Number(c.total) || 0;
    j.ca += total; j.nb += 1; ca += total; nb += 1;
    for (const it of c.items || []) {
      const kk = cle(it.nom);
      const qte = Number(it.qte) || 0;
      const nom = String(it.nom || "").trim();
      const t = top.get(kk) || { nom, qte: 0 };
      t.qte += qte; top.set(kk, t);
      const cible = categorieDe.get(kk) === "Boissons" ? j.boissons : j.plats;
      const e = cible.get(kk) || { nom, qte: 0 };
      e.qte += qte; cible.set(kk, e);
    }
  }
  const sept = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(maintenant); d.setDate(d.getDate() - i);
    const j = jours.get(jourCle(d));
    sept.push({ cle: jourCle(d), date: d, ca: j ? j.ca : 0, nb: j ? j.nb : 0 });
  }
  const auj = jours.get(jourCle(maintenant));
  return {
    ca, nb,
    panierMoyen: nb ? Math.round(ca / nb) : 0,
    aujourdhui: { ca: auj ? auj.ca : 0, nb: auj ? auj.nb : 0 },
    top: trier(top),
    jours: [...jours.values()].sort((a, b) => b.date - a.date).map((j) => ({ ...j, plats: trier(j.plats), boissons: trier(j.boissons) })),
    sept,
  };
}

export function alertesStock(menu) {
  return (menu || []).filter((i) => i.disponible !== false && (typeof i.seuil_alerte === "number" ? i.stock <= i.seuil_alerte : i.stock <= 0));
}

export const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR");
export const heure = (d) => { const x = new Date(d); return isNaN(x) ? "" : x.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); };
export const jourCourt = (d) => { const x = new Date(d); return isNaN(x) ? "" : x.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); };
