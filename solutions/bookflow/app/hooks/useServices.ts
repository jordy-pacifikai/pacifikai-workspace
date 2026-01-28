import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Service, ServiceInsert } from '../types/database';

export function useServices(businessId: string | null) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setServices([]);
      setLoading(false);
      return;
    }

    fetchServices();
  }, [businessId]);

  const fetchServices = async () => {
    if (!businessId) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('display_order', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setServices((data as Service[]) || []);
    }

    setLoading(false);
  };

  const createService = async (serviceData: Omit<ServiceInsert, 'business_id'>) => {
    if (!businessId) return { data: null, error: { message: 'Aucun établissement' } };

    const { data, error } = await supabase
      .from('services')
      .insert({
        ...serviceData,
        business_id: businessId,
      } as any)
      .select()
      .single();

    if (!error && data) {
      setServices((prev) => [...prev, data as Service]);
    }

    return { data: data as Service | null, error };
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates as any)
      .eq('id', serviceId)
      .select()
      .single();

    if (!error && data) {
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? (data as Service) : s))
      );
    }

    return { data: data as Service | null, error };
  };

  const deleteService = async (serviceId: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    }

    return { error };
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
}
