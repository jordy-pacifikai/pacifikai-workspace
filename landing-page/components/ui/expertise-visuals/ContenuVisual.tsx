"use client";

/* ============================================================
   ContenuVisual — animated 2x2 media grid illustration
   CSS keyframes used: expertiseFloat, shimmer
   Accent: gold (#f5c542)
   ============================================================ */

const GOLD = "#f5c542";
const DARK = "rgba(10,14,24,0.9)";
const BORDER_SUBTLE = "rgba(255,255,255,0.07)";

const TILE_BASE: React.CSSProperties = {
  background: "rgba(255,255,255,0.025)",
  border: `1px solid ${BORDER_SUBTLE}`,
  borderRadius: 10,
  overflow: "hidden",
  position: "relative",
};

export default function ContenuVisual() {
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
          background: `radial-gradient(ellipse at 50% 50%, ${GOLD}0d 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "relative",
          width: 280,
          background: DARK,
          border: `1px solid ${BORDER_SUBTLE}`,
          borderRadius: 16,
          padding: 14,
          boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${GOLD}0f`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: `${GOLD}1a`,
              border: `1px solid ${GOLD}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.2" aria-hidden>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.4px" }}>
            Generation IA
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

        {/* 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

          {/* Tile 1 — Image placeholder with gradient sweep */}
          <div
            style={{
              ...TILE_BASE,
              height: 100,
              animation: "expertiseFloat 0.5s ease 0.1s both",
            }}
          >
            {/* Gradient fill that sweeps in */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${GOLD}22 0%, rgba(251,191,36,0.08) 50%, rgba(245,197,66,0.04) 100%)`,
                animation: "shimmer 2.5s ease 0.5s both",
                backgroundSize: "200% 100%",
              }}
            />
            {/* Image icon */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: 9, color: `${GOLD}99`, fontWeight: 500 }}>IMAGE IA</span>
            </div>
            {/* Gold accent border bottom */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)`,
              }}
            />
          </div>

          {/* Tile 2 — Video player placeholder */}
          <div
            style={{
              ...TILE_BASE,
              height: 100,
              animation: "expertiseFloat 0.5s ease 0.4s both",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(20,25,40,0.9) 0%, rgba(15,20,35,0.95) 100%)",
              }}
            />
            {/* Play button */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: `1.5px solid ${GOLD}60`,
                  background: `${GOLD}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "expertiseFloat 3s ease-in-out infinite",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill={GOLD} aria-hidden>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span style={{ fontSize: 9, color: `${GOLD}99`, fontWeight: 500 }}>VIDEO IA</span>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)`,
              }}
            />
          </div>

          {/* Tile 3 — Audio waveform */}
          <div
            style={{
              ...TILE_BASE,
              height: 80,
              animation: "expertiseFloat 0.5s ease 0.7s both",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {/* Waveform bars */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, height: 24 }}>
                {[
                  { h: 10, delay: "0s" },
                  { h: 20, delay: "0.15s" },
                  { h: 14, delay: "0.3s" },
                  { h: 22, delay: "0.45s" },
                  { h: 12, delay: "0.6s" },
                  { h: 18, delay: "0.2s" },
                ].map((bar, i) => (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      height: bar.h,
                      borderRadius: 2,
                      background: `${GOLD}cc`,
                      animation: `neuralPulse 1.2s ease ${bar.delay} infinite alternate`,
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 9, color: `${GOLD}99`, fontWeight: 500 }}>VOIX OFF IA</span>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)`,
              }}
            />
          </div>

          {/* Tile 4 — Text document with lines appearing */}
          <div
            style={{
              ...TILE_BASE,
              height: 80,
              animation: "expertiseFloat 0.5s ease 1.0s both",
              padding: "8px 10px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 2 }}>
              {[
                { w: "85%", delay: "1.2s" },
                { w: "70%", delay: "1.5s" },
                { w: "90%", delay: "1.8s" },
                { w: "55%", delay: "2.1s" },
              ].map((line, i) => (
                <div
                  key={i}
                  style={{
                    width: line.w,
                    height: 4,
                    borderRadius: 2,
                    background: i === 0 ? `${GOLD}50` : "rgba(255,255,255,0.12)",
                    animation: `layerAssemble 0.4s ease ${line.delay} both`,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                position: "absolute",
                bottom: 6,
                right: 8,
                fontSize: 8,
                color: `${GOLD}80`,
                fontWeight: 500,
              }}
            >
              TEXTE IA
            </span>
          </div>
        </div>

        {/* Bottom status bar */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            4 formats generes · qualite studio
          </span>
        </div>
      </div>
    </div>
  );
}
