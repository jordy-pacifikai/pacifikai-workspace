import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-electric rounded flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">
                  PB
                </span>
              </div>
              <div>
                <span className="font-display font-semibold text-sm block">
                  Pacific Blue
                </span>
                <span className="text-gray-400 text-xs tracking-wider uppercase">
                  Consulting
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mt-4">
              Votre boussole dans un monde complexe. Conseil en aviation civile
              et environnement depuis 2017.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/expertises", label: "Expertises" },
                { href: "/references", label: "References" },
                { href: "/a-propos", label: "A propos" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-electric transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Expertises */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Expertises
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                "Aviation Civile",
                "Environnement",
                "AMO",
                "Etudes Strategiques",
                "Developpement Durable",
              ].map((item) => (
                <span key={item} className="text-gray-400 text-sm">
                  {item}
                </span>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3 text-gray-400 text-sm">
              <p>Punaauia, Tahiti</p>
              <p>Polynesie francaise</p>
              <a
                href="tel:+68987747284"
                className="hover:text-electric transition-colors"
              >
                +689 87 747 284
              </a>
              <a
                href="mailto:pacificblueconsulting@zoho.com"
                className="hover:text-electric transition-colors"
              >
                pacificblueconsulting@zoho.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Pacific Blue Consulting. Tous
            droits reserves.
          </p>
          <p className="text-gray-500 text-xs">
            Punaauia, Tahiti — Polynesie francaise
          </p>
        </div>
      </div>
    </footer>
  );
}
