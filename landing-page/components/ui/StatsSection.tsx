"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 100, suffix: "%", label: "Code sur mesure" },
  { value: 24, suffix: "/7", label: "IA disponible non-stop" },
  { value: 8, suffix: "+", label: "Solutions digitales" },
  { value: 48, suffix: "h", label: "Premier livrable" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          if (triggered.current) return;
          triggered.current = true;
          gsap.to(
            { val: 0 },
            {
              val: value,
              duration: 2,
              ease: "power2.out",
              onUpdate: function () {
                setDisplay(Math.round(this.targets()[0].val));
              },
            }
          );
        },
      });
    });

    return () => ctx.revert();
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="section-padding border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-[clamp(2rem,5vw,3.5rem)] gradient-text-coral mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
