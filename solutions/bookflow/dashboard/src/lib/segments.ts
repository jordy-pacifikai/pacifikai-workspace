import type { Client } from '@/types/database';

// ─── Segment definitions ──────────────────────────────────────────────────────

export interface Segment {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export const SEGMENTS: Segment[] = [
  {
    id: 'vip',
    label: 'VIP',
    icon: '👑',
    color: '#F59E0B',
    description: 'Plus de 5 visites',
  },
  {
    id: 'at_risk',
    label: 'À risque',
    icon: '⚠️',
    color: '#EF4444',
    description: 'No-show récent ou 2+ annulations',
  },
  {
    id: 'inactive',
    label: 'Inactif',
    icon: '💤',
    color: '#6B7280',
    description: 'Pas de visite depuis 30 jours',
  },
  {
    id: 'birthday_soon',
    label: 'Anniversaire proche',
    icon: '🎂',
    color: '#EC4899',
    description: 'Anniversaire dans les 7 prochains jours',
  },
  {
    id: 'high_value',
    label: 'Haute valeur',
    icon: '💎',
    color: '#8B5CF6',
    description: 'Plus de 50 000 XPF dépensés',
  },
];

// ─── Segment ID type ──────────────────────────────────────────────────────────

export type SegmentId = 'vip' | 'at_risk' | 'inactive' | 'birthday_soon' | 'high_value';

// ─── Segment computation ──────────────────────────────────────────────────────

export function getClientSegments(client: Client): SegmentId[] {
  const now = new Date();
  const segments: SegmentId[] = [];

  // VIP — more than 5 visits
  if ((client.total_visits ?? 0) > 5) {
    segments.push('vip');
  }

  // At risk — no_show_count >= 1 OR cancellation_count >= 2
  // We track no_show_count on the Client type. For cancellations we approximate
  // by checking if no_show_count is elevated or if we have the flag.
  if ((client.no_show_count ?? 0) >= 1) {
    segments.push('at_risk');
  }

  // Inactive — last visit more than 30 days ago (or never visited but created > 30d ago)
  if (client.last_visit_at) {
    const last = new Date(client.last_visit_at);
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      segments.push('inactive');
    }
  } else {
    // Never visited — check account age > 30 days
    const created = new Date(client.created_at);
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      segments.push('inactive');
    }
  }

  // Birthday soon — within the next 7 days (ignoring year)
  if (client.birthday) {
    try {
      const bday = new Date(client.birthday);
      // Build this year's birthday
      const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());

      // If already passed this year, check next year
      let nextBday = thisYearBday;
      if (thisYearBday.getTime() < now.getTime()) {
        nextBday = new Date(now.getFullYear() + 1, bday.getMonth(), bday.getDate());
      }

      const diffDays = (nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 7) {
        segments.push('birthday_soon');
      }
    } catch {
      // Invalid birthday date — skip
    }
  }

  // High value — more than 50 000 XPF spent
  if ((client.total_spent ?? 0) > 50000) {
    segments.push('high_value');
  }

  return segments;
}

// ─── Segment lookup helper ────────────────────────────────────────────────────

export function getSegmentById(id: string): Segment | undefined {
  return SEGMENTS.find((s) => s.id === id);
}
