'use client';

import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { APPOINTMENT_STATUS } from '@/lib/appointment-status';
import type { AppointmentHistoryItem } from '@/hooks/useClientStats';
import type { Appointment, AppointmentStatus } from '@/types/database';

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = APPOINTMENT_STATUS[status] ?? APPOINTMENT_STATUS.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium shrink-0',
        cfg.bg, cfg.text, cfg.border,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Single timeline entry ────────────────────────────────────────────────────

function TimelineEntry({
  item,
  isLast,
}: {
  item: AppointmentHistoryItem;
  isLast: boolean;
}) {
  const dateLabel = item.date
    ? format(new Date(item.date), 'EEE d MMM yyyy', { locale: fr })
    : '—';

  return (
    <div className="relative flex gap-4 group">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center pt-1 shrink-0 w-5">
        <div
          className={cn(
            'w-2.5 h-2.5 rounded-full border-2 border-gray-900 z-10 mt-0.5',
            APPOINTMENT_STATUS[item.status]?.dot ?? 'bg-gray-500',
          )}
        />
        {!isLast && (
          <div className="flex-1 w-px bg-gray-800 mt-1.5" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 pb-5 min-w-0',
          isLast && 'pb-2',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          {/* Service + date */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {item.service ?? (
                <span className="text-gray-500 italic font-normal">
                  Service non renseigné
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <CalendarClock className="w-3 h-3 shrink-0" />
              {dateLabel}
              {item.time && <span className="text-gray-600">• {item.time}</span>}
            </p>
            {item.notes && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.notes}</p>
            )}
          </div>

          {/* Right: price + badge */}
          <div className="flex items-center gap-2 shrink-0">
            {item.price != null && item.price > 0 && (
              <span className="text-xs text-gray-300 font-medium tabular-nums">
                {item.price.toLocaleString('fr-FR')} XPF
              </span>
            )}
            <StatusBadge status={item.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function AppointmentTimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center shrink-0 w-5">
            <Skeleton variant="circle" className="w-2.5 h-2.5 mt-0.5" />
          </div>
          <div className="flex-1 pb-5 space-y-2">
            <Skeleton variant="rect" className="h-3.5 w-1/3" />
            <Skeleton variant="rect" className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AppointmentTimelineProps {
  items: AppointmentHistoryItem[];
  isLoading?: boolean;
}

export function AppointmentTimeline({ items, isLoading }: AppointmentTimelineProps) {
  if (isLoading) return <AppointmentTimelineSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <CalendarClock className="w-8 h-8 text-gray-700" />
        <p className="text-gray-500 text-sm">Aucun rendez-vous enregistré pour ce client.</p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item, idx) => (
        <TimelineEntry
          key={item.id}
          item={item}
          isLast={idx === items.length - 1}
        />
      ))}
    </div>
  );
}
