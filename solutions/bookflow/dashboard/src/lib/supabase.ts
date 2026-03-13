import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Server-side admin client (lazy — avoids build-time crash when SUPABASE_SERVICE_ROLE_KEY is missing)
let _adminClient: ReturnType<typeof createClient> | null = null
export function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _adminClient
}

// Client-side singleton (for hooks — uses anon key, respects RLS)
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowser() {
  if (browserClient) return browserClient
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

// Legacy export for existing hooks — use the same singleton as getSupabaseBrowser()
export const supabase = supabaseUrl ? getSupabaseBrowser() : (null as never)
