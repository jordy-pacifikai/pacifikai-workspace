import { Skeleton } from '@/components/ui/Skeleton';

export default function ShareLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-44" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
          <Skeleton variant="rect" className="h-5 w-32" />
          <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
          <Skeleton variant="rect" className="h-32 w-32 mx-auto rounded-lg" />
        </div>
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
          <Skeleton variant="rect" className="h-5 w-36" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rect" className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
