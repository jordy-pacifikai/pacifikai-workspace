import type { SectorDefaults, Sector, TemplateVariant } from '../types';

export const SECTOR_DEFAULTS: Record<Sector, SectorDefaults> = {
  beauty: {
    taglines: [
      'Votre beauté, notre passion',
      "L'art de sublimer votre beauté",
      'Beauté & Bien-être sur mesure',
    ],
    counters: [
      { value: 10, suffix: '+', label: "Années d'expérience" },
      { value: 500, suffix: '+', label: 'Clients satisfaits' },
      { value: 100, suffix: '%', label: 'Sur rendez-vous' },
    ],
    process_steps: [
      { title: 'Réservation', description: 'Prenez rendez-vous en ligne ou par téléphone.' },
      { title: 'Consultation', description: 'Votre spécialiste évalue vos besoins.' },
      { title: 'Résultat', description: 'Repartez sublime et satisfait(e).' },
    ],
    marquee_words: ['BEAUTÉ', 'BIEN-ÊTRE', 'EXPERTISE', 'SUR MESURE', 'TAHITI', 'SOIN'],
    testimonial: {
      quote: 'Un service exceptionnel, je recommande les yeux fermés.',
      author: 'Marie, Papeete',
    },
    cta_text: 'Prêt(e) à prendre soin de vous ?',
    cta_button: 'Prendre Rendez-vous',
    nav_links: [
      { label: 'Services', href: '#services' },
      { label: 'À propos', href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['dark-bold', 'light-elegant', 'warm-amber'],
  },

  food: {
    taglines: [
      'Cuisine authentique, saveurs locales',
      'Le goût de la Polynésie',
      'Fait maison avec passion',
    ],
    counters: [
      { value: 15, suffix: '+', label: 'Années de cuisine' },
      { value: 50, suffix: '+', label: 'Recettes maison' },
      { value: 200, suffix: '+', label: 'Clients par jour' },
    ],
    process_steps: [
      { title: 'Commander', description: 'Consultez notre carte et passez commande.' },
      { title: 'Préparer', description: 'Chaque plat est préparé minute avec des produits frais.' },
      { title: 'Savourer', description: 'Installez-vous et régalez-vous.' },
    ],
    marquee_words: ['CUISINE', 'TRADITION', 'FAIT MAISON', 'SAVEURS', 'TAHITI', 'FRAÎCHEUR'],
    testimonial: {
      quote: "Le meilleur poisson cru de l'île, on y revient chaque semaine.",
      author: 'Teva, Papeete',
    },
    cta_text: 'Envie de goûter ?',
    cta_button: 'Voir la Carte',
    nav_links: [
      { label: 'La Carte', href: '#menu' },
      { label: 'Infos', href: '#infos' },
      { label: 'Galerie', href: '#galerie' },
    ],
    preferred_variants: ['warm-amber', 'dark-bold', 'light-elegant'],
  },

  auto: {
    taglines: [
      'Votre véhicule entre de bonnes mains',
      "L'expertise automobile à Tahiti",
      'Mécanique de confiance',
    ],
    counters: [
      { value: 15, suffix: '+', label: "Années d'expertise" },
      { value: 3000, suffix: '+', label: 'Véhicules réparés' },
      { value: 100, suffix: '%', label: 'Satisfaction' },
    ],
    process_steps: [
      { title: 'Diagnostic', description: 'Inspection complète de votre véhicule.' },
      { title: 'Intervention', description: 'Réparation avec des pièces de qualité.' },
      { title: 'Livraison', description: 'Votre véhicule prêt, comme neuf.' },
    ],
    marquee_words: ['MÉCANIQUE', 'EXPERTISE', 'FIABILITÉ', 'QUALITÉ', 'TAHITI', 'CONFIANCE'],
    testimonial: {
      quote: 'Rapide, pro et pas de mauvaise surprise sur le devis. Top.',
      author: "Moana, Faa'a",
    },
    cta_text: 'Besoin d\'un pro pour votre véhicule ?',
    cta_button: 'Prendre Rendez-vous',
    nav_links: [
      { label: 'Services', href: '#services' },
      { label: 'À propos', href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['dark-bold', 'warm-amber', 'light-elegant'],
  },

  health: {
    taglines: [
      'Votre santé, notre priorité',
      'Soins de qualité à Tahiti',
      'Au service de votre bien-être',
    ],
    counters: [
      { value: 20, suffix: '+', label: 'Années de pratique' },
      { value: 5000, suffix: '+', label: 'Patients suivis' },
      { value: 100, suffix: '%', label: 'Engagement qualité' },
    ],
    process_steps: [
      { title: 'Prise de RDV', description: 'Réservez en ligne ou par téléphone.' },
      { title: 'Consultation', description: 'Examen approfondi et diagnostic précis.' },
      { title: 'Suivi', description: 'Accompagnement personnalisé dans la durée.' },
    ],
    marquee_words: ['SANTÉ', 'BIEN-ÊTRE', 'QUALITÉ', 'CONFIANCE', 'TAHITI', 'SOIN'],
    testimonial: {
      quote: 'Un accueil chaleureux et des soins de grande qualité.',
      author: 'Hina, Punaauia',
    },
    cta_text: 'Prenez soin de votre santé',
    cta_button: 'Prendre Rendez-vous',
    nav_links: [
      { label: 'Services', href: '#services' },
      { label: "L'équipe", href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['light-elegant', 'dark-bold', 'warm-amber'],
  },

  sport: {
    taglines: [
      'Dépassez vos limites',
      'Le sport, une passion partagée',
      'Votre corps, votre défi',
    ],
    counters: [
      { value: 10, suffix: '+', label: "Années d'activité" },
      { value: 1000, suffix: '+', label: 'Membres actifs' },
      { value: 100, suffix: '%', label: 'Motivation' },
    ],
    process_steps: [
      { title: 'Inscription', description: 'Choisissez votre programme.' },
      { title: 'Entraînement', description: 'Séances encadrées par des coachs pros.' },
      { title: 'Résultats', description: 'Progressez et atteignez vos objectifs.' },
    ],
    marquee_words: ['SPORT', 'ÉNERGIE', 'PERFORMANCE', 'TAHITI', 'COACHING', 'DÉFI'],
    testimonial: {
      quote: 'Une ambiance de folie et des résultats visibles en quelques semaines.',
      author: 'Raimana, Papeete',
    },
    cta_text: 'Prêt(e) à vous dépasser ?',
    cta_button: "S'inscrire",
    nav_links: [
      { label: 'Activités', href: '#services' },
      { label: "L'équipe", href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['dark-bold', 'warm-amber', 'light-elegant'],
  },

  legal: {
    taglines: [
      'Le droit à vos côtés',
      'Conseil juridique de confiance',
      'Votre avocat à Tahiti',
    ],
    counters: [
      { value: 15, suffix: '+', label: 'Années au barreau' },
      { value: 2000, suffix: '+', label: 'Dossiers traités' },
      { value: 98, suffix: '%', label: 'Taux de satisfaction' },
    ],
    process_steps: [
      { title: 'Premier contact', description: 'Exposez-nous votre situation en toute confidentialité.' },
      { title: 'Analyse', description: 'Étude approfondie de votre dossier.' },
      { title: 'Action', description: 'Défense de vos intérêts avec détermination.' },
    ],
    marquee_words: ['DROIT', 'JUSTICE', 'CONFIANCE', 'EXPERTISE', 'TAHITI', 'DÉFENSE'],
    testimonial: {
      quote: 'Un accompagnement sérieux et humain tout au long de la procédure.',
      author: 'Patrick, Pirae',
    },
    cta_text: 'Besoin d\'un conseil juridique ?',
    cta_button: 'Nous Consulter',
    nav_links: [
      { label: 'Domaines', href: '#services' },
      { label: 'Le Cabinet', href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['light-elegant', 'dark-bold', 'warm-amber'],
  },

  education: {
    taglines: [
      'Apprendre, grandir, réussir',
      "L'éducation qui fait la différence",
      'Votre avenir commence ici',
    ],
    counters: [
      { value: 10, suffix: '+', label: "Années d'enseignement" },
      { value: 500, suffix: '+', label: 'Élèves formés' },
      { value: 95, suffix: '%', label: 'Taux de réussite' },
    ],
    process_steps: [
      { title: 'Inscription', description: 'Choisissez votre formation.' },
      { title: 'Apprentissage', description: 'Cours adaptés à votre rythme.' },
      { title: 'Diplôme', description: 'Obtenez votre certification.' },
    ],
    marquee_words: ['ÉDUCATION', 'SAVOIR', 'RÉUSSITE', 'AVENIR', 'TAHITI', 'FORMATION'],
    testimonial: {
      quote: "Une formation de qualité qui m'a ouvert de nouvelles portes.",
      author: 'Vaiana, Papeete',
    },
    cta_text: 'Prêt(e) à apprendre ?',
    cta_button: "S'inscrire",
    nav_links: [
      { label: 'Formations', href: '#services' },
      { label: "L'équipe", href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['light-elegant', 'warm-amber', 'dark-bold'],
  },

  other: {
    taglines: [
      "L'excellence à votre service",
      'Votre partenaire de confiance à Tahiti',
      'Qualité et professionnalisme',
    ],
    counters: [
      { value: 10, suffix: '+', label: "Années d'expérience" },
      { value: 1000, suffix: '+', label: 'Clients satisfaits' },
      { value: 100, suffix: '%', label: 'Engagement qualité' },
    ],
    process_steps: [
      { title: 'Contact', description: 'Contactez-nous pour discuter de votre projet.' },
      { title: 'Réalisation', description: 'Nous mettons tout en œuvre pour vous satisfaire.' },
      { title: 'Résultat', description: 'Un service à la hauteur de vos attentes.' },
    ],
    marquee_words: ['QUALITÉ', 'SERVICE', 'CONFIANCE', 'EXPERTISE', 'TAHITI', 'EXCELLENCE'],
    testimonial: {
      quote: 'Un service impeccable du début à la fin. Je recommande.',
      author: 'Jean, Papeete',
    },
    cta_text: 'Besoin de nos services ?',
    cta_button: 'Nous Contacter',
    nav_links: [
      { label: 'Services', href: '#services' },
      { label: 'À propos', href: '#apropos' },
      { label: 'Contact', href: '#rdv' },
    ],
    preferred_variants: ['dark-bold', 'light-elegant', 'warm-amber'],
  },
};

export function getDefaultsForSector(sector: Sector): SectorDefaults {
  return SECTOR_DEFAULTS[sector] || SECTOR_DEFAULTS['other'];
}
