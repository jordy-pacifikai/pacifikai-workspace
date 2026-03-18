'use client';

import { Users, Send, Eye, Reply, FileText, TrendingUp } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { useProspects } from '@/hooks/useProspects';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
}

function KPICard({ label, value, icon, accent, sub }: KPICardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#222233] bg-[#141420] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#888]">{label}</span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', accent)}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-[#e0e0e0]">{value}</p>
      {sub && <p className="text-xs text-[#888]">{sub}</p>}
    </div>
  );
}

export function KPICards() {
  const { data: stats } = useStats();
  const { data: prospects = [] } = useProspects();

  const total = stats?.total ?? prospects.length;
  const converted = stats?.byStatus?.find((s) => s.status === 'converted')?.count ?? 0;
  const devisSent = stats?.byStatus?.find((s) => s.status === 'devis_sent')?.count ?? 0;
  const sent = (stats?.byStatus?.find((s) => s.status === 'sent')?.count ?? 0) +
               (stats?.byStatus?.find((s) => s.status === 'opened')?.count ?? 0) +
               (stats?.byStatus?.find((s) => s.status === 'replied')?.count ?? 0) +
               devisSent + converted;

  const openRate = stats?.openRate ?? 0;
  const replyRate = stats?.replyRate ?? 0;

  const kpis: KPICardProps[] = [
    {
      label: 'Total Prospects',
      value: total,
      icon: <Users size={14} className="text-[#e0e0e0]" />,
      accent: 'bg-[#222233]',
    },
    {
      label: 'Emails Envoyés',
      value: sent,
      icon: <Send size={14} className="text-blue-400" />,
      accent: 'bg-blue-900/30',
      sub: `${Math.round((sent / Math.max(total, 1)) * 100)}% du total`,
    },
    {
      label: 'Taux Ouverture',
      value: `${openRate}%`,
      icon: <Eye size={14} className="text-teal-400" />,
      accent: 'bg-teal-900/30',
      sub: openRate >= 30 ? 'Bonne performance' : 'Peut être amélioré',
    },
    {
      label: 'Taux Réponse',
      value: `${replyRate}%`,
      icon: <Reply size={14} className="text-green-400" />,
      accent: 'bg-green-900/30',
      sub: replyRate >= 5 ? 'Au-dessus de la moyenne' : 'Sous la moyenne',
    },
    {
      label: 'Devis Envoyés',
      value: devisSent,
      icon: <FileText size={14} className="text-orange-400" />,
      accent: 'bg-orange-900/30',
      sub: sent > 0 ? `${Math.round((devisSent / sent) * 100)}% des emailés` : undefined,
    },
    {
      label: 'Convertis',
      value: converted,
      icon: <TrendingUp size={14} className="text-emerald-400" />,
      accent: 'bg-emerald-900/30',
      sub: `${stats?.conversionRate ?? 0}% de conversion`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
