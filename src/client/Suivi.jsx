import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "../design/Icon";
import "./client.css";

const API = "https://launge-backend-production.up.railway.app";
const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR");

// Le serveur gère 3 états : en_cours, pret, servi. « Reçue » est acquise dès que la commande existe.
const ETAPES = [
  { cle: "recue", nom: "Commande reçue", sous: "Le restaurant a bien reçu votre commande", icone: "recu" },
  { cle: "en_cours", nom: "En préparation", sous: "La cuisine prépare votre commande", icone: "flamme" },
  { cle: "pret", nom: "Prête", sous: "Votre commande est prête", icone: "cloche" },
  { cle: "servi", nom: "Servie", sous: "Bon appétit !", icone: "sourire" },
];
const RANG = { en_cours: 1, pret: 2, servi: 4 };
const TITRES = {
  en_cours: ["Votre commande est en préparation", "Nous vous prévenons dès qu'elle est prête."],
  pret: ["Votre commande est prête !", "Elle arrive à votre table."],
  servi: ["Bon appétit !", "Votre commande a été servie."],
};

export default function Suivi({ reference, onAccueil, intervalleMs = 5000 }) {
  const [etat, setEtat] = useState("chargement"); // chargement | ok | introuvable
  const [data, setData] = useState(null);
  const [reseau, setReseau] = useState(false);
  const [copie, setCopie] = useState(false);
  const echecs = useRef(0);
  const dernier = useRef(null);

  const charger = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/suivi/${encodeURIComponent(reference)}`, { cache: "no-store" });
      if (res.status === 404) { setEtat("introuvable"); return "stop"; }
      if (!res.ok) throw new Error("http");
      const d = await res.json();
      echecs.current = 0; setReseau(false); setData(d); setEtat("ok");
      if (dernier.current && dernier.current !== d.statut && d.statut === "pret") {
        try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch { /* ignoré */ }
      }
      dernier.current = d.statut;
      return d.statut === "servi" ? "stop" : "suite";
    } catch {
      echecs.current += 1; setReseau(true); return "suite"; // on réessaie, de plus en plus lentement
    }
  }, [reference]);

  useEffect(() => {
    let minuteur; let fini = false;
    const boucle = async () => {
      if (fini) return;
      const r = document.hidden ? "suite" : await charger();
      if (fini || r === "stop") return;
      const attente = Math.min(intervalleMs * 2 ** Math.min(echecs.current, 3), 30000);
      minuteur = setTimeout(boucle, attente);
    };
    const reveil = () => { if (!document.hidden && !fini) { clearTimeout(minuteur); boucle(); } };
    boucle();
    document.addEventListener("visibilitychange", reveil);
    return () => { fini = true; clearTimeout(minuteur); document.removeEventListener("visibilitychange", reveil); };
  }, [charger, intervalleMs]);

  const copier = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopie(true); setTimeout(() => setCopie(false), 2500); } catch { /* ignoré */ }
  };

  if (etat === "introuvable") {
    return (
      <div className="lg-page"><div className="lg-colonne">
        <div className="lg-vide" style={{ paddingTop: 96 }}>
          <Icon nom="alerte" taille={36} />
          <h1 className="lg-titre lg-h1" style={{ fontSize: 22 }}>Commande introuvable</h1>
          <p>Ce lien de suivi n'est pas valide. Vérifiez qu'il est complet.</p>
          <button className="lg-btn lg-btn-nuit" style={{ marginTop: 20 }} onClick={onAccueil}>Retour à l'accueil</button>
        </div>
      </div></div>
    );
  }

  const statut = data ? data.statut : "en_cours";
  const rang = RANG[statut] ?? 1;
  const [titre, sous] = TITRES[statut] || TITRES.en_cours;

  return (
    <div className="lg-page" style={{ paddingBottom: 40 }}>
      <div className="lg-colonne">
        {etat === "chargement" ? (
          <div style={{ paddingTop: 40 }}><div className="lg-squelette" style={{ aspectRatio: "4 / 3" }} /></div>
        ) : (
          <>
            <section className="lg-heros" data-etat={statut} aria-live="polite">
              <div className="lg-heros-icone"><Icon nom={statut === "en_cours" ? "flamme" : statut === "pret" ? "cloche" : "sourire"} taille={34} /></div>
              <h1 className="lg-titre lg-h1">{titre}</h1>
              <p>{sous}</p>
            </section>

            {reseau && (
              <div className="lg-bandeau" role="status"><Icon nom="alerte" taille={18} /> Connexion instable… nouvelle tentative en cours.</div>
            )}

            <ol className="lg-etapes" aria-label="Avancement de la commande">
              {ETAPES.map((e, i) => {
                const etatEtape = i < rang ? "fait" : i === rang ? "actuelle" : "attente";
                return (
                  <li key={e.cle} className="lg-etape" data-etat={etatEtape} aria-current={etatEtape === "actuelle" ? "step" : undefined}>
                    <span className="lg-etape-pastille"><Icon nom={etatEtape === "fait" ? "check" : e.icone} taille={18} /></span>
                    <span>{e.nom}{etatEtape === "actuelle" && <span className="lg-etape-sous">{e.sous}</span>}</span>
                  </li>
                );
              })}
            </ol>

            {data && (
              <div className="lg-carte" style={{ marginTop: 16 }}>
                <div className="lg-legende" style={{ marginBottom: 6 }}>
                  {data.restaurant || "Restaurant"}{data.numero_table ? ` · Table ${data.numero_table}` : ""}
                </div>
                {data.items.map((it, i) => (
                  <div className="lg-ligne" key={i}>
                    <span className="lg-ligne-qte">{it.qte}×</span>
                    <span className="lg-ligne-nom">{it.nom}</span>
                    <span className="lg-ligne-prix">{fcfa(it.prix * it.qte)} FCFA</span>
                  </div>
                ))}
                <div className="lg-ligne" style={{ fontFamily: "var(--lg-titre)", fontWeight: 800 }}>
                  <span className="lg-ligne-nom">Total{data.mode_paiement ? ` · ${data.mode_paiement}` : ""}</span>
                  <span>{fcfa(data.total)} FCFA</span>
                </div>
              </div>
            )}

            <div className="lg-lien">
              Gardez ce lien : il vous permet de retrouver votre commande à tout moment, sans compte.
              <button className="lg-btn" onClick={copier}><Icon nom={copie ? "check" : "copie"} taille={18} />{copie ? "Lien copié" : "Copier le lien de suivi"}</button>
            </div>
            <button className="lg-btn lg-btn-nuit" style={{ width: "100%", marginTop: 14 }} onClick={onAccueil}>Retour à l'accueil</button>
          </>
        )}
      </div>
    </div>
  );
}
