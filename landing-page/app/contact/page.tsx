"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export default function ContactPage() {
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

  return (
    <div className="relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-accent opacity-[0.06] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-lagoon opacity-[0.05] blur-[100px]" />
      </div>

      {/* Back link */}
      <div className="relative z-10 pt-28 pb-0 px-6 max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour
        </Link>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-12 pb-8 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Réponse sous 24h
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4">
            Parlons de votre{" "}
            <span className="text-accent">projet</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
            Un premier échange simple et sans engagement pour comprendre vos besoins.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10">

          {/* Left — Info */}
          <div className="space-y-8">
            <div data-tilt className="glass rounded-2xl p-7 border border-white/[0.06]">
              <h3 className="font-display text-base font-semibold mb-4">Comment ça se passe</h3>
              <div className="space-y-4">
                {[
                  { step: "01", text: "Vous nous décrivez votre projet ou votre besoin" },
                  { step: "02", text: "On vous répond sous 24h avec nos premières idées" },
                  { step: "03", text: "On planifie un appel si besoin pour approfondir" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                      {s.step}
                    </span>
                    <p className="text-text-secondary text-sm leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div data-tilt className="glass rounded-2xl p-7 border border-white/[0.06]">
              <h3 className="font-display text-base font-semibold mb-4">Coordonnées</h3>
              <div className="space-y-3">
                <a
                  href="mailto:contact@pacifikai.com"
                  className="flex items-center gap-3 text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-accent flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  contact@pacifikai.com
                </a>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-accent flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Papeete 98714, Tahiti — Polynésie française
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="glass rounded-2xl overflow-hidden border border-white/[0.06]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15271.9!2d-149.5696!3d-17.5351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x76bdbe4b73286f1d%3A0xb44c0790ab92b96!2sPapeete%2C%20Polyn%C3%A9sie%20fran%C3%A7aise!5e0!3m2!1sfr!2spf!4v1"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PACIFIK'AI — Papeete, Tahiti"
              />
            </div>
          </div>

          {/* Right — Form */}
          <div data-tilt data-tilt-max="3" className="glass rounded-2xl p-8 border border-white/[0.06]">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#14b8a6]/15 border border-[#14b8a6]/20 flex items-center justify-center mx-auto mb-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" className="w-7 h-7">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Message envoyé</h3>
                <p className="text-text-secondary text-sm">
                  Merci {form.name.split(" ")[0]} ! On vous répond très vite.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                    Nom complet *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    required
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    required
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                    Entreprise
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={form.company}
                    onChange={update("company")}
                    placeholder="Nom de votre entreprise (optionnel)"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-text-dim uppercase tracking-widest mb-2">
                    Votre message *
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={update("message")}
                    required
                    rows={5}
                    placeholder="Décrivez votre projet, vos besoins, vos questions..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 rounded-xl bg-accent text-bg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "loading" ? "Envoi en cours..." : "Envoyer mon message"}
                </button>

                {status === "error" && (
                  <p className="text-red-400 text-xs text-center">Une erreur est survenue. Réessayez ou écrivez directement à contact@pacifikai.com</p>
                )}

                <p className="text-text-dim text-[11px] text-center">
                  100% gratuit · Sans engagement · Réponse sous 24h
                </p>

                <div className="pt-3 border-t border-white/[0.06] text-center">
                  <p className="text-text-dim text-xs mb-1.5">Ou contactez-nous directement par email</p>
                  <a
                    href="mailto:contact@pacifikai.com"
                    className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline underline-offset-4"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    contact@pacifikai.com
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
