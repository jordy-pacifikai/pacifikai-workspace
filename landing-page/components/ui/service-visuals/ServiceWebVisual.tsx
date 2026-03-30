"use client";

export default function ServiceWebVisual() {
  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Browser Window */}
      <div
        className="relative w-[300px] h-[260px] rounded-xl border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97066]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div
            className="flex-1 h-5 rounded-md bg-white/5 ml-2"
            style={{ animation: "webUrlFade 3s ease-out 0.3s both" }}
          />
        </div>

        {/* Page Content Area */}
        <div className="relative p-3 space-y-2.5 overflow-hidden">
          {/* Layer 1: Navigation Bar */}
          <div
            className="h-5 rounded-md bg-white/5"
            style={{ animation: "webSlideDown 0.6s ease-out 0.5s both" }}
          />

          {/* Layer 2: Hero Section */}
          <div
            className="h-[80px] rounded-lg"
            style={{
              background: "linear-gradient(135deg, rgba(249,112,102,0.08) 0%, rgba(249,112,102,0.03) 100%)",
              border: "1px solid rgba(249,112,102,0.1)",
              animation: "webFadeIn 0.8s ease-out 1.1s both",
            }}
          >
            <div className="p-3 space-y-2">
              <div className="h-2.5 w-3/4 rounded bg-white/8" style={{ animation: "webFadeIn 0.5s ease-out 1.5s both" }} />
              <div className="h-2 w-1/2 rounded bg-white/5" style={{ animation: "webFadeIn 0.5s ease-out 1.7s both" }} />
            </div>
          </div>

          {/* Layer 3: Content Cards */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 h-[60px] rounded-md bg-white/5 p-2"
                style={{
                  animation: `webSlideUp 0.5s ease-out ${1.8 + i * 0.2}s both`,
                }}
              >
                <div className="h-2 w-3/4 rounded bg-white/8 mb-1.5" />
                <div className="h-1.5 w-full rounded bg-white/4" />
                <div className="h-1.5 w-2/3 rounded bg-white/4 mt-1" />
              </div>
            ))}
          </div>

          {/* Shimmer Pass */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
              animation: "webShimmer 2s ease-in-out 3s both",
            }}
          />
        </div>

        {/* Lighthouse Badge */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide"
          style={{
            background: "rgba(249,112,102,0.15)",
            color: "#f97066",
            boxShadow: "0 0 12px rgba(249,112,102,0.25)",
            animation: "webBadgePop 0.4s ease-out 3.5s both",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
            <path d="M12 2L4 7v6c0 5.25 3.4 10.15 8 11.25 4.6-1.1 8-6 8-11.25V7l-8-5z" />
          </svg>
          100/100
        </div>
      </div>

      {/* Inline Keyframes */}
      <style jsx>{`
        @keyframes webSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes webFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes webSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes webShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes webUrlFade {
          from { opacity: 0; width: 0; }
          to { opacity: 1; width: 100%; }
        }
        @keyframes webBadgePop {
          0% { opacity: 0; transform: scale(0.5); }
          70% { transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
