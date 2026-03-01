'use client'

import { useAuth } from '@/hooks/useAuth'

export function AuthInit() {
  // Initializes auth state, loads business from Supabase, updates Zustand store.
  // Renders nothing — side-effect only component.
  useAuth()
  return null
}
