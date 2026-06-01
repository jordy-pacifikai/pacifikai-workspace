"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import SectionTitle from "@/components/SectionTitle";

type ContactForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  domain: string;
  message: string;
  website: string; // honeypot
};

type SubmitStatus =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success" }
  | { state: "error"; message: string };

const DOMAIN_VALUES = [
  { value: "", key: "domainPlaceholder" as const },
  { value: "mobilites", key: "domainMobilites" as const },
  { value: "infrastructures", key: "domainInfrastructures" as const },
  { value: "environnement", key: "domainEnvironnement" as const },
  { value: "transformation", key: "domainTransformation" as const },
  { value: "autre", key: "domainOther" as const },
];

export default function ContactPage() {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const locale = useLocale();
  const t = useTranslations("contact");
  const tForm = useTranslations("contact.form");
  const tSidebar = useTranslations("contact.sidebar");
  const [form, setForm] = useState<ContactForm>({
    name: "",
    company: "",
    email: "",
    phone: "",
    domain: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status.state === "error" || status.state === "success") {
      setStatus({ state: "idle" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.name.trim()) newErrors.name = tForm("required");
    if (!form.email.trim()) newErrors.email = tForm("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = tForm("invalidEmail");
    if (!form.message.trim()) newErrors.message = tForm("required");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus({ state: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          domain: form.domain,
          message: form.message,
          locale,
          website: form.website,
        }),
      });

      if (res.ok) {
        setStatus({ state: "success" });
        setForm({ name: "", company: "", email: "", phone: "", domain: "", message: "", website: "" });
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const errKey =
        res.status === 429
          ? "errorRateLimit"
          : res.status === 400 && data.error?.toLowerCase().includes("long")
            ? "errorTooLong"
            : res.status === 400
              ? "errorRequired"
              : "errorGeneric";
      setStatus({ state: "error", message: tForm(errKey) });
    } catch {
      setStatus({ state: "error", message: tForm("errorGeneric") });
    }
  };

  const inputClasses =
    "w-full px-4 py-3.5 bg-white border border-navy-100/60 rounded-xl text-sm text-navy placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all duration-200";

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/hero-contact.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 overlay-hero" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
          <div className="gsap-reveal">
            <SectionTitle
              label={t("hero.label")}
              title={t("hero.title")}
              description={t("hero.intro")}
              light
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Honeypot — hidden from humans, bots fill it */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <label htmlFor="pbc-website-hp">Website (do not fill)</label>
                  <input
                    id="pbc-website-hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2" htmlFor="pbc-name">
                      {tForm("name")} <span className="text-gold">*</span>
                    </label>
                    <input
                      id="pbc-name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={inputClasses}
                      placeholder={tForm("namePlaceholder")}
                      disabled={status.state === "sending"}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-500" role="alert">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2" htmlFor="pbc-company">
                      {tForm("company")}
                    </label>
                    <input
                      id="pbc-company"
                      type="text"
                      autoComplete="organization"
                      maxLength={160}
                      value={form.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      className={inputClasses}
                      placeholder={tForm("companyPlaceholder")}
                      disabled={status.state === "sending"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2" htmlFor="pbc-email">
                      {tForm("email")} <span className="text-gold">*</span>
                    </label>
                    <input
                      id="pbc-email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={inputClasses}
                      placeholder={tForm("emailPlaceholder")}
                      disabled={status.state === "sending"}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-500" role="alert">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2" htmlFor="pbc-phone">
                      {tForm("phone")}
                    </label>
                    <input
                      id="pbc-phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputClasses}
                      placeholder={tForm("phonePlaceholder")}
                      disabled={status.state === "sending"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2" htmlFor="pbc-domain">
                    {tForm("domain")}
                  </label>
                  <select
                    id="pbc-domain"
                    value={form.domain}
                    onChange={(e) => updateField("domain", e.target.value)}
                    className={`${inputClasses} bg-white`}
                    disabled={status.state === "sending"}
                  >
                    {DOMAIN_VALUES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {tForm(opt.key)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy mb-2" htmlFor="pbc-message">
                    {tForm("message")} <span className="text-gold">*</span>
                  </label>
                  <textarea
                    id="pbc-message"
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    rows={5}
                    required
                    maxLength={6000}
                    className={`${inputClasses} resize-none`}
                    placeholder={tForm("messagePlaceholder")}
                    disabled={status.state === "sending"}
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-red-500" role="alert">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status.state === "sending"}
                  className="w-full sm:w-auto min-h-[44px] px-10 py-4 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-400 disabled:bg-gold/60 disabled:cursor-not-allowed transition-all duration-300 text-sm shadow-glow-gold/0 hover:shadow-glow-gold inline-flex items-center justify-center gap-3"
                >
                  {status.state === "sending" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      {tForm("submitting")}
                    </>
                  ) : (
                    tForm("submit")
                  )}
                </button>

                {status.state === "success" && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-start gap-3"
                  >
                    <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
                    </svg>
                    <span>{tForm("success")}</span>
                  </div>
                )}

                {status.state === "error" && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3"
                  >
                    <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" clipRule="evenodd" />
                    </svg>
                    <span>{status.message}</span>
                  </div>
                )}

                <p className="text-xs text-warm-300 mt-2">
                  {tForm("submitHint")}
                </p>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sidebar image */}
              <div className="gsap-reveal rounded-3xl overflow-hidden">
                <Image
                  src="/images/pbc-in-airport.jpg"
                  alt={tSidebar("sidebarImageAlt")}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
              {/* Contact Info */}
              <div className="gsap-reveal p-8 bg-navy-50/40 border border-navy-100/30 rounded-3xl">
                <h3 className="font-display text-lg font-bold text-navy mb-6">
                  {tSidebar("coordinates")}
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      label: tSidebar("location"),
                      value: tSidebar("locationValue"),
                      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                      icon2: "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
                    },
                    {
                      label: tSidebar("phone"),
                      value: "+689 87 747 284",
                      href: "tel:+68987747284",
                      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                    },
                    {
                      label: tSidebar("email"),
                      value: "contact@pacificblueconsulting.org",
                      href: "mailto:contact@pacificblueconsulting.org",
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
                  {tSidebar("territoriesTitle")}
                </h3>
                <ul className="space-y-3 text-sm text-warm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    {tSidebar("territory1")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    {tSidebar("territory2")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    {tSidebar("territory3")}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    {tSidebar("territory4")}
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
