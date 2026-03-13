const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export function supaHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}
