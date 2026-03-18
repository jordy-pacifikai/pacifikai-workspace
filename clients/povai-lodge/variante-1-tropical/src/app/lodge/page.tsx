"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLang } from "@/lib/useLang";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { activities } from "@/lib/data";

export default function LodgePage() {
  const { lang, toggleLang, t } = useLang();
  const sectionRef = useScrollAnimation<HTMLDivElement>();

  return (
    <>
      <Navbar lang={lang} toggleLang={toggleLang} t={t} />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/povai-lodge-ext.png"
            alt="Bora Bora panorama"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white font-bold animate-fade-in-up">
            {t.lodge.title}
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {t.lodge.subtitle}
          </p>
        </div>
      </section>

      <div ref={sectionRef}>
        {/* Story */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="animate-on-scroll">
                <span className="text-turquoise-500 text-sm tracking-[0.2em] uppercase font-medium">
                  Povai Lodge
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">
                  {t.lodge.story}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-lg">{t.lodge.storyText1}</p>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">{t.lodge.storyText2}</p>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", label: lang === "fr" ? "Accueil chaleureux" : "Warm welcome" },
                    { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: lang === "fr" ? "Authentique PF" : "Authentic PF" },
                    { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", label: lang === "fr" ? "3 chambres uniques" : "3 unique rooms" },
                    { icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707", label: lang === "fr" ? "Vue lagon 360" : "360 lagoon view" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-turquoise-100 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-turquoise-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="animate-on-scroll relative">
                <div className="relative h-[500px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/povai-chambre-mahana.png"
                    alt="Povai Lodge"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-turquoise-500 text-white p-6 rounded-2xl shadow-xl">
                  <p className="font-serif text-3xl font-bold">10+</p>
                  <p className="text-sm text-turquoise-100">
                    {lang === "fr" ? "Annees d'experience" : "Years of experience"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-20 bg-sand-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-on-scroll">
              <span className="text-turquoise-500 text-sm tracking-[0.2em] uppercase font-medium">
                Bora Bora
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
                {t.lodge.location}
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
                {t.lodge.locationText}
              </p>
            </div>
            <div className="animate-on-scroll rounded-2xl overflow-hidden shadow-lg h-[400px] sm:h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30249.64!2d-151.75!3d-16.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x76bdbc8cdbba5d6f%3A0x5b6ad38921a7bc0!2sBora-Bora!5e0!3m2!1sfr!2spf!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Povai Lodge location"
              />
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-on-scroll">
              <span className="text-turquoise-500 text-sm tracking-[0.2em] uppercase font-medium">
                {lang === "fr" ? "A decouvrir" : "Explore"}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-3">
                {t.lodge.activities}
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
                {t.lodge.activitiesText}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((activity, i) => (
                <div
                  key={activity.id}
                  className="animate-on-scroll group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={activity.image}
                      alt={lang === "fr" ? activity.nameFr : activity.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-turquoise-600 text-xs font-bold px-3 py-1 rounded-full">
                      {activity.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
                      {lang === "fr" ? activity.nameFr : activity.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {lang === "fr" ? activity.descriptionFr : activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/povai-hero.png"
              alt="Bora Bora water"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-turquoise-500/80 to-tropical-500/80" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center animate-on-scroll">
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-bold mb-6">
              {lang === "fr"
                ? "Venez vivre l'experience Povai Lodge"
                : "Come experience Povai Lodge"}
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/reservation"
                className="bg-white text-turquoise-500 px-8 py-4 rounded-full text-lg font-bold hover:bg-sand-100 transition-all hover:scale-105 shadow-xl"
              >
                {t.hero.cta}
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer t={t} />
      <WhatsAppButton label={t.common.whatsapp} />
    </>
  );
}
