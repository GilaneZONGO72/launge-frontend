import Icone from "../restaurant/IconeGerant";

// Icônes supplémentaires des restaurants (style Lucide). Les autres viennent de l'espace restaurant et du design commun.
const EXTRA = {
  lieu: <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  fleche: <path d="m9 18 6-6-6-6" />,
  actualiser: <><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></>,
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
