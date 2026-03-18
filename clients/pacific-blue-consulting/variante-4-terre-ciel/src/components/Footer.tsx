import Link from "next/link";

const links = [
  { href: "/expertise", label: "Expertise" },
  { href: "/references", label: "References" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-white/80">
      <div className="editorial-container py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <h2 className="font-serif text-2xl text-white mb-4">
              Pacific Blue Consulting
            </h2>
            <p className="font-sans text-sm leading-relaxed text-white/30 max-w-sm font-light">
              Cabinet de conseil independant en aviation civile, environnement et
              accompagnement strategique pour les territoires insulaires du
              Pacifique.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/20 mb-6">
              Navigation
            </h3>
            <nav
              className="flex flex-col gap-3"
              aria-label="Navigation pied de page"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-sm text-white/40 hover:text-white transition-colors duration-300 font-light w-fit link-slide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/20 mb-6">
              Contact
            </h3>
            <div className="flex flex-col gap-3 font-sans text-sm font-light">
              <p className="text-white/40">Punaauia, Tahiti</p>
              <p className="text-white/40">Polynesie francaise</p>
              <a
                href="tel:+68987747284"
                className="text-white/40 hover:text-white transition-colors duration-300 w-fit"
              >
                +689 87 747 284
              </a>
              <a
                href="mailto:pacificblueconsulting@zoho.com"
                className="text-gold/80 hover:text-gold transition-colors duration-300 w-fit"
              >
                pacificblueconsulting@zoho.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] text-white/20 font-light">
            &copy; {new Date().getFullYear()} Pacific Blue Consulting. Tous
            droits reserves.
          </p>
          <p className="font-sans text-[11px] text-white/20 font-light">
            Pascal BAZER-BACHI &mdash; Ancien Directeur Aviation Civile PF
          </p>
        </div>
      </div>
    </footer>
  );
}
