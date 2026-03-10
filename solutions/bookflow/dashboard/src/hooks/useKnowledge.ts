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

// ─── Embedding trigger ────────────────────────────────────────────────────────

async function triggerEmbeddings(knowledgeId: string, businessId: string, action: 'upsert' | 'delete' = 'upsert') {
  try {
    await fetch('/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knowledgeId, businessId, action }),
    });
  } catch {
    // Non-blocking — embeddings generation is async
    console.warn('Failed to trigger embeddings for', knowledgeId);
  }
}

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

async function updateKnowledgeDoc(id: string, businessId: string, input: Partial<KnowledgeInput>): Promise<KnowledgeDoc> {
  const { data, error } = await supabase
    .from('bookbot_knowledge')
    .update(input)
    .eq('id', id)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as KnowledgeDoc;
}

async function deleteKnowledgeDoc(id: string, businessId: string): Promise<void> {
  const { error } = await supabase
    .from('bookbot_knowledge')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

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
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list(id) });
      triggerEmbeddings(doc.id, id, 'upsert');
    },
  });
}

export function useUpdateKnowledge(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<KnowledgeInput> }) =>
      updateKnowledgeDoc(id, bid, input),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list(bid) });
      triggerEmbeddings(doc.id, bid, 'upsert');
    },
  });
}

export function useDeleteKnowledge(businessId: string | null) {
  const queryClient = useQueryClient();
  const bid = businessId ?? '';

  return useMutation({
    mutationFn: (id: string) => deleteKnowledgeDoc(id, bid).then(() => id),
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list(bid) });
      triggerEmbeddings(deletedId, bid, 'delete');
    },
  });
}
