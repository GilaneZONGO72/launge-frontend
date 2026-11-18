import Icone from "../comptes/IconesComptes";

// Icônes du stock (style Lucide) ; les autres viennent du design commun.
const EXTRA = {
  boite: <><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="m7.5 4.27 9 5.15" /></>,
  inventaire: <><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></>,
  historique: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>,
  haut: <path d="m5 12 7-7 7 7M12 19V5" />,
  bas: <path d="M12 5v14m7-7-7 7-7-7" />,
  pencil: <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />,
};

export default function Ico({ nom, taille = 20, ...reste }) {
  if (!EXTRA[nom]) return <Icone nom={nom} taille={taille} {...reste} />;
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...reste}>
      {EXTRA[nom]}
    </svg>
  );
}
