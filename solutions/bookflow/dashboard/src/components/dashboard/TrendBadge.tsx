'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendBadgeProps {
  current: number;
  previous: number;
  format?: 'percent' | 'number';
  invertColors?: boolean; // true for no_shows where decrease = good
}

export function TrendBadge({
  current,
  previous,
  format: displayFormat = 'percent',
  invertColors = false,
}: TrendBadgeProps) {
  // Calculate delta
  const delta = current - previous;

  if (delta === 0 || (previous === 0 && current === 0)) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-500">
        <Minus size={11} />
        <span>0 %</span>
      </span>
    );
  }

  const isUp = delta > 0;

  let label: string;
  if (displayFormat === 'percent') {
    if (previous === 0) {
      label = isUp ? '+100 %' : '-100 %';
    } else {
      const pct = Math.round((delta / previous) * 100);
      label = `${pct > 0 ? '+' : ''}${pct} %`;
    }
  } else {
    label = `${delta > 0 ? '+' : ''}${delta}`;
  }

  // Determine color: up = good (green) unless invertColors
  const isPositive = invertColors ? !isUp : isUp;
  const colorClass = isPositive ? 'text-green-400' : 'text-red-400';

  const Icon = isUp ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-medium',
        colorClass,
      )}
    >
      <Icon size={11} />
      <span>{label}</span>
    </span>
  );
}
