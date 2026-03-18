"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { rooms, formatXPF } from "@/lib/data";
import AnimatedSection from "@/components/AnimatedSection";
import ParallaxImage from "@/components/ParallaxImage";
import Lightbox from "@/components/Lightbox";

const amenityIcons: Record<string, string> = {
  "Lit king size": "M2.25 7.125C2.25 6.504 2.754 6 3.375 6h17.25c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 10.875v-3.75zM3.75 12h16.5m-16.5 0v6.375c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V12",
  Climatisation: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636",
  "Terrasse privee": "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
  WiFi: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z",
  "Petit-dejeuner inclus": "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .37",
  "Salle de bain": "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function ChambresPage() {
  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  return (
    <>
      {/* Page hero */}
      <section className="relative" style={{ height: "55dvh" }}>
        <ParallaxImage
          src="/images/povai-chambre-miti.png"
          alt="Chambres Povai Lodge"
          className="absolute inset-0"
          speed={0.15}
          priority
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex flex-col justify-end items-center pb-16 px-6">
          <p className="text-gold/60 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
            Nos chambres
          </p>
          <h1
            className="font-serif text-white font-light text-center"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Trois refuges d&apos;exception
          </h1>
        </div>
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--color-sand))" }}
        />
      </section>

      {/* Rooms */}
      {rooms.map((room, roomIndex) => (
        <section key={room.id} id={room.id} className="scroll-mt-20">
          {/* Room hero */}
          <div className="relative" style={{ height: "70dvh" }}>
            <ParallaxImage
              src={room.image}
              alt={room.name}
              className="absolute inset-0"
              speed={0.15}
              scaleOnScroll
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8 md:p-16">
              <p className="text-gold-light/70 text-[10px] uppercase tracking-[0.2em] mb-3 font-sans">
                {room.subtitle}
              </p>
              <h2
                className="font-serif text-white font-light"
                style={{
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}
              >
                {room.name}
              </h2>
            </div>
          </div>

          {/* Room content */}
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28">
            {/* Description + amenities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 mb-20">
              <AnimatedSection>
                <p className="text-ink/60 text-lg leading-[1.9] mb-10">
                  {room.description}
                </p>

                {/* Room stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Surface", value: room.surface },
                    { label: "Capacite", value: `${room.capacity} pers.` },
                    { label: "Vue", value: room.view.replace("Vue ", "") },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-ink/30 font-sans block mb-1">
                        {stat.label}
                      </span>
                      <span className="font-serif text-ink text-base">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-sans mb-8">
                  Equipements
                </h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                  {room.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3">
                      <svg
                        className="w-[18px] h-[18px] text-lagoon/50 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={amenityIcons[amenity] || "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
                        />
                      </svg>
                      <span className="text-sm text-ink/60">{amenity}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Masonry gallery */}
            <AnimatedSection direction="clip">
              <div className="masonry-gallery">
                {room.gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox({ images: room.gallery, index: i })}
                    className={`relative overflow-hidden group cursor-pointer ${
                      i === 0 ? "masonry-tall masonry-wide" : ""
                    }`}
                    style={{ borderRadius: "12px" }}
                    aria-label={`Ouvrir photo ${i + 1} de ${room.name}`}
                  >
                    <Image
                      src={img}
                      alt={`${room.name} - Photo ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-[1000ms] group-hover:scale-110"
                      style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
                      sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </AnimatedSection>

            {/* Pricing table */}
            <AnimatedSection className="mt-20">
              <div className="max-w-lg mx-auto">
                {/* Gold header bar */}
                <div className="bg-gold/10 rounded-t-2xl px-8 py-4">
                  <h3 className="font-serif text-ink text-center text-lg">Tarifs</h3>
                </div>
                <div className="bg-white rounded-b-2xl px-8 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <table className="w-full">
                    <tbody className="divide-y divide-sand-100">
                      {[
                        { label: "Par nuit", price: room.priceNight },
                        { label: "Par semaine", price: room.priceWeek },
                        { label: "Par mois", price: room.priceMonth },
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className="py-4 text-sm text-ink/50">{row.label}</td>
                          <td className="py-4 text-right font-serif text-lg text-lagoon-deep">
                            {formatXPF(row.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedSection>

            {/* CTA */}
            <div className="text-center mt-14">
              <Link
                href={`/reservation?room=${room.id}`}
                className="inline-block px-10 py-4 bg-lagoon text-white rounded-full font-sans text-[11px] uppercase tracking-[0.15em] hover:bg-lagoon-deep transition-colors duration-500"
              >
                Reserver {room.name}
              </Link>
            </div>
          </div>

          {/* Separator */}
          {roomIndex < rooms.length - 1 && (
            <div className="max-w-[1200px] mx-auto px-6 md:px-10">
              <div className="h-[1px] bg-sand-200/50" />
            </div>
          )}
        </section>
      ))}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          currentIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((prev) =>
              prev
                ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }
                : null
            )
          }
          onNext={() =>
            setLightbox((prev) =>
              prev
                ? { ...prev, index: (prev.index + 1) % prev.images.length }
                : null
            )
          }
        />
      )}
    </>
  );
}
