"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface CharRevealProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export default function CharReveal({
  children,
  className = "",
  delay = 0.3,
  as: Tag = "h1",
}: CharRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll(".char");
    const ctx = gsap.context(() => {
      gsap.from(chars, {
        y: 80,
        opacity: 0,
        rotateX: -90,
        stagger: 0.025,
        duration: 1,
        ease: "power3.out",
        delay,
      });
    });

    return () => ctx.revert();
  }, [delay]);

  // Split text into words, then chars
  const words = children.split(" ");

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={`${className} overflow-hidden`}
      style={{ perspective: "1000px" }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((char, ci) => (
            <span
              key={ci}
              className="char inline-block"
              style={{ transformOrigin: "bottom center" }}
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
