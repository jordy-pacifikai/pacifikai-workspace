'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // iOS detection (no beforeinstallprompt)
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(ios);

    // Check if user dismissed before (respect for 7 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Show iOS prompt after 30s
    if (ios) {
      const timer = setTimeout(() => setShowPrompt(true), 30000);
      return () => clearTimeout(timer);
    }

    // Chrome/Edge/Samsung: listen for native prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom duration-500 md:left-auto md:right-6 md:bottom-6">
      <div className="rounded-2xl border border-gray-700/50 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600/20">
            <Smartphone className="h-5 w-5 text-teal-400" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-white">
              Installer Ve&apos;a
            </h3>
            {isIOS ? (
              <p className="mt-1 text-xs text-gray-400">
                Appuyez sur{' '}
                <span className="inline-flex items-center rounded bg-gray-800 px-1.5 py-0.5 text-xs font-medium text-gray-300">
                  ⬆ Partager
                </span>{' '}
                puis{' '}
                <span className="font-medium text-gray-300">
                  &quot;Sur l&apos;écran d&apos;accueil&quot;
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">
                Accédez à Ve&apos;a directement depuis votre écran d&apos;accueil
              </p>
            )}
          </div>
        </div>

        {!isIOS && (
          <button
            onClick={handleInstall}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 active:scale-[0.98]"
          >
            <Download size={16} />
            Installer
          </button>
        )}
      </div>
    </div>
  );
}
