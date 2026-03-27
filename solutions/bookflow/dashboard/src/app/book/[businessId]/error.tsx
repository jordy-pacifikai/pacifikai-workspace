'use client';

import { useEffect } from 'react';

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Ve\'a] Booking error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center"
      style={{ '--accent': '#25D366' } as React.CSSProperties}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m10.29 3.86-8.57 14.86A2 2 0 0 0 3.43 22h17.14a2 2 0 0 0 1.71-3.28L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-xl font-bold text-white mb-2">
        Impossible de charger la page de r&eacute;servation
      </h1>
      <p className="text-sm text-gray-400 max-w-xs mb-8">
        Une erreur s&apos;est produite lors du chargement. Veuillez r&eacute;essayer.
      </p>

      {/* Retry button */}
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        R&eacute;essayer
      </button>

      {/* Ve'a branding */}
      <div className="flex items-center gap-2 mt-10">
        <span className="text-sm font-semibold text-gray-500">Ve&#x02BB;a</span>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: '#25D366' }}
          aria-hidden="true"
        />
        <span className="text-xs text-gray-600">by PACIFIK&#39;AI</span>
      </div>
    </div>
  );
}
