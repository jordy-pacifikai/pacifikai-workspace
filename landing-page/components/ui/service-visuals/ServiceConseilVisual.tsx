"use client";

export default function ServiceConseilVisual() {
  return (
    <div className="relative w-full h-[340px] flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes growLine {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes fillProgress {
          from { height: 0; }
          to { height: 100%; }
        }
        @keyframes nodeAppear {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes badgeFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .timeline-line {
          animation: growLine 1.2s ease-out forwards;
        }
        .progress-fill {
          animation: fillProgress 2.4s ease-in-out 0.6s forwards;
        }
        .node-1 { animation: nodeAppear 0.4s ease-out 0.6s both; }
        .node-2 { animation: nodeAppear 0.4s ease-out 1.2s both; }
        .node-3 { animation: nodeAppear 0.4s ease-out 1.8s both; }
        .card-1 { animation: cardSlideIn 0.5s ease-out 0.8s both; }
        .card-2 { animation: cardSlideIn 0.5s ease-out 1.4s both; }
        .card-3 { animation: cardSlideIn 0.5s ease-out 2.0s both; }
        .roi-badge { animation: badgeFadeIn 0.6s ease-out 2.6s both; }
      `}</style>

      {/* Timeline container */}
      <div className="relative h-[280px] flex items-start">
        {/* Vertical line background */}
        <div className="relative w-[2px] h-full mx-8">
          {/* Base line (grows in) */}
          <div
            className="absolute top-0 left-0 w-full bg-white/10 origin-top timeline-line"
            style={{ height: 0 }}
          />
          {/* Progress overlay */}
          <div
            className="absolute top-0 left-0 w-full origin-top progress-fill"
            style={{
              height: 0,
              background: "linear-gradient(to bottom, #f97066, #14b8a6, #10b981)",
              borderRadius: 1,
            }}
          />

          {/* Node 1 — Audit */}
          <div className="absolute -left-[7px] top-[16%]">
            <div className="node-1 w-4 h-4 rounded-full border-2 border-[#f97066] bg-[#f97066]/30 shadow-[0_0_12px_#f9706640]" />
          </div>

          {/* Node 2 — Strategie */}
          <div className="absolute -left-[7px] top-[48%]">
            <div className="node-2 w-4 h-4 rounded-full border-2 border-[#14b8a6] bg-[#14b8a6]/30 shadow-[0_0_12px_#14b8a640]" />
          </div>

          {/* Node 3 — Resultats */}
          <div className="absolute -left-[7px] top-[80%]">
            <div className="node-3 w-4 h-4 rounded-full border-2 border-[#10b981] bg-[#10b981]/30 shadow-[0_0_12px_#10b98140]" />
          </div>
        </div>

        {/* Cards */}
        <div className="relative h-full flex flex-col justify-between py-[12%]">
          {/* Card 1 */}
          <div className="card-1 flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <span className="text-sm font-medium text-white/90">Audit</span>
              <p className="text-[11px] text-white/40 mt-0.5">Analyse existant</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-2 flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <span className="text-sm font-medium text-white/90">Strategie</span>
              <p className="text-[11px] text-white/40 mt-0.5">Plan d&apos;action IA</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-3 flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <span className="text-sm font-medium text-white/90">Resultats</span>
              <p className="text-[11px] text-white/40 mt-0.5">Impact mesurable</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Badge */}
      <div className="roi-badge absolute bottom-4 right-4">
        <div className="px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 backdrop-blur-md">
          <span className="text-xs font-bold text-[#10b981]">ROI +150%</span>
        </div>
      </div>
    </div>
  );
}
