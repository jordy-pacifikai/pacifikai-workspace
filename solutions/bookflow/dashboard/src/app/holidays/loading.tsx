import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';

export default function HolidaysLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-48" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
        <div className="divide-y divide-gray-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
