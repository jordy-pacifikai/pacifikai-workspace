import { Skeleton } from '@/components/ui/Skeleton';

function FieldGroup() {
  return (
    <div className="space-y-1.5">
      <Skeleton variant="rect" className="h-4 w-28" />
      <Skeleton variant="rect" className="h-10 w-full rounded-lg" />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-36" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Tab nav skeleton */}
      <div className="flex gap-2 border-b border-gray-800 pb-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-8 w-24 rounded-t-lg" />
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-5">
        <Skeleton variant="rect" className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup />
          <FieldGroup />
          <FieldGroup />
          <FieldGroup />
          <FieldGroup />
          <FieldGroup />
        </div>
        <div className="pt-2 flex justify-end">
          <Skeleton variant="rect" className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
