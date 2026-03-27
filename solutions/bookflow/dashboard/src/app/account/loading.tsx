import { Skeleton } from '@/components/ui/Skeleton';

export default function AccountLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-32" />
        <Skeleton variant="text" className="h-4 w-56" />
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
        <Skeleton variant="rect" className="h-5 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton variant="rect" className="h-4 w-24" />
              <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
        <Skeleton variant="rect" className="h-5 w-40" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
        <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
