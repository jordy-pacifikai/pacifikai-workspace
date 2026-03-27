import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  Share2,
  Bot,
  BookOpen,
  MessageCircle,
  Plug,
  Scissors,
  Package,
  Trophy,
  Clock,
  MessageSquareText,
  FileBarChart,
  Settings,
  Lightbulb,
  Star,
  BarChart2,
  Layers,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

export interface PageEntry {
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  icon: LucideIcon;
  group: string;
}

export const PAGE_INDEX: PageEntry[] = [
  // ── Monitoring ─────────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    subtitle: 'Vue d\'ensemble des statistiques',
    href: '/stats',
    keywords: ['dashboard', 'tableau de bord', 'statistiques', 'overview', 'accueil'],
    icon: LayoutDashboard,
    group: 'Monitoring',
  },
  {
    title: 'Calendrier',
    subtitle: 'Vue calendrier de tous les RDV',
    href: '/calendar',
    keywords: ['calendrier', 'agenda', 'planning', 'calendar'],
    icon: Calendar,
    group: 'Monitoring',
  },
  {
    title: 'Rendez-vous',
    subtitle: 'Liste et gestion des réservations',
    href: '/appointments',
    keywords: ['rendez-vous', 'rdv', 'booking', 'réservations', 'appointments'],
    icon: ClipboardList,
    group: 'Monitoring',
  },
  {
    title: 'Clients',
    subtitle: 'Base de données clients',
    href: '/clients',
    keywords: ['clients', 'contacts', 'crm', 'base de données'],
    icon: Users,
    group: 'Monitoring',
  },
  {
    title: 'Partager',
    subtitle: 'Lien de réservation public',
    href: '/share',
    keywords: ['partager', 'lien', 'share', 'public', 'booking link'],
    icon: Share2,
    group: 'Monitoring',
  },

  // ── Configuration IA ───────────────────────────────────────────────────────
  {
    title: 'Agent IA',
    subtitle: 'Configuration de l\'assistant IA',
    href: '/agent',
    keywords: ['agent', 'ia', 'assistant', 'bot', 'configuration', 'intelligence artificielle'],
    icon: Bot,
    group: 'Configuration IA',
  },
  {
    title: 'Connaissances',
    subtitle: 'Base de connaissances de l\'IA',
    href: '/knowledge',
    keywords: ['connaissances', 'knowledge', 'base', 'faq', 'documents'],
    icon: BookOpen,
    group: 'Configuration IA',
  },
  {
    title: 'Test chatbot',
    subtitle: 'Tester l\'assistant en direct',
    href: '/chat-test',
    keywords: ['test', 'chatbot', 'chat', 'conversation', 'démo'],
    icon: MessageCircle,
    group: 'Configuration IA',
  },
  {
    title: 'Canaux',
    subtitle: 'Messenger, Instagram, WhatsApp',
    href: '/channels',
    keywords: ['canaux', 'channels', 'messenger', 'instagram', 'whatsapp', 'intégrations'],
    icon: Plug,
    group: 'Configuration IA',
  },

  // ── Mon business ───────────────────────────────────────────────────────────
  {
    title: 'Services',
    subtitle: 'Prestations proposées',
    href: '/services',
    keywords: ['services', 'prestations', 'offres', 'catalogue'],
    icon: Scissors,
    group: 'Mon business',
  },
  {
    title: 'Forfaits',
    subtitle: 'Packs et abonnements',
    href: '/packages',
    keywords: ['forfaits', 'packages', 'packs', 'abonnements'],
    icon: Package,
    group: 'Mon business',
  },
  {
    title: 'Fidélité',
    subtitle: 'Programme de fidélisation clients',
    href: '/loyalty',
    keywords: ['fidélité', 'loyalty', 'points', 'récompenses', 'programme'],
    icon: Trophy,
    group: 'Mon business',
  },
  {
    title: 'Horaires',
    subtitle: 'Heures d\'ouverture et disponibilités',
    href: '/hours',
    keywords: ['horaires', 'heures', 'ouverture', 'disponibilités', 'schedule'],
    icon: Clock,
    group: 'Mon business',
  },
  {
    title: 'Messages',
    subtitle: 'Modèles de messages automatiques',
    href: '/templates',
    keywords: ['messages', 'templates', 'modèles', 'automatique', 'réponses'],
    icon: MessageSquareText,
    group: 'Mon business',
  },
  {
    title: 'Rapports',
    subtitle: 'Analyse et statistiques détaillées',
    href: '/reports',
    keywords: ['rapports', 'reports', 'analyse', 'statistiques', 'chiffres'],
    icon: FileBarChart,
    group: 'Mon business',
  },
  {
    title: 'Paramètres',
    subtitle: 'Configuration du compte',
    href: '/settings',
    keywords: ['paramètres', 'settings', 'configuration', 'compte', 'profil'],
    icon: Settings,
    group: 'Mon business',
  },
  {
    title: 'Suggestions',
    subtitle: 'Demandes de fonctionnalités',
    href: '/feature-requests',
    keywords: ['suggestions', 'features', 'fonctionnalités', 'améliorations', 'feedback'],
    icon: Lightbulb,
    group: 'Mon business',
  },

  // ── Autres pages ───────────────────────────────────────────────────────────
  {
    title: 'Conversations',
    subtitle: 'Historique des échanges IA',
    href: '/conversations',
    keywords: ['conversations', 'historique', 'messages', 'échanges'],
    icon: MessageCircle,
    group: 'Autres',
  },
  {
    title: 'Avis clients',
    subtitle: 'Gérer les avis et retours',
    href: '/reviews',
    keywords: ['avis', 'reviews', 'retours', 'notes', 'étoiles'],
    icon: Star,
    group: 'Autres',
  },
  {
    title: 'Analytique',
    subtitle: 'Métriques avancées',
    href: '/analytics',
    keywords: ['analytique', 'analytics', 'métriques', 'données'],
    icon: BarChart2,
    group: 'Autres',
  },
  {
    title: 'Jours fériés',
    subtitle: 'Fermetures et congés',
    href: '/holidays',
    keywords: ['fériés', 'holidays', 'congés', 'fermeture', 'vacances'],
    icon: Calendar,
    group: 'Autres',
  },
  {
    title: 'Récurrents',
    subtitle: 'Rendez-vous récurrents',
    href: '/recurring',
    keywords: ['récurrents', 'recurring', 'abonnements', 'répétition'],
    icon: RefreshCw,
    group: 'Autres',
  },
  {
    title: 'Liste d\'attente',
    subtitle: 'Clients en attente de disponibilité',
    href: '/waitlist',
    keywords: ['attente', 'waitlist', 'liste', 'disponibilité'],
    icon: Layers,
    group: 'Autres',
  },
  {
    title: 'Segments',
    subtitle: 'Segmentation de la clientèle',
    href: '/segments',
    keywords: ['segments', 'segmentation', 'groupes', 'audiences'],
    icon: Layers,
    group: 'Autres',
  },
  {
    title: 'Campagnes',
    subtitle: 'Campagnes marketing',
    href: '/campaigns',
    keywords: ['campagnes', 'campaigns', 'marketing', 'emailing', 'promo'],
    icon: BarChart2,
    group: 'Autres',
  },
];

/**
 * Fuzzy-ish search: checks title, subtitle, keywords for the query string.
 * Returns entries sorted by relevance (title match first, then keywords).
 */
export function searchPages(query: string): PageEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scored = PAGE_INDEX.map((entry) => {
    const titleLower = entry.title.toLowerCase();
    const subtitleLower = entry.subtitle.toLowerCase();
    const keywordMatch = entry.keywords.some((k) => k.includes(q));

    let score = 0;
    if (titleLower.startsWith(q)) score = 3;
    else if (titleLower.includes(q)) score = 2;
    else if (subtitleLower.includes(q)) score = 1;
    else if (keywordMatch) score = 1;

    return { entry, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}
