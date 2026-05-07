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
      title: "EISA et Sûreté",
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
    image: "/images/mobilites-cockpit.jpg",
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
    image: "/images/rgi1.jpg",
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
    image: "/images/nuku-hiva.jpg",
  },
  {
    id: "transformation",
    anchor: "transformation",
    title: "Transformation, Compétences & Création d'entreprise",
    subtitle: "Accompagner ceux qui transforment, qui apprennent et qui entreprennent",
    description:
      "Formation de cadres, conduite du changement, coaching professionnel, accompagnement à la création d'entreprise…",
    approach: `Les projets les plus ambitieux échouent quand les organisations qui doivent les porter ne sont pas prêtes — et les territoires les plus dynamiques se figent quand les talents qui pourraient les transformer n'osent pas franchir le pas de l'entreprise. C'est pourquoi une part essentielle de notre travail consiste à renforcer les équipes, clarifier les responsabilités, outiller les managers, former ceux qui prendront les décisions de demain, et accompagner les porteurs de projet dans la création de leur entreprise.

Que nous accompagnions un opérateur en pleine transformation, une équipe à former ou un porteur de projet qui crée sa première entreprise, notre conviction est la même : ce sont les femmes et les hommes qui font vivre les organisations. Et c'est en les outillant, en clarifiant ce qu'on attend d'eux et en sécurisant leurs choix que l'on construit des trajectoires durables.`,
    coverage: [
      "Formation et conduite du changement (gestion de projet, management, conformité)",
      "Coaching professionnel et executive coaching de dirigeants et cadres",
      "Conception et animation de programmes pédagogiques",
      "Création et structuration de centres de formation agréés (Part-147, etc.)",
      "Structuration RH, organisation et clarification des responsabilités",
      "Accompagnement à la création d'entreprise : analyse de la situation, choix du statut, constitution des dossiers d'immatriculation",
      "Élaboration de business plans et préparation des dossiers de financement (banques, SOFIDEP, ADIE, dispositifs publics)",
      "Suivi des premières obligations fiscales et sociales pour les entreprises nouvellement créées",
    ],
    focus: {
      title: "Accompagnement à la création d'entreprise",
      text: `Créer son entreprise en Polynésie française, c'est franchir un seuil administratif souvent perçu comme infranchissable : CDFE, RCS, DICP, CPS, CAPL, banque, assurance. Pacific Blue Consulting accompagne les futurs entrepreneurs polynésiens sur l'ensemble du parcours, du choix du bon statut à l'immatriculation effective, du business plan à la recherche de financement.

Notre service ne se substitue pas aux dispositifs publics — CCISM, ADIE, SOFIDEP, DGAE — il aide à les utiliser pleinement. Nous prenons en charge la partie la plus lourde des démarches : analyse de la situation, choix du parcours (patente, société, agricole ou non), préparation et dépôt des dossiers, suivi jusqu'à l'obtention des numéros nécessaires.

Nos prestations :

• Création d'une patente simple — pour exercer en nom propre.

• Création d'une société — SARL, EURL, SAS pour les projets nécessitant une structure sociétaire.

• Création d'un projet agricole — exploitation, élevage, pêche lagonaire, perliculture.

• Business plan et accompagnement au financement — dossiers banques, SOFIDEP, ADIE et dispositifs publics.

• Création complète accompagnée du financement — projet intégré associant la création de la structure et la mobilisation des financements.

• Suivi du démarrage — sécurisation des premiers mois d'activité et des premières échéances fiscales et sociales.`,
    },
    missions: [
      "Club des Managers du CNAM (2021-2022)",
      "Centre Part-147 Air Formation - création clés en main (2022)",
      "Organisation & RH d'Air Loyauté (2020-2023)",
      "Formation gestion de projet - HSF (2024-2025)",
      "Accompagnement à la création d'entreprises individuelles et sociétaires",
      "Constitution de dossiers de financement auprès des banques, de la SOFIDEP et de l'ADIE",
      "Accompagnement au démarrage de jeunes entreprises polynésiennes",
    ],
    result:
      "Des équipes plus compétentes, des organisations plus lisibles, des managers mieux outillés, des porteurs de projet qui passent de l'idée à l'entreprise immatriculée, et des trajectoires professionnelles ou entrepreneuriales sécurisées. Parce que le meilleur investissement d'un territoire, ce sont ses talents et ceux qui osent entreprendre.",
    image: "/images/transformation-workshop.jpg",
  },
];
