export type Territory = {
  id: string;
  anchor: string;
  title: string;
  subtitle: string;
  description: string;
  approach: string;
  coverage?: string[];
  focus?: {
    title: string;
    text: string;
  };
  missions: string[];
  result?: string;
  image: string;
};

export const territories: Territory[] = [
  {
    id: "mobilites",
    anchor: "mobilites",
    title: "Mobilités & Transport aérien",
    subtitle: "Créer, structurer et sécuriser les opérations aériennes",
    description:
      "Création de compagnies aériennes, certification d'exploitation, conformité EASA, dessertes inter-îles, opérations hélicoptères, continuité territoriale. Du business plan au premier vol.",
    approach: `Le transport aérien en milieu insulaire n'est pas un service comme un autre - c'est le lien vital entre des populations séparées par l'océan. Chaque compagnie, chaque desserte, chaque aérodrome est un maillon d'une chaîne de continuité territoriale dont dépendent la santé, l'économie et la cohésion sociale de communautés entières.

Pacific Blue Consulting intervient sur l'ensemble du cycle de vie d'un opérateur aérien : de l'idée initiale à l'exploitation quotidienne, de la première page du business plan au maintien des certifications année après année. Notre force est de parler à la fois le langage des autorités (DGAC, EASA), celui des investisseurs et celui des équipages.

Nous avons créé des compagnies aériennes là où il n'y en avait pas, remis en conformité des exploitants en difficulté, conçu des dessertes en terrain montagneux, et accompagné des candidatures de concession face aux plus grands groupes mondiaux.`,
    coverage: [
      "Création et structuration de compagnies aériennes (du statut juridique au CTA)",
      "Business plans, modèles économiques et stratégie commerciale",
      "Certification d'exploitation et documentation opérationnelle (MANEX, MGS, MGN)",
      "Conformité EASA : Part-145, Part-M, Part-CAMO, Part-OPS",
      "Audits réglementaires et plans d'actions conformité",
      "Système de gestion de la sécurité (SGS)",
      "Études d'impact sur la sécurité aéroportuaire (EISA) - 10 réalisées depuis 2024",
      "Expertise en sûreté aéroportuaire (audits, gouvernance, interface TSA)",
      "Stratégie de desserte inter-îles et continuité territoriale",
      "Drones et UAV : stratégie, manuels d'exploitation, imagerie aérienne",
      "Documentation SSLIA, AFIS et maintenance",
    ],
    focus: {
      title: "Expertise EISA et Sûreté",
      text: `Pascal Bazer-Bachi est l'un des rares experts du Pacifique à combiner une expérience de direction au sein de l'autorité de surveillance et une pratique opérationnelle du conseil en sécurité et sûreté aéroportuaires.

Depuis 2024, 10 EISA réalisées sur des plateformes allant des atolls des Tuamotu à l'aéroport international de Tahiti-Faa'a (gros-porteurs B777/A350, travaux en site exploité, coordination multi-acteurs). Méthodologie conforme aux exigences nationales et européennes, risques résiduels positionnés en zone ALARP.

En sûreté : expérience de présidence des Comités Opérationnels de Sûreté (COS), des Commissions de sûreté aéroportuaire, et d'interface avec la TSA américaine sur la plateforme de Tahiti-Faa'a.`,
    },
    missions: [
      "Création de Tahiti Nui Helicopters (2017-2018)",
      "Certification d'Islands Airline - 47 documents (2019)",
      "Création d'Air Bora Bora (2020-2023)",
      "Modernisation d'Air Loyauté (2019-2023)",
      "Appui Vinci Airports - concession Faa'a (2020)",
      "10 EISA pour la DAC-Pf et Etik Pf/AdT (2024-2025)",
      "Étude sécurité Marquises - 75 événements, 4 terrains montagneux (2021-2022)",
      "Étude sécurité DSP Wallis-Futuna - 100+ événements (2023-2024)",
      "Ligne aérienne régionale Pacifique Sud (2025)",
      "RCO SSLIA et manuels AFIS pour la DAC-Pf (2024-2025)",
    ],
    result:
      "Des opérations aériennes lancées sur des bases solides, des certifications obtenues et maintenues, des risques maîtrisés - parce que la continuité territoriale n'est pas un concept, c'est le quotidien des îles.",
    image: "/images/pbc-cockpit.jpg",
  },
  {
    id: "infrastructures",
    anchor: "infrastructures",
    title: "Infrastructures & Territoires",
    subtitle: "Concevoir les plateformes qui connectent les populations",
    description:
      "Aéroports, aérodromes, ports, schémas directeurs, certification aéroportuaire, études d'impact sur la sécurité (EISA), aéroports marins innovants. De l'étude de faisabilité à la mise en exploitation.",
    approach: `Un aérodrome corallien de 800 mètres de piste aux Tuamotu. Un port des Îles Loyauté qui doit absorber le trafic de fret vital. Une piste privée sur un atoll classé. Chaque infrastructure insulaire est un cas particulier - et chacune doit pourtant répondre à des normes internationales pensées pour des contextes très différents.

Pacific Blue Consulting sait naviguer dans cette équation. Nous concevons des schémas directeurs qui tiennent compte à la fois des contraintes réglementaires, des réalités foncières, des capacités financières des collectivités et des attentes des populations.`,
    missions: [
      "Province des Îles Loyauté (DPA) - ports et aéroports (2024-2029)",
      "Schéma d'aménagement Moorea et Huahine (2024-2025)",
      "Levée non-conformités piste de Tetiaroa (2024-2025)",
      "Réseau d'aérodromes polynésiens - MLA (2021)",
      "Études de faisabilité à Lifou (Wanaham et Hmeleck - 2022)",
      "Terciel - aéroports marins flottants (2022-2030)",
      "Étude route aéroport Temae - Commune de Moorea",
    ],
    image: "/images/pbc-aeroport.jpg",
  },
  {
    id: "environnement",
    anchor: "environnement",
    title: "Environnement & Souveraineté",
    subtitle:
      "Accompagner la transition écologique et la résilience des territoires",
    description:
      "Bilan carbone, décarbonation, certification biodiversité, évaluation environnementale, souveraineté alimentaire, valorisation des filières locales. Transformer les contraintes en leviers.",
    approach: `La souveraineté d'un territoire insulaire se joue sur plusieurs fronts à la fois : réduire sa dépendance aux énergies fossiles, protéger une biodiversité unique au monde, nourrir sa population avec ses propres ressources, et valoriser les savoir-faire qui font son identité.

Pacific Blue Consulting accompagne cette transition avec la même rigueur que celle que nous appliquons à l'aviation civile : diagnostic factuel, objectifs chiffrés, feuille de route réaliste, et accompagnement dans la durée. Nous ne vendons pas du discours environnemental - nous construisons des dispositifs qui fonctionnent.`,
    missions: [
      "Bilan carbone de la DAC-Pf et feuille de route décarbonation (2025)",
      "Certification biodiversité DIREN (2021-2023)",
      "Actualisation du dispositif EIE/NIE (2025-2026)",
      "Étude de marché vivriers locaux - projet TAVIVAT (2025-2026)",
      "Pilotage projet TAVIVAT - DAG (2026-2027)",
      "Séchoir à pandanus - Service de l'Artisanat Traditionnel (2025-2026)",
    ],
    image: "/images/pbc-foret.jpg",
  },
  {
    id: "transformation",
    anchor: "transformation",
    title: "Transformation & Compétences",
    subtitle: "Structurer les organisations et développer les talents",
    description:
      "Formation de cadres, conduite du changement, coaching professionnel, création d'entreprise, structuration RH, centres de formation agréés. Faire monter en compétences ceux qui font.",
    approach: `Les projets les plus ambitieux échouent quand les organisations qui doivent les porter ne sont pas prêtes. C'est pourquoi une part essentielle de notre travail consiste à renforcer les équipes, à clarifier les responsabilités, à outiller les managers et à former ceux qui, demain, prendront les décisions.

Pascal Bazer-Bachi est formateur agréé, coach professionnel accrédité et concepteur de programmes pédagogiques. Il intervient autant sur les contenus que sur les pratiques de travail - parce que changer une organisation, c'est d'abord changer la manière dont les gens travaillent ensemble.`,
    missions: [
      "Club des Managers du CNAM (2021-2022)",
      "Centre Part-147 Air Formation - création clés en main (2022)",
      "Organisation & RH d'Air Loyauté (2020-2023)",
      "Formation gestion de projet - HSF (2024-2025)",
      "Accompagnement création d'entreprises",
    ],
    result:
      "Des équipes plus compétentes, des organisations plus lisibles, des managers mieux outillés, et des trajectoires professionnelles ou entrepreneuriales sécurisées. Parce que le meilleur investissement d'un territoire, ce sont ses talents.",
    image: "/images/pbc-consulting.jpg",
  },
];
