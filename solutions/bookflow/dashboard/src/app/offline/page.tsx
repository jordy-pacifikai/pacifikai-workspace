'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-center">
      <div className="mb-6 text-6xl">📡</div>
      <h1 className="mb-3 text-2xl font-bold text-white">Hors connexion</h1>
      <p className="mb-8 max-w-sm text-gray-400">
        Vous n&apos;êtes pas connecté à internet. Vérifiez votre connexion et
        réessayez.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-teal-600 px-6 py-3 font-medium text-white transition hover:bg-teal-500 active:scale-95"
      >
        Réessayer
      </button>
    </div>
  );
}
