'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Appointment } from '@/types/database';

type Props = {
  appointments: Appointment[];
};

// Build an array of the last N days as yyyy-MM-dd strings
function buildLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// Short label for the last 7 days: J-6 ... J-0
function dayLabel(index: number, total: number): string {
  const offset = total - 1 - index;
  if (offset > 6) return '';
  return `J-${offset}`;
}

export function RevenueChart({ appointments }: Props) {
  const DAYS = 30;

  const { days, revenueByDay, maxRevenue, totalRevenue } = useMemo(() => {
    const days = buildLastNDays(DAYS);

    // Sum price per day
    const revenueByDay: Record<string, number> = {};
    days.forEach((d) => { revenueByDay[d] = 0; });

    appointments.forEach((appt) => {
      const date = appt.appointment_date;
      const price = appt.price;
      if (date && revenueByDay[date] !== undefined && price != null) {
        revenueByDay[date] += price;
      }
    });

    const values = days.map((d) => revenueByDay[d]);
    const maxRevenue = Math.max(...values, 1);
    const totalRevenue = values.reduce((s, v) => s + v, 0);

    return { days, revenueByDay, maxRevenue, totalRevenue };
  }, [appointments]);

  if (totalRevenue === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#25D366] shrink-0" />
          <h2 className="text-white font-semibold text-sm">Revenus des 30 derniers jours</h2>
        </div>
        <p className="text-sm text-gray-500 italic">Aucun revenu ce mois.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#25D366] shrink-0" />
          <h2 className="text-white font-semibold text-sm">Revenus des 30 derniers jours</h2>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: '#25D366' }}>
          {totalRevenue.toLocaleString('fr-FR')} XPF
        </span>
      </div>

      {/* Bar chart */}
      <div
        className="flex items-end gap-0.5"
        style={{ height: '100px' }}
        aria-label="Graphique revenus 30 jours"
      >
        {days.map((day, i) => {
          const revenue = revenueByDay[day];
          const heightPct = revenue > 0 ? Math.max(4, Math.round((revenue / maxRevenue) * 100)) : 2;
          const tooltipLabel = `${day}: ${revenue.toLocaleString('fr-FR')} XPF`;
          const isPositive = revenue > 0;

          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center justify-end h-full gap-0"
            >
              <div
                title={tooltipLabel}
                className="w-full rounded-sm transition-all duration-300"
                style={{
                  height: `${heightPct}%`,
                  background: isPositive
                    ? 'rgba(37, 211, 102, 0.7)'
                    : 'rgba(55, 65, 81, 0.5)',
                  minHeight: '2px',
                  cursor: 'default',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Day labels for last 7 */}
      <div className="flex gap-0.5 mt-1">
        {days.map((day, i) => {
          const label = dayLabel(i, days.length);
          return (
            <div key={day} className="flex-1 flex justify-center">
              {label && (
                <span className="text-[9px] text-gray-600 tabular-nums">{label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
