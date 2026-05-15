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

  // Subtile: inactive = faible opacité, active = pleine. Pas de padding/background.
  const inactiveClasses =
    variant === "light"
      ? "text-warm-400/60 hover:text-navy"
      : "text-white/40 hover:text-white";
  const activeClasses =
    variant === "light" ? "text-navy" : "text-white";

  return (
    <div
      className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("fr")}
        disabled={isPending}
        className={`transition-colors ${
          locale === "fr" ? activeClasses : inactiveClasses
        }`}
        aria-current={locale === "fr" ? "true" : undefined}
        aria-label="Français"
      >
        FR
      </button>
      <span className={variant === "light" ? "text-warm-300/50" : "text-white/20"}>
        /
      </span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={isPending}
        className={`transition-colors ${
          locale === "en" ? activeClasses : inactiveClasses
        }`}
        aria-current={locale === "en" ? "true" : undefined}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
