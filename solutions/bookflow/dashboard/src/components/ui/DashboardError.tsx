'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[Ve'a] Dashboard error:", error);
  }, [error]);

  // Sanitize — never expose raw stack traces to users
  const userMessage =
    error.message &&
    !error.message.includes(' at ') &&
    error.message.length < 200
      ? error.message
      : "Une erreur inattendue s'est produite.";

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-gray-950 min-h-[400px]">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-8 text-center">
        {/* Icon */}
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        >
          <svg
            width="24"
            height="24"
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
        <h2 className="text-lg font-bold text-white mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-gray-400 mb-6">{userMessage}</p>

        {/* Digest ref */}
        {error.digest && (
          <p className="text-xs text-gray-600 font-mono mb-5">
            ref&nbsp;: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg
              width="14"
              height="14"
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

          <Link
            href="/stats"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-300 border border-gray-700 transition-colors hover:border-gray-500 hover:text-white"
          >
            Tableau de bord
          </Link>
        </div>

        {/* Support */}
        <p className="text-xs text-gray-600">
          Probl&egrave;me persistant&nbsp;?{' '}
          <a
            href="mailto:vea@pacifikai.com"
            className="underline transition-colors hover:text-gray-400"
            style={{ color: '#25D366' }}
          >
            Contacter le support
          </a>
        </p>
      </div>
    </div>
  );
}
