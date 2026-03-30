"use client";

import Link from "next/link";
import Image from "next/image";
import { SOLUTIONS_DROPDOWN, EXPERTISE_DROPDOWN, TOP_LINKS } from "./navData";
import NavDropdown from "./NavDropdown";

interface NavPillProps {
  isScrolled: boolean;
  isVisible: boolean;
  activeDropdown: string | null;
  openDropdown: (id: string) => void;
  closeDropdown: () => void;
  cancelCloseDropdown: () => void;
  toggleFullscreen: () => void;
  closeAll: () => void;
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 ml-0.5 opacity-50">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function NavPill({
  isScrolled,
  isVisible,
  activeDropdown,
  openDropdown,
  closeDropdown,
  cancelCloseDropdown,
  toggleFullscreen,
  closeAll,
}: NavPillProps) {
  return (
    <div
      className={`nav-pill hidden lg:flex ${isScrolled ? "nav-pill--scrolled" : ""} ${
        !isVisible ? "nav-pill--hidden" : ""
      }`}
      style={{
        transition: "padding 0.3s cubic-bezier(0.76,0,0.24,1), background 0.3s cubic-bezier(0.76,0,0.24,1), transform 0.4s cubic-bezier(0.76,0,0.24,1), opacity 0.3s",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-3" onClick={closeAll}>
        <Image src="/logo-nav.png" alt="PACIFIK'AI" width={26} height={26} className="w-[26px] h-[26px]" />
        <span className="font-display text-sm tracking-wide text-text">PACIFIK&apos;AI</span>
      </Link>

      {/* Solutions dropdown trigger */}
      <div
        className="relative"
        onMouseEnter={() => openDropdown("solutions")}
        onMouseLeave={closeDropdown}
      >
        <button className="nav-link inline-flex items-center">
          Solutions <ChevronDown />
        </button>
        <NavDropdown
          data={SOLUTIONS_DROPDOWN}
          isOpen={activeDropdown === "solutions"}
          onMouseEnter={cancelCloseDropdown}
          onMouseLeave={closeDropdown}
          onLinkClick={closeAll}
        />
      </div>

      {/* Expertise dropdown trigger */}
      <div
        className="relative"
        onMouseEnter={() => openDropdown("expertise")}
        onMouseLeave={closeDropdown}
      >
        <button className="nav-link inline-flex items-center">
          Expertise <ChevronDown />
        </button>
        <NavDropdown
          data={EXPERTISE_DROPDOWN}
          isOpen={activeDropdown === "expertise"}
          onMouseEnter={cancelCloseDropdown}
          onMouseLeave={closeDropdown}
          onLinkClick={closeAll}
        />
      </div>

      {/* Direct links */}
      {TOP_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="nav-link" onClick={closeAll}>
          {link.label}
        </Link>
      ))}

      {/* CTA */}
      <Link
        href="/contact"
        className="ml-1 text-xs px-4 py-1.5 rounded-full bg-accent text-bg font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap"
        onClick={closeAll}
      >
        Discutons
      </Link>

      {/* Menu button for fullscreen overlay */}
      <button
        onClick={toggleFullscreen}
        className="ml-1.5 px-2.5 py-1.5 rounded-full border border-white/8 hover:border-white/15 transition-colors"
        aria-label="Ouvrir le menu complet"
      >
        <svg viewBox="0 0 18 12" fill="none" className="w-4 h-3">
          <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary" />
          <line x1="4" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary" />
          <line x1="8" y1="11" x2="18" y2="11" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary" />
        </svg>
      </button>
    </div>
  );
}
