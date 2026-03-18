"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/chambres", label: "Chambres" },
  { href: "/le-lodge", label: "Le Lodge" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 100);

      // Hide on scroll down, show on scroll up (only after hero)
      if (y > 400) {
        setHidden(y > lastScroll.current && y - lastScroll.current > 5);
      } else {
        setHidden(false);
      }
      lastScroll.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const showBg = scrolled || !isHome;
  const isHidden = hidden && !menuOpen;

  return (
    <>
      {/* Main navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isHome && !scrolled
            ? "translate-y-0 opacity-0 pointer-events-none"
            : isHidden
            ? "-translate-y-full"
            : "translate-y-0"
        } ${
          showBg
            ? "bg-sand-50/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className={`font-serif text-[13px] tracking-[0.35em] uppercase transition-colors duration-500 ${
                showBg ? "text-ink" : "text-white"
              }`}
            >
              Povai Lodge
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-10">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 py-1 ${
                    pathname === link.href
                      ? showBg
                        ? "text-lagoon"
                        : "text-white"
                      : showBg
                      ? "text-ink/50 hover:text-ink"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-[1px] bg-current" />
                  )}
                </Link>
              ))}
              <Link
                href="/reservation"
                className={`text-[11px] tracking-[0.15em] uppercase px-6 py-2.5 rounded-full border transition-all duration-400 ${
                  showBg
                    ? "border-lagoon/30 text-lagoon hover:bg-lagoon hover:text-white hover:border-lagoon"
                    : "border-white/30 text-white hover:bg-white hover:text-ink hover:border-white"
                }`}
              >
                Reserver
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden relative w-10 h-10 flex flex-col justify-center items-center gap-[6px] z-[60] transition-colors ${
                menuOpen ? "text-ink" : showBg ? "text-ink" : "text-white"
              }`}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-6 h-[1px] bg-current transition-all duration-500 ${
                  menuOpen ? "rotate-45 translate-y-[3.5px]" : ""
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
              />
              <span
                className={`block w-6 h-[1px] bg-current transition-all duration-500 ${
                  menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed inset-0 z-[55] bg-sand-50 flex flex-col justify-center items-center transition-all duration-700 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
      >
        <nav className="flex flex-col items-center gap-8">
          {[...links, { href: "/reservation", label: "Reserver" }].map(
            (link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`font-serif text-4xl tracking-wide transition-all duration-500 ${
                  pathname === link.href
                    ? "text-lagoon"
                    : "text-ink/70 hover:text-lagoon"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                  transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                  opacity: menuOpen ? 1 : 0,
                }}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile menu footer */}
        <div className="absolute bottom-12 text-center">
          <a
            href="https://wa.me/68989538387"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.15em] uppercase text-ink/40 hover:text-lagoon transition-colors"
          >
            +689 89 53 83 87
          </a>
        </div>
      </div>

      {/* Hero floating logo (home only, before scroll) */}
      {isHome && (
        <div
          className={`fixed top-8 left-1/2 -translate-x-1/2 z-[45] pointer-events-none transition-all duration-700 ${
            scrolled ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <span className="font-serif text-white text-[13px] tracking-[0.4em] uppercase font-light">
            Povai Lodge
          </span>
        </div>
      )}
    </>
  );
}
