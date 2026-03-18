"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

const domaines = [
  "Aviation civile & reglementation",
  "Infrastructures aeroportuaires",
  "Environnement & bilan carbone",
  "Biodiversite & impact",
  "AMO & etudes strategiques",
  "Formation & renforcement",
  "Continuite territoriale",
  "Autre",
];

export default function ContactPage() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    nom: "",
    entreprise: "",
    email: "",
    telephone: "",
    domaine: "",
    message: "",
  });

  const [rdvStep, setRdvStep] = useState(0);
  const [rdvData, setRdvData] = useState({
    domaine: "",
    date: "",
    heure: "",
    nom: "",
    email: "",
    telephone: "",
    details: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRdvChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setRdvData({ ...rdvData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send via API
  };

  const handleRdvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRdvStep(4);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero title
      if (heroTitleRef.current) {
        const split = new SplitText(heroTitleRef.current, { type: "chars" });
        gsap.from(split.chars, {
          y: 60,
          opacity: 0,
          stagger: 0.04,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.3,
        });
      }

      // Form slide in
      if (formRef.current) {
        gsap.from(formRef.current, {
          x: -60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
          },
        });
      }

      // Info slide in
      if (infoRef.current) {
        gsap.from(infoRef.current, {
          x: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: infoRef.current,
            start: "top 80%",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-12 md:pt-44 md:pb-16">
        <div className="editorial-container">
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-gold mb-4 block">
            Contact
          </span>
          <h1
            ref={heroTitleRef}
            className="font-serif text-display text-charcoal max-w-3xl"
          >
            Echangeons
          </h1>
        </div>
      </section>

      <div className="separator-line editorial-container" />

      {/* Main contact — 55/45 split */}
      <section className="py-20 md:py-28">
        <div className="editorial-container">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            {/* Form — 55% */}
            <div ref={formRef} className="w-full md:w-[55%]">
              <h2 className="font-serif text-subheading text-charcoal mb-10">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="floating-label-group">
                    <input
                      type="text"
                      name="nom"
                      id="nom"
                      placeholder=" "
                      required
                      value={formData.nom}
                      onChange={handleChange}
                      aria-label="Votre nom"
                    />
                    <label htmlFor="nom">Nom complet</label>
                  </div>
                  <div className="floating-label-group">
                    <input
                      type="text"
                      name="entreprise"
                      id="entreprise"
                      placeholder=" "
                      value={formData.entreprise}
                      onChange={handleChange}
                      aria-label="Votre entreprise"
                    />
                    <label htmlFor="entreprise">
                      Entreprise / Organisation
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="floating-label-group">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder=" "
                      required
                      value={formData.email}
                      onChange={handleChange}
                      aria-label="Votre email"
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                  <div className="floating-label-group">
                    <input
                      type="tel"
                      name="telephone"
                      id="telephone"
                      placeholder=" "
                      value={formData.telephone}
                      onChange={handleChange}
                      aria-label="Votre telephone"
                    />
                    <label htmlFor="telephone">Telephone</label>
                  </div>
                </div>

                <div className="floating-label-group">
                  <select
                    name="domaine"
                    id="domaine"
                    required
                    value={formData.domaine}
                    onChange={handleChange}
                    aria-label="Domaine d'intervention"
                    className={formData.domaine ? "" : "text-charcoal/40"}
                  >
                    <option value="" disabled>
                      Choisir un domaine
                    </option>
                    {domaines.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="domaine">
                    Domaine d&apos;intervention
                  </label>
                </div>

                <div className="floating-label-group">
                  <textarea
                    name="message"
                    id="message"
                    placeholder=" "
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    aria-label="Votre message"
                  />
                  <label htmlFor="message">Votre message</label>
                </div>

                <button type="submit" className="btn-primary group">
                  Envoyer
                  <svg
                    className="w-4 h-4 ml-3 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </form>
            </div>

            {/* Info — 45% */}
            <div ref={infoRef} className="w-full md:w-[45%]">
              <div className="bg-cream-dark rounded-2xl p-8 md:p-10 space-y-8">
                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-4">
                    Adresse
                  </h3>
                  <p className="font-sans text-base text-charcoal">
                    Punaauia, Tahiti
                  </p>
                  <p className="font-sans text-sm text-charcoal/40 font-light">
                    Polynesie francaise
                  </p>
                </div>

                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-4">
                    Telephone
                  </h3>
                  <a
                    href="tel:+68987747284"
                    className="font-sans text-base text-charcoal hover:text-gold transition-colors duration-300"
                  >
                    +689 87 747 284
                  </a>
                </div>

                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-4">
                    Email
                  </h3>
                  <a
                    href="mailto:pacificblueconsulting@zoho.com"
                    className="font-sans text-base text-gold hover:text-gold-light transition-colors duration-300"
                  >
                    pacificblueconsulting@zoho.com
                  </a>
                </div>

                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-4">
                    Horaires
                  </h3>
                  <p className="font-sans text-sm text-charcoal/50 font-light">
                    Lundi — Vendredi
                  </p>
                  <p className="font-sans text-base text-charcoal">
                    8h00 — 17h00 (heure Tahiti)
                  </p>
                </div>

                <div className="separator-line" />

                {/* Map */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-separator">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15268.13!2d-149.58!3d-17.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x769359e80a6a3d:0x2!2sPunaauia!5e0!3m2!1sfr!2spf!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localisation Pacific Blue Consulting a Punaauia"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="separator-line editorial-container" />

      {/* RDV multi-step */}
      <section className="py-20 md:py-28">
        <div className="editorial-container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-heading text-charcoal mb-4">
              Prendre rendez-vous
            </h2>
            <p className="font-sans text-sm text-charcoal/40 font-light">
              Planifiez un echange de 30 minutes avec Pascal
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-14">
            {["Domaine", "Date", "Informations", "Confirmation"].map(
              (step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-[11px] font-medium transition-all duration-500 ${
                      i <= rdvStep
                        ? "bg-gold text-white"
                        : "bg-separator text-charcoal/25"
                    }`}
                  >
                    {i < rdvStep ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-10 md:w-16 h-px transition-colors duration-500 ${
                        i < rdvStep ? "bg-gold" : "bg-separator"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {/* Step 0: Domain */}
          {rdvStep === 0 && (
            <div className="space-y-3">
              <p className="font-sans text-sm text-charcoal/40 mb-6 text-center font-light">
                Quel est le domaine de votre projet ?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domaines.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setRdvData({ ...rdvData, domaine: d });
                      setRdvStep(1);
                    }}
                    className="p-4 text-left border border-separator rounded-xl font-sans text-sm text-charcoal/60 hover:border-gold hover:text-charcoal transition-all duration-500 ease-out-expo font-light"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Date */}
          {rdvStep === 1 && (
            <div className="max-w-md mx-auto space-y-6">
              <p className="font-sans text-sm text-charcoal/40 text-center font-light">
                Domaine :{" "}
                <span className="text-charcoal font-normal">
                  {rdvData.domaine}
                </span>
              </p>
              <div className="floating-label-group">
                <input
                  type="date"
                  name="date"
                  id="rdv-date"
                  value={rdvData.date}
                  onChange={handleRdvChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="!text-charcoal"
                  aria-label="Date souhaitee"
                />
                <label htmlFor="rdv-date">Date souhaitee</label>
              </div>
              <div className="floating-label-group">
                <select
                  name="heure"
                  id="rdv-heure"
                  value={rdvData.heure}
                  onChange={handleRdvChange}
                  required
                  aria-label="Heure preferee"
                >
                  <option value="" disabled>
                    Choisir
                  </option>
                  {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(
                    (h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    )
                  )}
                </select>
                <label htmlFor="rdv-heure">Heure preferee (Tahiti)</label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setRdvStep(0)}
                  className="px-6 py-3 border border-separator text-charcoal/40 font-sans text-sm rounded-lg hover:border-charcoal/20 transition-colors duration-300 font-light"
                >
                  Retour
                </button>
                <button
                  onClick={() =>
                    rdvData.date && rdvData.heure && setRdvStep(2)
                  }
                  className="flex-1 btn-primary !py-3 !text-sm"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Info */}
          {rdvStep === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setRdvStep(3);
              }}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="floating-label-group">
                <input
                  type="text"
                  name="nom"
                  id="rdv-nom"
                  placeholder=" "
                  required
                  value={rdvData.nom}
                  onChange={handleRdvChange}
                  aria-label="Votre nom"
                />
                <label htmlFor="rdv-nom">Nom complet</label>
              </div>
              <div className="floating-label-group">
                <input
                  type="email"
                  name="email"
                  id="rdv-email"
                  placeholder=" "
                  required
                  value={rdvData.email}
                  onChange={handleRdvChange}
                  aria-label="Votre email"
                />
                <label htmlFor="rdv-email">Email</label>
              </div>
              <div className="floating-label-group">
                <input
                  type="tel"
                  name="telephone"
                  id="rdv-telephone"
                  placeholder=" "
                  value={rdvData.telephone}
                  onChange={handleRdvChange}
                  aria-label="Votre telephone"
                />
                <label htmlFor="rdv-telephone">Telephone</label>
              </div>
              <div className="floating-label-group">
                <textarea
                  name="details"
                  id="rdv-details"
                  placeholder=" "
                  rows={3}
                  value={rdvData.details}
                  onChange={handleRdvChange}
                  aria-label="Details du projet"
                />
                <label htmlFor="rdv-details">
                  Details du projet (optionnel)
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRdvStep(1)}
                  className="px-6 py-3 border border-separator text-charcoal/40 font-sans text-sm rounded-lg hover:border-charcoal/20 transition-colors duration-300 font-light"
                >
                  Retour
                </button>
                <button type="submit" className="flex-1 btn-primary !py-3 !text-sm">
                  Verifier
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {rdvStep === 3 && (
            <form onSubmit={handleRdvSubmit} className="max-w-md mx-auto">
              <div className="bg-cream-dark rounded-2xl p-8 space-y-4 mb-8">
                <h3 className="font-sans text-xs font-medium text-charcoal/60 mb-4 uppercase tracking-[0.1em]">
                  Recapitulatif
                </h3>
                {[
                  ["Domaine", rdvData.domaine],
                  ["Date", rdvData.date],
                  ["Heure", `${rdvData.heure} (Tahiti)`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between font-sans text-sm"
                  >
                    <span className="text-charcoal/40 font-light">{label}</span>
                    <span className="text-charcoal">{value}</span>
                  </div>
                ))}
                <div className="separator-line my-2" />
                {[
                  ["Nom", rdvData.nom],
                  ["Email", rdvData.email],
                  ...(rdvData.telephone
                    ? [["Telephone", rdvData.telephone]]
                    : []),
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between font-sans text-sm"
                  >
                    <span className="text-charcoal/40 font-light">{label}</span>
                    <span className="text-charcoal">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRdvStep(2)}
                  className="px-6 py-3 border border-separator text-charcoal/40 font-sans text-sm rounded-lg hover:border-charcoal/20 transition-colors duration-300 font-light"
                >
                  Modifier
                </button>
                <button type="submit" className="flex-1 btn-primary !py-3 !text-sm">
                  Confirmer le rendez-vous
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {rdvStep === 4 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-forest"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-charcoal mb-3">
                Rendez-vous demande
              </h3>
              <p className="font-sans text-base text-charcoal/40 font-light">
                Vous recevrez une confirmation par email sous 24h.
              </p>
              <button
                onClick={() => {
                  setRdvStep(0);
                  setRdvData({
                    domaine: "",
                    date: "",
                    heure: "",
                    nom: "",
                    email: "",
                    telephone: "",
                    details: "",
                  });
                }}
                className="mt-8 px-6 py-3 border border-separator text-charcoal/40 font-sans text-sm rounded-lg hover:border-charcoal/20 transition-colors duration-300 font-light"
              >
                Nouveau rendez-vous
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
