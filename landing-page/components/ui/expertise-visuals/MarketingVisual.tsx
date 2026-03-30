"use client";

/* ============================================================
   MarketingVisual — animated dashboard illustration
   Uses CSS keyframes: float, shimmer (globals.css)
   Local keyframes: barGrow, barShrink defined inline via style tag
   Primary color: Emerald #10b981
   ============================================================ */

const EM = "#10b981";
const EM_DIM = "rgba(16,185,129,0.15)";
const EM_MID = "rgba(16,185,129,0.25)";
const EM_GLOW = "rgba(16,185,129,0.08)";

const BARS = [
  { height: 56, delay: 0 },
  { height: 72, delay: 0.3 },
  { height: 44, delay: 0.6 },
];

export default function MarketingVisual() {
  return (
    <div className="relative flex items-center justify-center w-full py-4">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-[60px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${EM_GLOW} 0%, transparent 70%)` }}
      />

      {/* Dashboard card */}
      <div
        className="relative w-[280px] rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,14,24,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.06)`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: EM_DIM, border: `1px solid rgba(16,185,129,0.3)` }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={EM} strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-white">Performance</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: EM_DIM, color: EM }}>
            Live
          </span>
        </div>

        {/* Bar chart section */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-[9px] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            Conversions / semaine
          </p>
          <div className="flex items-end gap-3 h-[80px]">
            {BARS.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: bar.height,
                    background: `linear-gradient(to top, ${EM}, rgba(16,185,129,0.5))`,
                    transformOrigin: "bottom",
                    animation: `mkBarLoop 4s ease-in-out ${bar.delay}s infinite`,
                    boxShadow: `0 0 8px rgba(16,185,129,0.3)`,
                  }}
                />
              </div>
            ))}
          </div>
          {/* X-axis labels */}
          <div className="flex gap-3 mt-1">
            {["Lun", "Mer", "Ven"].map((d) => (
              <div key={d} className="flex-1 text-center text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Funnel section */}
        <div
          className="mx-4 mb-3 rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-3 py-2">
            <p className="text-[9px] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Entonnoir
            </p>
            {[
              { label: "Visiteurs", pct: "100%", w: "100%", color: EM, opacity: 1 },
              { label: "Leads", pct: "42%", w: "65%", color: "#34d399", opacity: 0.85 },
              { label: "Clients", pct: "18%", w: "35%", color: "#6ee7b7", opacity: 0.7 },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div
                  className="h-4 rounded-sm flex items-center px-1.5 flex-shrink-0"
                  style={{
                    width: row.w,
                    background: `rgba(16,185,129,${0.12 + i * 0.05})`,
                    border: `1px solid rgba(16,185,129,${0.2 + i * 0.05})`,
                    minWidth: 28,
                    animation: `mkFunnelPulse 3s ease ${i * 0.4}s infinite`,
                  }}
                >
                  <span className="text-[7px] font-medium whitespace-nowrap" style={{ color: row.color, opacity: row.opacity }}>
                    {row.pct}
                  </span>
                </div>
                <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {row.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI cards row */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          {[
            { label: "CTR", value: "4.2%", icon: "↑" },
            { label: "ROAS", value: "x3.2", icon: "★" },
          ].map((kpi, i) => (
            <div
              key={i}
              className="rounded-xl px-3 py-2.5"
              style={{
                background: EM_DIM,
                border: `1px solid rgba(16,185,129,0.2)`,
                animation: `mkKpiGlow 3s ease ${i * 0.6}s infinite`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>{kpi.label}</span>
                <span className="text-[9px]" style={{ color: EM }}>{kpi.icon}</span>
              </div>
              <p className="text-sm font-bold" style={{ color: EM }}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes mkBarLoop {
          0%, 100% { transform: scaleY(0.55); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes mkFunnelPulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        @keyframes mkKpiGlow {
          0%, 100% { box-shadow: none; }
          50% { box-shadow: 0 0 12px rgba(16,185,129,0.2); }
        }
      `}</style>
    </div>
  );
}
