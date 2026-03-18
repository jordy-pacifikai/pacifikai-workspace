"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/expertise", label: "Expertise" },
  { href: "/references", label: "References" },
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled(scrolled);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-expo ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-elevation-1 border-b border-navy-100/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              isScrolled ? "h-16" : "h-20 lg:h-24"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <div
                className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? "w-9 h-9 bg-navy"
                    : "w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/10"
                } group-hover:scale-105`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-colors duration-300 ${
                    isScrolled ? "w-5 h-5 text-gold" : "w-5 h-5 text-gold"
                  }`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span
                  className={`font-display text-lg font-bold transition-colors duration-300 ${
                    isScrolled ? "text-navy" : "text-white"
                  }`}
                >
                  Pacific Blue
                </span>
                <span
                  className={`block text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                    isScrolled ? "text-steel" : "text-white/60"
                  }`}
                >
                  Consulting
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? isScrolled
                          ? "text-navy"
                          : "text-white"
                        : isScrolled
                        ? "text-warm-500 hover:text-navy"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full transition-colors duration-300 ${
                          isScrolled ? "bg-gold" : "bg-gold"
                        }`}
                      />
                    )}
                  </Link>
                );
              })}

              {/* CTA Button */}
              <Link
                href="/contact"
                className={`ml-4 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isScrolled
                    ? "bg-navy text-white hover:bg-navy-600"
                    : "bg-gold text-navy hover:bg-gold-400"
                }`}
              >
                Nous contacter
              </Link>
            </nav>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden relative z-10 p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileOpen}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${
                    isMobileOpen
                      ? "rotate-45 translate-y-[9px] bg-navy"
                      : isScrolled
                      ? "bg-navy"
                      : "bg-white"
                  }`}
                />
                <span
                  className={`block h-0.5 rounded-full transition-all duration-300 ${
                    isMobileOpen
                      ? "opacity-0 scale-x-0"
                      : isScrolled
                      ? "bg-navy"
                      : "bg-white"
                  }`}
                />
                <span
                  className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${
                    isMobileOpen
                      ? "-rotate-45 -translate-y-[9px] bg-navy"
                      : isScrolled
                      ? "bg-navy"
                      : "bg-white"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-navy/20 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-elevation-4 transition-transform duration-500 ease-out-expo ${
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-24 pb-8 px-6">
            <nav className="flex-1 space-y-1">
              {navItems.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive
                        ? "text-navy bg-navy-50 font-semibold"
                        : "text-warm-600 hover:text-navy hover:bg-navy-50"
                    }`}
                    style={{
                      transitionDelay: isMobileOpen ? `${100 + i * 50}ms` : "0ms",
                      opacity: isMobileOpen ? 1 : 0,
                      transform: isMobileOpen ? "translateX(0)" : "translateX(20px)",
                    }}
                  >
                    {isActive && (
                      <span className="inline-block w-1.5 h-1.5 bg-gold rounded-full mr-3" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile CTA */}
            <div
              className="mt-6 pt-6 border-t border-navy-100"
              style={{
                transitionDelay: isMobileOpen ? "400ms" : "0ms",
                opacity: isMobileOpen ? 1 : 0,
                transform: isMobileOpen ? "translateY(0)" : "translateY(16px)",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Link
                href="/contact"
                className="flex items-center justify-center w-full py-4 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-400 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                Prendre rendez-vous
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <div className="mt-6 text-center space-y-2">
                <a
                  href="tel:+68987747284"
                  className="block text-sm text-warm-500 hover:text-navy transition-colors"
                >
                  +689 87 747 284
                </a>
                <a
                  href="mailto:pacificblueconsulting@zoho.com"
                  className="block text-sm text-warm-500 hover:text-navy transition-colors"
                >
                  pacificblueconsulting@zoho.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
