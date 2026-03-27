import { Skeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <Skeleton variant="circle" className="w-14 h-14" />
        <Skeleton variant="rect" className="h-5 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <span className="sr-only">Chargement…</span>
        <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
      </div>
    </div>
  );
}
