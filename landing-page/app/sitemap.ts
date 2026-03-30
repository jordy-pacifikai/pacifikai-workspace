import type { MetadataRoute } from "next";

const BASE_URL = "https://pacifikai.com";
const NOW = new Date("2026-03-27");

const BLOG_SLUGS = [
  "agence-digitale-tahiti-guide",
  "agence-web-tahiti-2026",
  "agences-digitales-tahiti-comparatif",
  "application-mobile-polynesie",
  "automatisation-entreprise-tahiti",
  "automatisation-ia-entreprise-polynesie",
  "automatisation-ia-vs-employe-polynesie",
  "chatbot-ia-polynesie",
  "chatbot-ia-vs-standard-telephonique",
  "creation-site-internet-tahiti",
  "digitalisation-entreprise-tahiti",
  "hsbc-extraction-documents",
  "intelligence-artificielle-polynesie",
  "klm-service-client-ia",
  "marketing-digital-tahiti",
  "marriott-chatbot-reservation",
  "prix-site-web-polynesie",
  "site-web-sur-mesure-vs-template-tahiti",
  "starbucks-deep-brew-ia",
  "transformation-digitale-polynesie-francaise",
];

const SERVICES_SLUGS = [
  "chatbots",
  "sites-web",
  "applications",
  "automatisation",
  "extraction-documents",
  "intelligence-artificielle",
  "marketing-digital",
  "conseil-digital",
];

const SEO_SERVICES = [
  "creation-site-web",
  "chatbot-ia",
  "automatisation",
  "application-mobile",
  "extraction-documents",
  "intelligence-artificielle",
  "marketing-digital",
  "conseil-digital",
];

const SEO_CITIES = [
  "papeete",
  "bora-bora",
  "moorea",
  "pirae",
  "punaauia",
  "faaa",
];

const EXPERTISE_SLUGS = [
  "seo-referencement-ia",
  "chatbots-ia",
  "sites-web-premium",
  "contenu-ia",
  "automatisation",
  "marketing-acquisition",
  "strategie-digitale",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tarifs`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/offre-site-web`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/calculateur-roi`,
      lastModified: NOW,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/agence-digitale-tahiti`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/cgu`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/confidentialite`,
      lastModified: NOW,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const servicePages: MetadataRoute.Sitemap = SERVICES_SLUGS.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const seoPages: MetadataRoute.Sitemap = SEO_SERVICES.flatMap((service) =>
    SEO_CITIES.map((city) => ({
      url: `${BASE_URL}/seo/${service}-${city}`,
      lastModified: NOW,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  );

  const expertisePages: MetadataRoute.Sitemap = EXPERTISE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/expertise/${slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages, ...expertisePages, ...blogPages, ...seoPages];
}
