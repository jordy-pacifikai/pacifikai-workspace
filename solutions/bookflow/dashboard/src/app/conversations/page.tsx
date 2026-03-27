'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAppStore } from '@/lib/store';
import { useConversations, type ConversationSession } from '@/hooks/useConversations';

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { locale: fr, addSuffix: true });
}

function lastMessage(session: ConversationSession): string {
  const messages = session.context?.messages;
  if (!messages || messages.length === 0) return 'Aucun message';
  const last = messages[messages.length - 1];
  const text = last?.content ?? '';
  return text.length > 60 ? text.slice(0, 60) + '…' : text;
}

function messageCount(session: ConversationSession): number {
  return session.context?.messages?.length ?? 0;
}

function isActive(state: string): boolean {
  return state !== 'idle';
}

function displayName(session: ConversationSession): string {
  return session.client_name || session.phone;
}

function initial(session: ConversationSession): string {
  const name = session.client_name || session.phone;
  return (name.charAt(0) || '?').toUpperCase();
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-800 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
      </div>
      <div className="h-3 bg-gray-800 rounded w-12 shrink-0" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(37, 211, 102, 0.10)' }}
      >
        <MessageCircle size={28} style={{ color: '#25D366' }} />
      </div>
      <p className="text-white font-semibold text-base mb-2">Aucune conversation pour l&apos;instant</p>
      <p className="text-gray-400 text-sm max-w-xs">
        Dès qu&apos;un client écrira à votre chatbot, la conversation apparaîtra ici.
      </p>
    </div>
  );
}

// ── Conversation row ──────────────────────────────────────────────────────────

function ConversationRow({ session, isCurrent }: { session: ConversationSession; isCurrent?: boolean }) {
  const active = isActive(session.state);
  const count = messageCount(session);

  return (
    <Link
      href={`/conversations/${session.id}`}
      aria-label={`Conversation avec ${displayName(session)}, ${count} message${count !== 1 ? 's' : ''}`}
      aria-current={isCurrent ? 'true' : undefined}
      className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 border-b border-gray-800 hover:bg-gray-800/40 transition-colors cursor-pointer"
    >

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ backgroundColor: '#25D366' }}
      >
        {initial(session)}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-sm font-medium truncate">
            {displayName(session)}
          </span>
          {/* State dot */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: active ? '#25D366' : '#4B5563' }}
            title={active ? 'Actif' : 'Inactif'}
          />
        </div>
        <p className="text-gray-400 text-xs truncate">{lastMessage(session)}</p>
      </div>

      {/* Right side */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="text-gray-600 text-xs whitespace-nowrap">{timeAgo(session.updated_at)}</span>
        {count > 0 && (
          <span
            role="status"
            aria-label={`${count} message${count !== 1 ? 's' : ''}`}
            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(37, 211, 102, 0.12)', color: '#25D366' }}
          >
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ sessions }: { sessions: ConversationSession[] }) {
  const total = sessions.length;
  const active = sessions.filter((s) => isActive(s.state)).length;

  return (
    <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-800">
      <div>
        <span className="text-white font-semibold text-sm">{total}</span>
        <span className="text-gray-500 text-xs ml-1.5">conversation{total !== 1 ? 's' : ''}</span>
      </div>
      <div className="w-px h-4 bg-gray-800" />
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: '#25D366' }}
        />
        <span className="text-white font-semibold text-sm">{active}</span>
        <span className="text-gray-500 text-xs">session{active !== 1 ? 's' : ''} active{active !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConversationsPage() {
  const businessId = useAppStore((s) => s.businessId);
  const { data: sessions, isLoading, isError } = useConversations(businessId);

  return (
    <DashboardLayout title="Conversations">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

          {/* Loading */}
          {isLoading && (
            <>
              <div className="h-12 border-b border-gray-800 animate-pulse bg-gray-800/30" />
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Impossible de charger les conversations.
            </div>
          )}

          {/* Data */}
          {!isLoading && !isError && sessions && (
            <>
              <StatsBar sessions={sessions} />
              {sessions.length === 0 ? (
                <EmptyState />
              ) : (
                <ul role="list" aria-label="Liste des conversations">
                  {sessions.map((session) => (
                    <li key={session.id} role="listitem">
                      <ConversationRow session={session} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
