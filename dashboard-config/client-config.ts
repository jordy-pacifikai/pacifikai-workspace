/**
 * PACIFIK'AI - Dashboard Multi-Tenant Configuration
 *
 * Ce fichier definit la configuration pour chaque client
 * Le dashboard charge la config selon le slug dans l'URL ou l'env
 */

export interface ClientConfig {
  slug: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  tier: 'starter' | 'business' | 'enterprise';
  features: string[];
  supabaseSchema: string;
  airtableBaseId?: string;
  customDomain?: string;
  agents: AgentConfig[];
  branding: BrandingConfig;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string;
  href: string;
  enabled: boolean;
  webhookPath?: string;
}

export interface BrandingConfig {
  headerBg: string;
  cardBg: string;
  accentGradient: string;
  fontFamily: string;
}

// Configuration par defaut
export const defaultConfig: Partial<ClientConfig> = {
  primaryColor: '#2CCCD4',
  secondaryColor: '#C9A84C',
  tier: 'starter',
  branding: {
    headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBg: '#1e293b',
    accentGradient: 'linear-gradient(135deg, #2CCCD4, #1aa3aa)',
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
};

// Agents disponibles par tier
export const agentsByTier = {
  starter: [
    { id: 'chatbot', name: 'Chatbot Client', icon: 'MessageSquare', color: 'blue' },
    { id: 'faq', name: 'FAQ Manager', icon: 'HelpCircle', color: 'green' },
    { id: 'leads', name: 'Lead Capture', icon: 'Users', color: 'purple' },
    { id: 'reports', name: 'Basic Reports', icon: 'BarChart3', color: 'indigo' },
    { id: 'analytics', name: 'Analytics', icon: 'TrendingUp', color: 'amber' },
  ],
  business: [
    { id: 'newsletter', name: 'Newsletter Engine', icon: 'Mail', color: 'purple' },
    { id: 'content', name: 'Content Generator', icon: 'FileText', color: 'green' },
    { id: 'social', name: 'Social Media', icon: 'Share2', color: 'pink' },
    { id: 'reviews', name: 'Review Manager', icon: 'Star', color: 'yellow' },
    { id: 'competitor', name: 'Veille Concurrence', icon: 'Brain', color: 'amber' },
    { id: 'leadScoring', name: 'Lead Scoring', icon: 'Target', color: 'red' },
    { id: 'calendar', name: 'Content Calendar', icon: 'Calendar', color: 'teal' },
    { id: 'journeys', name: 'Customer Journeys', icon: 'MapPin', color: 'orange' },
    { id: 'abTests', name: 'A/B Testing', icon: 'GitBranch', color: 'cyan' },
    { id: 'upsell', name: 'Upsell Engine', icon: 'TrendingUp', color: 'emerald' },
  ],
  enterprise: [
    { id: 'staffAssistant', name: 'Staff Assistant', icon: 'Briefcase', color: 'slate' },
    { id: 'concierge', name: 'Concierge Pro', icon: 'Sparkles', color: 'gold' },
    { id: 'visualFactory', name: 'Visual Factory', icon: 'Image', color: 'rose' },
    { id: 'pricingMonitor', name: 'Pricing Monitor', icon: 'DollarSign', color: 'lime' },
    { id: 'reviewIntel', name: 'Review Intelligence', icon: 'Lightbulb', color: 'violet' },
    { id: 'attribution', name: 'Attribution Model', icon: 'Network', color: 'fuchsia' },
    { id: 'preferences', name: 'AI Preferences', icon: 'Settings', color: 'stone' },
    { id: 'roi', name: 'ROI Calculator', icon: 'Calculator', color: 'sky' },
    { id: 'planner', name: 'Trip Planner', icon: 'Compass', color: 'teal' },
    { id: 'flights', name: 'Flight Manager', icon: 'Plane', color: 'blue' },
  ],
};

// Configurations clients
export const clientConfigs: Record<string, ClientConfig> = {
  'air-tahiti-nui': {
    slug: 'air-tahiti-nui',
    name: 'Air Tahiti Nui',
    logo: '/logos/atn.png',
    primaryColor: '#2CCCD4',
    secondaryColor: '#C9A84C',
    tier: 'enterprise',
    features: ['all'],
    supabaseSchema: 'atn',
    airtableBaseId: 'appWd0x5YZPHKL0VK',
    agents: [
      { id: 'chatbot', name: 'Chatbot Tiare', description: 'Repond aux clients 24/7', icon: 'MessageSquare', color: 'blue', href: '/conversations', enabled: true, webhookPath: 'atn-chatbot' },
      { id: 'newsletter', name: 'Newsletter Engine', description: 'Campagnes email automatisees', icon: 'Mail', color: 'purple', href: '/newsletters', enabled: true },
      { id: 'competitor', name: 'Veille Concurrence', description: 'Surveillance Air France, Qantas...', icon: 'Brain', color: 'amber', href: '/competitors', enabled: true },
      { id: 'reviews', name: 'Review Manager', description: 'Reponses TripAdvisor, Google', icon: 'Star', color: 'yellow', href: '/reviews', enabled: true },
      { id: 'content', name: 'Content Generator', description: 'Articles SEO destinations', icon: 'FileText', color: 'green', href: '/content', enabled: true },
      { id: 'reports', name: 'Auto Reports', description: 'Rapports hebdomadaires', icon: 'BarChart3', color: 'indigo', href: '/reports', enabled: true },
      { id: 'social', name: 'Social Media', description: 'Posts Instagram, Facebook', icon: 'Share2', color: 'pink', href: '/social', enabled: true },
      { id: 'leadScoring', name: 'Lead Scoring', description: 'Qualification automatique', icon: 'Target', color: 'red', href: '/lead-scoring', enabled: true },
      { id: 'journeys', name: 'Customer Journeys', description: 'Parcours personnalises', icon: 'MapPin', color: 'orange', href: '/journeys', enabled: true },
      { id: 'abTests', name: 'A/B Testing', description: 'Tests campagnes', icon: 'GitBranch', color: 'cyan', href: '/ab-tests', enabled: true },
      { id: 'upsell', name: 'Upsell Engine', description: 'Recommandations Poerava', icon: 'TrendingUp', color: 'emerald', href: '/upsell', enabled: true },
      { id: 'calendar', name: 'Content Calendar', description: 'Planning editorial', icon: 'Calendar', color: 'teal', href: '/calendar', enabled: true },
      { id: 'staffAssistant', name: 'Staff Assistant TALIA', description: 'Assistant employes', icon: 'Briefcase', color: 'slate', href: '/staff-assistant', enabled: true },
      { id: 'concierge', name: 'Concierge Pro', description: 'Service VIP client', icon: 'Sparkles', color: 'gold', href: '/concierge-pro', enabled: true },
      { id: 'visualFactory', name: 'Visual Factory', description: 'Generation assets', icon: 'Image', color: 'rose', href: '/visual-factory', enabled: true },
      { id: 'pricingMonitor', name: 'Pricing Monitor', description: 'Veille tarifaire', icon: 'DollarSign', color: 'lime', href: '/pricing-monitor', enabled: true },
      { id: 'reviewIntel', name: 'Review Intelligence', description: 'Analyse sentiments', icon: 'Lightbulb', color: 'violet', href: '/review-intelligence', enabled: true },
      { id: 'attribution', name: 'Attribution Model', description: 'Multi-touch', icon: 'Network', color: 'fuchsia', href: '/attribution', enabled: true },
      { id: 'preferences', name: 'AI Preferences', description: 'Profils voyageurs', icon: 'Settings', color: 'stone', href: '/preferences', enabled: true },
      { id: 'roi', name: 'ROI Calculator', description: 'Suivi ROI', icon: 'Calculator', color: 'sky', href: '/roi', enabled: true },
    ],
    branding: {
      headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      cardBg: '#1e293b',
      accentGradient: 'linear-gradient(135deg, #2CCCD4, #1aa3aa)',
      fontFamily: 'Inter, -apple-system, sans-serif',
    },
  },

  // Template pour nouveau client
  'template': {
    slug: 'template',
    name: '{{CLIENT_NAME}}',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    tier: 'starter',
    features: [],
    supabaseSchema: '{{CLIENT_SLUG}}',
    agents: [],
    branding: {
      headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      cardBg: '#1e293b',
      accentGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      fontFamily: 'Inter, -apple-system, sans-serif',
    },
  },
};

/**
 * Recupere la config d'un client par son slug
 */
export function getClientConfig(slug: string): ClientConfig | null {
  return clientConfigs[slug] || null;
}

/**
 * Genere une config client a partir des donnees prospect
 */
export function generateClientConfig(prospectData: any): ClientConfig {
  const company = prospectData.company || {};
  const pricing = prospectData.pricing || {};
  const tier = pricing.recommended || 'starter';

  const slug = company.name
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'client';

  // Determiner les agents selon le tier
  const allAgents = [
    ...agentsByTier.starter,
    ...(tier !== 'starter' ? agentsByTier.business : []),
    ...(tier === 'enterprise' ? agentsByTier.enterprise : []),
  ];

  const agents: AgentConfig[] = allAgents.map((a) => ({
    ...a,
    description: '',
    href: `/${a.id}`,
    enabled: true,
    webhookPath: `${slug}-${a.id}`,
  }));

  return {
    slug,
    name: company.name || 'Client',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    tier,
    features: [],
    supabaseSchema: slug.replace(/-/g, '_'),
    agents,
    branding: defaultConfig.branding!,
  };
}

export default clientConfigs;
