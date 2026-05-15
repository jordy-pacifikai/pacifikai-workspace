import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "perspectives" });
  const isFr = locale === "fr";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: isFr ? "/perspectives" : "/en/perspectives",
      languages: {
        fr: "/perspectives",
        en: "/en/perspectives",
        "x-default": "/perspectives",
      },
    },
  };
}

const ARTICLE_KEYS = ["desserte", "drones", "eisa", "securite", "vivriers"] as const;
const articleImages: Record<(typeof ARTICLE_KEYS)[number], string> = {
  desserte: "/images/air-tetiaroa.jpg",
  drones: "/images/drone-pf-1.jpg",
  eisa: "/images/rgi4.jpg",
  securite: "/images/pbc-aeroport.jpg",
  vivriers: "/images/coco.jpg",
};

export default function PerspectivesPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <PerspectivesContent />;
}

function PerspectivesContent() {
  const t = useTranslations("perspectives");
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-white overflow-hidden">
        <Image
          src="/images/hero-perspectives.jpg"
          alt={t("hero.imageAlt")}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy/92" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("hero.headline")}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
            {t("hero.intro")}
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {ARTICLE_KEYS.map((key) => (
              <article
                key={key}
                className="group relative flex flex-col md:flex-row overflow-hidden border border-warm-100 rounded-2xl hover:border-gold/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0">
                  <Image
                    src={articleImages[key]}
                    alt={t(`articles.${key}.title`)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 256px"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="font-display text-xl font-semibold text-navy group-hover:text-gold transition-colors">
                      {t(`articles.${key}.title`)}
                    </h2>
                    <span className="shrink-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 rounded-full">
                      {t("comingSoon")}
                    </span>
                  </div>
                  <p className="text-warm-500 text-sm leading-relaxed">
                    {t(`articles.${key}.description`)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-warm-400 text-sm mx-auto max-w-md">
              {t("outro")}{" "}
              <a
                href="https://www.linkedin.com/company/pacificblueconsulting/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold/80 underline transition-colors"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
