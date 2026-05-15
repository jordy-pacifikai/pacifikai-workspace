import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "offres" });
  const isFr = locale === "fr";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: isFr ? "/offres" : "/en/offres",
      languages: {
        fr: "/offres",
        en: "/en/offres",
        "x-default": "/offres",
      },
    },
  };
}

export default function OffresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
