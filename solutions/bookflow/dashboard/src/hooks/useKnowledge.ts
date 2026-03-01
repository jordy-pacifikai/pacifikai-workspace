'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KnowledgeDoc {
  id: string;
  business_id: string;
  title: string;
  category: string | null;
  content: string;
  created_at: string;
}

export interface KnowledgeInput {
  title: string;
  category?: string;
  content: string;
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const knowledgeKeys = {
  all: ['knowledge'] as const,
  list: (businessId: string) => [...knowledgeKeys.all, 'list', businessId] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchKnowledge(businessId: string): Promise<KnowledgeDoc[]> {
  const { data, error } = await supabase
    .from('bookbot_knowledge')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as KnowledgeDoc[];
}

async function createKnowledgeDoc(businessId: string, input: KnowledgeInput): Promise<KnowledgeDoc> {
  const { data, error } = await supabase
    .from('bookbot_knowledge')
    .insert({
      business_id: businessId,
      title: input.title,
      category: input.category ?? 'general',
      content: input.content,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as KnowledgeDoc;
}

async function updateKnowledgeDoc(id: string, input: Partial<KnowledgeInput>): Promise<KnowledgeDoc> {
  const { data, error } = await supabase
    .from('bookbot_knowledge')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as KnowledgeDoc;
}

async function deleteKnowledgeDoc(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookbot_knowledge')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useKnowledge(businessId: string | null) {
  return useQuery({
    queryKey: knowledgeKeys.list(businessId ?? ''),
    queryFn: () => fetchKnowledge(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useCreateKnowledge(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (input: KnowledgeInput) => createKnowledgeDoc(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list(id) });
    },
  });
}

export function useUpdateKnowledge(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<KnowledgeInput> }) =>
      updateKnowledgeDoc(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list(bid) });
    },
  });
}

export function useDeleteKnowledge(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: (id: string) => deleteKnowledgeDoc(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list(bid) });
    },
  });
}
