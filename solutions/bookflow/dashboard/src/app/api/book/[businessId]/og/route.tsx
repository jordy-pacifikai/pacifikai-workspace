import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;
  const isUUID = UUID_RE.test(businessId);

  const { data: biz } = await getAdmin()
    .from('bookbot_businesses')
    .select('name, services')
    .eq(isUUID ? 'id' : 'booking_slug', businessId)
    .single();

  const name = biz?.name ?? "Réservation en ligne";
  const services = biz?.services as Array<{ name: string }> | null;
  const serviceNames = services?.slice(0, 3).map((s) => s.name).join(' · ') ?? '';

  const response = new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Ve'a brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#25D366',
            }}
          />
          <span
            style={{
              fontSize: '28px',
              color: '#9ca3af',
              fontWeight: 400,
              letterSpacing: '0.1em',
            }}
          >
            VE&apos;A
          </span>
        </div>

        {/* Business name */}
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            margin: '0 0 20px',
            lineHeight: 1.1,
            maxWidth: '900px',
          }}
        >
          {name}
        </h1>

        {/* Services */}
        {serviceNames ? (
          <p
            style={{
              fontSize: '28px',
              color: '#25D366',
              margin: '0 0 40px',
              textAlign: 'center',
            }}
          >
            {serviceNames}
          </p>
        ) : (
          <div style={{ marginBottom: '40px' }} />
        )}

        {/* CTA button */}
        <div
          style={{
            background: '#25D366',
            borderRadius: '50px',
            padding: '16px 48px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 600, color: '#000' }}>
            Réserver en ligne
          </span>
        </div>

        {/* URL */}
        <p style={{ fontSize: '20px', color: '#4b5563', marginTop: '40px' }}>
          vea.pacifikai.com
        </p>
      </div>
    ),
    { width: 1200, height: 630 },
  );
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return response;
}
