import HeroHome from "@/components/HeroHome";
import HorizontalRooms from "@/components/HorizontalRooms";
import AnimatedSection from "@/components/AnimatedSection";
import ParallaxImage from "@/components/ParallaxImage";
import Link from "next/link";
import Image from "next/image";
import { activities } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO — 100dvh immersive entrance
          ═══════════════════════════════════════════ */}
      <HeroHome />

      {/* ═══════════════════════════════════════════
          EXPERIENCE — Centered editorial
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-40 px-6">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <p className="font-serif italic text-ink/70 leading-[1.8] mb-0"
            style={{ fontSize: "clamp(1.25rem, 2vw, 1.7rem)" }}
          >
            Niche au bord du plus beau lagon du monde, Povai Lodge vous accueille
            dans l&apos;intimite de trois chambres d&apos;exception, entre ciel
            et mer.
          </p>
        </AnimatedSection>

        {/* Gold decorative line */}
        <AnimatedSection delay={0.3} className="flex justify-center mt-10">
          <div className="w-[60px] h-[1px] bg-gold/50" />
        </AnimatedSection>

        {/* 3 features */}
        <AnimatedSection
          delay={0.2}
          stagger={0.15}
          className="max-w-3xl mx-auto mt-20 grid grid-cols-3 gap-6 md:gap-16 text-center"
        >
          {[
            { label: "3 chambres", sub: "d\u2019exception", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
            { label: "Vue lagon", sub: "panoramique", icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "Bora Bora", sub: "Polynesie", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-4">
              <svg
                className="w-7 h-7 text-lagoon/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={0.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <div>
                <span className="font-serif text-ink text-base md:text-lg block">{item.label}</span>
                <span className="text-[10px] text-ink/40 uppercase tracking-[0.15em] font-sans mt-1 block">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════
          CHAMBRES — Dark section, horizontal scroll
          ═══════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28" style={{ background: "#141414" }}>
        {/* Subtle top transition */}
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, var(--color-sand), #141414)" }}
        />

        <AnimatedSection className="text-center mb-14 px-6 pt-8">
          <p className="text-gold/60 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
            Nos chambres
          </p>
          <h2
            className="font-serif text-white font-light"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Trois refuges d&apos;exception
          </h2>
        </AnimatedSection>

        <HorizontalRooms />

        {/* Bottom transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #141414, var(--color-sand))" }}
        />
      </section>

      {/* ═══════════════════════════════════════════
          ACTIVITES — Asymmetric grid 2x2
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 px-6">
        <AnimatedSection className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-lagoon/60 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
              Experiences
            </p>
            <h2
              className="font-serif text-ink font-light"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Vivez Bora Bora
            </h2>
          </div>

          <div className="activities-grid">
            {activities.map((activity, i) => (
              <AnimatedSection
                key={activity.title}
                delay={i * 0.1}
                direction="clip"
              >
                <div
                  className="relative w-full h-full overflow-hidden group cursor-pointer"
                  style={{ borderRadius: "16px", minHeight: i === 3 ? "250px" : "280px" }}
                >
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
                    sizes={i === 0 || i === 3 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                  />
                  {/* Overlay: recedes on hover */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-700" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <h3
                      className="font-serif text-white font-light transition-transform duration-500 group-hover:-translate-y-1"
                      style={{ fontSize: "clamp(1.5rem, 2vw, 2rem)" }}
                    >
                      {activity.title}
                    </h3>
                    <p className="text-white/0 group-hover:text-white/70 text-sm font-sans mt-2 transition-all duration-600 transform translate-y-4 group-hover:translate-y-0 leading-relaxed max-w-sm">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════
          TEMOIGNAGE — Parallax background with blur
          ═══════════════════════════════════════════ */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <ParallaxImage
          src="/images/povai-hero.png"
          alt="Lagon de Bora Bora"
          className="absolute inset-0"
          speed={0.2}
        />
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

        <AnimatedSection className="relative max-w-3xl mx-auto text-center px-8">
          {/* Giant decorative quotes */}
          <div
            className="font-serif text-gold/[0.12] leading-none select-none pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2"
            style={{ fontSize: "clamp(6rem, 12vw, 14rem)" }}
            aria-hidden="true"
          >
            &ldquo;
          </div>

          <blockquote
            className="font-serif italic text-white leading-[1.5] mb-10 relative z-10 text-balance"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2.5rem)" }}
          >
            Un petit paradis authentique, loin des grands hotels.
            L&apos;accueil de Christian est exceptionnel.
          </blockquote>

          <cite className="text-white/40 text-[11px] font-sans not-italic uppercase tracking-[0.2em] relative z-10">
            Marie &amp; Pierre, Lyon
          </cite>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL — Lagoon background
          ═══════════════════════════════════════════ */}
      <section className="bg-lagoon py-28 md:py-36 px-6 relative overflow-hidden">
        {/* Subtle wave pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />

        <AnimatedSection className="relative max-w-2xl mx-auto text-center">
          <h2
            className="font-serif text-white font-light mb-6"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Reservez votre sejour au paradis
          </h2>
          <p className="text-white/55 text-base mb-12 max-w-md mx-auto font-sans leading-relaxed">
            Trois chambres seulement. Chaque sejour est unique, chaque moment
            est precieux.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="px-8 py-4 bg-white text-lagoon-deep rounded-full font-sans text-[11px] uppercase tracking-[0.15em] hover:bg-gold hover:text-white transition-all duration-500 inline-block"
            >
              Verifier les disponibilites
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-white/30 text-white rounded-full font-sans text-[11px] uppercase tracking-[0.15em] hover:bg-white/10 transition-all duration-500 inline-block"
            >
              Nous contacter
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
