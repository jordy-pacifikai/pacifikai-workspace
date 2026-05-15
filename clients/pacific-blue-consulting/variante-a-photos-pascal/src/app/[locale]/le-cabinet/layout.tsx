import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "cabinet" });
  const isFr = locale === "fr";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: isFr ? "/le-cabinet" : "/en/le-cabinet",
      languages: {
        fr: "/le-cabinet",
        en: "/en/le-cabinet",
        "x-default": "/le-cabinet",
      },
    },
  };
}

export default function LeCabinetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
