"use client";

import { useState } from "react";
import FloatingInput from "@/components/FloatingInput";
import AnimatedSection from "@/components/AnimatedSection";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lagoon/60 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
            Contact
          </p>
          <h1
            className="font-serif text-ink font-light"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Parlons de votre sejour
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-20">
          {/* Form — 7 cols */}
          <AnimatedSection className="lg:col-span-7">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-10">
                <FloatingInput id="contact-name" label="Votre nom" value={name} onChange={setName} required />
                <FloatingInput id="contact-email" label="Adresse email" type="email" value={email} onChange={setEmail} required />
                <FloatingInput id="contact-phone" label="Telephone" type="tel" value={phone} onChange={setPhone} />

                {/* Custom select */}
                <div className="float-label-group">
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="" disabled>Choisir...</option>
                    <option value="reservation">Reservation</option>
                    <option value="information">Demande d&apos;information</option>
                    <option value="activites">Activites & excursions</option>
                    <option value="autre">Autre</option>
                  </select>
                  <label htmlFor="contact-subject">Sujet</label>
                </div>

                <FloatingInput
                  id="contact-message"
                  label="Votre message"
                  value={message}
                  onChange={setMessage}
                  required
                  textarea
                  rows={5}
                />

                <button
                  type="submit"
                  className="px-10 py-4 bg-lagoon text-white rounded-full font-sans text-[11px] uppercase tracking-[0.15em] hover:bg-lagoon-deep transition-colors duration-500"
                >
                  Envoyer le message
                </button>
              </form>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-lagoon/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-7 h-7 text-lagoon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-ink font-light mb-3">
                  Message envoye
                </h3>
                <p className="text-ink/45 leading-relaxed">
                  Merci pour votre message. Nous vous repondrons dans les
                  plus brefs delais.
                </p>
              </div>
            )}
          </AnimatedSection>

          {/* Info — 5 cols */}
          <AnimatedSection delay={0.2} className="lg:col-span-5">
            <div
              className="bg-sand-100 p-8 md:p-10 h-full"
              style={{ borderRadius: "20px" }}
            >
              <div className="space-y-10">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-lagoon/50 mb-4 font-sans">
                    Telephone
                  </h3>
                  <a
                    href="tel:+68989538387"
                    className="font-serif text-ink text-2xl font-light hover:text-lagoon transition-colors duration-400"
                  >
                    +689 89 53 83 87
                  </a>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-lagoon/50 mb-4 font-sans">
                    Adresse
                  </h3>
                  <p className="text-ink/50 text-[15px] leading-[1.8]">
                    Povai Lodge<br />
                    Bora Bora<br />
                    Polynesie francaise
                  </p>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-lagoon/50 mb-4 font-sans">
                    WhatsApp
                  </h3>
                  <a
                    href="https://wa.me/68989538387"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-full text-[11px] uppercase tracking-[0.1em] hover:bg-[#20BD5A] transition-colors duration-400"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Discuter sur WhatsApp
                  </a>
                </div>

                {/* Map */}
                <div className="overflow-hidden" style={{ borderRadius: "14px", height: "240px" }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30136.51655815394!2d-151.75!3d-16.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x76bd94be3f7e4d47%3A0x7c1c3e36aac15!2sBora-Bora!5e0!3m2!1sfr!2spf!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localisation Povai Lodge"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
