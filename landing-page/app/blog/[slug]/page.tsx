import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/lib/blog-data";
import { ARTICLE_IMAGES } from "@/lib/blog-images";
import { generateBreadcrumbSchema } from "@/lib/schema";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { getRelatedLinks } from "@/lib/internal-links";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Article introuvable | PACIFIK'AI" };
  }

  return {
    title: `${article.title} | PACIFIK'AI`,
    description: article.description,
    alternates: {
      canonical: `https://pacifikai.com/blog/${slug}`,
    },
    openGraph: {
      title: `${article.title} | PACIFIK'AI`,
      description: article.description,
      type: "article",
      locale: "fr_PF",
      url: `https://pacifikai.com/blog/${slug}`,
      publishedTime: article.date,
      authors: ["PACIFIK'AI"],
      images: [
        {
          url: ARTICLE_IMAGES[slug] ?? "/assets/og-image.png",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | PACIFIK'AI`,
      description: article.description,
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Tendances: "text-[#f97066] bg-[#f97066]/10 border-[#f97066]/20",
  "Cas Concrets": "text-[#14b8a6] bg-[#14b8a6]/10 border-[#14b8a6]/20",
  "Focus Polynésie": "text-[#f5c542] bg-[#f5c542]/10 border-[#f5c542]/20",
  "Guides Pratiques": "text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/20",
  Comparatifs: "text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20",
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = articles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  const categoryColor =
    CATEGORY_COLORS[article.category] ??
    "text-white/60 bg-white/5 border-white/10";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Organization",
      name: "PACIFIK'AI",
      url: "https://pacifikai.com",
    },
    publisher: {
      "@type": "Organization",
      name: "PACIFIK'AI",
      logo: {
        "@type": "ImageObject",
        url: "https://pacifikai.com/assets/logo.png",
      },
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: `https://pacifikai.com/blog/${slug}`,
    inLanguage: "fr",
    image: ARTICLE_IMAGES[slug] ?? "https://pacifikai.com/assets/og-image.png",
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Accueil", url: "https://pacifikai.com" },
    { name: "Blog", url: "https://pacifikai.com/blog" },
    { name: article.title, url: `https://pacifikai.com/blog/${slug}` },
  ]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-[#f97066]/4 blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#14b8a6]/3 blur-[100px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative z-10 pt-28 pb-24 px-4">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto mb-8">
          <nav className="flex items-center gap-2 text-xs text-text-dim">
            <Link href="/" className="hover:text-text transition-colors">
              Accueil
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/blog" className="hover:text-text transition-colors">
              Blog
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-text-secondary truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>
        </div>

        {/* Hero card — image + title fused */}
        <header className="max-w-3xl mx-auto mb-12">
          {ARTICLE_IMAGES[slug] ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] mb-8">
              {/* Image */}
              <div className="relative aspect-[2/1]">
                <img
                  src={`https://wsrv.nl/?url=${encodeURIComponent(ARTICLE_IMAGES[slug])}&w=960&q=80&output=webp`}
                  alt={article.title}
                  width={960}
                  height={480}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/60 to-transparent" />
              </div>

              {/* Title overlaid on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase border backdrop-blur-sm ${categoryColor}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-xs text-white/50">
                    {formatDate(article.date)}
                  </span>
                  {article.readTime && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="text-xs text-white/50">{article.readTime} de lecture</span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white">
                  {article.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase border ${categoryColor}`}
                >
                  {article.category}
                </span>
                <span className="text-xs text-text-dim">
                  {formatDate(article.date)}
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-text">
                {article.title}
              </h1>
            </div>
          )}

          <p className="text-text-secondary text-lg leading-relaxed">
            {article.description}
          </p>

          <div className="mt-6 h-px bg-gradient-to-r from-[#f97066]/30 via-border to-transparent" />
        </header>

        {/* Article body */}
        <article className="max-w-3xl mx-auto">
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* CTA block */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="glass rounded-2xl p-8 md:p-10 border border-[#f97066]/15 text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#f97066] mb-3">
              Passez à l&apos;action
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Discutons de votre projet. Devis gratuit et sans engagement —
              réponse sous 24h.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#f97066] text-white font-semibold text-sm hover:bg-[#f97066]/90 transition-colors"
              >
                Demander un devis gratuit
              </a>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-text-secondary font-medium text-sm hover:border-white/20 hover:text-text transition-colors"
              >
                Retour au blog
              </Link>
            </div>
          </div>
        </div>

        {/* Related articles */}
        {/* Cross-type internal links (SEO) */}
        <RelatedLinks
          links={getRelatedLinks(`/blog/${slug}`, article.title.toLowerCase().split(/\s+/))}
          title="Services et ressources associés"
        />

        {related.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rel) => {
                const relColor =
                  CATEGORY_COLORS[rel.category] ??
                  "text-white/60 bg-white/5 border-white/10";
                return (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    data-tilt
                    className="group glass glass-hover rounded-xl p-5 border border-white/[0.06] hover:border-[#f97066]/20 transition-colors duration-300"
                  >
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${relColor} mb-3`}
                    >
                      {rel.category}
                    </span>
                    <h3 className="font-semibold text-sm leading-snug group-hover:text-[#f97066] transition-colors">
                      {rel.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[#f97066] text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                      Lire
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M1 6h10M7 2l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Article prose styles */}
      <style>{`
        /* Article header from original HTML articles */
        .article-prose .article-header {
          display: none; /* Header info already rendered by Next.js above */
        }
        .article-prose .article-breadcrumb { display: none; }
        .article-prose .article-category-tag { display: none; }
        .article-prose .article-meta {
          display: flex; align-items: center; gap: 2rem;
          color: rgba(255,255,255,0.4); font-size: 0.85rem;
          padding-bottom: 1.5rem; margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .article-prose .article-meta-item {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .article-prose .article-meta-item svg {
          width: 15px; height: 15px;
          stroke: rgba(255,255,255,0.4); opacity: 0.7;
        }
        .article-prose .article-content {
          max-width: 100%; padding: 0;
        }
        .article-prose .article-content > p:first-of-type {
          font-size: 1.15rem; line-height: 1.85;
        }

        /* Stats box */
        .article-prose .stats-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 2rem;
          margin: 2.5rem 0; position: relative; overflow: hidden;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;
        }
        .article-prose .stats-box::before {
          content: ''; position: absolute; top: -1px; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f97066, #f5c542, #f97066);
        }
        .article-prose .stat-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 1.75rem; text-align: center;
          transition: all 0.3s;
        }
        .article-prose .stat-item:hover {
          border-color: #f97066; box-shadow: 0 0 20px rgba(249,112,102,0.15);
        }
        .article-prose .stat-number {
          font-size: 2.25rem; font-weight: 800;
          background: linear-gradient(135deg, #f97066, #f5c542);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 0.25rem;
        }
        .article-prose .stat-label {
          font-size: 0.78rem; color: rgba(255,255,255,0.4); font-weight: 500;
        }

        /* Stats box list variant */
        .article-prose .stats-box h3 {
          font-size: 0.75rem; font-weight: 700; color: #f97066;
          text-transform: uppercase; letter-spacing: 0.12em;
          margin: 0 0 1.5rem 0; grid-column: 1 / -1;
        }
        .article-prose .stats-box ul {
          margin: 0; display: grid; grid-template-columns: 1fr; gap: 0;
          grid-column: 1 / -1; list-style: none; padding: 0;
        }
        .article-prose .stats-box li {
          padding: 1rem; margin: 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          list-style: none;
        }
        .article-prose .stats-box li:last-child { border-bottom: none; }
        .article-prose .stats-box li strong {
          font-weight: 800; color: #f5c542; font-size: 1.1em;
        }

        /* Key points / comparison grid */
        .article-prose .key-points,
        .article-prose .comparison-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem; margin: 2rem 0;
        }
        .article-prose .key-point,
        .article-prose .comparison-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 1.5rem;
        }
        .article-prose .key-point-number {
          font-size: 1.5rem; font-weight: 800; color: #f97066; margin-bottom: 0.5rem;
        }

        /* Quote box */
        .article-prose .quote-box {
          background: rgba(255,255,255,0.03);
          border: none; border-left: 3px solid #f97066;
          border-radius: 0 14px 14px 0;
          padding: 2rem 2.25rem; margin: 2rem 0;
          font-style: italic; color: rgba(255,255,255,0.6);
        }

        /* FAQ in article */
        .article-prose .faq-section { margin: 2rem 0; }
        .article-prose .faq-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 1.25rem 1.5rem;
          margin-bottom: 0.75rem;
        }
        .article-prose .faq-question {
          font-weight: 700; color: var(--color-text, #fff); margin-bottom: 0.5rem;
        }
        .article-prose .faq-answer {
          color: rgba(255,255,255,0.6); font-size: 0.95rem; line-height: 1.7;
        }

        /* CTA box in article */
        .article-prose .cta-section,
        .article-prose .cta-box-inline {
          background: linear-gradient(135deg, rgba(249,112,102,0.08), rgba(20,184,166,0.05));
          border: 1px solid rgba(249,112,102,0.2);
          border-radius: 16px; padding: 2rem; margin: 2.5rem 0;
          text-align: center;
        }
        .article-prose .cta-section h2,
        .article-prose .cta-box-inline h3 {
          border: none; padding: 0;
        }
        .article-prose .cta-btn,
        .article-prose .cta-button {
          display: inline-block; padding: 0.75rem 2rem;
          background: #f97066; color: #080c14; font-weight: 700;
          border-radius: 10px; text-decoration: none;
          transition: all 0.3s; margin-top: 1rem;
        }
        .article-prose .cta-btn:hover,
        .article-prose .cta-button:hover {
          box-shadow: 0 0 24px rgba(249,112,102,0.4);
          transform: translateY(-2px);
        }

        .article-prose h1,
        .article-prose h2,
        .article-prose h3,
        .article-prose h4 {
          font-family: var(--font-display);
          font-weight: 700;
          line-height: 1.25;
          margin-top: 2em;
          margin-bottom: 0.75em;
          color: var(--color-text);
        }
        .article-prose h1 { font-size: 1.875rem; }
        .article-prose h2 { font-size: 1.5rem; color: var(--color-text); padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .article-prose h3 { font-size: 1.125rem; color: var(--color-text); }
        .article-prose p {
          margin-bottom: 1.25em;
          color: var(--color-text-secondary);
          line-height: 1.75;
          font-size: 1rem;
        }
        .article-prose ul,
        .article-prose ol {
          margin-bottom: 1.25em;
          padding-left: 1.5rem;
          color: var(--color-text-secondary);
          line-height: 1.75;
        }
        .article-prose ul { list-style-type: disc; }
        .article-prose ol { list-style-type: decimal; }
        .article-prose li { margin-bottom: 0.4em; }
        .article-prose a {
          color: #f97066;
          text-decoration: underline;
          text-decoration-color: rgba(249,112,102,0.3);
          transition: text-decoration-color 0.2s;
        }
        .article-prose a:hover { text-decoration-color: #f97066; }
        .article-prose strong { color: var(--color-text); font-weight: 600; }
        .article-prose em { color: var(--color-text-secondary); font-style: italic; }
        .article-prose blockquote {
          border-left: 3px solid #f97066;
          padding-left: 1.25rem;
          margin: 1.5em 0;
          color: var(--color-text-secondary);
          font-style: italic;
        }
        .article-prose table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5em;
          font-size: 0.9rem;
        }
        .article-prose th {
          background: rgba(249,112,102,0.08);
          color: var(--color-text);
          font-weight: 600;
          padding: 0.6rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .article-prose td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: var(--color-text-secondary);
        }
        .article-prose tr:last-child td { border-bottom: none; }
        .article-prose code {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 0.1em 0.4em;
          font-size: 0.85em;
          color: #14b8a6;
          font-family: monospace;
        }
        .article-prose pre {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1.5em;
        }
        .article-prose pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.875rem;
        }
        .article-prose hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 2em 0;
        }
        .article-prose .stats-grid,
        .article-prose .comparison-table,
        .article-prose .highlight-box,
        .article-prose .cta-box,
        .article-prose .info-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.5em;
        }
      `}</style>
    </div>
  );
}
