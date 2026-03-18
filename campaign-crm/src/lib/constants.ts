import type { CampaignStatus, CampaignSector } from '@/lib/types';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  textColor: string;
}

export const STATUS_CONFIG: Record<CampaignStatus, StatusConfig> = {
  new: {
    label: 'Nouveau',
    color: 'gray',
    bgColor: 'bg-gray-800/50',
    borderColor: 'border-gray-700',
    dotColor: 'bg-gray-400',
    textColor: 'text-gray-300',
  },
  enriched: {
    label: 'Enrichi',
    color: 'blue',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-800',
    dotColor: 'bg-blue-400',
    textColor: 'text-blue-300',
  },
  sites_ready: {
    label: 'Sites prêts',
    color: 'purple',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-800',
    dotColor: 'bg-purple-400',
    textColor: 'text-purple-300',
  },
  sent: {
    label: 'Envoyé',
    color: 'amber',
    bgColor: 'bg-amber-900/30',
    borderColor: 'border-amber-800',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-300',
  },
  opened: {
    label: 'Ouvert',
    color: 'teal',
    bgColor: 'bg-teal-900/30',
    borderColor: 'border-teal-800',
    dotColor: 'bg-teal-400',
    textColor: 'text-teal-300',
  },
  replied: {
    label: 'Répondu',
    color: 'green',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-800',
    dotColor: 'bg-green-400',
    textColor: 'text-green-300',
  },
  devis_sent: {
    label: 'Devis envoyé',
    color: 'orange',
    bgColor: 'bg-orange-900/30',
    borderColor: 'border-orange-800',
    dotColor: 'bg-orange-400',
    textColor: 'text-orange-300',
  },
  converted: {
    label: 'Converti',
    color: 'emerald',
    bgColor: 'bg-emerald-900/30',
    borderColor: 'border-emerald-800',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-300',
  },
  lost: {
    label: 'Perdu',
    color: 'red',
    bgColor: 'bg-red-900/30',
    borderColor: 'border-red-800',
    dotColor: 'bg-red-400',
    textColor: 'text-red-300',
  },
};

export const STATUS_COLUMN_ORDER: CampaignStatus[] = [
  'new',
  'enriched',
  'sites_ready',
  'sent',
  'opened',
  'replied',
  'devis_sent',
  'converted',
  'lost',
];

export interface SectorConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const SECTOR_CONFIG: Record<CampaignSector, SectorConfig> = {
  beauty: {
    label: 'Beauté',
    icon: 'Sparkles',
    color: 'text-pink-400',
    bgColor: 'bg-pink-900/30',
  },
  food: {
    label: 'Restauration',
    icon: 'UtensilsCrossed',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
  },
  auto: {
    label: 'Automobile',
    icon: 'Car',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
  },
  health: {
    label: 'Santé',
    icon: 'HeartPulse',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
  },
  sport: {
    label: 'Sport',
    icon: 'Trophy',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
  },
  legal: {
    label: 'Juridique',
    icon: 'Scale',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
  education: {
    label: 'Éducation',
    icon: 'GraduationCap',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/30',
  },
  tourism: {
    label: 'Tourisme',
    icon: 'Palmtree',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
  },
  location: {
    label: 'Location',
    icon: 'MapPin',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
  },
  other: {
    label: 'Autre',
    icon: 'MoreHorizontal',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800/50',
  },
};
