'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface QueryErrorResetProps {
  /** Optional query key to invalidate specifically. Invalidates all queries when omitted. */
  queryKey?: readonly unknown[];
  /** Optional custom message. Defaults to French generic label. */
  message?: string;
  /** Called after invalidation (e.g. to trigger a local re-render via state). */
  onReset?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function QueryErrorReset({
  queryKey,
  message,
  onReset,
}: QueryErrorResetProps) {
  const queryClient = useQueryClient();

  async function handleRetry() {
    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey });
    } else {
      await queryClient.invalidateQueries();
    }
    onReset?.();
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-gray-900 border border-gray-800 px-6 py-8 text-center">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle size={20} className="text-red-400" />
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-300">
        {message ?? 'Les données n\'ont pas pu être chargées'}
      </p>

      {/* Retry button */}
      <button
        onClick={handleRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors active:scale-95"
      >
        <RefreshCw size={13} />
        Réessayer
      </button>
    </div>
  );
}
