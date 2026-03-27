#!/usr/bin/env node
/**
 * Programmatic SEO Page Generator for PACIFIK'AI
 * Generates 48 HTML pages (8 services x 6 localities) for long-tail SEO
 *
 * Usage: node scripts/generate-seo-pages.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEO_DIR = join(__dirname, '..', 'seo');

mkdirSync(SEO_DIR, { recursive: true });

// ── Services ──────────────────────────────────────────────
const services = [
  {
    slug: 'creation-site-web',
    title: 'Création de Site Web',
    shortTitle: 'Création Site Web',
    icon: '🌐',
    servicePage: '/services/landing-pages.html',
    schemaType: 'WebDesign',
    descriptions: {
      papeete: `Votre entreprise à Papeete mérite une vitrine digitale à la hauteur de la capitale. PACIFIK'AI conçoit des sites web performants, optimisés pour le référencement local et adaptés aux habitudes de navigation des Polynésiens. Du marché de Papeete aux bureaux du front de mer, nous accompagnons les commerces et sociétés du centre-ville dans leur transformation numérique. Nos sites intègrent les dernières technologies (Next.js, responsive design) et sont hébergés sur des serveurs rapides pour garantir un temps de chargement optimal malgré la distance avec les datacenters. Chaque projet inclut un design sur mesure reflétant l'identité de votre marque et les spécificités du marché tahitien.`,
      moorea: `À Moorea, le digital est un levier essentiel pour les pensions de famille, les excursions touristiques et les producteurs locaux d'ananas ou de vanille. PACIFIK'AI crée des sites web qui captent les visiteurs dès leur recherche en ligne, avant même qu'ils ne prennent le ferry depuis Tahiti. Nous comprenons les contraintes insulaires — connexion parfois limitée, clientèle internationale — et concevons des sites légers, multilingues et optimisés pour la conversion. Que vous gériez une pension à Haapiti ou un commerce à Maharepa, votre site sera votre meilleur commercial, disponible 24h/24 pour vos futurs clients du monde entier.`,
      'bora-bora': `Bora Bora, joyau du tourisme mondial, exige une présence en ligne irréprochable. Les voyageurs de luxe recherchent leurs hébergements et activités sur Google bien avant leur arrivée. PACIFIK'AI conçoit des sites web haut de gamme pour les hôtels 5 étoiles, les centres de plongée et les prestataires touristiques de Bora Bora. Nos créations allient esthétique premium, vitesse de chargement et référencement international. Chaque site est pensé pour convertir : galeries immersives, réservation en ligne, intégration TripAdvisor et Google Maps. Dominez les résultats de recherche face à la concurrence et transformez chaque visite en réservation.`,
      faaa: `Faaa, plus grande commune de Polynésie française avec ses 30 000 habitants et son aéroport international, est un carrefour économique incontournable. PACIFIK'AI accompagne les entreprises de la zone industrielle, les commerces de proximité et les prestataires de services dans leur digitalisation. Un site web professionnel vous démarque de la concurrence locale et vous rend visible auprès des 500 000 passagers annuels qui transitent par l'aéroport. Nos sites sont conçus pour générer des contacts qualifiés, présenter vos produits et renforcer votre crédibilité auprès des donneurs d'ordre polynésiens.`,
      punaauia: `Punaauia, poumon commercial de Tahiti avec le centre Carrefour et ses zones résidentielles premium, regroupe une clientèle à fort pouvoir d'achat. PACIFIK'AI crée des sites web pour les commerces, restaurants, cabinets et entreprises de Punaauia qui veulent capter cette clientèle exigeante. Du Musée de Tahiti à la Pointe des Pêcheurs, nous concevons des expériences digitales modernes et performantes. Nos sites intègrent le paiement en ligne, la prise de rendez-vous et le référencement local pour apparaître en tête des recherches "près de chez moi" à Punaauia et ses environs.`,
      pirae: `Pirae, siège de l'Assemblée de la Polynésie française et quartier d'affaires de référence, concentre les décideurs économiques et politiques du territoire. PACIFIK'AI accompagne les entreprises, cabinets et institutions de Pirae avec des sites web à l'image de leur ambition. Proximité avec les administrations centrales, accessibilité depuis Papeete : votre site web doit refléter le professionnalisme de votre structure. Nous créons des interfaces élégantes, rapides et conformes aux standards d'accessibilité, avec un référencement ciblé sur le bassin d'activité de Pirae et ses 14 000 habitants.`
    }
  },
  {
    slug: 'chatbot-ia',
    title: 'Chatbot IA',
    shortTitle: 'Chatbot IA',
    icon: '🤖',
    servicePage: '/services/chatbots.html',
    schemaType: 'ProfessionalService',
    descriptions: {
      papeete: `Les entreprises de Papeete reçoivent des dizaines de demandes clients chaque jour — par téléphone, email, Facebook. Un chatbot IA PACIFIK'AI prend en charge ces requêtes 24h/24, en français et en tahitien, sans temps d'attente. Du commerce du marché au cabinet juridique du centre-ville, notre technologie s'adapte à votre métier. Le chatbot répond aux questions fréquentes, qualifie les prospects, prend des rendez-vous et transfère aux humains quand nécessaire. Résultat : vos équipes se concentrent sur les tâches à forte valeur ajoutée pendant que l'IA gère le flux. Déjà déployé auprès d'entreprises polynésiennes, notre chatbot réduit de 60% le temps passé en support client.`,
      moorea: `À Moorea, les pensions de famille et prestataires touristiques jonglent entre les demandes en français, anglais et parfois japonais ou espagnol. Un chatbot IA PACIFIK'AI répond instantanément dans la langue du visiteur, à toute heure — même quand vous êtes en excursion dans la baie de Cook. Notre solution gère les réservations, communique les tarifs, envoie les itinéraires d'accès depuis le ferry et répond aux questions sur les activités disponibles. Pour les producteurs d'ananas et de vanille de Moorea, le chatbot peut aussi gérer les commandes et suivre les livraisons vers Tahiti. Un assistant virtuel qui ne dort jamais, parfaitement adapté au rythme insulaire.`,
      'bora-bora': `Les clients des établissements de luxe à Bora Bora s'attendent à un service instantané et personnalisé. Un chatbot IA PACIFIK'AI offre ce niveau de service sur votre site web, WhatsApp ou Facebook, en 15+ langues. Demandes de surclassement, réservation de dîner romantique sur le motu, organisation d'excursion en pirogue : l'IA comprend le contexte et répond avec la sophistication attendue par une clientèle internationale fortunée. Notre technologie s'intègre à vos systèmes de réservation (PMS, channel managers) pour des réponses en temps réel sur les disponibilités. Offrez l'excellence du service polynésien, amplifiée par l'intelligence artificielle.`,
      faaa: `Les entreprises de Faaa, des ateliers de la zone industrielle aux commerces proches de l'aéroport, peuvent transformer leur service client avec un chatbot IA. PACIFIK'AI déploie des assistants virtuels qui répondent aux demandes de devis, gèrent les prises de rendez-vous et orientent les clients vers le bon interlocuteur. Avec 30 000 habitants et un flux constant de voyageurs, le volume de sollicitations est élevé. Notre chatbot absorbe ce flux sans embauche supplémentaire, disponible même en dehors des heures d'ouverture. Solution idéale pour les garages, commerces, prestataires logistiques et entreprises de services qui veulent professionnaliser leur accueil client à Faaa.`,
      punaauia: `Les commerces et entreprises de Punaauia servent une clientèle exigeante et connectée. Un chatbot IA PACIFIK'AI s'intègre à votre site web ou page Facebook pour répondre instantanément aux questions sur vos horaires, produits, tarifs et disponibilités. Pour les restaurants de la côte ouest, le chatbot gère les réservations. Pour les cabinets médicaux, il pré-qualifie les patients. Pour les boutiques du centre commercial, il conseille les produits. Notre technologie apprend de chaque interaction et s'améliore continuellement. Démarrez avec un chatbot simple et évoluez vers un assistant complet qui connaît votre catalogue, vos promotions et votre historique client.`,
      pirae: `Les institutions et entreprises de Pirae, au cœur du quartier administratif de Tahiti, traitent un volume important de demandes récurrentes. Un chatbot IA PACIFIK'AI automatise les réponses aux questions fréquentes, oriente les visiteurs et collecte les informations nécessaires avant un rendez-vous. Pour les cabinets proches de l'Assemblée de la PF, l'IA gère les premières interactions avec les administrés ou clients. Pour les entreprises du secteur tertiaire à Pirae, le chatbot qualifie les prospects et planifie les réunions. Notre solution respecte la confidentialité des données et s'adapte au vocabulaire spécifique de votre secteur d'activité.`
    }
  },
  {
    slug: 'automatisation',
    title: 'Automatisation',
    shortTitle: 'Automatisation',
    icon: '⚡',
    servicePage: '/services/workflows.html',
    schemaType: 'ProfessionalService',
    descriptions: {
      papeete: `Les entreprises de Papeete perdent en moyenne 15 heures par semaine sur des tâches répétitives : saisie de données, envoi d'emails, suivi de commandes, relances factures. PACIFIK'AI automatise ces processus avec des workflows intelligents qui connectent vos outils existants. Comptabilité, CRM, gestion des stocks, facturation : chaque processus manuel devient un flux automatique fiable. Nos solutions s'intègrent à vos logiciels actuels sans tout remplacer. Pour les PME du centre de Papeete comme pour les grandes entreprises du port, l'automatisation libère vos équipes pour les missions stratégiques et élimine les erreurs humaines.`,
      moorea: `À Moorea, la gestion d'une pension de famille ou d'une activité touristique implique des dizaines de tâches administratives : confirmation de réservation, envoi d'instructions d'arrivée, relance des avis Google, suivi comptable. PACIFIK'AI automatise tout ce flux pour que vous puissiez vous concentrer sur l'accueil de vos hôtes. Nos workflows connectent Booking.com, Airbnb, votre site web et votre comptabilité en un seul système fluide. Pour les agriculteurs de Moorea, nous automatisons le suivi des commandes, la facturation et les livraisons vers Tahiti. Simplicité d'utilisation garantie — nos automatisations fonctionnent en arrière-plan sans intervention.`,
      'bora-bora': `Les établissements hôteliers et prestataires touristiques de Bora Bora gèrent une complexité opérationnelle unique : multi-plateformes de réservation, logistique bateau, coordination d'activités, reporting groupe. PACIFIK'AI automatise les flux entre vos channel managers, votre PMS, votre comptabilité et vos équipes terrain. Check-in automatisé, alertes maintenance, reporting quotidien aux propriétaires : chaque processus est optimisé. Nos solutions ont été conçues en comprenant les contraintes spécifiques des îles — connectivité, décalage horaire avec les sièges sociaux — pour un fonctionnement autonome et fiable.`,
      faaa: `La zone industrielle et commerciale de Faaa concentre des entreprises avec des besoins opérationnels importants : gestion de flotte, suivi logistique, facturation en volume, coordination d'équipes. PACIFIK'AI déploie des automatisations sur mesure qui éliminent les doublons de saisie, accélèrent la facturation et synchronisent vos différents systèmes. Pour les entreprises proches de l'aéroport, nous automatisons aussi les processus liés au fret, aux douanes et au suivi de colis. Nos workflows traitent des centaines d'opérations par jour sans erreur, avec des alertes en temps réel quand une intervention humaine est nécessaire.`,
      punaauia: `Les entreprises de Punaauia, du commerce de détail aux services professionnels, bénéficient d'une automatisation sur mesure par PACIFIK'AI. Synchronisation des stocks avec votre site e-commerce, envoi automatique des promotions, gestion des plannings d'équipe, suivi des paiements clients : nos workflows couvrent l'ensemble de vos besoins opérationnels. Pour les restaurants et commerces du centre commercial, nous automatisons la gestion des commandes fournisseurs et le réapprovisionnement. Pour les cabinets et professions libérales de Punaauia, nous simplifions la prise de rendez-vous, les relances et le suivi administratif.`,
      pirae: `Le quartier d'affaires de Pirae abrite des entreprises dont les processus administratifs sont souvent lourds et chronophages. PACIFIK'AI automatise la gestion documentaire, les circuits de validation, le reporting financier et la coordination inter-services. Pour les structures proches des institutions polynésiennes, nous automatisons aussi les réponses aux appels d'offres, le suivi réglementaire et la veille administrative. Nos solutions s'intègrent à vos ERP et logiciels métier existants. Résultat mesurable : réduction de 40% du temps administratif et zéro erreur de saisie sur les processus automatisés.`
    }
  },
  {
    slug: 'application-mobile',
    title: 'Application Mobile',
    shortTitle: 'Application Mobile',
    icon: '📱',
    servicePage: '/services/apps.html',
    schemaType: 'SoftwareApplication',
    descriptions: {
      papeete: `À Papeete, 85% de la population utilise un smartphone au quotidien. PACIFIK'AI développe des applications mobiles natives et cross-platform pour les entreprises de la capitale qui veulent toucher leurs clients directement dans leur poche. Application de livraison pour les restaurants du centre-ville, app de fidélité pour les commerces du marché, outil de gestion pour les professionnels du port — chaque projet est conçu sur mesure. Nos applications intègrent les notifications push, le paiement mobile et la géolocalisation pour une expérience utilisateur fluide et engageante, adaptée aux usages polynésiens.`,
      moorea: `Une application mobile pour votre activité à Moorea, c'est l'assurance d'être dans la poche de chaque visiteur. PACIFIK'AI conçoit des apps pour les pensions de famille (réservation, guide d'activités), les prestataires touristiques (booking en direct, suivi GPS des excursions) et les producteurs locaux (commande en ligne, livraison). Nos applications fonctionnent même avec une connexion limitée grâce au mode offline. Pour les 18 000 habitants de Moorea, nous créons aussi des apps communautaires : covoiturage pour le ferry, marketplace locale, alertes info de la commune.`,
      'bora-bora': `Les hôtels et resorts de Bora Bora offrent à leurs clients des expériences exclusives — votre application mobile doit être à la hauteur. PACIFIK'AI développe des apps premium : conciergerie digitale, commande room service, réservation spa et activités, plan interactif du resort. L'application remplace les livrets papier et offre une communication directe avec la réception. Pour les prestataires indépendants de Bora Bora, nous créons des apps de réservation et de paiement qui évitent les commissions des plateformes tierces. Design raffiné, performance optimale, disponible en 10+ langues pour votre clientèle internationale.`,
      faaa: `Les entreprises de Faaa ont besoin d'outils mobiles efficaces pour gérer leurs opérations terrain. PACIFIK'AI développe des applications métier : suivi de flotte pour les transporteurs, gestion d'interventions pour les artisans, pointage mobile pour les équipes de la zone industrielle. Pour les commerces proches de l'aéroport, nous créons des apps de click & collect et de fidélité. Nos applications sont robustes, rapides et conçues pour un usage intensif au quotidien. Avec 30 000 habitants, Faaa représente un marché local significatif pour les applications de services de proximité.`,
      punaauia: `Punaauia, avec sa population aisée et connectée de 28 000 habitants, est le terrain idéal pour une application mobile innovante. PACIFIK'AI développe des apps pour les commerces du centre Carrefour (fidélité, promotions push), les restaurants de la côte ouest (commande en ligne, livraison) et les professionnels de santé (téléconsultation, suivi patient). Nous concevons aussi des applications immobilières pour les agences de Punaauia, avec visite virtuelle 3D et estimation en ligne. Chaque app est optimisée pour iOS et Android avec un design premium qui reflète le standing de la commune.`,
      pirae: `Les entreprises et institutions de Pirae peuvent digitaliser leurs services avec une application mobile PACIFIK'AI. Pour les administrations, nous développons des apps de démarches en ligne et de suivi de dossiers. Pour les entreprises du quartier d'affaires, des outils de collaboration et de gestion de projet mobile. Pour les commerçants de Pirae, des solutions de vente en ligne et de fidélisation. Nos applications s'intègrent aux systèmes d'information existants et respectent les normes de sécurité requises par les institutions polynésiennes. Un investissement technologique qui positionne Pirae comme un pôle d'innovation digitale.`
    }
  },
  {
    slug: 'marketing-digital',
    title: 'Marketing Digital',
    shortTitle: 'Marketing Digital',
    icon: '📣',
    servicePage: '/services/marketing.html',
    schemaType: 'ProfessionalService',
    descriptions: {
      papeete: `Le marketing digital à Papeete ne fonctionne pas comme à Paris. Les Polynésiens utilisent massivement Facebook (90% de pénétration), Instagram et TikTok, avec des comportements d'achat spécifiques. PACIFIK'AI maîtrise ces codes locaux et déploie des stratégies digitales performantes pour les entreprises de la capitale. SEO local pour apparaître en premier sur "restaurant Papeete" ou "plombier Tahiti", campagnes Facebook Ads géolocalisées, création de contenu engageant en français et tahitien, email marketing ciblé. Nous mesurons chaque franc dépensé et optimisons en continu pour maximiser votre retour sur investissement.`,
      moorea: `Le marketing digital à Moorea cible deux audiences distinctes : les résidents (18 000 habitants) et les touristes internationaux qui planifient leur séjour. PACIFIK'AI élabore des stratégies double-cible : SEO en français pour le marché local + SEO en anglais pour le tourisme. Nous optimisons votre fiche Google Business, gérons vos campagnes TripAdvisor et créons du contenu Instagram qui fait rêver. Pour les producteurs locaux de Moorea, nous développons des stratégies de vente directe en ligne qui contournent les intermédiaires. Résultat : plus de réservations directes, plus de marge, moins de dépendance aux plateformes.`,
      'bora-bora': `Le marketing digital pour Bora Bora opère à l'échelle mondiale. Vos clients potentiels sont à Los Angeles, Tokyo, Sydney ou Paris, et ils comparent les offres en ligne avant de réserver. PACIFIK'AI positionne votre établissement avec un SEO international multilingue, des campagnes Google Ads ciblées par marché source, et une stratégie de contenu premium sur Instagram et Pinterest. Nous gérons votre e-réputation sur TripAdvisor, Booking et Google Reviews. Notre expertise locale combinée à une vision internationale vous donne un avantage concurrentiel décisif sur le marché ultra-compétitif du tourisme de luxe polynésien.`,
      faaa: `Les 30 000 habitants de Faaa et les voyageurs transitant par l'aéroport représentent un marché captif pour les entreprises locales. PACIFIK'AI déploie des stratégies de marketing digital géolocalisé : référencement local sur Google Maps, publicités Facebook ciblées sur Faaa et communes limitrophes, gestion de votre e-réputation. Pour les entreprises de la zone industrielle, nous développons des stratégies B2B : LinkedIn, emailing professionnel, content marketing. Nos campagnes sont mesurées en temps réel avec des tableaux de bord clairs — vous savez exactement combien chaque franc investi vous rapporte.`,
      punaauia: `Punaauia concentre le plus fort pouvoir d'achat de Polynésie française. PACIFIK'AI conçoit des stratégies marketing digitales premium pour toucher cette clientèle exigeante. Publicités Instagram lifestyle, influenceurs locaux, contenu vidéo haute qualité : chaque campagne reflète le positionnement haut de gamme de vos produits ou services. Pour les commerces du centre Carrefour, nous optimisons le drive-to-store avec des publicités géolocalisées et des offres push. SEO local, gestion Google Business, campagnes Facebook et Instagram — nous couvrons l'ensemble du parcours client digital à Punaauia.`,
      pirae: `Le quartier d'affaires de Pirae abrite des entreprises dont la communication digitale doit refléter le professionnalisme et la crédibilité. PACIFIK'AI développe des stratégies marketing B2B et B2C adaptées : LinkedIn pour le networking professionnel, SEO sectoriel pour la visibilité, campagnes ciblées pour la génération de leads qualifiés. Pour les commerces et services de proximité à Pirae, nous optimisons votre présence locale avec Google Business, des avis clients et du contenu engageant sur les réseaux sociaux. Notre approche data-driven garantit un suivi précis du ROI de chaque action marketing.`
    }
  },
  {
    slug: 'intelligence-artificielle',
    title: 'Intelligence Artificielle',
    shortTitle: 'Intelligence Artificielle',
    icon: '🧠',
    servicePage: '/services/api.html',
    schemaType: 'ProfessionalService',
    descriptions: {
      papeete: `L'intelligence artificielle n'est plus réservée aux géants de la Silicon Valley. À Papeete, PACIFIK'AI déploie des solutions IA concrètes et accessibles pour les entreprises polynésiennes. Analyse prédictive des ventes, classification automatique de documents, reconnaissance d'images pour le contrôle qualité, IA conversationnelle multilingue — chaque solution est adaptée à votre secteur et votre budget. Nous formons aussi vos équipes à l'utilisation des outils IA (ChatGPT, Claude, Midjourney) pour booster leur productivité au quotidien. Papeete peut devenir un hub d'innovation IA dans le Pacifique — votre entreprise peut en être le pionnier.`,
      moorea: `L'intelligence artificielle à Moorea, c'est pragmatique et utile. PACIFIK'AI déploie des solutions IA pour les secteurs clés de l'île : analyse d'images par drone pour l'agriculture (détection de maladies sur les cultures d'ananas), prédiction de la demande touristique pour optimiser vos tarifs, traduction automatique pour communiquer avec les visiteurs internationaux. Pour les pensions de famille, l'IA analyse les avis en ligne et suggère des améliorations concrètes. Pas besoin d'être un expert : nos solutions sont prêtes à l'emploi et s'intègrent à vos outils existants avec un accompagnement sur mesure.`,
      'bora-bora': `Les établissements de luxe à Bora Bora peuvent exploiter l'IA pour offrir une expérience client exceptionnelle. PACIFIK'AI intègre des solutions d'intelligence artificielle : personnalisation dynamique des séjours basée sur les préférences clients, tarification intelligente (revenue management IA), analyse de sentiment sur les avis en ligne, recommandation d'activités en temps réel. Notre IA analyse les données de vos clients pour anticiper leurs besoins et maximiser leur satisfaction — et votre revenu par chambre. Technologie de pointe, déployée sur le plus beau lagon du monde.`,
      faaa: `Les entreprises industrielles et logistiques de Faaa sont les premières à bénéficier de l'intelligence artificielle. PACIFIK'AI déploie des solutions IA pour l'optimisation logistique (planification de tournées, prévision de stock), le contrôle qualité automatisé (vision par ordinateur), la maintenance prédictive des équipements et l'analyse de données commerciales. Pour les entreprises proches de l'aéroport, l'IA optimise les processus de fret et de dédouanement. Nos solutions sont conçues pour un ROI rapide : en moyenne 3 mois pour commencer à mesurer des gains concrets de productivité.`,
      punaauia: `Les entreprises de Punaauia adoptent l'IA pour se démarquer sur un marché compétitif. PACIFIK'AI propose des solutions d'intelligence artificielle pour le retail (analyse des comportements d'achat, recommandation de produits), la restauration (prévision de la demande, optimisation des commandes fournisseurs) et les services professionnels (automatisation des rapports, analyse de données clients). Pour les résidents de Punaauia, nous développons aussi des assistants IA personnels pour la gestion patrimoniale, la veille immobilière et l'organisation du quotidien. L'IA au service de la qualité de vie à Punaauia.`,
      pirae: `Le quartier d'affaires de Pirae est le lieu idéal pour l'adoption de l'intelligence artificielle en entreprise. PACIFIK'AI accompagne les sociétés et institutions de Pirae dans leur transformation IA : automatisation des processus administratifs, analyse prédictive pour la prise de décision, extraction intelligente de documents, IA générative pour la communication. Pour les structures proches de l'Assemblée de la PF, nous développons des solutions de traitement du langage naturel adaptées au contexte polynésien, incluant la compréhension du reo tahiti. Formation et accompagnement inclus pour une adoption sereine par vos équipes.`
    }
  },
  {
    slug: 'conseil-digital',
    title: 'Conseil Digital',
    shortTitle: 'Conseil Digital',
    icon: '💡',
    servicePage: '/services/conseil.html',
    schemaType: 'ConsultingService',
    descriptions: {
      papeete: `La transformation digitale à Papeete commence par un audit stratégique. PACIFIK'AI analyse vos processus métier, identifie les opportunités de digitalisation et construit une feuille de route adaptée à votre budget et vos ressources. Nos consultants connaissent le tissu économique polynésien et les contraintes spécifiques du marché local. Nous vous guidons dans le choix des bons outils (pas les plus chers, les plus adaptés), la formation de vos équipes et la mise en œuvre progressive. Subventions DGEN, aides ACN : nous vous accompagnons aussi dans le montage des dossiers de financement pour votre projet digital.`,
      moorea: `Digitaliser son activité à Moorea demande une approche pragmatique, adaptée aux réalités insulaires. PACIFIK'AI conseille les entrepreneurs de Moorea sur les meilleures stratégies digitales : quels outils adopter, comment réduire la dépendance aux intermédiaires type Booking.com, comment automatiser sans complexifier. Nous auditons votre activité sur place, identifions les quick wins (gains rapides) et construisons un plan d'action sur 6 à 12 mois. Nos recommandations prennent en compte la connectivité internet de l'île, les habitudes de votre clientèle et votre capacité d'investissement. Un conseil concret, pas du PowerPoint.`,
      'bora-bora': `Les entreprises de Bora Bora évoluent dans un environnement unique : clientèle internationale, saisonnalité marquée, contraintes logistiques insulaires. PACIFIK'AI apporte un conseil digital adapté à ces spécificités. Audit de votre stack technologique, recommandations d'outils adaptés au tourisme de luxe, stratégie de distribution directe pour réduire les commissions OTA. Nous aidons aussi les entreprises de Bora Bora à monter des dossiers de financement (DGEN, défiscalisation) pour leurs investissements numériques. Un accompagnement sur mesure par des experts qui comprennent le marché polynésien du tourisme haut de gamme.`,
      faaa: `Les entreprises de Faaa, notamment dans la zone industrielle, ont un fort potentiel de digitalisation souvent inexploité. PACIFIK'AI réalise des audits digitaux complets : analyse des processus, benchmark concurrentiel, identification des outils adaptés à votre secteur. Transport, logistique, BTP, commerce de gros : chaque secteur présent à Faaa a des solutions digitales spécifiques que nous maîtrisons. Nous construisons avec vous un plan de transformation réaliste, avec des étapes claires et un ROI mesurable. Notre conseil inclut l'accompagnement au changement pour que vos équipes adoptent les nouveaux outils sereinement.`,
      punaauia: `Les entreprises de Punaauia, du commerce de détail aux professions libérales, ont besoin d'un conseil digital actionnable et adapté à leur réalité. PACIFIK'AI audite votre maturité digitale, compare votre positionnement en ligne à vos concurrents et propose une stratégie sur mesure. Quels réseaux sociaux prioriser ? Faut-il un site e-commerce ou une marketplace ? Comment optimiser votre référencement local ? Nos recommandations sont chiffrées et priorisées par impact. Nous vous accompagnons aussi dans la structuration de vos données clients et la mise en conformité RGPD pour une croissance digitale sereine.`,
      pirae: `Les entreprises et institutions de Pirae bénéficient d'un conseil digital stratégique par PACIFIK'AI. Nous auditons votre infrastructure IT, vos processus métier et votre présence en ligne pour identifier les leviers de transformation les plus impactants. Pour les structures du quartier d'affaires, nous accompagnons la mise en place de solutions collaboratives, de gestion documentaire digitale et de reporting automatisé. Notre expertise couvre aussi la conformité réglementaire (RGPD, accessibilité) et le montage de dossiers de financement pour vos projets de transformation numérique. Conseil stratégique et opérationnel, de l'audit à la mise en œuvre.`
    }
  },
  {
    slug: 'extraction-documents',
    title: 'Extraction de Documents',
    shortTitle: 'Extraction Documents',
    icon: '📄',
    servicePage: '/services/documents.html',
    schemaType: 'ProfessionalService',
    descriptions: {
      papeete: `Les entreprises de Papeete traitent des volumes importants de documents : factures, bons de commande, contrats, formulaires administratifs. PACIFIK'AI automatise l'extraction et le classement de ces documents grâce à l'IA. Notre technologie OCR avancée lit et comprend les documents en français, extrait les données clés (montants, dates, noms) et les injecte directement dans votre comptabilité ou votre CRM. Fini la saisie manuelle, les erreurs de transcription et les heures perdues en classement. Pour les cabinets comptables, avocats et entreprises administratives de Papeete, c'est un gain de productivité immédiat et mesurable.`,
      moorea: `Les entrepreneurs de Moorea jonglent avec la paperasse administrative : déclarations CPS, factures fournisseurs, documents douaniers pour les imports depuis Tahiti. PACIFIK'AI automatise le traitement de ces documents avec une solution d'extraction IA qui fonctionne depuis votre téléphone ou votre ordinateur. Photographiez un document, l'IA l'analyse, extrait les informations et les classe automatiquement. Pour les pensions de famille, nous automatisons le traitement des pièces d'identité des clients, des reçus et des documents de réservation. Simple, efficace, et accessible même avec une connexion internet limitée grâce au traitement en mode hors-ligne.`,
      'bora-bora': `Les hôtels et entreprises touristiques de Bora Bora gèrent des documents dans de multiples langues et formats : passeports, réservations, factures fournisseurs, documents d'import. PACIFIK'AI déploie une solution d'extraction documentaire IA multilingue qui traite automatiquement ces documents. Scan des passeports pour le check-in express, extraction automatique des factures dans votre comptabilité, archivage intelligent et recherche instantanée. Notre solution réduit de 70% le temps de traitement administratif et élimine les erreurs de saisie. Parfaitement adaptée aux besoins des établissements haut de gamme de Bora Bora.`,
      faaa: `Les entreprises logistiques et industrielles de Faaa manipulent quotidiennement des centaines de documents : bons de livraison, lettres de transport, documents douaniers, factures. PACIFIK'AI automatise l'extraction et le traitement de ces flux documentaires avec une IA entraînée sur les formats locaux polynésiens. Notre solution s'intègre à vos logiciels de gestion (ERP, comptabilité, WMS) pour un traitement en temps réel. Pour les transitaires et importateurs de Faaa, nous automatisons aussi le rapprochement entre documents douaniers et factures commerciales. Gain de temps, réduction des erreurs, traçabilité complète.`,
      punaauia: `Les cabinets, commerces et entreprises de Punaauia peuvent digitaliser leur gestion documentaire avec PACIFIK'AI. Notre solution d'extraction IA traite automatiquement les factures, contrats, pièces comptables et documents administratifs. Pour les professions libérales (médecins, avocats, architectes), nous automatisons le classement et l'archivage des dossiers clients. Pour les commerces, nous digitalisons les bons de commande et la gestion des fournisseurs. L'IA apprend les spécificités de vos documents et s'améliore avec chaque traitement. Conformité RGPD garantie avec stockage sécurisé de vos données en Polynésie.`,
      pirae: `Les institutions et entreprises du quartier d'affaires de Pirae traitent un volume significatif de documents officiels, juridiques et financiers. PACIFIK'AI propose une solution d'extraction documentaire IA de niveau entreprise : OCR haute précision, classification automatique par type de document, extraction de données structurées et intégration dans vos systèmes d'information. Pour les structures proches de l'Assemblée de la PF, nous traitons les documents administratifs et réglementaires avec une précision supérieure à 98%. Nos solutions sont conformes aux exigences de sécurité et de confidentialité des données requises par les institutions polynésiennes.`
    }
  }
];

// ── Localities ────────────────────────────────────────────
const localities = [
  {
    slug: 'papeete',
    name: 'Papeete',
    population: '26 000',
    context: 'capitale administrative de la Polynésie française',
    lat: '-17.5353',
    lng: '-149.5696'
  },
  {
    slug: 'moorea',
    name: 'Moorea',
    population: '18 000',
    context: 'île touristique et agricole face à Tahiti',
    lat: '-17.5388',
    lng: '-149.8295'
  },
  {
    slug: 'bora-bora',
    name: 'Bora Bora',
    population: '10 000',
    context: 'capitale mondiale du tourisme de luxe',
    lat: '-16.5004',
    lng: '-151.7415'
  },
  {
    slug: 'faaa',
    name: 'Faaa',
    population: '30 000',
    context: 'plus grande commune de Polynésie française',
    lat: '-17.5516',
    lng: '-149.5975'
  },
  {
    slug: 'punaauia',
    name: 'Punaauia',
    population: '28 000',
    context: 'pôle commercial et résidentiel premium de Tahiti',
    lat: '-17.6167',
    lng: '-149.6056'
  },
  {
    slug: 'pirae',
    name: 'Pirae',
    population: '14 000',
    context: 'quartier d\'affaires et siège de l\'Assemblée de la PF',
    lat: '-17.5210',
    lng: '-149.5494'
  }
];

// ── HTML Template ─────────────────────────────────────────
function generatePage(service, locality) {
  const keyword = `${service.title} ${locality.name}`;
  const slug = `${service.slug}-${locality.slug}`;
  const canonicalUrl = `https://pacifikai.com/seo/${slug}.html`;
  const description = service.descriptions[locality.slug];
  const metaDesc = `${service.title} à ${locality.name}, Polynésie française. PACIFIK'AI, agence IA locale, accompagne les entreprises de ${locality.name} (${locality.population} hab.) dans leur transformation digitale.`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${service.title} à ${locality.name} | PACIFIK'AI - Agence IA Tahiti</title>
    <meta name="description" content="${metaDesc}">
    <meta name="keywords" content="${service.slug.replace(/-/g, ' ')} ${locality.name.toLowerCase()}, ${service.slug.replace(/-/g, ' ')} tahiti, agence digitale ${locality.name.toLowerCase()}, ${service.slug.replace(/-/g, ' ')} polynesie francaise">

    <link rel="canonical" href="${canonicalUrl}">
    <link rel="icon" type="image/png" href="/assets/favicon.png">

    <!-- Geo Meta -->
    <meta name="geo.region" content="PF">
    <meta name="geo.placename" content="${locality.name}, Polynésie française">
    <meta name="geo.position" content="${locality.lat};${locality.lng}">
    <meta name="ICBM" content="${locality.lat}, ${locality.lng}">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="PACIFIK'AI">
    <meta property="og:title" content="${service.title} à ${locality.name} | PACIFIK'AI">
    <meta property="og:description" content="${metaDesc}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="https://pacifikai.com/assets/og-image.png">
    <meta property="og:locale" content="fr_PF">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "name": "PACIFIK'AI",
          "description": "Agence digitale et intelligence artificielle en Polynésie française",
          "url": "https://pacifikai.com",
          "telephone": "+689-89558189",
          "email": "jordy@pacifikai.com",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Papeete",
            "addressRegion": "Tahiti",
            "addressCountry": "PF"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "${locality.lat}",
            "longitude": "${locality.lng}"
          },
          "areaServed": {
            "@type": "City",
            "name": "${locality.name}"
          },
          "priceRange": "$$"
        },
        {
          "@type": "Service",
          "serviceType": "${service.title}",
          "provider": {
            "@type": "LocalBusiness",
            "name": "PACIFIK'AI"
          },
          "areaServed": {
            "@type": "City",
            "name": "${locality.name}"
          },
          "description": "${metaDesc}"
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://pacifikai.com/" },
            { "@type": "ListItem", "position": 2, "name": "${service.shortTitle}", "item": "https://pacifikai.com${service.servicePage}" },
            { "@type": "ListItem", "position": 3, "name": "${service.title} à ${locality.name}", "item": "${canonicalUrl}" }
          ]
        }
      ]
    }
    </script>

    <style>
        :root {
            --bg: #080c14;
            --bg-card: #0d1424;
            --bg-card-hover: #111b30;
            --border: #162038;
            --border-light: #1e2d4a;
            --text: #f0f2f8;
            --text-secondary: #b0bcd4;
            --text-dim: #7888a8;
            --accent: #f97066;
            --accent-glow: rgba(249, 112, 102, 0.4);
            --accent-soft: rgba(249, 112, 102, 0.1);
            --lagoon: #14b8a6;
            --lagoon-soft: rgba(20, 184, 166, 0.1);
            --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
            --font-display: 'Audiowide', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        body {
            font-family: var(--font);
            background: var(--bg);
            color: var(--text);
            line-height: 1.7;
            overflow-x: hidden;
        }

        /* ── Nav ── */
        nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background: rgba(8, 12, 20, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            padding: 0.8rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .nav-logo {
            font-family: var(--font-display);
            font-size: 1.3rem;
            color: var(--accent);
            text-decoration: none;
        }
        .nav-links { display: flex; gap: 1.5rem; list-style: none; }
        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--accent); }

        /* ── Hero ── */
        .hero {
            padding: 8rem 2rem 4rem;
            text-align: center;
            position: relative;
        }
        .hero::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(ellipse at 50% 0%, var(--accent-soft) 0%, transparent 60%);
            pointer-events: none;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            border-radius: 100px;
            background: var(--accent-soft);
            border: 1px solid rgba(249, 112, 102, 0.2);
            color: var(--accent);
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }
        .hero h1 {
            font-family: var(--font-display);
            font-size: clamp(2rem, 5vw, 3.2rem);
            line-height: 1.2;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--text) 0%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero p {
            max-width: 700px;
            margin: 0 auto 2rem;
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        /* ── Breadcrumb ── */
        .breadcrumb {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
            font-size: 0.85rem;
            color: var(--text-dim);
        }
        .breadcrumb a {
            color: var(--text-dim);
            text-decoration: none;
            transition: color 0.2s;
        }
        .breadcrumb a:hover { color: var(--accent); }
        .breadcrumb span { color: var(--text-dim); }

        /* ── Content ── */
        .content {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 2rem 4rem;
        }
        .content-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2.5rem;
            margin-bottom: 2rem;
        }
        .content-card h2 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: var(--text);
        }
        .content-card p {
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.8;
        }

        /* ── Features Grid ── */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.2rem;
            margin: 2rem 0;
        }
        .feature-item {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            transition: border-color 0.3s, transform 0.3s;
        }
        .feature-item:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
        }
        .feature-icon {
            font-size: 1.8rem;
            margin-bottom: 0.8rem;
        }
        .feature-item h3 {
            font-size: 1rem;
            margin-bottom: 0.4rem;
            color: var(--text);
        }
        .feature-item p {
            font-size: 0.85rem;
            color: var(--text-dim);
        }

        /* ── CTA ── */
        .cta-section {
            text-align: center;
            padding: 4rem 2rem;
            position: relative;
        }
        .cta-section::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(ellipse at 50% 100%, var(--accent-soft) 0%, transparent 60%);
            pointer-events: none;
        }
        .cta-section h2 {
            font-size: 1.8rem;
            margin-bottom: 1rem;
        }
        .cta-section p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.9rem 2rem;
            background: var(--accent);
            color: #fff;
            font-weight: 700;
            font-size: 1rem;
            border: none;
            border-radius: 12px;
            text-decoration: none;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px var(--accent-glow);
        }
        .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.9rem 2rem;
            background: transparent;
            color: var(--text);
            font-weight: 600;
            font-size: 1rem;
            border: 1px solid var(--border-light);
            border-radius: 12px;
            text-decoration: none;
            margin-left: 1rem;
            transition: border-color 0.2s;
        }
        .btn-secondary:hover { border-color: var(--accent); }

        /* ── Locality Info ── */
        .locality-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.2rem 1.5rem;
            background: var(--lagoon-soft);
            border: 1px solid rgba(20, 184, 166, 0.2);
            border-radius: 12px;
            margin-bottom: 2rem;
        }
        .locality-info .loc-icon { font-size: 1.5rem; }
        .locality-info .loc-text {
            font-size: 0.9rem;
            color: var(--lagoon);
            font-weight: 500;
        }

        /* ── Internal Links ── */
        .internal-links {
            margin-top: 3rem;
        }
        .internal-links h3 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: var(--text);
        }
        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.8rem;
        }
        .links-grid a {
            display: block;
            padding: 0.8rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.9rem;
            transition: border-color 0.2s, color 0.2s;
        }
        .links-grid a:hover {
            border-color: var(--accent);
            color: var(--accent);
        }

        /* ── Footer ── */
        footer {
            text-align: center;
            padding: 2rem;
            border-top: 1px solid var(--border);
            color: var(--text-dim);
            font-size: 0.85rem;
        }
        footer a { color: var(--accent); text-decoration: none; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            nav { padding: 0.6rem 1rem; }
            .nav-links { display: none; }
            .hero { padding: 6rem 1rem 3rem; }
            .content { padding: 1rem; }
            .content-card { padding: 1.5rem; }
            .btn-secondary { margin-left: 0; margin-top: 0.8rem; }
            .cta-section .btn-secondary { display: block; margin: 0.8rem auto 0; }
        }
    </style>
</head>
<body>
    <nav>
        <a href="/" class="nav-logo">PACIFIK'AI</a>
        <ul class="nav-links">
            <li><a href="/#services">Services</a></li>
            <li><a href="/tarifs.html">Tarifs</a></li>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/#contact">Contact</a></li>
        </ul>
    </nav>

    <section class="hero">
        <div class="breadcrumb">
            <a href="/">Accueil</a> <span>›</span>
            <a href="${service.servicePage}">${service.shortTitle}</a> <span>›</span>
            <span>${locality.name}</span>
        </div>
        <div class="hero-badge">${service.icon} ${service.shortTitle} — ${locality.name}</div>
        <h1>${service.title} à ${locality.name}</h1>
        <p>PACIFIK'AI accompagne les entreprises de ${locality.name}, ${locality.context}, dans leur ${service.title.toLowerCase()}. Solutions sur mesure, expertise locale, résultats concrets.</p>
    </section>

    <section class="content">
        <div class="locality-info">
            <span class="loc-icon">📍</span>
            <span class="loc-text">${locality.name} — ${locality.context} — ${locality.population} habitants</span>
        </div>

        <div class="content-card">
            <h2>${service.title} pour les entreprises de ${locality.name}</h2>
            <p>${description}</p>
        </div>

        <div class="features">
            <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <h3>Expertise Locale</h3>
                <p>Connaissance du marché polynésien et des spécificités de ${locality.name}</p>
            </div>
            <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <h3>Résultats Rapides</h3>
                <p>Déploiement en 2 à 4 semaines, ROI mesurable dès le premier mois</p>
            </div>
            <div class="feature-item">
                <div class="feature-icon">🛡️</div>
                <h3>Support Dédié</h3>
                <p>Accompagnement personnalisé et support réactif en Polynésie française</p>
            </div>
            <div class="feature-item">
                <div class="feature-icon">💰</div>
                <h3>Prix Adaptés</h3>
                <p>Tarification transparente adaptée au marché polynésien, devis gratuit</p>
            </div>
        </div>

        <div class="internal-links">
            <h3>Nos services à ${locality.name}</h3>
            <div class="links-grid">
                ${services
                  .filter(s => s.slug !== service.slug)
                  .map(s => `<a href="/seo/${s.slug}-${locality.slug}.html">${s.icon} ${s.title} à ${locality.name}</a>`)
                  .join('\n                ')}
            </div>
        </div>

        <div class="internal-links" style="margin-top: 2rem;">
            <h3>${service.title} dans d'autres communes</h3>
            <div class="links-grid">
                ${localities
                  .filter(l => l.slug !== locality.slug)
                  .map(l => `<a href="/seo/${service.slug}-${l.slug}.html">📍 ${service.title} à ${l.name}</a>`)
                  .join('\n                ')}
            </div>
        </div>
    </section>

    <section class="cta-section">
        <h2>Prêt à digitaliser votre activité à ${locality.name} ?</h2>
        <p>Devis gratuit et sans engagement. Réponse sous 24h.</p>
        <a href="mailto:jordy@pacifikai.com?subject=${encodeURIComponent(`${service.title} à ${locality.name}`)}" class="btn-primary">
            ✉️ Demander un Devis Gratuit
        </a>
        <a href="/${service.servicePage}" class="btn-secondary">
            En savoir plus →
        </a>
    </section>

    <footer>
        <p>© ${new Date().getFullYear()} <a href="/">PACIFIK'AI</a> — Agence IA & Digitale à Tahiti, Polynésie française</p>
        <p style="margin-top: 0.5rem;">
            <a href="/cgu.html">CGU</a> · <a href="/confidentialite.html">Confidentialité</a> · <a href="mailto:jordy@pacifikai.com">jordy@pacifikai.com</a>
        </p>
    </footer>
</body>
</html>`;
}

// ── Generate All Pages ────────────────────────────────────
let count = 0;
const generatedPages = [];

for (const service of services) {
  for (const locality of localities) {
    const filename = `${service.slug}-${locality.slug}.html`;
    const filepath = join(SEO_DIR, filename);
    const html = generatePage(service, locality);
    writeFileSync(filepath, html, 'utf-8');
    generatedPages.push({ filename, service: service.title, locality: locality.name });
    count++;
  }
}

console.log(`✅ Generated ${count} SEO pages in ${SEO_DIR}`);
generatedPages.forEach(p => console.log(`   ${p.filename} — ${p.service} à ${p.locality}`));

// ── Generate Sitemap Entries ──────────────────────────────
const today = new Date().toISOString().split('T')[0];
const sitemapEntries = generatedPages.map(p => `  <url>
    <loc>https://pacifikai.com/seo/${p.filename}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

console.log(`\n📋 Sitemap entries to add:\n`);
console.log(sitemapEntries);
