import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "realisations" });
  const isFr = locale === "fr";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: isFr ? "/realisations" : "/en/realisations",
      languages: {
        fr: "/realisations",
        en: "/en/realisations",
        "x-default": "/realisations",
      },
    },
  };
}

export default function RealisationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
