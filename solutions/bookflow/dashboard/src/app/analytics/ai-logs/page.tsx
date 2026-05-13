'use client';

import { useState } from 'react';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useAiLogs, useAiLogStats, type AiLogFilters, type AiLogEntry } from '@/hooks/useAiLogs';
import { cn } from '@/lib/utils';

const CONFIDENCE_CONFIG: Record<
  AiLogEntry['confidence'],
  { label: string; color: string; bg: string; icon: typeof CheckCircle }
> = {
  grounded: { label: 'Grounded', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle },
  no_kb_match: { label: 'No KB Match', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
  fallback: { label: 'Fallback', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
  transfer: { label: 'Transfer', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: ArrowRight },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: typeof CheckCircle;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', color)} />
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function LogRow({ log }: { log: AiLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const conf = CONFIDENCE_CONFIG[log.confidence];
  const ConfIcon = conf.icon;

  return (
    <div
      className="border-b border-white/5 px-4 py-3 hover:bg-white/[0.02] cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', conf.bg, conf.color)}>
          <ConfIcon className="w-3 h-3" />
          {conf.label}
        </span>
        <span className="text-sm text-zinc-300 truncate flex-1">{log.user_message}</span>
        <span className="text-xs text-zinc-500 shrink-0">
          {log.channel ?? 'whatsapp'}
        </span>
        {log.latency_ms && (
          <span className="text-xs text-zinc-500 shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {(log.latency_ms / 1000).toFixed(1)}s
          </span>
        )}
        <span className="text-xs text-zinc-600 shrink-0">
          {new Date(log.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          <div>
            <span className="text-zinc-500">Client :</span>
            <span className="text-zinc-300 ml-2">{log.user_message}</span>
          </div>
          <div>
            <span className="text-zinc-500">Bot :</span>
            <span className="text-zinc-300 ml-2">{log.assistant_reply}</span>
          </div>
          {log.tools_used.length > 0 && (
            <div>
              <span className="text-zinc-500">Tools :</span>
              <span className="text-zinc-400 ml-2">{log.tools_used.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AiLogsPage() {
  const businessId = useAppStore((s) => s.businessId);
  const [filters, setFilters] = useState<AiLogFilters>({});
  const [offset, setOffset] = useState(0);

  const { data: stats, isLoading: statsLoading } = useAiLogStats(businessId, 7);
  const { data: logs, isLoading: logsLoading } = useAiLogs(businessId, filters, offset);

  const noKbPct = stats && stats.total > 0
    ? Math.round(((stats.no_kb_match + stats.fallback) / stats.total) * 100)
    : 0;

  return (
    <DashboardLayout title="AI Logs">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Logs</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Suivi qualit&eacute; des r&eacute;ponses IA &mdash; 7 derniers jours
          </p>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total" value={stats.total} icon={Brain} color="text-white" />
            <StatCard
              label="Grounded"
              value={stats.grounded}
              icon={CheckCircle}
              color="text-emerald-400"
              sub={stats.total > 0 ? `${Math.round((stats.grounded / stats.total) * 100)}%` : undefined}
            />
            <StatCard
              label="No KB Match"
              value={stats.no_kb_match}
              icon={AlertTriangle}
              color="text-amber-400"
              sub={noKbPct > 20 ? 'Alerte > 20%' : undefined}
            />
            <StatCard label="Transfer" value={stats.transfer} icon={ArrowRight} color="text-blue-400" />
            <StatCard
              label="Latence moy."
              value={`${(stats.avgLatencyMs / 1000).toFixed(1)}s`}
              icon={Clock}
              color="text-zinc-400"
            />
          </div>
        ) : null}

        {/* Alert banner */}
        {noKbPct > 20 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-200">
              <strong>{noKbPct}%</strong> des r&eacute;ponses n&rsquo;ont pas trouv&eacute; de correspondance KB.
              Enrichissez votre base de connaissances pour r&eacute;duire ce taux.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500" />
          {(['', 'grounded', 'no_kb_match', 'fallback', 'transfer'] as const).map((c) => (
            <button
              key={c || 'all'}
              onClick={() => {
                setFilters((f) => ({ ...f, confidence: c || undefined }));
                setOffset(0);
              }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                (filters.confidence ?? '') === c
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10',
              )}
            >
              {c ? CONFIDENCE_CONFIG[c].label : 'Tous'}
            </button>
          ))}
        </div>

        {/* Logs table */}
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          {logsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <>
              {logs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <button
                  onClick={() => setOffset(Math.max(0, offset - 50))}
                  disabled={offset === 0}
                  className="text-xs text-zinc-400 hover:text-white disabled:opacity-30"
                >
                  Pr&eacute;c&eacute;dent
                </button>
                <span className="text-xs text-zinc-500">
                  {offset + 1} - {offset + logs.length}
                </span>
                <button
                  onClick={() => setOffset(offset + 50)}
                  disabled={logs.length < 50}
                  className="text-xs text-zinc-400 hover:text-white disabled:opacity-30"
                >
                  Suivant
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucun log AI pour cette p&eacute;riode</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
