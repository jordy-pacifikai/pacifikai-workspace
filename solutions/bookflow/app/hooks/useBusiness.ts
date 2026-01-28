import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Business } from '../types/database';
import { useAuth } from './useAuth';

export function useBusiness() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    fetchBusiness();
  }, [user]);

  const fetchBusiness = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      setError(fetchError.message);
    } else {
      setBusiness(data as Business | null);
    }

    setLoading(false);
  };

  const createBusiness = async (businessData: {
    name: string;
    category?: string;
    phone?: string;
    email?: string;
  }) => {
    if (!user) return { data: null, error: { message: 'Non authentifié' } };

    // Generate slug from name
    const baseSlug = businessData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...businessData,
        owner_id: user.id,
        slug: `${baseSlug}-${Date.now().toString(36)}`,
      } as any)
      .select()
      .single();

    if (!error && data) {
      setBusiness(data as Business);
    }

    return { data: data as Business | null, error };
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) return { data: null, error: { message: 'Aucun établissement' } };

    const { data, error } = await supabase
      .from('businesses')
      .update(updates as any)
      .eq('id', business.id)
      .select()
      .single();

    if (!error && data) {
      setBusiness(data as Business);
    }

    return { data: data as Business | null, error };
  };

  return {
    business,
    loading,
    error,
    fetchBusiness,
    createBusiness,
    updateBusiness,
  };
}
