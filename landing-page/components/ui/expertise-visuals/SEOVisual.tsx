"use client";

const TEAL = "#14b8a6";

/* Pin positions on the globe (cx/cy relative to viewBox 300x300, globe center 150,130, r=90) */
const PINS = [
  { cx: 150, cy: 60,  delay: 0    },
  { cx: 218, cy: 108, delay: 0.55 },
  { cx: 200, cy: 175, delay: 1.1  },
  { cx: 105, cy: 170, delay: 1.65 },
  { cx:  90, cy: 105, delay: 2.2  },
  { cx: 162, cy: 135, delay: 2.75 },
];

export default function SEOVisual() {
  return (
    <div
      style={{
        width: 300,
        height: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        filter: `drop-shadow(0 0 32px ${TEAL}28)`,
      }}
    >
      {/* ── Globe SVG ── */}
      <svg
        viewBox="0 0 300 260"
        width="300"
        height="260"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle radial glow behind globe */}
          <radialGradient id="seo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.12" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
          </radialGradient>
          <clipPath id="seo-globe-clip">
            <circle cx="150" cy="130" r="92" />
          </clipPath>
        </defs>

        {/* Glow disc */}
        <ellipse cx="150" cy="130" rx="110" ry="110" fill="url(#seo-glow)" />

        {/* Globe outline */}
        <circle
          cx="150"
          cy="130"
          r="90"
          fill="none"
          stroke={TEAL}
          strokeWidth="1.2"
          strokeOpacity="0.35"
        />

        {/* Horizontal latitude lines */}
        {[-48, -24, 0, 24, 48].map((offset, i) => {
          const y = 130 + offset;
          const halfWidth = Math.sqrt(Math.max(0, 90 * 90 - offset * offset));
          return (
            <line
              key={i}
              x1={150 - halfWidth}
              y1={y}
              x2={150 + halfWidth}
              y2={y}
              stroke={TEAL}
              strokeWidth="0.7"
              strokeOpacity="0.2"
            />
          );
        })}

        {/* Vertical longitude ellipses */}
        <ellipse
          cx="150"
          cy="130"
          rx="45"
          ry="90"
          fill="none"
          stroke={TEAL}
          strokeWidth="0.7"
          strokeOpacity="0.2"
          clipPath="url(#seo-globe-clip)"
        />
        <ellipse
          cx="150"
          cy="130"
          rx="90"
          ry="36"
          fill="none"
          stroke={TEAL}
          strokeWidth="0.7"
          strokeOpacity="0.2"
          clipPath="url(#seo-globe-clip)"
        />

        {/* ── Animated pins ── */}
        {PINS.map((pin, i) => (
          <g key={i}>
            {/* Expanding ring */}
            <circle
              cx={pin.cx}
              cy={pin.cy}
              r="7"
              fill="none"
              stroke={TEAL}
              strokeWidth="1"
              style={{
                animation: `globePinRing 2.4s ease-out ${pin.delay}s infinite`,
                transformOrigin: `${pin.cx}px ${pin.cy}px`,
              }}
            />
            {/* Core dot */}
            <circle
              cx={pin.cx}
              cy={pin.cy}
              r="3.5"
              fill={TEAL}
              style={{
                animation: `globePinPulse 2.4s ease-out ${pin.delay}s infinite`,
                transformOrigin: `${pin.cx}px ${pin.cy}px`,
              }}
            />
          </g>
        ))}

        {/* ── Search bar ── */}
        <g>
          {/* Bar background */}
          <rect
            x="38"
            y="234"
            width="224"
            height="20"
            rx="10"
            fill="none"
            stroke={TEAL}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* Magnifying glass icon */}
          <circle
            cx="55"
            cy="244"
            r="4.5"
            fill="none"
            stroke={TEAL}
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          <line
            x1="58.2"
            y1="247.2"
            x2="61.5"
            y2="250.5"
            stroke={TEAL}
            strokeWidth="1.2"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />

          {/* Typing text — clipped so it reveals left-to-right */}
          <clipPath id="seo-text-clip">
            <rect
              x="67"
              y="236"
              height="16"
              style={{ animation: "searchType 3.6s steps(24, end) 0.5s infinite" }}
            >
              {/* width animated via keyframe — set initial width=0 */}
              <animate
                attributeName="width"
                values="0;152;152"
                keyTimes="0;0.6;1"
                dur="3.6s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            </rect>
          </clipPath>
          <text
            x="67"
            y="248"
            fill={TEAL}
            fillOpacity="0.85"
            fontSize="9.5"
            fontFamily="monospace"
            letterSpacing="0.5"
            clipPath="url(#seo-text-clip)"
          >
            referencement IA Tahiti
          </text>

          {/* Cursor blink */}
          <rect
            x="67"
            y="238"
            width="1.2"
            height="12"
            fill={TEAL}
            fillOpacity="0.9"
            style={{ animation: "globePinPulse 1s steps(1, end) infinite" }}
          >
            <animate
              attributeName="x"
              values="67;67;219"
              keyTimes="0;0.02;0.62"
              dur="3.6s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
      </svg>
    </div>
  );
}
