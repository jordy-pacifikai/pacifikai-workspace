'use client'

import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAppStore } from '@/lib/store'
import { Send, RotateCcw, Eye, EyeOff, Loader2, Bot, User } from 'lucide-react'

const GREEN = '#25D366'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: { name: string; input: Record<string, unknown>; result: string }[]
  timestamp: Date
}

export default function ChatTestPage() {
  const { businessId, businessName } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [sessionId] = useState(() => `dash_${Date.now()}`)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || !businessId || loading) return

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, message: userMsg.content, sessionId }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status}: ${text.slice(0, 200)}`)
      }

      const data = await res.json()

      const botMsg: Message = {
        id: `b_${Date.now()}`,
        role: 'assistant',
        content: data.reply ?? 'Erreur de réponse',
        toolCalls: data.toolCalls,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error('[chat-test] fetch error:', err)
      setMessages(prev => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content: `Erreur de connexion: ${err instanceof Error ? err.message : 'Réessayez.'}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function resetChat() {
    if (!businessId) return

    await fetch(`/api/chat-test?businessId=${businessId}&sessionId=${sessionId}`, {
      method: 'DELETE',
    })

    setMessages([])
  }

  return (
    <DashboardLayout title="Test du chatbot" businessName={businessName}>
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">Testez votre chatbot</h1>
            <p className="text-sm text-gray-500">
              Simulez une conversation comme si vous étiez un client
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDebugMode(d => !d)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                debugMode
                  ? 'border-green-500/50 text-green-400'
                  : 'border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
              style={debugMode ? { backgroundColor: 'rgba(37, 211, 102, 0.08)' } : undefined}
            >
              {debugMode ? <Eye size={13} /> : <EyeOff size={13} />}
              Debug
            </button>
            <button
              onClick={resetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700 transition-all"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-xl bg-gray-900 border border-gray-800 p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}
              >
                <Bot size={22} style={{ color: GREEN }} />
              </div>
              <p className="text-sm font-medium text-gray-300">Commencez la conversation</p>
              <p className="text-xs text-gray-600 mt-1 max-w-xs">
                Envoyez un message comme le ferait un client. Essayez &quot;Bonjour&quot; ou &quot;Je voudrais prendre rendez-vous&quot;.
              </p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id}>
              <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}
                  >
                    <Bot size={14} style={{ color: GREEN }} />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-gray-950 font-medium'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: GREEN } : undefined}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-gray-800' : 'text-gray-600'}`}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gray-700">
                    <User size={14} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Debug: tool calls */}
              {debugMode && msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="ml-10 mt-2 space-y-1.5">
                  {msg.toolCalls.map((tc, i) => (
                    <div key={i} className="rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span className="font-mono font-medium text-yellow-400">{tc.name}</span>
                      </div>
                      <pre className="text-gray-500 overflow-x-auto">
                        {JSON.stringify(tc.input, null, 2)}
                      </pre>
                      <div className="mt-1 pt-1 border-t border-gray-900">
                        <pre className="text-gray-600 overflow-x-auto whitespace-pre-wrap">
                          {tc.result.substring(0, 300)}{tc.result.length > 300 ? '...' : ''}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}
              >
                <Bot size={14} style={{ color: GREEN }} />
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tapez un message..."
            disabled={loading || !businessId}
            className="flex-1 rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/25 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !businessId}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-gray-950 disabled:opacity-30 hover:opacity-90 transition-all"
            style={{ backgroundColor: GREEN }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
