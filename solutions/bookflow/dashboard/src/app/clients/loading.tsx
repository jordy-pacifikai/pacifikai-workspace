import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function ClientsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-32" />
        <Skeleton variant="text" className="h-4 w-56" />
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <Skeleton variant="rect" className="h-10 flex-1 rounded-lg" />
        <Skeleton variant="rect" className="h-10 w-24 rounded-lg" />
      </div>

      {/* Client cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
