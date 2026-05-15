"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTransition } from "react";

type LocaleSwitcherProps = {
  variant?: "light" | "dark";
};

export default function LocaleSwitcher({ variant = "dark" }: LocaleSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (nextLocale: "fr" | "en") => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  // variant=light => header is scrolled OR mobile menu open (dark text)
  // variant=dark  => header transparent over hero (light text)
  const baseClasses =
    variant === "light"
      ? "text-warm-500 hover:text-navy"
      : "text-white/70 hover:text-white";
  const activeClasses = variant === "light" ? "text-navy" : "text-white";

  return (
    <div
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em]"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("fr")}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "fr" ? activeClasses : baseClasses
        }`}
        aria-current={locale === "fr" ? "true" : undefined}
        aria-label="Français"
      >
        FR
      </button>
      <span className={variant === "light" ? "text-warm-300" : "text-white/30"}>
        /
      </span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={isPending}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "en" ? activeClasses : baseClasses
        }`}
        aria-current={locale === "en" ? "true" : undefined}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
