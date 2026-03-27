'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// ─── Minimal QR code via external API (reliable, no deps) ───────────────────
// Uses api.qrserver.com — free, no auth, returns PNG/SVG
// Falls back to a placeholder if URL is empty

export function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const qrUrl = value
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&margin=2&color=000000&bgcolor=ffffff`
    : '';

  // Reset state when value changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [value]);

  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-xs text-gray-500 text-center px-4">
          Aucun lien disponible
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Skeleton while loading */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-lg animate-pulse"
          style={{ width: size, height: size }}
        />
      )}

      {error ? (
        <div
          className="flex flex-col items-center justify-center bg-gray-800 border border-gray-700 rounded-lg"
          style={{ width: size, height: size }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-2">
            <rect x="2" y="2" width="12" height="12" rx="1" fill="#374151" />
            <rect x="5" y="5" width="6" height="6" rx="0.5" fill="#6b7280" />
            <rect x="18" y="2" width="12" height="12" rx="1" fill="#374151" />
            <rect x="21" y="5" width="6" height="6" rx="0.5" fill="#6b7280" />
            <rect x="2" y="18" width="12" height="12" rx="1" fill="#374151" />
            <rect x="5" y="21" width="6" height="6" rx="0.5" fill="#6b7280" />
            <rect x="18" y="18" width="4" height="4" rx="0.5" fill="#6b7280" />
            <rect x="24" y="18" width="6" height="4" rx="0.5" fill="#6b7280" />
            <rect x="18" y="24" width="6" height="6" rx="0.5" fill="#6b7280" />
            <rect x="26" y="24" width="4" height="6" rx="0.5" fill="#6b7280" />
          </svg>
          <p className="text-xs text-gray-500">QR indisponible</p>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={qrUrl}
          alt="QR Code de réservation"
          width={size}
          height={size}
          className={`rounded-lg transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ width: size, height: size }}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
        />
      )}
    </div>
  );
}

// ─── Download helper ─────────────────────────────────────────────────────────
// Downloads the QR code as PNG via canvas (draws the img element)

export function useQRDownload() {
  const imgRef = useRef<HTMLImageElement | null>(null);

  async function downloadQR(value: string, filename = 'qr-reservation.png', size = 512) {
    if (!value) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png&margin=4`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab
      window.open(qrUrl, '_blank');
    }
  }

  return { downloadQR, imgRef };
}
