"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { expertises } from "@/lib/data";

export default function ExpertisesPage() {
  return (
    <>
      {/* Hero compact */}
      <section className="pt-32 pb-16 bg-off-white relative overflow-hidden">
        <div className="absolute inset-0 geo-grid pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-electric font-semibold text-sm uppercase tracking-wider">
            Nos expertises
          </span>
          <h1
            className="font-display font-bold text-ink mt-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Six domaines,
            <br />
            une expertise <span className="text-electric">reconnue</span>
          </h1>
          <p className="text-slate text-lg mt-4 max-w-2xl">
            De la reglementation aeronautique a la conservation marine, nous
            apportons des solutions sur mesure a chaque defi.
          </p>
        </div>
      </section>

      {/* Expertise sections */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          {expertises.map((exp, i) => {
            const isEven = i % 2 === 0;
            const colorClass =
              exp.color === "emerald" ? "bg-emerald" : "bg-electric";
            const colorTextClass =
              exp.color === "emerald" ? "text-emerald" : "text-electric";
            const colorBgClass =
              exp.color === "emerald" ? "bg-emerald/10" : "bg-electric/10";

            return (
              <ScrollReveal key={exp.id}>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    !isEven ? "lg:direction-rtl" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative aspect-[4/3] ${
                      !isEven ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="absolute inset-0 clip-corner-cut overflow-hidden">
                      <Image
                        src={exp.image}
                        alt={exp.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    {/* Accent line */}
                    <div
                      className={`absolute -bottom-2 ${
                        isEven ? "-right-2" : "-left-2"
                      } w-20 h-1 ${colorClass}`}
                    />
                  </div>

                  {/* Text */}
                  <div className={!isEven ? "lg:order-1" : ""}>
                    <span
                      className={`inline-block px-3 py-1 ${colorBgClass} ${colorTextClass} text-xs font-semibold rounded uppercase tracking-wider mb-4`}
                    >
                      {exp.category}
                    </span>
                    <h2 className="font-display font-bold text-ink text-2xl lg:text-3xl mb-4">
                      {exp.title}
                    </h2>
                    <p className="text-slate leading-relaxed mb-6">
                      {exp.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {exp.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-sm text-ink"
                        >
                          <span
                            className={`w-1.5 h-1.5 ${colorClass} rounded-full mt-2 flex-shrink-0`}
                          />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact"
                      className={`inline-flex items-center gap-2 ${colorTextClass} font-semibold text-sm hover:gap-3 transition-all`}
                    >
                      Nous contacter pour cette expertise
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-electric py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-white text-2xl lg:text-3xl mb-4">
            Un projet qui touche plusieurs domaines ?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Notre approche transversale nous permet d&apos;integrer aviation,
            environnement et gestion de projet dans une meme mission.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-electric font-semibold rounded hover:bg-gray-50 transition-colors"
          >
            Parlons de votre projet
          </Link>
        </div>
      </section>
    </>
  );
}
