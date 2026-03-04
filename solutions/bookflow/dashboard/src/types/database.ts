export interface Business {
  id: string
  owner_id: string | null
  name: string
  slug: string
  owner_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  category: string | null
  description: string | null
  avatar_url: string | null
  cover_url: string | null
  opening_hours: OpeningHours
  break_time: { start: string; end: string } | null
  default_slot_duration: number
  booking_buffer: number
  max_advance_booking_days: number
  subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise'
  rating: number
  review_count: number
  total_bookings: number
  created_at: string
  updated_at: string
}

export interface OpeningHours {
  [key: string]: {
    open: string | null
    close: string | null
    is_open: boolean
  }
}

export interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  category: string | null
  is_active: boolean
  display_order: number
  loyalty_points_earned?: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string | null
  business_id: string
  name: string
  phone: string | null
  email: string | null
  preferred_contact?: 'push' | 'sms' | 'email' | 'none'
  loyalty_points: number
  total_visits: number
  total_spent: number
  last_visit_at: string | null
  notes: string | null
  tags: string[] | null
  no_show_count: number
  requires_confirmation?: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  client_name: string | null
  client_phone: string | null
  service: string | null
  appointment_date: string
  time_slot: string
  end_time: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  source: 'app' | 'web' | 'manual' | 'chatbot' | 'guest' | 'whatsapp' | 'gcal'
  notes: string | null
  reminder_sent: boolean
  gcal_event_id: string | null
  created_at: string
  updated_at: string
}

export interface BlockedSlot {
  id: string
  business_id: string
  date: string
  start_time: string
  end_time: string
  reason: string | null
  is_recurring: boolean
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
export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

// Supabase generic type (minimal — for createClient typing)
export interface Database {
  public: {
    Tables: {
      businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business> }
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> }
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> }
      bookbot_appointments: { Row: Appointment; Insert: Partial<Appointment>; Update: Partial<Appointment> }
      blocked_slots: { Row: BlockedSlot; Insert: Partial<BlockedSlot>; Update: Partial<BlockedSlot> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
