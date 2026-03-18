"use client";

import { useEffect, useRef } from "react";

export function useScrollAnimation<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const children = el.querySelectorAll(".animate-on-scroll");
    children.forEach((child) => observer.observe(child));

    // Also observe the element itself if it has the class
    if (el.classList.contains("animate-on-scroll")) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useParallax() {
  useEffect(() => {
    const handleScroll = () => {
      const parallaxElements = document.querySelectorAll(".parallax-bg");
      parallaxElements.forEach((el) => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;
        (el as HTMLElement).style.transform = `translateY(${rate}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}
