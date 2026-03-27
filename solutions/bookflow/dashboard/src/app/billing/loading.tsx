import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';

export default function BillingLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-32" />
        <Skeleton variant="text" className="h-4 w-56" />
      </div>

      {/* Current plan card */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="rect" className="h-5 w-28" />
          <Skeleton variant="rect" className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton variant="rect" className="h-9 w-36" />
        <Skeleton variant="text" className="h-4 w-64" />
        <div className="flex gap-3 pt-1">
          <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
          <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Invoices table */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <Skeleton variant="rect" className="h-5 w-32" />
        </div>
        <div className="divide-y divide-gray-800 px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
