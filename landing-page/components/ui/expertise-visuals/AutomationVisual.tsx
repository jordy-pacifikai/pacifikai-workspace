"use client";

/* ============================================================
   AutomationVisual — animated workflow/pipeline illustration
   CSS keyframes used: expertiseFloat, neuralPulse, pulse-dot
   Accent: indigo (#6366f1)
   ============================================================ */

const INDIGO = "#6366f1";
const DARK = "rgba(10,14,24,0.9)";
const BORDER_SUBTLE = "rgba(255,255,255,0.07)";

export default function AutomationVisual() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "8px 4px",
      }}
    >
      {/* Outer glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 24,
          background: `radial-gradient(ellipse at 50% 50%, ${INDIGO}0d 0%, transparent 70%)`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "relative",
          width: 300,
          background: DARK,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 16,
          padding: "16px 14px 14px",
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${INDIGO}0f`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header label */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: `${INDIGO}1a`,
              border: `1px solid ${INDIGO}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="2.2" aria-hidden>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.4px" }}>
            Workflow automatise
          </span>
          <div
            style={{
              marginLeft: "auto",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              animation: "pulse-dot 2s ease infinite",
            }}
          />
        </div>

        {/* Pipeline row: 3 nodes + connectors */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px",
            marginBottom: 16,
          }}
        >
          {/* SVG connector lines (dashed, animated) */}
          <svg
            aria-hidden
            style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 20, overflow: "visible" }}
          >
            {/* Line 1 → 2 */}
            <line
              x1="52" y1="10" x2="118" y2="10"
              stroke={`${INDIGO}60`}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              style={{ animation: "dashFlow 1.5s linear infinite" }}
            />
            {/* Line 2 → 3 */}
            <line
              x1="170" y1="10" x2="238" y2="10"
              stroke={`${INDIGO}60`}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              style={{ animation: "dashFlow 1.5s linear 0.5s infinite" }}
            />
          </svg>

          {/* Particle 1 — travels line 1 */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: 52,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: INDIGO,
              transform: "translateY(-50%)",
              animation: "particleFlow1 1.5s ease-in-out infinite",
              boxShadow: `0 0 6px ${INDIGO}`,
            }}
          />
          {/* Particle 2 — travels line 2 */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: 170,
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: INDIGO,
              transform: "translateY(-50%)",
              animation: "particleFlow2 1.5s ease-in-out 0.75s infinite",
              boxShadow: `0 0 6px ${INDIGO}`,
            }}
          />

          {/* Node 1 — Envelope (email) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `${INDIGO}18`,
                border: `1.5px solid ${INDIGO}50`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "expertiseFloat 4s ease-in-out infinite",
                boxShadow: `0 0 16px ${INDIGO}20`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.8" aria-hidden>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.3px" }}>
              Declencheur
            </span>
          </div>

          {/* Node 2 — Gear (processing) — slightly larger */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `${INDIGO}22`,
                border: `1.5px solid ${INDIGO}70`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "expertiseFloat 4s ease-in-out 0.8s infinite",
                boxShadow: `0 0 24px ${INDIGO}30`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="1.8" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.3px" }}>
              Traitement IA
            </span>
          </div>

          {/* Node 3 — Check (done) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(74,222,128,0.12)",
                border: "1.5px solid rgba(74,222,128,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "expertiseFloat 4s ease-in-out 1.6s infinite",
                boxShadow: "0 0 16px rgba(74,222,128,0.15)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.3px" }}>
              Envoye
            </span>
          </div>
        </div>

        {/* Step labels row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {[
            { label: "Prospect detecte", color: `${INDIGO}cc` },
            { label: "Fiche enrichie", color: `${INDIGO}cc` },
            { label: "Email envoye", color: "#4ade80cc" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "5px 4px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 8, color: item.color, fontWeight: 500, lineHeight: 1.3 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 10px",
            borderRadius: 8,
            background: "rgba(99,102,241,0.06)",
            border: `1px solid ${INDIGO}25`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              flexShrink: 0,
              animation: "pulse-dot 2s ease infinite",
            }}
          />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            3 workflows actifs
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: `${INDIGO}cc`,
              fontWeight: 600,
            }}
          >
            127 taches / jour
          </span>
        </div>
      </div>

      {/* Inline keyframes for particle flow */}
      <style>{`
        @keyframes dashFlow {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -28; }
        }
        @keyframes particleFlow1 {
          0%   { transform: translateY(-50%) translateX(0px);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-50%) translateX(66px);  opacity: 0; }
        }
        @keyframes particleFlow2 {
          0%   { transform: translateY(-50%) translateX(0px);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-50%) translateX(68px);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}
