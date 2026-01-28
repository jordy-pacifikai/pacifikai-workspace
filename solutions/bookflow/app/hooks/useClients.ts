import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Client, ClientInsert } from '../types/database';

export function useClients(businessId: string | null) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setClients([]);
      setLoading(false);
      return;
    }

    fetchClients();
  }, [businessId]);

  const fetchClients = async () => {
    if (!businessId) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setClients((data as Client[]) || []);
    }

    setLoading(false);
  };

  const createClient = async (clientData: Omit<ClientInsert, 'business_id'>) => {
    if (!businessId) return { data: null, error: { message: 'Aucun établissement' } };

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        business_id: businessId,
      } as any)
      .select()
      .single();

    if (!error && data) {
      setClients((prev) => [...prev, data as Client].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return { data: data as Client | null, error };
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates as any)
      .eq('id', clientId)
      .select()
      .single();

    if (!error && data) {
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? (data as Client) : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    return { data: data as Client | null, error };
  };

  const deleteClient = async (clientId: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (!error) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    }

    return { error };
  };

  const searchClients = async (query: string) => {
    if (!businessId) return { data: [], error: null };

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', businessId)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name', { ascending: true })
      .limit(20);

    return { data: (data as Client[]) || [], error };
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
  };
}
