'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CalendarPlus,
  CalendarX,
  Star,
  UserX,
  Megaphone,
  ListOrdered,
  CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  type NotificationType,
  type AppNotification,
} from '@/hooks/useNotifications';
import { useAppStore } from '@/lib/store';

// ─── Icon per type ────────────────────────────────────────────────────────────

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  new_booking:       CalendarPlus,
  cancellation:      CalendarX,
  review:            Star,
  no_show:           UserX,
  campaign_complete: Megaphone,
  waitlist_update:   ListOrdered,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  new_booking:       'text-emerald-400 bg-emerald-500/10',
  cancellation:      'text-red-400 bg-red-500/10',
  review:            'text-amber-400 bg-amber-500/10',
  no_show:           'text-orange-400 bg-orange-500/10',
  campaign_complete: 'text-blue-400 bg-blue-500/10',
  waitlist_update:   'text-purple-400 bg-purple-500/10',
};

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = TYPE_ICON[notification.type] ?? Bell;
  const colorClass = TYPE_COLOR[notification.type] ?? 'text-gray-400 bg-gray-500/10';

  const relativeTime = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <button
      type="button"
      onClick={() => !notification.is_read && onRead(notification.id)}
      className={cn(
        'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-800/50 transition-colors duration-100',
        !notification.is_read && 'bg-blue-500/5',
      )}
    >
      {/* Type icon */}
      <span className={cn('mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center', colorClass)}>
        <Icon size={14} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white leading-snug truncate">
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-blue-500" aria-label="Non lu" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{notification.message}</p>
        <p className="mt-1 text-[11px] text-gray-600">{relativeTime}</p>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NotificationBellProps {
  businessId?: string;
}

export function NotificationBell({ businessId: propBusinessId }: NotificationBellProps) {
  const storeBusinessId = useAppStore((s) => s.businessId);
  const businessId = propBusinessId ?? storeBusinessId ?? undefined;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications(businessId ?? null);
  const { data: unreadCount = 0 } = useUnreadCount(businessId ?? null);
  const markAsRead = useMarkAsRead(businessId ?? null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function handleOpen() {
    setOpen((prev) => !prev);
  }

  function handleMarkOne(id: string) {
    markAsRead.mutate(id);
  }

  function handleMarkAll() {
    markAsRead.mutate('all');
  }

  if (!businessId) return null;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-150"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-0.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-red-500">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-11 right-0 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markAsRead.isPending}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#25D366] transition-colors disabled:opacity-50"
              >
                <CheckCheck size={13} />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-800/60" role="list">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={24} className="mx-auto mb-2 text-gray-700" />
                <p className="text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onRead={handleMarkOne} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
