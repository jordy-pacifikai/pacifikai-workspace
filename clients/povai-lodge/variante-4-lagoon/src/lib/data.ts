export const rooms = [
  {
    id: "fare-miti",
    name: "Fare Miti",
    subtitle: "Maison de la Mer",
    description:
      "Face au lagon, Fare Miti vous offre un reveil les pieds dans l'eau. Terrasse privee avec vue directe sur le Mont Otemanu.",
    priceNight: 25000,
    priceWeek: 150000,
    priceMonth: 500000,
    capacity: 2,
    surface: "35 m\u00B2",
    view: "Vue lagon directe",
    image: "/images/povai-chambre-miti.png",
    gallery: [
      "/images/povai-chambre-miti.png",
      "/images/povai-chambre-mahana.png",
      "/images/povai-chambre-moana.png",
      "/images/povai-lodge-ext.png",
    ],
    amenities: [
      "Lit king size",
      "Climatisation",
      "Terrasse privee",
      "Vue lagon",
      "Salle de bain",
      "WiFi",
      "Petit-dejeuner inclus",
    ],
  },
  {
    id: "fare-mahana",
    name: "Fare Mahana",
    subtitle: "Maison du Soleil",
    description:
      "Baignee de lumiere du matin au soir, Fare Mahana est un cocon chaleureux ou le temps s'arrete.",
    priceNight: 20000,
    priceWeek: 120000,
    priceMonth: 400000,
    capacity: 2,
    surface: "30 m\u00B2",
    view: "Vue jardin & lagon",
    image: "/images/povai-chambre-mahana.png",
    gallery: [
      "/images/povai-chambre-mahana.png",
      "/images/povai-chambre-miti.png",
      "/images/povai-lodge-ext.png",
      "/images/povai-chambre-moana.png",
    ],
    amenities: [
      "Lit king size",
      "Climatisation",
      "Terrasse privee",
      "Vue jardin & lagon",
      "Salle de bain",
      "WiFi",
      "Petit-dejeuner inclus",
    ],
  },
  {
    id: "fare-moana",
    name: "Fare Moana",
    subtitle: "Maison de l'Ocean",
    description:
      "Le murmure de l'ocean berce vos nuits a Fare Moana. Grande terrasse avec hamac, vue panoramique.",
    priceNight: 22000,
    priceWeek: 135000,
    priceMonth: 450000,
    capacity: 2,
    surface: "32 m\u00B2",
    view: "Vue panoramique ocean",
    image: "/images/povai-chambre-moana.png",
    gallery: [
      "/images/povai-chambre-moana.png",
      "/images/povai-chambre-mahana.png",
      "/images/povai-chambre-miti.png",
      "/images/povai-lodge-ext.png",
    ],
    amenities: [
      "Lit king size",
      "Climatisation",
      "Terrasse privee",
      "Vue panoramique",
      "Salle de bain",
      "WiFi",
      "Petit-dejeuner inclus",
    ],
  },
];

export const activities = [
  {
    title: "Plongee",
    description: "Explorez les fonds marins d'exception de Bora Bora",
    image: "/images/povai-plongee.png",
  },
  {
    title: "Excursion lagon",
    description: "Tour complet du lagon en pirogue traditionnelle",
    image: "/images/povai-kayak.png",
  },
  {
    title: "Kayak",
    description: "Glissez sur les eaux cristallines a votre rythme",
    image: "/images/povai-kayak.png",
  },
  {
    title: "Coucher de soleil",
    description: "Un spectacle inoubliable chaque soir sur le Pacifique",
    image: "/images/povai-hero.png",
  },
];

export const surroundingActivities = [
  {
    title: "Plongee sous-marine",
    description: "Raies manta, requins citron et jardins de corail",
    image: "/images/povai-plongee.png",
  },
  {
    title: "Jet ski",
    description: "Adrenalise sur les eaux turquoise du lagon",
    image: "/images/povai-kayak.png",
  },
  {
    title: "Tour du lagon",
    description: "Decouverte complete en bateau avec arret snorkeling",
    image: "/images/povai-kayak.png",
  },
  {
    title: "Snorkeling",
    description: "Jardin de corail accessible a pied depuis le lodge",
    image: "/images/povai-plongee.png",
  },
  {
    title: "Peche au gros",
    description: "Marlin, thon et mahi-mahi au large de Bora Bora",
    image: "/images/povai-lodge-ext.png",
  },
  {
    title: "Excursion motu",
    description: "Pique-nique sur un ilot prive au milieu du lagon",
    image: "/images/povai-hero.png",
  },
];

export function formatXPF(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " XPF";
}
