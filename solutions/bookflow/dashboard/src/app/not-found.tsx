import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      {/* 404 large number */}
      <p
        className="text-[120px] font-black leading-none select-none"
        style={{ color: 'rgba(37, 211, 102, 0.12)' }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center -mt-4 mb-6"
        style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#25D366"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
          <path d="M11 8v3M11 14h.01" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-white mb-2">Page introuvable</h1>
      <p className="text-sm text-gray-400 max-w-sm mb-8">
        La page que vous cherchez n&apos;existe pas ou a &eacute;t&eacute; d&eacute;plac&eacute;e.
      </p>

      {/* Primary CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-black mb-6 transition-opacity hover:opacity-80"
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
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Retour &agrave; l&apos;accueil
      </Link>

      {/* Secondary nav links */}
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link
          href="/appointments"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Rendez-vous
        </Link>
        <span className="text-gray-800" aria-hidden="true">·</span>
        <Link
          href="/clients"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Clients
        </Link>
        <span className="text-gray-800" aria-hidden="true">·</span>
        <Link
          href="/faq"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Aide
        </Link>
      </nav>

      {/* Ve'a branding */}
      <p className="text-xs text-gray-700 mt-12">
        Ve&#x02BB;a{' '}
        <span style={{ color: '#25D366' }}>·</span>{' '}
        by PACIFIK&#39;AI
      </p>
    </div>
  );
}
