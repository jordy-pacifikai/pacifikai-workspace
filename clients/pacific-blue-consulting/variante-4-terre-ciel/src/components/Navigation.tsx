"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/expertise", label: "Expertise" },
  { href: "/references", label: "References" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Determine if we're on a page with a dark hero
  const isDarkHero = pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out-expo ${
          scrolled
            ? "bg-cream/95 backdrop-blur-md py-4"
            : "bg-transparent py-6 md:py-8"
        }`}
        style={{
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="editorial-container flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full border transition-all duration-700 ${
                  scrolled || !isDarkHero
                    ? "border-charcoal/20"
                    : "border-white/30"
                }`}
              >
                <div
                  className={`absolute inset-[3px] rounded-full transition-all duration-700 ${
                    scrolled || !isDarkHero
                      ? "bg-gradient-to-br from-forest to-steel"
                      : "bg-white/15"
                  }`}
                />
              </div>
            </div>
            <div>
              <span
                className={`font-serif text-lg font-semibold transition-colors duration-700 block leading-tight ${
                  scrolled || !isDarkHero ? "text-charcoal" : "text-white"
                }`}
              >
                Pacific Blue
              </span>
              <span
                className={`font-sans text-[9px] uppercase tracking-[0.25em] transition-colors duration-700 ${
                  scrolled || !isDarkHero
                    ? "text-charcoal/40"
                    : "text-white/50"
                }`}
              >
                Consulting
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-10"
            aria-label="Navigation principale"
          >
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-[13px] tracking-wide transition-colors duration-300 relative group ${
                    scrolled || !isDarkHero
                      ? isActive
                        ? "text-charcoal"
                        : "text-charcoal/50 hover:text-charcoal"
                      : isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link.label}
                  {/* Sliding underline */}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-500 ease-out-expo ${
                      isActive
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            <span
              className={`block w-6 h-px transition-all duration-500 ease-out-expo ${
                mobileOpen
                  ? "rotate-45 translate-y-[3.5px] bg-charcoal"
                  : scrolled || !isDarkHero
                  ? "bg-charcoal"
                  : "bg-white"
              }`}
            />
            <span
              className={`block w-6 h-px transition-all duration-500 ease-out-expo ${
                mobileOpen
                  ? "-rotate-45 -translate-y-[3.5px] bg-charcoal"
                  : scrolled || !isDarkHero
                  ? "bg-charcoal"
                  : "bg-white"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu — fullscreen */}
      <div
        className={`fixed inset-0 z-40 bg-cream transition-all duration-700 ease-out-expo md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav
          className="flex flex-col items-center justify-center h-full gap-10"
          aria-label="Navigation mobile"
        >
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-serif text-4xl transition-all duration-700 ease-out-expo ${
                mobileOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              } ${
                pathname === link.href
                  ? "text-charcoal"
                  : "text-charcoal/30 hover:text-charcoal"
              }`}
              style={{
                transitionDelay: mobileOpen ? `${150 + i * 80}ms` : "0ms",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
