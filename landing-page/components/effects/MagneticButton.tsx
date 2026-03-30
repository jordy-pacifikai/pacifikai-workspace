"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export default function MagneticButton({
  children,
  className = "",
  href,
  onClick,
  variant = "primary",
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handleMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power3.out" });
    };

    const handleLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };

    btn.addEventListener("mousemove", handleMove);
    btn.addEventListener("mouseleave", handleLeave);
    return () => {
      btn.removeEventListener("mousemove", handleMove);
      btn.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const baseStyles =
    "inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-sm tracking-wide transition-colors duration-200 cursor-pointer";
  const variants = {
    primary: "bg-accent text-bg hover:bg-accent/90",
    secondary: "border border-border-light text-text-secondary hover:text-text hover:border-accent/40",
  };

  const Tag = href ? "a" : "button";
  const props = href ? { href } : { onClick };

  return (
    <Tag
      ref={btnRef as React.RefObject<HTMLButtonElement & HTMLAnchorElement>}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
