"use client";

import Link from "next/link";
import Image from "next/image";
import { useNavbar } from "./useNavbar";
import NavPill from "./NavPill";
import NavFullscreen from "./NavFullscreen";
import NavMobile from "./NavMobile";

export default function Navbar() {
  const {
    isScrolled,
    isVisible,
    activeDropdown,
    isFullscreenOpen,
    isMobileOpen,
    mobileAccordion,
    openDropdown,
    closeDropdown,
    cancelCloseDropdown,
    toggleFullscreen,
    toggleMobile,
    closeAll,
    toggleMobileAccordion,
  } = useNavbar();

  return (
    <>
      {/* Announcement bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-[99] transition-all duration-300 ${
          isScrolled ? "opacity-0 pointer-events-none -translate-y-full" : "opacity-100"
        }`}
      >
        <Link
          href="/offre-site-web"
          className="block bg-accent/10 border-b border-accent/20 text-center py-2 px-4 hover:bg-accent/15 transition-colors"
        >
          <p className="text-xs text-accent font-medium tracking-wide">
            Offre limitee : Site internet pro a partir de 100 000 XPF &rarr;
          </p>
        </Link>
      </div>

      {/* Desktop pill navbar */}
      <NavPill
        isScrolled={isScrolled}
        isVisible={isVisible}
        activeDropdown={activeDropdown}
        openDropdown={openDropdown}
        closeDropdown={closeDropdown}
        cancelCloseDropdown={cancelCloseDropdown}
        toggleFullscreen={toggleFullscreen}
        closeAll={closeAll}
      />

      {/* Mobile top bar */}
      <div
        className={`lg:hidden fixed left-0 right-0 z-[201] transition-all duration-300 ${
          isScrolled || isMobileOpen ? "bg-bg/95 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
        style={{ top: isScrolled || isMobileOpen ? 0 : "2.25rem" }}
      >
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2.5" onClick={closeAll}>
            <Image src="/logo-nav.png" alt="PACIFIK'AI" width={28} height={28} className="w-7 h-7" />
            <span className="font-display text-base tracking-wide">PACIFIK&apos;AI</span>
          </Link>

          <button
            onClick={toggleMobile}
            className="flex flex-col gap-1.5 p-2"
            aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMobileOpen}
          >
            <span
              className={`w-6 h-0.5 bg-text transition-transform duration-300 origin-center ${
                isMobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-text transition-opacity duration-300 ${
                isMobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-text transition-transform duration-300 origin-center ${
                isMobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fullscreen overlay (desktop) */}
      <NavFullscreen isOpen={isFullscreenOpen} onClose={toggleFullscreen} />

      {/* Mobile overlay */}
      <NavMobile
        isOpen={isMobileOpen}
        onClose={closeAll}
        accordion={mobileAccordion}
        onToggleAccordion={toggleMobileAccordion}
      />
    </>
  );
}
