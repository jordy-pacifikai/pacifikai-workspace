"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("stickyCta");

  // Hide on contact page
  const isContactPage = pathname === "/contact";

  useEffect(() => {
    if (isContactPage) return;

    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isContactPage]);

  if (isContactPage) return null;

  return (
    <div
      className={`sticky-cta-mobile md:hidden ${isVisible ? "is-visible" : ""}`}
      aria-hidden={!isVisible}
    >
      <Link
        href="/contact"
        className="flex items-center justify-center w-full py-3.5 bg-gold text-navy font-semibold rounded-xl text-sm"
        tabIndex={isVisible ? 0 : -1}
      >
        {t("label")}
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
    </div>
  );
}
