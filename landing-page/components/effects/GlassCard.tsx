"use client";

import { useRef, useCallback } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  tilt = false,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cardRef.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      cardRef.current.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
      cardRef.current.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
    },
    [tilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (!tilt || !cardRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
  }, [tilt]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass glass-hover relative transition-transform duration-300 ${className}`}
      style={{ willChange: tilt ? "transform" : undefined }}
    >
      {/* Spotlight effect */}
      {tilt && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.06), transparent 40%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
