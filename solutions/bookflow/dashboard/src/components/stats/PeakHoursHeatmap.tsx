'use client';

import { Fragment, useMemo } from 'react';
import type { Appointment } from '@/types/database';

type Props = {
  appointments: Appointment[];
};

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOUR_START = 8;
const HOUR_END = 19; // inclusive, so 8h-19h = 12 rows

/**
 * 2D heatmap: 7 columns (Mon-Sun) x hour rows (8h-19h).
 * Cell color intensity proportional to appointment count (white -> #25D366).
 * Pure CSS grid, no external library.
 */
export function PeakHoursHeatmap({ appointments }: Props) {
  const { matrix, max } = useMemo(() => {
    // matrix[dayIndex][hour] = count
    // dayIndex: 0=Lun, 1=Mar, ..., 6=Dim
    const matrix: number[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => 0),
    );

    let max = 0;

    appointments.forEach((appt) => {
      const date = new Date(appt.appointment_date);
      // getDay(): 0=dim, 1=lun, ..., 6=sam
      // Reorganize: Lun=0, Mar=1, ..., Dim=6
      const jsDay = date.getDay();
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

      const hour = parseInt(appt.time_slot.split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        matrix[dayIdx][hour] += 1;
        if (matrix[dayIdx][hour] > max) {
          max = matrix[dayIdx][hour];
        }
      }
    });

    return { matrix, max: Math.max(max, 1) };
  }, [appointments]);

  const hours = Array.from(
    { length: HOUR_END - HOUR_START + 1 },
    (_, i) => HOUR_START + i,
  );

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      {/* Header */}
      <h2 className="text-white font-semibold text-sm mb-4">Heures de pointe</h2>

      {/* Grid container */}
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `40px repeat(7, minmax(36px, 1fr))`,
            gridTemplateRows: `auto repeat(${hours.length}, 28px)`,
          }}
        >
          {/* Top-left empty cell */}
          <div />

          {/* Day headers */}
          {DAY_LABELS.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-gray-400 font-medium pb-1"
            >
              {day}
            </div>
          ))}

          {/* Hour rows */}
          {hours.map((hour) => (
            <Fragment key={`row-${hour}`}>
              {/* Hour label */}
              <div className="text-right text-xs text-gray-500 tabular-nums pr-2 flex items-center justify-end">
                {hour}h
              </div>

              {/* Day cells for this hour */}
              {DAY_LABELS.map((dayLabel, dayIdx) => {
                const count = matrix[dayIdx][hour];
                const opacity = count > 0 ? Math.max(0.15, count / max) : 0;

                return (
                  <div
                    key={`${dayIdx}-${hour}`}
                    title={`${count} RDV le ${dayLabel} a ${hour}h`}
                    className="rounded-sm border border-gray-800/50 cursor-default transition-colors"
                    style={{
                      backgroundColor:
                        count > 0
                          ? `rgba(37, 211, 102, ${opacity})`
                          : 'rgb(17, 24, 39)',
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend bar */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-gray-600">0 RDV</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden flex">
          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1.0].map((o) => (
            <div
              key={o}
              className="flex-1 h-full"
              style={{ backgroundColor: `rgba(37, 211, 102, ${o})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-600">Max</span>
      </div>
    </div>
  );
}
