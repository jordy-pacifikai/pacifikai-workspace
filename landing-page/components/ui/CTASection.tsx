"use client";

import { useState, FormEvent } from "react";
import SectionReveal from "@/components/effects/SectionReveal";

export default function CTASection() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.name.trim()) return;
    setStatus("loading");
    try {
      const resp = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors";

  return (
    <section id="contact" className="section-padding">
      <div className="max-w-2xl mx-auto">
        <SectionReveal>
          <div className="glass rounded-3xl p-8 md:p-12 border border-accent/20 reveal-child">
            <div className="text-center mb-8">
              <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-tight mb-4">
                Parlons de votre <span className="gradient-text-coral">projet</span>
              </h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                Un premier échange simple et sans engagement pour comprendre vos besoins.
              </p>
            </div>

            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#14b8a6]/15 border border-[#14b8a6]/20 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" className="w-6 h-6">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Message envoyé</h3>
                <p className="text-text-secondary text-sm">
                  Merci {form.name.split(" ")[0]} ! On vous répond très vite.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cta-name" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                      Nom complet *
                    </label>
                    <input id="cta-name" type="text" value={form.name} onChange={update("name")} required placeholder="Votre nom" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="cta-email" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                      Email *
                    </label>
                    <input id="cta-email" type="email" value={form.email} onChange={update("email")} required placeholder="votre@email.com" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="cta-company" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                    Entreprise
                  </label>
                  <input id="cta-company" type="text" value={form.company} onChange={update("company")} placeholder="Nom de votre entreprise (optionnel)" className={inputClass} />
                </div>

                <div>
                  <label htmlFor="cta-message" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                    Votre message *
                  </label>
                  <textarea id="cta-message" value={form.message} onChange={update("message")} required rows={4} placeholder="Décrivez votre projet, vos besoins, vos questions..." className={`${inputClass} resize-none`} />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl bg-accent text-bg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "loading" ? "Envoi en cours..." : "Envoyer mon message"}
                </button>

                {status === "error" && (
                  <p className="text-red-400 text-xs text-center">Une erreur est survenue. Réessayez ou écrivez à contact@pacifikai.com</p>
                )}

                <p className="text-text-dim text-[11px] text-center">
                  100% gratuit · Sans engagement · Réponse sous 24h
                </p>
              </form>
            )}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
