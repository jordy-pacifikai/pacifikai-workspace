"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  priority?: boolean;
  overlay?: boolean;
  overlayColor?: string;
  scaleOnScroll?: boolean;
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
  priority = false,
  overlay = false,
  overlayColor = "bg-black/30",
  scaleOnScroll = false,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let ctx: { revert: () => void } | null = null;

    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || !imageRef.current) return;

      ctx = gsap.context(() => {
        if (!containerRef.current || !imageRef.current) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        tl.to(imageRef.current, {
          yPercent: speed * 100,
          ease: "none",
        });

        if (scaleOnScroll) {
          tl.fromTo(
            imageRef.current,
            { scale: 1.15 },
            { scale: 1, ease: "none" },
            0
          );
        }
      }, containerRef);
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, [speed, scaleOnScroll]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={imageRef} className="relative w-full h-[130%] -mt-[15%] gpu">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority}
        />
      </div>
      {overlay && <div className={`absolute inset-0 ${overlayColor}`} />}
    </div>
  );
}
