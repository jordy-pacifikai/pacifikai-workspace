"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface RotatingTextProps {
  prefix: string;
  words: string[];
  className?: string;
  interval?: number;
}

export default function RotatingText({
  prefix,
  words,
  className = "",
  interval = 3000,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const wordRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Initial entrance animation
    if (!hasAnimated.current && wordRef.current) {
      gsap.fromTo(
        wordRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.6 }
      );
      hasAnimated.current = true;
    }

    const id = setInterval(() => {
      if (!wordRef.current) return;
      // Animate out
      gsap.to(wordRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setIndex((prev) => (prev + 1) % words.length);
          // Animate in
          if (wordRef.current) {
            gsap.fromTo(
              wordRef.current,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
            );
          }
        },
      });
    }, interval);

    return () => clearInterval(id);
  }, [words, interval]);

  return (
    <h1 className={className}>
      {prefix}{" "}
      <span
        ref={wordRef}
        className="inline-block gradient-text-coral pb-1"
      >
        {words[index]}
      </span>
    </h1>
  );
}
