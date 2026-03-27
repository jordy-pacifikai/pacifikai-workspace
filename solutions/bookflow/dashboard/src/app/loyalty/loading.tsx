import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function LoyaltyLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="rect" className="h-7 w-28" />
          <Skeleton variant="text" className="h-4 w-52" />
        </div>
        <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
