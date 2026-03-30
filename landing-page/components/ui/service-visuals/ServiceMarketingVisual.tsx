"use client";

export default function ServiceMarketingVisual() {
  return (
    <div className="relative flex items-center justify-center py-6">
      <div className="relative w-[300px] h-[300px]">
        {/* Central funnel */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
          {/* Top — Audience */}
          <div className="funnel-stage" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-[220px] px-4 py-3 rounded-t-2xl bg-white/[0.04] border border-white/10 border-b-0 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Audience</span>
              </div>
              <div className="counter text-xl font-bold text-white/90" style={{ animationDelay: "0.8s" }}>
                12 450
              </div>
            </div>
          </div>

          {/* Middle — Leads */}
          <div className="funnel-stage" style={{ animationDelay: "0.6s" }}>
            <div className="relative w-[170px] px-4 py-3 bg-white/[0.06] border-x border-white/10 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Leads</span>
              </div>
              <div className="counter text-xl font-bold text-[#14b8a6]" style={{ animationDelay: "1.4s" }}>
                847
              </div>
            </div>
          </div>

          {/* Bottom — Clients */}
          <div className="funnel-stage" style={{ animationDelay: "0.9s" }}>
            <div className="relative w-[120px] px-4 py-3 rounded-b-2xl bg-white/[0.08] border border-white/10 border-t-0 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5c542" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Clients</span>
              </div>
              <div className="counter text-xl font-bold text-[#f5c542]" style={{ animationDelay: "2s" }}>
                63
              </div>
            </div>
          </div>
        </div>

        {/* Flowing particles down the funnel */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="funnel-particle"
            style={{
              left: `${110 + (Math.sin(i * 1.2) * 40)}px`,
              animationDelay: `${i * 0.4}s`,
              background: i < 3 ? "#f97066" : i < 6 ? "#14b8a6" : "#f5c542",
            }}
          />
        ))}

        {/* Floating notification cards */}
        <div className="notif-card absolute top-2 right-0" style={{ animationDelay: "1.2s" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#f97066]/20 bg-[#f97066]/5 backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-[#f97066]/15 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f97066">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-white/70 font-medium">Meta Ads</p>
              <p className="text-[8px] text-[#f97066]">ROAS x3.2</p>
            </div>
          </div>
        </div>

        <div className="notif-card absolute bottom-6 left-0" style={{ animationDelay: "2.4s" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#14b8a6]/20 bg-[#14b8a6]/5 backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-[#14b8a6]/15 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-white/70 font-medium">SEO IA</p>
              <p className="text-[8px] text-[#14b8a6]">+240% trafic</p>
            </div>
          </div>
        </div>

        <div className="notif-card absolute top-[40%] left-[-10px]" style={{ animationDelay: "1.8s" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#f5c542]/20 bg-[#f5c542]/5 backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-[#f5c542]/15 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f5c542" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-white/70 font-medium">Email IA</p>
              <p className="text-[8px] text-[#f5c542]">42% ouverture</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .funnel-stage {
          opacity: 0;
          transform: translateY(15px);
          animation: stageIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes stageIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .counter {
          opacity: 0;
          animation: countIn 0.5s ease-out forwards;
        }

        @keyframes countIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        .funnel-particle {
          position: absolute;
          top: 30px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          opacity: 0;
          animation: particleFall 3s ease-in infinite;
        }

        @keyframes particleFall {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          10% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(220px) scale(0.3); }
        }

        .notif-card {
          opacity: 0;
          transform: translateX(10px);
          animation: notifIn 0.6s ease-out forwards;
        }

        @keyframes notifIn {
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
