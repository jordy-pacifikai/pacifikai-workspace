'use client';

import { Bell, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TopBarProps {
  title: string;
  notificationCount?: number;
  onMenuToggle: () => void;
}

export function TopBar({ title, notificationCount = 0, onMenuToggle }: TopBarProps) {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 h-16 flex items-center justify-between px-4 sm:px-6 z-30 border-b border-gray-800"
      style={{
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Left: hamburger + page title ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-150"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-lg font-semibold text-white tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* ── Right: actions ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs text-gray-400 font-medium">
          {todayFormatted}
        </span>

        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-150"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {notificationCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
