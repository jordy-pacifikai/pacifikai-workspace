"use client";

const PROJECTS = [
  "Ve'a Reservations",
  "MANA Gov",
  "Reo Tahiti AI",
  "Tapiri Marketplace",
  "High Value Capital",
  "Studio Belleza",
  "SpiderClaw AI",
  "DroitPF",
  "Haute Valeur",
  "Armoni Trading",
];

export default function TrustBar() {
  // Double the array for seamless infinite scroll
  const items = [...PROJECTS, ...PROJECTS];

  return (
    <div className="py-10 overflow-hidden border-b border-border">
      <p className="text-center text-text-dim text-xs font-medium tracking-[0.2em] uppercase mb-6">
        Ils nous font confiance en Polynésie française
      </p>
      <div className="trust-scroll-wrapper">
        <div className="trust-scroll">
          {items.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-6 text-sm text-text-secondary whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
