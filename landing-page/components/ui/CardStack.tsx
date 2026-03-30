"use client";

import { useState, useEffect, useCallback } from "react";

interface CardStackProps {
  children: React.ReactNode[];
  interval?: number;
}

export default function CardStack({ children, interval = 2500 }: CardStackProps) {
  const [current, setCurrent] = useState(0);
  const n = children.length;

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % n);
  }, [n]);

  useEffect(() => {
    const id = setInterval(advance, interval);
    return () => clearInterval(id);
  }, [advance, interval]);

  const getClass = (i: number) => {
    if (i === current) return "cs-active";
    if (i === (current + 1) % n) return "cs-next";
    if (i === (current - 1 + n) % n) return "cs-prev";
    return "";
  };

  return (
    <div className="card-stack">
      {children.map((child, i) => (
        <div key={i} className={`card-stack-item cs-visual ${getClass(i)}`}>
          <div className="cs-mini-vis">{child}</div>
        </div>
      ))}
      {/* Dots */}
      <div className="cs-dots">
        {children.map((_, i) => (
          <button
            key={i}
            className={`cs-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
