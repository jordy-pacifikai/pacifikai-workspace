/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  async rewrites() {
    return [
      // Portfolio clean URLs → static HTML files
      { source: '/portfolio/new/:slug', destination: '/portfolio/new/:slug.html' },
    ];
  },
  async redirects() {
    return [
      // Services .html → clean
      { source: '/services/chatbots.html', destination: '/services/chatbots', permanent: true },
      { source: '/services/workflows.html', destination: '/services/workflows', permanent: true },
      { source: '/services/documents.html', destination: '/services/documents', permanent: true },
      { source: '/services/marketing.html', destination: '/services/marketing', permanent: true },
      { source: '/services/landing-pages.html', destination: '/services/landing-pages', permanent: true },
      { source: '/services/apps.html', destination: '/services/apps', permanent: true },
      { source: '/services/conseil.html', destination: '/services/conseil', permanent: true },
      { source: '/services/api.html', destination: '/services/api', permanent: true },
      // Legal
      { source: '/cgu.html', destination: '/cgu', permanent: true },
      { source: '/confidentialite.html', destination: '/confidentialite', permanent: true },
      { source: '/tarifs.html', destination: '/tarifs', permanent: true },
      // Blog
      { source: '/blog/index.html', destination: '/blog', permanent: true },
      { source: '/blog/articles/:slug.html', destination: '/blog/:slug', permanent: true },
      // Other
      { source: '/offre-site-web.html', destination: '/offre-site-web', permanent: true },
      { source: '/calculateur-roi.html', destination: '/calculateur-roi', permanent: true },
    ];
  },
};

export default nextConfig;
