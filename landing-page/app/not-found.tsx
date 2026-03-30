export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <h1 className="font-display text-6xl mb-4 gradient-text-coral">404</h1>
        <p className="text-text-secondary mb-8">Page introuvable</p>
        <a href="/" className="px-6 py-3 rounded-full bg-accent text-bg font-medium text-sm">
          Retour a l&apos;accueil
        </a>
      </div>
    </div>
  );
}
