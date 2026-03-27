'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const params = useSearchParams();
  const tokenParam = params.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUnsubscribe() {
    if (!tokenParam) {
      setError('Lien invalide — token manquant.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenParam }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Une erreur est survenue.');
        return;
      }
      setDone(true);
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {done ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="text-3xl mb-4">&#10003;</div>
          <h1 className="text-lg font-semibold text-white mb-2">
            Desinscription confirmee
          </h1>
          <p className="text-sm text-gray-400">
            Vous ne recevrez plus d&apos;emails marketing de Ve&apos;a.
            Les notifications transactionnelles (confirmations de RDV) restent actives.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h1 className="text-lg font-semibold text-white mb-2">
            Se desinscrire des emails
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Vous ne recevrez plus d&apos;emails marketing (conseils, astuces).
            Les confirmations de rendez-vous resteront actives.
          </p>
          {error && (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          )}
          <button
            onClick={handleUnsubscribe}
            disabled={loading || !tokenParam}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Confirmer la desinscription'}
          </button>
        </div>
      )}
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-2xl font-bold text-white mb-1">Ve&apos;a</p>
        <p className="text-sm text-gray-500 mb-8">Assistant de reservation</p>

        <Suspense fallback={
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <p className="text-sm text-gray-400">Chargement...</p>
          </div>
        }>
          <UnsubscribeContent />
        </Suspense>

        <p className="text-xs text-gray-600 mt-6">
          <a href="mailto:vea@pacifikai.com" className="hover:text-gray-400 transition-colors">
            vea@pacifikai.com
          </a>
        </p>
      </div>
    </div>
  );
}
