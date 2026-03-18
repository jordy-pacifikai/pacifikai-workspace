"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const [visible, setVisible] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galerie photo"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 lightbox-overlay" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
        aria-label="Fermer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-10 z-20 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
        aria-label="Photo precedente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Image */}
      <div
        className={`relative w-[88vw] h-[75vh] max-w-6xl z-10 transition-transform duration-400 ${
          visible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex]}
          alt={`Photo ${currentIndex + 1}`}
          fill
          className="object-contain"
          sizes="88vw"
          priority
          style={{ borderRadius: "8px" }}
        />
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-10 z-20 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
        aria-label="Photo suivante"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/30 text-[11px] font-sans tracking-[0.15em]">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
