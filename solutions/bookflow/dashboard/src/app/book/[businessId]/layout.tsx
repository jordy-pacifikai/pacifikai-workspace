import type { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getBusiness(idOrSlug: string) {
  const isUUID = UUID_RE.test(idOrSlug);
  const { data } = await supabaseAdmin()
    .from('bookbot_businesses')
    .select('id, name, services, bio')
    .eq(isUUID ? 'id' : 'booking_slug', idOrSlug)
    .single();
  return data as { id: string; name: string; services: unknown; bio: string | null } | null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ businessId: string }> },
): Promise<Metadata> {
  const { businessId } = await params;
  const biz = await getBusiness(businessId);

  if (!biz) {
    return { title: "Réservation en ligne | Ve'a" };
  }

  const title = `Réserver chez ${biz.name}`;
  const description = biz.bio || `Prenez rendez-vous en ligne chez ${biz.name} — rapide, simple, gratuit.`;
  const baseUrl = 'https://vea.pacifikai.com';
  const ogImageUrl = `${baseUrl}/api/book/${businessId}/og`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/book/${businessId}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/book/${businessId}`,
      siteName: "Ve'a",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const biz = await getBusiness(businessId);

  const baseUrl = 'https://vea.pacifikai.com';

  const jsonLd = biz
    ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: biz.name,
        description: biz.bio || `Réservation en ligne chez ${biz.name}`,
        url: `${baseUrl}/book/${businessId}`,
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/book/${businessId}`,
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          result: {
            '@type': 'Reservation',
            name: `Réservation chez ${biz.name}`,
          },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>') }}
        />
      )}
      {children}
    </>
  );
}
