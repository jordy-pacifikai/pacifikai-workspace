"use client";

import { useEffect, useRef } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const initLenis = async () => {
      try {
        const Lenis = (await import("@studio-freight/lenis")).default;

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
        });

        lenisRef.current = lenis;

        // Sync with GSAP ScrollTrigger
        try {
          const gsapModule = await import("gsap");
          const { ScrollTrigger } = await import("gsap/ScrollTrigger");
          const gsap = gsapModule.default;
          gsap.registerPlugin(ScrollTrigger);

          lenis.on("scroll", ScrollTrigger.update);

          gsap.ticker.add((time: number) => {
            lenis.raf(time * 1000);
          });
          gsap.ticker.lagSmoothing(0);
        } catch {
          // GSAP not available, use rAF directly
          const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        }
      } catch {
        // Lenis not available, smooth scroll via CSS
      }
    };

    initLenis();

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  return <>{children}</>;
}
