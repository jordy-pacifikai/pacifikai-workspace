"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition, useState, useEffect, useRef } from "react";

type LocaleSwitcherProps = {
  variant?: "light" | "dark";
};

const LANGS = [
  { code: "fr" as const, label: "Français" },
  { code: "en" as const, label: "English" },
];

export default function LocaleSwitcher({ variant = "dark" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const switchTo = (nextLocale: "fr" | "en") => {
    setOpen(false);
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const triggerColor =
    variant === "light"
      ? "text-warm-500 hover:text-navy"
      : "text-white/60 hover:text-white";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium uppercase transition-colors ${triggerColor}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Language selector"
      >
        {/* Globe icon (Heroicons outline globe-alt minimal) */}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
        </svg>
        <span>{locale}</span>
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[120px] rounded-md bg-white border border-navy-100/40 shadow-lg shadow-navy/10 py-1 z-50 overflow-hidden"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              onClick={() => switchTo(l.code)}
              disabled={isPending}
              className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                locale === l.code
                  ? "text-navy font-semibold bg-navy-50/60"
                  : "text-warm-500 hover:text-navy hover:bg-navy-50/30"
              }`}
              aria-current={locale === l.code ? "true" : undefined}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
