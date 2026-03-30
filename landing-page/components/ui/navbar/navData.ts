export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface NavDropdownGroup {
  title: string;
  items: NavLink[];
}

export interface NavDropdownData {
  label: string;
  groups: NavDropdownGroup[];
}

export const SOLUTIONS_DROPDOWN: NavDropdownData = {
  label: "Solutions",
  groups: [
    {
      title: "IA & Automatisation",
      items: [
        { label: "Chatbots IA", href: "/services/chatbots", description: "Assistants 24/7 sur tous vos canaux", icon: "chat" },
        { label: "Automatisation", href: "/services/workflows", description: "Workflows sur mesure", icon: "zap" },
        { label: "Extraction docs", href: "/services/documents", description: "Traitement intelligent de documents", icon: "doc" },
        { label: "Marketing IA", href: "/services/marketing", description: "Campagnes alimentees par l'IA", icon: "chart" },
      ],
    },
    {
      title: "Creation digitale",
      items: [
        { label: "Sites web", href: "/services/landing-pages", description: "Sites premium sur mesure", icon: "globe" },
        { label: "Applications", href: "/services/apps", description: "Apps metier personnalisees", icon: "app" },
        { label: "Conseil digital", href: "/services/conseil", description: "Strategie & accompagnement", icon: "compass" },
        { label: "Integrations API", href: "/services/api", description: "Connectez tous vos outils", icon: "link" },
      ],
    },
  ],
};

export const EXPERTISE_DROPDOWN: NavDropdownData = {
  label: "Expertise",
  groups: [
    {
      title: "Nos competences",
      items: [
        { label: "SEO & Referencement IA", href: "/expertise/seo-referencement-ia", icon: "search", color: "lagoon" },
        { label: "IA Conversationnelle 24/7", href: "/expertise/chatbots-ia", icon: "chat", color: "accent" },
        { label: "Sites Haute Conversion", href: "/expertise/sites-web-premium", icon: "globe", color: "purple" },
        { label: "Production Contenu x10", href: "/expertise/contenu-ia", icon: "image", color: "gold" },
        { label: "Zero Tache Manuelle", href: "/expertise/automatisation", icon: "zap", color: "indigo" },
        { label: "Growth & Acquisition IA", href: "/expertise/marketing-acquisition", icon: "chart", color: "emerald" },
        { label: "Transformation Digitale", href: "/expertise/strategie-digitale", icon: "compass", color: "orange" },
      ],
    },
  ],
};

export const TOP_LINKS: NavLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
];

export const FULLSCREEN_LINKS: NavLink[] = [
  { label: "Solutions", href: "#services" },
  { label: "Expertise", href: "/expertise/seo-referencement-ia" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];
