import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';

export default function AppointmentsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-48" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <Skeleton variant="rect" className="h-9 w-48 rounded-lg" />
        <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
        <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
        <Skeleton variant="rect" className="h-9 w-24 rounded-lg ml-auto" />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800">
          <Skeleton variant="rect" className="h-4 w-28" />
          <Skeleton variant="rect" className="h-4 w-20 ml-auto" />
          <Skeleton variant="rect" className="h-4 w-20" />
          <Skeleton variant="rect" className="h-4 w-16" />
        </div>
        <div className="divide-y divide-gray-800 px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
