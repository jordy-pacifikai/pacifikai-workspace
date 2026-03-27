import { Skeleton, SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';

export default function StatsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-48" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      {/* 6 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-3">
        <Skeleton variant="rect" className="h-5 w-40" />
        <Skeleton variant="rect" className="h-48 w-full" />
      </div>

      {/* Activity feed */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <Skeleton variant="rect" className="h-5 w-32 mb-4" />
        <div className="divide-y divide-gray-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
