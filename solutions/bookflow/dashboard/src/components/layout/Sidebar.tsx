'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Scissors,
  Clock,
  Users,
  Bot,
  MessageCircle,
  BookOpen,
  Plug,
  Settings,
  LogOut,
  Lightbulb,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Monitoring',
    items: [
      { label: 'Dashboard',    href: '/stats',        icon: LayoutDashboard },
      { label: 'Calendrier',   href: '/calendar',     icon: Calendar        },
      { label: 'Rendez-vous',  href: '/appointments', icon: ClipboardList   },
      { label: 'Clients',      href: '/clients',      icon: Users           },
    ],
  },
  {
    title: 'Configuration IA',
    items: [
      { label: 'Agent IA',      href: '/agent',     icon: Bot             },
      { label: 'Connaissances', href: '/knowledge',  icon: BookOpen        },
      { label: 'Test chatbot',  href: '/chat-test',  icon: MessageCircle   },
      { label: 'Canaux',        href: '/channels',   icon: Plug            },
    ],
  },
  {
    title: 'Mon business',
    items: [
      { label: 'Services',      href: '/services',          icon: Scissors  },
      { label: 'Horaires',      href: '/hours',             icon: Clock     },
      { label: 'Paramètres',    href: '/settings',          icon: Settings  },
      { label: 'Suggestions',   href: '/feature-requests',  icon: Lightbulb },
    ],
  },
];

interface SidebarProps {
  businessName?: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ businessName = 'Mon Business', open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const userEmail = user?.email ?? '';
  const userInitial = (userEmail.charAt(0) || 'U').toUpperCase();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen w-64 flex flex-col bg-gray-950 border-r border-gray-800 z-50 transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}
      >

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/logos/logo-transparent.png" alt="Ve'a" width={52} height={28} className="h-7 w-auto" />
              <div className="relative">
                <span className="text-xl font-bold tracking-tight text-white">
                  Ve&apos;a
                </span>
                <span
                  className="absolute -top-0.5 -right-2.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: '#25D366' }}
                  />
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 truncate">{businessName}</p>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                          active
                            ? 'text-white'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60',
                        )}
                        style={
                          active
                            ? {
                                backgroundColor: 'rgba(37, 211, 102, 0.08)',
                                color: '#25D366',
                              }
                            : undefined
                        }
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                            style={{ backgroundColor: '#25D366' }}
                          />
                        )}
                        <Icon
                          size={17}
                          className="shrink-0 transition-colors"
                          style={active ? { color: '#25D366' } : undefined}
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Bottom — user + logout ────────────────────────────────────── */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{userEmail || 'Mon compte'}</p>
              <p className="text-xs text-gray-500 truncate">Propriétaire</p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} className="shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
