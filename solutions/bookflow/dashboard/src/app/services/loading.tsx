import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function ServicesLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header + action button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="rect" className="h-7 w-36" />
          <Skeleton variant="text" className="h-4 w-56" />
        </div>
        <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
      </div>

      {/* Service cards — single column */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="flex-row" />
        ))}
      </div>
    </div>
  );
}
