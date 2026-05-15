import { defineRouting } from "next-intl/routing";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // FR has no prefix ("/"), EN has prefix ("/en")
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
