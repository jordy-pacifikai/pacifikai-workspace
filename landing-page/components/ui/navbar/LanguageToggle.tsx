"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();

  const isTy = locale === "ty";
  const targetHref = isTy ? "/" : "/ty";
  const targetLabel = isTy ? "FR" : "TY";

  return (
    <Link
      href={targetHref}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 hover:border-white/25 text-[11px] font-medium tracking-wider uppercase text-text-secondary hover:text-text transition-all duration-200"
      title={isTy ? "Version française" : "Version tahitienne"}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isTy ? "bg-lagoon" : "bg-accent"
        }`}
      />
      {targetLabel}
    </Link>
  );
}
