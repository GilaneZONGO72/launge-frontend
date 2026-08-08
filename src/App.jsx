import { useState, useEffect, useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { supabase } from "./supabaseClient";

const API = "https://launge-backend-production.up.railway.app";

const font = "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1208 100%)", color: "#F5F0E8", fontFamily: font },
  header: { background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)", padding: "14px 20px", borderBottom: "1px solid rgba(255,215,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  card: { background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 18, border: "1px solid rgba(255,215,0,0.12)", marginBottom: 14, backdropFilter: "blur(8px)" },
  cardGold: { background: "rgba(255,215,0,0.06)", borderRadius: 16, padding: 18, border: "1px solid rgba(255,215,0,0.3)", marginBottom: 14 },
  input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 16px", color: "#F5F0E8", fontSize: 14, width: "100%", boxSizing: "border-box", marginBottom: 12, fontFamily: font, outline: "none" },
  btnPrimary: { background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#0a0a0a", border: "none", borderRadius: 12, padding: "14px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", fontFamily: font, letterSpacing: "0.3px" },
  btnSecondary: { background: "transparent", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 12, padding: "13px 24px", fontWeight: 600, fontSize: 15, cursor: "pointer", width: "100%", fontFamily: font },
  btnDanger: { background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: font },
  btnEdit: { background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: font },
  label: { fontSize: 12, color: "rgba(255,215,0,0.6)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6, display: "block" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#FFD700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 },
  badge: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + "22", color: color, border: `1px solid ${color}44` }),
};

const STATUT_LABEL = { en_cours: "En préparation", pret: "Prêt", servi: "Servi" };
const STATUT_SUIVANT = { en_cours: "pret", pret: "servi" };
const STATUT_COLOR = { en_cours: "#f97316", pret: "#22c55e", servi: "#6b7280" };

const Icon = {
  restaurant: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  kitchen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  client: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  menu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6h5Z"/></svg>,
  drink: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><rect width="20" height="4" x="2" y="4" rx="1"/></svg>,
  job: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  orders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>,
  qr: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  recruit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  cart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const LogoLaunge = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="48" fill="#FFD700" fillOpacity="0.1" stroke="#FFD700" strokeWidth="1.5"/>
    <ellipse cx="50" cy="62" rx="28" ry="4" fill="#FFD700" fillOpacity="0.3"/>
    <rect x="22" y="58" width="56" height="3" rx="1.5" fill="#FFD700"/>
    <path d="M30 58 Q35 35 50 32 Q65 35 70 58" fill="#FFD700" fillOpacity="0.15" stroke="#FFD700" strokeWidth="1.5"/>
    <circle cx="50" cy="31" r="4" fill="#FFD700"/>
    <line x1="50" y1="27" x2="50" y2="22" stroke="#FFD700" strokeWidth="2"/>
  </svg>
);

export default function App() {
  const [vue, setVue] = useState("accueil");
  const [gerant, setGerant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [panier, setPanier] = useState({});
  const [commandes, setCommandes] = useState([]);
  const [restoId, setRestoId] = useState(null);
  const [restoInfo, setRestoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nbTables, setNbTables] = useState(5);
  const [restos, setRestos] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [numeroTable, setNumeroTable] = useState("T1");
  const [ongletMenu, setOngletMenu] = useState("plats");
  const [admin, setAdmin] = useState(null);
  const [restosAdmin, setRestosAdmin] = useState([]);
  const [connexionAdmin, setConnexionAdmin] = useState({ email: "", mot_de_passe: "" });
  const [inscription, setInscription] = useState({ nom: "", ville: "", telephone: "", email: "", mot_de_passe: "" });
  const [connexion, setConnexion] = useState({ email: "", mot_de_passe: "" });
  const [nouveauPlat, setNouveauPlat] = useState({ nom: "", prix: "", categorie: "Plats", emoji: "🍽️", stock: "", seuil_alerte: "" });
  const [platEnEdition, setPlatEnEdition] = useState(null);
  const [onglet, setOnglet] = useState("dashboard");
  const [stats, setStats] = useState([]);
  const [recrutement, setRecrutement] = useState({ actif: false, poste: "", conditions: "", contact: "" });
  const [codeCuisine, setCodeCuisine] = useState("");
  const [nouveauCodeCuisine, setNouveauCodeCuisine] = useState("");
  const [connexionCuisine, setConnexionCuisine] = useState({ code_unique: "", code_cuisine: "" });
  const [restoCuisine, setRestoCuisine] = useState(null);
  const [commandesCuisine, setCommandesCuisine] = useState([]);
  const [nouvellesCommandes, setNouvellesCommandes] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin-secret-launge") { setVue("login-admin"); return; }
    const match = path.match(/^\/menu\/([^/]+)\/table-(.+)$/);
    if (match) { setNumeroTable(match[2]); chargerMenuParCode(match[1]); setVue("menu"); }
  }, []);

  useEffect(() => {
    if (!gerant?.id) return;
    chargerCommandesCuisine(gerant.id);
    chargerStats(gerant.id);
    if (gerant.recrutement) setRecrutement(gerant.recrutement);
    if (gerant.code_cuisine) setCodeCuisine(gerant.code_cuisine);
    const channel = supabase.channel("commandes-cuisine")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "commandes", filter: `restaurant_id=eq.${gerant.id}` }, (payload) => {
        setCommandesCuisine(c => [payload.new, ...c]);
        setNouvellesCommandes(n => n + 1);
        if (audioRef.current) audioRef.current.play().catch(() => {});
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "commandes", filter: `restaurant_id=eq.${gerant.id}` }, (payload) => {
        setCommandesCuisine(c => c.map(cmd => cmd.id === payload.new.id ? payload.new : cmd));
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [gerant?.id]);

  useEffect(() => {
    if (!restoCuisine?.id) return;
    chargerCommandesCuisine(restoCuisine.id);
    const channel = supabase.channel("cuisine-separee")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "commandes", filter: `restaurant_id=eq.${restoCuisine.id}` }, (payload) => {
        setCommandesCuisine(c => [payload.new, ...c]);
        setNouvellesCommandes(n => n + 1);
        if (audioRef.current) audioRef.current.play().catch(() => {});
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "commandes", filter: `restaurant_id=eq.${restoCuisine.id}` }, (payload) => {
        setCommandesCuisine(c => c.map(cmd => cmd.id === payload.new.id ? payload.new : cmd));
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [restoCuisine?.id]);

  const chargerStats = async (id) => { const res = await fetch(`${API}/api/stats/${id}`); const data = await res.json(); if (!data.error) setStats(data); };

  const calculerJournees = () => {
    const parJour = {};
    stats.forEach(cmd => {
      const date = new Date(cmd.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const dateKey = new Date(cmd.created_at).toDateString();
      if (!parJour[dateKey]) parJour[dateKey] = { label: date, total: 0, commandes: 0, plats: {}, boissons: {} };
      parJour[dateKey].total += cmd.total;
      parJour[dateKey].commandes += 1;
      (cmd.items || []).forEach(item => {
        const menuItem = menu.find(m => m.nom === item.nom);
        const cat = menuItem?.categorie === "Boissons" ? "boissons" : "plats";
        parJour[dateKey][cat][item.nom] = (parJour[dateKey][cat][item.nom] || 0) + item.qte;
      });
    });
    return Object.entries(parJour).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  const journees = calculerJournees();
  const caMois = stats.reduce((a, c) => a + c.total, 0);
  const comptageItemsMois = {};
  stats.forEach(cmd => { (cmd.items || []).forEach(item => { comptageItemsMois[item.nom] = (comptageItemsMois[item.nom] || 0) + item.qte; }); });
  const itemsMoisTries = Object.entries(comptageItemsMois).sort((a, b) => b[1] - a[1]);

  const chargerCommandesCuisine = async (id) => {
    const { data } = await supabase.from("commandes").select("*").eq("restaurant_id", id).neq("statut", "servi").order("created_at", { ascending: false });
    if (data) setCommandesCuisine(data);
  };

  const changerStatutCommande = async (id, statut) => { await supabase.from("commandes").update({ statut }).eq("id", id); };
  const chargerMenuParCode = async (code) => { const res = await fetch(`${API}/api/restaurants/code/${code}`); const data = await res.json(); if (data.error) { alert("Restaurant introuvable."); return; } setRestoId(data.id); setRestoInfo(data); chargerMenu(data.id); };
  const totalPanier = Object.entries(panier).reduce((acc, [id, qte]) => { const item = menu.find(i => i.id === id); return acc + (item ? item.prix * qte : 0); }, 0);
  const chargerMenu = async (id) => { const res = await fetch(`${API}/api/menu/${id}`); const data = await res.json(); setMenu(data); };
  const chargerCommandes = async (id) => { const res = await fetch(`${API}/api/commandes/${id}`); const data = await res.json(); setCommandes(data); };
  const chargerRestos = async () => { const res = await fetch(`${API}/api/restaurants`); const data = await res.json(); setRestos(data); };

  const inscrireGerant = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/restaurants/inscription`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inscription) });
    const data = await res.json(); setLoading(false);
    if (data.error) return alert(data.error);
    alert(`Compte créé ! Code : ${data.code_unique}`); setVue("login-gerant");
  };

  const connecterGerant = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/restaurants/connexion`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(connexion) });
    const data = await res.json(); setLoading(false);
    if (data.error) return alert(data.error);
    setGerant(data.restaurant); chargerMenu(data.restaurant.id); chargerCommandes(data.restaurant.id); setVue("gerant");
  };

  const connecterCuisine = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/restaurants/connexion-cuisine`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(connexionCuisine) });
    const data = await res.json(); setLoading(false);
    if (data.error) return alert(data.error);
    setRestoCuisine(data.restaurant); setVue("vue-cuisine");
  };

  const ajouterPlat = async () => {
    const res = await fetch(`${API}/api/menu`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...nouveauPlat, restaurant_id: gerant.id, prix: +nouveauPlat.prix, stock: +nouveauPlat.stock, seuil_alerte: +nouveauPlat.seuil_alerte }) });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setMenu(m => [...m, data]); setNouveauPlat({ nom: "", prix: "", categorie: "Plats", emoji: "🍽️", stock: "", seuil_alerte: "" });
  };

  const modifierPlat = async () => {
    const res = await fetch(`${API}/api/menu/${platEnEdition.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(platEnEdition) });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setMenu(m => m.map(i => i.id === data.id ? data : i)); setPlatEnEdition(null);
  };

  const supprimerPlat = async (id) => { if (!confirm("Supprimer ?")) return; await fetch(`${API}/api/menu/${id}`, { method: "DELETE" }); setMenu(m => m.filter(i => i.id !== id)); };

  const sauvegarderRecrutement = async () => {
    const res = await fetch(`${API}/api/restaurants/${gerant.id}/recrutement`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recrutement }) });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setGerant({ ...gerant, recrutement }); alert("Sauvegardé !");
  };

  const sauvegarderCodeCuisine = async () => {
    if (!nouveauCodeCuisine || nouveauCodeCuisine.length < 4) return alert("Min. 4 caractères.");
    const res = await fetch(`${API}/api/restaurants/${gerant.id}/code-cuisine`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code_cuisine: nouveauCodeCuisine }) });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setCodeCuisine(nouveauCodeCuisine); setNouveauCodeCuisine(""); alert("Code sauvegardé !");
  };

  const passerCommande = async (modePaiement) => {
    const items = Object.entries(panier).map(([id, qte]) => { const item = menu.find(i => i.id === id); return { id, nom: item.nom, qte, prix: item.prix }; });
    const res = await fetch(`${API}/api/commandes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurant_id: restoId, numero_table: numeroTable, items, total: totalPanier, mode_paiement: modePaiement }) });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setPanier({}); setVue("confirmation");
  };

  const modifier = (id, delta) => {
    const item = menu.find(i => i.id === id);
    const actuel = panier[id] || 0;
    const nouveau = actuel + delta;
    if (nouveau < 0 || (delta > 0 && actuel >= (item?.stock || 0))) return;
    setPanier(p => ({ ...p, [id]: nouveau }));
  };

  const lienQR = (table) => `${window.location.origin}/menu/${gerant?.code_unique}/table-${table}`;
  const connecterAdmin = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/admin/connexion`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(connexionAdmin) });
    const data = await res.json(); setLoading(false);
    if (data.error) return alert(data.error);
    setAdmin(data.token); chargerRestosAdmin(); setVue("admin-dashboard");
  };
  const chargerRestosAdmin = async () => { const res = await fetch(`${API}/api/admin/restaurants`); const data = await res.json(); setRestosAdmin(data); };
  const validerResto = async (id) => { await fetch(`${API}/api/admin/restaurants/${id}/valider`, { method: "PUT" }); chargerRestosAdmin(); };
  const refuserResto = async (id) => { await fetch(`${API}/api/admin/restaurants/${id}/refuser`, { method: "PUT" }); chargerRestosAdmin(); };
  const supprimerResto = async (id) => { if (!confirm("Supprimer ?")) return; await fetch(`${API}/api/admin/restaurants/${id}`, { method: "DELETE" }); chargerRestosAdmin(); };
  // ── LOGO SVG LAUNGE ──
  const LogoLaunge = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="#FFD700" fillOpacity="0.1" stroke="#FFD700" strokeWidth="1.5"/>
      <ellipse cx="50" cy="62" rx="28" ry="4" fill="#FFD700" fillOpacity="0.3"/>
      <rect x="22" y="58" width="56" height="3" rx="1.5" fill="#FFD700"/>
      <path d="M30 58 Q35 35 50 32 Q65 35 70 58" fill="#FFD700" fillOpacity="0.15" stroke="#FFD700" strokeWidth="1.5"/>
      <circle cx="50" cy="31" r="4" fill="#FFD700"/>
      <line x1="50" y1="27" x2="50" y2="22" stroke="#FFD700" strokeWidth="2"/>
    </svg>
  );

  // ── VUE CUISINE ──
  if (vue === "login-cuisine") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <LogoLaunge size={60} />
          <h2 style={{ color: "#FFD700", fontWeight: 700, fontSize: 22, margin: "16px 0 4px" }}>Espace Cuisine</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Accès réservé au personnel</p>
        </div>
        <div style={s.card}>
          <span style={s.label}>Code restaurant</span>
          <input placeholder="LNG-XXXXX" value={connexionCuisine.code_unique} onChange={e => setConnexionCuisine({ ...connexionCuisine, code_unique: e.target.value.toUpperCase() })} style={s.input} />
          <span style={s.label}>Code cuisine</span>
          <input placeholder="••••" type="password" value={connexionCuisine.code_cuisine} onChange={e => setConnexionCuisine({ ...connexionCuisine, code_cuisine: e.target.value })} style={s.input} />
          <button onClick={connecterCuisine} style={{ ...s.btnPrimary, marginTop: 4 }} disabled={loading}>{loading ? "Connexion..." : "Accéder"}</button>
        </div>
        <button onClick={() => setVue("accueil")} style={{ ...s.btnSecondary, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{Icon.back} Retour</button>
      </div>
    </div>
  );

  if (vue === "vue-cuisine") return (
    <div style={s.page}>
      <audio ref={audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoLaunge size={32} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Cuisine — {restoCuisine?.nom}</p>
            {nouvellesCommandes > 0 && <p style={{ margin: 0, fontSize: 11, color: "#f97316" }}>{nouvellesCommandes} nouvelle(s)</p>}
          </div>
        </div>
        <button onClick={() => { setRestoCuisine(null); setCommandesCuisine([]); setNouvellesCommandes(0); setVue("accueil"); }} style={{ ...s.btnSecondary, width: "auto", padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{Icon.logout} Quitter</button>
      </div>

      <div style={{ padding: 16 }}>
        {commandesCuisine.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <p style={{ fontSize: 15 }}>Aucune commande en attente</p>
          </div>
        )}

        {commandesCuisine.map((c) => (
          <div key={c.id} style={{ ...s.card, borderLeft: `3px solid ${STATUT_COLOR[c.statut] || "#FFD700"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Table {c.numero_table}</span>
                <span style={{ ...s.badge(STATUT_COLOR[c.statut] || "#FFD700"), marginLeft: 10 }}>
                  {STATUT_LABEL[c.statut] || c.statut}
                </span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                {new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {(c.items || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "rgba(255,255,255,0.85)" }}>
                  <span>{item.nom}</span>
                  <span style={{ fontWeight: 700, color: "#FFD700" }}>×{item.qte}</span>
                </div>
              ))}
            </div>

            {STATUT_SUIVANT[c.statut] && (
              <button
                onClick={() => changerStatutCommande(c.id, STATUT_SUIVANT[c.statut])}
                style={{ ...s.btnPrimary, padding: "10px 16px" }}
              >
                {c.statut === "en_cours" ? "Marquer comme prêt" : "Marquer comme servi"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (vue === "login-admin") return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: "#FFD700" }}>{Icon.shield}</div>
          <h2 style={{ color: "#FFD700", fontWeight: 700, fontSize: 20, margin: "12px 0 4px" }}>Administration</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Accès restreint</p>
        </div>

        <div style={s.card}>
          <span style={s.label}>Adresse email</span>
          <input
            placeholder="admin@launge.cm"
            type="email"
            value={connexionAdmin.email}
            onChange={e => setConnexionAdmin({ ...connexionAdmin, email: e.target.value })}
            style={s.input}
          />

          <span style={s.label}>Mot de passe</span>
          <input
            placeholder="••••••••"
            type="password"
            value={connexionAdmin.mot_de_passe}
            onChange={e => setConnexionAdmin({ ...connexionAdmin, mot_de_passe: e.target.value })}
            style={s.input}
          />

          <button onClick={connecterAdmin} style={{ ...s.btnPrimary, marginTop: 4 }} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoLaunge size={32} />
            <span style={{ fontWeight: 700, fontSize: 15 }}>Administration</span>
          </div>

          <button
            onClick={() => { setAdmin(null); setVue("accueil"); }}
            style={{ ...s.btnSecondary, width: "auto", padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            {Icon.logout} Déconnexion
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {enAttente.length > 0 && (
            <>
              <p style={s.sectionTitle}>En attente ({enAttente.length})</p>

              {enAttente.map(r => (
                <div key={r.id} style={s.cardGold}>
                  <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{r.nom}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>
                    {r.ville} · {r.email}
                  </p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => validerResto(r.id)} style={{ ...s.btnPrimary, flex: 1, padding: "10px" }}>
                      Valider
                    </button>
                    <button onClick={() => refuserResto(r.id)} style={{ ...s.btnDanger, flex: 1 }}>
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          <p style={{ ...s.sectionTitle, marginTop: 20 }}>
            Restaurants validés ({valides.length})
          </p>

          {valides.map(r => (
            <div key={r.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 700, margin: "0 0 2px" }}>{r.nom}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>{r.ville}</p>
                </div>

                <button onClick={() => supprimerResto(r.id)} style={s.btnDanger}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vue === "accueil") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <LogoLaunge size={80} />

        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            margin: "20px 0 6px",
            letterSpacing: "-1px",
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          LAUNGE
        </h1>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "3px", textTransform: "uppercase" }}>
          Smart Dining · Cameroun
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => setVue("login-gerant")}
          style={{ ...s.btnPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {Icon.restaurant} Espace Gérant
        </button>

        <button
          onClick={() => setVue("login-cuisine")}
          style={{ ...s.btnSecondary, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {Icon.kitchen} Espace Cuisine
        </button>

        <button
          onClick={() => { chargerRestos(); setVue("liste-restos"); }}
          style={{ ...s.btnSecondary, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {Icon.client} Je suis un client
        </button>
      </div>
    </div>
  );

  if (vue === "liste-restos") {
    const filtres = restos.filter(r => r.nom.toLowerCase().includes(recherche.toLowerCase()));

    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoLaunge size={32} />
            <span style={{ fontWeight: 700 }}>Choisir un restaurant</span>
          </div>

          <button
            onClick={() => setVue("accueil")}
            style={{ background: "none", border: "none", color: "#FFD700", cursor: "pointer" }}
          >
            {Icon.back}
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.3)"
              }}
            >
              {Icon.search}
            </div>

            <input
              placeholder="Rechercher un restaurant..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={{ ...s.input, paddingLeft: 44, marginBottom: 0 }}
            />
          </div>

          {filtres.length === 0 && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", marginTop: 40 }}>
              Aucun restaurant trouvé
            </p>
          )}

          {filtres.map(r => (
            <div
              key={r.id}
              onClick={async () => {
                setRestoId(r.id);
                chargerMenu(r.id);

                const res = await fetch(`${API}/api/restaurants/${r.id}/info`);
                const data = await res.json();

                if (!data.error) setRestoInfo(data);
                setVue("menu");
              }}
              style={{ ...s.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,215,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFD700"
                }}
              >
                {Icon.restaurant}
              </div>

              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 15 }}>{r.nom}</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{r.ville}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vue === "inscription") return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ fontWeight: 700 }}>Inscrire mon restaurant</span>

        <button
          onClick={() => setVue("login-gerant")}
          style={{ background: "none", border: "none", color: "#FFD700", cursor: "pointer" }}
        >
          {Icon.back}
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <div style={s.card}>
          {[
            { key: "nom", label: "Nom du restaurant", type: "text", placeholder: "Ex: Le Gourmet" },
            { key: "ville", label: "Ville", type: "text", placeholder: "Ex: Douala" },
            { key: "telephone", label: "Téléphone", type: "text", placeholder: "Ex: 690000000" },
            { key: "email", label: "Adresse email", type: "email", placeholder: "contact@restaurant.com" },
            { key: "mot_de_passe", label: "Mot de passe", type: "password", placeholder: "••••••••" },
          ].map(f => (
            <div key={f.key}>
              <span style={s.label}>{f.label}</span>

              <input
                placeholder={f.placeholder}
                type={f.type}
                value={inscription[f.key]}
                onChange={e => setInscription({ ...inscription, [f.key]: e.target.value })}
                style={s.input}
              />
            </div>
          ))}

          <button onClick={inscrireGerant} style={s.btnPrimary} disabled={loading}>
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </div>
      </div>
    </div>
  );

  if (vue === "login-gerant") return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <LogoLaunge size={56} />

          <h2 style={{ color: "#FFD700", fontWeight: 700, fontSize: 20, margin: "14px 0 4px" }}>
            Connexion Gérant
          </h2>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Accédez à votre dashboard
          </p>
        </div>

        <div style={s.card}>
          <span style={s.label}>Adresse email</span>

          <input
            placeholder="votre@email.com"
            type="email"
            value={connexion.email}
            onChange={e => setConnexion({ ...connexion, email: e.target.value })}
            style={s.input}
          />

          <span style={s.label}>Mot de passe</span>

          <input
            placeholder="••••••••"
            type="password"
            value={connexion.mot_de_passe}
            onChange={e => setConnexion({ ...connexion, mot_de_passe: e.target.value })}
            style={s.input}
          />

          <button onClick={connecterGerant} style={{ ...s.btnPrimary, marginTop: 4 }} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>

        <button onClick={() => setVue("inscription")} style={{ ...s.btnSecondary, marginTop: 12 }}>
          Inscrire mon restaurant
        </button>

        <button
          onClick={() => setVue("accueil")}
          style={{ ...s.btnSecondary, marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {Icon.back} Retour
        </button>
      </div>
    </div>
  );

  if (vue === "menu") {
    const plats = menu.filter(i => i.categorie !== "Boissons");
    const boissons = menu.filter(i => i.categorie === "Boissons");
    const infoRecrutement = restoInfo?.recrutement;

    const renderItem = (item) => {
      const qte = panier[item.id] || 0;

      return (
        <div
          key={item.id}
          style={{
            ...s.card,
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: item.stock === 0 ? 0.5 : 1
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "rgba(255,215,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0
            }}
          >
            {item.emoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: "0 0 2px",
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {item.nom}
            </p>

            <p style={{ margin: 0, fontWeight: 700, color: "#FFD700", fontSize: 14 }}>
              {item.prix.toLocaleString()} FCFA
            </p>

            {item.stock === 0 && <span style={s.badge("#ef4444")}>Épuisé</span>}
          </div>

          {item.stock > 0 && (
            qte === 0
              ? (
                <button
                  onClick={() => modifier(item.id, 1)}
                  style={{ ...s.btnPrimary, width: "auto", padding: "8px 18px", fontSize: 14 }}
                >
                  Ajouter
                </button>
              )
              : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,215,0,0.08)",
                    borderRadius: 10,
                    padding: "6px 12px"
                  }}
                >
                  <button
                    onClick={() => modifier(item.id, -1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#FFD700",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1
                    }}
                  >
                    −
                  </button>

                  <span style={{ fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: "center" }}>
                    {qte}
                  </span>

                  <button
                    onClick={() => modifier(item.id, 1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#FFD700",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1
                    }}
                  >
                    +
                  </button>
                </div>
              )
          )}
        </div>
      );
    };

    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoLaunge size={32} />

            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                {restoInfo?.nom || "Menu"}
              </p>

              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                Table {numeroTable}
              </p>
            </div>
          </div>

          <button
            onClick={() => setVue("liste-restos")}
            style={{ background: "none", border: "none", color: "#FFD700", cursor: "pointer" }}
          >
            {Icon.back}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.4)",
            borderBottom: "1px solid rgba(255,215,0,0.1)"
          }}
        >
          {[
            ["plats", Icon.menu, "Plats"],
            ["boissons", Icon.drink, "Boissons"],
            ["jobs", Icon.job, "Emplois"]
          ].map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setOngletMenu(id)}
              style={{
                flex: 1,
                padding: "13px 4px",
                background: "none",
                border: "none",
                color: ongletMenu === id ? "#FFD700" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: ongletMenu === id ? 700 : 400,
                borderBottom: ongletMenu === id ? "2px solid #FFD700" : "2px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 16, paddingBottom: 100 }}>
          {ongletMenu === "plats" && (
            <>
              {plats.length === 0 && (
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", marginTop: 40 }}>
                  Aucun plat disponible
                </p>
              )}

              {plats.map(renderItem)}
            </>
          )}

          {ongletMenu === "boissons" && (
            <>
              {boissons.length === 0 && (
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", marginTop: 40 }}>
                  Aucune boisson disponible
                </p>
              )}

              {boissons.map(renderItem)}
            </>
          )}

          {ongletMenu === "jobs" && (
            infoRecrutement?.actif ? (
              <div style={s.cardGold}>
                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 16, color: "#FFD700" }}>
                  Nous recrutons
                </p>

                <div style={{ marginBottom: 12 }}>
                  <span style={s.label}>Poste recherché</span>
                  <p style={{ margin: 0, fontSize: 14 }}>{infoRecrutement.poste}</p>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={s.label}>Conditions</span>
                  <p style={{ margin: 0, fontSize: 14 }}>{infoRecrutement.conditions}</p>
                </div>

                <div>
                  <span style={s.label}>Contact</span>
                  <p style={{ margin: 0, fontSize: 14, color: "#FFD700", fontWeight: 600 }}>
                    {infoRecrutement.contact}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", marginTop: 40 }}>
                Aucun poste disponible pour le moment
              </p>
            )
          )}
        </div>

        {totalPanier > 0 && (
          <div style={{ position: "fixed", bottom: 20, left: 16, right: 16 }}>
            <button
              onClick={() => setVue("paiement")}
              style={{
                ...s.btnPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(255,215,0,0.25)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {Icon.cart} Commander
              </div>

              <span style={{ fontWeight: 800 }}>
                {totalPanier.toLocaleString()} FCFA
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (vue === "paiement") return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={{ fontWeight: 700 }}>Paiement</span>

        <button
          onClick={() => setVue("menu")}
          style={{ background: "none", border: "none", color: "#FFD700", cursor: "pointer" }}
        >
          {Icon.back}
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ ...s.cardGold, textAlign: "center", marginBottom: 24 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 6 }}>
            Total à régler
          </p>

          <p style={{ fontSize: 38, fontWeight: 800, color: "#FFD700", margin: 0 }}>
            {totalPanier.toLocaleString()} <span style={{ fontSize: 18 }}>FCFA</span>
          </p>
        </div>

        <p style={s.sectionTitle}>Mode de paiement</p>

        {[
          ["Orange Money", "#FF6600"],
          ["MTN Mobile Money", "#FFCC00"],
          ["Espèces", "#22c55e"]
        ].map(([label, color]) => (
          <button
            key={label}
            onClick={() => passerCommande(label)}
            style={{
              ...s.card,
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              border: `1px solid ${color}33`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 18px",
              marginBottom: 10
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: color + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: color
                }}
              />
            </div>

            <span style={{ fontWeight: 600, fontSize: 15 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (vue === "confirmation") return (
    <div
      style={{
        ...s.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 40,
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(34,197,94,0.15)",
          border: "2px solid #22c55e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          color: "#22c55e"
        }}
      >
        {Icon.check}
      </div>

      <h2 style={{ color: "#22c55e", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Commande confirmée
      </h2>

      <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
        Votre commande est en cours de préparation
      </p>

      <button onClick={() => setVue("accueil")} style={{ ...s.btnPrimary, maxWidth: 280 }}>
        Retour à l'accueil
      </button>
    </div>
  );

  if (vue === "gerant") {
    const tabs = [
      { id: "dashboard", icon: Icon.dashboard, label: "Dashboard" },
      { id: "menu", icon: Icon.menu, label: "Menu" },
      { id: "commandes", icon: Icon.orders, label: "Commandes" },
      { id: "cuisine", icon: Icon.kitchen, label: "Cuisine", badge: nouvellesCommandes },
      { id: "recrutement", icon: Icon.recruit, label: "Jobs" },
      { id: "parametres", icon: Icon.settings, label: "Réglages" },
      { id: "qrcodes", icon: Icon.qr, label: "QR Codes" },
    ];

    return (
      <div style={s.page}>
        <audio ref={audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />

        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoLaunge size={34} />

            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{gerant?.nom}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,215,0,0.5)" }}>
                Dashboard gérant
              </p>
            </div>
          </div>

          <button
            onClick={() => { setGerant(null); setVue("accueil"); }}
            style={{
              ...s.btnSecondary,
              width: "auto",
              padding: "8px 14px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            {Icon.logout}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.5)",
            borderBottom: "1px solid rgba(255,215,0,0.08)",
            overflowX: "auto",
            scrollbarWidth: "none"
          }}
        >
          {tabs.map(({ id, icon, label, badge }) => (
            <button
              key={id}
              onClick={() => {
                setOnglet(id);
                if (id === "cuisine") setNouvellesCommandes(0);
              }}
              style={{
                flex: "0 0 auto",
                padding: "12px 14px",
                background: "none",
                border: "none",
                color: onglet === id ? "#FFD700" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: onglet === id ? 700 : 400,
                borderBottom: onglet === id ? "2px solid #FFD700" : "2px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                position: "relative",
                whiteSpace: "nowrap"
              }}
            >
              {icon}
              {label}

              {badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 14,
                    height: 14,
                    fontSize: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding: 16 }}>

          {onglet === "dashboard" && (
            <div>
              <div style={s.card}>
                <p style={{ ...s.sectionTitle, marginBottom: 10 }}>Stock en alerte</p>

                {menu.filter(i => i.stock <= i.seuil_alerte).length === 0
                  ? (
                    <p style={{ color: "#22c55e", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      {Icon.check} Tout est en stock
                    </p>
                  )
                  : menu.filter(i => i.stock <= i.seuil_alerte).map(i => (
                    <div
                      key={i.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 14,
                        marginBottom: 6
                      }}
                    >
                      <span>{i.nom}</span>

                      <span style={s.badge(i.stock === 0 ? "#ef4444" : "#f97316")}>
                        {i.stock === 0 ? "Épuisé" : `${i.stock} restants`}
                      </span>
                    </div>
                  ))
                }
              </div>

              <div style={s.cardGold}>
                <p style={s.sectionTitle}>Inventaire journalier</p>

                {journees.length === 0 && (
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                    Aucune donnée
                  </p>
                )}

                {journees.map(([dateKey, jour]) => {
                  const platsTries = Object.entries(jour.plats).sort((a, b) => b[1] - a[1]);
                  const boissonsTries = Object.entries(jour.boissons).sort((a, b) => b[1] - a[1]);

                  return (
                    <div
                      key={dateKey}
                      style={{
                        borderBottom: "1px solid rgba(255,215,0,0.1)",
                        paddingBottom: 14,
                        marginBottom: 14
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#FFD700" }}>
                        {jour.label}
                      </p>

                      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                        <div
                          style={{
                            flex: 1,
                            background: "rgba(255,215,0,0.06)",
                            borderRadius: 10,
                            padding: "10px 14px"
                          }}
                        >
                          <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            Chiffre d'affaires
                          </p>

                          <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#FFD700" }}>
                            {jour.total.toLocaleString()} F
                          </p>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            background: "rgba(255,215,0,0.06)",
                            borderRadius: 10,
                            padding: "10px 14px"
                          }}
                        >
                          <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            Commandes
                          </p>

                          <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>
                            {jour.commandes}
                          </p>
                        </div>
                      </div>

                      {platsTries.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                            Plats vendus
                          </p>

                          {platsTries.map(([nom, qte]) => (
                            <div
                              key={nom}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 13,
                                marginBottom: 3
                              }}
                            >
                              <span style={{ color: "rgba(255,255,255,0.7)" }}>{nom}</span>
                              <span style={{ fontWeight: 700, color: "#FFD700" }}>{qte}×</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {boissonsTries.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                            Boissons vendues
                          </p>

                          {boissonsTries.map(([nom, qte]) => (
                            <div
                              key={nom}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: 13,
                                marginBottom: 3
                              }}
                            >
                              <span style={{ color: "rgba(255,255,255,0.7)" }}>{nom}</span>
                              <span style={{ fontWeight: 700, color: "#FFD700" }}>{qte}×</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={s.card}>
                <p style={s.sectionTitle}>Récapitulatif 30 jours</p>

                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      flex: 1,
                      background: "rgba(255,215,0,0.06)",
                      borderRadius: 10,
                      padding: "12px 14px"
                    }}
                  >
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      CA Total
                    </p>

                    <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "#FFD700" }}>
                      {caMois.toLocaleString()} F
                    </p>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      background: "rgba(255,215,0,0.06)",
                      borderRadius: 10,
                      padding: "12px 14px"
                    }}
                  >
                    <p style={{ margin: "0 0 2px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      Commandes
                    </p>

                    <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>
                      {stats.length}
                    </p>
                  </div>
                </div>

                {itemsMoisTries.slice(0, 5).map(([nom, qte], idx) => (
                  <div
                    key={nom}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 6,
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {idx < 3 && Icon.star}
                      <span style={{ color: "rgba(255,255,255,0.8)" }}>{nom}</span>
                    </div>

                    <span style={{ fontWeight: 700 }}>{qte}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onglet === "menu" && (
            <div>
              <div style={s.cardGold}>
                <p style={s.sectionTitle}>Ajouter un article</p>

                <span style={s.label}>Nom</span>
                <input
                  placeholder="Ex: Ndolé spécial"
                  value={nouveauPlat.nom}
                  onChange={e => setNouveauPlat({ ...nouveauPlat, nom: e.target.value })}
                  style={s.input}
                />

                <span style={s.label}>Prix (FCFA)</span>
                <input
                  placeholder="Ex: 2500"
                  type="number"
                  value={nouveauPlat.prix}
                  onChange={e => setNouveauPlat({ ...nouveauPlat, prix: e.target.value })}
                  style={s.input}
                />

                <span style={s.label}>Catégorie</span>
                <select
                  value={nouveauPlat.categorie}
                  onChange={e => setNouveauPlat({ ...nouveauPlat, categorie: e.target.value })}
                  style={{ ...s.input, cursor: "pointer" }}
                >
                  {["Plats", "Boissons"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <span style={s.label}>Emoji</span>
                <input
                  placeholder="🍽️"
                  value={nouveauPlat.emoji}
                  onChange={e => setNouveauPlat({ ...nouveauPlat, emoji: e.target.value })}
                  style={s.input}
                />

                <span style={s.label}>Stock initial</span>
                <input
                  placeholder="Ex: 20"
                  type="number"
                  value={nouveauPlat.stock}
                  onChange={e => setNouveauPlat({ ...nouveauPlat, stock: e.target.value })}
                  style={s.input}
                />

                <span style={s.label}>Seuil d'alerte</span>
                <input
                  placeholder="Ex: 5"
                  type="number"
                  value={nouveauPlat.seuil_alerte}
                  onChange={e => setNouveauPlat({ ...nouveauPlat, seuil_alerte: e.target.value })}
                  style={s.input}
                />

                <button onClick={ajouterPlat} style={s.btnPrimary}>
                  Ajouter au menu
                </button>
              </div>

              {platEnEdition && (
                <div style={{ ...s.card, border: "1px solid rgba(249,115,22,0.4)" }}>
                  <p style={{ ...s.sectionTitle, color: "#f97316" }}>
                    Modifier l'article
                  </p>

                  <input
                    placeholder="Nom"
                    value={platEnEdition.nom}
                    onChange={e => setPlatEnEdition({ ...platEnEdition, nom: e.target.value })}
                    style={s.input}
                  />

                  <input
                    placeholder="Prix"
                    type="number"
                    value={platEnEdition.prix}
                    onChange={e => setPlatEnEdition({ ...platEnEdition, prix: e.target.value })}
                    style={s.input}
                  />

                  <select
                    value={platEnEdition.categorie}
                    onChange={e => setPlatEnEdition({ ...platEnEdition, categorie: e.target.value })}
                    style={s.input}
                  >
                    {["Plats", "Boissons"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <input
                    placeholder="Emoji"
                    value={platEnEdition.emoji}
                    onChange={e => setPlatEnEdition({ ...platEnEdition, emoji: e.target.value })}
                    style={s.input}
                  />

                  <input
                    placeholder="Stock"
                    type="number"
                    value={platEnEdition.stock}
                    onChange={e => setPlatEnEdition({ ...platEnEdition, stock: e.target.value })}
                    style={s.input}
                  />

                  <input
                    placeholder="Seuil alerte"
                    type="number"
                    value={platEnEdition.seuil_alerte}
                    onChange={e => setPlatEnEdition({ ...platEnEdition, seuil_alerte: e.target.value })}
                    style={s.input}
                  />

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={modifierPlat} style={{ ...s.btnPrimary, flex: 1 }}>
                      Enregistrer
                    </button>

                    <button onClick={() => setPlatEnEdition(null)} style={{ ...s.btnSecondary, flex: 1 }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <p style={{ ...s.sectionTitle, marginTop: 8 }}>
                Articles ({menu.length})
              </p>

              {menu.map(item => (
                <div
                  key={item.id}
                  style={{ ...s.card, display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "rgba(255,215,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24
                    }}
                  >
                    {item.emoji}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 600 }}>{item.nom}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      {item.prix.toLocaleString()} FCFA · Stock: {item.stock} · {item.categorie}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setPlatEnEdition({ ...item })}
                      style={s.btnEdit}
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => supprimerPlat(item.id)}
                      style={s.btnDanger}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onglet === "commandes" && (
            <div>
              <p style={s.sectionTitle}>Commandes ({commandes.length})</p>

              {commandes.length === 0 && (
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", marginTop: 40 }}>
                  Aucune commande
                </p>
              )}

              {commandes.map((c, i) => (
                <div
                  key={i}
                  style={{
                    ...s.card,
                    borderLeft: `3px solid ${STATUT_COLOR[c.statut] || "#FFD700"}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>Table {c.numero_table}</span>

                      <span style={s.badge(STATUT_COLOR[c.statut] || "#FFD700")}>
                        {STATUT_LABEL[c.statut] || c.statut}
                      </span>
                    </div>

                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                      {new Date(c.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 8px" }}>
                    {c.mode_paiement}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      paddingTop: 8
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      Total
                    </span>

                    <span style={{ fontWeight: 700, color: "#FFD700" }}>
                      {c.total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onglet === "cuisine" && (
            <div>
              {commandesCuisine.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "rgba(255,255,255,0.3)"
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12, color: "#22c55e" }}>
                    {Icon.check}
                  </div>

                  <p>Aucune commande en attente</p>
                </div>
              )}

              {commandesCuisine.map((c) => (
                <div
                  key={c.id}
                  style={{
                    ...s.card,
                    borderLeft: `3px solid ${STATUT_COLOR[c.statut] || "#FFD700"}`
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>
                        Table {c.numero_table}
                      </span>

                      <span style={s.badge(STATUT_COLOR[c.statut] || "#FFD700")}>
                        {STATUT_LABEL[c.statut] || c.statut}
                      </span>
                    </div>

                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                      {new Date(c.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <div
                    style={{
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    {(c.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 14,
                          marginBottom: 4
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.8)" }}>
                          {item.nom}
                        </span>

                        <span style={{ fontWeight: 700, color: "#FFD700" }}>
                          ×{item.qte}
                        </span>
                      </div>
                    ))}
                  </div>

                  {STATUT_SUIVANT[c.statut] && (
                    <button
                      onClick={() => changerStatutCommande(c.id, STATUT_SUIVANT[c.statut])}
                      style={{ ...s.btnPrimary, padding: "10px 16px" }}
                    >
                      {c.statut === "en_cours" ? "Marquer comme prêt" : "Marquer comme servi"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {onglet === "recrutement" && (
            <div style={s.card}>
              <p style={s.sectionTitle}>Gestion du recrutement</p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12
                }}
              >
                <span style={{ fontSize: 14 }}>Recrutement actif</span>

                <button
                  onClick={() => setRecrutement({ ...recrutement, actif: !recrutement.actif })}
                  style={{
                    background: recrutement.actif ? "#22c55e" : "rgba(255,255,255,0.1)",
                    border: "none",
                    borderRadius: 20,
                    width: 48,
                    height: 26,
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s"
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: 3,
                      left: recrutement.actif ? 25 : 3,
                      transition: "left 0.2s"
                    }}
                  />
                </button>
              </div>

              {recrutement.actif && (
                <>
                  <span style={s.label}>Poste recherché</span>

                  <input
                    placeholder="Ex: Serveur, Cuisinier..."
                    value={recrutement.poste}
                    onChange={e => setRecrutement({ ...recrutement, poste: e.target.value })}
                    style={s.input}
                  />

                  <span style={s.label}>Conditions</span>

                  <textarea
                    placeholder="Expérience, horaires, salaire..."
                    value={recrutement.conditions}
                    onChange={e => setRecrutement({ ...recrutement, conditions: e.target.value })}
                    style={{ ...s.input, height: 80, resize: "none" }}
                  />

                  <span style={s.label}>Contact</span>

                  <input
                    placeholder="Téléphone ou email"
                    value={recrutement.contact}
                    onChange={e => setRecrutement({ ...recrutement, contact: e.target.value })}
                    style={s.input}
                  />
                </>
              )}

              <button onClick={sauvegarderRecrutement} style={s.btnPrimary}>
                Sauvegarder
              </button>
            </div>
          )}

          {onglet === "parametres" && (
            <div style={s.card}>
              <p style={s.sectionTitle}>Code d'accès cuisine</p>

              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.6
                }}
              >
                Partagez ce code avec votre cuisinier pour qu'il accède uniquement à la vue cuisine, sans voir vos données financières.
              </p>

              {codeCuisine && (
                <div
                  style={{
                    background: "rgba(255,215,0,0.06)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 16,
                    border: "1px solid rgba(255,215,0,0.2)"
                  }}
                >
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    Code actuel
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      fontSize: 22,
                      letterSpacing: 6,
                      color: "#FFD700"
                    }}
                  >
                    {codeCuisine}
                  </p>
                </div>
              )}

              <div
                style={{
                  background: "rgba(255,215,0,0.06)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  marginBottom: 16,
                  border: "1px solid rgba(255,215,0,0.2)"
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  Code restaurant (à donner avec le code cuisine)
                </p>

                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>
                  {gerant?.code_unique}
                </p>
              </div>

              <span style={s.label}>Nouveau code cuisine</span>

              <input
                placeholder="Min. 4 caractères"
                value={nouveauCodeCuisine}
                onChange={e => setNouveauCodeCuisine(e.target.value)}
                style={s.input}
              />

              <button onClick={sauvegarderCodeCuisine} style={s.btnPrimary}>
                Sauvegarder le code
              </button>
            </div>
          )}

          {onglet === "qrcodes" && (
            <div>
              <div style={s.cardGold}>
                <p style={s.sectionTitle}>Nombre de tables</p>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <button
                    onClick={() => setNbTables(n => Math.max(1, n - 1))}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,215,0,0.2)",
                      color: "#FFD700",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 20
                    }}
                  >
                    −
                  </button>

                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 28,
                      minWidth: 40,
                      textAlign: "center"
                    }}
                  >
                    {nbTables}
                  </span>

                  <button
                    onClick={() => setNbTables(n => n + 1)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(255,215,0,0.15)",
                      border: "1px solid rgba(255,215,0,0.4)",
                      color: "#FFD700",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 20
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {Array.from({ length: nbTables }, (_, i) => i + 1).map(table => (
                <div
                  key={table}
                  style={{ ...s.card, textAlign: "center" }}
                >
                  <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>
                    Table {table}
                  </p>

                  <div
                    style={{
                      background: "white",
                      padding: 16,
                      borderRadius: 12,
                      display: "inline-block",
                      marginBottom: 12
                    }}
                  >
                    <QRCode
                      value={lienQR(table)}
                      size={150}
                      bgColor="white"
                      fgColor="#0a0a0a"
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: 12,
                      wordBreak: "break-all"
                    }}
                  >
                    {lienQR(table)}
                  </p>

                  <button
                    onClick={() => window.print()}
                    style={{ ...s.btnSecondary, maxWidth: 200, margin: "0 auto" }}
                  >
                    Imprimer
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
}