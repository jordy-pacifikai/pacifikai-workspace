"use client";

export default function ServiceDocumentVisual() {
  return (
    <div className="relative flex items-center justify-center gap-4 py-6">
      {/* Document card */}
      <div className="relative w-[260px] h-[300px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Document header bar */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="1" width="12" height="14" rx="2" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
              <line x1="5" y1="5" x2="11" y2="5" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
              <line x1="5" y1="8" x2="11" y2="8" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
              <line x1="5" y1="11" x2="9" y2="11" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
            </svg>
          </div>
          <div className="text-[11px] text-white/40 font-medium tracking-wide uppercase">
            Document.pdf
          </div>
        </div>

        {/* Text lines */}
        <div className="flex flex-col gap-3 px-5 pt-2">
          <div className="h-2 rounded-full bg-white/10 w-[85%] doc-line doc-line-1" />
          <div className="h-2 rounded-full bg-white/10 w-[70%] doc-line doc-line-2" />
          <div className="h-2 rounded-full bg-white/10 w-[90%] doc-line doc-line-3" />
          <div className="h-2 rounded-full bg-white/10 w-[55%] doc-line doc-line-4" />
        </div>

        {/* Separator */}
        <div className="mx-5 mt-5 mb-4 h-px bg-white/5" />

        {/* More text lines */}
        <div className="flex flex-col gap-3 px-5">
          <div className="h-2 rounded-full bg-white/10 w-[75%] doc-line doc-line-5" />
          <div className="h-2 rounded-full bg-white/10 w-[60%] doc-line doc-line-6" />
          <div className="h-2 rounded-full bg-white/10 w-[80%] doc-line doc-line-7" />
        </div>

        {/* Scanning beam */}
        <div className="absolute left-0 right-0 h-[2px] scan-beam">
          <div className="h-full bg-gradient-to-r from-transparent via-[#f97066] to-transparent opacity-90" />
          <div className="absolute inset-x-0 -top-4 h-10 bg-gradient-to-b from-[#f97066]/10 to-transparent" />
        </div>
      </div>

      {/* Extracted data cards */}
      <div className="flex flex-col gap-2.5">
        {[
          { label: "Nom", value: "Dupont", delay: "0.8s" },
          { label: "Montant", value: "150 000 XPF", delay: "1.6s" },
          { label: "Date", value: "28/03/2026", delay: "2.4s" },
        ].map((item) => (
          <div
            key={item.label}
            className="extracted-card flex items-center gap-2 px-3 py-2 rounded-xl border border-[#f97066]/20 bg-white/5 backdrop-blur-md"
            style={{ animationDelay: item.delay }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#f97066]" />
            <span className="text-[11px] text-white/40">{item.label}:</span>
            <span className="text-[11px] text-white/80 font-medium">{item.value}</span>
          </div>
        ))}

        {/* Connection line decoration */}
        <div className="absolute -left-3 top-1/2 w-3 h-px bg-[#f97066]/20" />
      </div>

      <style jsx>{`
        .scan-beam {
          animation: scanDown 3s ease-in-out infinite;
        }

        @keyframes scanDown {
          0%, 100% { top: 40px; opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          95% { opacity: 0; }
          50% { top: 270px; }
        }

        .doc-line {
          transition: all 0.4s ease;
        }

        .doc-line-1 { animation: highlightLine 3s ease-in-out infinite 0.3s; }
        .doc-line-2 { animation: highlightLine 3s ease-in-out infinite 0.6s; }
        .doc-line-3 { animation: highlightLine 3s ease-in-out infinite 0.9s; }
        .doc-line-4 { animation: highlightLine 3s ease-in-out infinite 1.1s; }
        .doc-line-5 { animation: highlightLine 3s ease-in-out infinite 1.5s; }
        .doc-line-6 { animation: highlightLine 3s ease-in-out infinite 1.7s; }
        .doc-line-7 { animation: highlightLine 3s ease-in-out infinite 1.9s; }

        @keyframes highlightLine {
          0%, 100% { background-color: rgba(255,255,255,0.1); }
          15%, 25% { background-color: rgba(249,112,102,0.35); }
        }

        .extracted-card {
          opacity: 0;
          transform: translateX(12px);
          animation: cardAppear 3s ease-out infinite;
        }

        @keyframes cardAppear {
          0%, 20% { opacity: 0; transform: translateX(12px); }
          35%, 85% { opacity: 1; transform: translateX(0); }
          95%, 100% { opacity: 0; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
