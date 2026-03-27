'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Scissors,
  Clock,
  Users,
  MessageCircle,
  MessageSquareText,
  Plug,
  Settings,
  LogOut,
  X,
  Share2,
  Package,
  FileBarChart,
  Trophy,
  Megaphone,
  Star,
  BarChart3,
  ClipboardCheck,
  CalendarOff,
  RefreshCw,
  Clock3,
  ChevronDown,
  Home,
  UserCircle,
  CreditCard,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  id: string;
  title: string;
  collapsible: boolean;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'tableau-de-bord',
    title: 'Tableau de bord',
    collapsible: false,
    items: [
      { label: 'Accueil',       href: '/',              icon: Home          },
      { label: 'Rendez-vous',   href: '/appointments',  icon: ClipboardList },
      { label: 'Calendrier',    href: '/calendar',      icon: Calendar      },
      { label: 'Clients',       href: '/clients',       icon: Users         },
      { label: 'Conversations', href: '/conversations', icon: MessageCircle },
      { label: 'Agent IA',      href: '/agent',         icon: Bot             },
    ],
  },
  {
    id: 'reservation',
    title: 'Réservation',
    collapsible: true,
    items: [
      { label: 'Services',        href: '/services',   icon: Scissors        },
      { label: 'Forfaits',        href: '/packages',   icon: Package         },
      { label: 'Horaires',        href: '/hours',      icon: Clock           },
      { label: 'Fermetures',      href: '/holidays',   icon: CalendarOff     },
      { label: 'Récurrents',      href: '/recurring',  icon: RefreshCw       },
      { label: "Liste d'attente", href: '/waitlist',   icon: Clock3          },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    collapsible: true,
    items: [
      { label: 'Campagnes', href: '/campaigns',  icon: Megaphone         },
      { label: 'Messages',  href: '/templates',  icon: MessageSquareText },
      { label: 'Fidélité',  href: '/loyalty',    icon: Trophy            },
      { label: 'Partager',  href: '/share',      icon: Share2            },
    ],
  },
  {
    id: 'analyse',
    title: 'Analyse',
    collapsible: true,
    items: [
      { label: 'Statistiques', href: '/stats',      icon: LayoutDashboard },
      { label: 'Analytiques',  href: '/analytics',  icon: BarChart3       },
      { label: 'Rapports',     href: '/reports',    icon: FileBarChart    },
      { label: 'Avis clients', href: '/reviews',    icon: Star            },
      { label: 'Journal',      href: '/audit',      icon: ClipboardCheck  },
    ],
  },
  {
    id: 'configuration',
    title: 'Configuration',
    collapsible: true,
    items: [
      { label: 'Paramètres',   href: '/settings', icon: Settings    },
      { label: 'Facturation',  href: '/billing',  icon: CreditCard  },
      { label: 'Canaux',       href: '/channels', icon: Plug        },
      { label: 'Mon compte',   href: '/account',  icon: UserCircle  },
    ],
  },
];

const STORAGE_KEY = 'sidebar-collapsed-groups';

function getInitialCollapsed(groups: NavGroup[], pathname: string): Record<string, boolean> {
  let stored: Record<string, boolean> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    // localStorage not available (SSR) — ignore
  }

  const result: Record<string, boolean> = {};
  for (const group of groups) {
    if (!group.collapsible) continue;
    const hasActive = group.items.some((item) =>
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
    );
    // Active group is always expanded; otherwise use stored state, default open
    result[group.id] = hasActive ? false : (stored[group.id] ?? false);
  }
  return result;
}

interface SidebarProps {
  businessName?: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ businessName = 'Mon Business', open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const businessId = useAppStore((s) => s.businessId);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    getInitialCollapsed(NAV_GROUPS, pathname),
  );

  // Auto-close on mobile when route changes
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // When pathname changes, ensure the active group is always expanded
  useEffect(() => {
    setCollapsed((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const group of NAV_GROUPS) {
        if (!group.collapsible) continue;
        const hasActive = group.items.some((item) =>
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
        );
        if (hasActive && next[group.id]) {
          next[group.id] = false;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathname]);

  const toggleGroup = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

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
        <nav role="navigation" aria-label="Navigation principale" className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = group.collapsible ? (collapsed[group.id] ?? false) : false;

            return (
              <div key={group.id} className="mb-1">
                {/* Group header */}
                {group.collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={!isCollapsed}
                    aria-controls={`nav-group-${group.id}`}
                    className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors group"
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      size={12}
                      className={cn(
                        'shrink-0 transition-transform duration-200 opacity-50 group-hover:opacity-80',
                        isCollapsed ? '-rotate-90' : 'rotate-0',
                      )}
                    />
                  </button>
                ) : (
                  <p className="px-3 mb-1.5 mt-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                    {group.title}
                  </p>
                )}

                {/* Group items */}
                {!isCollapsed && (
                  <ul id={`nav-group-${group.id}`} className="space-y-0.5 mb-3">
                    {group.items.map(({ label, href, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative',
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
                )}
              </div>
            );
          })}
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
            {businessId && <NotificationBell businessId={businessId} />}
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
