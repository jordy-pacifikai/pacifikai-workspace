'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  FileText,
  Bell,
  Plane,
  TrendingUp,
  Users,
  Star,
  ShoppingCart,
  Settings,
  Calendar,
  ListTodo,
  FileBarChart,
  Book
} from 'lucide-react'

const mainNavigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
]

const planningNavigation = [
  { name: 'Calendrier', href: '/calendar', icon: Calendar },
  { name: 'Planner', href: '/planner', icon: ListTodo },
  { name: 'Rapports', href: '/reports', icon: FileBarChart },
]

const buildsNavigation = [
  { name: 'Conversations', href: '/conversations', icon: MessageSquare, build: 1 },
  { name: 'Newsletters', href: '/newsletters', icon: Mail, build: 2 },
  { name: 'Contenu SEO', href: '/content', icon: FileText, build: 3 },
  { name: 'ROI Alerts', href: '/roi', icon: TrendingUp, build: 4 },
  { name: 'Reservations', href: '/bookings', icon: Plane, build: 5 },
  { name: 'Social', href: '/social', icon: Users, build: 6 },
  { name: 'Concurrence', href: '/competitors', icon: TrendingUp, build: 7 },
  { name: 'Vols', href: '/flights', icon: Bell, build: 8 },
  { name: 'Avis', href: '/reviews', icon: Star, build: 9 },
  { name: 'Upsell', href: '/upsell', icon: ShoppingCart, build: 10 },
]

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  build?: number
}

function NavSection({ title, items }: { title?: string; items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <div className="space-y-1">
      {title && (
        <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-atn-secondary text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1 text-sm">{item.name}</span>
            {item.build && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                B{item.build}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

export default function Sidebar() {
  return (
    <div className="w-64 bg-atn-dark text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-atn-secondary rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">ATN Dashboard</h1>
            <p className="text-xs text-white/60">AI Agents Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <NavSection items={mainNavigation} />
        <NavSection title="Planning" items={planningNavigation} />
        <NavSection title="Workflows" items={buildsNavigation} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/guide"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Book className="w-5 h-5" />
          <span>Guide</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}
