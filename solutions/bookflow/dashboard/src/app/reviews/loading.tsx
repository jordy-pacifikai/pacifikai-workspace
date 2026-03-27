import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function ReviewsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-24" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="flex-row" />
        ))}
      </div>
    </div>
  );
}
