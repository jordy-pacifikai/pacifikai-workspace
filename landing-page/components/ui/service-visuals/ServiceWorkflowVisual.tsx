"use client";

export default function ServiceWorkflowVisual() {
  return (
    <div className="relative w-[320px] mx-auto py-6">
      <style>{`
        @keyframes flowDot {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes labelFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes greenPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Main pipeline row */}
      <div className="flex items-center justify-center gap-0 relative">
        {/* Node 1 — Email / Reception */}
        <div className="flex flex-col items-center z-10">
          <div
            className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center shadow-lg"
            style={{ animation: "nodeAppear 0.5s ease-out 0.2s both" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
          </div>
          <span
            className="mt-2.5 text-[10px] font-medium text-white/50 tracking-wide"
            style={{ animation: "labelFade 0.4s ease-out 0.6s both" }}
          >
            R&eacute;ception
          </span>
        </div>

        {/* Connection line 1 */}
        <div className="relative w-16 h-[2px] bg-white/[0.06] mx-1 -mt-5 rounded-full overflow-hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#14b8a6]"
            style={{
              animation: "flowDot 1.8s ease-in-out infinite",
              filter: "blur(0.5px)",
              boxShadow: "0 0 6px #14b8a6",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#f97066]/80"
            style={{
              animation: "flowDot 1.8s ease-in-out 0.6s infinite",
              filter: "blur(0.5px)",
              boxShadow: "0 0 4px #f97066",
            }}
          />
        </div>

        {/* Node 2 — Gear / Traitement */}
        <div className="flex flex-col items-center z-10">
          <div
            className="w-12 h-12 rounded-full border border-[#f97066]/20 bg-[#f97066]/[0.06] backdrop-blur-xl flex items-center justify-center shadow-lg"
            style={{ animation: "nodeAppear 0.5s ease-out 0.5s both" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97066"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
          <span
            className="mt-2.5 text-[10px] font-medium text-white/50 tracking-wide"
            style={{ animation: "labelFade 0.4s ease-out 0.9s both" }}
          >
            Traitement
          </span>
        </div>

        {/* Connection line 2 */}
        <div className="relative w-16 h-[2px] bg-white/[0.06] mx-1 -mt-5 rounded-full overflow-hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#14b8a6]"
            style={{
              animation: "flowDot 1.8s ease-in-out 0.3s infinite",
              filter: "blur(0.5px)",
              boxShadow: "0 0 6px #14b8a6",
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#f97066]/80"
            style={{
              animation: "flowDot 1.8s ease-in-out 0.9s infinite",
              filter: "blur(0.5px)",
              boxShadow: "0 0 4px #f97066",
            }}
          />
        </div>

        {/* Node 3 — Check / Resultat */}
        <div className="flex flex-col items-center z-10">
          <div
            className="w-12 h-12 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] backdrop-blur-xl flex items-center justify-center shadow-lg"
            style={{ animation: "nodeAppear 0.5s ease-out 0.8s both" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span
            className="mt-2.5 text-[10px] font-medium text-white/50 tracking-wide"
            style={{ animation: "labelFade 0.4s ease-out 1.2s both" }}
          >
            R&eacute;sultat
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div
        className="flex items-center justify-center mt-6"
        style={{ animation: "labelFade 0.5s ease-out 1.4s both" }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
          <span
            className="w-2 h-2 rounded-full bg-emerald-500"
            style={{ animation: "greenPulse 2s ease-in-out infinite" }}
          />
          <span className="text-[10px] font-medium text-white/50 tracking-wider uppercase">
            Actif 24/7
          </span>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 bg-[#14b8a6]/5 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}
