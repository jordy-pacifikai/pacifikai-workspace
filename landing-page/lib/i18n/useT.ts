"use client";

import { useLocale } from "./context";
import { ty } from "./ty";

type Section = keyof typeof ty;

/**
 * Returns the Tahitian translations for a section when locale is "ty",
 * or undefined when locale is "fr" (components fall back to hardcoded French).
 */
export function useT<S extends Section>(section: S): (typeof ty)[S] | null {
  const locale = useLocale();
  if (locale === "ty") return ty[section];
  return null;
}
