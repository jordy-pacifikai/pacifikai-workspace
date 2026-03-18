import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white/70 pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <h3 className="font-serif text-white text-[13px] tracking-[0.35em] uppercase mb-6">
              Povai Lodge
            </h3>
            <p className="text-sm leading-[1.8] text-white/40 max-w-xs">
              Trois chambres d&apos;exception au bord du plus beau lagon du
              monde. Bora Bora, Polynesie francaise.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-6">
              Navigation
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/", label: "Accueil" },
                { href: "/chambres", label: "Nos chambres" },
                { href: "/le-lodge", label: "Le Lodge" },
                { href: "/reservation", label: "Reserver" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-white/35 hover:text-white transition-colors duration-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-6">
              Contact
            </h4>
            <div className="flex flex-col gap-4">
              <a
                href="tel:+68989538387"
                className="text-[13px] text-white/35 hover:text-white transition-colors duration-400"
              >
                +689 89 53 83 87
              </a>
              <p className="text-[13px] text-white/35 leading-relaxed">
                Bora Bora<br />Polynesie francaise
              </p>
              <a
                href="https://wa.me/68989538387"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[#25D366]/70 hover:text-[#25D366] transition-colors duration-400 mt-1"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-[1px] bg-white/[0.06]" />

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/20 tracking-wide">
            &copy; {new Date().getFullYear()} Povai Lodge. Tous droits reserves.
          </p>
          <p className="text-[11px] text-white/15">
            Site par{" "}
            <a
              href="https://pacifikai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-lagoon transition-colors duration-400"
            >
              PACIFIK&apos;AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
