import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'circle' | 'rect';

interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded',
  circle: 'rounded-full',
  rect: 'rounded-lg',
};

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', variantStyles[variant], className)}
      aria-hidden="true"
    />
  );
}

/* ─── Preset composites ──────────────────────────────────────────────────── */

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-3', className)}>
      <Skeleton variant="rect" className="h-4 w-2/3" />
      <Skeleton variant="rect" className="h-8 w-1/3" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton variant="circle" className="w-9 h-9 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-3 w-1/2" />
        <Skeleton variant="text" className="h-3 w-1/3" />
      </div>
      <Skeleton variant="rect" className="h-6 w-16 rounded-full" />
    </div>
  );
}
