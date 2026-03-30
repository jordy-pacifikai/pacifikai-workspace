"use client";

/* ============================================================
   ChatbotVisual — animated chat UI illustration
   Uses CSS keyframes from globals.css:
     chatSlideIn | chatSlideInRight | neuralPulse | dotBounce
   ============================================================ */

export default function ChatbotVisual() {
  return (
    <div className="relative flex items-center justify-center w-full py-4">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-[60px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(249,112,102,0.08) 0%, transparent 70%)" }}
      />

      {/* Chat window */}
      <div
        className="relative w-[280px] rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10,14,24,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,112,102,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: "rgba(249,112,102,0.15)", border: "1px solid rgba(249,112,102,0.3)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white leading-none mb-0.5">Assistant IA</p>
            <div className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ animation: "neuralPulse 2s ease infinite" }}
              />
              <span className="text-[10px]" style={{ color: "#4ade80" }}>En ligne</span>
            </div>
          </div>

          {/* Window controls (decorative) */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
            <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          </div>
        </div>

        {/* Neural network background */}
        <div className="absolute inset-x-0 top-12 bottom-0 pointer-events-none overflow-hidden">
          <svg width="100%" height="100%" className="absolute inset-0" aria-hidden>
            {/* Lines */}
            <line x1="30" y1="40" x2="120" y2="80" stroke="rgba(249,112,102,0.06)" strokeWidth="1" />
            <line x1="120" y1="80" x2="200" y2="50" stroke="rgba(249,112,102,0.06)" strokeWidth="1" />
            <line x1="60" y1="120" x2="150" y2="150" stroke="rgba(249,112,102,0.04)" strokeWidth="1" />
            <line x1="150" y1="150" x2="240" y2="110" stroke="rgba(249,112,102,0.04)" strokeWidth="1" />
            <line x1="30" y1="40" x2="60" y2="120" stroke="rgba(249,112,102,0.04)" strokeWidth="1" />
            {/* Dots */}
            <circle cx="30" cy="40" r="2.5" fill="rgba(249,112,102,0.2)"
              style={{ animation: "neuralPulse 3s ease infinite" }} />
            <circle cx="120" cy="80" r="2" fill="rgba(249,112,102,0.15)"
              style={{ animation: "neuralPulse 3s ease 0.6s infinite" }} />
            <circle cx="200" cy="50" r="2.5" fill="rgba(249,112,102,0.2)"
              style={{ animation: "neuralPulse 3s ease 1.2s infinite" }} />
            <circle cx="60" cy="120" r="2" fill="rgba(249,112,102,0.15)"
              style={{ animation: "neuralPulse 3s ease 1.8s infinite" }} />
            <circle cx="150" cy="150" r="2.5" fill="rgba(249,112,102,0.2)"
              style={{ animation: "neuralPulse 3s ease 2.4s infinite" }} />
            <circle cx="240" cy="110" r="2" fill="rgba(249,112,102,0.15)"
              style={{ animation: "neuralPulse 3s ease 0.9s infinite" }} />
          </svg>
        </div>

        {/* Messages area */}
        <div className="relative z-10 px-3 pt-4 pb-4 flex flex-col gap-3" style={{ minHeight: "180px" }}>
          {/* Message 1 — User (left) */}
          <div
            className="flex items-end gap-2 self-start max-w-[80%]"
            style={{ animation: "chatSlideIn 0.5s ease 0.3s both" }}
          >
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              V
            </div>
            <div
              className="px-3 py-2 rounded-2xl rounded-bl-sm text-xs text-white leading-relaxed"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              Bonjour, je cherche des infos
            </div>
          </div>

          {/* Typing indicator */}
          <div
            className="flex items-end gap-2 self-end max-w-[80%]"
            style={{ animation: "chatSlideInRight 0.4s ease 0.9s both" }}
          >
            <div
              className="px-3 py-2.5 rounded-2xl rounded-br-sm flex items-center gap-1"
              style={{ background: "rgba(249,112,102,0.15)", border: "1px solid rgba(249,112,102,0.2)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#f97066", animation: "dotBounce 1s ease 0s infinite" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#f97066", animation: "dotBounce 1s ease 0.15s infinite" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#f97066", animation: "dotBounce 1s ease 0.3s infinite" }}
              />
            </div>
          </div>

          {/* Message 2 — AI response (right) */}
          <div
            className="flex items-end gap-2 self-end max-w-[85%]"
            style={{ animation: "chatSlideInRight 0.5s ease 1.6s both" }}
          >
            <div
              className="px-3 py-2 rounded-2xl rounded-br-sm text-xs leading-relaxed font-medium"
              style={{
                background: "rgba(249,112,102,0.18)",
                border: "1px solid rgba(249,112,102,0.25)",
                color: "#fca69f",
              }}
            >
              Je suis la pour vous aider !
            </div>
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(249,112,102,0.15)", border: "1px solid rgba(249,112,102,0.3)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Input bar (decorative) */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 mx-3 mb-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="text-[10px] flex-1" style={{ color: "rgba(255,255,255,0.2)" }}>
            Posez votre question…
          </span>
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(249,112,102,0.2)" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f97066" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating channel badges */}
      <div
        className="absolute -left-2 top-[30%] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold"
        style={{
          background: "rgba(10,14,24,0.9)",
          border: "1px solid rgba(37,211,102,0.3)",
          color: "#25d366",
          animation: "chatSlideIn 0.5s ease 2.2s both",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </div>

      <div
        className="absolute -right-2 top-[55%] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold"
        style={{
          background: "rgba(10,14,24,0.9)",
          border: "1px solid rgba(24,119,242,0.3)",
          color: "#1877f2",
          animation: "chatSlideInRight 0.5s ease 2.5s both",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
        </svg>
        Messenger
      </div>
    </div>
  );
}
