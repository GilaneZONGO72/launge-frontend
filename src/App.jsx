import { useState, useEffect, useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { supabase } from "./supabaseClient";

const API = "https://launge-backend.onrender.com";

const theme = {
  bg: "#0F1117",
  bgCard: "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderGold: "rgba(255,215,0,0.3)",
  orange: "#FF6B35",
  gold: "#FFD700",
  green: "#00C896",
  purple: "#7C3AED",
  red: "#EF4444",
  textPrimary: "#F8F9FA",
  textSecondary: "rgba(255,255,255,0.5)",
  textMuted: "rgba(255,255,255,0.25)",
  font: "'Inter', 'Segoe UI', -apple-system, sans-serif",
};

const gradients = {
  orange: "linear-gradient(135deg, #FF6B35, #FF8C42)",
  gold: "linear-gradient(135deg, #FFD700, #FFA500)",
  green: "linear-gradient(135deg, #00C896, #00A878)",
  purple: "linear-gradient(135deg, #7C3AED, #9F67FF)",
  hero: "linear-gradient(135deg, #1a0a00 0%, #0F1117 40%, #0a0a1a 100%)",
  card: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
};

const s = {
  page: { minHeight: "100vh", background: theme.bg, color: theme.textPrimary, fontFamily: theme.font },
  header: {
    background: "rgba(15,17,23,0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "12px 20px",
    borderBottom: `1px solid ${theme.border}`,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    position: "sticky", top: 0, zIndex: 100,
  },
  card: {
    background: gradients.card,
    borderRadius: 20,
    padding: 20,
    border: `1px solid ${theme.border}`,
    marginBottom: 14,
    backdropFilter: "blur(10px)",
  },
  cardOrange: {
    background: "linear-gradient(145deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))",
    borderRadius: 20, padding: 20,
    border: "1px solid rgba(255,107,53,0.25)",
    marginBottom: 14,
  },
  cardGold: {
    background: "linear-gradient(145deg, rgba(255,215,0,0.1), rgba(255,215,0,0.03))",
    borderRadius: 20, padding: 20,
    border: "1px solid rgba(255,215,0,0.2)",
    marginBottom: 14,
  },
  cardGreen: {
    background: "linear-gradient(145deg, rgba(0,200,150,0.1), rgba(0,200,150,0.03))",
    borderRadius: 20, padding: 20,
    border: "1px solid rgba(0,200,150,0.2)",
    marginBottom: 14,
  },
  input: {
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: "13px 16px",
    color: theme.textPrimary,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    marginBottom: 12,
    fontFamily: theme.font,
    outline: "none",
    transition: "border-color 0.2s",
  },
  btnOrange: {
    background: gradients.orange,
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "15px 24px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    fontFamily: theme.font,
    boxShadow: "0 4px 20px rgba(255,107,53,0.3)",
    letterSpacing: "0.3px",
  },
  btnGold: {
    background: gradients.gold,
    color: "#0F1117",
    border: "none",
    borderRadius: 14,
    padding: "15px 24px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    fontFamily: theme.font,
    boxShadow: "0 4px 20px rgba(255,215,0,0.2)",
  },
  btnGhost: {
    background: "transparent",
    color: theme.textSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: 14,
    padding: "14px 24px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    fontFamily: theme.font,
  },
  btnGreen: {
    background: gradients.green,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: theme.font,
    boxShadow: "0 4px 16px rgba(0,200,150,0.25)",
  },
  btnDanger: {
    background: "rgba(239,68,68,0.1)",
    color: theme.red,
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: theme.font,
    fontWeight: 600,
  },
  btnEdit: {
    background: "rgba(255,215,0,0.08)",
    color: theme.gold,
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: theme.font,
    fontWeight: 600,
  },
  label: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.textMuted,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  badge: (color) => ({
    display: "inline-flex", alignItems: "center",
    padding: "4px 12px", borderRadius: 20,
    fontSize: 11, fontWeight: 700,
    background: color + "18", color: color,
    border: `1px solid ${color}30`,
  }),
  chip: (color) => ({
    display: "inline-block",
    padding: "3px 10px", borderRadius: 6,
    fontSize: 11, fontWeight: 600,
    background: color + "15", color: color,
  }),
};

const STATUT_LABEL = { en_cours: "En préparation", pret: "Prêt à servir", servi: "Servi" };
const STATUT_SUIVANT = { en_cours: "pret", pret: "servi" };
const STATUT_COLOR = { en_cours: theme.orange, pret: theme.green, servi: theme.textMuted };

const Icons = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  store: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  chef: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  menu: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  food: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6h5Z"/></svg>,
  drink: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 22h8"/><path d="M7 10h10"/><path d="m12 10 2.5-7.5H9.5L12 10"/><path d="M7 10c0 4.4 2.2 8 5 8s5-3.6 5-8"/></svg>,
  jobs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  orders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  kitchen: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  qr: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  recruit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  cart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill={theme.gold} stroke={theme.gold} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  image: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  trending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

const LogoLaunge = ({ size = 36 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="28" fill="url(#lg)" opacity="0.15"/>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="60" y2="60">
          <stop offset="0%" stopColor="#FF6B35"/>
          <stop offset="100%" stopColor="#FFD700"/>
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="28" stroke="url(#lg)" strokeWidth="1.5" fill="none"/>
      <ellipse cx="30" cy="38" rx="16" ry="2.5" fill="url(#lg)" opacity="0.4"/>
      <rect x="14" y="35" width="32" height="2" rx="1" fill="url(#lg)"/>
      <path d="M18 35 Q22 18 30 15 Q38 18 42 35" fill="url(#lg)" opacity="0.1" stroke="url(#lg)" strokeWidth="1.5"/>
      <circle cx="30" cy="14" r="3" fill="url(#lg)"/>
    </svg>
    <div>
      <div style={{ fontWeight: 800, fontSize: size * 0.5, background: "linear-gradient(135deg, #FF6B35, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "1px", lineHeight: 1 }}>LAUNGE</div>
      <div style={{ fontSize: size * 0.22, color: theme.textMuted, letterSpacing: "2px", textTransform: "uppercase" }}>Smart Dining</div>
    </div>
  </div>
);

const ImagePlat = ({ url, nom, size = 64 }) => (
  url
    ? <img src={url} alt={nom} style={{ width: size, height: size, borderRadius: 14, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />
    : <div style={{ width: size, height: size, borderRadius: 14, background: `linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,215,0,0.1))`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${theme.border}` }}>
        <span style={{ fontSize: size * 0.45 }}>🍽️</span>
      </div>
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
  const [nouveauPlat, setNouveauPlat] = useState({ nom: "", prix: "", categorie: "Plats", emoji: "🍽️", stock: "", seuil_alerte: "", image_url: "" });
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
  const [uploadingImage, setUploadingImage] = useState(false);
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
    const channel = supabase.channel("cmd-gerant")
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
    const channel = supabase.channel("cmd-cuisine")
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
      const dateKey = new Date(cmd.created_at).toDateString();
      const label = new Date(cmd.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      if (!parJour[dateKey]) parJour[dateKey] = { label, total: 0, commandes: 0, plats: {}, boissons: {} };
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
  const comptageItems = {};
  stats.forEach(cmd => { (cmd.items || []).forEach(i => { comptageItems[i.nom] = (comptageItems[i.nom] || 0) + i.qte; }); });
  const topItems = Object.entries(comptageItems).sort((a, b) => b[1] - a[1]);

  const chargerCommandesCuisine = async (id) => {
    const { data } = await supabase.from("commandes").select("*").eq("restaurant_id", id).neq("statut", "servi").order("created_at", { ascending: false });
    if (data) setCommandesCuisine(data);
  };

  const changerStatut = async (id, statut) => { await supabase.from("commandes").update({ statut }).eq("id", id); };
  const chargerMenuParCode = async (code) => {
    const res = await fetch(`${API}/api/restaurants/code/${code}`);
    const data = await res.json();
    if (data.error) { alert("Restaurant introuvable."); return; }
    setRestoId(data.id); setRestoInfo(data); chargerMenu(data.id);
  };
  const totalPanier = Object.entries(panier).reduce((acc, [id, qte]) => { const item = menu.find(i => i.id === id); return acc + (item ? item.prix * qte : 0); }, 0);
  const chargerMenu = async (id) => { const res = await fetch(`${API}/api/menu/${id}`); const data = await res.json(); setMenu(data); };
  const chargerCommandes = async (id) => { const res = await fetch(`${API}/api/commandes/${id}`); const data = await res.json(); setCommandes(data); };
  const chargerRestos = async () => { const res = await fetch(`${API}/api/restaurants`); const data = await res.json(); setRestos(data); };

  const uploadImage = async (file) => {
    setUploadingImage(true);
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('plats').upload(filename, file, { cacheControl: '3600', upsert: false });
    setUploadingImage(false);
    if (error) { alert("Erreur upload image : " + error.message); return null; }
    const { data: urlData } = supabase.storage.from('plats').getPublicUrl(filename);
    return urlData.publicUrl;
  };

  const inscrireGerant = async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/restaurants/inscription`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inscription) });
    const data = await res.json(); setLoading(false);
    if (data.error) return alert(data.error);
    alert(`Compte créé ! Code : ${data.code_unique}\n\nEn attente de validation admin.`); setVue("login-gerant");
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
    setMenu(m => [...m, data]); setNouveauPlat({ nom: "", prix: "", categorie: "Plats", emoji: "🍽️", stock: "", seuil_alerte: "", image_url: "" });
    alert("Article ajouté !");
  };

  const modifierPlat = async () => {
    const res = await fetch(`${API}/api/menu/${platEnEdition.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(platEnEdition) });
    const data = await res.json();
    if (data.error) return alert(data.error);
    setMenu(m => m.map(i => i.id === data.id ? data : i)); setPlatEnEdition(null);
  };

  const supprimerPlat = async (id) => { if (!confirm("Supprimer cet article ?")) return; await fetch(`${API}/api/menu/${id}`, { method: "DELETE" }); setMenu(m => m.filter(i => i.id !== id)); };

  const sauvegarderRecrutement = async () => {
    const res = await fetch(`${API}/api/restaurants/${gerant.id}/recrutement`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recrutement }) });
    const data = await res.json(); if (data.error) return alert(data.error);
    setGerant({ ...gerant, recrutement }); alert("Sauvegardé !");
  };

  const sauvegarderCodeCuisine = async () => {
    if (!nouveauCodeCuisine || nouveauCodeCuisine.length < 4) return alert("Min. 4 caractères.");
    const res = await fetch(`${API}/api/restaurants/${gerant.id}/code-cuisine`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code_cuisine: nouveauCodeCuisine }) });
    const data = await res.json(); if (data.error) return alert(data.error);
    setCodeCuisine(nouveauCodeCuisine); setNouveauCodeCuisine(""); alert("Code cuisine mis à jour !");
  };

  const passerCommande = async (modePaiement) => {
    const items = Object.entries(panier).map(([id, qte]) => { const item = menu.find(i => i.id === id); return { id, nom: item.nom, qte, prix: item.prix }; });
    const res = await fetch(`${API}/api/commandes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurant_id: restoId, numero_table: numeroTable, items, total: totalPanier, mode_paiement: modePaiement }) });
    const data = await res.json(); if (data.error) return alert(data.error);
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
  const supprimerResto = async (id) => { if (!confirm("Supprimer ce restaurant ?")) return; await fetch(`${API}/api/admin/restaurants/${id}`, { method: "DELETE" }); chargerRestosAdmin(); };
  // ── VUE CUISINE SÉPARÉE ──
  if (vue === "login-cuisine") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8f9ff 0%, #fff5f0 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: theme.font }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: gradients.orange, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(255,107,53,0.35)", color: "#fff" }}>{Icons.chef}</div>
          <h2 style={{ fontWeight: 800, fontSize: 24, color: "#1a1a2e", margin: "0 0 6px" }}>Espace Cuisine</h2>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>Accès réservé au personnel</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <label style={{ ...s.label, color: "#6b7280" }}>Code restaurant</label>
          <input placeholder="LNG-XXXXX" value={connexionCuisine.code_unique} onChange={e => setConnexionCuisine({ ...connexionCuisine, code_unique: e.target.value.toUpperCase() })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
          <label style={{ ...s.label, color: "#6b7280" }}>Code cuisine</label>
          <input placeholder="••••" type="password" value={connexionCuisine.code_cuisine} onChange={e => setConnexionCuisine({ ...connexionCuisine, code_cuisine: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
          <button onClick={connecterCuisine} style={{ ...s.btnOrange, marginTop: 8 }} disabled={loading}>{loading ? "Connexion..." : "Accéder à la cuisine"}</button>
        </div>
        <button onClick={() => setVue("accueil")} style={{ ...s.btnGhost, marginTop: 12, color: "#6b7280", borderColor: "#e5e7eb" }}>← Retour</button>
      </div>
    </div>
  );

  if (vue === "vue-cuisine") return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
      <audio ref={audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />
      <div style={{ background: "#fff", padding: "14px 20px", borderBottom: "1px solid #f0f0f5", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: gradients.orange, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Icons.chef}</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Cuisine — {restoCuisine?.nom}</p>
            {nouvellesCommandes > 0 && <p style={{ margin: 0, fontSize: 11, color: theme.orange, fontWeight: 600 }}>{nouvellesCommandes} nouvelle(s) commande(s)</p>}
          </div>
        </div>
        <button onClick={() => { setRestoCuisine(null); setCommandesCuisine([]); setNouvellesCommandes(0); setVue("accueil"); }} style={{ ...s.btnDanger, fontSize: 13 }}>Quitter</button>
      </div>
      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        {commandesCuisine.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,200,150,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: theme.green }}>{Icons.check}</div>
            <p style={{ color: "#9ca3af", fontSize: 15 }}>Aucune commande en attente</p>
          </div>
        )}
        {commandesCuisine.map(c => (
          <div key={c.id} style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderLeft: `4px solid ${STATUT_COLOR[c.statut] || theme.orange}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>Table {c.numero_table}</span>
                <span style={s.badge(STATUT_COLOR[c.statut] || theme.orange)}>{STATUT_LABEL[c.statut]}</span>
              </div>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f0f0f5" }}>
              {(c.items || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: "#374151" }}>
                  <span>{item.nom}</span>
                  <span style={{ fontWeight: 700, color: theme.orange }}>×{item.qte}</span>
                </div>
              ))}
            </div>
            {STATUT_SUIVANT[c.statut] && (
              <button onClick={() => changerStatut(c.id, STATUT_SUIVANT[c.statut])} style={{ ...s.btnGreen, width: "100%", padding: "12px" }}>
                {c.statut === "en_cours" ? "Marquer comme prêt" : "Marquer comme servi"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (vue === "login-admin") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0a2e, #0F1117)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: theme.font }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32, color: "#fff" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: gradients.purple, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(124,58,237,0.4)", color: "#fff" }}>{Icons.shield}</div>
          <h2 style={{ fontWeight: 800, fontSize: 24, margin: "0 0 6px" }}>Administration</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>Accès restreint</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
          <input placeholder="Email administrateur" type="email" value={connexionAdmin.email} onChange={e => setConnexionAdmin({ ...connexionAdmin, email: e.target.value })} style={{ ...s.input, marginBottom: 12 }} />
          <input placeholder="••••••••" type="password" value={connexionAdmin.mot_de_passe} onChange={e => setConnexionAdmin({ ...connexionAdmin, mot_de_passe: e.target.value })} style={s.input} />
          <button onClick={connecterAdmin} style={{ background: gradients.purple, color: "#fff", border: "none", borderRadius: 14, padding: "15px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }} disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
        </div>
      </div>
    </div>
  );

  if (vue === "admin-dashboard") {
    const enAttente = restosAdmin.filter(r => r.statut === "en_attente");
    const valides = restosAdmin.filter(r => r.statut === "valide");
    const refuses = restosAdmin.filter(r => r.statut === "refuse");
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
        <div style={{ background: "#fff", padding: "14px 20px", borderBottom: "1px solid #f0f0f5", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: gradients.purple, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Icons.shield}</div>
            <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Administration Launge</span>
          </div>
          <button onClick={() => { setAdmin(null); setVue("accueil"); }} style={{ ...s.btnDanger, fontSize: 13 }}>Déconnexion</button>
        </div>
        <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
          {enAttente.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, marginTop: 4 }}>
                <span style={{ ...s.sectionTitle, margin: 0, color: theme.orange }}>En attente de validation</span>
                <span style={{ ...s.badge(theme.orange), fontSize: 10 }}>{enAttente.length}</span>
              </div>
              {enAttente.map(r => (
                <div key={r.id} style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderLeft: `4px solid ${theme.orange}` }}>
                  <p style={{ fontWeight: 700, margin: "0 0 4px", color: "#1a1a2e", fontSize: 16 }}>{r.nom}</p>
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 14px" }}>{r.ville} · {r.email} · {r.telephone}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => validerResto(r.id)} style={{ ...s.btnGreen, flex: 1, padding: "11px" }}>Valider</button>
                    <button onClick={() => refuserResto(r.id)} style={{ ...s.btnDanger, flex: 1 }}>Refuser</button>
                  </div>
                </div>
              ))}
            </>
          )}
          <p style={{ ...s.sectionTitle, marginTop: 20 }}>Restaurants actifs ({valides.length})</p>
          {valides.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, margin: "0 0 2px", color: "#1a1a2e" }}>{r.nom}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{r.ville}</p>
              </div>
              <button onClick={() => supprimerResto(r.id)} style={s.btnDanger}>Supprimer</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vue === "accueil") return (
    <div style={{ minHeight: "100vh", fontFamily: theme.font, background: "#fff", overflow: "hidden" }}>
      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FFD700 50%, #FF6B35 100%)", backgroundSize: "200% 200%", padding: "60px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}></div>
        <div style={{ position: "absolute", bottom: -60, left: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: 100, padding: "8px 20px", marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: "0 0 8px #fff" }}></div>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "1px" }}>SMART DINING · CAMEROUN</span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-2px", textShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>LAUNGE</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, margin: "0 0 40px", fontWeight: 400 }}>La révolution digitale des restaurants camerounais</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto" }}>
            <button onClick={() => setVue("login-gerant")} style={{ background: "#fff", color: theme.orange, border: "none", borderRadius: 16, padding: "16px 24px", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {Icons.store} Espace Gérant
            </button>
            <button onClick={() => setVue("login-cuisine")} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: 16, padding: "15px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {Icons.chef} Espace Cuisine
            </button>
            <button onClick={() => { chargerRestos(); setVue("liste-restos"); }} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 16, padding: "15px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {Icons.user} Je suis un client
            </button>
          </div>
        </div>
      </div>
      {/* FEATURES */}
      <div style={{ padding: "32px 20px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: "📱", title: "QR Code", desc: "Commande depuis la table", color: theme.orange },
            { icon: "⚡", title: "Temps réel", desc: "Commandes en cuisine", color: "#3B82F6" },
            { icon: "📊", title: "Inventaire", desc: "Suivi automatique", color: theme.green },
            { icon: "🛡️", title: "Sécurisé", desc: "Accès par rôle", color: theme.purple },
          ].map((f, i) => (
            <div key={i} style={{ background: "#f8f9ff", borderRadius: 16, padding: "16px 14px", border: "1px solid #f0f0f5" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", margin: "0 0 4px" }}>{f.title}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (vue === "liste-restos") {
    const filtres = restos.filter(r => r.nom.toLowerCase().includes(recherche.toLowerCase()));
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
        <div style={{ background: gradients.orange, padding: "20px 20px 70px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button onClick={() => setVue("accueil")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "8px 12px", color: "#fff", cursor: "pointer" }}>{Icons.back}</button>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Restaurants</span>
            <div style={{ width: 38 }}></div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.7)" }}>{Icons.search}</div>
            <input placeholder="Rechercher un restaurant..." value={recherche} onChange={e => setRecherche(e.target.value)} style={{ ...s.input, paddingLeft: 44, marginBottom: 0, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 14 }} />
          </div>
        </div>
        <div style={{ padding: "0 16px", marginTop: -40 }}>
          {filtres.length === 0 && <div style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}><p style={{ color: "#9ca3af" }}>Aucun restaurant trouvé</p></div>}
          {filtres.map(r => (
            <div key={r.id} onClick={async () => {
              setRestoId(r.id); chargerMenu(r.id);
              const res = await fetch(`${API}/api/restaurants/${r.id}/info`);
              const data = await res.json();
              if (!data.error) setRestoInfo(data);
              setVue("menu");
            }} style={{ background: "#fff", borderRadius: 20, padding: 18, marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(135deg, #fff5f0, #fff8e7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: "1px solid #f0f0f5" }}>🍽️</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e", margin: "0 0 4px" }}>{r.nom}</p>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{r.ville}</p>
              </div>
              <div style={{ color: theme.orange }}>›</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vue === "inscription") return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
      <div style={{ background: "#fff", padding: "14px 20px", borderBottom: "1px solid #f0f0f5", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setVue("login-gerant")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>{Icons.back}</button>
        <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Inscrire mon restaurant</span>
      </div>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {[{ k: "nom", l: "Nom du restaurant", p: "Ex: Le Gourmet", t: "text" }, { k: "ville", l: "Ville", p: "Ex: Douala", t: "text" }, { k: "telephone", l: "Téléphone", p: "690 000 000", t: "text" }, { k: "email", l: "Email", p: "contact@resto.com", t: "email" }, { k: "mot_de_passe", l: "Mot de passe", p: "••••••••", t: "password" }].map(f => (
            <div key={f.k}>
              <label style={{ ...s.label, color: "#6b7280" }}>{f.l}</label>
              <input placeholder={f.p} type={f.t} value={inscription[f.k]} onChange={e => setInscription({ ...inscription, [f.k]: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
            </div>
          ))}
          <button onClick={inscrireGerant} style={s.btnOrange} disabled={loading}>{loading ? "Création..." : "Créer mon compte"}</button>
        </div>
      </div>
    </div>
  );

  if (vue === "login-gerant") return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: theme.font }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: gradients.orange, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(255,107,53,0.3)", color: "#fff", fontSize: 28 }}>🏪</div>
          <h2 style={{ fontWeight: 800, fontSize: 24, color: "#1a1a2e", margin: "0 0 6px" }}>Bienvenue</h2>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>Connectez-vous à votre espace</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <label style={{ ...s.label, color: "#6b7280" }}>Adresse email</label>
          <input placeholder="votre@email.com" type="email" value={connexion.email} onChange={e => setConnexion({ ...connexion, email: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
          <label style={{ ...s.label, color: "#6b7280" }}>Mot de passe</label>
          <input placeholder="••••••••" type="password" value={connexion.mot_de_passe} onChange={e => setConnexion({ ...connexion, mot_de_passe: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
          <button onClick={connecterGerant} style={{ ...s.btnOrange, marginTop: 4 }} disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
        </div>
        <button onClick={() => setVue("inscription")} style={{ ...s.btnGhost, marginTop: 12, borderColor: "#e5e7eb", color: "#6b7280" }}>Inscrire mon restaurant</button>
        <button onClick={() => setVue("accueil")} style={{ ...s.btnGhost, marginTop: 10, borderColor: "#e5e7eb", color: "#9ca3af" }}>← Retour</button>
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
        <div key={item.id} style={{ background: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "flex", gap: 14, alignItems: "center", opacity: item.stock === 0 ? 0.6 : 1 }}>
          <ImagePlat url={item.image_url} nom={item.nom} size={70} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.nom}</p>
            <p style={{ fontWeight: 800, color: theme.orange, fontSize: 15, margin: "0 0 6px" }}>{item.prix.toLocaleString()} FCFA</p>
            {item.stock === 0
              ? <span style={s.badge(theme.red)}>Épuisé</span>
              : <span style={s.chip("#22c55e")}>{item.stock} disponibles</span>}
          </div>
          {item.stock > 0 && (
            qte === 0
              ? <button onClick={() => modifier(item.id, 1)} style={{ ...s.btnOrange, width: "auto", padding: "10px 18px", fontSize: 13, borderRadius: 12, flexShrink: 0 }}>Ajouter</button>
              : <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff5f0", borderRadius: 12, padding: "6px 12px", border: `1px solid rgba(255,107,53,0.2)`, flexShrink: 0 }}>
                  <button onClick={() => modifier(item.id, -1)} style={{ background: "none", border: "none", color: theme.orange, cursor: "pointer", fontWeight: 800, fontSize: 20, lineHeight: 1, padding: 0 }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 16, minWidth: 20, textAlign: "center", color: "#1a1a2e" }}>{qte}</span>
                  <button onClick={() => modifier(item.id, 1)} style={{ background: "none", border: "none", color: theme.orange, cursor: "pointer", fontWeight: 800, fontSize: 20, lineHeight: 1, padding: 0 }}>+</button>
                </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
        <div style={{ background: gradients.orange, padding: "16px 20px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <button onClick={() => setVue("liste-restos")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "8px 12px", color: "#fff", cursor: "pointer" }}>{Icons.back}</button>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#fff" }}>{restoInfo?.nom || "Menu"}</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Table {numeroTable}</p>
            </div>
            <div style={{ width: 44 }}></div>
          </div>
        </div>

        <div style={{ margin: "-40px 16px 0", background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", borderBottom: "1px solid #f0f0f5" }}>
            {[["plats", Icons.food, "Plats"], ["boissons", Icons.drink, "Boissons"], ["jobs", Icons.jobs, "Emplois"]].map(([id, icon, label]) => (
              <button key={id} onClick={() => setOngletMenu(id)} style={{ flex: 1, padding: "14px 4px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: ongletMenu === id ? 700 : 500, color: ongletMenu === id ? theme.orange : "#9ca3af", borderBottom: ongletMenu === id ? `2px solid ${theme.orange}` : "2px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.2s" }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px 16px 100px" }}>
          {ongletMenu === "plats" && (<>{plats.length === 0 && <p style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>Aucun plat disponible</p>}{plats.map(renderItem)}</>)}
          {ongletMenu === "boissons" && (<>{boissons.length === 0 && <p style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>Aucune boisson disponible</p>}{boissons.map(renderItem)}</>)}
          {ongletMenu === "jobs" && (
            infoRecrutement?.actif
              ? <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderLeft: `4px solid ${theme.orange}` }}>
                  <p style={{ fontWeight: 800, fontSize: 18, color: "#1a1a2e", marginBottom: 16 }}>Nous recrutons !</p>
                  {[["Poste recherché", infoRecrutement.poste], ["Conditions", infoRecrutement.conditions], ["Contact", infoRecrutement.contact]].map(([l, v]) => (
                    <div key={l} style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 4px" }}>{l}</p>
                      <p style={{ fontSize: 14, color: "#374151", margin: 0, fontWeight: l === "Contact" ? 700 : 400, color: l === "Contact" ? theme.orange : "#374151" }}>{v}</p>
                    </div>
                  ))}
                </div>
              : <p style={{ textAlign: "center", color: "#9ca3af", marginTop: 40 }}>Aucun poste disponible pour le moment</p>
          )}
        </div>

        {totalPanier > 0 && (
          <div style={{ position: "fixed", bottom: 20, left: 16, right: 16, zIndex: 100 }}>
            <button onClick={() => setVue("paiement")} style={{ ...s.btnOrange, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderRadius: 18, boxShadow: "0 8px 32px rgba(255,107,53,0.4)", fontSize: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{Icons.cart} Commander</div>
              <span style={{ fontWeight: 800 }}>{totalPanier.toLocaleString()} FCFA</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (vue === "paiement") return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
      <div style={{ background: "#fff", padding: "14px 20px", borderBottom: "1px solid #f0f0f5", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <button onClick={() => setVue("menu")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>{Icons.back}</button>
        <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Paiement</span>
      </div>
      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ background: gradients.orange, borderRadius: 24, padding: 28, textAlign: "center", marginBottom: 24, boxShadow: "0 8px 32px rgba(255,107,53,0.25)" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 8px" }}>Total à régler</p>
          <p style={{ fontSize: 42, fontWeight: 900, color: "#fff", margin: 0 }}>{totalPanier.toLocaleString()} <span style={{ fontSize: 20, fontWeight: 600 }}>FCFA</span></p>
        </div>
        <p style={{ ...s.sectionTitle, color: "#9ca3af" }}>Choisir le mode de paiement</p>
        {[["Orange Money", "#FF6600", "📱"], ["MTN Mobile Money", "#FFCC00", "📲"], ["Espèces", "#22c55e", "💵"]].map(([label, color, icon]) => (
          <button key={label} onClick={() => passerCommande(label)} style={{ background: "#fff", border: `1.5px solid #f0f0f5`, borderRadius: 18, padding: "18px 20px", width: "100%", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", textAlign: "left" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Payer avec {label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (vue === "confirmation") return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: 40, textAlign: "center", fontFamily: theme.font }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: gradients.green, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 32px rgba(0,200,150,0.3)", color: "#fff" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ color: "#1a1a2e", fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Commande confirmée !</h2>
      <p style={{ color: "#9ca3af", marginBottom: 36, fontSize: 15 }}>Votre commande est en cours de préparation</p>
      <button onClick={() => setVue("accueil")} style={{ ...s.btnOrange, maxWidth: 280 }}>Retour à l'accueil</button>
    </div>
  );

  if (vue === "gerant") {
    const tabs = [
      { id: "dashboard", icon: Icons.dashboard, label: "Dashboard" },
      { id: "menu", icon: Icons.food, label: "Menu" },
      { id: "commandes", icon: Icons.orders, label: "Commandes" },
      { id: "cuisine", icon: Icons.kitchen, label: "Cuisine", badge: nouvellesCommandes },
      { id: "recrutement", icon: Icons.recruit, label: "Jobs" },
      { id: "parametres", icon: Icons.settings, label: "Réglages" },
      { id: "qrcodes", icon: Icons.qr, label: "QR Codes" },
    ];

    return (
      <div style={{ minHeight: "100vh", background: "#f8f9ff", fontFamily: theme.font }}>
        <audio ref={audioRef} src="https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3" />

        {/* HEADER */}
        <div style={{ background: "#fff", padding: "14px 20px", borderBottom: "1px solid #f0f0f5", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: gradients.orange, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
              {gerant?.nom?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{gerant?.nom}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Tableau de bord</p>
            </div>
          </div>
          <button onClick={() => { setGerant(null); setVue("accueil"); }} style={{ ...s.btnDanger, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{Icons.logout} Quitter</button>
        </div>

        {/* TABS */}
        <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f5", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map(({ id, icon, label, badge }) => (
            <button key={id} onClick={() => { setOnglet(id); if (id === "cuisine") setNouvellesCommandes(0); }} style={{ flex: "0 0 auto", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: onglet === id ? 700 : 500, color: onglet === id ? theme.orange : "#9ca3af", borderBottom: onglet === id ? `2px solid ${theme.orange}` : "2px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", transition: "all 0.2s" }}>
              {icon} {label}
              {badge > 0 && <span style={{ position: "absolute", top: 6, right: 6, background: theme.red, color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{badge}</span>}
            </button>
          ))}
        </div>

        <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>

          {onglet === "dashboard" && (
            <div>
              {/* STATS CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: gradients.orange, borderRadius: 20, padding: "18px 16px", boxShadow: "0 4px 20px rgba(255,107,53,0.25)" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>CA du mois</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 22, color: "#fff" }}>{caMois.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 500 }}> F</span></p>
                </div>
                <div style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)", borderRadius: 20, padding: "18px 16px", boxShadow: "0 4px 20px rgba(59,130,246,0.25)" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Commandes</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 22, color: "#fff" }}>{stats.length}</p>
                </div>
              </div>

              {/* STOCK */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <p style={s.sectionTitle}>Alertes stock</p>
                {menu.filter(i => i.stock <= i.seuil_alerte).length === 0
                  ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.green }}><span style={s.badge(theme.green)}>Tout est en stock</span></div>
                  : menu.filter(i => i.stock <= i.seuil_alerte).map(i => (
                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "10px 14px", background: i.stock === 0 ? "rgba(239,68,68,0.05)" : "rgba(249,115,22,0.05)", borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{i.emoji}</span>
                        <span style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>{i.nom}</span>
                      </div>
                      <span style={s.badge(i.stock === 0 ? theme.red : theme.orange)}>{i.stock === 0 ? "Épuisé" : `${i.stock} restants`}</span>
                    </div>
                  ))}
              </div>

              {/* TOP VENTES */}
              {topItems.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <p style={{ ...s.sectionTitle, margin: 0 }}>Top ventes du mois</p>
                    <span style={{ color: theme.orange }}>{Icons.trending}</span>
                  </div>
                  {topItems.slice(0, 5).map(([nom, qte], idx) => (
                    <div key={nom} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: idx === 0 ? "#FFF5CC" : idx === 1 ? "#F0F0F0" : "#FFF5F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: idx === 0 ? "#CC9900" : idx === 1 ? "#888" : theme.orange, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{nom}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: theme.orange }}>{qte}×</span>
                        </div>
                        <div style={{ height: 4, background: "#f0f0f5", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: gradients.orange, borderRadius: 2, width: `${Math.round((qte / topItems[0][1]) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INVENTAIRE JOURNALIER */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <p style={s.sectionTitle}>Inventaire journalier</p>
                {journees.length === 0 && <p style={{ color: "#9ca3af", fontSize: 14 }}>Aucune donnée pour le moment</p>}
                {journees.map(([dateKey, jour]) => {
                  const platsTries = Object.entries(jour.plats).sort((a, b) => b[1] - a[1]);
                  const boissonsTries = Object.entries(jour.boissons).sort((a, b) => b[1] - a[1]);
                  return (
                    <div key={dateKey} style={{ borderBottom: "1px solid #f0f0f5", paddingBottom: 16, marginBottom: 16 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 10 }}>{jour.label}</p>
                      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                        <div style={{ flex: 1, background: "#fff5f0", borderRadius: 12, padding: "10px 14px" }}>
                          <p style={{ margin: "0 0 2px", fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>CA</p>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: theme.orange }}>{jour.total.toLocaleString()} F</p>
                        </div>
                        <div style={{ flex: 1, background: "#f0f9ff", borderRadius: 12, padding: "10px 14px" }}>
                          <p style={{ margin: "0 0 2px", fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Commandes</p>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#3B82F6" }}>{jour.commandes}</p>
                        </div>
                      </div>
                      {platsTries.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Plats</p>
                          {platsTries.map(([nom, qte]) => (
                            <div key={nom} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#374151" }}>
                              <span>{nom}</span><span style={{ fontWeight: 700, color: theme.orange }}>{qte}×</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {boissonsTries.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Boissons</p>
                          {boissonsTries.map(([nom, qte]) => (
                            <div key={nom} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#374151" }}>
                              <span>{nom}</span><span style={{ fontWeight: 700, color: "#3B82F6" }}>{qte}×</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {onglet === "menu" && (
            <div>
              <div style={{ background: "#fff", borderRadius: 20, padding: 22, marginBottom: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <p style={s.sectionTitle}>Ajouter un article</p>
                {[{ k: "nom", l: "Nom du plat", p: "Ex: Ndolé spécial", t: "text" }, { k: "prix", l: "Prix (FCFA)", p: "Ex: 2500", t: "number" }].map(f => (
                  <div key={f.k}>
                    <label style={{ ...s.label, color: "#6b7280" }}>{f.l}</label>
                    <input placeholder={f.p} type={f.t} value={nouveauPlat[f.k]} onChange={e => setNouveauPlat({ ...nouveauPlat, [f.k]: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  </div>
                ))}
                <label style={{ ...s.label, color: "#6b7280" }}>Catégorie</label>
                <select value={nouveauPlat.categorie} onChange={e => setNouveauPlat({ ...nouveauPlat, categorie: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }}>
                  {["Plats", "Boissons"].map(c => <option key={c}>{c}</option>)}
                </select>
                <label style={{ ...s.label, color: "#6b7280" }}>Emoji</label>
                <input placeholder="🍽️" value={nouveauPlat.emoji} onChange={e => setNouveauPlat({ ...nouveauPlat, emoji: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                {[{ k: "stock", l: "Stock initial", p: "Ex: 20" }, { k: "seuil_alerte", l: "Seuil d'alerte", p: "Ex: 5" }].map(f => (
                  <div key={f.k}>
                    <label style={{ ...s.label, color: "#6b7280" }}>{f.l}</label>
                    <input placeholder={f.p} type="number" value={nouveauPlat[f.k]} onChange={e => setNouveauPlat({ ...nouveauPlat, [f.k]: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  </div>
                ))}
                <label style={{ ...s.label, color: "#6b7280" }}>Photo du plat</label>
                <div style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: "20px", textAlign: "center", marginBottom: 14, background: "#f9fafb", cursor: "pointer" }} onClick={() => document.getElementById('upload-new').click()}>
                  {nouveauPlat.image_url ? <img src={nouveauPlat.image_url} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} /> : <div style={{ color: "#9ca3af" }}>{Icons.image}<p style={{ margin: "8px 0 0", fontSize: 13 }}>Ajouter une photo</p></div>}
                  <input id="upload-new" type="file" accept="image/*" style={{ display: "none" }} onChange={async e => { const url = await uploadImage(e.target.files[0]); if (url) setNouveauPlat({ ...nouveauPlat, image_url: url }); }} />
                </div>
                <button onClick={ajouterPlat} style={s.btnOrange} disabled={uploadingImage}>{uploadingImage ? "Upload..." : "Ajouter au menu"}</button>
              </div>

              {platEnEdition && (
                <div style={{ background: "#fff", borderRadius: 20, padding: 22, marginBottom: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", borderLeft: `4px solid ${theme.orange}` }}>
                  <p style={{ ...s.sectionTitle, color: theme.orange }}>Modifier l'article</p>
                  <input value={platEnEdition.nom} onChange={e => setPlatEnEdition({ ...platEnEdition, nom: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  <input type="number" value={platEnEdition.prix} onChange={e => setPlatEnEdition({ ...platEnEdition, prix: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  <select value={platEnEdition.categorie} onChange={e => setPlatEnEdition({ ...platEnEdition, categorie: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }}>
                    {["Plats", "Boissons"].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input value={platEnEdition.emoji} onChange={e => setPlatEnEdition({ ...platEnEdition, emoji: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  <input type="number" value={platEnEdition.stock} onChange={e => setPlatEnEdition({ ...platEnEdition, stock: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  <input type="number" value={platEnEdition.seuil_alerte} onChange={e => setPlatEnEdition({ ...platEnEdition, seuil_alerte: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                  <div style={{ border: "2px dashed #e5e7eb", borderRadius: 14, padding: "16px", textAlign: "center", marginBottom: 14, background: "#f9fafb", cursor: "pointer" }} onClick={() => document.getElementById('upload-edit').click()}>
                    {platEnEdition.image_url ? <img src={platEnEdition.image_url} style={{ width: 70, height: 70, borderRadius: 10, objectFit: "cover" }} /> : <div style={{ color: "#9ca3af" }}>{Icons.image}<p style={{ margin: "6px 0 0", fontSize: 12 }}>Changer la photo</p></div>}
                    <input id="upload-edit" type="file" accept="image/*" style={{ display: "none" }} onChange={async e => { const url = await uploadImage(e.target.files[0]); if (url) setPlatEnEdition({ ...platEnEdition, image_url: url }); }} />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={modifierPlat} style={{ ...s.btnOrange, flex: 1 }}>Enregistrer</button>
                    <button onClick={() => setPlatEnEdition(null)} style={{ ...s.btnGhost, flex: 1, borderColor: "#e5e7eb", color: "#6b7280" }}>Annuler</button>
                  </div>
                </div>
              )}

              <p style={{ ...s.sectionTitle, marginTop: 8 }}>Articles ({menu.length})</p>
              {menu.map(item => (
                <div key={item.id} style={{ background: "#fff", borderRadius: 18, padding: "14px 16px", marginBottom: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                  <ImagePlat url={item.image_url} nom={item.nom} size={52} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "#1a1a2e", margin: "0 0 2px", fontSize: 14 }}>{item.nom}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{item.prix.toLocaleString()} FCFA · {item.stock} en stock · {item.categorie}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setPlatEnEdition({ ...item })} style={s.btnEdit}>Modifier</button>
                    <button onClick={() => supprimerPlat(item.id)} style={s.btnDanger}>Retirer</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onglet === "commandes" && (
            <div>
              <p style={s.sectionTitle}>Commandes ({commandes.length})</p>
              {commandes.length === 0 && <div style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}><p style={{ color: "#9ca3af" }}>Aucune commande</p></div>}
              {commandes.map((c, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", borderLeft: `4px solid ${STATUT_COLOR[c.statut] || theme.orange}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Table {c.numero_table}</span>
                      <span style={s.badge(STATUT_COLOR[c.statut] || theme.orange)}>{STATUT_LABEL[c.statut] || c.statut}</span>
                    </div>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 10px" }}>{c.mode_paiement}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f0f0f5", paddingTop: 10 }}>
                    <span style={{ color: "#9ca3af", fontSize: 13 }}>Total</span>
                    <span style={{ fontWeight: 800, color: theme.orange }}>{c.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onglet === "cuisine" && (
            <div>
              {commandesCuisine.length === 0 && (
                <div style={{ background: "#fff", borderRadius: 20, padding: 60, textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(0,200,150,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: theme.green }}>{Icons.check}</div>
                  <p style={{ color: "#9ca3af" }}>Aucune commande en attente</p>
                </div>
              )}
              {commandesCuisine.map(c => (
                <div key={c.id} style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", borderLeft: `4px solid ${STATUT_COLOR[c.statut] || theme.orange}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>Table {c.numero_table}</span>
                      <span style={s.badge(STATUT_COLOR[c.statut] || theme.orange)}>{STATUT_LABEL[c.statut]}</span>
                    </div>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f0f0f5" }}>
                    {(c.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: "#374151" }}>
                        <span>{item.nom}</span>
                        <span style={{ fontWeight: 700, color: theme.orange }}>×{item.qte}</span>
                      </div>
                    ))}
                  </div>
                  {STATUT_SUIVANT[c.statut] && (
                    <button onClick={() => changerStatut(c.id, STATUT_SUIVANT[c.statut])} style={{ ...s.btnGreen, width: "100%", padding: "12px" }}>
                      {c.statut === "en_cours" ? "Marquer comme prêt" : "Marquer comme servi"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {onglet === "recrutement" && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <p style={s.sectionTitle}>Gestion du recrutement</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#f9fafb", borderRadius: 14, marginBottom: 20, border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Recrutement actif</span>
                <button onClick={() => setRecrutement({ ...recrutement, actif: !recrutement.actif })} style={{ background: recrutement.actif ? theme.green : "#e5e7eb", border: "none", borderRadius: 20, width: 52, height: 28, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: recrutement.actif ? 27 : 3, transition: "left 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}></div>
                </button>
              </div>
              {recrutement.actif && (
                <>
                  {[{ k: "poste", l: "Poste recherché", p: "Ex: Serveur, Cuisinier...", t: "text" }, { k: "contact", l: "Contact", p: "Téléphone ou email", t: "text" }].map(f => (
                    <div key={f.k}>
                      <label style={{ ...s.label, color: "#6b7280" }}>{f.l}</label>
                      <input placeholder={f.p} type={f.t} value={recrutement[f.k]} onChange={e => setRecrutement({ ...recrutement, [f.k]: e.target.value })} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                    </div>
                  ))}
                  <label style={{ ...s.label, color: "#6b7280" }}>Conditions</label>
                  <textarea placeholder="Expérience, horaires, salaire..." value={recrutement.conditions} onChange={e => setRecrutement({ ...recrutement, conditions: e.target.value })} style={{ ...s.input, height: 90, resize: "none", background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
                </>
              )}
              <button onClick={sauvegarderRecrutement} style={s.btnOrange}>Sauvegarder</button>
            </div>
          )}

          {onglet === "parametres" && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <p style={s.sectionTitle}>Code d'accès cuisine</p>
              <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>Ce code permet à votre cuisinier d'accéder uniquement à la vue cuisine, sans voir vos données financières.</p>
              {codeCuisine && (
                <div style={{ background: "#fff5f0", borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: "1px solid rgba(255,107,53,0.2)" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Code actuel</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: 8, color: theme.orange }}>{codeCuisine}</p>
                </div>
              )}
              <div style={{ background: "#f9fafb", borderRadius: 14, padding: "14px 18px", marginBottom: 16, border: "1px solid #e5e7eb" }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Code restaurant</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, letterSpacing: 2, color: "#1a1a2e" }}>{gerant?.code_unique}</p>
              </div>
              <label style={{ ...s.label, color: "#6b7280" }}>Nouveau code cuisine</label>
              <input placeholder="Min. 4 caractères" value={nouveauCodeCuisine} onChange={e => setNouveauCodeCuisine(e.target.value)} style={{ ...s.input, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#1a1a2e" }} />
              <button onClick={sauvegarderCodeCuisine} style={s.btnOrange}>Sauvegarder</button>
            </div>
          )}

          {onglet === "qrcodes" && (
            <div>
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 14, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <p style={s.sectionTitle}>Nombre de tables</p>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <button onClick={() => setNbTables(n => Math.max(1, n - 1))} style={{ width: 44, height: 44, borderRadius: 12, background: "#f9fafb", border: "1.5px solid #e5e7eb", color: "#374151", cursor: "pointer", fontWeight: 700, fontSize: 22 }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 30, minWidth: 50, textAlign: "center", color: "#1a1a2e" }}>{nbTables}</span>
                  <button onClick={() => setNbTables(n => n + 1)} style={{ width: 44, height: 44, borderRadius: 12, background: gradients.orange, border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 22, boxShadow: "0 4px 16px rgba(255,107,53,0.3)" }}>+</button>
                </div>
              </div>
              {Array.from({ length: nbTables }, (_, i) => i + 1).map(table => (
                <div key={table} style={{ background: "#fff", borderRadius: 20, padding: 20, marginBottom: 12, textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                  <p style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e", marginBottom: 16 }}>Table {table}</p>
                  <div style={{ background: "#fff", padding: 16, borderRadius: 16, display: "inline-block", marginBottom: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f0f0f5" }}>
                    <QRCode value={lienQR(table)} size={150} bgColor="#fff" fgColor="#1a1a2e" />
                  </div>
                  <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 14, wordBreak: "break-all", padding: "0 16px" }}>{lienQR(table)}</p>
                  <button onClick={() => window.print()} style={{ ...s.btnGhost, maxWidth: 200, margin: "0 auto", borderColor: "#e5e7eb", color: "#6b7280" }}>Imprimer</button>
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