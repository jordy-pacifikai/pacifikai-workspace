const PACIFIKAI_ORG = {
  "@type": "ProfessionalService",
  name: "PACIFIK'AI",
  url: "https://pacifikai.com",
  logo: "https://pacifikai.com/assets/logo.png",
};

export function generateServiceSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: PACIFIKAI_ORG,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Polynésie française",
    },
    serviceType: name,
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.datePublished,
    mainEntityOfPage: article.url,
    inLanguage: "fr",
    image: article.image ?? "https://pacifikai.com/assets/og-image.png",
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
  };
}
