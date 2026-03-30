"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { NavDropdownData } from "./navData";

const ICON_MAP: Record<string, React.ReactNode> = {
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  app: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  ),
};

const COLOR_MAP: Record<string, string> = {
  accent: "bg-accent/10 text-accent",
  lagoon: "bg-lagoon/10 text-lagoon",
  gold: "bg-gold/10 text-gold",
  purple: "bg-purple/10 text-purple",
  indigo: "bg-indigo/10 text-indigo",
  emerald: "bg-emerald/10 text-emerald",
  orange: "bg-orange/10 text-orange",
};

const DOT_COLOR_MAP: Record<string, string> = {
  accent: "bg-accent",
  lagoon: "bg-lagoon",
  gold: "bg-gold",
  purple: "bg-purple",
  indigo: "bg-indigo",
  emerald: "bg-emerald",
  orange: "bg-orange",
};

interface NavDropdownProps {
  data: NavDropdownData;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLinkClick: () => void;
}

export default function NavDropdown({ data, isOpen, onMouseEnter, onMouseLeave, onLinkClick }: NavDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (isOpen) {
      ref.current.style.pointerEvents = "auto";
      gsap.to(ref.current, {
        clipPath: "inset(0 0 0% 0)",
        opacity: 1,
        duration: 0.4,
        ease: "cubic-bezier(0.76, 0, 0.24, 1)",
      });
      if (itemsRef.current) {
        gsap.from(itemsRef.current.querySelectorAll(".dd-item"), {
          y: 12,
          opacity: 0,
          stagger: 0.035,
          duration: 0.3,
          ease: "power2.out",
          delay: 0.1,
        });
      }
    } else {
      ref.current.style.pointerEvents = "none";
      gsap.to(ref.current, {
        clipPath: "inset(0 0 100% 0)",
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  const isSingleColumn = data.groups.length === 1;

  return (
    <div
      ref={ref}
      className="nav-dropdown"
      style={{ clipPath: "inset(0 0 100% 0)", minWidth: isSingleColumn ? "320px" : "560px" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="nav-dropdown-inner">
        <div ref={itemsRef} className={`grid gap-4 ${isSingleColumn ? "grid-cols-1" : "grid-cols-2"}`}>
          {data.groups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-dim mb-2 px-3">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className="dd-item"
                  >
                    <div className={`dd-item-icon ${COLOR_MAP[item.color || "accent"]}`}>
                      {ICON_MAP[item.icon || "globe"]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.color && (
                          <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR_MAP[item.color]}`} />
                        )}
                        <span className="text-sm font-medium text-text">{item.label}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-text-dim mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
