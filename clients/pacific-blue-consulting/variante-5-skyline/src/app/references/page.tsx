"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { references } from "@/lib/data";
import { useState } from "react";

const filters = ["Tous", "Aviation", "Environnement", "AMO"];

export default function ReferencesPage() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  const filtered =
    activeFilter === "Tous"
      ? references
      : references.filter((r) => r.domain === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-off-white relative overflow-hidden">
        <div className="absolute inset-0 geo-grid pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="text-electric font-semibold text-sm uppercase tracking-wider">
            References
          </span>
          <h1
            className="font-display font-bold text-ink mt-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            60+ missions <span className="text-electric">realisees</span>
          </h1>
          <p className="text-slate text-lg mt-4 max-w-2xl">
            De Tahiti aux Marquises, en passant par les Tuamotu et les Australes,
            decouvrez un extrait de nos realisations.
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-12">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded text-sm font-semibold transition-colors ${
                  activeFilter === f
                    ? "bg-electric text-white"
                    : "bg-off-white text-slate hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ref, i) => {
              const domainColor =
                ref.domain === "Environnement"
                  ? "bg-emerald text-white"
                  : ref.domain === "AMO"
                    ? "bg-slate text-white"
                    : "bg-electric text-white";

              return (
                <ScrollReveal key={ref.id} delay={i * 0.08}>
                  <div className="group bg-white border border-gray-100 rounded overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={ref.image}
                        alt={ref.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded ${domainColor}`}
                      >
                        {ref.domain}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-ink text-base mb-2 line-clamp-2">
                        {ref.title}
                      </h3>
                      <p className="text-slate text-sm leading-relaxed line-clamp-2">
                        {ref.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-slate py-12">
              Aucune reference dans cette categorie.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
