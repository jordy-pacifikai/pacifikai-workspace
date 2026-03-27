import { Skeleton } from '@/components/ui/Skeleton';

export default function FeatureRequestsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-48" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-24 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-9 w-28 rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-2">
            <Skeleton variant="rect" className="h-5 w-48" />
            <Skeleton variant="text" className="h-4 w-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton variant="rect" className="h-6 w-16 rounded-full" />
              <Skeleton variant="rect" className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
