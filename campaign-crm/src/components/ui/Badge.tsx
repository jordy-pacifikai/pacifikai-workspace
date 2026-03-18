'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  bgColor?: string;
  textColor?: string;
  dotColor?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  label,
  bgColor,
  textColor,
  dotColor,
  showDot = false,
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        bgColor ?? 'bg-gray-800/50',
        textColor ?? 'text-gray-300',
        className
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full flex-shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', dotColor ?? 'bg-gray-400')}
        />
      )}
      {label}
    </span>
  );
}

// Convenience export — lets callers just pass a color string (e.g. "teal")
// and get deterministic Tailwind classes without dynamic class names.
type ColorKey =
  | 'gray' | 'blue' | 'purple' | 'amber' | 'teal' | 'green'
  | 'orange' | 'emerald' | 'red' | 'pink' | 'yellow' | 'cyan' | 'indigo';

const COLOR_MAP: Record<ColorKey, { bg: string; text: string; dot: string }> = {
  gray:    { bg: 'bg-gray-800/50',    text: 'text-gray-300',    dot: 'bg-gray-400'    },
  blue:    { bg: 'bg-blue-900/30',    text: 'text-blue-300',    dot: 'bg-blue-400'    },
  purple:  { bg: 'bg-purple-900/30',  text: 'text-purple-300',  dot: 'bg-purple-400'  },
  amber:   { bg: 'bg-amber-900/30',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  teal:    { bg: 'bg-teal-900/30',    text: 'text-teal-300',    dot: 'bg-teal-400'    },
  green:   { bg: 'bg-green-900/30',   text: 'text-green-300',   dot: 'bg-green-400'   },
  orange:  { bg: 'bg-orange-900/30',  text: 'text-orange-300',  dot: 'bg-orange-400'  },
  emerald: { bg: 'bg-emerald-900/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  red:     { bg: 'bg-red-900/30',     text: 'text-red-300',     dot: 'bg-red-400'     },
  pink:    { bg: 'bg-pink-900/30',    text: 'text-pink-300',    dot: 'bg-pink-400'    },
  yellow:  { bg: 'bg-yellow-900/30',  text: 'text-yellow-300',  dot: 'bg-yellow-400'  },
  cyan:    { bg: 'bg-cyan-900/30',    text: 'text-cyan-300',    dot: 'bg-cyan-400'    },
  indigo:  { bg: 'bg-indigo-900/30',  text: 'text-indigo-300',  dot: 'bg-indigo-400'  },
};

export function ColorBadge({
  label,
  color,
  showDot = false,
  size = 'sm',
  className,
}: {
  label: string;
  color: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const cfg = COLOR_MAP[color as ColorKey] ?? COLOR_MAP.gray;
  return (
    <Badge
      label={label}
      bgColor={cfg.bg}
      textColor={cfg.text}
      dotColor={cfg.dot}
      showDot={showDot}
      size={size}
      className={className}
    />
  );
}
