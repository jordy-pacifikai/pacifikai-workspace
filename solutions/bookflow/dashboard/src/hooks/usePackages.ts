'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const packageKeys = {
  all: ['packages'] as const,
  list: (businessId: string) => [...packageKeys.all, 'list', businessId] as const,
  clientPackages: (clientId: string) => [...packageKeys.all, 'client', clientId] as const,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Package {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  services: string[];
  total_sessions: number;
  price: number;
  original_price: number | null;
  valid_days: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ClientPackage {
  id: string;
  business_id: string;
  client_id: string;
  package_id: string;
  sessions_remaining: number;
  sessions_total: number;
  purchased_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'completed';
  package?: Package;
}

export interface PackageInput {
  name: string;
  description?: string;
  services: string[];
  total_sessions: number;
  price: number;
  original_price?: number | null;
  valid_days?: number;
  is_active?: boolean;
}

// ─── Hooks — Packages ─────────────────────────────────────────────────────────

export function usePackages(businessId: string | null) {
  return useQuery({
    queryKey: packageKeys.list(businessId ?? ''),
    queryFn: async (): Promise<Package[]> => {
      const { data, error } = await supabase
        .from('bookbot_packages')
        .select('*')
        .eq('business_id', businessId!)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Package[];
    },
    enabled: Boolean(businessId),
  });
}

export function useCreatePackage(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: async (input: PackageInput): Promise<Package> => {
      const { data, error } = await supabase
        .from('bookbot_packages')
        .insert({
          business_id: bid,
          name: input.name,
          description: input.description ?? null,
          services: input.services,
          total_sessions: input.total_sessions,
          price: input.price,
          original_price: input.original_price ?? null,
          valid_days: input.valid_days ?? 365,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Package;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.list(bid) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la création du forfait');
    },
  });
}

export function useUpdatePackage(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<PackageInput>;
    }): Promise<Package> => {
      const { data, error } = await supabase
        .from('bookbot_packages')
        .update(input)
        .eq('id', id)
        .eq('business_id', bid)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Package;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.list(bid) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du forfait');
    },
  });
}

export function useDeletePackage(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('bookbot_packages')
        .delete()
        .eq('id', id)
        .eq('business_id', bid);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.list(bid) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la suppression du forfait');
    },
  });
}

// ─── Hooks — Client Packages ──────────────────────────────────────────────────

export function useClientPackages(clientId: string | null, businessId: string | null) {
  return useQuery({
    queryKey: packageKeys.clientPackages(clientId ?? ''),
    queryFn: async (): Promise<ClientPackage[]> => {
      const { data, error } = await supabase
        .from('bookbot_client_packages')
        .select('*, package:bookbot_packages(*)')
        .eq('client_id', clientId!)
        .eq('business_id', businessId!)
        .order('purchased_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ClientPackage[];
    },
    enabled: Boolean(clientId) && Boolean(businessId),
  });
}

export function useAssignPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      clientId,
      packageId,
      pkg,
    }: {
      businessId: string;
      clientId: string;
      packageId: string;
      pkg: Package;
    }): Promise<ClientPackage> => {
      const expiresAt = pkg.valid_days
        ? new Date(Date.now() + pkg.valid_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('bookbot_client_packages')
        .insert({
          business_id: businessId,
          client_id: clientId,
          package_id: packageId,
          sessions_remaining: pkg.total_sessions,
          sessions_total: pkg.total_sessions,
          expires_at: expiresAt,
          status: 'active',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ClientPackage;
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.clientPackages(clientId) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors de l'attribution du forfait");
    },
  });
}

export function useDecrementSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientPackageId,
      clientId,
      currentRemaining,
    }: {
      clientPackageId: string;
      clientId: string;
      currentRemaining: number;
    }): Promise<void> => {
      const newRemaining = currentRemaining - 1;
      const newStatus = newRemaining <= 0 ? 'completed' : 'active';

      const { error } = await supabase
        .from('bookbot_client_packages')
        .update({
          sessions_remaining: Math.max(0, newRemaining),
          status: newStatus,
        })
        .eq('id', clientPackageId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.clientPackages(clientId) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors du décompte de la séance');
    },
  });
}
