import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { requireBusinessAccess } from '@/lib/auth';
import { rateLimitAsync } from '@/lib/rate-limit';

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

const businessIdSchema = z.string().uuid();

// GET /api/clients/export?businessId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawBusinessId = searchParams.get('businessId');

  const result = businessIdSchema.safeParse(rawBusinessId);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid businessId', details: result.error.flatten() },
      { status: 400 },
    );
  }

  const businessId = result.data;

  try {
    await requireBusinessAccess(businessId);
  } catch (authError) {
    if (authError instanceof NextResponse) return authError;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { success } = await rateLimitAsync(`clients-export:${businessId}`, { interval: 60_000, limit: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from('bookbot_clients')
    .select('name, phone, email, notes, tags, total_visits, total_spent, last_visit_at')
    .eq('business_id', businessId)
    .order('name', { ascending: true });

  if (error) {
    return new Response('Erreur serveur', { status: 500 });
  }

  // Build CSV with BOM for French Excel compatibility
  const BOM = '\uFEFF';
  const HEADERS = ['Nom', 'Telephone', 'Email', 'Notes', 'Tags', 'Visites', 'CA Total', 'Derniere visite'];

  const rows = (data ?? []).map((client) => [
    escapeCsv(client.name),
    escapeCsv(client.phone),
    escapeCsv(client.email),
    escapeCsv(client.notes),
    escapeCsv((client.tags ?? []).join(', ')),
    escapeCsv(String(client.total_visits ?? 0)),
    escapeCsv(client.total_spent != null ? `${client.total_spent}` : '0'),
    escapeCsv(formatDate(client.last_visit_at)),
  ].join(';'));

  const csv = BOM + HEADERS.join(';') + '\n' + rows.join('\n');

  const today = new Date().toISOString().slice(0, 10);
  const filename = `clients-export-${today}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
