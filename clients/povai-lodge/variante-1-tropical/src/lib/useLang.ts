"use client";

import { useState, useEffect, useCallback } from "react";
import { Lang } from "@/types";
import { translations } from "./data";

export function useLang() {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("povai-lang") as Lang | null;
    if (saved && (saved === "fr" || saved === "en")) {
      setLang(saved);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "fr" ? "en" : "fr";
      localStorage.setItem("povai-lang", next);
      return next;
    });
  }, []);

  const t = translations[lang];

  return { lang, toggleLang, t };
}
