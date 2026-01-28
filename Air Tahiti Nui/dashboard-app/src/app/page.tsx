'use client'

import { useState } from 'react'
import {
  Plane,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Mail,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Globe,
  Calendar,
  Eye,
  MousePointer,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Zap
} from 'lucide-react'

// Types
interface RoutePerformance {
  route: string
  from: string
  to: string
  passengers: number
  passengersChange: number
  revenue: number
  revenueChange: number
  loadFactor: number
  loadFactorChange: number
  avgPrice: number
  competitorPrice: number
  trend: 'up' | 'down' | 'stable'
}

interface NewsletterPerf {
  name: string
  segment: string
  sent: number
  opened: number
  clicked: number
  converted: number
  revenue: number
}

interface Review {
  id: string
  platform: string
  rating: number
  author: string
  excerpt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  date: string
  responded: boolean
}

interface CompetitorAlert {
  competitor: string
  route: string
  theirPrice: number
  ourPrice: number
  diff: number
  type: 'lower' | 'promo' | 'new_route'
}

// Demo data - En production, viendrait de l'API
const routeData: RoutePerformance[] = [
  {
    route: 'PPT-LAX',
    from: 'Papeete',
    to: 'Los Angeles',
    passengers: 12450,
    passengersChange: 8.2,
    revenue: 892000000, // XPF
    revenueChange: 12.4,
    loadFactor: 87.3,
    loadFactorChange: 2.1,
    avgPrice: 85000,
    competitorPrice: 78000,
    trend: 'up'
  },
  {
    route: 'PPT-CDG',
    from: 'Papeete',
    to: 'Paris CDG',
    passengers: 8920,
    passengersChange: -3.1,
    revenue: 756000000,
    revenueChange: -1.8,
    loadFactor: 82.1,
    loadFactorChange: -1.5,
    avgPrice: 142000,
    competitorPrice: 138000,
    trend: 'down'
  },
  {
    route: 'PPT-NRT',
    from: 'Papeete',
    to: 'Tokyo Narita',
    passengers: 4230,
    passengersChange: 15.7,
    revenue: 423000000,
    revenueChange: 18.2,
    loadFactor: 91.2,
    loadFactorChange: 4.3,
    avgPrice: 95000,
    competitorPrice: 102000,
    trend: 'up'
  },
  {
    route: 'PPT-AKL',
    from: 'Papeete',
    to: 'Auckland',
    passengers: 3150,
    passengersChange: 2.4,
    revenue: 215000000,
    revenueChange: 3.1,
    loadFactor: 78.5,
    loadFactorChange: 0.8,
    avgPrice: 68000,
    competitorPrice: 65000,
    trend: 'stable'
  }
]

const newsletterPerf: NewsletterPerf[] = [
  { name: 'Promo Bora Bora', segment: 'Loisirs', sent: 24500, opened: 8820, clicked: 1960, converted: 147, revenue: 12500000 },
  { name: 'Business Class', segment: 'Premium', sent: 8200, opened: 4510, clicked: 1230, converted: 89, revenue: 18700000 },
  { name: 'Fidélité Tiare', segment: 'Membres', sent: 15300, opened: 7650, clicked: 2140, converted: 234, revenue: 9800000 },
]

const recentReviews: Review[] = [
  { id: '1', platform: 'TripAdvisor', rating: 5, author: 'Sophie M.', excerpt: 'Service exceptionnel, équipage adorable...', sentiment: 'positive', date: 'Il y a 2h', responded: false },
  { id: '2', platform: 'Google', rating: 2, author: 'Jean P.', excerpt: 'Retard de 3h sans explication...', sentiment: 'negative', date: 'Il y a 4h', responded: false },
  { id: '3', platform: 'TripAdvisor', rating: 4, author: 'Mike T.', excerpt: 'Great flight, food was amazing...', sentiment: 'positive', date: 'Il y a 6h', responded: true },
]

const competitorAlerts: CompetitorAlert[] = [
  { competitor: 'Air France', route: 'PPT-CDG', theirPrice: 138000, ourPrice: 142000, diff: -2.8, type: 'lower' },
  { competitor: 'United', route: 'PPT-LAX', theirPrice: 72000, ourPrice: 85000, diff: -15.3, type: 'promo' },
  { competitor: 'LATAM', route: 'PPT-AKL', theirPrice: 65000, ourPrice: 68000, diff: -4.4, type: 'lower' },
]

// Utility functions
const formatXPF = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}Mds`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const formatPercent = (value: number, showSign = true) => {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// Formatage nombre sans locale pour éviter hydration mismatch
const formatNumber = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Components
function KPICard({ title, value, change, icon: Icon, trend, subtitle }: {
  title: string
  value: string
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
}) {
  const isPositive = change && change > 0
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-atn-primary/10">
          <Icon className="w-5 h-5 text-atn-primary" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            <TrendIcon className="w-3 h-3" />
            {formatPercent(change)}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function RouteCard({ route }: { route: RoutePerformance }) {
  const priceDiff = ((route.avgPrice - route.competitorPrice) / route.competitorPrice) * 100

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            route.trend === 'up' ? 'bg-emerald-100' :
            route.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'
          }`}>
            <Plane className={`w-5 h-5 ${
              route.trend === 'up' ? 'text-emerald-600' :
              route.trend === 'down' ? 'text-red-600' : 'text-slate-600'
            }`} />
          </div>
          <div>
            <p className="font-bold text-lg">{route.route}</p>
            <p className="text-xs text-slate-500">{route.from} → {route.to}</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          route.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
          route.trend === 'down' ? 'bg-red-100 text-red-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {route.trend === 'up' ? '↑ En hausse' : route.trend === 'down' ? '↓ En baisse' : '→ Stable'}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Passagers (30j)</p>
          <p className="font-semibold">{route.passengers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</p>
          <p className={`text-xs ${route.passengersChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatPercent(route.passengersChange)} vs M-1
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Revenu (30j)</p>
          <p className="font-semibold">{formatXPF(route.revenue)} XPF</p>
          <p className={`text-xs ${route.revenueChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatPercent(route.revenueChange)} vs M-1
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Remplissage</p>
          <p className="font-semibold">{route.loadFactor}%</p>
          <p className={`text-xs ${route.loadFactorChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatPercent(route.loadFactorChange)} vs M-1
          </p>
        </div>
      </div>

      {/* Load factor bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Taux de remplissage</span>
          <span className="font-medium text-slate-700">{route.loadFactor}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              route.loadFactor >= 85 ? 'bg-emerald-500' :
              route.loadFactor >= 70 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${route.loadFactor}%` }}
          />
        </div>
      </div>

      {/* Price comparison */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">Notre prix moyen</p>
          <p className="font-semibold">{formatXPF(route.avgPrice)} XPF</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">vs Concurrence</p>
          <p className={`font-semibold ${priceDiff > 5 ? 'text-red-600' : priceDiff < -5 ? 'text-emerald-600' : 'text-slate-700'}`}>
            {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  )
}

function NewsletterCard({ newsletter }: { newsletter: NewsletterPerf }) {
  const openRate = (newsletter.opened / newsletter.sent) * 100
  const clickRate = (newsletter.clicked / newsletter.opened) * 100
  const conversionRate = (newsletter.converted / newsletter.clicked) * 100

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{newsletter.name}</p>
        <p className="text-xs text-slate-500">{newsletter.segment} • {newsletter.sent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} envoyés</p>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-semibold text-blue-600">{openRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-500">Ouvert</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-purple-600">{clickRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-500">Clics</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-emerald-600">{conversionRate.toFixed(0)}%</p>
          <p className="text-xs text-slate-500">Conv.</p>
        </div>
        <div className="text-right min-w-[80px]">
          <p className="font-semibold text-atn-secondary">{formatXPF(newsletter.revenue)}</p>
          <p className="text-xs text-slate-500">XPF</p>
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className={`p-4 rounded-lg border ${
      review.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
      review.sentiment === 'positive' ? 'bg-emerald-50 border-emerald-200' :
      'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-white">{review.platform}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-500">{review.date}</span>
      </div>
      <p className="text-sm text-slate-700 mb-2">"{review.excerpt}"</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">— {review.author}</p>
        {!review.responded && review.sentiment === 'negative' && (
          <button className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Répondre
          </button>
        )}
        {review.responded && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Répondu
          </span>
        )}
      </div>
    </div>
  )
}

function CompetitorAlertCard({ alert }: { alert: CompetitorAlert }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          {alert.competitor} sur {alert.route}
        </p>
        <p className="text-xs text-amber-700">
          {alert.type === 'promo' ? '🔥 Promo flash' : alert.type === 'new_route' ? '✈️ Nouvelle route' : '📉 Prix bas'}
          {' '}• {formatXPF(alert.theirPrice)} XPF ({alert.diff.toFixed(0)}% vs nous)
        </p>
      </div>
      <button className="text-xs font-medium text-amber-700 hover:text-amber-800">
        Analyser
      </button>
    </div>
  )
}

export default function DashboardPage() {
  // KPIs globaux calculés
  const totalPassengers = routeData.reduce((sum, r) => sum + r.passengers, 0)
  const totalRevenue = routeData.reduce((sum, r) => sum + r.revenue, 0)
  const avgLoadFactor = routeData.reduce((sum, r) => sum + r.loadFactor, 0) / routeData.length
  const avgRating = 4.2 // Serait calculé depuis les avis réels
  const pendingReviews = recentReviews.filter(r => !r.responded && r.sentiment === 'negative').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vue d'ensemble</h1>
          <p className="text-slate-500">Performance globale Air Tahiti Nui • Dernière mise à jour il y a 5 min</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option>30 derniers jours</option>
            <option>7 derniers jours</option>
            <option>90 derniers jours</option>
            <option>Cette année</option>
          </select>
          <button className="px-4 py-2 bg-atn-primary text-white rounded-lg text-sm font-medium hover:bg-atn-primary/90 transition-colors flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Rapport complet
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard
          title="Passagers transportés"
          value={totalPassengers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          change={5.8}
          icon={Users}
          subtitle="30 derniers jours"
        />
        <KPICard
          title="Chiffre d'affaires"
          value={`${formatXPF(totalRevenue)} XPF`}
          change={8.3}
          icon={DollarSign}
          subtitle="30 derniers jours"
        />
        <KPICard
          title="Taux de remplissage"
          value={`${avgLoadFactor.toFixed(1)}%`}
          change={1.4}
          icon={Plane}
          subtitle="Moyenne toutes routes"
        />
        <KPICard
          title="Note moyenne"
          value={avgRating.toFixed(1)}
          change={0.2}
          icon={Star}
          subtitle="TripAdvisor + Google"
        />
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            {pendingReviews > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Action requise
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900">{competitorAlerts.length}</p>
          <p className="text-sm text-slate-500 mt-1">Alertes concurrence</p>
          <p className="text-xs text-amber-600 mt-0.5">{pendingReviews} avis négatif à traiter</p>
        </div>
      </div>

      {/* Performance par route */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Performance par route</h2>
          <button className="text-sm text-atn-secondary hover:underline flex items-center gap-1">
            Analyse détaillée <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {routeData.map(route => (
            <RouteCard key={route.route} route={route} />
          ))}
        </div>
      </div>

      {/* Grille inférieure */}
      <div className="grid grid-cols-3 gap-6">
        {/* Performance Newsletters */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100">
                <Mail className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="font-semibold">Performance Newsletters</h2>
                <p className="text-xs text-slate-500">7 derniers jours</p>
              </div>
            </div>
            <button className="text-sm text-atn-secondary hover:underline">
              Voir toutes
            </button>
          </div>

          {/* Stats globales newsletter */}
          <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">48K</p>
              <p className="text-xs text-slate-500">Emails envoyés</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">36%</p>
              <p className="text-xs text-slate-500">Taux d'ouverture</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">22%</p>
              <p className="text-xs text-slate-500">Taux de clic</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">41M</p>
              <p className="text-xs text-slate-500">XPF générés</p>
            </div>
          </div>

          <div className="space-y-2">
            {newsletterPerf.map((nl, i) => (
              <NewsletterCard key={i} newsletter={nl} />
            ))}
          </div>
        </div>

        {/* Avis clients */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold">Avis récents</h2>
                <p className="text-xs text-slate-500">À traiter en priorité</p>
              </div>
            </div>
            <button className="text-sm text-atn-secondary hover:underline">
              Tous les avis
            </button>
          </div>

          {/* Score global */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-bold">{avgRating}</span>
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-xs text-slate-500">Note moyenne</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs w-3">{stars}</span>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: stars === 5 ? '60%' : stars === 4 ? '25%' : stars === 3 ? '10%' : '5%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {recentReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>

      {/* Alertes concurrence */}
      {competitorAlerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold">Veille concurrentielle</h2>
                <p className="text-xs text-slate-500">{competitorAlerts.length} alertes actives</p>
              </div>
            </div>
            <button className="text-sm text-atn-secondary hover:underline">
              Voir l'analyse complète
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {competitorAlerts.map((alert, i) => (
              <CompetitorAlertCard key={i} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Footer status */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            15 agents IA actifs
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            1,247 actions automatisées aujourd'hui
          </span>
        </div>
        <span>Données synchronisées automatiquement</span>
      </div>
    </div>
  )
}
