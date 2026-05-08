"use client";

import Image from "next/image";
import { useState } from "react";

export const dynamic = "force-static";

type PhotoKey = "tropicale" | "blanche" | "nb";
type LayoutKey = "rond" | "portrait";

type Combo = {
  id: string;
  photoKey: PhotoKey;
  photoLabel: string;
  layoutKey: LayoutKey;
  layoutLabel: string;
};

const photos: Record<PhotoKey, { src: string; label: string }> = {
  tropicale: { src: "/images/pascal-portraits/tropicale.png", label: "Chemise tropicale (couleur)" },
  blanche: { src: "/images/pascal-portraits/blanche.png", label: "Chemise blanche (couleur)" },
  nb: { src: "/images/pascal-portraits/nb.png", label: "Chemise blanche (noir & blanc)" },
};

const combos: Combo[] = [
  { id: "tropicale-rond", photoKey: "tropicale", photoLabel: photos.tropicale.label, layoutKey: "rond", layoutLabel: "Cadre rond" },
  { id: "tropicale-portrait", photoKey: "tropicale", photoLabel: photos.tropicale.label, layoutKey: "portrait", layoutLabel: "Rectangle portrait" },
  { id: "blanche-rond", photoKey: "blanche", photoLabel: photos.blanche.label, layoutKey: "rond", layoutLabel: "Cadre rond" },
  { id: "blanche-portrait", photoKey: "blanche", photoLabel: photos.blanche.label, layoutKey: "portrait", layoutLabel: "Rectangle portrait" },
  { id: "nb-rond", photoKey: "nb", photoLabel: photos.nb.label, layoutKey: "rond", layoutLabel: "Cadre rond" },
  { id: "nb-portrait", photoKey: "nb", photoLabel: photos.nb.label, layoutKey: "portrait", layoutLabel: "Rectangle portrait" },
];

function PortraitFrame({ photoKey, layoutKey }: { photoKey: PhotoKey; layoutKey: LayoutKey }) {
  const photo = photos[photoKey];

  if (layoutKey === "rond") {
    return (
      <div className="relative w-full aspect-square max-w-sm mx-auto">
        {/* Halo gold */}
        <div className="absolute -inset-4 bg-gold/15 rounded-full blur-2xl" />
        <div className="absolute -inset-2 bg-gold/30 rounded-full blur-md" />
        {/* Frame */}
        <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-gold/40 shadow-2xl shadow-navy/30">
          <Image
            src={photo.src}
            alt={`Pascal Bazer-Bachi — ${photo.label}`}
            fill
            sizes="(max-width: 1024px) 80vw, 360px"
            className="object-cover object-top"
            priority
          />
        </div>
        {/* Badge */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-navy text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-lg whitespace-nowrap">
          Pascal Bazer-Bachi · <span className="text-gold">Fondateur</span>
        </div>
      </div>
    );
  }

  // Portrait rectangle (3:4)
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="bg-gradient-to-br from-navy-50 to-navy-100/50 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[60px]" />
        <div className="relative z-10 aspect-[3/4]">
          <Image
            src={photo.src}
            alt={`Pascal Bazer-Bachi — ${photo.label}`}
            fill
            sizes="(max-width: 1024px) 80vw, 360px"
            className="object-cover"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-navy/90 to-transparent">
            <h3 className="font-display text-lg font-bold text-white">Pascal Bazer-Bachi</h3>
            <p className="mt-0.5 text-xs text-gold font-medium">Fondateur</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComboSlide({ combo }: { combo: Combo }) {
  const subject = encodeURIComponent("Mon choix photo Le Cabinet");
  const body = encodeURIComponent(
    `Bonjour Jordy,\n\nJ'ai choisi la combinaison suivante pour la page Le Cabinet :\n\n• Photo : ${combo.photoLabel}\n• Cadre : ${combo.layoutLabel}\n\nMerci.\nPascal`
  );
  const mailto = `mailto:jordy@pacifikai.com?subject=${subject}&body=${body}`;

  return (
    <article
      className="group relative snap-center shrink-0 w-full max-w-6xl mx-auto bg-white border border-navy-100/40 rounded-3xl shadow-xl overflow-hidden"
      data-combo-id={combo.id}
    >
      {/* Header tag */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
        <span className="px-3 py-1.5 bg-gold/15 text-gold rounded-full">{combo.photoLabel}</span>
        <span className="px-3 py-1.5 bg-navy/10 text-navy rounded-full">{combo.layoutLabel}</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center p-8 lg:p-14 pt-16 lg:pt-16">
        {/* Photo */}
        <div className="lg:col-span-2">
          <PortraitFrame photoKey={combo.photoKey} layoutKey={combo.layoutKey} />
        </div>

        {/* Texte fondateur (identique au site) */}
        <div className="lg:col-span-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Le fondateur</span>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold text-navy">Pascal Bazer-Bachi</h2>
          <div className="mt-6 space-y-4 text-warm leading-relaxed text-sm lg:text-base">
            <p>
              Trente années dans l&apos;aviation civile, les systèmes satellitaires, la régulation aérienne et le pilotage de projets d&apos;infrastructure - en Europe et dans le Pacifique. Un parcours qui passe par le Centre National d&apos;Études Spatiales, la Direction Générale de l&apos;Aviation Civile, la tutelle du troisième aéroport parisien, la mise en service opérationnelle du système européen de navigation par satellite EGNOS, et la direction de l&apos;Aviation Civile de Polynésie française.
            </p>
            <p>
              De ce parcours, Pascal a tiré une conviction : les projets les plus complexes aboutissent quand on combine la rigueur des systèmes avec l&apos;attention aux personnes qui les font vivre.
            </p>
            <p>
              <strong className="text-navy">Chevalier de l&apos;Ordre National du Mérite</strong>, il a créé Pacific Blue Consulting en 2017.
            </p>
          </div>
        </div>
      </div>

      {/* Hover CTA overlay */}
      <a
        href={mailto}
        className="absolute inset-0 z-30 flex items-center justify-center bg-navy/0 group-hover:bg-navy/55 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
        aria-label={`Choisir ${combo.photoLabel} avec ${combo.layoutLabel}`}
      >
        <span className="px-8 py-4 bg-gold text-navy font-semibold rounded-2xl shadow-2xl text-base lg:text-lg transition-transform duration-300 scale-95 group-hover:scale-100 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Je choisis cette combinaison
        </span>
      </a>
    </article>
  );
}

export default function ChoixPhotoPage() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      {/* Hero */}
      <header className="pt-20 pb-10 lg:pt-28 lg:pb-14 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-4">Pacific Blue Consulting · choix de portrait</span>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-navy leading-tight">
            Bonjour Pascal,<br />
            <span className="text-gold">choisis ta photo + ton cadre</span> pour la page Le&nbsp;Cabinet
          </h1>
          <p className="mt-6 text-warm leading-relaxed text-base lg:text-lg">
            Voici tes <strong className="text-navy">3 photos</strong> du shooting déclinées en <strong className="text-navy">2 cadres</strong> différents,
            placées dans le contexte exact de la page <em>Le Cabinet</em>.
          </p>
          <p className="mt-3 text-sm text-warm-600">
            Survole l&apos;image qui te plaît et clique sur <strong>« Je choisis cette combinaison »</strong>.
            Sur mobile, touche l&apos;image pour faire apparaître le bouton.
          </p>
        </div>
      </header>

      {/* Carousel */}
      <section className="relative pb-12">
        <div
          data-carousel
          className="overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide pb-6"
          style={{ scrollbarWidth: "none" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / el.clientWidth);
            if (idx !== activeIdx) setActiveIdx(idx);
          }}
        >
          <div className="flex gap-6 px-4 lg:px-12">
            {combos.map((combo) => (
              <div key={combo.id} className="snap-center shrink-0 w-[92vw] max-w-6xl">
                <ComboSlide combo={combo} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-2">
          {combos.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Aller au slide ${i + 1}`}
              onClick={() => {
                const wrapper = document.querySelector("[data-carousel]") as HTMLElement | null;
                if (wrapper) wrapper.scrollTo({ left: i * wrapper.clientWidth, behavior: "smooth" });
              }}
              className={`h-2.5 rounded-full transition-all ${i === activeIdx ? "w-8 bg-gold" : "w-2.5 bg-navy-100 hover:bg-navy-200"}`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-warm-500 mt-4 px-4">
          Glisse horizontalement <span className="hidden md:inline">(ou utilise les flèches du clavier)</span> pour parcourir les 6 propositions.
        </p>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 px-4 text-xs text-warm-600">
        <p>Si tu hésites, écris-moi directement sur WhatsApp&nbsp;: <a className="text-navy font-semibold" href="https://wa.me/68989558189">+689 89 55 81 89</a></p>
        <p className="mt-2">Jordy · PACIFIK&apos;AI</p>
      </footer>
    </main>
  );
}
