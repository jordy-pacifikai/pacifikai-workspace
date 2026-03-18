import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Thin separator */}
        <div className="w-12 h-px bg-muted/40 mx-auto mb-16" />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 text-center md:text-left">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg tracking-widest uppercase mb-2">
              Povai Lodge
            </p>
            <p className="text-sm text-muted">Bora Bora, Polynésie française</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3 text-sm text-muted">
            <Link href="/chambres" className="hover:text-ink transition-colors duration-300">
              Chambres
            </Link>
            <Link href="/le-lodge" className="hover:text-ink transition-colors duration-300">
              Le Lodge
            </Link>
            <Link href="/reservation" className="hover:text-ink transition-colors duration-300">
              Réserver
            </Link>
            <Link href="/contact" className="hover:text-ink transition-colors duration-300">
              Contact
            </Link>
          </nav>

          {/* Contact */}
          <div className="text-sm text-muted">
            <p>+689 89 53 83 87</p>
            <p className="mt-1">contact@povailodge.com</p>
          </div>
        </div>

        <p className="text-xs text-muted/60 text-center mt-16">
          &copy; {new Date().getFullYear()} Povai Lodge. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
