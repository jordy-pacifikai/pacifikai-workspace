"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CHAT_API = "/api/chat";
const CONTACT_API = "/api/contact";

interface Message {
  text: string;
  role: "bot" | "user";
}

/* ============ MANA AVATAR — Animated Polynesian 3D character ============ */
function ManaAvatar({ size = 48 }: { size?: number }) {
  const pad = 4; // ring padding
  const imgSize = size - pad * 2;
  return (
    <div
      className="mana-avatar-wrap"
      style={{ width: size, height: size, position: "relative" }}
    >
      {/* Animated gradient ring */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full mana-ring-spin"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="mana-ring-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97066" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#f5c542" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="url(#mana-ring-g)"
          strokeWidth="2.5"
          strokeDasharray="10 5"
        />
      </svg>
      {/* Animated avatar video — loops seamlessly */}
      <video
        src="/mana-avatar-small.mp4"
        autoPlay
        loop
        muted
        playsInline
        width={imgSize}
        height={imgSize}
        className="rounded-full object-cover"
        style={{
          width: imgSize,
          height: imgSize,
          position: "absolute",
          top: pad,
          left: pad,
          zIndex: 1,
        }}
        poster="/mana-avatar.png"
      />
    </div>
  );
}

/* ============ MAIN CHAT WIDGET ============ */
export default function ManaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [contactDone, setContactDone] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [showTeaser, setShowTeaser] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionRef = useRef("");

  // Init session
  useEffect(() => {
    let sid = localStorage.getItem("mana_session_id");
    if (!sid) {
      sid = "lp_" + crypto.randomUUID();
      localStorage.setItem("mana_session_id", sid);
    }
    sessionRef.current = sid;

    const done = localStorage.getItem("mana_contact_done") === "true";
    setContactDone(done);

    if (done) {
      const saved = JSON.parse(localStorage.getItem("mana_messages") || "[]");
      setMessages(saved);
    }

    // Show teaser after 5s
    const t = setTimeout(() => setShowTeaser(true), 5000);
    // Hide teaser after 20s
    const t2 = setTimeout(() => setShowTeaser(false), 20000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, showForm]);

  const saveMessages = useCallback((msgs: Message[]) => {
    localStorage.setItem("mana_messages", JSON.stringify(msgs));
  }, []);

  const addMsg = useCallback(
    (text: string, role: "bot" | "user") => {
      setMessages((prev) => {
        const next = [...prev, { text, role }];
        saveMessages(next);
        return next;
      });
    },
    [saveMessages]
  );

  const toggleChat = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setShowTeaser(false);
        if (firstOpen) {
          setFirstOpen(false);
          if (!contactDone) {
            setMessages([
              {
                text: "Ia ora na ! Je suis MANA, l'assistant IA de PACIFIK'AI. Tu cherches à automatiser, créer une app, un site web, ou autre chose ? Dis-moi tout !",
                role: "bot",
              },
            ]);
            setShowForm(true);
          } else {
            const saved = JSON.parse(localStorage.getItem("mana_messages") || "[]");
            if (saved.length === 0) {
              addMsg(
                "Ia ora na ! Je suis MANA, l'assistant IA de PACIFIK'AI. Tu cherches à automatiser, créer une app, un site web, ou autre chose ? Dis-moi tout !",
                "bot"
              );
            }
          }
        }
        setTimeout(() => inputRef.current?.focus(), 200);
      }
      return next;
    });
  }, [firstOpen, contactDone, addMsg]);

  const submitContact = useCallback(async () => {
    if (!firstName.trim() || !email.trim()) return;

    setShowForm(false);
    setContactDone(true);
    localStorage.setItem("mana_contact_done", "true");

    addMsg(`${firstName} — ${email}`, "user");

    // Save to backend
    fetch(CONTACT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionRef.current,
        name: firstName,
        email,
      }),
    }).catch(() => {});

    // Send to LLM
    setSending(true);
    try {
      const resp = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Je m'appelle ${firstName}, mon email: ${email}.`,
          session_id: sessionRef.current,
          page_url: window.location.href,
        }),
      });
      const data = await resp.json();
      addMsg(
        data.success && data.response
          ? data.response
          : "Mauruuru ! Comment je peux t'aider ?",
        "bot"
      );
    } catch {
      addMsg("Mauruuru ! Comment je peux t'aider ?", "bot");
    }
    setSending(false);
    inputRef.current?.focus();
  }, [firstName, email, addMsg]);

  const sendMessage = useCallback(async () => {
    if (sending || !input.trim()) return;
    const text = input.trim();
    setInput("");
    addMsg(text, "user");
    setSending(true);

    try {
      const resp = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionRef.current,
          page_url: window.location.href,
        }),
      });
      const data = await resp.json();
      addMsg(
        data.success && data.response
          ? data.response
          : "Désolé, petit souci. Écris à contact@pacifikai.com !",
        "bot"
      );
    } catch {
      addMsg("Connexion perdue. Réessaie dans un instant !", "bot");
    }
    setSending(false);
    inputRef.current?.focus();
  }, [sending, input, addMsg]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!showForm) sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      <div
        className={`absolute bottom-[72px] right-0 w-[380px] max-h-[520px] bg-bg-card border border-border-light rounded-2xl flex flex-col overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-250 ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-bg/80 backdrop-blur-sm flex-shrink-0">
          <ManaAvatar size={36} />
          <div>
            <h4 className="text-sm font-semibold">MANA</h4>
            <span className="text-xs text-text-dim flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lagoon animate-pulse-dot" />
              Assistant IA PACIFIK&apos;AI
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesRef}
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13.5px] leading-relaxed animate-[manaFadeIn_0.2s_ease] ${
                msg.role === "bot"
                  ? "bg-bg-card border border-border self-start rounded-bl-sm"
                  : "bg-accent text-white self-end rounded-br-sm"
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.text
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>")
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex gap-1 self-start px-3 py-2 bg-bg-card rounded-xl border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-text-dim animate-[fkBlink_1.4s_infinite]" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-dim animate-[fkBlink_1.4s_infinite_0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-text-dim animate-[fkBlink_1.4s_infinite_0.4s]" />
            </div>
          )}

          {/* Contact form */}
          {showForm && (
            <div className="bg-bg-card border border-accent/20 rounded-xl p-4 flex flex-col gap-2.5 self-start max-w-[90%]">
              <p className="text-xs text-text-secondary">
                Avant de commencer, dis-moi comment te joindre :
              </p>
              <input
                type="text"
                placeholder="Ton prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40"
                autoFocus
              />
              <input
                type="email"
                placeholder="Ton email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40"
              />
              <button
                onClick={submitContact}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                C&apos;est parti !
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-border bg-bg/80 backdrop-blur-sm flex-shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={showForm ? "Remplis le formulaire ci-dessus..." : "Écris ton message..."}
            disabled={showForm}
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 resize-none max-h-20 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={sending || showForm || !input.trim()}
            className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Teaser */}
      <div
        className={`absolute bottom-[72px] right-0 bg-bg-card border border-border-light rounded-xl px-4 py-2.5 shadow-lg transition-all duration-300 cursor-pointer whitespace-nowrap text-sm ${
          showTeaser && !open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        onClick={toggleChat}
      >
        <span className="text-text-secondary">Obtiens ton site internet pro</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowTeaser(false);
          }}
          className="ml-2 text-text-dim hover:text-text"
        >
          &times;
        </button>
      </div>

      {/* Bubble */}
      <button
        onClick={toggleChat}
        className="relative w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(249,112,102,0.3)] hover:shadow-[0_4px_30px_rgba(249,112,102,0.5)] transition-shadow"
        aria-label="Ouvrir le chat MANA"
      >
        <div className={`transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}>
          <ManaAvatar size={56} />
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`absolute inset-0 m-auto w-6 h-6 fill-white transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  );
}
