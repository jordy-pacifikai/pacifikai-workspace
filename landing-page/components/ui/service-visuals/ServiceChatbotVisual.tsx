"use client";

export default function ServiceChatbotVisual() {
  return (
    <div className="relative w-[280px] h-[320px] mx-auto">
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* Glass card */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#14b8a6]" />
            <span className="text-[11px] font-medium text-white/60 tracking-wide">
              MANA Assistant
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Channel badges */}
        <div className="flex flex-wrap gap-1.5 px-4 pt-2.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[9px] text-[#25D366] font-medium"
            style={{ animation: "float-badge 3s ease-in-out infinite" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.464A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.115 0-4.09-.57-5.793-1.564l-.416-.248-2.743.869.867-2.688-.27-.43A9.712 9.712 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
            </svg>
            WhatsApp
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0084FF]/10 border border-[#0084FF]/20 text-[9px] text-[#0084FF] font-medium"
            style={{ animation: "float-badge 3s ease-in-out infinite 0.5s" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259L10.733 8.5l3.13 3.259 5.889-3.259-6.559 6.463z" />
            </svg>
            Messenger
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E4405F]/10 border border-[#E4405F]/20 text-[9px] text-[#E4405F] font-medium"
            style={{ animation: "float-badge 3s ease-in-out infinite 1s" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f97066]/10 border border-[#f97066]/20 text-[9px] text-[#f97066] font-medium"
            style={{ animation: "float-badge 3s ease-in-out infinite 1.5s" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            Site web
          </span>
        </div>

        {/* Chat bubbles */}
        <div className="flex flex-col gap-2.5 px-4 pt-4">
          {/* User bubble */}
          <div
            className="self-start max-w-[85%]"
            style={{ animation: "slideInLeft 0.5s ease-out 0.3s both" }}
          >
            <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white/5 border border-white/5">
              <p className="text-[11px] text-white/70 leading-relaxed">
                Bonjour, je cherche un h&ocirc;tel
              </p>
            </div>
          </div>

          {/* Bot bubble 1 */}
          <div
            className="self-end max-w-[85%]"
            style={{ animation: "slideInRight 0.5s ease-out 0.9s both" }}
          >
            <div className="px-3 py-2 rounded-2xl rounded-br-sm bg-[#f97066]/10 border border-[#f97066]/20">
              <p className="text-[11px] text-white/80 leading-relaxed">
                Je vous recommande 3 options selon vos dates...
              </p>
            </div>
          </div>

          {/* Bot bubble 2 */}
          <div
            className="self-end max-w-[85%]"
            style={{ animation: "slideInRight 0.5s ease-out 1.5s both" }}
          >
            <div className="px-3 py-2 rounded-2xl rounded-br-sm bg-[#f97066]/10 border border-[#f97066]/20">
              <p className="text-[11px] text-white/80 leading-relaxed">
                Voulez-vous r&eacute;server ?
              </p>
            </div>
          </div>

          {/* Typing indicator */}
          <div
            className="self-end flex items-center gap-1 px-3 py-2 rounded-2xl rounded-br-sm bg-white/[0.03] border border-white/5"
            style={{ animation: "slideInRight 0.4s ease-out 2.1s both" }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#f97066]/60"
                style={{
                  animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#f97066]/8 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}
