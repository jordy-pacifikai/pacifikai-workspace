'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ShieldAlert,
  KeyRound,
  ShieldX,
  Timer,
  Lock,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useAuthEvents, type AuthEvent } from '@/hooks/useAuthEvents';
import { cn } from '@/lib/utils';

// ── Event type config ──────────────────────────────────────────────────────

interface EventMeta {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const EVENT_MAP: Record<string, EventMeta> = {
  failed_login:        { label: 'Echec de connexion',    icon: Lock,        color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  invalid_token:       { label: 'Token invalide',        icon: KeyRound,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  csrf_failure:        { label: 'Echec CSRF',            icon: ShieldX,     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  rate_limited:        { label: 'Rate limit atteint',    icon: Timer,       color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  unauthorized_access: { label: 'Acces non autorise',    icon: ShieldAlert, color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
};

const FALLBACK_META: EventMeta = {
  label: 'Evenement',
  icon: ShieldAlert,
  color: '#6b7280',
  bg: 'rgba(107,114,128,0.12)',
};

function getEventMeta(eventType: string): EventMeta {
  return EVENT_MAP[eventType] ?? { ...FALLBACK_META, label: eventType };
}

// ── Filters ─────────────────────────────────────────────────────────────────

const EVENT_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'failed_login', label: 'Echec connexion' },
  { value: 'invalid_token', label: 'Token invalide' },
  { value: 'csrf_failure', label: 'Echec CSRF' },
  { value: 'rate_limited', label: 'Rate limit' },
  { value: 'unauthorized_access', label: 'Acces non autorise' },
];

// ── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-800/50 animate-pulse">
          <td className="py-3 px-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-gray-800" /><div className="h-3.5 bg-gray-800 rounded w-28" /></div></td>
          <td className="py-3 px-4"><div className="h-3 bg-gray-800 rounded w-24" /></td>
          <td className="py-3 px-4"><div className="h-3 bg-gray-800 rounded w-40" /></td>
          <td className="py-3 px-4"><div className="h-3 bg-gray-800 rounded w-20" /></td>
          <td className="py-3 px-4"><div className="h-3 bg-gray-800 rounded w-12" /></td>
        </tr>
      ))}
    </>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <ShieldAlert size={24} className="text-gray-600" />
          </div>
          <h3 className="text-base font-medium text-gray-300">Aucun evenement</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Les evenements de securite apparaitront ici (echecs de connexion, rate limits, etc.).
          </p>
        </div>
      </td>
    </tr>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AuthAuditPage() {
  const { businessName } = useAppStore();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [offset, setOffset] = useState(0);

  const { data: events, isLoading, isError } = useAuthEvents(
    eventTypeFilter || undefined,
    offset,
  );

  const hasMore = (events?.length ?? 0) === 100;

  // Track which rows are expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <DashboardLayout title="Audit securite" businessName={businessName}>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <ShieldAlert size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Audit de securite</h1>
            <p className="text-sm text-gray-500">Evenements d&apos;authentification et tentatives suspectes</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              value={eventTypeFilter}
              onChange={(e) => { setEventTypeFilter(e.target.value); setOffset(0); }}
              className="appearance-none pl-8 pr-8 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-700"
            >
              {EVENT_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonRows />
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="text-sm text-red-400 text-center py-8">
                      Erreur lors du chargement des evenements.
                    </td>
                  </tr>
                ) : !events || events.length === 0 ? (
                  <EmptyState />
                ) : (
                  events.map((event) => (
                    <AuthEventRowWithDetails
                      key={event.id}
                      event={event}
                      expanded={expandedIds.has(event.id)}
                      onToggle={() => toggleExpanded(event.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {events && events.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              {offset > 0 ? (
                <button
                  onClick={() => setOffset(Math.max(0, offset - 100))}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Precedent
                </button>
              ) : (
                <span />
              )}
              {hasMore && (
                <button
                  onClick={() => setOffset(offset + 100)}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Charger plus
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Combined row + expandable details ───────────────────────────────────────

function AuthEventRowWithDetails({
  event,
  expanded,
  onToggle,
}: {
  event: AuthEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = getEventMeta(event.event_type);
  const Icon = meta.icon;
  const hasDetails = event.details && Object.keys(event.details).length > 0;

  return (
    <>
      <tr className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
              style={{ backgroundColor: meta.bg }}
            >
              <Icon size={15} style={{ color: meta.color }} />
            </div>
            <span className="text-sm font-medium text-gray-200">{meta.label}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="text-xs text-gray-400 font-mono">{event.ip_address ?? '-'}</span>
        </td>
        <td className="py-3 px-4 max-w-[200px]">
          <span className="text-xs text-gray-500 truncate block" title={event.user_agent ?? undefined}>
            {event.user_agent ? event.user_agent.slice(0, 60) + (event.user_agent.length > 60 ? '...' : '') : '-'}
          </span>
        </td>
        <td className="py-3 px-4">
          <span
            className="text-xs text-gray-500"
            title={format(new Date(event.created_at), 'dd MMM yyyy HH:mm:ss', { locale: fr })}
          >
            {formatDistanceToNow(new Date(event.created_at), { locale: fr, addSuffix: true })}
          </span>
        </td>
        <td className="py-3 px-4">
          {hasDetails ? (
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ChevronDown
                size={14}
                className={cn('transition-transform', expanded && 'rotate-180')}
              />
              Details
            </button>
          ) : (
            <span className="text-xs text-gray-600">-</span>
          )}
        </td>
      </tr>
      {expanded && hasDetails && (
        <tr className="bg-gray-900/20">
          <td colSpan={5} className="px-4 py-2">
            <pre className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-400 overflow-x-auto max-h-32">
              {JSON.stringify(event.details, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
