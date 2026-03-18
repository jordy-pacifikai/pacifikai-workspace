import Image from "next/image";
import AnimatedSection from "@/components/AnimatedSection";
import ParallaxImage from "@/components/ParallaxImage";
import { surroundingActivities } from "@/lib/data";

export default function LeLodgePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative" style={{ height: "55dvh" }}>
        <ParallaxImage
          src="/images/povai-lodge-ext.png"
          alt="Vue panoramique de Bora Bora"
          className="absolute inset-0"
          speed={0.15}
          priority
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative h-full flex flex-col justify-end items-center pb-16 px-6">
          <p className="text-gold/60 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
            Le Lodge
          </p>
          <h1
            className="font-serif text-white font-light text-center"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Notre histoire
          </h1>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--color-sand))" }}
        />
      </section>

      {/* Notre histoire — Editorial asymmetric */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-8 items-center">
          {/* Text (5 cols) */}
          <AnimatedSection className="lg:col-span-5 lg:pr-8">
            <p className="text-lagoon/50 text-[10px] uppercase tracking-[0.25em] mb-6 font-sans">
              Authenticite polynesienne
            </p>
            <h2
              className="font-serif text-ink font-light mb-10"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Un refuge entre ciel et mer
            </h2>
            <div className="space-y-6 text-ink/50 text-[15px] leading-[1.9]">
              <p>
                Povai Lodge est ne d&apos;un reve simple : partager la beaute
                brute de Bora Bora avec des voyageurs en quete d&apos;authenticite.
                Loin des grands complexes hoteliers, notre lodge vous accueille
                dans l&apos;intimite de trois chambres soigneusement amenagees.
              </p>
              <p>
                Christian, votre hote, est un enfant de l&apos;ile. Sa
                connaissance intime du lagon, de ses recifs et de ses secrets
                fera de votre sejour une experience inoubliable. Ici, le temps
                ralentit, la nature reprend ses droits, et chaque matin commence
                par un spectacle unique sur le Mont Otemanu.
              </p>
              <p>
                Nous croyons qu&apos;un sejour reussi passe par l&apos;attention aux
                details : un petit-dejeuner avec des fruits frais du jardin,
                des conseils personnalises pour vos excursions, et cette
                chaleur humaine qui fait la reputation de la Polynesie.
              </p>
            </div>
          </AnimatedSection>

          {/* Image (7 cols) — overflows right for editorial feel */}
          <AnimatedSection delay={0.2} direction="clip" className="lg:col-span-7">
            <div
              className="relative overflow-hidden lg:-mr-16"
              style={{ aspectRatio: "4/5", borderRadius: "16px" }}
            >
              <Image
                src="/images/povai-chambre-mahana.png"
                alt="Bora Bora depuis le lodge"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Bora Bora — Island section */}
      <section className="bg-white py-28 md:py-36 px-6">
        <div className="max-w-[1200px] mx-auto">
          <AnimatedSection className="text-center mb-20">
            <p className="text-lagoon/50 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
              L&apos;ile
            </p>
            <h2
              className="font-serif text-ink font-light mb-6"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Bora Bora
            </h2>
            <p className="text-ink/45 text-base max-w-2xl mx-auto leading-[1.8]">
              Surnommee la &laquo; Perle du Pacifique &raquo;, Bora Bora est une ile
              volcanique de la Polynesie francaise, celebre pour son lagon aux
              nuances de bleu incomparables.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Map */}
            <AnimatedSection direction="clip">
              <div className="overflow-hidden h-[420px]" style={{ borderRadius: "20px" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30136.51655815394!2d-151.75!3d-16.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x76bd94be3f7e4d47%3A0x7c1c3e36aac15!2sBora-Bora!5e0!3m2!1sfr!2spf!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Carte de Bora Bora"
                />
              </div>
            </AnimatedSection>

            {/* Info blocks */}
            <AnimatedSection delay={0.2} stagger={0.1}>
              {[
                {
                  title: "Comment y acceder",
                  text: "Bora Bora est accessible en avion depuis Papeete (Tahiti) avec Air Tahiti. Le vol dure environ 50 minutes et offre une vue spectaculaire sur les atolls. A votre arrivee, un transfert en bateau vous conduira directement au lodge.",
                },
                {
                  title: "Le lagon",
                  text: "Le lagon de Bora Bora est considere comme l'un des plus beaux au monde. Ses eaux chaudes et cristallines abritent une faune marine exceptionnelle : raies manta, requins a pointe noire, tortues et des centaines d'especes de poissons tropicaux.",
                },
                {
                  title: "Le Mont Otemanu",
                  text: "Culminant a 727 metres, ce pic volcanique emblematique domine l'ile et offre un decor de carte postale vu depuis le lodge.",
                },
              ].map((item) => (
                <div key={item.title} className="mb-10 last:mb-0">
                  <h3 className="font-serif text-ink text-lg font-light mb-3">
                    {item.title}
                  </h3>
                  <p className="text-ink/45 text-[15px] leading-[1.8]">
                    {item.text}
                  </p>
                </div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Activites aux alentours */}
      <section className="py-28 md:py-36 px-6">
        <AnimatedSection className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-lagoon/50 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
              A decouvrir
            </p>
            <h2
              className="font-serif text-ink font-light"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Activites aux alentours
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {surroundingActivities.map((activity, i) => (
              <AnimatedSection key={activity.title} delay={i * 0.08} direction="clip">
                <div
                  className="relative overflow-hidden group"
                  style={{ aspectRatio: "4/3", borderRadius: "14px" }}
                >
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    style={{ transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)" }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-white text-lg font-light mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-white/50 text-sm font-sans leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Engagement — Tourisme responsable */}
      <section className="relative py-28 md:py-36 px-6 overflow-hidden" style={{ background: "#0a3d3a" }}>
        {/* Subtle top gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, var(--color-sand), #0a3d3a)" }}
        />

        <AnimatedSection className="relative max-w-3xl mx-auto text-center">
          <p className="text-gold/40 text-[10px] uppercase tracking-[0.25em] mb-4 font-sans">
            Notre engagement
          </p>
          <h2
            className="font-serif text-white font-light mb-10"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Tourisme responsable
          </h2>
          <p className="text-white/40 text-base leading-[1.8] max-w-xl mx-auto mb-16">
            Chez Povai Lodge, nous sommes engages dans un tourisme
            respectueux de notre environnement exceptionnel. Chaque geste
            compte pour preserver la beaute de Bora Bora pour les
            generations futures.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: "M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67",
                title: "Environnement",
                text: "Gestion responsable de l'eau et de l'energie, tri des dechets, protection du recif corallien.",
              },
              {
                icon: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .37",
                title: "Produits locaux",
                text: "Petit-dejeuner avec des fruits de notre jardin et des produits issus de l'agriculture polynesienne.",
              },
              {
                icon: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
                title: "Culture",
                text: "Partage des traditions polynesiennes, soutien aux artisans locaux et respect du patrimoine.",
              },
            ].map((item) => (
              <div key={item.title} className="text-left">
                <svg
                  className="w-6 h-6 text-gold/40 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <h3 className="font-serif text-white/90 text-lg font-light mb-3">
                  {item.title}
                </h3>
                <p className="text-white/35 text-sm leading-[1.7]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
