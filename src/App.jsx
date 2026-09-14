import { useState, useEffect, useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { supabase } from "./supabaseClient";

const API = "https://launge-backend-production.up.railway.app";

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
  minus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  table: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="4" rx="1"/><line x1="6" y1="8" x2="6" y2="20"/><line x1="18" y1="8" x2="18" y2="20"/></svg>,
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
  const nbArticlesPanier = Object.values(panier).reduce((a, q) => a + q, 0);
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

  // ============================================================
  // VUE : ACCUEIL
  // ============================================================
  if (vue === "accueil") {
    return (
      <div style={{ ...s.page, background: gradients.hero }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 50 }}><LogoLaunge size={44} /></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={s.badge(theme.orange)}>Le menu digital des restaurateurs</div>
            <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.15, margin: "20px 0 14px" }}>
              Votre restaurant,<br/>servi en un <span style={{ background: "linear-gradient(135deg, #FF6B35, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>scan.</span>
            </h1>
            <p style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 1.6, marginBottom: 36 }}>
              Menu digital, commandes en direct, cuisine synchronisée et statistiques claires — tout ce qu'il faut pour piloter votre salle depuis votre poche.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button style={s.btnOrange} onClick={() => setVue("login-gerant")}>{Icons.store} <span style={{ marginLeft: 8 }}>Espace gérant</span></button>
              <button style={s.btnGhost} onClick={() => setVue("inscription-gerant")}>Créer mon restaurant sur Launge</button>
              <button style={{ ...s.btnGhost, borderColor: "rgba(0,200,150,0.25)", color: theme.green }} onClick={() => setVue("login-cuisine")}>{Icons.chef} <span style={{ marginLeft: 8 }}>Accès cuisine</span></button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", paddingTop: 30, borderTop: `1px solid ${theme.border}` }}>
            {[["Menu client", theme.orange], ["Cuisine live", theme.green], ["Statistiques", theme.purple]].map(([label, color]) => (
              <div key={label} style={{ ...s.chip(color), fontSize: 10 }}>{label}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : LOGIN GÉRANT
  // ============================================================
  if (vue === "login-gerant") {
    return (
      <div style={s.page}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 24px" }}>
          <button onClick={() => setVue("accueil")} style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", marginBottom: 30, display: "flex", alignItems: "center", gap: 6 }}>{Icons.back} Retour</button>
          <div style={{ marginBottom: 36 }}><LogoLaunge size={36} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Connexion gérant</h2>
          <p style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 28 }}>Accédez à votre tableau de bord restaurant.</p>
          <label style={s.label}>Email</label>
          <input style={s.input} placeholder="vous@restaurant.com" value={connexion.email} onChange={e => setConnexion({ ...connexion, email: e.target.value })} />
          <label style={s.label}>Mot de passe</label>
          <input style={s.input} type="password" placeholder="••••••••" value={connexion.mot_de_passe} onChange={e => setConnexion({ ...connexion, mot_de_passe: e.target.value })} />
          <button style={{ ...s.btnOrange, marginTop: 8, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={connecterGerant}>{loading ? "Connexion..." : "Se connecter"}</button>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: theme.textSecondary }}>
            Pas encore de compte ? <span style={{ color: theme.gold, cursor: "pointer", fontWeight: 600 }} onClick={() => setVue("inscription-gerant")}>Inscrivez votre restaurant</span>
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : INSCRIPTION GÉRANT
  // ============================================================
  if (vue === "inscription-gerant") {
    return (
      <div style={s.page}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 24px" }}>
          <button onClick={() => setVue("accueil")} style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", marginBottom: 30, display: "flex", alignItems: "center", gap: 6 }}>{Icons.back} Retour</button>
          <div style={{ marginBottom: 36 }}><LogoLaunge size={36} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Créer mon restaurant</h2>
          <p style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 28 }}>Votre compte sera activé après validation.</p>
          <label style={s.label}>Nom du restaurant</label>
          <input style={s.input} placeholder="Chez Bella" value={inscription.nom} onChange={e => setInscription({ ...inscription, nom: e.target.value })} />
          <label style={s.label}>Ville</label>
          <input style={s.input} placeholder="Douala" value={inscription.ville} onChange={e => setInscription({ ...inscription, ville: e.target.value })} />
          <label style={s.label}>Téléphone</label>
          <input style={s.input} placeholder="6XX XXX XXX" value={inscription.telephone} onChange={e => setInscription({ ...inscription, telephone: e.target.value })} />
          <label style={s.label}>Email</label>
          <input style={s.input} placeholder="vous@restaurant.com" value={inscription.email} onChange={e => setInscription({ ...inscription, email: e.target.value })} />
          <label style={s.label}>Mot de passe</label>
          <input style={s.input} type="password" placeholder="••••••••" value={inscription.mot_de_passe} onChange={e => setInscription({ ...inscription, mot_de_passe: e.target.value })} />
          <button style={{ ...s.btnGold, marginTop: 8, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={inscrireGerant}>{loading ? "Création..." : "Créer mon compte"}</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : LOGIN CUISINE
  // ============================================================
  if (vue === "login-cuisine") {
    return (
      <div style={s.page}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 24px" }}>
          <button onClick={() => setVue("accueil")} style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", marginBottom: 30, display: "flex", alignItems: "center", gap: 6 }}>{Icons.back} Retour</button>
          <div style={{ ...s.badge(theme.green), marginBottom: 20 }}>{Icons.chef} <span style={{ marginLeft: 6 }}>Accès cuisine</span></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Poste cuisine</h2>
          <p style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 28 }}>Renseignez le code restaurant et le code cuisine fournis par votre gérant.</p>
          <label style={s.label}>Code restaurant</label>
          <input style={s.input} placeholder="Ex: BELLA23" value={connexionCuisine.code_unique} onChange={e => setConnexionCuisine({ ...connexionCuisine, code_unique: e.target.value })} />
          <label style={s.label}>Code cuisine</label>
          <input style={s.input} type="password" placeholder="Code cuisine" value={connexionCuisine.code_cuisine} onChange={e => setConnexionCuisine({ ...connexionCuisine, code_cuisine: e.target.value })} />
          <button style={{ ...s.btnGreen, width: "100%", padding: "15px 24px", fontSize: 15, marginTop: 8, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={connecterCuisine}>{loading ? "Connexion..." : "Entrer en cuisine"}</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : CUISINE (file d'attente temps réel)
  // ============================================================
  if (vue === "vue-cuisine") {
    const enCours = commandesCuisine.filter(c => c.statut === "en_cours");
    const prets = commandesCuisine.filter(c => c.statut === "pret");
    const Colonne = ({ titre, liste, color }) => (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
          <span style={{ fontWeight: 700, fontSize: 13, color, letterSpacing: "0.5px" }}>{titre} ({liste.length})</span>
        </div>
        {liste.length === 0 && <div style={{ ...s.card, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Rien pour l'instant</div>}
        {liste.map(cmd => (
          <div key={cmd.id} style={{ ...s.card, borderLeft: `3px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={s.chip(theme.gold)}>{Icons.table} Table {cmd.numero_table}</span>
              <span style={{ fontSize: 11, color: theme.textMuted }}>{new Date(cmd.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {(cmd.items || []).map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0" }}>
                <span>{it.nom}</span><span style={{ color: theme.gold, fontWeight: 700 }}>x{it.qte}</span>
              </div>
            ))}
            <button style={{ ...s.btnGreen, width: "100%", marginTop: 12 }} onClick={() => changerStatut(cmd.id, STATUT_SUIVANT[cmd.statut])}>
              {cmd.statut === "en_cours" ? "Marquer prêt" : "Marquer servi"}
            </button>
          </div>
        ))}
      </div>
    );
    return (
      <div style={s.page}>
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" />
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {Icons.chef}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{restoCuisine?.nom}</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>Poste cuisine</div>
            </div>
          </div>
          <button style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer" }} onClick={() => { setRestoCuisine(null); setCommandesCuisine([]); setVue("accueil"); }}>{Icons.logout}</button>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Colonne titre="En préparation" liste={enCours} color={theme.orange} />
          <Colonne titre="Prêt à servir" liste={prets} color={theme.green} />
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : MENU CLIENT
  // ============================================================
  if (vue === "menu") {
    const categories = ongletMenu === "plats" ? ["Plats", "Entrées", "Desserts"] : ["Boissons"];
    const menuFiltre = menu.filter(m => categories.includes(m.categorie) && m.nom.toLowerCase().includes(recherche.toLowerCase()));
    return (
      <div style={s.page}>
        <div style={{ ...s.header, flexDirection: "column", alignItems: "stretch", gap: 12, paddingBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{restoInfo?.nom || "Menu"}</div>
              <div style={{ fontSize: 11, color: theme.textMuted, display: "flex", alignItems: "center", gap: 4 }}>{Icons.table} Table {numeroTable}</div>
            </div>
            <div style={s.badge(theme.orange)}>{Icons.cart} <span style={{ marginLeft: 6 }}>{nbArticlesPanier}</span></div>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 12, color: theme.textMuted }}>{Icons.search}</span>
            <input style={{ ...s.input, paddingLeft: 40, marginBottom: 0 }} placeholder="Rechercher un plat..." value={recherche} onChange={e => setRecherche(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setOngletMenu("plats")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: theme.font, background: ongletMenu === "plats" ? gradients.orange : "rgba(255,255,255,0.05)", color: ongletMenu === "plats" ? "#fff" : theme.textSecondary }}>{Icons.food} <span style={{ marginLeft: 6 }}>Plats</span></button>
            <button onClick={() => setOngletMenu("boissons")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: theme.font, background: ongletMenu === "boissons" ? gradients.gold : "rgba(255,255,255,0.05)", color: ongletMenu === "boissons" ? "#0F1117" : theme.textSecondary }}>{Icons.drink} <span style={{ marginLeft: 6 }}>Boissons</span></button>
          </div>
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 120px" }}>
          {categories.map(cat => {
            const items = menuFiltre.filter(m => m.categorie === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} style={{ marginBottom: 24 }}>
                <div style={s.sectionTitle}>{cat}</div>
                {items.map(item => {
                  const qte = panier[item.id] || 0;
                  const rupture = item.stock <= 0;
                  const stockBas = item.stock > 0 && item.stock <= (item.seuil_alerte || 3);
                  return (
                    <div key={item.id} style={{ ...s.card, display: "flex", gap: 14, alignItems: "center", opacity: rupture ? 0.5 : 1 }}>
                      <ImagePlat url={item.image_url} nom={item.nom} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {item.nom}
                          {stockBas && !rupture && <span style={{ ...s.chip(theme.orange), fontSize: 9 }}>Bientôt épuisé</span>}
                          {rupture && <span style={{ ...s.chip(theme.red), fontSize: 9 }}>Rupture</span>}
                        </div>
                        <div style={{ color: theme.gold, fontWeight: 800, fontSize: 15 }}>{item.prix} FCFA</div>
                      </div>
                      {!rupture && (
                        qte === 0
                          ? <button onClick={() => modifier(item.id, 1)} style={{ background: gradients.orange, border: "none", borderRadius: 12, width: 38, height: 38, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Icons.plus}</button>
                          : <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "4px 6px", flexShrink: 0 }}>
                              <button onClick={() => modifier(item.id, -1)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 26, height: 26, color: theme.textPrimary, cursor: "pointer" }}>{Icons.minus}</button>
                              <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{qte}</span>
                              <button onClick={() => modifier(item.id, 1)} style={{ background: gradients.orange, border: "none", borderRadius: 8, width: 26, height: 26, color: "#fff", cursor: "pointer" }}>{Icons.plus}</button>
                            </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {menuFiltre.length === 0 && <div style={{ textAlign: "center", color: theme.textMuted, padding: 40 }}>Aucun résultat pour "{recherche}"</div>}
        </div>

        {nbArticlesPanier > 0 && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,17,23,0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${theme.borderGold}`, padding: 16 }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <button style={{ ...s.btnGold, display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setVue("panier")}>
                <span>{nbArticlesPanier} article{nbArticlesPanier > 1 ? "s" : ""} — Voir le panier</span>
                <span>{totalPanier} FCFA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // VUE : PANIER / CHECKOUT
  // ============================================================
  if (vue === "panier") {
    const lignes = Object.entries(panier).filter(([, q]) => q > 0).map(([id, qte]) => ({ item: menu.find(i => i.id === id), qte }));
    return (
      <div style={s.page}>
        <div style={s.header}>
          <button onClick={() => setVue("menu")} style={{ background: "none", border: "none", color: theme.textPrimary, cursor: "pointer" }}>{Icons.back}</button>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Votre panier</div>
          <div style={{ width: 20 }} />
        </div>
        <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
          {lignes.map(({ item, qte }) => (
            <div key={item.id} style={{ ...s.card, display: "flex", gap: 14, alignItems: "center" }}>
              <ImagePlat url={item.image_url} nom={item.nom} size={54} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.nom}</div>
                <div style={{ color: theme.textMuted, fontSize: 12 }}>{item.prix} FCFA x {qte}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "4px 6px" }}>
                <button onClick={() => modifier(item.id, -1)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 26, height: 26, color: theme.textPrimary, cursor: "pointer" }}>{Icons.minus}</button>
                <span style={{ fontWeight: 700, minWidth: 16, textAlign: "center" }}>{qte}</span>
                <button onClick={() => modifier(item.id, 1)} style={{ background: gradients.orange, border: "none", borderRadius: 8, width: 26, height: 26, color: "#fff", cursor: "pointer" }}>{Icons.plus}</button>
              </div>
            </div>
          ))}
          <div style={{ ...s.cardGold, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 17, fontWeight: 800 }}>
            <span>Total</span><span style={{ color: theme.gold }}>{totalPanier} FCFA</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={s.label}>Mode de paiement</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={s.btnOrange} onClick={() => passerCommande("especes")}>Payer en espèces à table</button>
              <button style={s.btnGold} onClick={() => passerCommande("mobile_money")}>Payer par Mobile Money</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : CONFIRMATION
  // ============================================================
  if (vue === "confirmation") {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: gradients.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(0,200,150,0.35)" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Commande envoyée !</h2>
          <p style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>La cuisine a été notifiée. Votre commande sera bientôt en préparation, restez à votre table.</p>
          <button style={s.btnGhost} onClick={() => setVue("menu")}>Commander autre chose</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : LOGIN ADMIN
  // ============================================================
  if (vue === "login-admin") {
    return (
      <div style={s.page}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ ...s.badge(theme.purple), marginBottom: 20 }}>{Icons.shield} <span style={{ marginLeft: 6 }}>Administration</span></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Connexion admin</h2>
          <label style={s.label}>Email</label>
          <input style={s.input} value={connexionAdmin.email} onChange={e => setConnexionAdmin({ ...connexionAdmin, email: e.target.value })} />
          <label style={s.label}>Mot de passe</label>
          <input style={s.input} type="password" value={connexionAdmin.mot_de_passe} onChange={e => setConnexionAdmin({ ...connexionAdmin, mot_de_passe: e.target.value })} />
          <button style={{ background: gradients.purple, color: "#fff", border: "none", borderRadius: 14, padding: "15px 24px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", fontFamily: theme.font }} disabled={loading} onClick={connecterAdmin}>{loading ? "..." : "Se connecter"}</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : ADMIN DASHBOARD
  // ============================================================
  if (vue === "admin-dashboard") {
    const enAttente = restosAdmin.filter(r => r.statut === "en_attente");
    const valides = restosAdmin.filter(r => r.statut === "valide");
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{Icons.shield}<span style={{ fontWeight: 700 }}>Admin Launge</span></div>
          <button style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer" }} onClick={() => { setAdmin(null); setVue("accueil"); }}>{Icons.logout}</button>
        </div>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
          <div style={s.sectionTitle}>En attente de validation ({enAttente.length})</div>
          {enAttente.map(r => (
            <div key={r.id} style={s.cardOrange}>
              <div style={{ fontWeight: 700 }}>{r.nom}</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>{r.ville} · {r.email} · {r.telephone}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btnGreen} onClick={() => validerResto(r.id)}>Valider</button>
                <button style={s.btnDanger} onClick={() => refuserResto(r.id)}>Refuser</button>
              </div>
            </div>
          ))}
          {enAttente.length === 0 && <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>Aucune demande en attente.</div>}

          <div style={{ ...s.sectionTitle, marginTop: 28 }}>Restaurants actifs ({valides.length})</div>
          {valides.map(r => (
            <div key={r.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.nom}</div>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>{r.ville} · code {r.code_unique}</div>
                </div>
                <button style={s.btnDanger} onClick={() => supprimerResto(r.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // VUE : GÉRANT — DASHBOARD PRINCIPAL
  // ============================================================
  if (vue === "gerant" && gerant) {
    const enCours = commandesCuisine.filter(c => c.statut === "en_cours");
    const prets = commandesCuisine.filter(c => c.statut === "pret");
    const ruptures = menu.filter(m => m.stock <= 0);
    const stockBas = menu.filter(m => m.stock > 0 && m.stock <= (m.seuil_alerte || 3));

    const NavItem = ({ id, icon, label, badge }) => (
      <button onClick={() => { setOnglet(id); if (id === "commandes") setNouvellesCommandes(0); }} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
        background: onglet === id ? "rgba(255,107,53,0.12)" : "transparent",
        color: onglet === id ? theme.orange : theme.textSecondary,
        fontWeight: onglet === id ? 700 : 500, fontSize: 14, fontFamily: theme.font, width: "100%", textAlign: "left", position: "relative",
      }}>
        {icon}<span>{label}</span>
        {badge > 0 && <span style={{ marginLeft: "auto", background: theme.red, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "2px 7px" }}>{badge}</span>}
      </button>
    );

    return (
      <div style={{ ...s.page, display: "flex" }}>
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" />
        {/* Sidebar */}
        <div style={{ width: 240, borderRight: `1px solid ${theme.border}`, padding: 20, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
          <div style={{ marginBottom: 30 }}><LogoLaunge size={30} /></div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 20, paddingLeft: 4 }}>{gerant.nom}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <NavItem id="dashboard" icon={Icons.dashboard} label="Tableau de bord" />
            <NavItem id="menu" icon={Icons.menu} label="Menu" />
            <NavItem id="commandes" icon={Icons.orders} label="Commandes" badge={nouvellesCommandes} />
            <NavItem id="qr" icon={Icons.qr} label="QR Codes" />
            <NavItem id="recrutement" icon={Icons.recruit} label="Recrutement" />
            <NavItem id="parametres" icon={Icons.settings} label="Paramètres" />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "none", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: 13, fontFamily: theme.font }} onClick={() => { setGerant(null); setVue("accueil"); }}>{Icons.logout} Déconnexion</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px 32px", maxWidth: 1000 }}>

          {onglet === "dashboard" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Tableau de bord</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
                <div style={s.cardGold}><div style={s.label}>Chiffre d'affaires (mois)</div><div style={{ fontSize: 24, fontWeight: 800, color: theme.gold }}>{caMois.toLocaleString()} FCFA</div></div>
                <div style={s.cardOrange}><div style={s.label}>Commandes en cours</div><div style={{ fontSize: 24, fontWeight: 800, color: theme.orange }}>{enCours.length}</div></div>
                <div style={s.cardGreen}><div style={s.label}>Prêtes à servir</div><div style={{ fontSize: 24, fontWeight: 800, color: theme.green }}>{prets.length}</div></div>
                <div style={{ ...s.card, border: `1px solid rgba(239,68,68,0.25)` }}><div style={s.label}>Ruptures de stock</div><div style={{ fontSize: 24, fontWeight: 800, color: theme.red }}>{ruptures.length}</div></div>
              </div>

              {(ruptures.length > 0 || stockBas.length > 0) && (
                <div style={{ ...s.card, border: `1px solid rgba(255,107,53,0.25)`, marginBottom: 24 }}>
                  <div style={{ ...s.sectionTitle, marginBottom: 10 }}>Alertes stock</div>
                  {ruptures.map(m => <div key={m.id} style={{ fontSize: 13, padding: "4px 0", color: theme.red }}>● {m.nom} — épuisé</div>)}
                  {stockBas.map(m => <div key={m.id} style={{ fontSize: 13, padding: "4px 0", color: theme.orange }}>● {m.nom} — {m.stock} restant(s)</div>)}
                </div>
              )}

              <div style={s.sectionTitle}>Top des ventes</div>
              <div style={s.card}>
                {topItems.slice(0, 5).map(([nom, qte], i) => (
                  <div key={nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${theme.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...s.badge(theme.gold), width: 22, height: 22, justifyContent: "center", padding: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 14 }}>{nom}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: theme.gold }}>{qte} vendus</span>
                  </div>
                ))}
                {topItems.length === 0 && <div style={{ color: theme.textMuted, fontSize: 13 }}>Pas encore de données.</div>}
              </div>

              <div style={{ ...s.sectionTitle, marginTop: 24 }}>Historique par journée</div>
              {journees.slice(0, 5).map(([key, j]) => (
                <div key={key} style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 4, textTransform: "capitalize" }}>
                    <span>{j.label}</span><span style={{ color: theme.gold }}>{j.total.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted }}>{j.commandes} commande{j.commandes > 1 ? "s" : ""}</div>
                </div>
              ))}
            </>
          )}

          {onglet === "menu" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Gestion du menu</h2>
              <div style={{ ...s.card, marginBottom: 24 }}>
                <div style={{ ...s.sectionTitle, marginBottom: 14 }}>{platEnEdition ? "Modifier l'article" : "Ajouter un article"}</div>
                {(() => {
                  const cible = platEnEdition || nouveauPlat;
                  const setCible = platEnEdition ? setPlatEnEdition : setNouveauPlat;
                  return (
                    <>
                      <div style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center" }}>
                        <ImagePlat url={cible.image_url} nom={cible.nom} size={64} />
                        <label style={{ ...s.btnGhost, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "auto", padding: "10px 16px", cursor: uploadingImage ? "wait" : "pointer" }}>
                          {Icons.image} {uploadingImage ? "Envoi..." : "Choisir une photo"}
                          <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingImage} onChange={async e => {
                            const file = e.target.files[0]; if (!file) return;
                            const url = await uploadImage(file);
                            if (url) setCible({ ...cible, image_url: url });
                          }} />
                        </label>
                      </div>
                      <label style={s.label}>Nom du plat</label>
                      <input style={s.input} value={cible.nom} onChange={e => setCible({ ...cible, nom: e.target.value })} />
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}><label style={s.label}>Prix (FCFA)</label><input style={s.input} type="number" value={cible.prix} onChange={e => setCible({ ...cible, prix: e.target.value })} /></div>
                        <div style={{ flex: 1 }}>
                          <label style={s.label}>Catégorie</label>
                          <select style={s.input} value={cible.categorie} onChange={e => setCible({ ...cible, categorie: e.target.value })}>
                            <option>Plats</option><option>Entrées</option><option>Desserts</option><option>Boissons</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}><label style={s.label}>Stock disponible</label><input style={s.input} type="number" value={cible.stock} onChange={e => setCible({ ...cible, stock: e.target.value })} /></div>
                        <div style={{ flex: 1 }}><label style={s.label}>Seuil d'alerte</label><input style={s.input} type="number" value={cible.seuil_alerte} onChange={e => setCible({ ...cible, seuil_alerte: e.target.value })} /></div>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <button style={s.btnOrange} onClick={platEnEdition ? modifierPlat : ajouterPlat}>{platEnEdition ? "Enregistrer" : "Ajouter au menu"}</button>
                        {platEnEdition && <button style={s.btnGhost} onClick={() => setPlatEnEdition(null)}>Annuler</button>}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div style={s.sectionTitle}>Articles du menu ({menu.length})</div>
              {menu.map(item => (
                <div key={item.id} style={{ ...s.card, display: "flex", gap: 14, alignItems: "center" }}>
                  <ImagePlat url={item.image_url} nom={item.nom} size={54} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{item.nom}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted }}>{item.categorie} · {item.prix} FCFA · Stock: {item.stock}</div>
                  </div>
                  <button style={s.btnEdit} onClick={() => setPlatEnEdition(item)}>Modifier</button>
                  <button style={s.btnDanger} onClick={() => supprimerPlat(item.id)}>Suppr.</button>
                </div>
              ))}
            </>
          )}

          {onglet === "commandes" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Commandes en direct</h2>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {["en_cours", "pret"].map(statut => (
                  <div key={statut} style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ ...s.sectionTitle, color: STATUT_COLOR[statut] }}>{STATUT_LABEL[statut]} ({commandesCuisine.filter(c => c.statut === statut).length})</div>
                    {commandesCuisine.filter(c => c.statut === statut).map(cmd => (
                      <div key={cmd.id} style={{ ...s.card, borderLeft: `3px solid ${STATUT_COLOR[statut]}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={s.chip(theme.gold)}>Table {cmd.numero_table}</span>
                          <span style={{ fontSize: 11, color: theme.textMuted }}>{new Date(cmd.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {(cmd.items || []).map((it, i) => <div key={i} style={{ fontSize: 13, display: "flex", justifyContent: "space-between" }}><span>{it.nom}</span><span>x{it.qte}</span></div>)}
                        <div style={{ fontWeight: 700, color: theme.gold, marginTop: 8, textAlign: "right" }}>{cmd.total} FCFA</div>
                        <button style={{ ...s.btnGreen, width: "100%", marginTop: 10 }} onClick={() => changerStatut(cmd.id, STATUT_SUIVANT[statut])}>
                          {statut === "en_cours" ? "Marquer prêt" : "Marquer servi"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {onglet === "qr" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>QR codes des tables</h2>
              <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <label style={s.label}>Nombre de tables</label>
                <input style={{ ...s.input, width: 80, marginBottom: 0 }} type="number" min={1} value={nbTables} onChange={e => setNbTables(+e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                {Array.from({ length: nbTables }, (_, i) => i + 1).map(t => (
                  <div key={t} style={{ ...s.card, textAlign: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 10, display: "inline-block", marginBottom: 10 }}>
                      <QRCode value={lienQR(t)} size={110} />
                    </div>
                    <div style={{ fontWeight: 700 }}>Table {t}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {onglet === "recrutement" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Recrutement</h2>
              <div style={s.card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontWeight: 700 }}>Annonce active</span>
                  <button onClick={() => setRecrutement({ ...recrutement, actif: !recrutement.actif })} style={{
                    width: 46, height: 26, borderRadius: 20, border: "none", cursor: "pointer",
                    background: recrutement.actif ? gradients.green : "rgba(255,255,255,0.1)", position: "relative", transition: "background 0.2s",
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: recrutement.actif ? 23 : 3, transition: "left 0.2s" }} />
                  </button>
                </div>
                <label style={s.label}>Poste recherché</label>
                <input style={s.input} value={recrutement.poste} onChange={e => setRecrutement({ ...recrutement, poste: e.target.value })} placeholder="Ex: Serveur, Cuisinier..." />
                <label style={s.label}>Conditions</label>
                <textarea style={{ ...s.input, minHeight: 90, resize: "vertical" }} value={recrutement.conditions} onChange={e => setRecrutement({ ...recrutement, conditions: e.target.value })} placeholder="Expérience, horaires, salaire..." />
                <label style={s.label}>Contact</label>
                <input style={s.input} value={recrutement.contact} onChange={e => setRecrutement({ ...recrutement, contact: e.target.value })} placeholder="Téléphone ou email" />
                <button style={s.btnGold} onClick={sauvegarderRecrutement}>Enregistrer</button>
              </div>
            </>
          )}

          {onglet === "parametres" && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Paramètres</h2>
              <div style={s.card}>
                <div style={{ ...s.sectionTitle, marginBottom: 14 }}>Code cuisine</div>
                <p style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 14 }}>Code actuel : <strong style={{ color: theme.gold }}>{codeCuisine || "non défini"}</strong></p>
                <label style={s.label}>Nouveau code cuisine</label>
                <input style={s.input} value={nouveauCodeCuisine} onChange={e => setNouveauCodeCuisine(e.target.value)} placeholder="Min. 4 caractères" />
                <button style={s.btnOrange} onClick={sauvegarderCodeCuisine}>Mettre à jour</button>
              </div>
              <div style={{ ...s.card, marginTop: 16 }}>
                <div style={s.sectionTitle}>Code restaurant</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: theme.gold, letterSpacing: "2px" }}>{gerant.code_unique}</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}