export type ClientCategory =
  | "institutionnels"
  | "compagnies"
  | "grands-groupes"
  | "formation"
  | "autres";

export type Client = {
  name: string;
  category: ClientCategory;
};

export type Partner = {
  name: string;
  specialty?: string;
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
  { name: "DAC-Pf", category: "institutionnels" },
  { name: "DGAC/SEAC-Pf", category: "institutionnels" },
  { name: "Ministère des Transports", category: "institutionnels" },
  { name: "DIREN", category: "institutionnels" },
  { name: "DAG", category: "institutionnels" },
  { name: "Province des Îles Loyauté", category: "institutionnels" },
  { name: "Commune de Moorea", category: "institutionnels" },
  { name: "Commune de Hiva Oa", category: "institutionnels" },
  { name: "DGEE", category: "institutionnels" },
  { name: "Gouvernement PF", category: "institutionnels" },
  // Compagnies aériennes & Opérateurs
  { name: "Air Loyauté", category: "compagnies" },
  { name: "ATN/TNH", category: "compagnies" },
  { name: "Air Bora Bora (City Pf)", category: "compagnies" },
  { name: "Islands Airline", category: "compagnies" },
  { name: "IAS", category: "compagnies" },
  { name: "TAC", category: "compagnies" },
  { name: "TASC", category: "compagnies" },
  // Grands groupes & Infrastructure
  { name: "Vinci Airports", category: "grands-groupes" },
  { name: "Pacific Beachcomber/Air Tetiaroa", category: "grands-groupes" },
  { name: "Terciel", category: "grands-groupes" },
  { name: "Dexios", category: "grands-groupes" },
  { name: "Etik Pf/AdT", category: "grands-groupes" },
  // Formation
  { name: "CNAM", category: "formation" },
  { name: "HSF", category: "formation" },
  // Autres
  { name: "Kroma Prod", category: "autres" },
  { name: "SAT", category: "autres" },
  { name: "TGW", category: "autres" },
  { name: "MOZ ULM", category: "autres" },
];

export const partners: Partner[] = [
  { name: "To70", specialty: "aviation - Pays-Bas" },
  { name: "Tamau Conseil" },
  { name: "Etik Polynésie", specialty: "ingénierie infrastructure" },
  { name: "CGX Aero" },
  { name: "PenUAS", specialty: "drones" },
  { name: "BIM Pearl", specialty: "maquettes 3D/4D/5D" },
  { name: "Magis" },
  { name: "Birds Conseil" },
  { name: "Pacific Sud Survey (PSS)" },
  { name: "Delta Polynesia" },
  { name: "L2L Prévention", specialty: "ICPE / EIE" },
  { name: "Milanamos" },
];
