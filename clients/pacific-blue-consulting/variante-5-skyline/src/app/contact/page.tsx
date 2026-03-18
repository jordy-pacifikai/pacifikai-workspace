"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

const rdvSteps = [
  {
    id: 1,
    title: "Type de projet",
    options: ["Aviation civile", "Environnement", "AMO", "Etude strategique", "Autre"],
  },
  {
    id: 2,
    title: "Votre organisme",
    options: [
      "Institution publique",
      "Collectivite",
      "Entreprise privee",
      "ONG / Association",
      "Autre",
    ],
  },
  {
    id: 3,
    title: "Echeance souhaitee",
    options: [
      "Urgent (< 1 mois)",
      "Court terme (1-3 mois)",
      "Moyen terme (3-6 mois)",
      "A planifier",
    ],
  },
  {
    id: 4,
    title: "Budget estimatif",
    options: [
      "< 1 000 000 XPF",
      "1 - 5 000 000 XPF",
      "5 - 15 000 000 XPF",
      "> 15 000 000 XPF",
      "A definir",
    ],
  },
];

export default function ContactPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    organisme: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (stepId: number, option: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: option }));
    if (currentStep < rdvSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-off-white relative overflow-hidden">
        <div className="absolute inset-0 geo-grid pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-electric font-semibold text-sm uppercase tracking-wider">
            Contact
          </span>
          <h1
            className="font-display font-bold text-ink mt-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Parlons de votre <span className="text-electric">projet</span>
          </h1>
          <p className="text-slate text-lg mt-4 max-w-2xl">
            Chaque mission est unique. Decrivez-nous votre besoin et nous vous
            proposerons une approche sur mesure.
          </p>
        </div>
      </section>

      {/* Contact form + Info */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form — 60% */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                {submitted ? (
                  <div className="bg-emerald-light border border-emerald/20 rounded p-8 text-center">
                    <div className="w-16 h-16 bg-emerald/10 text-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-ink text-xl mb-2">
                      Message envoye
                    </h3>
                    <p className="text-slate">
                      Nous vous repondrons dans les 48 heures. Mauruuru.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nom}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, nom: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded bg-white text-ink placeholder:text-gray-400 focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-colors"
                          placeholder="Votre nom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded bg-white text-ink placeholder:text-gray-400 focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-colors"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-2">
                          Telephone
                        </label>
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              telephone: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded bg-white text-ink placeholder:text-gray-400 focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-colors"
                          placeholder="+689 87 ..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-2">
                          Organisme
                        </label>
                        <input
                          type="text"
                          value={formData.organisme}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              organisme: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded bg-white text-ink placeholder:text-gray-400 focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-colors"
                          placeholder="Votre organisme"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-ink mb-2">
                        Votre message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            message: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded bg-white text-ink placeholder:text-gray-400 focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-colors resize-none"
                        placeholder="Decrivez votre projet ou votre besoin..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-4 bg-electric text-white font-semibold rounded hover:bg-blue-700 transition-colors text-lg"
                    >
                      Envoyer le message
                    </button>
                  </form>
                )}
              </ScrollReveal>
            </div>

            {/* Info — 40% */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.2}>
                <div className="bg-off-white rounded p-8 space-y-8">
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg mb-4">
                      Coordonnees
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-electric/10 text-electric rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div>
                          <span className="text-ink font-medium text-sm block">
                            Adresse
                          </span>
                          <span className="text-slate text-sm">
                            Punaauia, Tahiti
                            <br />
                            Polynesie francaise
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-electric/10 text-electric rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </div>
                        <div>
                          <span className="text-ink font-medium text-sm block">
                            Telephone
                          </span>
                          <a
                            href="tel:+68987747284"
                            className="text-electric text-sm hover:underline"
                          >
                            +689 87 747 284
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-electric/10 text-electric rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </div>
                        <div>
                          <span className="text-ink font-medium text-sm block">
                            Email
                          </span>
                          <a
                            href="mailto:pacificblueconsulting@zoho.com"
                            className="text-electric text-sm hover:underline break-all"
                          >
                            pacificblueconsulting@zoho.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30286.6!2d-149.58!3d-17.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x76bdfe7a5e960f93%3A0x7c0565e21b4f41ff!2sPunaauia%2C+Polyn%C3%A9sie+fran%C3%A7aise!5e0!3m2!1sfr!2sfr"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Pacific Blue Consulting — Punaauia, Tahiti"
                    />
                  </div>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded hover:border-electric transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm font-medium text-ink">
                      Suivez-nous sur LinkedIn
                    </span>
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* RDV Multi-steps */}
      <section className="py-24 bg-off-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-electric font-semibold text-sm uppercase tracking-wider">
                Rendez-vous
              </span>
              <h2
                className="font-display font-bold text-ink mt-3"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Precisez votre besoin
              </h2>
              <p className="text-slate mt-3">
                4 questions rapides pour mieux cibler notre premier echange.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded p-8 border border-gray-100">
              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                {rdvSteps.map((step, i) => (
                  <div key={step.id} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer ${
                        i <= currentStep
                          ? "bg-electric text-white"
                          : selections[step.id]
                            ? "bg-electric/20 text-electric"
                            : "bg-gray-100 text-slate"
                      }`}
                      onClick={() => setCurrentStep(i)}
                    >
                      {selections[step.id] ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    {i < rdvSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${
                          i < currentStep ? "bg-electric" : "bg-gray-100"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Current step */}
              <div>
                <h3 className="font-display font-semibold text-ink text-lg mb-4">
                  {rdvSteps[currentStep].title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rdvSteps[currentStep].options.map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        handleSelect(rdvSteps[currentStep].id, option)
                      }
                      className={`px-4 py-3 border rounded text-sm font-medium text-left transition-colors ${
                        selections[rdvSteps[currentStep].id] === option
                          ? "border-electric bg-electric/5 text-electric"
                          : "border-gray-200 text-ink hover:border-electric"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {Object.keys(selections).length === rdvSteps.length && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="font-display font-semibold text-ink text-sm mb-3">
                    Recapitulatif
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {rdvSteps.map((step) => (
                      <div key={step.id} className="text-sm">
                        <span className="text-slate block text-xs">
                          {step.title}
                        </span>
                        <span className="text-ink font-medium">
                          {selections[step.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="mailto:pacificblueconsulting@zoho.com"
                    className="inline-block px-6 py-3 bg-electric text-white font-semibold rounded hover:bg-blue-700 transition-colors"
                  >
                    Confirmer et envoyer par email
                  </a>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
