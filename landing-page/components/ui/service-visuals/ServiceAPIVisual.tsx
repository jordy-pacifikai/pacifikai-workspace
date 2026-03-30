"use client";

const satellites = [
  { label: "Calendar", icon: "📅", angle: 0 },
  { label: "Email", icon: "✉️", angle: 72 },
  { label: "Database", icon: "🗄️", angle: 144 },
  { label: "Payment", icon: "💳", angle: 216 },
  { label: "CRM", icon: "👥", angle: 288 },
];

export default function ServiceAPIVisual() {
  const cx = 170;
  const cy = 160;
  const radius = 110;

  return (
    <div className="relative w-full h-[340px] flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes centerPulse {
          0%, 100% { box-shadow: 0 0 20px #f9706640, 0 0 40px #f9706620; }
          50% { box-shadow: 0 0 30px #f9706660, 0 0 60px #f9706630; }
        }
        @keyframes dashFlow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes packetMove {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes satelliteAppear {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes snippetFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .center-node { animation: centerPulse 3s ease-in-out infinite; }
        .dash-line { animation: dashFlow 1s linear infinite; }
        .sat-0 { animation: satelliteAppear 0.4s ease-out 0.3s both; }
        .sat-1 { animation: satelliteAppear 0.4s ease-out 0.5s both; }
        .sat-2 { animation: satelliteAppear 0.4s ease-out 0.7s both; }
        .sat-3 { animation: satelliteAppear 0.4s ease-out 0.9s both; }
        .sat-4 { animation: satelliteAppear 0.4s ease-out 1.1s both; }
        .packet-0 { animation: packetMove 2s ease-in-out 0.8s infinite; }
        .packet-1 { animation: packetMove 2s ease-in-out 1.2s infinite; }
        .packet-2 { animation: packetMove 2s ease-in-out 1.6s infinite; }
        .packet-3 { animation: packetMove 2s ease-in-out 2.0s infinite; }
        .packet-4 { animation: packetMove 2s ease-in-out 2.4s infinite; }
        .code-snippet { animation: snippetFade 0.6s ease-out 1.6s both; }
      `}</style>

      <div className="relative" style={{ width: 340, height: 320 }}>
        {/* SVG connections */}
        <svg
          className="absolute inset-0"
          width="340"
          height="320"
          viewBox="0 0 340 320"
          fill="none"
        >
          {satellites.map((sat, i) => {
            const rad = (sat.angle * Math.PI) / 180;
            const sx = cx + radius * Math.cos(rad);
            const sy = cy + radius * Math.sin(rad);
            const pathId = `path-${i}`;
            return (
              <g key={i}>
                {/* Dashed connection line */}
                <path
                  id={pathId}
                  d={`M${cx},${cy} L${sx},${sy}`}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  className="dash-line"
                />
                {/* Data packet */}
                <circle
                  r="3"
                  fill="#f97066"
                  className={`packet-${i}`}
                  style={{
                    offsetPath: `path('M${cx},${cy} L${sx},${sy}')`,
                    offsetRotate: "0deg",
                  }}
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="2s"
                    begin={`${0.8 + i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Center node */}
        <div
          className="center-node absolute w-14 h-14 rounded-full bg-[#f97066]/20 border border-[#f97066]/50 flex items-center justify-center backdrop-blur-md"
          style={{ left: cx - 28, top: cy - 28 }}
        >
          <span className="text-sm font-bold text-[#f97066]">API</span>
        </div>

        {/* Satellite nodes */}
        {satellites.map((sat, i) => {
          const rad = (sat.angle * Math.PI) / 180;
          const sx = cx + radius * Math.cos(rad);
          const sy = cy + radius * Math.sin(rad);
          return (
            <div
              key={i}
              className={`sat-${i} absolute flex flex-col items-center gap-1`}
              style={{ left: sx - 20, top: sy - 20 }}
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center text-base">
                {sat.icon}
              </div>
              <span className="text-[10px] text-white/40 font-medium">
                {sat.label}
              </span>
            </div>
          );
        })}

        {/* Code snippet pill */}
        <div
          className="code-snippet absolute bottom-2 right-0 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 backdrop-blur-md"
        >
          <code className="text-[11px] text-[#14b8a6] font-mono">
            {"{ \"status\": \"connected\" }"}
          </code>
        </div>
      </div>
    </div>
  );
}
