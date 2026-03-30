"use client";

const PURPLE = "#8b5cf6";
const CHROME_BG = "#0d1424";
const BORDER = "rgba(255,255,255,0.07)";

/* Stagger delays for each layer assembling inside the browser */
const LAYERS: { delay: string; label: string }[] = [
  { delay: "0.3s",  label: "header"  },
  { delay: "0.75s", label: "hero"    },
  { delay: "1.2s",  label: "cards"   },
  { delay: "1.65s", label: "text"    },
];

export default function WebPremiumVisual() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: 360,
        padding: "0 8px",
        filter: `drop-shadow(0 0 40px ${PURPLE}22)`,
      }}
    >
      {/* ── Browser window ── */}
      <div
        style={{
          width: "100%",
          borderRadius: "12px 12px 10px 10px",
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
          background: CHROME_BG,
          boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.08)`,
        }}
      >
        {/* ── Chrome bar ── */}
        <div
          style={{
            background: "#0a1020",
            borderBottom: `1px solid ${BORDER}`,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
              <div
                key={i}
                style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.9 }}
              />
            ))}
          </div>

          {/* Address bar */}
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 6,
              padding: "3px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Lock icon */}
            <svg width="9" height="10" viewBox="0 0 9 10" fill="none" aria-hidden="true">
              <rect x="1.5" y="4.5" width="6" height="5" rx="1" stroke={PURPLE} strokeWidth="1" strokeOpacity="0.7" />
              <path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" stroke={PURPLE} strokeWidth="1" strokeOpacity="0.7" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: 10,
                color: "rgba(240,242,248,0.5)",
                fontFamily: "monospace",
                letterSpacing: "0.3px",
              }}
            >
              pacifikai.com
            </span>
          </div>
        </div>

        {/* ── Page viewport ── */}
        <div
          style={{
            background: "#080c14",
            padding: "14px 14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "relative",
            overflow: "hidden",
            minHeight: 190,
          }}
        >
          {/* 1 — Nav / header bar */}
          <div
            style={{
              height: 22,
              background: "rgba(13,20,36,0.95)",
              borderRadius: 5,
              border: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              padding: "0 8px",
              gap: 6,
              animation: `layerAssemble 0.5s cubic-bezier(0.34,1.56,0.64,1) ${LAYERS[0].delay} both`,
            }}
          >
            {/* Logo placeholder */}
            <div style={{ width: 14, height: 14, borderRadius: 3, background: PURPLE, opacity: 0.9 }} />
            {/* Nav links */}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              {[28, 22, 30, 20].map((w, i) => (
                <div
                  key={i}
                  style={{ width: w, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.12)" }}
                />
              ))}
            </div>
            {/* CTA pill */}
            <div
              style={{
                width: 36,
                height: 14,
                borderRadius: 7,
                background: PURPLE,
                opacity: 0.85,
                marginLeft: 8,
              }}
            />
          </div>

          {/* 2 — Hero gradient block */}
          <div
            style={{
              height: 68,
              borderRadius: 7,
              background: `linear-gradient(135deg, ${PURPLE}22 0%, rgba(99,102,241,0.12) 50%, rgba(139,92,246,0.06) 100%)`,
              border: `1px solid ${PURPLE}28`,
              position: "relative",
              overflow: "hidden",
              animation: `layerAssemble 0.5s cubic-bezier(0.34,1.56,0.64,1) ${LAYERS[1].delay} both`,
            }}
          >
            {/* Fake hero text lines */}
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: "65%", height: 8, borderRadius: 3, background: "rgba(255,255,255,0.35)" }} />
              <div style={{ width: "45%", height: 5, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
              <div
                style={{
                  width: 44,
                  height: 14,
                  borderRadius: 7,
                  background: PURPLE,
                  opacity: 0.85,
                  marginTop: 2,
                }}
              />
            </div>
            {/* Decorative orb */}
            <div
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${PURPLE}55, transparent 70%)`,
              }}
            />
          </div>

          {/* 3 — Three cards in a row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
              animation: `layerAssemble 0.5s cubic-bezier(0.34,1.56,0.64,1) ${LAYERS[2].delay} both`,
            }}
          >
            {[PURPLE, "#6366f1", "#a78bfa"].map((accent, i) => (
              <div
                key={i}
                style={{
                  height: 44,
                  borderRadius: 5,
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  padding: "7px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 2, background: accent, opacity: 0.75 }} />
                <div style={{ width: "80%", height: 4, borderRadius: 1, background: "rgba(255,255,255,0.2)" }} />
                <div style={{ width: "60%", height: 3, borderRadius: 1, background: "rgba(255,255,255,0.1)" }} />
              </div>
            ))}
          </div>

          {/* 4 — Text block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              animation: `layerAssemble 0.5s cubic-bezier(0.34,1.56,0.64,1) ${LAYERS[3].delay} both`,
            }}
          >
            {[72, 85, 60].map((w, i) => (
              <div
                key={i}
                style={{ width: `${w}%`, height: 4, borderRadius: 1, background: "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>

          {/* ── Full-browser shimmer pass — fires after all layers appear ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg, transparent 35%, rgba(139,92,246,0.08) 50%, transparent 65%)",
              backgroundSize: "300% 100%",
              animation: `fullShimmer 2s ease 2.4s 1 forwards`,
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />
        </div>
      </div>
    </div>
  );
}
