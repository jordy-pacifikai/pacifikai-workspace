import { Skeleton } from '@/components/ui/Skeleton';

const DAYS = 7;
const ROWS = 5;

export default function CalendarLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header + nav */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="rect" className="h-7 w-40" />
          <Skeleton variant="text" className="h-4 w-52" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rect" className="h-9 w-9 rounded-lg" />
          <Skeleton variant="rect" className="h-9 w-32 rounded-lg" />
          <Skeleton variant="rect" className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-gray-800">
          {Array.from({ length: DAYS }).map((_, i) => (
            <div key={i} className="px-2 py-3 flex justify-center">
              <Skeleton variant="rect" className="h-4 w-8" />
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 border-b border-gray-800 last:border-b-0">
            {Array.from({ length: DAYS }).map((_, col) => (
              <div
                key={col}
                className="min-h-[80px] p-2 border-r border-gray-800 last:border-r-0 space-y-1.5"
              >
                <Skeleton variant="rect" className="h-5 w-6 rounded" />
                {/* Occasional event pill */}
                {(row + col) % 3 === 0 && (
                  <Skeleton variant="rect" className="h-5 w-full rounded" />
                )}
                {(row + col) % 5 === 0 && (
                  <Skeleton variant="rect" className="h-5 w-4/5 rounded" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
