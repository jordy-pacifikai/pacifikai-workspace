'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEGMENTS } from '@/lib/segments';
import type { SegmentId } from '@/lib/segments';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SegmentFilterProps {
  counts: Record<SegmentId, number>;
  selected: SegmentId[];
  onToggle: (id: SegmentId) => void;
  onClear: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SegmentFilter({ counts, selected, onToggle, onClear }: SegmentFilterProps) {
  // Only show segments that have at least one client (or are currently selected)
  const visibleSegments = SEGMENTS.filter(
    (s) => (counts[s.id as SegmentId] ?? 0) > 0 || selected.includes(s.id as SegmentId),
  );

  if (visibleSegments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* "Tous" reset button — only visible when there's an active filter */}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Tous
        </button>
      )}

      {visibleSegments.map((segment) => {
        const segId = segment.id as SegmentId;
        const isSelected = selected.includes(segId);
        const count = counts[segId] ?? 0;

        return (
          <button
            key={segment.id}
            type="button"
            onClick={() => onToggle(segId)}
            title={segment.description}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
              isSelected
                ? 'border-transparent text-white shadow-sm'
                : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white',
            )}
            style={
              isSelected
                ? {
                    backgroundColor: segment.color + '33', // 20% opacity
                    borderColor: segment.color + '80',      // 50% opacity
                    color: segment.color,
                  }
                : undefined
            }
          >
            <span className="text-base leading-none" role="img" aria-label={segment.label}>
              {segment.icon}
            </span>
            <span>{segment.label}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs font-bold px-1.5',
                isSelected ? 'bg-white/20' : 'bg-gray-800 text-gray-400',
              )}
              style={isSelected ? { color: segment.color } : undefined}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
