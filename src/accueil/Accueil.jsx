import "../design/tokens.css";
import "../client/client.css";
import "../comptes/comptes.css";
import "./accueil.css";
import Ico from "../comptes/IconesComptes";
import Marque from "../comptes/Marque";

// Photo de plat (la même qu'avant). Si elle ne charge pas, le fond sombre prend le relais.
const PHOTO = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop";

const ETAPES = [
  { icone: "couverts", titre: "Choisissez votre restaurant", texte: "Parcourez les restaurants Launge ou scannez le QR code posé sur votre table." },
  { icone: "sac", titre: "Commandez depuis votre téléphone", texte: "Composez votre commande, choisissez comment payer. Pas besoin de compte." },
  { icone: "cloche", titre: "Suivez votre commande", texte: "Vous voyez quand elle est acceptée, en préparation, puis prête." },
];
const ATOUTS = [
  { icone: "qr", titre: "Un QR code par table", texte: "Chaque table a son code : la commande arrive au bon endroit." },
  { icone: "eclair", titre: "Cuisine en direct", texte: "Les commandes apparaissent à la cuisine dès l'envoi, en trois colonnes claires." },
  { icone: "graphique", titre: "Stocks et ventes", texte: "Suivez vos plats, vos stocks et vos ventes depuis un seul espace." },
  { icone: "bouclier", titre: "Accès par rôle", texte: "Gérant, cuisine, caisse : chacun ne voit que ce qui le concerne." },
];

export default function Accueil({ onClient, onGerant, onInscription, onCuisine, onCompte }) {
  return (
    <div className="lg-page lg-ac">
      <section className="lg-ac-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(17,24,39,.35) 0%, rgba(17,24,39,.55) 55%, rgba(17,24,39,.8) 100%), url(${PHOTO})` }}>
        <div className="lg-ac-cadre">
          <header className="lg-ac-nav">
            <Marque taille={36} clair />
            <span className="lg-ac-boutons">
              {onCompte && <button type="button" className="lg-ac-bouton-verre" onClick={onCompte}><Ico nom="utilisateur" taille={16} /> Mon compte</button>}
              <button type="button" className="lg-ac-bouton-verre" onClick={onGerant}><Ico nom="mallette" taille={16} /> Espace restaurateur</button>
            </span><Ico nom="mallette" taille={16} /> Espace restaurateur</button>
          </header>
          <div className="lg-ac-hero-texte">
            <span className="lg-ac-pastille">Commande à table · Cameroun</span>
            <h1 className="lg-titre">Commandez depuis votre table, sans attendre</h1>
            <p>Choisissez votre plat, envoyez la commande à la cuisine et suivez-la en direct.</p>
            <button type="button" className="lg-btn lg-btn-orange lg-ac-cta" onClick={onClient}><Ico nom="recherche" taille={18} /> Trouver un restaurant</button>
          </div>
        </div>
      </section>

      <main className="lg-ac-cadre">
        <section className="lg-ac-section" aria-labelledby="ac-comment">
          <h2 id="ac-comment" className="lg-titre lg-ac-h2">Comment ça marche</h2>
          <ol className="lg-ac-etapes">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="lg-ac-etape">
                <span className="lg-ac-num">{i + 1}</span>
                <span className="lg-ac-icone"><Ico nom={e.icone} taille={22} /></span>
                <h3 className="lg-titre lg-h3">{e.titre}</h3>
                <p>{e.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lg-ac-section" aria-labelledby="ac-pourquoi">
          <h2 id="ac-pourquoi" className="lg-titre lg-ac-h2">Pourquoi Launge</h2>
          <ul className="lg-ac-atouts">
            {ATOUTS.map((a) => (
              <li key={a.titre} className="lg-ac-atout">
                <span className="lg-ac-icone lg-ac-icone-nuit"><Ico nom={a.icone} taille={22} /></span>
                <h3 className="lg-titre lg-h3">{a.titre}</h3>
                <p>{a.texte}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg-ac-resto" aria-labelledby="ac-resto">
          <div>
            <h2 id="ac-resto" className="lg-titre lg-ac-h2" style={{ color: "#fff", margin: 0 }}>Vous êtes restaurateur ?</h2>
            <p>Digitalisez vos commandes, votre cuisine et vos stocks. L'inscription prend trois minutes.</p>
          </div>
          <div className="lg-ac-resto-actions">
            <button type="button" className="lg-btn lg-btn-orange" onClick={onInscription}>Inscrire mon restaurant</button>
            <button type="button" className="lg-btn lg-ac-bouton-verre" onClick={onGerant}>Se connecter</button>
          </div>
        </section>
      </main>

      <footer className="lg-ac-pied">
        <div className="lg-ac-cadre lg-ac-pied-ligne">
          <Marque taille={28} />
          <button type="button" className="lg-cp-lien" onClick={onCuisine}><Ico nom="chef" taille={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />Accès équipe cuisine</button>
        </div>
      </footer>
    </div>
  );
}
