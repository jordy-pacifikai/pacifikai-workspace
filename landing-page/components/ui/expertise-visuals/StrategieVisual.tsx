"use client";

/* ============================================================
   StrategieVisual — animated roadmap / milestone timeline
   Uses CSS keyframes: timelineDraw (globals.css)
   Local keyframes: nodeReveal, labelFadeIn defined inline
   Primary color: Orange #f59e0b
   ============================================================ */

const OR = "#f59e0b";
const OR_DIM = "rgba(245,158,11,0.15)";
const OR_MID = "rgba(245,158,11,0.25)";

const MILESTONES = [
  {
    label: "Diagnostic",
    sub: "Analyse de l'existant",
    delay: 0.6,
    icon: (
      // Magnifying glass
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
      </svg>
    ),
  },
  {
    label: "Recommandations",
    sub: "Strategie sur mesure",
    delay: 1.4,
    icon: (
      // Lightbulb
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2.2" strokeLinecap="round">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.65V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.35A7 7 0 0 1 12 2z" />
      </svg>
    ),
  },
  {
    label: "Accompagnement",
    sub: "Execution & suivi",
    delay: 2.2,
    icon: (
      // Rocket
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2.2" strokeLinecap="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l4.5-4.5" />
        <path d="M13 10.5l-3 3" />
        <path d="M20 4s-7 0-10 7l3 3c7-3 7-10 7-10z" />
      </svg>
    ),
  },
];

export default function StrategieVisual() {
  return (
    <div className="relative flex items-center justify-center w-full py-4">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-[60px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)" }}
      />

      {/* Timeline card */}
      <div
        className="relative w-[260px] rounded-2xl px-6 py-6"
        style={{
          background: "rgba(10,14,24,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: OR_DIM, border: "1px solid rgba(245,158,11,0.3)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={OR} strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-white">Feuille de route</span>
        </div>

        {/* Milestones */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-[19px] top-[22px]"
            style={{ width: 2, height: "calc(100% - 44px)", background: "rgba(255,255,255,0.06)" }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(to bottom, ${OR}, rgba(245,158,11,0.3))`,
                transformOrigin: "top",
                animation: "stLineGrow 1.2s cubic-bezier(0.4,0,0.2,1) 0.2s both",
              }}
            />
          </div>

          {MILESTONES.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-4 mb-5 last:mb-0"
              style={{ animation: `stNodeReveal 0.5s ease ${m.delay}s both` }}
            >
              {/* Node circle */}
              <div
                className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: OR_DIM,
                  border: `1.5px solid ${OR}`,
                  boxShadow: `0 0 0 4px rgba(245,158,11,0.06)`,
                }}
              >
                {m.icon}
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid rgba(245,158,11,0.3)`,
                    animation: `stRingPulse 2.4s ease ${m.delay + 0.4}s infinite`,
                  }}
                />
              </div>

              {/* Label */}
              <div className="pt-1.5">
                <p className="text-[11px] font-semibold text-white leading-none mb-1">{m.label}</p>
                <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{m.sub}</p>
              </div>

              {/* Step number badge */}
              <div
                className="ml-auto mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: OR_DIM, color: OR }}
              >
                0{i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes stLineGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes stNodeReveal {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes stRingPulse {
          0% { transform: scale(1); opacity: 0.6; }
          60% { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
