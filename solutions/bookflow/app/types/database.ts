// Types generated from Supabase schema
// Run: npx supabase gen types typescript --project-id celwaekgtxknzwyjrjym > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          owner_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          category: 'coiffure' | 'ongles' | 'bien-etre' | 'sport' | 'beaute' | 'autre' | null;
          description: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          instagram: string | null;
          facebook: string | null;
          website: string | null;
          is_visible: boolean;
          is_verified: boolean;
          opening_hours: Json | null;
          break_time: Json | null;
          default_slot_duration: number;
          booking_buffer: number;
          max_advance_booking_days: number;
          min_advance_booking_hours: number;
          rebooking_reminder_weeks: number;
          subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise';
          subscription_status: 'active' | 'paused' | 'cancelled' | 'trial';
          trial_ends_at: string | null;
          rating: number;
          review_count: number;
          total_bookings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug: string;
          owner_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          category?: 'coiffure' | 'ongles' | 'bien-etre' | 'sport' | 'beaute' | 'autre' | null;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          website?: string | null;
          is_visible?: boolean;
          is_verified?: boolean;
          opening_hours?: Json | null;
          break_time?: Json | null;
          default_slot_duration?: number;
          booking_buffer?: number;
          max_advance_booking_days?: number;
          min_advance_booking_hours?: number;
          rebooking_reminder_weeks?: number;
          subscription_plan?: 'free' | 'starter' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'paused' | 'cancelled' | 'trial';
          trial_ends_at?: string | null;
          rating?: number;
          review_count?: number;
          total_bookings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          slug?: string;
          owner_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          category?: 'coiffure' | 'ongles' | 'bien-etre' | 'sport' | 'beaute' | 'autre' | null;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          website?: string | null;
          is_visible?: boolean;
          is_verified?: boolean;
          opening_hours?: Json | null;
          break_time?: Json | null;
          default_slot_duration?: number;
          booking_buffer?: number;
          max_advance_booking_days?: number;
          min_advance_booking_hours?: number;
          rebooking_reminder_weeks?: number;
          subscription_plan?: 'free' | 'starter' | 'pro' | 'enterprise';
          subscription_status?: 'active' | 'paused' | 'cancelled' | 'trial';
          trial_ends_at?: string | null;
          rating?: number;
          review_count?: number;
          total_bookings?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          duration: number;
          price: number | null;
          category: string | null;
          is_active: boolean;
          display_order: number;
          loyalty_points_earned: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          duration: number;
          price?: number | null;
          category?: string | null;
          is_active?: boolean;
          display_order?: number;
          loyalty_points_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          duration?: number;
          price?: number | null;
          category?: string | null;
          is_active?: boolean;
          display_order?: number;
          loyalty_points_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string | null;
          business_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          preferred_contact: 'push' | 'sms' | 'email' | 'none';
          loyalty_points: number;
          total_visits: number;
          total_spent: number;
          last_visit_at: string | null;
          notes: string | null;
          tags: string[] | null;
          no_show_count: number;
          requires_confirmation: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          business_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          preferred_contact?: 'push' | 'sms' | 'email' | 'none';
          loyalty_points?: number;
          total_visits?: number;
          total_spent?: number;
          last_visit_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          no_show_count?: number;
          requires_confirmation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          business_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          preferred_contact?: 'push' | 'sms' | 'email' | 'none';
          loyalty_points?: number;
          total_visits?: number;
          total_spent?: number;
          last_visit_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          no_show_count?: number;
          requires_confirmation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          client_id: string | null;
          service_id: string | null;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
          source: 'app' | 'web' | 'manual' | 'chatbot' | 'guest';
          notes: string | null;
          pro_notes: string | null;
          price: number | null;
          reminder_24h_sent: boolean;
          reminder_2h_sent: boolean;
          confirmation_required: boolean;
          confirmed_at: string | null;
          points_earned: number;
          loyalty_reward_applied: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          guest_token: string | null;
          created_at: string;
          updated_at: string;
          cancelled_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          client_id?: string | null;
          service_id?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
          source?: 'app' | 'web' | 'manual' | 'chatbot' | 'guest';
          notes?: string | null;
          pro_notes?: string | null;
          price?: number | null;
          reminder_24h_sent?: boolean;
          reminder_2h_sent?: boolean;
          confirmation_required?: boolean;
          confirmed_at?: string | null;
          points_earned?: number;
          loyalty_reward_applied?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          guest_token?: string | null;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          client_id?: string | null;
          service_id?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
          source?: 'app' | 'web' | 'manual' | 'chatbot' | 'guest';
          notes?: string | null;
          pro_notes?: string | null;
          price?: number | null;
          reminder_24h_sent?: boolean;
          reminder_2h_sent?: boolean;
          confirmation_required?: boolean;
          confirmed_at?: string | null;
          points_earned?: number;
          loyalty_reward_applied?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          guest_token?: string | null;
          created_at?: string;
          updated_at?: string;
          cancelled_at?: string | null;
          completed_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          business_id: string;
          client_id: string | null;
          appointment_id: string | null;
          rating: number;
          comment: string | null;
          is_visible: boolean;
          is_verified: boolean;
          pro_response: string | null;
          pro_responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          client_id?: string | null;
          appointment_id?: string | null;
          rating: number;
          comment?: string | null;
          is_visible?: boolean;
          is_verified?: boolean;
          pro_response?: string | null;
          pro_responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          client_id?: string | null;
          appointment_id?: string | null;
          rating?: number;
          comment?: string | null;
          is_visible?: boolean;
          is_verified?: boolean;
          pro_response?: string | null;
          pro_responded_at?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_available_slots: {
        Args: {
          p_business_id: string;
          p_date: string;
          p_service_duration?: number;
        };
        Returns: {
          slot_time: string;
          is_available: boolean;
        }[];
      };
      generate_unique_slug: {
        Args: {
          base_name: string;
        };
        Returns: string;
      };
      generate_guest_token: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}

// Convenience types
export type Business = Database['public']['Tables']['businesses']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];

export type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
