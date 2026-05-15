import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const isFr = locale === "fr";

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: isFr ? "/contact" : "/en/contact",
      languages: {
        fr: "/contact",
        en: "/en/contact",
        "x-default": "/contact",
      },
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
