import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConversationDetail, ConversationMessage } from './useConversation';

interface SendReplyParams {
  sessionId: string;
  message: string;
}

async function postReply(params: SendReplyParams): Promise<{ ok: boolean }> {
  const res = await fetch('/api/conversations/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erreur inconnue' }));
    throw new Error(body.error ?? `Erreur ${res.status}`);
  }
  return res.json();
}

/**
 * Mutation hook for sending a reply from the dashboard.
 * Performs an optimistic update on the conversation query cache
 * and invalidates on success so realtime data takes over.
 */
export function useSendReply(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postReply,
    onMutate: async (variables) => {
      if (!sessionId) return;

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['conversation', sessionId] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<ConversationDetail>(['conversation', sessionId]);

      // Optimistically add the message
      if (previous) {
        const optimisticMsg: ConversationMessage = {
          role: 'assistant',
          content: variables.message,
        };
        queryClient.setQueryData<ConversationDetail>(['conversation', sessionId], {
          ...previous,
          context: {
            ...previous.context,
            messages: [...(previous.context?.messages ?? []), optimisticMsg],
          },
          updated_at: new Date().toISOString(),
        });
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previous && sessionId) {
        queryClient.setQueryData(['conversation', sessionId], context.previous);
      }
    },
    onSettled: () => {
      // Refetch to get server truth
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', sessionId] });
      }
    },
  });
}
