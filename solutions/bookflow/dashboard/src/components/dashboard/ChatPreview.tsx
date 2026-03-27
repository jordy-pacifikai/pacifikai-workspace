'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, RotateCcw, Loader2, Bot, User } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────────────────

const GREEN = '#25D366';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ChatPreview() {
  const { businessId, businessName } = useAppStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `preview_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !businessId || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, message: userMsg.content, sessionId }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}`);
      }

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          role: 'assistant',
          content: data.reply ?? 'Erreur de reponse',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('[chat-preview] fetch error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content: 'Erreur de connexion. Reessayez.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, businessId, loading, sessionId]);

  const resetChat = useCallback(async () => {
    if (!businessId) return;
    await fetch(`/api/chat-test?businessId=${businessId}&sessionId=${sessionId}`, {
      method: 'DELETE',
    }).catch(() => {});
    setMessages([]);
  }, [businessId, sessionId]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Don't render if no businessId (not logged in / no business)
  if (!businessId) return null;

  return (
    <>
      {/* ── Floating action button ──────────────────────────────────────── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-black/40 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 group"
          style={{ backgroundColor: GREEN }}
          title="Tester mon chatbot"
          aria-label="Ouvrir le chat de test"
        >
          <MessageCircle size={24} className="drop-shadow-sm" />
          {/* Tooltip */}
          <span className="absolute right-16 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Tester mon chatbot
          </span>
        </button>
      )}

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-gray-800 bg-gray-950 animate-in slide-in-from-bottom-4 duration-200">
          {/* ── Header ────────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ backgroundColor: GREEN }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Test chatbot
                </p>
                <p className="text-[11px] text-white/70 truncate">
                  {businessName || 'Mon commerce'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={resetChat}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                title="Nouvelle conversation"
                aria-label="Reinitialiser la conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                title="Fermer"
                aria-label="Fermer le chat de test"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Messages area ─────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(37, 211, 102, 0.03) 0%, transparent 50%)',
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}
                >
                  <Bot size={20} style={{ color: GREEN }} />
                </div>
                <p className="text-sm font-medium text-gray-300">
                  Testez votre chatbot
                </p>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Envoyez un message comme le ferait un client.
                  Essayez &quot;Bonjour&quot; ou &quot;Je voudrais prendre rendez-vous&quot;.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : '')}
              >
                {/* Bot avatar */}
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}
                  >
                    <Bot size={12} style={{ color: GREEN }} />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed',
                    msg.role === 'user'
                      ? 'text-gray-950 font-medium rounded-br-md'
                      : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-md',
                  )}
                  style={msg.role === 'user' ? { backgroundColor: GREEN } : undefined}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-0.5',
                      msg.role === 'user' ? 'text-gray-800' : 'text-gray-600',
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gray-800">
                    <User size={12} className="text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}
                >
                  <Bot size={12} style={{ color: GREEN }} />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Input bar ─────────────────────────────────────────────── */}
          <form
            onSubmit={sendMessage}
            className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-t border-gray-800 bg-gray-950"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tapez un message..."
              disabled={loading}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366]/40 focus:ring-1 focus:ring-[#25D366]/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-gray-950 disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: GREEN }}
              aria-label="Envoyer"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
