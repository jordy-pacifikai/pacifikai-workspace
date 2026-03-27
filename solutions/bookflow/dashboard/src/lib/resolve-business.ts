import { supabaseAdmin } from './supabase';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveBusinessId(
  idOrSlug: string,
): Promise<{ id: string; active: boolean; timezone: string } | null> {
  const isUUID = UUID_RE.test(idOrSlug);
  const { data } = await supabaseAdmin()
    .from('bookbot_businesses')
    .select('id, active, timezone')
    .eq(isUUID ? 'id' : 'booking_slug', idOrSlug)
    .single();
  if (!data) return null;
  const row = data as { id: string; active: boolean; timezone: string | null };
  return {
    id: row.id,
    active: row.active,
    timezone: row.timezone ?? 'Pacific/Tahiti',
  };
}
