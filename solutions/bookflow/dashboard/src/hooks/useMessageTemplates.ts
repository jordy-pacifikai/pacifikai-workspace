'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateType =
  | 'confirmation'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'followup'
  | 'birthday'
  | 'review_request'
  | 'cancellation'
  | 'reschedule';

export interface MessageTemplate {
  id: string;
  business_id: string;
  type: TemplateType;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertTemplateInput {
  type: TemplateType;
  message: string;
  is_active?: boolean;
}

// ─── Default templates (fallback when no custom template exists) ──────────────

export const DEFAULT_TEMPLATES: Record<TemplateType, string> = {
  confirmation:
    "Bonjour {nom} ! \u2705 Votre rendez-vous pour {service} est confirm\u00e9 le {date} \u00e0 {heure}. \u00c0 bient\u00f4t ! \u2014 {business}",
  reminder_24h:
    "Rappel\u00a0: votre rendez-vous {service} est demain \u00e0 {heure}. Si vous devez modifier, utilisez ce lien\u00a0: {lien_booking}",
  reminder_1h:
    "\u23f0 Rappel\u00a0: votre rendez-vous {service} est dans 1 heure ({heure}). On vous attend\u00a0!",
  followup:
    "Merci {nom} pour votre visite\u00a0! Comment s\u2019est pass\u00e9 votre {service}\u00a0? N\u2019h\u00e9sitez pas \u00e0 repartager\u00a0: {lien_booking}",
  birthday:
    "\ud83c\udf82 Joyeux anniversaire {nom}\u00a0! Pour f\u00eater \u00e7a, profitez de -10\u00a0% sur votre prochain rendez-vous avec le code ANNIV. \u2014 {business}",
  review_request:
    "Bonjour {nom}, merci pour votre visite\u00a0! Votre avis compte beaucoup pour nous\u00a0: {lien_avis}",
  cancellation:
    "Votre rendez-vous {service} du {date} \u00e0 {heure} a \u00e9t\u00e9 annul\u00e9. Pour reprogrammer\u00a0: {lien_booking}",
  reschedule:
    "Votre rendez-vous {service} a \u00e9t\u00e9 d\u00e9plac\u00e9 au {date} \u00e0 {heure}. Si cela ne vous convient pas\u00a0: {lien_booking}",
};

// ─── Query keys ───────────────────────────────────────────────────────────────

export const templateKeys = {
  all: ['bookbot_message_templates'] as const,
  list: (businessId: string) => [...templateKeys.all, 'list', businessId] as const,
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchTemplates(businessId: string): Promise<MessageTemplate[]> {
  const { data, error } = await supabase
    .from('bookbot_message_templates')
    .select('*')
    .eq('business_id', businessId)
    .order('type', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MessageTemplate[];
}

async function upsertTemplate(
  businessId: string,
  input: UpsertTemplateInput,
): Promise<MessageTemplate> {
  const { data, error } = await supabase
    .from('bookbot_message_templates')
    .upsert(
      {
        business_id: businessId,
        type: input.type,
        message: input.message,
        is_active: input.is_active ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id,type' },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as MessageTemplate;
}

async function deleteTemplate(businessId: string, type: TemplateType): Promise<void> {
  const { error } = await supabase
    .from('bookbot_message_templates')
    .delete()
    .eq('business_id', businessId)
    .eq('type', type);

  if (error) throw new Error(error.message);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMessageTemplates(businessId: string | null) {
  return useQuery({
    queryKey: templateKeys.list(businessId ?? ''),
    queryFn: () => fetchTemplates(businessId!),
    enabled: Boolean(businessId),
  });
}

export function useUpdateTemplate(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (input: UpsertTemplateInput) => upsertTemplate(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.list(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du template');
    },
  });
}

export function useResetTemplate(businessId: string | null) {
  const queryClient = useQueryClient();
  const id = businessId ?? '';

  return useMutation({
    mutationFn: (type: TemplateType) => deleteTemplate(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.list(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la réinitialisation du template');
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the effective message for a type (custom or default) */
export function resolveTemplate(
  templates: MessageTemplate[],
  type: TemplateType,
): string {
  return templates.find((t) => t.type === type)?.message ?? DEFAULT_TEMPLATES[type];
}
