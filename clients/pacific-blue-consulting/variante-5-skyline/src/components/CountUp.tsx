"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
}

export function CountUp({
  end,
  suffix = "",
  prefix = "",
  label,
  duration = 2,
}: CountUpProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || !numRef.current || !containerRef.current) {
      if (numRef.current) {
        numRef.current.textContent = `${prefix}${end}${suffix}`;
      }
      return;
    }

    const obj = { val: 0 };

    gsap.to(obj, {
      val: end,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        once: true,
      },
      onUpdate: () => {
        if (numRef.current) {
          numRef.current.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
        }
      },
    });
  }, [end, suffix, prefix, duration]);

  return (
    <div ref={containerRef} className="text-center">
      <span
        ref={numRef}
        className="font-display font-extrabold text-white block"
        style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
      >
        {prefix}0{suffix}
      </span>
      <span className="text-blue-200 text-sm font-medium uppercase tracking-wider mt-2 block">
        {label}
      </span>
    </div>
  );
}
