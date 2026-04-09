export type MissionEmblematique = {
  territory: "mobilites" | "infrastructures" | "environnement" | "transformation";
  territoryLabel: string;
  client: string;
  dates: string;
  title: string;
  description: string;
  image: string;
};

export const missionsEmblematiques: MissionEmblematique[] = [
  {
    territory: "mobilites",
    territoryLabel: "Mobilités",
    client: "Tahiti Nui Helicopters",
    dates: "2017-2018",
    title: "Créer un opérateur hélicoptère de A à Z",
    description:
      "Structuration complète d'un opérateur hélicoptère en Polynésie française : du business plan à l'obtention du CTA, en passant par la documentation opérationnelle et la certification.",
    image: "/images/tnh-helicopter-flight.jpg",
  },
  {
    territory: "infrastructures",
    territoryLabel: "Infrastructures",
    client: "Province des Îles Loyauté",
    dates: "2024-2029",
    title: "Accompagnement intégré ports et aéroports",
    description:
      "Mission pluriannuelle d'accompagnement stratégique de la Province des Îles Loyauté sur l'ensemble de ses infrastructures portuaires et aéroportuaires.",
    image: "/images/aratika.jpg",
  },
  {
    territory: "mobilites",
    territoryLabel: "Mobilités",
    client: "DAC-Pf / Etik Pf",
    dates: "2024-2025",
    title: "Sécuriser les travaux aéroportuaires du Pacifique",
    description:
      "Dix études d'impact sur la sécurité aéroportuaire sur des plateformes allant des atolls des Tuamotu à l'aéroport international de Tahiti-Faa'a.",
    image: "/images/rgi1.jpg",
  },
  {
    territory: "environnement",
    territoryLabel: "Environnement",
    client: "TAVIVAT",
    dates: "2025-2030",
    title: "Souveraineté alimentaire - piloter la transition",
    description:
      "Pilotage de la transition vers la souveraineté alimentaire en Polynésie française : étude de marché des vivriers locaux et accompagnement de la structuration des filières.",
    image: "/images/taro.jpg",
  },
  {
    territory: "environnement",
    territoryLabel: "Environnement",
    client: "DIREN",
    dates: "2021-2023",
    title: "Inventer un dispositif de certification biodiversité",
    description:
      "Conception et mise en place d'un dispositif de certification biodiversité innovant pour la Direction de l'Environnement de Polynésie française.",
    image: "/images/nuku-hiva.jpg",
  },
  {
    territory: "mobilites",
    territoryLabel: "Mobilités",
    client: "Pacific Blue Consulting",
    dates: "2025",
    title: "Connecter les États insulaires du Pacifique",
    description:
      "Étude de faisabilité d'une ligne aérienne régionale reliant Tahiti aux États insulaires du Pacifique Sud, pour renforcer la connectivité régionale.",
    image: "/images/rgi3.jpg",
  },
];
