import { Skeleton } from '@/components/ui/Skeleton';

export default function StatusLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-36" />
        <Skeleton variant="text" className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton variant="rect" className="h-3 w-3 rounded-full" />
              <Skeleton variant="rect" className="h-4 w-28" />
            </div>
            <Skeleton variant="text" className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
