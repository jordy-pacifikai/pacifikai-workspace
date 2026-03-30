"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lm_popup_shown";

export default function LeadMagnetPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const show = useCallback(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Exit-intent: mouse leaves viewport at top
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY < 5 && e.relatedTarget === null) {
        show();
      }
    };
    document.addEventListener("mouseout", onMouseOut);

    // Fallback: 45 seconds
    const timer = setTimeout(show, 45_000);

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      clearTimeout(timer);
    };
  }, [show]);

  const close = () => setVisible(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Entrez un email valide.");
      return;
    }

    setStatus("loading");

    try {
      const resp = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "exit-intent-landing" }),
      });
      const data = await resp.json();

      if (data.success) {
        setStatus("success");
      } else {
        throw new Error(data.error || "Erreur serveur");
      }
    } catch {
      setErrorMsg("Une erreur est survenue. Réessayez.");
      setStatus("error");
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="relative w-[90%] max-w-[480px] rounded-2xl border border-white/10 bg-[#0d1220] p-10 shadow-2xl animate-lm-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lm-title"
      >
        {/* Close */}
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 text-2xl leading-none text-text-dim hover:text-text transition-colors"
        >
          &times;
        </button>

        {status === "success" ? (
          /* Success view */
          <div className="flex flex-col items-center text-center py-5 gap-4">
            <span className="text-5xl text-[#14b8a6]">&#10003;</span>
            <h3 className="font-display text-xl font-bold text-text">
              C&rsquo;est prêt&nbsp;!
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Votre guide est en route. Téléchargez-le directement&nbsp;:
            </p>
            <a
              href="/assets/guide-10-workflows-ia.pdf"
              download
              className="mt-2 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-[#14b8a6] transition-colors"
            >
              Télécharger le PDF
            </a>
          </div>
        ) : (
          /* Form view */
          <>
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent mb-4">
              Guide gratuit
            </span>
            <h3
              id="lm-title"
              className="font-display text-2xl font-bold text-text leading-snug mb-2"
            >
              10 Workflows IA pour gagner 10h/semaine
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              Recevez notre guide pratique avec 10 automations concrètes pour votre PME.
              Chatbots, contenu social, extraction de docs, relance devis&hellip;
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex gap-2">
                <label htmlFor="lm-email" className="sr-only">
                  Votre email
                </label>
                <input
                  id="lm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="flex-1 min-h-[44px] rounded-lg border border-white/10 bg-bg px-4 py-3 text-base text-text placeholder:text-text-dim outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="whitespace-nowrap rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-[#14b8a6] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "loading" ? "…" : "Recevoir"}
                </button>
              </div>

              {(status === "error" || errorMsg) && (
                <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
              )}
            </form>

            <p className="mt-3 text-[11px] text-text-dim">
              Pas de spam. Désabonnement en 1 clic.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes lmSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-lm-slide-up {
          animation: lmSlideUp 0.3s ease both;
        }
      `}</style>
    </div>
  );
}
