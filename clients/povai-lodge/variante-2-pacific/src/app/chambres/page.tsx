"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Lightbox from "@/components/Lightbox";
import { useLang } from "@/lib/useLang";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { rooms } from "@/lib/data";
import { Room } from "@/types";

export default function ChambresPage() {
  const { lang, toggleLang, t } = useLang();
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      <Navbar lang={lang} toggleLang={toggleLang} t={t} />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80"
            alt="Bora Bora bungalows"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white font-bold animate-fade-in-up">
            {t.rooms.title}
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {t.rooms.subtitle}
          </p>
        </div>
      </section>

      <div ref={sectionRef}>
        {/* Room Details */}
        {rooms.map((room: Room, i: number) => (
          <section
            key={room.id}
            className={`py-20 ${i % 2 === 1 ? "bg-offwhite-50" : "bg-white"}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
                {/* Images */}
                <div className={`animate-on-scroll ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="grid grid-cols-2 gap-3">
                    {room.images.map((img, j) => (
                      <button
                        key={j}
                        onClick={() => openLightbox(room.images, j)}
                        className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                          j === 0 ? "col-span-2 h-64 sm:h-80" : "h-40 sm:h-48"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${room.name} - ${j + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes={j === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="animate-on-scroll">
                  <div className="flex items-center gap-3 mb-2">
                    {room.featured && (
                      <span className="bg-ocean-100 text-ocean-700 text-xs font-bold px-3 py-1 rounded-full">
                        {lang === "fr" ? "Populaire" : "Popular"}
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {room.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                    {lang === "fr" ? room.descriptionFr : room.description}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-offwhite-100 rounded-xl p-4 text-center">
                      <svg className="w-6 h-6 text-ocean-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-500">{t.rooms.capacity}</p>
                      <p className="font-semibold">{room.capacity} {t.rooms.persons}</p>
                    </div>
                    <div className="bg-offwhite-100 rounded-xl p-4 text-center">
                      <svg className="w-6 h-6 text-ocean-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <p className="text-sm text-gray-500">{t.rooms.size}</p>
                      <p className="font-semibold">{room.size}</p>
                    </div>
                    <div className="bg-offwhite-100 rounded-xl p-4 text-center">
                      <svg className="w-6 h-6 text-ocean-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">{lang === "fr" ? "Couchage" : "Bedding"}</p>
                      <p className="font-semibold text-sm">{lang === "fr" ? room.bedTypeFr : room.bedType}</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">{t.rooms.amenities}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(lang === "fr" ? room.amenitiesFr : room.amenities).map((amenity) => (
                        <span
                          key={amenity}
                          className="bg-white border border-gray-200 text-gray-600 text-sm px-3 py-1.5 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between p-6 bg-ocean-50 rounded-2xl">
                    <div>
                      <span className="text-sm text-gray-500">{t.rooms.from}</span>
                      <p className="font-heading text-2xl sm:text-3xl font-bold text-ocean-600">
                        {room.priceLabel}
                      </p>
                    </div>
                    <Link
                      href={`/reservation?room=${room.id}`}
                      className="bg-ocean-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-ocean-600 transition-all duration-300 hover:scale-105"
                    >
                      {t.rooms.book}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <Lightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1))}
        onNext={() => setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1))}
      />

      <Footer t={t} />
      <WhatsAppButton label={t.common.whatsapp} />
    </>
  );
}
