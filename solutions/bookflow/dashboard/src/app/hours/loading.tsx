import { Skeleton } from '@/components/ui/Skeleton';

export default function HoursLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-32" />
        <Skeleton variant="text" className="h-4 w-56" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton variant="rect" className="h-5 w-20" />
            <Skeleton variant="rect" className="h-9 w-24 rounded-lg" />
            <Skeleton variant="text" className="h-4 w-4" />
            <Skeleton variant="rect" className="h-9 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
