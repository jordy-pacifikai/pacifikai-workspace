'use client';

import { useState, useMemo } from 'react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarPlus,
  CalendarCog,
  CalendarX,
  CalendarCheck,
  UserPlus,
  Upload,
  Settings,
  Megaphone,
  Bell,
  Star,
  ChevronDown,
  ScrollText,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useAuditLog, type AuditEntry, type AuditFilters } from '@/hooks/useAuditLog';
import { cn } from '@/lib/utils';

// ─── Action config ──────────────────────────────────────────────────────────

interface ActionMeta {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const ACTION_MAP: Record<string, ActionMeta> = {
  'appointment.created':   { label: 'Nouveau RDV cree',         icon: CalendarPlus,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'appointment.updated':   { label: 'RDV modifie',              icon: CalendarCog,   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'appointment.cancelled': { label: 'RDV annule',               icon: CalendarX,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'appointment.completed': { label: 'RDV termine',              icon: CalendarCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'client.created':        { label: 'Client ajoute',            icon: UserPlus,      color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'client.imported':       { label: 'Clients importes (CSV)',   icon: Upload,        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'settings.updated':      { label: 'Parametres modifies',      icon: Settings,      color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  'campaign.sent':         { label: 'Campagne envoyee',         icon: Megaphone,     color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  'reminder.sent':         { label: 'Rappel envoye',            icon: Bell,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'review.submitted':      { label: 'Avis recu',               icon: Star,          color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

const FALLBACK_META: ActionMeta = {
  label: 'Action',
  icon: ScrollText,
  color: '#6b7280',
  bg: 'rgba(107,114,128,0.12)',
};

function getActionMeta(action: string): ActionMeta {
  return ACTION_MAP[action] ?? { ...FALLBACK_META, label: action };
}

// ─── Filter presets ─────────────────────────────────────────────────────────

const ACTION_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'appointment', label: 'Rendez-vous' },
  { value: 'client', label: 'Clients' },
  { value: 'settings', label: 'Parametres' },
  { value: 'campaign', label: 'Campagnes' },
  { value: 'reminder', label: 'Rappels' },
  { value: 'review', label: 'Avis' },
];

const DATE_PRESETS = [
  { value: 0, label: "Aujourd'hui" },
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: -1, label: 'Tout' },
];

// ─── Actor display ──────────────────────────────────────────────────────────

function displayActor(actor: string): string {
  if (actor === 'system') return 'Systeme';
  if (actor === 'chatbot') return 'Chatbot';
  if (actor === 'user') return 'Vous';
  return actor;
}

// ─── Timeline entry ─────────────────────────────────────────────────────────

function AuditItem({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getActionMeta(entry.action);
  const Icon = meta.icon;
  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  const entityLink = useMemo(() => {
    if (!entry.entity_id) return null;
    if (entry.entity_type === 'appointment') return `/appointments`;
    if (entry.entity_type === 'client') return `/clients/${entry.entity_id}`;
    return null;
  }, [entry.entity_type, entry.entity_id]);

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gray-800 group-last:hidden" />

      {/* Icon */}
      <div
        className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0"
        style={{ backgroundColor: meta.bg }}
      >
        <Icon size={18} style={{ color: meta.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-200">
              {meta.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="font-medium text-gray-400">{displayActor(entry.actor)}</span>
              {entityLink ? (
                <a href={entityLink} className="ml-1.5 text-blue-400 hover:underline">
                  Voir
                </a>
              ) : null}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p
              className="text-xs text-gray-500"
              title={format(new Date(entry.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
            >
              {formatDistanceToNow(new Date(entry.created_at), { locale: fr, addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Expandable details */}
        {hasDetails && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown
              size={14}
              className={cn('transition-transform', expanded && 'rotate-180')}
            />
            Details
          </button>
        )}
        {expanded && hasDetails && (
          <pre className="mt-2 p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400 overflow-x-auto max-h-48">
            {JSON.stringify(entry.details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="flex gap-4 pb-6 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-1/5" />
      </div>
      <div className="h-3 bg-gray-800 rounded w-16 shrink-0 mt-1" />
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <ScrollText size={24} className="text-gray-600" />
      </div>
      <h3 className="text-base font-medium text-gray-300">Aucune activite</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">
        Les actions importantes apparaitront ici au fur et a mesure de votre utilisation.
      </p>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { businessId, businessName } = useAppStore();
  const [actionFilter, setActionFilter] = useState('');
  const [datePreset, setDatePreset] = useState(-1);
  const [offset, setOffset] = useState(0);

  const filters: AuditFilters = useMemo(() => {
    const f: AuditFilters = {};
    if (actionFilter) f.action = actionFilter;
    if (datePreset >= 0) {
      f.dateFrom = subDays(new Date(), datePreset).toISOString().slice(0, 10);
    }
    return f;
  }, [actionFilter, datePreset]);

  const { data: entries, isLoading, isError } = useAuditLog(businessId, filters, offset);

  const hasMore = (entries?.length ?? 0) === 50;

  return (
    <DashboardLayout title="Journal d'activite" businessName={businessName}>
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
            <ScrollText size={20} className="text-gray-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Journal d&apos;activite</h1>
            <p className="text-sm text-gray-500">Historique de toutes les actions</p>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Action type */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setOffset(0); }}
              className="appearance-none pl-8 pr-8 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700"
            >
              {ACTION_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Date presets */}
          <div className="flex items-center gap-1.5">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => { setDatePreset(p.value); setOffset(0); }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                  datePreset === p.value
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────────────────────────── */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonItem key={i} />
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-red-400 text-center py-8">
              Erreur lors du chargement du journal.
            </p>
          ) : !entries || entries.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div>
                {entries.map((entry) => (
                  <AuditItem key={entry.id} entry={entry} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                {offset > 0 ? (
                  <button
                    onClick={() => setOffset(Math.max(0, offset - 50))}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Precedent
                  </button>
                ) : (
                  <span />
                )}
                {hasMore && (
                  <button
                    onClick={() => setOffset(offset + 50)}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Charger plus
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
