"use client";

import { useEffect, useRef } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none" | "scale" | "clip";
  duration?: number;
  distance?: number;
  stagger?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 1.2,
  distance = 80,
  stagger,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let ctx: { revert: () => void } | null = null;

    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!ref.current) return;

      ctx = gsap.context(() => {
        if (!ref.current) return;

        if (direction === "clip") {
          gsap.fromTo(
            ref.current,
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: duration * 1.2,
              delay,
              ease: "power4.inOut",
              scrollTrigger: {
                trigger: ref.current,
                start: "top 88%",
                once: true,
              },
            }
          );
          return;
        }

        if (direction === "scale") {
          gsap.from(ref.current, {
            scale: 1.15,
            opacity: 0,
            duration,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              once: true,
            },
          });
          return;
        }

        const from: Record<string, number | string> = {
          opacity: 0,
          duration,
          delay,
          ease: "power3.out",
        };

        if (direction === "up") from.y = distance;
        if (direction === "left") from.x = -distance;
        if (direction === "right") from.x = distance;

        if (stagger) {
          gsap.from(ref.current.children, {
            ...from,
            stagger,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              once: true,
            },
          });
        } else {
          gsap.from(ref.current, {
            ...from,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              once: true,
            },
          });
        }
      }, ref);
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, [delay, direction, duration, distance, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
