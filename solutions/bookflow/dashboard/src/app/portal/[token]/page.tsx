import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { verifyPortalToken } from '@/lib/portal-token';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeColor } from '@/lib/utils';
import PortalClient from './PortalClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  business_id: string;
  loyalty_points: number | null;
}

interface AppointmentRow {
  id: string;
  business_id: string;
  service: string | null;
  appointment_date: string;
  time_slot: string;
  end_time: string | null;
  status: string;
}

interface BusinessRow {
  id: string;
  name: string;
  brand_color: string | null;
  config: Record<string, unknown>;
}

interface LoyaltyTxRow {
  id: string;
  points: number;
  reason: string | null;
  created_at: string;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Verify token → clientId
  const clientId = verifyPortalToken(token);
  if (!clientId) notFound();

  const sb = supabaseAdmin();

  // Fetch client
  const { data: client, error: clientErr } = await sb
    .from('bookbot_clients')
    .select('id, name, phone, email, birthday, business_id, loyalty_points')
    .eq('id', clientId)
    .single<ClientRow>();

  if (clientErr || !client) notFound();

  const businessId = client.business_id;

  // Fetch business + appointments in parallel
  const today = new Date().toISOString().split('T')[0];

  const [bizResult, upcomingResult, pastResult] = await Promise.all([
    sb
      .from('bookbot_businesses')
      .select('id, name, brand_color, config')
      .eq('id', businessId)
      .single<BusinessRow>(),

    sb
      .from('bookbot_appointments')
      .select('id, business_id, service, appointment_date, time_slot, end_time, status')
      .eq('business_id', businessId)
      .eq('client_phone', client.phone ?? '')
      .gte('appointment_date', today)
      .neq('status', 'cancelled')
      .order('appointment_date', { ascending: true })
      .order('time_slot', { ascending: true })
      .returns<AppointmentRow[]>(),

    sb
      .from('bookbot_appointments')
      .select('id, business_id, service, appointment_date, time_slot, end_time, status')
      .eq('business_id', businessId)
      .eq('client_phone', client.phone ?? '')
      .lt('appointment_date', today)
      .order('appointment_date', { ascending: false })
      .limit(10)
      .returns<AppointmentRow[]>(),
  ]);

  if (bizResult.error || !bizResult.data) notFound();

  const biz = bizResult.data;
  const accent = sanitizeColor(biz.brand_color, '#0d9488');

  // Loyalty: check if enabled + fetch transactions
  const loyaltyEnabled = Boolean(
    (biz.config as Record<string, unknown>)?.loyalty_enabled,
  );

  let loyaltyTransactions: LoyaltyTxRow[] = [];
  if (loyaltyEnabled) {
    const { data: txs } = await sb
      .from('bookbot_loyalty_transactions')
      .select('id, points, reason, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<LoyaltyTxRow[]>();
    loyaltyTransactions = txs ?? [];
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PortalClient
        data={{
          client: {
            id: client.id,
            name: client.name,
            phone: client.phone,
            email: client.email,
            birthday: client.birthday,
            loyalty_points: client.loyalty_points ?? 0,
          },
          businessName: biz.name,
          businessId: biz.id,
          accent,
          upcomingAppointments: upcomingResult.data ?? [],
          pastAppointments: pastResult.data ?? [],
          loyaltyEnabled,
          loyaltyTransactions,
          token,
        }}
      />
    </div>
  );
}
