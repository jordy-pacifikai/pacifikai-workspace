"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import LocaleSwitcher from "./LocaleSwitcher";

/* ===== Navigation data with dropdown submenus ===== */
type NavItem = {
  href: string;
  labelKey: string;
  children?: { href: string; labelKey: string; descKey?: string }[];
};

const navItems: NavItem[] = [
  { href: "/", labelKey: "home" },
  {
    href: "/offres",
    labelKey: "offres",
    children: [
      { href: "/offres#mobilites", labelKey: "mobilites", descKey: "mobilitesDesc" },
      { href: "/offres#infrastructures", labelKey: "infrastructures", descKey: "infrastructuresDesc" },
      { href: "/offres#environnement", labelKey: "environnement", descKey: "environnementDesc" },
      { href: "/offres#transformation", labelKey: "transformation", descKey: "transformationDesc" },
    ],
  },
  { href: "/realisations", labelKey: "realisations" },
  { href: "/le-cabinet", labelKey: "cabinet" },
  { href: "/perspectives", labelKey: "perspectives" },
];

/* ===== Dropdown Component ===== */
function DropdownMenu({
  item,
  isScrolled,
}: {
  item: NavItem;
  isScrolled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const t = useTranslations("header.nav");
  const tSub = useTranslations("header.offresSubmenu");
  const tPanel = useTranslations("header.megaPanel");
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? isScrolled ? "text-navy" : "text-white"
            : isScrolled
            ? "text-warm-500 hover:text-navy"
            : "text-white/70 hover:text-white"
        }`}
      >
        {t(item.labelKey)}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gold" />
        )}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={item.href}
        className={`relative flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? isScrolled ? "text-navy" : "text-white"
            : isScrolled
            ? "text-warm-500 hover:text-navy"
            : "text-white/70 hover:text-white"
        }`}
      >
        {t(item.labelKey)}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-gold" />
        )}
      </Link>

      {/* Mega-menu panel */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 w-[min(92vw,820px)] pt-3 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-elevation-3 border border-navy-100/40 overflow-hidden">
          <div className="flex">
            {/* Left panel — section intro */}
            <div className="w-64 shrink-0 bg-navy p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  {t(item.labelKey)}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-white leading-snug">
                  {tPanel("offresHeadline")}
                </h3>
                <p className="mt-3 text-xs text-white/50 leading-relaxed">
                  {tPanel("offresIntro")}
                </p>
              </div>
              <Link
                href={item.href}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tPanel("seeAll")}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right panel — links grid */}
            <div className="flex-1 p-5">
              <div className={`grid gap-x-4 gap-y-1 ${item.children.length > 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-navy-50/60 transition-colors duration-150 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gold/40 group-hover:bg-gold shrink-0 transition-colors" />
                    <div>
                      <span className="text-sm font-medium text-navy group-hover:text-gold transition-colors">
                        {tSub(child.labelKey)}
                      </span>
                      {child.descKey && (
                        <span className="block text-[11px] text-warm/70 mt-0.5 leading-relaxed">
                          {tSub(child.descKey)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Main Header ===== */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const t = useTranslations("header");
  const tNav = useTranslations("header.nav");
  const tSub = useTranslations("header.offresSubmenu");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
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
    setMobileExpanded(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
              isScrolled ? "h-20" : "h-24 lg:h-28"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <Image
                src="/images/logo-pbc-transparent.png"
                alt="Pacific Blue Consulting"
                width={88}
                height={54}
                className={`drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-all duration-300 ${
                  isScrolled ? "w-16 h-auto" : "w-20 h-auto"
                }`}
              />
              <span
                className={`hidden sm:block font-display font-bold tracking-wide transition-all duration-300 ${
                  isScrolled ? "text-navy text-base" : "text-white text-lg lg:text-xl"
                }`}
              >
                Pacific Blue Consulting
              </span>
            </Link>

            {/* Desktop Nav with Dropdowns */}
            <nav className="hidden lg:flex items-center gap-1" aria-label={t("ariaNav")}>
              {navItems.map((item) => (
                <DropdownMenu key={item.href} item={item} isScrolled={isScrolled} />
              ))}

              {/* Locale Switcher */}
              <div className="ml-2">
                <LocaleSwitcher variant={isScrolled ? "light" : "dark"} />
              </div>

              {/* CTA Button */}
              <Link
                href="/contact"
                className={`ml-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isScrolled
                    ? "bg-navy text-white hover:bg-navy-600"
                    : "bg-gold text-navy hover:bg-gold-400"
                }`}
              >
                {t("ctaContact")}
              </Link>
            </nav>

            {/* Mobile area: locale + toggle */}
            <div className="lg:hidden flex items-center gap-2 relative z-10">
              <LocaleSwitcher variant={isScrolled || isMobileOpen ? "light" : "dark"} />
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-gold"
                aria-label={isMobileOpen ? t("closeMenu") : t("openMenu")}
                aria-expanded={isMobileOpen}
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${
                      isMobileOpen
                        ? "rotate-45 translate-y-[9px] bg-navy"
                        : isScrolled ? "bg-navy" : "bg-white"
                    }`}
                  />
                  <span
                    className={`block h-0.5 rounded-full transition-all duration-300 ${
                      isMobileOpen
                        ? "opacity-0 scale-x-0"
                        : isScrolled ? "bg-navy" : "bg-white"
                    }`}
                  />
                  <span
                    className={`block h-0.5 rounded-full transition-all duration-300 origin-center ${
                      isMobileOpen
                        ? "-rotate-45 -translate-y-[9px] bg-navy"
                        : isScrolled ? "bg-navy" : "bg-white"
                    }`}
                  />
                </div>
              </button>
            </div>
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
          <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navItems.map((item, i) => {
                const isActive = pathname === item.href;
                const hasChildren = !!item.children;
                const isExpanded = mobileExpanded === item.href;

                return (
                  <div key={item.href}>
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        className={`flex-1 block px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                          isActive
                            ? "text-navy bg-navy-50 font-semibold"
                            : "text-warm-600 hover:text-navy hover:bg-navy-50"
                        }`}
                        style={{
                          transitionDelay: isMobileOpen ? `${100 + i * 50}ms` : "0ms",
                          opacity: isMobileOpen ? 1 : 0,
                          transform: isMobileOpen ? "translateX(0)" : "translateX(20px)",
                        }}
                        onClick={() => !hasChildren && setIsMobileOpen(false)}
                      >
                        {isActive && (
                          <span className="inline-block w-1.5 h-1.5 bg-gold rounded-full mr-3" />
                        )}
                        {tNav(item.labelKey)}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => setMobileExpanded(isExpanded ? null : item.href)}
                          aria-label={t("toggleSubmenu")}
                          aria-expanded={isExpanded}
                          className="p-3 min-w-11 min-h-11 flex items-center justify-center text-warm-500"
                          style={{
                            transitionDelay: isMobileOpen ? `${100 + i * 50}ms` : "0ms",
                            opacity: isMobileOpen ? 1 : 0,
                          }}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Mobile sub-items */}
                    {hasChildren && isExpanded && (
                      <div className="ml-6 mb-2 space-y-0.5">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-warm-500 hover:text-navy hover:bg-navy-50/50 rounded-lg transition-colors"
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {tSub(child.labelKey)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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
                {t("ctaContact")}
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <div className="mt-6 text-center space-y-2">
                <a href="tel:+68987747284" className="block text-sm text-warm-500 hover:text-navy transition-colors">
                  +689 87 747 284
                </a>
                <a href="mailto:contact@pacificblueconsulting.org" className="block text-sm text-warm-500 hover:text-navy transition-colors">
                  contact@pacificblueconsulting.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
