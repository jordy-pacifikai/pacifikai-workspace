'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

// ─── Component ─────────────────────────────────────────────────────────────────

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid SSR mismatch — read real value only on client
    setIsOnline(navigator.onLine);
    setMounted(true);

    function handleOnline() {
      setIsOnline(true);
      setShowReconnected(true);
      const t = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(t);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowReconnected(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Nothing to show until hydrated
  if (!mounted) return null;

  // Online and no reconnection toast — nothing visible
  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
      style={{
        animation: 'slideDown 0.25s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      {!isOnline ? (
        /* Offline banner */
        <div className="w-full flex items-center justify-center gap-2 bg-amber-500/95 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-amber-950 shadow-lg pointer-events-auto">
          <WifiOff size={15} className="shrink-0" />
          <span>
            Vous êtes hors ligne. Certaines fonctionnalités sont limitées.
          </span>
        </div>
      ) : (
        /* Reconnected toast */
        <div className="mt-3 flex items-center gap-2 bg-gray-900 border border-green-500/30 rounded-xl px-4 py-2.5 text-sm font-medium text-green-400 shadow-xl pointer-events-auto"
          style={{
            animation: 'slideDown 0.25s ease-out forwards',
          }}
        >
          <Wifi size={15} className="shrink-0" />
          <span>Connexion rétablie !</span>
        </div>
      )}
    </div>
  );
}
