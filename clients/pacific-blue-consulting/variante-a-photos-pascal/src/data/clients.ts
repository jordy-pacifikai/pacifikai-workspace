export type ClientCategory =
  | "institutionnels"
  | "compagnies"
  | "grands-groupes"
  | "formation"
  | "autres";

export type Client = {
  name: string;
  category: ClientCategory;
  logo?: string;
};

export type Partner = {
  name: string;
  specialty?: string;
  logo?: string;
};

export const clientCategories: Record<ClientCategory, string> = {
  institutionnels: "Institutionnels",
  compagnies: "Compagnies aériennes & Opérateurs",
  "grands-groupes": "Grands groupes & Infrastructure",
  formation: "Formation",
  autres: "Autres",
};

export const clients: Client[] = [
  // Institutionnels
  { name: "DAC-Pf", category: "institutionnels", logo: "/images/logos/dac-pf.png" },
  { name: "DGAC/SEAC-Pf", category: "institutionnels", logo: "/images/logos/dgac.png" },
  { name: "Ministère des Transports", category: "institutionnels", logo: "/images/logos/ministere-transports.png" },
  { name: "DIREN", category: "institutionnels", logo: "/images/logos/diren.png" },
  { name: "DAG", category: "institutionnels", logo: "/images/logos/dag.png" },
  { name: "Province des Îles Loyauté", category: "institutionnels", logo: "/images/logos/province-iles-loyaute.png" },
  { name: "Commune de Moorea", category: "institutionnels", logo: "/images/logos/commune-moorea.png" },
  { name: "Commune de Hiva Oa", category: "institutionnels", logo: "/images/logos/commune-hiva-oa.png" },
  { name: "DGEE", category: "institutionnels", logo: "/images/logos/dgee.png" },
  { name: "Gouvernement PF", category: "institutionnels", logo: "/images/logos/gouvernement-pf.png" },
  // Compagnies aériennes & Opérateurs
  { name: "Air Loyauté", category: "compagnies", logo: "/images/logos/air-loyaute.png" },
  { name: "ATN/TNH", category: "compagnies", logo: "/images/logos/atn-tnh.png" },
  { name: "Air Bora Bora (City Pf)", category: "compagnies", logo: "/images/logos/air-bora-bora.png" },
  { name: "Islands Airline", category: "compagnies", logo: "/images/logos/islands-airline.png" },
  { name: "IAS", category: "compagnies", logo: "/images/logos/ias.png" },
  { name: "TAC", category: "compagnies", logo: "/images/logos/tac.png" },
  { name: "TASC", category: "compagnies", logo: "/images/logos/tasc.png" },
  // Grands groupes & Infrastructure
  { name: "Vinci Airports", category: "grands-groupes", logo: "/images/logos/vinci-airports.png" },
  { name: "Pacific Beachcomber/Air Tetiaroa", category: "grands-groupes", logo: "/images/logos/pacific-beachcomber.png" },
  { name: "Terciel", category: "grands-groupes", logo: "/images/logos/terciel.png" },
  { name: "Dexios", category: "grands-groupes", logo: "/images/logos/dexios.png" },
  { name: "Etik Pf/AdT", category: "grands-groupes", logo: "/images/logos/etik-pf.png" },
  // Formation
  { name: "CNAM", category: "formation", logo: "/images/logos/cnam.png" },
  { name: "HSF", category: "formation", logo: "/images/logos/hsf.png" },
  // Autres
  { name: "Kroma Prod", category: "autres", logo: "/images/logos/kroma-prod.png" },
  { name: "SAT", category: "autres", logo: "/images/logos/sat.png" },
  { name: "TGW", category: "autres", logo: "/images/logos/tgw.png" },
  { name: "MOZ ULM", category: "autres", logo: "/images/logos/moz-ulm.png" },
  { name: "Moeroa Tahitian Heritage", category: "autres", logo: "/images/logos/moeroa-tahitian-heritage.jpg" },
];

export const partners: Partner[] = [
  { name: "To70", specialty: "aviation - Pays-Bas", logo: "/images/logos/to70.png" },
  { name: "Tamau Conseil", logo: "/images/logos/tamau-conseil.png" },
  { name: "Etik Polynésie", specialty: "ingénierie infrastructure", logo: "/images/logos/etik-polynesie.png" },
  { name: "CGX Aero", logo: "/images/logos/cgx-aero.png" },
  { name: "PenUAS", specialty: "drones", logo: "/images/logos/penuas.png" },
  { name: "BIM Pearl", specialty: "maquettes 3D/4D/5D", logo: "/images/logos/bim-pearl.png" },
  { name: "Magis", logo: "/images/logos/magis.png" },
  { name: "Birds Conseil", logo: "/images/logos/birds-conseil.png" },
  { name: "Pacific Sud Survey (PSS)", logo: "/images/logos/pss.png" },
  { name: "Delta Polynesia", logo: "/images/logos/delta-polynesia.png" },
  { name: "L2L Prévention", specialty: "ICPE / EIE", logo: "/images/logos/l2l-prevention.png" },
  { name: "Milanamos", logo: "/images/logos/milanamos.png" },
];
