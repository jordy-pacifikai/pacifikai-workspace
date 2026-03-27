'use client';

import { cn } from '@/lib/utils';
import { getSegmentById, SEGMENTS } from '@/lib/segments';
import type { SegmentId } from '@/lib/segments';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SegmentBadgesProps {
  segmentIds: SegmentId[];
  /** compact = emoji only, no label (for list rows) */
  compact?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SegmentBadges({ segmentIds, compact = false, className }: SegmentBadgesProps) {
  if (segmentIds.length === 0) return null;

  // Sort by SEGMENTS order for stable display
  const ordered = SEGMENTS
    .filter((s) => segmentIds.includes(s.id as SegmentId))
    .map((s) => s);

  if (compact) {
    // Compact mode: stacked emojis for list rows
    return (
      <span
        className={cn('inline-flex items-center gap-0.5', className)}
        aria-label={ordered.map((s) => s.label).join(', ')}
      >
        {ordered.map((segment) => (
          <span
            key={segment.id}
            title={`${segment.label} — ${segment.description}`}
            className="text-sm leading-none select-none"
            role="img"
            aria-label={segment.label}
          >
            {segment.icon}
          </span>
        ))}
      </span>
    );
  }

  // Full mode: colored badges with label (for detail pages)
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {ordered.map((segment) => (
        <span
          key={segment.id}
          title={segment.description}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: segment.color + '22', // 13% opacity
            borderColor: segment.color + '60',      // 38% opacity
            color: segment.color,
          }}
        >
          <span role="img" aria-label={segment.label} className="text-sm leading-none">
            {segment.icon}
          </span>
          {segment.label}
        </span>
      ))}
    </div>
  );
}

// ─── Single badge helper (for inline use) ─────────────────────────────────────

interface SingleSegmentBadgeProps {
  segmentId: SegmentId;
  compact?: boolean;
}

export function SingleSegmentBadge({ segmentId, compact = false }: SingleSegmentBadgeProps) {
  const segment = getSegmentById(segmentId);
  if (!segment) return null;
  return (
    <SegmentBadges
      segmentIds={[segmentId]}
      compact={compact}
    />
  );
}
