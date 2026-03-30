"use client";

import { useState } from "react";
import Image from "next/image";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import SectionTitle from "@/components/SectionTitle";
import AppointmentBooking from "@/components/AppointmentBooking";

const domainOptions = [
  { value: "", label: "Selectionnez un domaine" },
  { value: "aviation", label: "Aviation civile & Compagnies aeriennes" },
  { value: "aeroports", label: "Aeroports & Infrastructures" },
  { value: "environnement", label: "Environnement & Bilan carbone" },
  { value: "etudes", label: "Etudes strategiques & Modelisation" },
  { value: "amo", label: "AMO & Pilotage de projets" },
  { value: "formation", label: "Formation & Management" },
  { value: "autre", label: "Autre" },
];

type ContactForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  domain: string;
  message: string;
};

export default function ContactPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<"contact" | "rdv">("contact");
  const [form, setForm] = useState<ContactForm>({
    name: "",
    company: "",
    email: "",
    phone: "",
    domain: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.name.trim()) newErrors.name = "Champ obligatoire";
    if (!form.email.trim()) newErrors.email = "Champ obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Email invalide";
    if (!form.message.trim()) newErrors.message = "Champ obligatoire";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const messages = JSON.parse(localStorage.getItem("pbc-messages") || "[]");
    messages.push({
      ...form,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("pbc-messages", JSON.stringify(messages));
    setIsSubmitted(true);
  };

  const inputClasses =
    "w-full px-4 py-3.5 bg-white border border-navy-100/60 rounded-xl text-sm text-navy placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all duration-200";

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/air-tetiaroa.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy/82" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label="Contact"
              title="Parlons de votre projet"
              description="Que vous souhaitiez nous soumettre un projet, poser une question ou prendre rendez-vous, nous sommes a votre ecoute."
              light
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Form / Booking */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="gsap-reveal flex gap-1 p-1.5 bg-navy-50/50 rounded-2xl mb-10">
                <button
                  onClick={() => {
                    setActiveTab("contact");
                    setIsSubmitted(false);
                  }}
                  className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === "contact"
                      ? "bg-white text-navy shadow-elevation-1"
                      : "text-warm hover:text-navy"
                  }`}
                >
                  Formulaire de contact
                </button>
                <button
                  onClick={() => setActiveTab("rdv")}
                  className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === "rdv"
                      ? "bg-white text-navy shadow-elevation-1"
                      : "text-warm hover:text-navy"
                  }`}
                >
                  Prendre rendez-vous
                </button>
              </div>

              {/* Contact Form */}
              {activeTab === "contact" && (
                <>
                  {isSubmitted ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="mt-6 font-display text-2xl font-bold text-navy">
                        Message envoye
                      </h3>
                      <p className="mt-3 text-warm max-w-sm mx-auto">
                        Nous avons bien recu votre message et vous repondrons dans les meilleurs delais.
                      </p>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setForm({ name: "", company: "", email: "", phone: "", domain: "", message: "" });
                        }}
                        className="mt-8 px-6 py-3 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-600 transition-all duration-300"
                      >
                        Envoyer un autre message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Nom complet <span className="text-gold">*</span>
                          </label>
                          <input
                            type="text"
                            autoComplete="name"
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className={inputClasses}
                            placeholder="Jean Dupont"
                          />
                          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Entreprise / Organisation
                          </label>
                          <input
                            type="text"
                            autoComplete="organization"
                            value={form.company}
                            onChange={(e) => updateField("company", e.target.value)}
                            className={inputClasses}
                            placeholder="Votre entreprise"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Email <span className="text-gold">*</span>
                          </label>
                          <input
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className={inputClasses}
                            placeholder="jean@exemple.com"
                          />
                          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-navy mb-2">
                            Telephone
                          </label>
                          <input
                            type="tel"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            className={inputClasses}
                            placeholder="+689 87 000 000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Domaine concerne
                        </label>
                        <select
                          value={form.domain}
                          onChange={(e) => updateField("domain", e.target.value)}
                          className={`${inputClasses} bg-white`}
                        >
                          {domainOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Votre message <span className="text-gold">*</span>
                        </label>
                        <textarea
                          value={form.message}
                          onChange={(e) => updateField("message", e.target.value)}
                          rows={5}
                          className={`${inputClasses} resize-none`}
                          placeholder="Decrivez votre projet, vos enjeux, vos questions..."
                        />
                        {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-10 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 text-sm shadow-glow-gold/0 hover:shadow-glow-gold"
                      >
                        Envoyer le message
                      </button>
                    </form>
                  )}
                </>
              )}

              {activeTab === "rdv" && <AppointmentBooking />}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sidebar image */}
              <div className="gsap-reveal rounded-3xl overflow-hidden">
                <Image
                  src="/images/istock-1401444200.jpg"
                  alt="Drone en vol"
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
              {/* Contact Info */}
              <div className="gsap-reveal p-8 bg-navy-50/40 border border-navy-100/30 rounded-3xl">
                <h3 className="font-display text-lg font-bold text-navy mb-6">
                  Coordonnees
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      label: "Localisation",
                      value: "Polynesie francaise",
                      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                      icon2: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                    },
                    {
                      label: "Telephone",
                      value: "+689 87 747 284",
                      href: "tel:+68987747284",
                      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                    },
                    {
                      label: "Email",
                      value: "pacificblueconsulting@zoho.com",
                      href: "mailto:pacificblueconsulting@zoho.com",
                      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gold/8 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path d={item.icon} />
                          {item.icon2 && <path d={item.icon2} />}
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-steel hover:text-gold transition-colors duration-300 break-all">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-warm mt-0.5 whitespace-pre-line">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/company/pacificblueconsulting/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-3 text-sm text-steel hover:text-gold transition-colors duration-300"
                  >
                    <div className="w-10 h-10 bg-gold/8 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    LinkedIn
                  </a>
                </div>
              </div>

              {/* Expertise */}
              <div className="gsap-reveal p-8 bg-navy-50/40 border border-navy-100/30 rounded-3xl">
                <h3 className="font-display text-lg font-bold text-navy mb-5">
                  Nos domaines
                </h3>
                <ul className="space-y-3 text-sm text-warm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    Conseil strategique et performance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    Expertise aeronautique
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    Transition ecologique et RSE
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    Formation et developpement des competences
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    Certification ISO (9001, 14001, 45001)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    Assistance a maitrise d&apos;ouvrage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
