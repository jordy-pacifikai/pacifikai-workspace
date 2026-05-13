"use client";

import { createContext, useContext, ReactNode } from "react";

export type Locale = "fr" | "ty";

const LocaleContext = createContext<Locale>("fr");

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
