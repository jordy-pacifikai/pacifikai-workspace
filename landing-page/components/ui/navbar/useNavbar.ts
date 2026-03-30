"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const lastScrollY = useRef(0);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection — show/hide + glass effect
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);

      // Only hide/show after 300px to avoid jitter at top
      if (y > 300) {
        setIsVisible(y < lastScrollY.current || y < 100);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock for overlays — overflow hidden blocks page scroll,
  // but overlay itself keeps overflow-y:auto so its content scrolls
  useEffect(() => {
    if (isFullscreenOpen || isMobileOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isFullscreenOpen, isMobileOpen]);

  // Escape key closes everything
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setIsFullscreenOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Dropdown with debounce to allow cursor travel
  const openDropdown = useCallback((id: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(id);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  }, []);

  const cancelCloseDropdown = useCallback(() => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreenOpen((prev) => !prev);
    setActiveDropdown(null);
    setIsMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
    setIsFullscreenOpen(false);
    setActiveDropdown(null);
  }, []);

  const closeAll = useCallback(() => {
    setActiveDropdown(null);
    setIsFullscreenOpen(false);
    setIsMobileOpen(false);
    setMobileAccordion(null);
  }, []);

  const toggleMobileAccordion = useCallback((id: string) => {
    setMobileAccordion((prev) => (prev === id ? null : id));
  }, []);

  return {
    isScrolled,
    isVisible,
    activeDropdown,
    isFullscreenOpen,
    isMobileOpen,
    mobileAccordion,
    openDropdown,
    closeDropdown,
    cancelCloseDropdown,
    toggleFullscreen,
    toggleMobile,
    closeAll,
    toggleMobileAccordion,
  };
}
