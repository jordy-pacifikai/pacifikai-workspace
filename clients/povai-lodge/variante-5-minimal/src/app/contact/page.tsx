"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with email API
    setSent(true);
  };

  return (
    <>
      {/* Header spacer */}
      <div className="h-32 md:h-40" />

      <FadeIn>
        <section className="px-6 pb-32 md:pb-40">
          <div className="max-w-lg mx-auto">
            <h1 className="font-serif font-light text-3xl md:text-5xl tracking-wide text-center mb-16">
              Contact
            </h1>

            {sent ? (
              <div className="text-center py-16">
                <p className="font-serif text-xl mb-2">Merci.</p>
                <p className="text-muted text-sm">
                  Nous vous répondrons dans les meilleurs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nom"
                    required
                    className="input-minimal"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    className="input-minimal"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Téléphone (optionnel)"
                    className="input-minimal"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Votre message"
                    rows={4}
                    required
                    className="input-minimal resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="link-underline text-sm uppercase tracking-wider"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            )}

            {/* Coordinates */}
            <div className="mt-24 pt-12 border-t border-gray-100 text-sm text-muted space-y-2 text-center">
              <p>Povai Lodge — Bora Bora, Polynésie française</p>
              <p>+689 89 53 83 87</p>
              <p>contact@povailodge.com</p>
              <p className="pt-4">
                <a
                  href="https://wa.me/68989538387"
                  className="hover:text-ink transition-colors duration-300"
                >
                  Nous écrire sur WhatsApp
                </a>
              </p>
            </div>
          </div>
        </section>
      </FadeIn>
    </>
  );
}
