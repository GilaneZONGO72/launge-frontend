import { useState, useEffect, useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { supabase } from "./supabaseClient";

const API = "https://launge-backend-production.up.railway.app";

const s = {
  page: { minHeight: "100vh", background: "#000", color: "#FFD700", fontFamily: "sans-serif" },
  header: { background: "#111", padding: "16px 20px", borderBottom: "2px solid #FFD700", display: "flex", justifyContent: "space-between", alignItems: "center" },
  btn: (bg) => ({ background: bg, color: bg === "#FFD700" ? "#000" : "#FFD700", border: "2px solid #FFD700", borderRadius: 12, padding: "12px 24px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" }),
  card: { background: "#111", borderRadius: 16, padding: 16, border: "1px solid #FFD70033", marginBottom: 12 },
  input: { background: "#222", border: "1px solid #FFD70055", borderRadius: 8, padding: "10px 14px", color: "#FFD700", fontSize: 14, width: "100%", boxSizing: "border-box", marginBottom: 10 },
};

const STATUT_LABEL = { en_cours: "🟡 Reçu", pret: "🟢 Prêt", servi: "✅ Servi" };
const STATUT_SUIVANT = { en_cours: "pret", pret: "servi" };

export default function App() {
  const [vue, setVue] = useState("accueil");
  const [gerant, setGerant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [panier, setPanier] = useState({});
  const [commandes, setCommandes] = useState([]);
  const [restoId, setRestoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nbTables, setNbTables] = useState(5);
  const [restos, setRestos] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [numeroTable, setNumeroTable] = useState("T1");

  const [admin, setAdmin] = useState(null);
  const [restosAdmin, setRestosAdmin] = useState([]);
  const [connexionAdmin, setConnexionAdmin] = useState({ email: "", mot_de_passe: "" });

  const [inscription, setInscription] = useState({ nom: "", ville: "", telephone: "", email: "", mot_de_passe: "" });
  const [connexion, setConnexion] = useState({ email: "", mot_de_passe: "" });
  const [nouveauPlat, setNouveauPlat] = useState({ nom: "", prix: "", categorie: "Boissons", emoji: "🍽️", stock: "", seuil_alerte: "" });
  const [platEnEdition, setPlatEnEdition] = useState(null);
  const [onglet, setOnglet] = useState("dashboard");
  const [stats, setStats] = useState([]);

  const [commandesCuisine, setCommandesCuisine] = useState([]);
  const [nouvellesCommandes, setNouvellesCommandes] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin-secret-launge") { setVue("login-admin"); return; }
    const match = path.match(/^\/menu\/([^/]+)\/table-(.+)$/);
    if (match) {
      setNumeroTable(match[2]);
      chargerMenuParCode(match[1]);
      setVue("menu");
    }
  }, []);

  useEffect(() => {
    if (!gerant?.id) return;
    chargerCommandesCuisine(gerant.id);
    chargerStats(gerant.id);
    const channel = supabase.channel("commandes-cuisine")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "commandes", filter: `restaurant_id=eq.${gerant.id}` }, (payload) => {
        setCommandesCuisine(c => [payload.new, ...c]);
        setNouvellesCommandes(n => n + 1);
        if (audioRef.current) audioRef.current.play().catch(() => {});
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "commandes", filter: `restaurant_id=eq.${gerant.id}` }, (payload) => {
        setCommandesCuisine(c => c.map(cmd => cmd.id === payload.new.id ? payload.new : cmd));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [gerant?.id]);

  const chargerStats = async (id) => {
    const res = await fetch(`${API}/api/stats/${id}`);
    const data = await res.json();
    if (!data.error) setStats(data);
  };

  // ── CALCULS INVENTAIRE ──
  const today = new Date().toDateString();
  const commandesJour = commandes.filter(c => new Date(c.created_at).toDateString() === today);
  const caJour = commandesJour.reduce((a, c) => a + c.total, 0);

  const comptageItems = {};
  stats.forEach(cmd => {
    (cmd.items || []).forEach(item => {
      comptageItems[item.nom] = (comptageItems[item.nom] || 0) + item.qte;
    });
  });
  const itemsTries = Object.entries(comptageItems).sort((a, b) => b[1] - a[1]);
  const platPlusVendu = itemsTries[0];
  const platMoinsVendu = itemsTries[itemsTries.length - 1];
  const caMois = stats.reduce((a, c) => a + c.total, 0);

  const chargerCommandesCuisine = async (id) => {
    const { data } = await supabase.from("commandes").select("*").eq("restaurant_id", id).neq("statut", "servi").order("created_at", { ascending: false });
    if (data) setCommandesCuisine(data);
  };

  const changerStatutCommande = async (commandeId, nouveauStatut) => {
    await supabase.from("commandes").update({ statut: nouveauStatut }).eq("id", commandeId);
  };

  const chargerMenuParCode = async (codeUnique) => {
    const res = await fetch(`${API}/api/restaurants/code/${codeUnique}`);
    const data = await res.json();
    if (data.error) { alert("Restaurant introuvable."); return; }
    setRestoId(data.id);
    chargerMenu(data.id);
  };

  const totalPanier = Object.entries(panier).reduce((acc, [id, qte]) => {
    const item = menu.find(i => i.id === id);
    return acc + (item ? item.prix * qte : 0);
  }, 0);

  const chargerMenu = async (id) => {
    const res = await fetch(`${API}/api/menu/${id}`);
    const data = await res.json();
    setMenu(data);
  };

  const chargerCommandes = async (id) => {
    const res = await fetch(`${API}/api/commandes/${id}`);
    const data = await res.json();
    setCommandes(data);
  };

  const chargerRestos = async () => {
    const res = await fetch(`${API}/api/restaurants`);
    const data = await res.json();
    setRestos(data);
  };

  const inscrireGerant = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/restaurants/inscription`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inscription) });
    const data = await res.json();
    setLoading(false);
    if (data.error) return alert("Erreur : " + data.error);
    alert(`✅ Compte créé ! Votre code : ${data.code_unique}\n\nVotre compte doit être validé par l'administrateur avant de pouvoir vous connecter.`);
    setVue("login-gerant");
  };

  const connecterGerant = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/restaurants/connexion`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(connexion) });
    const data = await res.json();
    setLoading(false);
    if (data.error) return alert("Erreur : " + data.error);
    setGerant(data.restaurant);
    chargerMenu(data.restaurant.id);
    chargerCommandes(data.restaurant.id);
    setVue("gerant");
  };

  const ajouterPlat = async () => {
    const res = await fetch(`${API}/api/menu`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...nouveauPlat, restaurant_id: gerant.id, prix: +nouveauPlat.prix, stock: +nouveauPlat.stock, seuil_alerte: +nouveauPlat.seuil_alerte }) });
    const data = await res.json();
    if (data.error) return alert("Erreur : " + data.error);
    setMenu(m => [...m, data]);
    setNouveauPlat({ nom: "", prix: "", categorie: "Boissons", emoji: "🍽️", stock: "", seuil_alerte: "" });
    alert("✅ Plat ajouté !");
  };

  const modifierPlat = async () => {
    const res = await fetch(`${API}/api/menu/${platEnEdition.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(platEnEdition) });
    const data = await res.json();
    if (data.error) return alert("Erreur : " + data.error);
    setMenu(m => m.map(i => i.id === data.id ? data : i));
    setPlatEnEdition(null);
    alert("✅ Plat modifié !");
  };

  const supprimerPlat = async (id) => {
    if (!confirm("Supprimer ce plat définitivement ?")) return;
    const res = await fetch(`${API}/api/menu/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) return alert("Erreur : " + data.error);
    setMenu(m => m.filter(i => i.id !== id));
  };

  const passerCommande = async (modePaiement) => {
    const items = Object.entries(panier).map(([id, qte]) => {
      const item = menu.find(i => i.id === id);
      return { id, nom: item.nom, qte, prix: item.prix };
    });
    const res = await fetch(`${API}/api/commandes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurant_id: restoId, numero_table: numeroTable, items, total: totalPanier, mode_paiement: modePaiement }) });
    const data = await res.json();
    if (data.error) return alert("Erreur : " + data.error);
    setPanier({});
    setVue("confirmation");
  };

  const modifier = (id, delta) => {
    const item = menu.find(i => i.id === id);
    const dispo = item?.stock || 0;
    const actuel = panier[id] || 0;
    const nouveau = actuel + delta;
    if (nouveau < 0 || (delta > 0 && actuel >= dispo)) return;
    setPanier(p => ({ ...p, [id]: nouveau }));
  };

  const lienQR = (table) => `${window.location.origin}/menu/${gerant?.code_unique}/table-${table}`;

  const connecterAdmin = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/admin/connexion`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(connexionAdmin) });
    const data = await res.json();
    setLoading(false);
    if (data.error) return alert("Erreur : " + data.error);
    setAdmin(data.token);
    chargerRestosAdmin();
    setVue("admin-dashboard");
  };

  const chargerRestosAdmin = async () => {
    const res = await fetch(`${API}/api/admin/restaurants`);
    const data = await res.json();
    setRestosAdmin(data);
  };

  const validerResto = async (id) => { await fetch(`${API}/api/admin/restaurants/${id}/valider`, { method: "PUT" }); chargerRestosAdmin(); };
  const refuserResto = async (id) => { await fetch(`${API}/api/admin/restaurants/${id}/refuser`, { method: "PUT" }); chargerRestosAdmin(); };
  const supprimerResto = async (id) => {
    if (!confirm("Supprimer ce restaurant définitivement ?")) return;
    await fetch(`${API}/api/admin/restaurants/${id}`, { method: "DELETE" });
    chargerRestosAdmin();
  };

  if (vue === "login-admin") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ fontSize: 50, marginBottom: 16 }}>🛡️</div>
      <h2 style={{ marginBottom: 24 }}>Connexion Admin</h2>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <input placeholder="Email" type="email" value={connexionAdmin.email} onChange={e => setConnexionAdmin({ ...connexionAdmin, email: e.target.value })} style={s.input} />
        <input placeholder="Mot de passe" type="password" value={connexionAdmin.mot_de_passe} onChange={e => setConnexionAdmin({ ...connexionAdmin, mot_de_passe: e.target.value })} style={s.input} />
        <button onClick={connecterAdmin} style={s.btn("#FFD700")} disabled={loading}>{loading ? "⏳ Connexion..." : "Se connecter"}</button>
      </div>
    </div>
  );

  if (vue === "admin-dashboard") {
    const enAttente = restosAdmin.filter(r => r.statut === "en_attente");
    const valides = restosAdmin.filter(r => r.statut === "valide");
    const refuses = restosAdmin.filter(r => r.statut === "refuse");
    return (
      <div style={s.page}>
        <div style={s.header}>
          <span style={{ fontWeight: 800 }}>🛡️ Espace Admin</span>
          <button onClick={() => { setAdmin(null); setVue("accueil"); }} style={{ background: "transparent", border: "1px solid #FFD700", borderRadius: 8, color: "#FFD700", cursor: "pointer", padding: "6px 12px", fontSize: 12 }}>Déconnexion</button>
        </div>
        <div style={{ padding: 16 }}>
          <h3 style={{ marginBottom: 8 }}>⏳ En attente ({enAttente.length})</h3>
          {enAttente.length === 0 && <p style={{ opacity: 0.5, fontSize: 13, marginBottom: 20 }}>Aucune demande en attente.</p>}
          {enAttente.map(r => (
            <div key={r.id} style={s.card}>
              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{r.nom}</p>
              <p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.6 }}>{r.ville} · {r.telephone} · {r.email}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => validerResto(r.id)} style={{ ...s.btn("#22c55e"), flex: 1, padding: "8px" }}>✅ Valider</button>
                <button onClick={() => refuserResto(r.id)} style={{ ...s.btn("#ef4444"), flex: 1, padding: "8px" }}>❌ Refuser</button>
              </div>
            </div>
          ))}
          <h3 style={{ marginTop: 24, marginBottom: 8 }}>✅ Validés ({valides.length})</h3>
          {valides.map(r => (
            <div key={r.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{r.nom}</p>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>{r.ville}</p>
                </div>
                <button onClick={() => supprimerResto(r.id)} style={{ background: "transparent", border: "1px solid #ef4444", borderRadius: 8, color: "#ef4444", cursor: "pointer", padding: "6px 12px", fontSize: 12 }}>🗑️ Supprimer</button>
              </div>
            </div>
          ))}
          {refuses.length > 0 && (<>
            <h3 style={{ marginTop: 24, marginBottom: 8 }}>❌ Refusés ({refuses.length})</h3>
            {refuses.map(r => (
              <div key={r.id} style={{ ...s.card, opacity: 0.5 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700 }}>{r.nom}</p>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>{r.ville}</p>
              </div>
            ))}
          </>)}
        </div>
      </div>
    );
  }

  if (vue === "accueil") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 80 }}>🍽️</div>
      <h1 style={{ fontSize: 48, fontWeight: 900, margin: "8px 0 4px" }}>LAUNGE</h1>
      <p style={{ opacity: 0.5, marginBottom: 48, fontSize: 14 }}>Smart Dining · Cameroun</p>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <button onClick={() => setVue("login-gerant")} style={{ ...s.btn("#FFD700"), marginBottom: 16 }}>🏪 Espace Gérant</button>
        <button onClick={() => { chargerRestos(); setVue("liste-restos"); }} style={s.btn("#111")}>📱 Je suis un client</button>
      </div>
    </div>
  );

  if (vue === "liste-restos") {
    const filtres = restos.filter(r => r.nom.toLowerCase().includes(recherche.toLowerCase()));
    return (
      <div style={s.page}>
        <div style={s.header}>
          <span style={{ fontWeight: 800 }}>🍽️ Choisir un restaurant</span>
          <button onClick={() => setVue("accueil")} style={{ background: "transparent", border: "none", color: "#FFD700", cursor: "pointer", fontSize: 20 }}>←</button>
        </div>
        <div style={{ padding: 16 }}>
          <input placeholder="🔍 Rechercher un restaurant..." value={recherche} onChange={e => setRecherche(e.target.value)} style={s.input} />
          {filtres.length === 0 && <p style={{ textAlign: "center", opacity: 0.5, marginTop: 40 }}>Aucun restaurant trouvé.</p>}
          {filtres.map(r => (
            <div key={r.id} onClick={() => { setRestoId(r.id); chargerMenu(r.id); setVue("menu"); }} style={{ ...s.card, cursor: "pointer" }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700 }}>🏪 {r.nom}</p>
              <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>{r.ville}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vue === "inscription") return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ fontWeight: 800 }}>📝 Inscrire mon restaurant</span>
        <button onClick={() => setVue("login-gerant")} style={{ background: "transparent", border: "none", color: "#FFD700", cursor: "pointer", fontSize: 20 }}>←</button>
      </div>
      <div style={{ padding: 20 }}>
        {["nom", "ville", "telephone", "email", "mot_de_passe"].map(field => (
          <input key={field} placeholder={field === "mot_de_passe" ? "Mot de passe" : field.charAt(0).toUpperCase() + field.slice(1)}
            type={field === "mot_de_passe" ? "password" : "text"}
            value={inscription[field]} onChange={e => setInscription({ ...inscription, [field]: e.target.value })}
            style={s.input} />
        ))}
        <button onClick={inscrireGerant} style={s.btn("#FFD700")} disabled={loading}>{loading ? "⏳ Création..." : "✅ Créer mon compte"}</button>
      </div>
    </div>
  );

  if (vue === "login-gerant") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ fontSize: 50, marginBottom: 16 }}>🔐</div>
      <h2 style={{ marginBottom: 24 }}>Connexion Gérant</h2>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <input placeholder="Email" type="email" value={connexion.email} onChange={e => setConnexion({ ...connexion, email: e.target.value })} style={s.input} />
        <input placeholder="Mot de passe" type="password" value={connexion.mot_de_passe} onChange={e => setConnexion({ ...connexion, mot_de_passe: e.target.value })} style={s.input} />
        <button onClick={connecterGerant} style={{ ...s.btn("#FFD700"), marginBottom: 12 }} disabled={loading}>{loading ? "⏳ Connexion..." : "Se connecter"}</button>
        <button onClick={() => setVue("inscription")} style={{ ...s.btn("#111"), marginBottom: 12 }}>📝 Inscrire mon restaurant</button>
        <button onClick={() => setVue("accueil")} style={s.btn("#111")}>← Retour</button>
      </div>
    </div>
  );

  if (vue === "menu") return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ fontWeight: 800 }}>🍽️ LAUNGE</span>
        <button onClick={() => setVue("liste-restos")} style={{ background: "transparent", border: "none", color: "#FFD700", cursor: "pointer", fontSize: 20 }}>←</button>
      </div>
      <div style={{ padding: 16, paddingBottom: 100 }}>
        {menu.length === 0 && <p style={{ textAlign: "center", opacity: 0.5, marginTop: 40 }}>Aucun plat disponible.</p>}
        {menu.map(item => {
          const qte = panier[item.id] || 0;
          return (
            <div key={item.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 14, opacity: item.stock === 0 ? 0.4 : 1 }}>
              <span style={{ fontSize: 36 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{item.nom}</p>
                <p style={{ margin: 0, fontWeight: 800 }}>{item.prix.toLocaleString()} FCFA</p>
              </div>
              {item.stock === 0 ? <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 12 }}>ÉPUISÉ</span>
                : qte === 0 ? <button onClick={() => modifier(item.id, 1)} style={{ background: "#FFD700", color: "#000", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 800, cursor: "pointer" }}>+</button>
                : <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button onClick={() => modifier(item.id, -1)} style={{ background: "#333", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#FFD700", cursor: "pointer", fontWeight: 800 }}>−</button>
                    <span style={{ fontWeight: 800 }}>{qte}</span>
                    <button onClick={() => modifier(item.id, 1)} style={{ background: "#FFD700", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#000", cursor: "pointer", fontWeight: 800 }}>+</button>
                  </div>}
            </div>
          );
        })}
      </div>
      {totalPanier > 0 && (
        <div style={{ position: "fixed", bottom: 20, left: 20, right: 20 }}>
          <button onClick={() => setVue("paiement")} style={s.btn("#FFD700")}>🛒 Commander — {totalPanier.toLocaleString()} FCFA</button>
        </div>
      )}
    </div>
  );

  if (vue === "paiement") return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ fontWeight: 800 }}>💳 Paiement</span>
        <button onClick={() => setVue("menu")} style={{ background: "transparent", border: "none", color: "#FFD700", cursor: "pointer", fontSize: 20 }}>←</button>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ ...s.card, textAlign: "center", marginBottom: 20 }}>
          <p style={{ opacity: 0.6 }}>Total à payer</p>
          <p style={{ fontSize: 36, fontWeight: 900 }}>{totalPanier.toLocaleString()} FCFA</p>
        </div>
        {["🟠 Orange Money", "🔵 MTN Mobile Money", "💵 Cash"].map(pm => (
          <button key={pm} onClick={() => passerCommande(pm)} style={{ ...s.btn("#111"), marginBottom: 12 }}>{pm}</button>
        ))}
      </div>
    </div>
  );

  if (vue === "confirmation") return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 80 }}>✅</div>
      <h2 style={{ color: "#22c55e", fontSize: 28 }}>Paiement confirmé !</h2>
      <p style={{ opacity: 0.6 }}>Commande enregistrée ! 🍽️</p>
      <button onClick={() => setVue("accueil")} style={{ ...s.btn("#FFD700"), marginTop: 32, maxWidth: 300 }}>Retour à l'accueil</button>
    </div>
  );

  if (vue === "gerant") return (
    <div style={s.page}>
      <audio ref={audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />
      <div style={s.header}>
        <div>
          <p style={{ margin: 0, fontWeight: 800 }}>🏪 {gerant?.nom}</p>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>Dashboard</p>
        </div>
        <button onClick={() => { setGerant(null); setVue("accueil"); }} style={{ background: "transparent", border: "1px solid #FFD700", borderRadius: 8, color: "#FFD700", cursor: "pointer", padding: "6px 12px", fontSize: 12 }}>Déconnexion</button>
      </div>

      <div style={{ display: "flex", background: "#111", borderBottom: "1px solid #FFD70022", overflowX: "auto" }}>
        {[["dashboard", "📊"], ["menu", "🍽️"], ["commandes", "🧾"], ["cuisine", "🍳"], ["qrcodes", "📱"]].map(([id, icon]) => (
          <button key={id} onClick={() => { setOnglet(id); if (id === "cuisine") setNouvellesCommandes(0); }} style={{ flex: 1, padding: "12px 4px", background: "transparent", border: "none", color: onglet === id ? "#FFD700" : "rgba(255,215,0,0.3)", cursor: "pointer", fontSize: 11, fontWeight: onglet === id ? 800 : 500, borderBottom: onglet === id ? "2px solid #FFD700" : "2px solid transparent", whiteSpace: "nowrap", position: "relative" }}>
            {icon} {id}
            {id === "cuisine" && nouvellesCommandes > 0 && (
              <span style={{ position: "absolute", top: 2, right: 8, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{nouvellesCommandes}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {onglet === "dashboard" && (
          <div>
            {/* CAISSE DU JOUR */}
            <div style={{ ...s.card, textAlign: "center" }}>
              <p style={{ opacity: 0.6 }}>💰 Caisse du jour</p>
              <p style={{ fontSize: 32, fontWeight: 900 }}>{commandes.reduce((a, c) => a + c.total, 0).toLocaleString()} FCFA</p>
              <p style={{ opacity: 0.5 }}>{commandes.length} commande(s)</p>
            </div>

            {/* STOCK FAIBLE */}
            <div style={s.card}>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>⚠️ Stock faible</p>
              {menu.filter(i => i.stock <= i.seuil_alerte).map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <span>{i.emoji} {i.nom}</span>
                  <span style={{ color: i.stock === 0 ? "#ef4444" : "#f97316", fontWeight: 700 }}>{i.stock === 0 ? "ÉPUISÉ" : `${i.stock} restants`}</span>
                </div>
              ))}
              {menu.filter(i => i.stock <= i.seuil_alerte).length === 0 && <p style={{ opacity: 0.5, fontSize: 13 }}>✅ Tout est en stock !</p>}
            </div>

            {/* CODE UNIQUE */}
            <div style={s.card}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>🔑 Votre code unique</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", letterSpacing: 4 }}>{gerant?.code_unique}</p>
            </div>

            {/* INVENTAIRE JOURNALIER */}
            <div style={{ ...s.card, borderColor: "#FFD700" }}>
              <p style={{ fontWeight: 700, marginBottom: 12 }}>📅 Inventaire du jour</p>
              <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ opacity: 0.7 }}>Chiffre d'affaires</span>
                <span style={{ fontWeight: 800 }}>{caJour.toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ opacity: 0.7 }}>Commandes</span>
                <span style={{ fontWeight: 800 }}>{commandesJour.length}</span>
              </div>
              {platPlusVendu && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ opacity: 0.7 }}>⭐ Plus vendu</span>
                  <span style={{ fontWeight: 800 }}>{platPlusVendu[0]} ({platPlusVendu[1]}x)</span>
                </div>
              )}
              {platMoinsVendu && platMoinsVendu[0] !== platPlusVendu?.[0] && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ opacity: 0.7 }}>📉 Moins vendu</span>
                  <span style={{ fontWeight: 800 }}>{platMoinsVendu[0]} ({platMoinsVendu[1]}x)</span>
                </div>
              )}
            </div>

            {/* INVENTAIRE MENSUEL */}
            <div style={{ ...s.card, borderColor: "#FFD70055" }}>
              <p style={{ fontWeight: 700, marginBottom: 12 }}>📊 Inventaire des 30 derniers jours</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ opacity: 0.7 }}>Chiffre d'affaires</span>
                <span style={{ fontWeight: 800 }}>{caMois.toLocaleString()} FCFA</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ opacity: 0.7 }}>Total commandes</span>
                <span style={{ fontWeight: 800 }}>{stats.length}</span>
              </div>
              {itemsTries.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ opacity: 0.7, marginBottom: 6, fontSize: 13 }}>🏆 Top articles :</p>
                  {itemsTries.slice(0, 3).map(([nom, qte], idx) => (
                    <div key={nom} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"} {nom}</span>
                      <span style={{ fontWeight: 700 }}>{qte}x</span>
                    </div>
                  ))}
                </div>
              )}
              {itemsTries.length === 0 && <p style={{ opacity: 0.5, fontSize: 13 }}>Aucune donnée pour le moment.</p>}
            </div>
          </div>
        )}

        {onglet === "menu" && (
          <div>
            {/* FORMULAIRE AJOUT */}
            <div style={{ ...s.card, borderColor: "#FFD700" }}>
              <p style={{ fontWeight: 700, marginBottom: 12 }}>➕ Ajouter un article</p>
              <input placeholder="Nom" value={nouveauPlat.nom} onChange={e => setNouveauPlat({ ...nouveauPlat, nom: e.target.value })} style={s.input} />
              <input placeholder="Prix FCFA" type="number" value={nouveauPlat.prix} onChange={e => setNouveauPlat({ ...nouveauPlat, prix: e.target.value })} style={s.input} />
              <select value={nouveauPlat.categorie} onChange={e => setNouveauPlat({ ...nouveauPlat, categorie: e.target.value })} style={s.input}>
                {["Boissons", "Plats", "Grillades", "Snacks"].map(c => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Emoji 🍽️" value={nouveauPlat.emoji} onChange={e => setNouveauPlat({ ...nouveauPlat, emoji: e.target.value })} style={s.input} />
              <input placeholder="Stock initial" type="number" value={nouveauPlat.stock} onChange={e => setNouveauPlat({ ...nouveauPlat, stock: e.target.value })} style={s.input} />
              <input placeholder="Seuil alerte" type="number" value={nouveauPlat.seuil_alerte} onChange={e => setNouveauPlat({ ...nouveauPlat, seuil_alerte: e.target.value })} style={s.input} />
              <button onClick={ajouterPlat} style={s.btn("#FFD700")}>➕ Ajouter</button>
            </div>

            {/* FORMULAIRE MODIFICATION */}
            {platEnEdition && (
              <div style={{ ...s.card, borderColor: "#f97316" }}>
                <p style={{ fontWeight: 700, marginBottom: 12 }}>✏️ Modifier : {platEnEdition.nom}</p>
                <input placeholder="Nom" value={platEnEdition.nom} onChange={e => setPlatEnEdition({ ...platEnEdition, nom: e.target.value })} style={s.input} />
                <input placeholder="Prix FCFA" type="number" value={platEnEdition.prix} onChange={e => setPlatEnEdition({ ...platEnEdition, prix: e.target.value })} style={s.input} />
                <select value={platEnEdition.categorie} onChange={e => setPlatEnEdition({ ...platEnEdition, categorie: e.target.value })} style={s.input}>
                  {["Boissons", "Plats", "Grillades", "Snacks"].map(c => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="Emoji" value={platEnEdition.emoji} onChange={e => setPlatEnEdition({ ...platEnEdition, emoji: e.target.value })} style={s.input} />
                <input placeholder="Stock" type="number" value={platEnEdition.stock} onChange={e => setPlatEnEdition({ ...platEnEdition, stock: e.target.value })} style={s.input} />
                <input placeholder="Seuil alerte" type="number" value={platEnEdition.seuil_alerte} onChange={e => setPlatEnEdition({ ...platEnEdition, seuil_alerte: e.target.value })} style={s.input} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={modifierPlat} style={{ ...s.btn("#FFD700"), flex: 1 }}>✅ Enregistrer</button>
                  <button onClick={() => setPlatEnEdition(null)} style={{ ...s.btn("#333"), flex: 1 }}>❌ Annuler</button>
                </div>
              </div>
            )}

            {/* LISTE DES PLATS */}
            {menu.map(item => (
              <div key={item.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{item.nom}</p>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.6 }}>{item.prix.toLocaleString()} FCFA · Stock: {item.stock}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPlatEnEdition({ ...item })} style={{ background: "#333", border: "1px solid #FFD700", borderRadius: 8, color: "#FFD700", cursor: "pointer", padding: "6px 10px", fontSize: 12 }}>✏️</button>
                  <button onClick={() => supprimerPlat(item.id)} style={{ background: "transparent", border: "1px solid #ef4444", borderRadius: 8, color: "#ef4444", cursor: "pointer", padding: "6px 10px", fontSize: 12 }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === "commandes" && (
          <div>
            {commandes.length === 0 && <p style={{ textAlign: "center", opacity: 0.5, marginTop: 40 }}>Aucune commande pour le moment.</p>}
            {commandes.map((c, i) => (
              <div key={i} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>Table {c.numero_table}</span>
                  <span style={{ opacity: 0.5, fontSize: 12 }}>{new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p style={{ opacity: 0.6, fontSize: 13, margin: "0 0 8px" }}>{c.mode_paiement} · {STATUT_LABEL[c.statut] || c.statut}</p>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #FFD70022", paddingTop: 8 }}>
                  <span style={{ opacity: 0.6 }}>Total</span>
                  <span style={{ fontWeight: 800 }}>{c.total.toLocaleString()} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === "cuisine" && (
          <div>
            {commandesCuisine.length === 0 && <p style={{ textAlign: "center", opacity: 0.5, marginTop: 40 }}>Aucune commande en cours.</p>}
            {commandesCuisine.map((c) => (
              <div key={c.id} style={{ ...s.card, borderColor: c.statut === "en_cours" ? "#f97316" : "#FFD700" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>📍 Table {c.numero_table}</span>
                  <span style={{ opacity: 0.5, fontSize: 12 }}>{new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  {(c.items || []).map((item, idx) => (
                    <p key={idx} style={{ margin: "2px 0", fontSize: 14 }}>• {item.qte}x {item.nom}</p>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{STATUT_LABEL[c.statut] || c.statut}</span>
                  {STATUT_SUIVANT[c.statut] && (
                    <button onClick={() => changerStatutCommande(c.id, STATUT_SUIVANT[c.statut])} style={{ ...s.btn("#FFD700"), width: "auto", padding: "8px 16px" }}>
                      {c.statut === "en_cours" ? "👨‍🍳 Marquer prêt" : "✅ Marquer servi"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === "qrcodes" && (
          <div>
            <div style={{ ...s.card, borderColor: "#FFD700", marginBottom: 20 }}>
              <p style={{ fontWeight: 700, marginBottom: 12 }}>⚙️ Nombre de tables</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setNbTables(n => Math.max(1, n - 1))} style={{ background: "#333", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#FFD700", cursor: "pointer", fontWeight: 800, fontSize: 18 }}>−</button>
                <span style={{ fontWeight: 900, fontSize: 24, minWidth: 40, textAlign: "center" }}>{nbTables}</span>
                <button onClick={() => setNbTables(n => n + 1)} style={{ background: "#FFD700", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#000", cursor: "pointer", fontWeight: 800, fontSize: 18 }}>+</button>
              </div>
            </div>
            {Array.from({ length: nbTables }, (_, i) => i + 1).map(table => (
              <div key={table} style={{ ...s.card, textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>📍 Table {table}</p>
                <div style={{ background: "white", padding: 16, borderRadius: 12, display: "inline-block", marginBottom: 12 }}>
                  <QRCode value={lienQR(table)} size={160} bgColor="white" fgColor="#000" />
                </div>
                <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 8, wordBreak: "break-all" }}>{lienQR(table)}</p>
                <button onClick={() => window.print()} style={{ ...s.btn("#FFD700"), maxWidth: 200, margin: "0 auto" }}>🖨️ Imprimer</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}