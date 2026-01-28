'use client'

import { useState } from 'react'
import { MessageSquare, Search, Filter, Clock, Zap, Globe } from 'lucide-react'

// Types
interface Conversation {
  id: string
  session: string
  question: string
  response: string
  language: string
  responseTime: number
  tokens: number
  timestamp: string
}

// Données de démo
const demoConversations: Conversation[] = [
  {
    id: '1',
    session: 'ses_abc123',
    question: 'Quels sont les horaires du vol PPT-LAX ?',
    response: 'Le vol TN1 PPT-LAX décolle tous les lundis, mercredis et vendredis à 23h55...',
    language: 'FR',
    responseTime: 1.8,
    tokens: 234,
    timestamp: '2026-01-28T10:23:00',
  },
  {
    id: '2',
    session: 'ses_def456',
    question: 'What is the baggage allowance for Poerava Business?',
    response: 'In Poerava Business Class, you are entitled to 2 checked bags of 32kg each...',
    language: 'EN',
    responseTime: 2.1,
    tokens: 189,
    timestamp: '2026-01-28T10:15:00',
  },
  {
    id: '3',
    session: 'ses_ghi789',
    question: '¿Puedo cambiar mi vuelo sin cargo?',
    response: 'Los cambios de vuelo están sujetos a las condiciones de su tarifa...',
    language: 'ES',
    responseTime: 1.5,
    tokens: 156,
    timestamp: '2026-01-28T09:45:00',
  },
  {
    id: '4',
    session: 'ses_jkl012',
    question: 'ビジネスクラスのラウンジアクセスについて',
    response: 'Poerava Business Classのお客様は、PPT空港のエアタヒチヌイラウンジをご利用いただけます...',
    language: 'JP',
    responseTime: 2.4,
    tokens: 287,
    timestamp: '2026-01-28T09:30:00',
  },
]

// Composant ligne conversation
function ConversationRow({ conversation }: { conversation: Conversation }) {
  const [expanded, setExpanded] = useState(false)
  const langColors: Record<string, string> = {
    FR: 'bg-blue-100 text-blue-700',
    EN: 'bg-emerald-100 text-emerald-700',
    ES: 'bg-amber-100 text-amber-700',
    JP: 'bg-pink-100 text-pink-700',
    CN: 'bg-red-100 text-red-700',
  }

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div
        className="flex items-center gap-4 py-4 cursor-pointer hover:bg-slate-50 px-4 -mx-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`px-2 py-1 rounded text-xs font-medium ${langColors[conversation.language] || 'bg-slate-100 text-slate-700'}`}>
          {conversation.language}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{conversation.question}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{conversation.response}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{conversation.responseTime}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>{conversation.tokens}</span>
          </div>
          <span className="text-xs">
            {new Date(conversation.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 bg-slate-50 -mx-4">
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Question</p>
              <p className="text-sm bg-white p-3 rounded-lg border border-slate-200">
                {conversation.question}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Réponse IA</p>
              <p className="text-sm bg-white p-3 rounded-lg border border-slate-200">
                {conversation.response}
              </p>
            </div>
          </div>
          <div className="flex gap-2 px-4">
            <span className="text-xs text-slate-400">Session: {conversation.session}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const filteredConversations = demoConversations.filter(c => {
    if (filterLang && c.language !== filterLang) return false
    if (searchQuery && !c.question.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Stats
  const totalConversations = demoConversations.length
  const avgResponseTime = (demoConversations.reduce((acc, c) => acc + c.responseTime, 0) / totalConversations).toFixed(1)
  const totalTokens = demoConversations.reduce((acc, c) => acc + c.tokens, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-atn-secondary" />
            Conversations
          </h1>
          <p className="text-slate-500">Build 1: Concierge IA Multilingue</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-500">Aujourd'hui</p>
          <p className="text-2xl font-bold">{totalConversations}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Temps moyen</p>
          <p className="text-2xl font-bold">{avgResponseTime}s</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Tokens utilisés</p>
          <p className="text-2xl font-bold">{totalTokens}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Langues</p>
          <div className="flex gap-1 mt-2">
            {['FR', 'EN', 'ES', 'JP', 'CN'].map(lang => (
              <span key={lang} className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-atn-secondary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded-lg text-sm ${!filterLang ? 'bg-atn-primary text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => setFilterLang(null)}
          >
            Tous
          </button>
          {['FR', 'EN', 'ES', 'JP'].map(lang => (
            <button
              key={lang}
              className={`px-3 py-2 rounded-lg text-sm ${filterLang === lang ? 'bg-atn-primary text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setFilterLang(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="card">
        {filteredConversations.map(conversation => (
          <ConversationRow key={conversation.id} conversation={conversation} />
        ))}
        {filteredConversations.length === 0 && (
          <p className="text-center text-slate-500 py-8">Aucune conversation trouvée</p>
        )}
      </div>
    </div>
  )
}
