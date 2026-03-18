"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lang } from "@/types";

interface NavbarProps {
  lang: Lang;
  toggleLang: () => void;
  t: {
    nav: {
      home: string;
      rooms: string;
      reservation: string;
      lodge: string;
      contact: string;
    };
  };
}

export default function Navbar({ lang, toggleLang, t }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/chambres", label: t.nav.rooms },
    { href: "/reservation", label: t.nav.reservation },
    { href: "/lodge", label: t.nav.lodge },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sunset-500 flex items-center justify-center">
              <span className="text-white font-serif text-lg font-bold">P</span>
            </div>
            <div>
              <span
                className={`font-serif text-xl font-bold tracking-wide ${
                  scrolled ? "text-sunset-500" : "text-white"
                }`}
              >
                Povai Lodge
              </span>
              <span
                className={`block text-[10px] tracking-[0.2em] uppercase ${
                  scrolled ? "text-deep-500" : "text-cream-300"
                }`}
              >
                Bora Bora
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-sunset-500 ${
                  scrolled ? "text-gray-700" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                scrolled
                  ? "border-sunset-500 text-sunset-500 hover:bg-sunset-500 hover:text-white"
                  : "border-white/50 text-white hover:bg-white/20"
              }`}
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>
            <Link
              href="/reservation"
              className="bg-sunset-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-sunset-600 transition-colors duration-200"
            >
              {t.nav.reservation}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="Menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${
                  scrolled ? "bg-gray-700" : "bg-white"
                } ${isOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${
                  scrolled ? "bg-gray-700" : "bg-white"
                } ${isOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-full transition-all duration-300 ${
                  scrolled ? "bg-gray-700" : "bg-white"
                } ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 px-4 text-gray-700 hover:text-sunset-500 hover:bg-sunset-50 rounded-lg transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-3 px-4">
            <button
              onClick={toggleLang}
              className="text-xs font-bold px-3 py-1.5 rounded-full border border-sunset-500 text-sunset-500"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>
            <Link
              href="/reservation"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-sunset-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold text-center"
            >
              {t.nav.reservation}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
