import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync } from '@/lib/rate-limit';

const STATUS_LABELS: Record<string, string> = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show:   'No-show',
};

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if contains ; " or newline
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const exportParamsSchema = z.object({
  businessId: z.string().uuid(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// GET /api/appointments/export?businessId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const parsed = exportParamsSchema.safeParse({
    businessId: searchParams.get('businessId') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { businessId, from, to } = parsed.data;

  try {
    await requireBusinessAccess(businessId);
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 5/min per user
  const { success: rlOk } = await rateLimitAsync(`appointments-export:${businessId}`, { interval: 60_000, limit: 5 });
  if (!rlOk) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const sb = supabaseAdmin();

  let query = sb
    .from('bookbot_appointments')
    .select('appointment_date, time_slot, client_name, client_phone, service, status, notes, source, created_at')
    .eq('business_id', businessId)
    .order('appointment_date', { ascending: false })
    .order('time_slot', { ascending: true })
    .limit(50000);

  if (from) query = query.gte('appointment_date', from);
  if (to)   query = query.lte('appointment_date', to);

  const { data, error } = await query;

  if (error) {
    return new Response('Erreur serveur', { status: 500 });
  }

  // Build CSV with BOM for Excel FR compatibility
  const BOM = '\uFEFF';
  const HEADERS = ['Date', 'Heure', 'Client', 'Téléphone', 'Service', 'Statut', 'Notes', 'Source'];

  const rows = (data ?? []).map((appt) => [
    escapeCsv(appt.appointment_date),
    escapeCsv(appt.time_slot?.slice(0, 5)),
    escapeCsv(appt.client_name),
    escapeCsv(appt.client_phone),
    escapeCsv(appt.service),
    escapeCsv(STATUS_LABELS[appt.status] ?? appt.status),
    escapeCsv(appt.notes),
    escapeCsv(appt.source),
  ].join(';'));

  const csv = BOM + HEADERS.join(';') + '\n' + rows.join('\n');

  // Build filename with date range
  const dateTag = from && to ? `${from}_${to}` : from ? `depuis-${from}` : to ? `jusqu-${to}` : 'complet';
  const filename = `rdv-export-${dateTag}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
