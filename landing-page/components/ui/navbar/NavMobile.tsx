"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { SOLUTIONS_DROPDOWN, EXPERTISE_DROPDOWN, TOP_LINKS } from "./navData";

interface NavMobileProps {
  isOpen: boolean;
  onClose: () => void;
  accordion: string | null;
  onToggleAccordion: (id: string) => void;
}

function AccordionSection({
  id,
  label,
  items,
  isExpanded,
  onToggle,
  onLinkClick,
}: {
  id: string;
  label: string;
  items: { label: string; href: string; color?: string }[];
  isExpanded: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isExpanded) {
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + "px";
    } else {
      contentRef.current.style.maxHeight = "0px";
    }
  }, [isExpanded]);

  return (
    <div>
      <button
        onClick={onToggle}
        className="nav-mobile-link w-full"
        aria-expanded={isExpanded}
      >
        <span>{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-400 ease-in-out"
        style={{ maxHeight: 0 }}
      >
        <div className="pb-3 pt-1 pl-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="block py-2.5 px-3 text-base text-text-secondary hover:text-text rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NavMobile({ isOpen, onClose, accordion, onToggleAccordion }: NavMobileProps) {
  const allSolutionItems = SOLUTIONS_DROPDOWN.groups.flatMap((g) => g.items);
  const allExpertiseItems = EXPERTISE_DROPDOWN.groups.flatMap((g) => g.items);

  return (
    <div
      className={`fixed inset-0 z-[200] bg-[#080c14] flex flex-col px-6 pt-[4.5rem] pb-6 overflow-y-auto transition-all duration-300 ease-out ${
        isOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-4"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex-1 space-y-0">
        {/* Solutions accordion */}
        <AccordionSection
          id="solutions"
          label="Solutions"
          items={allSolutionItems}
          isExpanded={accordion === "solutions"}
          onToggle={() => onToggleAccordion("solutions")}
          onLinkClick={onClose}
        />

        {/* Expertise accordion */}
        <AccordionSection
          id="expertise"
          label="Expertise"
          items={allExpertiseItems}
          isExpanded={accordion === "expertise"}
          onToggle={() => onToggleAccordion("expertise")}
          onLinkClick={onClose}
        />

        {/* Direct links */}
        {TOP_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={onClose} className="nav-mobile-link">
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Contact */}
        <Link href="/contact" onClick={onClose} className="nav-mobile-link">
          <span>Contact</span>
        </Link>
      </div>

      {/* Bottom CTA */}
      <div className="pt-6 mt-auto space-y-4">
        <Link
          href="/contact"
          onClick={onClose}
          className="block w-full py-3.5 rounded-full bg-accent text-bg text-center font-semibold text-base hover:bg-accent/90 transition-colors"
        >
          Discutons de votre projet
        </Link>
        <a
          href="mailto:contact@pacifikai.com"
          className="block text-center text-sm text-text-dim hover:text-text-secondary transition-colors"
        >
          contact@pacifikai.com
        </a>
      </div>
    </div>
  );
}
