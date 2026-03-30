import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";
import {
  services,
  cities,
  buildSeoPageData,
} from "@/lib/seo-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const service of services) {
    for (const city of cities) {
      params.push({ slug: `${service}-${city}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = buildSeoPageData(slug);

  if (!page) {
    return { title: "Page introuvable | PACIFIK'AI" };
  }

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [
      `${page.service.name.toLowerCase()} ${page.city.name.toLowerCase()}`,
      `${page.service.name.toLowerCase()} tahiti`,
      `agence digitale ${page.city.name.toLowerCase()}`,
      `${page.service.name.toLowerCase()} polynesie`,
      "pacifikai",
    ],
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "website",
      locale: "fr_PF",
      images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://pacifikai.com/seo/${slug}`,
    },
    other: {
      "geo.region": "PF",
      "geo.placename": `${page.city.name}, Polynésie française`,
      "geo.position": `${page.city.latitude};${page.city.longitude}`,
      ICBM: `${page.city.latitude}, ${page.city.longitude}`,
    },
  };
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 mt-0.5"
    >
      <circle cx="8" cy="8" r="7" fill="rgba(249,112,102,0.12)" />
      <path
        d="M5 8l2 2 4-4"
        stroke="#f97066"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function SeoPage({ params }: Props) {
  const { slug } = await params;
  const page = buildSeoPageData(slug);

  if (!page) {
    notFound();
  }

  const { service, city, h1, faq, relatedServices, relatedCities } = page;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: "PACIFIK'AI",
        description:
          "Agence digitale et intelligence artificielle en Polynésie française",
        url: "https://pacifikai.com",
        telephone: "+689-89558189",
        email: "jordy@pacifikai.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Papeete",
          addressRegion: "Tahiti",
          addressCountry: "PF",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: city.latitude,
          longitude: city.longitude,
        },
        areaServed: {
          "@type": "City",
          name: city.name,
        },
        priceRange: "$$",
      },
      {
        "@type": "Service",
        serviceType: service.name,
        provider: {
          "@type": "LocalBusiness",
          name: "PACIFIK'AI",
        },
        areaServed: {
          "@type": "City",
          name: city.name,
        },
        description: `${service.name} à ${city.name}, ${city.description}. PACIFIK'AI vous accompagne dans votre transformation digitale.`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: "https://pacifikai.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: service.name,
            item: `https://pacifikai.com/services/${service.servicePageSlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${service.name} à ${city.name}`,
            item: `https://pacifikai.com/seo/${slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[#f97066]/4 blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#14b8a6]/3 blur-[100px]" />
      </div>

      <Script
        id="seo-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="relative z-10 pt-28 pb-24 px-4">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto mb-8">
          <nav className="flex items-center gap-2 text-xs text-text-dim flex-wrap">
            <Link href="/" className="hover:text-text transition-colors">
              Accueil
            </Link>
            <span className="opacity-40">/</span>
            <Link
              href={`/services/${service.servicePageSlug}`}
              className="hover:text-text transition-colors"
            >
              {service.name}
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-text-secondary">
              {service.name} à {city.name}
            </span>
          </nav>
        </div>

        {/* Hero */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f97066]/10 border border-[#f97066]/20 text-[#f97066] text-xs font-semibold mb-6">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5z"
                fill="currentColor"
              />
            </svg>
            {service.name} — {city.name}
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-6">
            {h1}{" "}
            <span className="text-[#f97066]">— PACIFIK&apos;AI</span>
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mb-8">
            PACIFIK&apos;AI accompagne les entreprises de{" "}
            <strong className="text-text font-semibold">{city.name}</strong>,{" "}
            {city.description} ({city.population}&nbsp;hab.), dans leur{" "}
            {service.name.toLowerCase()}. Solutions sur mesure, expertise
            locale, résultats concrets.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f97066] text-white font-semibold text-sm hover:bg-[#f97066]/90 transition-colors"
            >
              Devis gratuit — réponse sous 24h
            </a>
            <Link
              href={`/services/${service.servicePageSlug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-text-secondary font-medium text-sm hover:border-white/20 hover:text-text transition-colors"
            >
              En savoir plus
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 6h10M7 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Locality info */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="glass rounded-2xl p-6 border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-[#14b8a6]"
              >
                <path
                  d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 8 4a1.5 1.5 0 0 1 0 3z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text text-sm mb-1">
                {city.name} — {city.description}
              </p>
              <p className="text-text-secondary text-sm leading-relaxed">
                {city.name} compte {city.population} habitants et représente un
                marché dynamique pour les entreprises souhaitant digitaliser
                leurs opérations. PACIFIK&apos;AI est la seule agence IA locale
                capable d&apos;intervenir directement sur place.
              </p>
            </div>
          </div>
        </section>

        {/* Service description */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="glass rounded-2xl p-8 border border-white/[0.06]">
            <h2 className="font-display text-2xl font-bold mb-4">
              {service.name} pour les entreprises de {city.name}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Les entreprises de {city.name} reçoivent chaque jour des dizaines
              de sollicitations clients. {service.description} PACIFIK&apos;AI
              déploie des solutions adaptées aux spécificités du marché
              polynésien — avec un accompagnement local, des délais maîtrisés et
              des résultats mesurables dès le premier mois.
            </p>
            <p className="text-text-secondary leading-relaxed">
              De l&apos;hôtel boutique au cabinet comptable, du commerce du
              marché au cabinet juridique du centre-ville, notre technologie
              s&apos;adapte à votre métier et à la réalité de {city.name}.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-4xl mx-auto mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">
            Pourquoi choisir PACIFIK&apos;AI pour votre {service.name.toLowerCase()} à {city.name} ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.benefits.map((benefit, i) => (
              <div
                key={i}
                className="glass rounded-xl p-5 border border-white/[0.06] flex items-start gap-3"
              >
                <CheckIcon />
                <p className="text-text-secondary text-sm leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
            {/* Extra local benefit */}
            <div className="glass rounded-xl p-5 border border-white/[0.06] flex items-start gap-3">
              <CheckIcon />
              <p className="text-text-secondary text-sm leading-relaxed">
                Équipe basée en Polynésie française — support local réactif à {city.name}
              </p>
            </div>
            <div className="glass rounded-xl p-5 border border-white/[0.06] flex items-start gap-3">
              <CheckIcon />
              <p className="text-text-secondary text-sm leading-relaxed">
                Devis gratuit et sans engagement — réponse sous 24h
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="max-w-4xl mx-auto mb-12">
            <h2 className="font-display text-2xl font-bold mb-6">
              Questions fréquentes — {service.name} à {city.name}
            </h2>
            <div className="space-y-3">
              {faq.map((item, i) => (
                <details
                  key={i}
                  className="glass rounded-xl border border-white/[0.06] group open:border-[#f97066]/20"
                >
                  <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none select-none">
                    <span className="font-semibold text-sm text-text pr-4">
                      {item.question}
                    </span>
                    <span className="shrink-0 text-text-dim group-open:text-[#f97066] transition-colors">
                      <ChevronDown />
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="glass rounded-2xl p-8 md:p-12 border border-[#f97066]/15 text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#f97066] mb-3">
              Passez à l&apos;action
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Prêt à digitaliser votre activité à {city.name} ?
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Devis gratuit et sans engagement. Réponse sous 24h. Votre projet
              mérite une agence qui connaît le terrain polynésien.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:jordy@pacifikai.com?subject=${encodeURIComponent(`${service.name} à ${city.name}`)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f97066] text-white font-semibold text-sm hover:bg-[#f97066]/90 transition-colors"
              >
                Demander un devis gratuit
              </a>
              <Link
                href={`/services/${service.servicePageSlug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-text-secondary font-medium text-sm hover:border-white/20 hover:text-text transition-colors"
              >
                En savoir plus sur {service.name}
              </Link>
            </div>
          </div>
        </section>

        {/* Internal linking — other services in this city */}
        <section className="max-w-4xl mx-auto mb-8">
          <h3 className="font-semibold text-base mb-4">
            Nos services à {city.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedServices.slice(0, 7).map((relSlug) => {
              const parts = relSlug.split("-");
              let serviceName = relSlug;
              const cityInfos = city;
              // Find service name
              const relPage = buildSeoPageData(relSlug);
              if (!relPage) return null;
              return (
                <Link
                  key={relSlug}
                  href={`/seo/${relSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-text-secondary text-xs font-medium hover:border-[#14b8a6]/30 hover:text-[#14b8a6] transition-all duration-200"
                >
                  {relPage.service.name} à {city.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Internal linking — same service in other cities */}
        <section className="max-w-4xl mx-auto">
          <h3 className="font-semibold text-base mb-4">
            {service.name} dans d&apos;autres communes
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedCities.map((relSlug) => {
              const relPage = buildSeoPageData(relSlug);
              if (!relPage) return null;
              return (
                <Link
                  key={relSlug}
                  href={`/seo/${relSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-text-secondary text-xs font-medium hover:border-[#f97066]/30 hover:text-[#f97066] transition-all duration-200"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="opacity-50"
                  >
                    <path
                      d="M5 1C3.34 1 2 2.34 2 4c0 2.5 3 5 3 5s3-2.5 3-5c0-1.66-1.34-3-3-3z"
                      fill="currentColor"
                    />
                  </svg>
                  {service.name} à {relPage.city.name}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
