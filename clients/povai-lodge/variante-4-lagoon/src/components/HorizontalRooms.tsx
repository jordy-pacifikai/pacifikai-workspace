"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { rooms, formatXPF } from "@/lib/data";

export default function HorizontalRooms() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cards = container.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveIndex(index);
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollPosition = container.scrollLeft + container.clientWidth / 2;
    const cards = Array.from(container.children) as HTMLElement[];
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(scrollPosition - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  // Mouse drag for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="relative">
      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="horizontal-scroll flex gap-5 md:gap-8 px-[8vw] md:px-[12vw] py-4 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {rooms.map((room, i) => (
          <div
            key={room.id}
            className="flex-shrink-0 w-[82vw] md:w-[65vw] lg:w-[55vw] relative overflow-hidden group"
            style={{
              aspectRatio: "16/10",
              borderRadius: "20px",
            }}
          >
            {/* Image with hover scale */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "20px" }}>
              <Image
                src={room.image}
                alt={room.name}
                fill
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]"
                style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
                sizes="(max-width: 768px) 82vw, 55vw"
                priority={i === 0}
              />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-700 group-hover:opacity-90" style={{ borderRadius: "20px" }} />

            {/* Price badge top-right */}
            <div className="absolute top-6 right-6 z-10">
              <div className="bg-gold/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-xs font-sans tracking-wide">
                  {formatXPF(room.priceNight)} <span className="text-white/70">/ nuit</span>
                </span>
              </div>
            </div>

            {/* Content bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
              <p className="text-gold-light text-[10px] uppercase tracking-[0.2em] mb-3 font-sans opacity-80">
                {room.subtitle}
              </p>
              <h3
                className="font-serif text-white font-light mb-4"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {room.name}
              </h3>
              <p className="text-white/50 text-sm mb-6 max-w-md font-sans leading-relaxed line-clamp-2">
                {room.description}
              </p>

              {/* CTA that slides up on hover */}
              <div className="overflow-hidden">
                <Link
                  href={`/chambres#${room.id}`}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-[11px] uppercase tracking-[0.15em] font-sans hover:bg-white hover:text-ink transition-all duration-500 transform translate-y-0 group-hover:translate-y-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  Decouvrir
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
        className={`hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 items-center justify-center text-white/70 hover:bg-white hover:text-ink hover:border-white transition-all duration-500 ${
          activeIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        aria-label="Chambre precedente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => scrollToIndex(Math.min(rooms.length - 1, activeIndex + 1))}
        className={`hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 items-center justify-center text-white/70 hover:bg-white hover:text-ink hover:border-white transition-all duration-500 ${
          activeIndex === rooms.length - 1
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        }`}
        aria-label="Chambre suivante"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-3 mt-10">
        {rooms.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`h-[3px] rounded-full transition-all duration-700 ${
              i === activeIndex
                ? "bg-lagoon w-10"
                : "bg-white/20 w-3 hover:bg-white/40"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
            aria-label={`Voir ${rooms[i].name}`}
          />
        ))}
      </div>
    </div>
  );
}
