'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Wrench, Send, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useConversation, type ConversationMessage } from '@/hooks/useConversation';
import { useSendReply } from '@/hooks/useSendReply';
import { toast } from '@/components/ui/Toast';

// ── Helpers ────────────────────────────────────────────────────────────────────

function stateLabel(state: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    idle: { label: 'Inactif', color: '#4B5563' },
    active: { label: 'Actif', color: '#25D366' },
    booked: { label: 'Réservé', color: '#3B82F6' },
    cancelled: { label: 'Annulé', color: '#EF4444' },
  };
  return map[state] ?? { label: state, color: '#4B5563' };
}

function toolName(msg: ConversationMessage): string {
  // Try to extract tool name from content or name field
  if (msg.name) return msg.name;
  try {
    const parsed = JSON.parse(msg.content);
    return parsed.name ?? parsed.tool ?? 'outil';
  } catch {
    // Extract from plain text like "check_availability" patterns
    const match = msg.content.match(/^[\w_]+/);
    return match ? match[0] : 'outil';
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[false, true, false, true, false].map((right, i) => (
        <div
          key={i}
          className={`flex ${right ? 'justify-end' : 'justify-start'} animate-pulse`}
        >
          <div
            className="h-12 rounded-2xl bg-gray-800"
            style={{ width: `${40 + (i % 3) * 15}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: ConversationMessage }) {
  if (msg.role === 'tool') {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/60 text-gray-500 text-xs italic max-w-xs truncate">
          <Wrench size={10} className="shrink-0" />
          <span className="truncate">[Outil : {toolName(msg)}]</span>
        </div>
      </div>
    );
  }

  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl text-sm text-white leading-relaxed whitespace-pre-wrap break-words
          ${isUser
            ? 'bg-gray-700 rounded-br-sm'
            : 'rounded-bl-sm border border-[#25D366]/20'
          }
        `}
        style={isUser ? undefined : { backgroundColor: 'rgba(37, 211, 102, 0.08)' }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ── Reply bar ────────────────────────────────────────────────────────────────

function ReplyBar({ sessionId }: { sessionId: string }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: send, isPending } = useSendReply(sessionId);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    send(
      { sessionId, message: trimmed },
      {
        onSuccess: () => setText(''),
        onError: (err) => toast.error(err.message || 'Erreur lors de l\'envoi'),
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ecrire une reponse..."
        rows={1}
        disabled={isPending}
        className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 resize-none outline-none placeholder-gray-500 disabled:opacity-50 border border-gray-700 focus:border-gray-600 transition-colors"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isPending}
        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-[#25D366] text-white disabled:opacity-40 hover:bg-[#1fb855] transition-colors"
        title="Envoyer (Entree)"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: session, isLoading, isError } = useConversation(params.id ?? null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = session?.context?.messages ?? [];
  const visibleMessages = messages.filter(() => true); // keep all, tool collapsed inline

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length]);
  const totalMessages = messages.length;
  const userMessages = messages.filter((m) => m.role === 'user').length;
  const state = session ? stateLabel(session.state) : null;

  const formattedDate = session
    ? format(new Date(session.created_at), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })
    : null;

  const lastActivity = session
    ? format(new Date(session.updated_at), "d MMM, HH'h'mm", { locale: fr })
    : null;

  return (
    <DashboardLayout title="Conversation">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">

        {/* Back button */}
        <Link
          href="/conversations"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Conversations
        </Link>

        {/* Header card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          {isLoading && (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          )}

          {isError && (
            <p className="text-gray-400 text-sm">Conversation introuvable.</p>
          )}

          {session && (
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: '#25D366' }}
                >
                  {(session.client_name || session.phone).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {session.client_name || session.phone}
                  </p>
                  {session.client_name && (
                    <p className="text-gray-500 text-xs">{session.phone}</p>
                  )}
                </div>
              </div>

              {/* State badge */}
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${state!.color}18`,
                  color: state!.color,
                }}
              >
                {state!.label}
              </span>
            </div>
          )}
        </div>

        {/* Meta info bar */}
        {session && (
          <div className="flex items-center gap-6 px-1 text-xs text-gray-500 flex-wrap">
            <span>Démarré le {formattedDate}</span>
            <span className="w-px h-3 bg-gray-700" />
            <span>
              <span className="text-white font-medium">{userMessages}</span> message{userMessages !== 1 ? 's' : ''} client
            </span>
            <span className="w-px h-3 bg-gray-700" />
            <span>
              <span className="text-white font-medium">{totalMessages}</span> échanges au total
            </span>
            <span className="w-px h-3 bg-gray-700" />
            <span>Dernière activité : {lastActivity}</span>
          </div>
        )}

        {/* Messages card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

          {/* Loading */}
          {isLoading && <MessageSkeleton />}

          {/* Error */}
          {isError && !isLoading && (
            <div className="px-4 py-12 text-center text-gray-400 text-sm">
              Impossible de charger cette conversation.
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && session && visibleMessages.length === 0 && (
            <div className="px-4 py-12 text-center text-gray-500 text-sm">
              Aucun message enregistré pour cette conversation.
            </div>
          )}

          {/* Messages */}
          {!isLoading && !isError && session && visibleMessages.length > 0 && (
            <div className="flex flex-col gap-2 p-4">
              {visibleMessages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Reply input */}
        {session && <ReplyBar sessionId={session.id} />}

      </div>
    </DashboardLayout>
  );
}
