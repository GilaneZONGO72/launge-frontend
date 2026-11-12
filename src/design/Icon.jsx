// Icônes au style Lucide (trait arrondi 2px). Aucune dépendance à installer.
const CHEMINS = {
  retour: <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  recherche: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  moins: <path d="M5 12h14" />,
  sac: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  couverts: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
  mallette: <><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  table: <><rect width="18" height="4" x="3" y="9" rx="1" /><path d="M5 13v7" /><path d="M19 13v7" /></>,
};

export default function Icon({ nom, taille = 20, ...reste }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...reste}>
      {CHEMINS[nom]}
    </svg>
  );
}
