'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Calendar, BarChart3, Clock, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: Date;
}

// ─── Fake assistant responses ─────────────────────────────────────────────────

const FAKE_RESPONSES: Record<string, string> = {
  'ajouter un rdv':
    "Pour ajouter un rendez-vous, dites-moi le nom du client, le service souhaite et la date/heure. Par exemple : 'RDV Marie Dupont - Coupe - Demain a 14h'.",
  'stats du jour':
    "Aujourd'hui vous avez 8 rendez-vous confirmes, 2 en attente. Taux de completion ce mois : 94%. Revenu estime aujourd'hui : 18 500 XPF.",
  'prochains rdv':
    "Vos 3 prochains rendez-vous : \n- 14h30 — Sophie Martin (Coupe + Couleur)\n- 15h15 — Jean Tahua (Barbe)\n- 16h00 — Marie Vatoa (Soin capillaire)",
  'modifier les horaires':
    "Pour modifier vos horaires, rendez-vous dans la section 'Horaires' du menu. Vous pouvez ajuster les plages d'ouverture, les pauses et la duree des creneaux.",
};

const FALLBACK_RESPONSE =
  "Je suis l'agent IA Ve'a. Cette fonctionnalite sera bientot connectee a votre assistant intelligent. En attendant, vous pouvez me demander d'ajouter un RDV, consulter vos stats, ou modifier vos horaires.";

function getFakeResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();
  for (const [key, response] of Object.entries(FAKE_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return FALLBACK_RESPONSE;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: 'Ajouter un RDV', icon: Calendar },
  { label: 'Stats du jour', icon: BarChart3 },
  { label: 'Prochains RDV', icon: Clock },
  { label: 'Modifier les horaires', icon: Settings },
] as const;

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3 max-w-full', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isUser
            ? 'bg-[#25D366]/20 border border-[#25D366]/30'
            : 'bg-gray-700 border border-gray-600',
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-[#25D366]" />
        ) : (
          <Bot className="w-4 h-4 text-gray-300" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
            isUser
              ? 'bg-[#25D366] text-white rounded-tr-sm'
              : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm',
          )}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-gray-600 px-1">
          {format(message.created_at, 'HH:mm', { locale: fr })}
        </span>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-gray-300" />
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Initial loading skeleton ─────────────────────────────────────────────────

function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
        <SkeletonRow />
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
        <SkeletonRow />
      </div>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
        <SkeletonRow />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Bonjour ! Je suis votre agent IA Ve'a. Je peux vous aider a gerer vos rendez-vous, consulter vos statistiques, ou modifier vos parametres. Comment puis-je vous aider ?",
  created_at: new Date(),
};

export default function AgentPage() {
  const { businessName } = useAppStore();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        created_at: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      const delay = 800 + Math.random() * 600;
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: getFakeResponse(trimmed),
          created_at: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, delay);
    },
    [isTyping],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <DashboardLayout title="Agent IA" businessName={businessName ?? undefined}>
      {/* Full-height chat container */}
      <div className="flex flex-col h-[calc(100vh-8rem)] min-h-0">

        {/* Header badge */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-gray-400 font-medium">Mode demonstration — IA non connectee</span>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto bg-gray-900 border border-gray-800 rounded-xl"
        >
          {isInitializing ? (
            <ChatSkeleton />
          ) : (
            <div className="flex flex-col gap-5 p-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {SUGGESTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => sendMessage(label)}
              disabled={isTyping}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap',
                'bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-full px-3 py-1.5',
                'hover:border-[#25D366]/50 hover:text-white transition-colors',
                'disabled:opacity-40 disabled:cursor-not-allowed shrink-0',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex gap-3 mt-3 shrink-0">
          <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-[#25D366] transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ecrivez un message... (Entree pour envoyer)"
              className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none resize-none leading-relaxed"
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 self-end transition-all',
              input.trim() && !isTyping
                ? 'bg-[#25D366] text-white hover:brightness-110'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed',
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-gray-600 text-center mt-2 shrink-0">
          Appuyez sur Entree pour envoyer, Maj+Entree pour un saut de ligne
        </p>
      </div>
    </DashboardLayout>
  );
}
