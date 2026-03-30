"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PortfolioSite {
  id: number;
  name: string;
  description: string;
  tags: string[];
  url: string;
}

const SITES: PortfolioSite[] = [
  {
    id: 1,
    name: "Maeva Table",
    description: "Restaurant gastronomique — Papeete",
    tags: ["Gastronomie", "Parallax", "Dark Luxe"],
    url: "/portfolio/new/maeva-table.html",
  },
  {
    id: 2,
    name: "Fare Nui Immo",
    description: "Agence immobilière",
    tags: ["Immobilier", "Bento Grid", "3D Tilt"],
    url: "/portfolio/new/fare-nui-immo.html",
  },
  {
    id: 3,
    name: "Motu Fitness",
    description: "Salle de sport & coaching",
    tags: ["Fitness", "Neon", "Counters"],
    url: "/portfolio/new/motu-fitness.html",
  },
  {
    id: 4,
    name: "Te Honu Surf",
    description: "École de surf — Papara",
    tags: ["Surf", "Wave Anim", "Outdoor"],
    url: "/portfolio/new/te-honu-surf.html",
  },
  {
    id: 5,
    name: "Aito Digital",
    description: "Startup SaaS tech",
    tags: ["SaaS", "Gradient Mesh", "Glass"],
    url: "/portfolio/new/aito-digital.html",
  },
  {
    id: 6,
    name: "Tiare Glow",
    description: "Salon beauté & spa",
    tags: ["Spa", "Breathing", "Feminine"],
    url: "/portfolio/new/tiare-glow.html",
  },
  {
    id: 7,
    name: "Ora Vanille",
    description: "Artisan producteur — Taha'a",
    tags: ["Artisan", "Ken Burns", "Terroir"],
    url: "/portfolio/new/ora-vanille.html",
  },
  {
    id: 8,
    name: "Mana Dental",
    description: "Cabinet dentaire moderne",
    tags: ["Médical", "Trust", "Clean"],
    url: "/portfolio/new/mana-dental.html",
  },
  {
    id: 9,
    name: "Arana Conseil",
    description: "Conseil stratégique",
    tags: ["Conseil", "Corporate", "Authority"],
    url: "/portfolio/new/pacific-blue-consulting.html",
  },
  {
    id: 10,
    name: "Motu Rêve Lodge",
    description: "Lodge — Bora Bora",
    tags: ["Lodge", "Tropical", "Parallax"],
    url: "/portfolio/new/povai-lodge.html",
  },
];

// Returns data-pos relative to active index: -2, -1, 0, 1, 2, or "hidden"
function getPos(index: number, active: number, total: number): string {
  let diff = index - active;
  // Wrap around
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  if (diff < -2 || diff > 2) return "hidden";
  return String(diff);
}

export default function PortfolioCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SITES.length;

  const prev = useCallback(() => {
    setActive((a) => (a - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActive((a) => (a + 1) % total);
  }, [total]);

  // Auto-play every 4 seconds
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const activeSite = SITES[active];

  return (
    <div className="portfolio-carousel-root" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Stage */}
      <div className="pc-stage">
        {SITES.map((site, i) => {
          const pos = getPos(i, active, total);
          return (
            <div
              key={site.id}
              className="pc-card"
              data-pos={pos}
              aria-hidden={pos === "hidden"}
            >
              {/* Browser chrome */}
              <div className="pc-chrome">
                <div className="pc-chrome-dots">
                  <span className="pc-dot-red" />
                  <span className="pc-dot-yellow" />
                  <span className="pc-dot-green" />
                </div>
                <div className="pc-chrome-url">
                  <span className="pc-lock">🔒</span>
                  <span className="pc-url-text">pacifikai.com{site.url.replace("/portfolio/new", "").replace(".html", "")}</span>
                </div>
              </div>

              {/* Iframe viewport */}
              <div className="pc-viewport">
                <iframe
                  src={site.url}
                  title={site.name}
                  scrolling="no"
                  loading="lazy"
                  tabIndex={-1}
                  className="pc-iframe"
                />
                {/* Gradient overlay */}
                <div className="pc-viewport-gradient" />
                {/* Click overlay — opens in new tab */}
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pc-click-overlay"
                  aria-label={`Voir ${site.name}`}
                  tabIndex={pos === "0" ? 0 : -1}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Card info — active site details */}
      <div className="pc-info">
        <div className="pc-info-inner">
          <h3 className="pc-info-name">{activeSite.name}</h3>
          <p className="pc-info-desc">{activeSite.description}</p>
          <div className="pc-tags">
            {activeSite.tags.map((tag) => (
              <span key={tag} className="pc-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="pc-controls">
        {/* Prev button */}
        <button onClick={prev} className="pc-arrow pc-arrow-prev" aria-label="Précédent">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dots */}
        <div className="pc-dots">
          {SITES.map((_, i) => (
            <button
              key={i}
              className={`pc-dot${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Aller à ${SITES[i].name}`}
            />
          ))}
        </div>

        {/* Next button */}
        <button onClick={next} className="pc-arrow pc-arrow-next" aria-label="Suivant">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Counter */}
      <div className="pc-counter" aria-live="polite">
        {active + 1} / {total}
      </div>
    </div>
  );
}
