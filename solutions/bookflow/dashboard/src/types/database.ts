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
  client_id: string | null
  service_id: string | null
  date: string
  start_time: string
  end_time: string
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  source: 'app' | 'web' | 'manual' | 'chatbot' | 'guest' | 'whatsapp'
  notes: string | null
  pro_notes: string | null
  price: number | null
  reminder_24h_sent?: boolean
  reminder_2h_sent?: boolean
  confirmation_required?: boolean
  confirmed_at?: string | null
  points_earned?: number
  guest_name: string | null
  guest_phone: string | null
  guest_token?: string | null
  created_at: string
  updated_at: string
  cancelled_at?: string | null
  completed_at?: string | null
  // Joined relations
  client?: Client | null
  service?: Service | null
}

export type AppointmentWithRelations = Omit<Appointment, 'client' | 'service'> & {
  client: Pick<Client, 'id' | 'name' | 'phone' | 'email'> | null
  service: Pick<Service, 'id' | 'name' | 'duration' | 'price'> | null
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
export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'client' | 'service'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

// Row type without joined relations (for Supabase insert/update)
type AppointmentRow = Omit<Appointment, 'client' | 'service'>

// Supabase generic type (minimal — for createClient typing)
export interface Database {
  public: {
    Tables: {
      businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business> }
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> }
      clients: { Row: Client; Insert: Partial<Client>; Update: Partial<Client> }
      appointments: { Row: AppointmentRow; Insert: Partial<AppointmentRow>; Update: Partial<AppointmentRow> }
      blocked_slots: { Row: BlockedSlot; Insert: Partial<BlockedSlot>; Update: Partial<BlockedSlot> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
