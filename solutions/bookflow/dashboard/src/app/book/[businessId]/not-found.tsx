export default function BookingNotFound() {
  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center"
      style={{ '--accent': '#25D366' } as React.CSSProperties}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
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
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-xl font-bold text-white mb-2">Commerce introuvable</h1>
      <p className="text-sm text-gray-400 max-w-xs mb-2">
        Ce commerce n&apos;existe pas ou n&apos;accepte plus de r&eacute;servations.
      </p>
      <p className="text-xs text-gray-600 max-w-xs mb-8">
        V&eacute;rifiez le lien re&ccedil;u ou contactez directement le commerce.
      </p>

      {/* Ve'a branding */}
      <div className="flex items-center gap-2 mt-4">
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
