// Configuration des 10 workflows ATN
export const WORKFLOWS = [
  {
    id: 1,
    name: 'Concierge IA Multilingue',
    webhook: 'atn-concierge',
    category: 'service',
    description: 'Chatbot multilingue pour répondre aux questions clients',
    color: '#3B82F6',
  },
  {
    id: 2,
    name: 'Newsletter Personnalisée',
    webhook: 'atn-newsletter-demo',
    category: 'marketing',
    description: 'Génération d\'emails personnalisés par segment',
    color: '#EC4899',
  },
  {
    id: 3,
    name: 'Content Factory SEO+GEO',
    webhook: 'atn-seo-content',
    category: 'marketing',
    description: 'Création d\'articles SEO avec images générées',
    color: '#8B5CF6',
  },
  {
    id: 4,
    name: 'ROI Analyst',
    webhook: 'atn-roi-analyst',
    category: 'revenue',
    description: 'Analyse des performances et alertes ROI',
    color: '#10B981',
  },
  {
    id: 5,
    name: 'Booking Assistant',
    webhook: 'atn-booking-assistant',
    workflowId: 'dDPAbhFPeIRc9gU4',
    category: 'service',
    description: 'Assistant pour les demandes de réservation',
    color: '#06B6D4',
  },
  {
    id: 6,
    name: 'Social Monitor',
    webhook: 'atn-social-monitor',
    workflowId: 'XVxINg7uQRCvDCDi',
    category: 'marketing',
    description: 'Surveillance des mentions sur les réseaux sociaux',
    color: '#F59E0B',
  },
  {
    id: 7,
    name: 'Competitor Intelligence',
    webhook: 'atn-competitor-intel',
    workflowId: 'Vj3pAXnbDt2tMnP1',
    category: 'revenue',
    description: 'Veille concurrentielle prix et promos',
    color: '#EF4444',
  },
  {
    id: 8,
    name: 'Flight Notifier',
    webhook: 'atn-flight-notifier',
    workflowId: 'qwatQWUdzJMYFR9L',
    category: 'operations',
    description: 'Alertes retards et annulations de vols',
    color: '#6366F1',
  },
  {
    id: 9,
    name: 'Review Responder',
    webhook: 'atn-review-responder',
    workflowId: 'VEdk4X5rseMYfWxW',
    category: 'service',
    description: 'Réponses automatiques aux avis clients',
    color: '#14B8A6',
  },
  {
    id: 10,
    name: 'Upsell Engine',
    webhook: 'atn-upsell-engine',
    workflowId: 'fzywRGoEAg2xDCkE',
    category: 'revenue',
    description: 'Offres personnalisées d\'upsell',
    color: '#F97316',
  },
]

export const CATEGORIES = {
  service: { name: 'Service Client', color: '#3B82F6', builds: [1, 5, 9] },
  marketing: { name: 'Marketing', color: '#EC4899', builds: [2, 3, 6] },
  operations: { name: 'Opérations', color: '#6366F1', builds: [8] },
  revenue: { name: 'Revenue', color: '#10B981', builds: [4, 7, 10] },
}

export const N8N_WEBHOOK_BASE = 'https://n8n.srv1140766.hstgr.cloud/webhook'

export function getWebhookUrl(webhook: string): string {
  return `${N8N_WEBHOOK_BASE}/${webhook}`
}

export function getWorkflowById(id: number) {
  return WORKFLOWS.find(w => w.id === id)
}

export function getWorkflowsByCategory(category: string) {
  return WORKFLOWS.filter(w => w.category === category)
}
