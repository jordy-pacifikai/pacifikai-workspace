import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function KnowledgeLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="rect" className="h-7 w-48" />
          <Skeleton variant="text" className="h-4 w-72" />
        </div>
        <Skeleton variant="rect" className="h-9 w-36 rounded-lg" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="flex-row" />
        ))}
      </div>
    </div>
  );
}
