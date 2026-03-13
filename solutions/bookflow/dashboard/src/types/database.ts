export interface Business {
  id: string
  name: string
  phone: string
  email: string | null
  sector: string | null
  services: ServiceItem[]
  hours: OpeningHours
  slot_duration_min: number
  timezone: string
  whatsapp_number: string | null
  config: Record<string, unknown>
  active: boolean
  created_at: string
  updated_at: string
  twilio_sid: string | null
  twilio_token: string | null
  twilio_from: string | null
  phone_number_id: string | null
  meta_access_token: string | null
  meta_page_id: string | null
  meta_page_token: string | null
  meta_ig_user_id: string | null
  channels_config: Record<string, unknown>
  plan: string | null
  conversation_count: number
  billing_cycle_start: string | null
  owner_user_id: string | null
  meta_page_name: string | null
  meta_ig_account_id: string | null
  meta_connected_at: string | null
  gcal_refresh_token: string | null
  gcal_calendar_id: string | null
  gcal_connected_at: string | null
}

export interface OpeningHours {
  [key: string]: {
    open: string | null
    close: string | null
    is_open: boolean
  }
}

export interface ServiceItem {
  name: string
  duration: number
  price: number
  description?: string
  category?: string
  is_active?: boolean
}

export interface Client {
  id: string
  business_id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  tags: string[] | null
  loyalty_points?: number
  total_visits?: number
  total_spent?: number
  last_visit_at?: string | null
  no_show_count?: number
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  client_name: string
  client_phone: string | null
  service: string | null
  appointment_date: string
  time_slot: string
  end_time: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  source: string | null
  notes: string | null
  reminder_sent: string | null
  gcal_event_id: string | null
  client_email: string | null
  client_notes: string | null
  created_at: string
  updated_at: string
}

export interface BlockedSlot {
  id: string
  business_id: string
  date: string
  time_from: string | null
  time_to: string | null
  all_day: boolean
  reason: string | null
  source: string | null
  gcal_event_id: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type AppointmentStatus = Appointment['status']

// Insert types
export type BusinessInsert = Omit<Business, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type AppointmentInsert = Partial<Appointment> & {
  business_id: string
  client_name: string
  appointment_date: string
  time_slot: string
}

// Supabase generic type (minimal — for createClient typing)
export interface Database {
  public: {
    Tables: {
      bookbot_businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business> }
      bookbot_appointments: { Row: Appointment; Insert: Partial<Appointment>; Update: Partial<Appointment> }
      bookbot_blocked_slots: { Row: BlockedSlot; Insert: Partial<BlockedSlot>; Update: Partial<BlockedSlot> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
