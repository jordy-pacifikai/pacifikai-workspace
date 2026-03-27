'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CalendarPlus,
  CalendarX,
  Star,
  UserX,
  Megaphone,
  ListOrdered,
  MessageCircle,
  Mail,
  BellRing,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  DEFAULT_PREFS,
  type NotificationType,
  type NotificationPrefs,
} from '@/hooks/useNotifications';

// ─── Row config ───────────────────────────────────────────────────────────────

interface EventRow {
  type: NotificationType;
  label: string;
  icon: React.ElementType;
}

const EVENT_ROWS: EventRow[] = [
  { type: 'new_booking',       label: 'Nouvelle reservation',        icon: CalendarPlus  },
  { type: 'cancellation',      label: 'Annulation',                  icon: CalendarX     },
  { type: 'review',            label: 'Avis client',                 icon: Star          },
  { type: 'no_show',           label: 'No-show',                     icon: UserX         },
  { type: 'campaign_complete', label: 'Campagne terminee',           icon: Megaphone     },
  { type: 'waitlist_update',   label: 'Mise a jour liste d\'attente', icon: ListOrdered   },
];

const CHANNELS: Array<{ key: keyof typeof DEFAULT_PREFS[NotificationType]; label: string; icon: React.ElementType }> = [
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'email',    label: 'Email',    icon: Mail          },
  { key: 'in_app',   label: 'In-app',   icon: BellRing      },
];

// ─── Checkbox cell ────────────────────────────────────────────────────────────

function PrefCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'w-5 h-5 rounded flex items-center justify-center border transition-all duration-150 mx-auto',
        checked
          ? 'bg-[#25D366] border-[#25D366]'
          : 'bg-gray-800 border-gray-600 hover:border-gray-400',
      )}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="shrink-0">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NotificationPrefsFormProps {
  businessId: string | null;
}

export function NotificationPrefsForm({ businessId }: NotificationPrefsFormProps) {
  const { data: savedPrefs, isLoading } = useNotificationPrefs(businessId);
  const updatePrefs = useUpdateNotificationPrefs(businessId);

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);

  // Sync from server
  useEffect(() => {
    if (savedPrefs) setPrefs(savedPrefs);
  }, [savedPrefs]);

  // Debounced auto-save
  function handleChange(type: NotificationType, channel: keyof NotificationPrefs[NotificationType], value: boolean) {
    const next = {
      ...prefs,
      [type]: { ...prefs[type], [channel]: value },
    };
    setPrefs(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updatePrefs.mutate(next, {
        onSuccess: () => {
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        },
      });
    }, 500);
  }

  // Toggle all for a row
  function handleToggleRow(type: NotificationType) {
    const row = prefs[type];
    const allOn = CHANNELS.every((c) => row[c.key]);
    const next = {
      ...prefs,
      [type]: {
        whatsapp: !allOn,
        email: !allOn,
        in_app: !allOn,
      },
    };
    setPrefs(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updatePrefs.mutate(next), 500);
  }

  // Toggle all for a column
  function handleToggleColumn(channel: keyof NotificationPrefs[NotificationType]) {
    const allOn = EVENT_ROWS.every((r) => prefs[r.type][channel]);
    const next = { ...prefs };
    for (const row of EVENT_ROWS) {
      next[row.type] = { ...next[row.type], [channel]: !allOn };
    }
    setPrefs(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updatePrefs.mutate(next), 500);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Auto-save indicator */}
      <div className="flex items-center justify-end h-5">
        {updatePrefs.isPending && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 size={11} className="animate-spin" />
            Sauvegarde...
          </span>
        )}
        {autoSaved && !updatePrefs.isPending && (
          <span className="flex items-center gap-1.5 text-xs text-[#25D366]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
            Sauvegarde automatique
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-full">
                Evenement
              </th>
              {CHANNELS.map((ch) => (
                <th key={ch.key} className="px-4 py-3 text-center min-w-[80px]">
                  <button
                    type="button"
                    onClick={() => handleToggleColumn(ch.key)}
                    className="flex flex-col items-center gap-1 mx-auto hover:text-white text-gray-400 transition-colors group"
                    title={`Tout activer/desactiver ${ch.label}`}
                  >
                    <ch.icon size={14} className="group-hover:text-[#25D366] transition-colors" />
                    <span className="text-[10px] font-medium">{ch.label}</span>
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-center min-w-[60px]">
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Tout</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {EVENT_ROWS.map(({ type, label, icon: Icon }) => {
              const row = prefs[type];
              const allOn = CHANNELS.every((c) => row[c.key]);
              return (
                <tr key={type} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="shrink-0 text-gray-500" />
                      <span className="text-gray-200">{label}</span>
                    </div>
                  </td>
                  {CHANNELS.map((ch) => (
                    <td key={ch.key} className="px-4 py-3 text-center">
                      <PrefCheckbox
                        checked={row[ch.key]}
                        onChange={(v) => handleChange(type, ch.key, v)}
                        label={`${label} via ${ch.label}`}
                      />
                    </td>
                  ))}
                  {/* Toggle row */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleRow(type)}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded border transition-colors',
                        allOn
                          ? 'text-[#25D366] border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20'
                          : 'text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-600',
                      )}
                      title={allOn ? 'Tout desactiver' : 'Tout activer'}
                    >
                      {allOn ? 'Tout' : 'Aucun'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600 mt-1">
        Les preferences sont sauvegardees automatiquement.
      </p>
    </div>
  );
}
