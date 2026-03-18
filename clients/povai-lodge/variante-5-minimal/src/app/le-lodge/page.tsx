import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le Lodge — POVAI LODGE",
  description:
    "Un havre de paix sur les rives du plus beau lagon du monde. Découvrez Povai Lodge à Bora Bora.",
};

const activites = [
  "Plongée libre dans le lagon",
  "Kayak au coucher du soleil",
  "Excursion en pirogue traditionnelle",
  "Observation des raies manta",
  "Randonnée sur le mont Pahia",
  "Pique-nique sur un motu privé",
  "Cours de cuisine polynésienne",
  "Massage traditionnel taurumi",
];

export default function LeLodgePage() {
  return (
    <>
      {/* Header spacer */}
      <div className="h-24" />

      {/* Hero image */}
      <section className="relative w-full h-[70vh]">
        <Image
          src="/images/povai-lodge-ext.png"
          alt="Povai Lodge — vue extérieure"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </section>

      {/* Editorial text */}
      <FadeIn>
        <section className="py-24 md:py-32 px-6 flex items-center justify-center">
          <div className="max-w-prose-lg text-center">
            <h1 className="font-serif font-light text-3xl md:text-5xl tracking-wide mb-8">
              Le Lodge
            </h1>
            <p className="font-serif italic font-light text-xl md:text-2xl leading-relaxed text-muted">
              Sur la côte ouest de Bora Bora, face au soleil couchant, Povai
              Lodge accueille les voyageurs en quête de simplicité et de beauté.
              Trois chambres seulement, pour préserver l&apos;intimité de chaque
              séjour.
            </p>
          </div>
        </section>
      </FadeIn>

      {/* Bora Bora section */}
      <FadeIn>
        <section className="px-6 md:px-12 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif font-light text-2xl md:text-3xl tracking-wide mb-6">
              Bora Bora
            </h2>
            <p className="text-muted leading-relaxed max-w-prose-lg mb-12">
              Surnommée la Perle du Pacifique, Bora Bora est une île de
              Polynésie française située à 230 km au nord-ouest de Tahiti. Son
              lagon aux nuances infinies de bleu et turquoise en fait l&apos;une
              des plus belles destinations au monde.
            </p>

            {/* Map */}
            <div className="w-full aspect-[16/9] bg-gray-50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15134.684073027!2d-151.7414!3d-16.5004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x76bdcee0e9d4c5e7%3A0x5b6db6bde9c1780!2sBora-Bora!5e0!3m2!1sfr!2spf!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation de Bora Bora"
              />
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Activities */}
      <FadeIn>
        <section className="px-6 md:px-12 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif font-light text-2xl md:text-3xl tracking-wide mb-12">
              Activités
            </h2>
            <ul className="space-y-4">
              {activites.map((activite, i) => (
                <li
                  key={activite}
                  className="flex items-baseline gap-4 text-base md:text-lg"
                >
                  <span className="text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif font-light">{activite}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </FadeIn>

      {/* Images activites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 md:px-12 pb-24">
        <div className="relative h-[50vh]">
          <Image
            src="/images/povai-plongee.png"
            alt="Plongée dans le lagon de Bora Bora"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="relative h-[50vh]">
          <Image
            src="/images/povai-kayak.png"
            alt="Kayak au coucher du soleil"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </>
  );
}
