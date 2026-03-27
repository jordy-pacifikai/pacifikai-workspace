import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-36" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Chart 1 */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="rect" className="h-5 w-44" />
          <Skeleton variant="rect" className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton variant="rect" className="h-64 w-full rounded-lg" />
      </div>

      {/* Chart 2 */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="rect" className="h-5 w-36" />
          <Skeleton variant="rect" className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton variant="rect" className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
