/**
 * RelatedLinks — Composant de maillage interne SEO
 * Affiche 3-5 liens contextuels vers des pages sémantiquement proches.
 * Utilisé en bas de chaque page service, expertise et blog.
 */
import Link from "next/link";
import type { LinkNode } from "@/lib/internal-links";

interface RelatedLinksProps {
  links: LinkNode[];
  title?: string;
}

export default function RelatedLinks({
  links,
  title = "Découvrez aussi",
}: RelatedLinksProps) {
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Liens associés"
      className="mt-16 border-t border-white/10 pt-10 pb-8 max-w-4xl mx-auto px-6"
    >
      <h3 className="text-lg font-semibold text-white/80 mb-5 font-display">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-[#f97066]/30 hover:bg-white/[0.06] transition-all duration-200"
          >
            <span className="text-[#f97066] text-sm opacity-60 group-hover:opacity-100 transition-opacity">
              →
            </span>
            <span className="text-white/70 group-hover:text-white text-sm transition-colors">
              {link.title}
            </span>
            <span className="ml-auto text-[10px] text-white/20 uppercase tracking-wider">
              {link.type === "blog"
                ? "article"
                : link.type === "static"
                  ? ""
                  : link.type}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
