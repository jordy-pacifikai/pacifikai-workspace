"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * GSAP ScrollTrigger-powered scroll reveal.
 * Falls back to IntersectionObserver if GSAP fails to load.
 */
export function useScrollAnimation<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Immediately show all elements
      el.querySelectorAll(".gsap-reveal, .gsap-reveal-left, .gsap-reveal-right, .gsap-reveal-scale, .animate-on-scroll").forEach((element) => {
        (element as HTMLElement).style.opacity = "1";
        (element as HTMLElement).style.transform = "none";
      });
      return;
    }

    let cleanup: (() => void) | undefined;

    // Try GSAP first
    const initGSAP = async () => {
      try {
        const gsapModule = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        const gsap = gsapModule.default;

        gsap.registerPlugin(ScrollTrigger);

        const triggers: ScrollTrigger[] = [];

        // GSAP reveals
        el.querySelectorAll(".gsap-reveal").forEach((element) => {
          const trig = gsap.fromTo(
            element,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            }
          ).scrollTrigger;
          if (trig) triggers.push(trig);
        });

        el.querySelectorAll(".gsap-reveal-left").forEach((element) => {
          const trig = gsap.fromTo(
            element,
            { x: -40, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            }
          ).scrollTrigger;
          if (trig) triggers.push(trig);
        });

        el.querySelectorAll(".gsap-reveal-right").forEach((element) => {
          const trig = gsap.fromTo(
            element,
            { x: 40, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            }
          ).scrollTrigger;
          if (trig) triggers.push(trig);
        });

        el.querySelectorAll(".gsap-reveal-scale").forEach((element) => {
          const trig = gsap.fromTo(
            element,
            { scale: 0.92, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            }
          ).scrollTrigger;
          if (trig) triggers.push(trig);
        });

        // Stagger groups
        el.querySelectorAll("[data-stagger-parent]").forEach((parent) => {
          const children = parent.querySelectorAll("[data-stagger-child]");
          if (children.length === 0) return;

          gsap.fromTo(
            children,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
              scrollTrigger: {
                trigger: parent,
                start: "top 85%",
                once: true,
              },
            }
          );
        });

        // Also handle CSS .animate-on-scroll for backward compat
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
              }
            });
          },
          { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
        );
        el.querySelectorAll(".animate-on-scroll").forEach((element) => observer.observe(element));

        cleanup = () => {
          triggers.forEach((t) => t.kill());
          observer.disconnect();
        };
      } catch {
        // Fallback to IntersectionObserver only
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                (entry.target as HTMLElement).style.opacity = "1";
                (entry.target as HTMLElement).style.transform = "none";
              }
            });
          },
          { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
        );

        el.querySelectorAll(".gsap-reveal, .gsap-reveal-left, .gsap-reveal-right, .gsap-reveal-scale, .animate-on-scroll").forEach((element) => {
          observer.observe(element);
        });

        cleanup = () => observer.disconnect();
      }
    };

    initGSAP();

    return () => {
      cleanup?.();
    };
  }, []);

  return ref;
}

/**
 * Animated counter with requestAnimationFrame.
 * Easing: cubic ease-out for natural deceleration.
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  suffix: string = ""
) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.textContent = end + suffix;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateCount(el, end, duration, suffix);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, suffix]);

  return ref;
}

function animateCount(
  el: HTMLElement,
  end: number,
  duration: number,
  suffix: string
) {
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Cubic ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(end * eased);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Card spotlight effect — tracks mouse position on cards.
 */
export function useCardSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const cards = el.querySelectorAll<HTMLElement>(".card-spotlight");

    const handleMouseMove = (e: MouseEvent) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return ref;
}

/**
 * Parallax effect for hero section.
 */
export function useParallax<T extends HTMLElement>(speed: number = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          el.style.transform = `translateY(${scrolled * speed}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return ref;
}

/**
 * Magnetic button effect.
 */
export function useMagnetic<T extends HTMLElement>(strength: number = 0.3) {
  const ref = useRef<T>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return ref;
}
