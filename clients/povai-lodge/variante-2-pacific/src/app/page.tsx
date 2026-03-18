"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import RoomCard from "@/components/RoomCard";
import { useLang } from "@/lib/useLang";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { rooms, testimonials } from "@/lib/data";

export default function HomePage() {
  const { lang, toggleLang, t } = useLang();
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        const bg = heroRef.current.querySelector(".hero-bg") as HTMLElement;
        if (bg) {
          bg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar lang={lang} toggleLang={toggleLang} t={t} />

      {/* Hero Section - Split Layout */}
      <section ref={heroRef} className="min-h-dvh grid grid-cols-1 lg:grid-cols-2">
        {/* Left - Content */}
        <div className="flex items-center bg-offwhite-200 px-6 sm:px-12 lg:px-20 py-32 lg:py-20 order-2 lg:order-1">
          <div className="max-w-xl">
            <div className="animate-fade-in-down">
              <span className="inline-block text-coral-500 text-sm tracking-[0.3em] uppercase mb-4 font-semibold">
                Bora Bora, Polynesie francaise
              </span>
            </div>
            <h1 className="animate-fade-in-up font-heading text-4xl sm:text-5xl lg:text-6xl text-ocean-500 font-extrabold leading-[1.1] mb-6">
              {t.hero.title}
            </h1>
            <p
              className="animate-fade-in-up text-gray-600 text-lg leading-relaxed mb-10 max-w-md"
              style={{ animationDelay: "200ms" }}
            >
              {t.hero.subtitle}
            </p>
            <div
              className="animate-fade-in-up flex flex-wrap gap-4"
              style={{ animationDelay: "400ms" }}
            >
              <Link
                href="/reservation"
                className="bg-ocean-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-ocean-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-ocean-500/20"
              >
                {t.hero.cta}
              </Link>
              <Link
                href="/chambres"
                className="border-2 border-ocean-300 text-ocean-500 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-ocean-50 transition-all duration-300"
              >
                {t.hero.discover}
              </Link>
            </div>
          </div>
        </div>
        {/* Right - Image */}
        <div className="relative min-h-[50vh] lg:min-h-full order-1 lg:order-2 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80"
            alt="Bora Bora lagoon"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-black/5" />
        </div>
      </section>

      <div ref={sectionRef}>
        {/* Trust Bar */}
        <section className="bg-offwhite-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center">
              {[
                { value: "3", label: lang === "fr" ? "Chambres exclusives" : "Exclusive rooms" },
                { value: "5/5", label: lang === "fr" ? "Note voyageurs" : "Guest rating" },
                { value: "100%", label: lang === "fr" ? "Vue lagon" : "Lagoon views" },
                { value: "24h", label: lang === "fr" ? "Accueil personnalise" : "Personal welcome" },
              ].map((stat) => (
                <div key={stat.label} className="animate-on-scroll">
                  <p className="font-heading text-3xl sm:text-4xl font-bold text-ocean-500">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rooms Preview */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-on-scroll">
              <span className="text-ocean-500 text-sm tracking-[0.2em] uppercase font-medium">
                {lang === "fr" ? "Nos espaces" : "Our spaces"}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-3">
                {t.rooms.title}
              </h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
                {t.rooms.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, i) => (
                <RoomCard key={room.id} room={room} lang={lang} t={t} index={i} />
              ))}
            </div>

            <div className="text-center mt-12 animate-on-scroll">
              <Link
                href="/chambres"
                className="inline-flex items-center gap-2 text-ocean-500 font-semibold hover:text-ocean-600 transition-colors group"
              >
                {t.rooms.viewAll}
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* About Preview */}
        <section className="py-20 bg-offwhite-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="animate-on-scroll">
                <span className="text-ocean-500 text-sm tracking-[0.2em] uppercase font-medium">
                  {lang === "fr" ? "A propos" : "About"}
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-6">
                  {lang === "fr"
                    ? "Un accueil authentiquement polynesien"
                    : "An authentically Polynesian welcome"}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">{t.lodge.storyText1}</p>
                <p className="text-gray-600 leading-relaxed mb-8">{t.lodge.storyText2}</p>
                <Link
                  href="/lodge"
                  className="inline-flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-600 transition-colors"
                >
                  {lang === "fr" ? "Decouvrir le lodge" : "Discover the lodge"}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <div className="animate-on-scroll grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-48 rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&q=80"
                      alt="Bora Bora view"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="relative h-64 rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80"
                      alt="Lodge terrace"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-64 rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&q=80"
                      alt="Beach"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="relative h-48 rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80"
                      alt="Snorkeling"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-on-scroll">
              <span className="text-ocean-500 text-sm tracking-[0.2em] uppercase font-medium">
                {lang === "fr" ? "Temoignages" : "Testimonials"}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-3">
                {lang === "fr" ? "Ce que disent nos hotes" : "What our guests say"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((review, i) => (
                <div
                  key={review.id}
                  className="animate-on-scroll bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 italic">
                    &ldquo;{lang === "fr" ? review.textFr : review.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src={review.avatar} alt={review.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                      <p className="text-gray-400 text-xs">{review.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
              alt="Bora Bora sunset"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-500/80 to-sky-500/80" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center animate-on-scroll">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white font-bold mb-6">
              {lang === "fr" ? "Pret a vivre l'experience Bora Bora ?" : "Ready to experience Bora Bora?"}
            </h2>
            <p className="text-white/85 text-lg mb-10 max-w-xl mx-auto">
              {lang === "fr"
                ? "Reservez votre sejour au Povai Lodge et decouvrez le paradis polynesien."
                : "Book your stay at Povai Lodge and discover the Polynesian paradise."}
            </p>
            <Link
              href="/reservation"
              className="inline-block bg-white text-ocean-500 px-10 py-4 rounded-full text-lg font-bold hover:bg-offwhite-100 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              {t.hero.cta}
            </Link>
          </div>
        </section>
      </div>

      <Footer t={t} />
      <WhatsAppButton label={t.common.whatsapp} />
    </>
  );
}
