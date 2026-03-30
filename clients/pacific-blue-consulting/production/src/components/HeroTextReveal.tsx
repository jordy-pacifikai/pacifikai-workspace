"use client";

import { useEffect, useRef } from "react";

type HeroTextRevealProps = {
  text: string;
  highlightWord?: string;
  className?: string;
  delay?: number;
};

export default function HeroTextReveal({
  text,
  highlightWord,
  className = "",
  delay = 0.3,
}: HeroTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Show immediately
      el.querySelectorAll(".hero-char").forEach((char) => {
        (char as HTMLElement).style.opacity = "1";
        (char as HTMLElement).style.transform = "translateY(0)";
      });
      return;
    }

    const initAnimation = async () => {
      try {
        const gsapModule = await import("gsap");
        const gsap = gsapModule.default;

        const chars = el.querySelectorAll(".hero-char");

        gsap.to(chars, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.025,
          delay,
        });
      } catch {
        // Fallback: CSS animation
        const chars = el.querySelectorAll(".hero-char");
        chars.forEach((char, i) => {
          const htmlChar = char as HTMLElement;
          setTimeout(() => {
            htmlChar.style.opacity = "1";
            htmlChar.style.transform = "translateY(0)";
            htmlChar.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
          }, delay * 1000 + i * 30);
        });
      }
    };

    initAnimation();
  }, [delay]);

  // Split text into words and chars
  const words = text.split(" ");

  return (
    <h1 ref={containerRef} className={className}>
      {words.map((word, wordIndex) => {
        const isHighlight = word === highlightWord;
        return (
          <span key={wordIndex}>
            <span className="hero-word">
              {word.split("").map((char, charIndex) => (
                <span
                  key={`${wordIndex}-${charIndex}`}
                  className={`hero-char ${isHighlight ? "text-gold" : ""}`}
                >
                  {char}
                </span>
              ))}
            </span>
            {wordIndex < words.length - 1 && " "}
          </span>
        );
      })}
    </h1>
  );
}
