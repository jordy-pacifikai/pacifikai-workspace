'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Ve\'a] Application error:', error);
  }, [error]);

  // Sanitize — never expose raw stack traces to users
  const userMessage =
    error.message && !error.message.includes('at ') && error.message.length < 200
      ? error.message
      : 'Une erreur inattendue s\'est produite.';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
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
      <h1 className="text-2xl font-bold text-white mb-2">
        Une erreur est survenue
      </h1>
      <p className="text-sm text-gray-400 max-w-sm mb-8">
        {userMessage}
      </p>

      {/* Digest for support reference */}
      {error.digest && (
        <p className="text-xs text-gray-700 mb-6 font-mono">
          ref: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
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

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-gray-300 border border-gray-800 transition-colors hover:border-gray-600 hover:text-white"
        >
          Retour &agrave; l&apos;accueil
        </Link>
      </div>

      {/* Support link */}
      <p className="text-xs text-gray-600">
        Probl&egrave;me persistant ?{' '}
        <a
          href="mailto:vea@pacifikai.com"
          className="underline transition-colors hover:text-gray-400"
          style={{ color: '#25D366' }}
        >
          Contacter le support
        </a>
      </p>

      {/* Ve'a branding */}
      <p className="text-xs text-gray-700 mt-10">
        Ve&#x02BB;a{' '}
        <span style={{ color: '#25D366' }}>·</span>{' '}
        by PACIFIK&#39;AI
      </p>
    </div>
  );
}
