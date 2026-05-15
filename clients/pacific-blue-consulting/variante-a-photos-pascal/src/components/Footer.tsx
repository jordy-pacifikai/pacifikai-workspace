import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const offresLinks = [
  { href: "/offres#mobilites", key: "offresMobilites" as const },
  { href: "/offres#infrastructures", key: "offresInfrastructures" as const },
  { href: "/offres#environnement", key: "offresEnvironnement" as const },
  { href: "/offres#transformation", key: "offresTransformation" as const },
];

const cabinetLinks = [
  { href: "/le-cabinet", key: "cabinet" as const },
  { href: "/realisations", key: "realisations" as const },
  { href: "/perspectives", key: "perspectives" as const },
  { href: "/contact", key: "contact" as const },
];

export default function Footer() {
  const t = useTranslations("footer");
  const tLinks = useTranslations("footer.links");

  return (
    <footer className="relative bg-navy text-white overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/logo-pbc-transparent.png"
                alt="Pacific Blue Consulting"
                width={80}
                height={45}
                className="w-20 h-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
              />
              <span className="font-display text-base font-bold tracking-wide text-white">
                Pacific Blue Consulting
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mt-6 max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Expertise */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold mb-5">
              {t("offresTitle")}
            </h4>
            <ul className="space-y-3">
              {offresLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 text-sm hover:text-white transition-colors duration-300"
                  >
                    {tLinks(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cabinet */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold mb-5">
              {t("cabinetTitle")}
            </h4>
            <ul className="space-y-3">
              {cabinetLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/40 text-sm hover:text-white transition-colors duration-300"
                  >
                    {tLinks(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold mb-5">
              {t("contactTitle")}
            </h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 text-gold/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{t("locationLabel")}</span>
              </li>
              <li>
                <a href="tel:+68987747284" className="flex items-center gap-3 hover:text-white transition-colors duration-300">
                  <svg className="w-4 h-4 text-gold/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +689 87 747 284
                </a>
              </li>
              <li>
                <a href="mailto:contact@pacificblueconsulting.org" className="flex items-center gap-3 hover:text-white transition-colors duration-300 break-all">
                  <svg className="w-4 h-4 text-gold/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contact@pacificblueconsulting.org
                </a>
              </li>
            </ul>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/pacificblueconsulting/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-white/50 hover:text-white hover:border-white/15 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
          <p className="text-white/30 text-xs">
            {t("poweredBy")}{" "}
            <a
              href="https://pacifikai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/80 hover:text-gold transition-colors duration-300 font-medium"
            >
              PACIFIK&apos;AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
