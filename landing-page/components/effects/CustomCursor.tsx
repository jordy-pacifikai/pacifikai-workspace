"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide on touch devices
    if ("ontouchstart" in window) {
      cursor.style.display = "none";
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power3.out",
      });
    };

    const grow = () => gsap.to(cursor, { scale: 2.5, duration: 0.3 });
    const shrink = () => gsap.to(cursor, { scale: 1, duration: 0.3 });

    const hoverables = document.querySelectorAll("a, button, [data-cursor-hover]");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", grow);
        el.removeEventListener("mouseleave", shrink);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-5 h-5 rounded-full bg-white mix-blend-difference pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
    />
  );
}
