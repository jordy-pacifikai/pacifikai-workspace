'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Facebook OAuth callback page (implicit flow).
 * Receives access_token in URL hash fragment, exchanges it via Chatwoot,
 * then redirects back to /channels.
 */
export default function FacebookCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error' | 'success'>('processing');
  const [message, setMessage] = useState('Connexion en cours...');

  useEffect(() => {
    async function handleCallback() {
      // Parse token from hash fragment: #access_token=xxx&token_type=bearer&...
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        setStatus('error');
        setMessage('Connexion Facebook annulee ou echouee.');
        setTimeout(() => router.push('/channels'), 3000);
        return;
      }

      const businessId = sessionStorage.getItem('fb_connect_business');
      if (!businessId) {
        setStatus('error');
        setMessage('Session expiree. Retourne sur la page Canaux et reessaye.');
        setTimeout(() => router.push('/channels'), 3000);
        return;
      }

      try {
        // Step 1: Exchange token via Chatwoot to get page list
        setMessage('Recuperation de tes Pages Facebook...');
        const listRes = await fetch('/api/chatwoot/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'list-pages',
            businessId,
            fbUserToken: accessToken,
          }),
        });
        const listData = await listRes.json();

        if (listData.error) {
          setStatus('error');
          setMessage(listData.error);
          setTimeout(() => router.push('/channels'), 4000);
          return;
        }

        const pages = listData.pages || [];
        const userAccessToken = listData.userAccessToken || accessToken;

        if (pages.length === 0) {
          setStatus('error');
          setMessage('Aucune Page Facebook trouvee. Verifie que tu es admin d\'au moins une Page.');
          setTimeout(() => router.push('/channels'), 4000);
          return;
        }

        // If multiple pages, redirect to server-side OAuth flow
        // (tokens are stored server-side in bookbot_fb_page_sessions, not sessionStorage)
        if (pages.length > 1) {
          setStatus('error');
          setMessage('Plusieurs Pages detectees. Utilise le bouton "Connecter Facebook" sur la page Canaux.');
          setTimeout(() => router.push('/channels'), 3000);
          return;
        }

        // Single page — auto-connect
        const page = pages[0];
        setMessage(`Connexion de "${page.name}"...`);

        const registerRes = await fetch('/api/chatwoot/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register-page',
            businessId,
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            userAccessToken,
          }),
        });
        const registerData = await registerRes.json();

        if (registerData.error) {
          setStatus('error');
          setMessage(registerData.error);
          setTimeout(() => router.push('/channels'), 4000);
          return;
        }

        setStatus('success');
        setMessage(`"${page.name}" connectee avec succes !`);
        sessionStorage.removeItem('fb_connect_business');
        setTimeout(() => router.push('/channels'), 2000);
      } catch {
        setStatus('error');
        setMessage('Erreur de connexion. Reessaye.');
        setTimeout(() => router.push('/channels'), 3000);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 max-w-md w-full text-center space-y-4">
        {status === 'processing' && (
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
        )}
        {status === 'error' && (
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
        )}
        <p className="text-white text-lg font-medium">{message}</p>
        {status !== 'processing' && (
          <p className="text-gray-500 text-sm">Redirection automatique...</p>
        )}
      </div>
    </div>
  );
}
