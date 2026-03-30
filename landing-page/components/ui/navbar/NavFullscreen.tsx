"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { SOLUTIONS_DROPDOWN, EXPERTISE_DROPDOWN, TOP_LINKS } from "./navData";

interface NavFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
}

function FSAccordion({
  label,
  items,
  index,
  isExpanded,
  onToggle,
  onLinkClick,
}: {
  label: string;
  items: { label: string; href: string }[];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isExpanded) {
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + "px";
      // Scroll the title into view after expand
      setTimeout(() => {
        buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      contentRef.current.style.maxHeight = "0px";
    }
  }, [isExpanded]);

  return (
    <div className="fs-link">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="group w-full flex items-center gap-6 py-3"
        aria-expanded={isExpanded}
      >
        <span className="fs-link-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="group-hover:text-accent transition-colors duration-300 flex-1 text-left">
          {label}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`w-5 h-5 text-text-dim transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-400 ease-in-out"
        style={{ maxHeight: 0 }}
      >
        <div className="pl-14 pb-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="block py-2 text-base text-text-secondary hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NavFullscreen({ isOpen, onClose }: NavFullscreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!overlayRef.current) return;

    if (isOpen) {
      hasAnimated.current = true;
      overlayRef.current.style.pointerEvents = "all";
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.05,
      });

      tl.fromTo(
        overlayRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.75,
          ease: "cubic-bezier(0.76, 0, 0.24, 1)",
        }
      );

      if (linksRef.current) {
        const links = linksRef.current.querySelectorAll(".fs-link");
        tl.from(
          links,
          {
            opacity: 0,
            y: 50,
            stagger: 0.08,
            duration: 0.6,
            ease: "cubic-bezier(0.76, 0, 0.24, 1)",
          },
          "-=0.4"
        );
      }

      if (bottomRef.current) {
        tl.from(
          bottomRef.current,
          { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" },
          "-=0.3"
        );
      }
    } else if (hasAnimated.current) {
      setExpanded(null);
      const tl = gsap.timeline();

      if (linksRef.current) {
        tl.to(linksRef.current.querySelectorAll(".fs-link"), {
          opacity: 0,
          y: -20,
          stagger: 0.04,
          duration: 0.3,
          ease: "power2.in",
        });
      }

      tl.to(overlayRef.current, {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.5,
        ease: "cubic-bezier(0.76, 0, 0.24, 1)",
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.pointerEvents = "none";
            gsap.set(overlayRef.current, { opacity: 0, clipPath: "inset(0 0 100% 0)" });
          }
        },
      });
    }
  }, [isOpen]);

  const allSolutionItems = SOLUTIONS_DROPDOWN.groups.flatMap((g) => g.items);
  const allExpertiseItems = EXPERTISE_DROPDOWN.groups.flatMap((g) => g.items);

  let linkIndex = 0;

  return (
    <div
      ref={overlayRef}
      className="nav-fullscreen"
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal={isOpen}
      aria-label="Menu principal"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 z-10 w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:border-white/20 transition-colors"
        aria-label="Fermer le menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-text">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Links */}
      <div ref={linksRef} className="flex-1 flex flex-col justify-center max-w-4xl px-8 md:px-16">
        {/* Solutions accordion */}
        <FSAccordion
          label="Solutions"
          items={allSolutionItems}
          index={linkIndex++}
          isExpanded={expanded === "solutions"}
          onToggle={() => toggleAccordion("solutions")}
          onLinkClick={onClose}
        />

        {/* Expertise accordion */}
        <FSAccordion
          label="Expertise"
          items={allExpertiseItems}
          index={linkIndex++}
          isExpanded={expanded === "expertise"}
          onToggle={() => toggleAccordion("expertise")}
          onLinkClick={onClose}
        />

        {/* Direct links */}
        {TOP_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="fs-link group"
          >
            <span className="fs-link-num">{String(++linkIndex).padStart(2, "0")}</span>
            <span className="group-hover:text-accent transition-colors duration-300">
              {link.label}
            </span>
          </Link>
        ))}

        {/* Contact */}
        <Link
          href="/contact"
          onClick={onClose}
          className="fs-link group"
        >
          <span className="fs-link-num">{String(++linkIndex).padStart(2, "0")}</span>
          <span className="group-hover:text-accent transition-colors duration-300">
            Contact
          </span>
        </Link>
      </div>

      {/* Bottom bar */}
      <div ref={bottomRef} className="flex items-center justify-between pt-8 border-t border-white/6 px-8 md:px-16">
        <a
          href="mailto:contact@pacifikai.com"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          contact@pacifikai.com
        </a>
        <span className="text-xs text-text-dim">
          Papeete, Tahiti — Polynesie francaise
        </span>
      </div>
    </div>
  );
}
