import { Skeleton } from '@/components/ui/Skeleton';

export default function ConversationsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="rect" className="h-7 w-44" />
        <Skeleton variant="text" className="h-4 w-60" />
      </div>

      {/* Search */}
      <Skeleton variant="rect" className="h-10 w-full rounded-lg" />

      {/* Conversation list */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 divide-y divide-gray-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4">
            {/* Avatar circle */}
            <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
            {/* Text lines */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <Skeleton variant="rect" className="h-3.5 w-1/3" />
                <Skeleton variant="rect" className="h-3 w-14 shrink-0" />
              </div>
              <Skeleton variant="text" className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
