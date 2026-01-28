import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Appointment, AppointmentInsert } from '../types/database';

type AppointmentWithRelations = Appointment & {
  service?: { name: string; duration: number; price: number | null } | null;
  client?: { name: string; phone: string | null } | null;
  business?: { name: string; slug: string } | null;
};

export function useAppointments(options: {
  businessId?: string | null;
  clientId?: string | null;
  date?: string;
}) {
  const { businessId, clientId, date } = options;
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId && !clientId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    fetchAppointments();
  }, [businessId, clientId, date]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, duration, price),
        client:clients(name, phone),
        business:businesses(name, slug)
      `)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAppointments((data as AppointmentWithRelations[]) || []);
    }

    setLoading(false);
  };

  const createAppointment = async (appointmentData: Omit<AppointmentInsert, 'id'>) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData as any)
      .select(`
        *,
        service:services(name, duration, price),
        client:clients(name, phone),
        business:businesses(name, slug)
      `)
      .single();

    if (!error && data) {
      setAppointments((prev) => [...prev, data as AppointmentWithRelations]);
    }

    return { data: data as AppointmentWithRelations | null, error };
  };

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates as any)
      .eq('id', appointmentId)
      .select(`
        *,
        service:services(name, duration, price),
        client:clients(name, phone),
        business:businesses(name, slug)
      `)
      .single();

    if (!error && data) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? (data as AppointmentWithRelations) : a))
      );
    }

    return { data: data as AppointmentWithRelations | null, error };
  };

  const cancelAppointment = async (appointmentId: string) => {
    return updateAppointment(appointmentId, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
  };

  const completeAppointment = async (appointmentId: string) => {
    return updateAppointment(appointmentId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  };

  const getAvailableSlots = async (businessId: string, date: string, serviceDuration?: number) => {
    const { data, error } = await supabase.rpc('get_available_slots', {
      p_business_id: businessId,
      p_date: date,
      p_service_duration: serviceDuration || 30,
    } as any);

    return { data, error };
  };

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    getAvailableSlots,
  };
}
