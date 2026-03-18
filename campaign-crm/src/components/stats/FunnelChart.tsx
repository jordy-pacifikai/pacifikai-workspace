'use client';

import { useStats } from '@/hooks/useStats';

interface FunnelStep {
  label: string;
  value: number;
  color: string;
  textColor: string;
}

export function FunnelChart() {
  const { data: stats } = useStats();

  const getCount = (status: string) =>
    stats?.byStatus?.find((s) => s.status === status)?.count ?? 0;

  const totalSent =
    getCount('sent') +
    getCount('opened') +
    getCount('replied') +
    getCount('devis_sent') +
    getCount('converted');

  const totalOpened = getCount('opened') + getCount('replied') + getCount('devis_sent') + getCount('converted');
  const totalReplied = getCount('replied') + getCount('devis_sent') + getCount('converted');
  const totalDevis = getCount('devis_sent') + getCount('converted');
  const totalConverted = getCount('converted');

  const max = Math.max(totalSent, 1);

  const steps: FunnelStep[] = [
    { label: 'Envoyés',    value: totalSent,      color: '#1e40af', textColor: '#93c5fd' },
    { label: 'Ouverts',    value: totalOpened,    color: '#0f766e', textColor: '#5eead4' },
    { label: 'Répondus',   value: totalReplied,   color: '#15803d', textColor: '#86efac' },
    { label: 'Devis',      value: totalDevis,     color: '#c2410c', textColor: '#fdba74' },
    { label: 'Convertis',  value: totalConverted, color: '#065f46', textColor: '#6ee7b7' },
  ];

  return (
    <div className="rounded-xl border border-[#222233] bg-[#141420] p-6">
      <h3 className="mb-6 text-sm font-semibold text-[#e0e0e0]">Funnel de conversion</h3>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const width = max > 0 ? (step.value / max) * 100 : 0;
          const prevValue = i === 0 ? max : steps[i - 1].value;
          const convRate = prevValue > 0 ? Math.round((step.value / prevValue) * 100) : 0;

          return (
            <div key={step.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color: step.textColor }}>
                  {step.label}
                </span>
                <div className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-[#888]">
                      {convRate}% du précédent
                    </span>
                  )}
                  <span className="font-semibold" style={{ color: step.textColor }}>
                    {step.value}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-8 overflow-hidden rounded-md bg-[#0a0a12]">
                <div
                  className="absolute left-0 top-0 h-full rounded-md transition-all duration-700"
                  style={{
                    width: `${width}%`,
                    backgroundColor: step.color,
                    minWidth: step.value > 0 ? '2px' : '0',
                  }}
                />
                {/* Gradient overlay */}
                <div
                  className="absolute left-0 top-0 h-full rounded-md"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${step.color} 0%, ${step.textColor}40 100%)`,
                    minWidth: step.value > 0 ? '2px' : '0',
                  }}
                />
                {step.value > 0 && (
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{ color: step.textColor }}
                  >
                    {step.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {totalSent > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-[#222233] bg-[#0a0a12] px-4 py-3">
          <span className="text-xs text-[#888]">Taux de conversion global</span>
          <span className="text-lg font-bold text-emerald-400">
            {Math.round((totalConverted / totalSent) * 1000) / 10}%
          </span>
        </div>
      )}
    </div>
  );
}
