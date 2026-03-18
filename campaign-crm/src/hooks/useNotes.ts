'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Note } from '@/lib/types';

function notesKey(prospectId: string) {
  return ['notes', prospectId] as const;
}

export function useNotes(prospectId: string) {
  return useQuery<Note[]>({
    queryKey: notesKey(prospectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_notes')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as Note[];
    },
    enabled: Boolean(prospectId),
  });
}

interface AddNoteInput {
  prospect_id: string;
  content: string;
  author: string;
  note_type: Note['note_type'];
}

export function useAddNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddNoteInput) => {
      const { data, error } = await supabase
        .from('campaign_notes')
        .insert(input)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Note;
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: notesKey(note.prospect_id) });
    },
  });
}
