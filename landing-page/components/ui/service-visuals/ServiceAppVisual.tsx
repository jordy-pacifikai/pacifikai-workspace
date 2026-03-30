"use client";

export default function ServiceAppVisual() {
  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Phone Frame */}
      <div
        className="relative w-[160px] h-[300px] rounded-[32px] border-2 border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full bg-black/60 border border-white/5 z-10" />

        {/* Screen Content */}
        <div className="pt-8 px-3 pb-3 h-full flex flex-col">
          {/* Status Bar */}
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="h-1.5 w-6 rounded bg-white/15" />
            <div className="flex gap-1">
              <div className="h-1.5 w-3 rounded bg-white/15" />
              <div className="h-1.5 w-4 rounded bg-white/15" />
            </div>
          </div>

          {/* Header Bar */}
          <div
            className="flex items-center gap-2 mb-3"
            style={{ animation: "appFadeIn 0.6s ease-out 0.4s both" }}
          >
            <div className="w-6 h-6 rounded-lg bg-[#f97066]/20 border border-[#f97066]/20" />
            <div className="h-2.5 flex-1 rounded bg-white/10" />
          </div>

          {/* List Items */}
          <div className="flex-1 space-y-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5"
                style={{ animation: `appSlideUp 0.5s ease-out ${0.8 + i * 0.25}s both` }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-4/5 rounded bg-white/10" />
                  <div className="h-1.5 w-3/5 rounded bg-white/5" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]/60" />
              </div>
            ))}

            {/* Action Button */}
            <div
              className="mt-2 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(249,112,102,0.2) 0%, rgba(249,112,102,0.1) 100%)",
                border: "1px solid rgba(249,112,102,0.15)",
                animation: "appFadeIn 0.6s ease-out 1.5s both",
              }}
            >
              <div className="h-2 w-12 rounded bg-[#f97066]/40" />
            </div>
          </div>

          {/* Bottom Nav */}
          <div
            className="flex justify-around items-center pt-2 mt-auto border-t border-white/5"
            style={{ animation: "appFadeIn 0.5s ease-out 1.8s both" }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === 0 ? "bg-[#f97066]/60" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Notification Badge */}
        <div
          className="absolute top-6 right-4 w-4 h-4 rounded-full flex items-center justify-center z-20"
          style={{
            background: "#f97066",
            boxShadow: "0 0 8px rgba(249,112,102,0.5)",
            animation: "appBadgePop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2.2s both",
          }}
        >
          <span className="text-[7px] font-bold text-white">3</span>
        </div>
      </div>

      {/* Floating Platform Labels */}
      <div
        className="absolute left-0 top-1/3 text-[10px] font-medium tracking-wider text-white/30"
        style={{ animation: "appLabelFloat 2s ease-in-out infinite alternate, appFadeIn 0.5s ease-out 2.5s both" }}
      >
        iOS
      </div>
      <div
        className="absolute right-0 top-1/2 text-[10px] font-medium tracking-wider text-white/30"
        style={{ animation: "appLabelFloat 2s ease-in-out 0.5s infinite alternate, appFadeIn 0.5s ease-out 2.7s both" }}
      >
        Android
      </div>

      {/* PWA Ready Badge */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide"
        style={{
          background: "rgba(20,184,166,0.12)",
          color: "#14b8a6",
          border: "1px solid rgba(20,184,166,0.15)",
          boxShadow: "0 0 12px rgba(20,184,166,0.15)",
          animation: "appBadgePop 0.4s ease-out 3s both",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        PWA Ready
      </div>

      {/* Inline Keyframes */}
      <style jsx>{`
        @keyframes appFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes appSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes appBadgePop {
          0% { opacity: 0; transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes appLabelFloat {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
