import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/lib/SmoothScroll";
import StickyCTA from "@/components/StickyCTA";
import SourceTracer from "@/components/SourceTracer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = "https://pacificblueconsulting.org";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const isFr = locale === "fr";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"),
    },
    description: t("defaultDescription"),
    keywords: t("keywords").split(",").map((k) => k.trim()),
    authors: [{ name: "Pacific Blue Consulting" }],
    alternates: {
      canonical: isFr ? "/" : "/en",
      languages: {
        fr: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: t("ogLocale"),
      alternateLocale: isFr ? ["en_US"] : ["fr_FR"],
      siteName: t("siteName"),
      title: t("defaultTitle"),
      description: t("ogDescription"),
      url: isFr ? SITE_URL : `${SITE_URL}/en`,
      images: [
        {
          url: `${SITE_URL}/images/hero-accueil.jpg`,
          width: 1920,
          height: 1280,
          alt: t("defaultTitle"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("ogDescription"),
      images: [`${SITE_URL}/images/hero-accueil.jpg`],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isFr = locale === "fr";

  return (
    <html lang={locale} className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ConsultingBusiness",
              name: "Pacific Blue Consulting",
              description: isFr
                ? "Cabinet de conseil en Polynésie française. Structuration de projets complexes en transport aérien, sécurité aéroportuaire, environnement et développement territorial."
                : "Consulting firm based in French Polynesia. We structure complex projects in air transport, airport safety, environment and territorial development.",
              url: SITE_URL,
              telephone: "+689-87-747-284",
              email: "contact@pacificblueconsulting.org",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Punaauia",
                addressRegion: "Tahiti",
                addressCountry: "PF",
              },
              founder: {
                "@type": "Person",
                name: "Pascal BAZER-BACHI",
                jobTitle: isFr
                  ? "Fondateur - Ancien Directeur de l'Aviation Civile de Polynésie française"
                  : "Founder - Former Director of Civil Aviation for French Polynesia",
              },
              foundingDate: "2017",
              areaServed: isFr
                ? ["Polynésie française", "Nouvelle-Calédonie", "Pacifique Sud"]
                : ["French Polynesia", "New Caledonia", "South Pacific"],
              knowsAbout: isFr
                ? [
                    "Aviation civile",
                    "Aéroports",
                    "Environnement",
                    "Bilan carbone",
                    "AMO",
                    "Pilotage de projets",
                  ]
                : [
                    "Civil aviation",
                    "Airports",
                    "Environment",
                    "Carbon footprint",
                    "Programme management",
                    "Project leadership",
                  ],
            }),
          }}
        />
      </head>
      <body className="font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScroll>
            <Header />
            <main>{children}</main>
            <Footer />
            <StickyCTA />
            <SourceTracer />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
