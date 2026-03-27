import type { AppointmentStatus } from '@/types/database';

// ─── Single source of truth for appointment status display ──────────────────

export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  hex: string;
}

export const APPOINTMENT_STATUS: Record<AppointmentStatus, StatusStyle> = {
  pending:   { label: 'En attente', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/40', dot: 'bg-yellow-500', hex: '#eab308' },
  confirmed: { label: 'Confirmé',   bg: 'bg-[#25D366]/15',  text: 'text-[#25D366]',  border: 'border-[#25D366]/40',  dot: 'bg-[#25D366]',  hex: '#25D366' },
  completed: { label: 'Terminé',    bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/40',   dot: 'bg-blue-500',   hex: '#3b82f6' },
  cancelled: { label: 'Annulé',     bg: 'bg-gray-500/15',   text: 'text-gray-400',   border: 'border-gray-500/40',   dot: 'bg-gray-500',   hex: '#6b7280' },
  no_show:   { label: 'No-show',    bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/40',    dot: 'bg-red-500',    hex: '#ef4444' },
};

export const APPOINTMENT_STATUS_FILTERS: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'Tous'       },
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmés'  },
  { value: 'completed', label: 'Terminés'   },
  { value: 'cancelled', label: 'Annulés'    },
  { value: 'no_show',   label: 'No-show'    },
];

export const SOURCE_CONFIG: Record<string, { label: string; bg: string; text: string; hex: string }> = {
  chatbot:   { label: 'Chatbot',    bg: 'bg-[#25D366]/15', text: 'text-[#25D366]',  hex: '#25D366' },
  whatsapp:  { label: 'WhatsApp',   bg: 'bg-[#25D366]/15', text: 'text-[#25D366]',  hex: '#22c55e' },
  messenger: { label: 'Messenger',  bg: 'bg-violet-500/15',text: 'text-violet-400', hex: '#8b5cf6' },
  instagram: { label: 'Instagram',  bg: 'bg-pink-500/15',  text: 'text-pink-400',   hex: '#ec4899' },
  web:       { label: 'Site web',   bg: 'bg-blue-500/15',  text: 'text-blue-400',   hex: '#06b6d4' },
  app:       { label: 'App',        bg: 'bg-purple-500/15',text: 'text-purple-400', hex: '#a855f7' },
  manual:    { label: 'Manuel',     bg: 'bg-gray-500/15',  text: 'text-gray-400',   hex: '#6b7280' },
  guest:     { label: 'Invité',     bg: 'bg-orange-500/15',text: 'text-orange-400', hex: '#f59e0b' },
  gcal:      { label: 'Google',     bg: 'bg-sky-500/15',   text: 'text-sky-400',    hex: '#0ea5e9' },
};
