'use client';

import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Send,
  Eye,
  MousePointer,
  Reply,
  AlertCircle,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import type { EmailEvent, Prospect } from '@/lib/types';
import { cn } from '@/lib/utils';

const EVENT_CONFIG: Record<
  EmailEvent['event_type'],
  { label: string; Icon: LucideIcon; color: string; bg: string }
> = {
  sent:    { label: 'Email envoyé',   Icon: Send,          color: 'text-blue-400',   bg: 'bg-blue-900/30' },
  opened:  { label: 'Email ouvert',   Icon: Eye,           color: 'text-teal-400',   bg: 'bg-teal-900/30' },
  clicked: { label: 'Lien cliqué',   Icon: MousePointer,  color: 'text-purple-400', bg: 'bg-purple-900/30' },
  replied: { label: 'Réponse reçue', Icon: Reply,         color: 'text-green-400',  bg: 'bg-green-900/30' },
  bounced: { label: 'Email bounced', Icon: AlertCircle,   color: 'text-red-400',    bg: 'bg-red-900/30' },
};

const EMAIL_TYPE_LABELS: Record<EmailEvent['email_type'], string> = {
  initial: 'Email initial',
  j3:      'Relance J+3',
  j7:      'Relance J+7',
  j14:     'Relance J+14',
  custom:  'Email custom',
};

interface EmailTimelineProps {
  prospect: Prospect;
  events?: EmailEvent[];
}

export function EmailTimeline({ prospect, events = [] }: EmailTimelineProps) {
  // Build timeline from prospect timestamps if no events provided
  const syntheticEvents: Array<{
    id: string;
    type: EmailEvent['event_type'];
    email_type: EmailEvent['email_type'];
    date: string;
    subject?: string;
  }> = [];

  if (prospect.email_sent_at) {
    syntheticEvents.push({ id: 'sent', type: 'sent', email_type: 'initial', date: prospect.email_sent_at });
  }
  if (prospect.email_opened_at) {
    syntheticEvents.push({ id: 'opened', type: 'opened', email_type: 'initial', date: prospect.email_opened_at });
  }
  if (prospect.replied_at) {
    syntheticEvents.push({ id: 'replied', type: 'replied', email_type: 'initial', date: prospect.replied_at });
  }

  const timelineItems =
    events.length > 0
      ? events
      : syntheticEvents;

  if (timelineItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Mail size={32} className="text-[#333]" />
        <p className="text-sm text-[#888]">Aucun email envoyé</p>
        <p className="text-xs text-[#666]">Les événements email apparaîtront ici</p>
      </div>
    );
  }

  // Render raw events from hook
  if (events.length > 0) {
    return (
      <div className="flex flex-col">
        {events.map((event, i) => {
          const cfg = EVENT_CONFIG[event.event_type];
          const { Icon } = cfg;
          return (
            <div key={event.id} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', cfg.bg)}>
                  <Icon size={12} className={cfg.color} />
                </div>
                {i < events.length - 1 && (
                  <div className="w-px flex-1 bg-[#222233] my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col pb-4 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#e0e0e0]">{cfg.label}</span>
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', cfg.bg, cfg.color)}>
                    {EMAIL_TYPE_LABELS[event.email_type]}
                  </span>
                </div>
                {event.subject && (
                  <p className="mt-0.5 text-xs text-[#888]">{event.subject}</p>
                )}
                <p className="mt-1 text-[10px] text-[#666]">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: fr })}
                  {' · '}
                  {format(new Date(event.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Render synthetic events
  return (
    <div className="flex flex-col">
      {syntheticEvents.map((event, i) => {
        const cfg = EVENT_CONFIG[event.type];
        const { Icon } = cfg;
        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', cfg.bg)}>
                <Icon size={12} className={cfg.color} />
              </div>
              {i < syntheticEvents.length - 1 && (
                <div className="w-px flex-1 bg-[#222233] my-1" />
              )}
            </div>
            <div className="flex flex-1 flex-col pb-4 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#e0e0e0]">{cfg.label}</span>
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', cfg.bg, cfg.color)}>
                  {EMAIL_TYPE_LABELS[event.email_type]}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-[#666]">
                {formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: fr })}
                {' · '}
                {format(new Date(event.date), 'dd MMM yyyy HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        );
      })}

      {/* Relance count */}
      {prospect.relance_count > 0 && (
        <div className="mt-1 rounded-lg border border-[#222233] bg-[#0a0a12] px-3 py-2 text-xs text-[#888]">
          {prospect.relance_count} relance{prospect.relance_count > 1 ? 's' : ''} effectuée{prospect.relance_count > 1 ? 's' : ''}
          {prospect.last_relance_at && (
            <span> · Dernière : {format(new Date(prospect.last_relance_at), 'dd MMM yyyy', { locale: fr })}</span>
          )}
        </div>
      )}
    </div>
  );
}
