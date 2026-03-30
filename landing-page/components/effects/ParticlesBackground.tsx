"use client";

/**
 * Lightweight CSS-only particle field.
 * Renders ~30 small dots that drift upward at varying speeds.
 * Fixed position, full viewport, sits behind all content (z-0).
 */
export default function ParticlesBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              bottom: `-${p.size}px`,
              background: p.color,
              opacity: p.opacity,
              animation: `particleRise ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes particleRise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--particle-opacity, 0.3);
          }
          90% {
            opacity: var(--particle-opacity, 0.3);
          }
          100% {
            transform: translateY(-110vh) translateX(var(--particle-drift, 20px));
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

/* Pre-computed particle configs for deterministic SSR */
const PARTICLES = Array.from({ length: 30 }, (_, i) => {
  const seed = i * 137.508; // golden angle spread
  const hash = (n: number) => ((Math.sin(n) * 10000) % 1 + 1) % 1; // deterministic pseudo-random

  const size = 1 + hash(seed) * 3; // 1-4px
  const left = `${(hash(seed + 1) * 100).toFixed(1)}%`;
  const duration = 15 + hash(seed + 2) * 25; // 15-40s
  const delay = hash(seed + 3) * 20; // 0-20s stagger
  const opacity = 0.1 + hash(seed + 4) * 0.3; // 0.1-0.4

  // Color: mix of accent coral, lagoon teal, and white
  const colors = [
    "rgba(249, 112, 102, 0.6)", // accent
    "rgba(20, 184, 166, 0.5)",  // lagoon
    "rgba(255, 255, 255, 0.3)", // neutral
  ];
  const color = colors[i % 3];

  return { size, left, duration, delay, opacity, color };
});
