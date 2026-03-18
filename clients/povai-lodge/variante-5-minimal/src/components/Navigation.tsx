"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/chambres", label: "Chambres" },
  { href: "/le-lodge", label: "Le Lodge" },
  { href: "/contact", label: "Contact" },
  { href: "/reservation", label: "Réserver" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-500 ${
          scrolled ? "py-4 bg-white/90 backdrop-blur-sm" : "py-6 bg-transparent"
        }`}
      >
        <Link
          href="/"
          className="font-serif text-sm tracking-wider text-ink uppercase"
        >
          Povai Lodge
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="relative z-50 w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span
            className={`block w-6 h-px bg-ink transition-all duration-300 ${
              open ? "rotate-45 translate-y-[3.5px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-ink transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-[3.5px]" : ""
            }`}
          />
        </button>
      </header>

      {/* Fullscreen overlay menu */}
      <div
        className={`fixed inset-0 z-40 bg-white flex items-center justify-center transition-opacity duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-8">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`font-serif text-3xl md:text-5xl font-light tracking-wide text-ink hover:text-sand transition-colors duration-300 ${
                open
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: open ? `${150 + i * 80}ms` : "0ms",
                transitionProperty: "opacity, transform, color",
                transitionDuration: "600ms",
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
