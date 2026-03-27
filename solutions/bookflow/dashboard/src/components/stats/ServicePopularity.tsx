'use client';

import { useMemo } from 'react';
import type { Appointment } from '@/types/database';

type ServicePopularityProps = {
  appointments: Appointment[];
};

export function ServicePopularity({ appointments }: ServicePopularityProps) {
  const services = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const svc = a.service ?? 'Service inconnu';
      counts[svc] = (counts[svc] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [appointments]);

  const max = useMemo(
    () => Math.max(...services.map((s) => s.count), 1),
    [services],
  );

  if (services.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Services les plus reserves</h3>
        <p className="text-sm text-gray-500 italic">Aucune donnee</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h3 className="text-white font-semibold text-sm mb-5">Services les plus reserves</h3>
      <div className="space-y-3">
        {services.map((svc) => {
          const pct = Math.round((svc.count / max) * 100);
          return (
            <div key={svc.name} className="relative flex items-center gap-3">
              {/* Label */}
              <span className="text-sm text-gray-300 w-32 shrink-0 truncate">
                {svc.name}
              </span>

              {/* Bar container */}
              <div className="flex-1 relative h-7">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    minWidth: pct > 0 ? '24px' : '0',
                    background: 'rgba(37,211,102,0.6)',
                    borderRadius: '6px',
                    height: '28px',
                  }}
                />
                {/* Count at end of bar */}
                <span
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-500 tabular-nums pr-1"
                >
                  {svc.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
