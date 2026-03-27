import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function ReportsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="rect" className="h-7 w-32" />
          <Skeleton variant="text" className="h-4 w-56" />
        </div>
        <Skeleton variant="rect" className="h-9 w-36 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
