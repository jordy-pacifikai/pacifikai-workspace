'use client';

import { useState } from 'react';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Clock, User, Scissors, MessageSquare, Plus, Ban, Trash2, CalendarDays, LayoutGrid } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { CreateAppointmentModal } from '@/components/CreateAppointmentModal';
import { useAppStore } from '@/lib/store';
import { useAppointments, useDeleteAppointment } from '@/hooks/useAppointments';
import { useBlockedSlots, useCreateBlockedSlot, useDeleteBlockedSlot, type BlockedSlot } from '@/hooks/useBlockedSlots';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { APPOINTMENT_STATUS, SOURCE_CONFIG } from '@/lib/appointment-status';
import type { Appointment } from '@/types/database';

// ─── Constants ────────────────────────────────────────────────────────────────

const HOUR_START = 7;
const HOUR_END = 20;
const SLOT_HEIGHT = 48; // px per 30-min slot
const SLOTS_PER_HOUR = 2;
const TOTAL_SLOTS = (HOUR_END - HOUR_START) * SLOTS_PER_HOUR;

const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SOURCE_CONFIG).map(([k, v]) => [k, v.label]),
) as Record<string, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToSlotOffset(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h - HOUR_START) * SLOTS_PER_HOUR + Math.floor(m / 30)) * SLOT_HEIGHT;
}

function durationToHeight(duration: number): number {
  // duration is in minutes
  return (duration / 30) * SLOT_HEIGHT;
}

// ─── Appointment Block ─────────────────────────────────────────────────────────

interface AppointmentBlockProps {
  appointment: Appointment;
  onClick: (a: Appointment) => void;
}

function AppointmentBlock({ appointment, onClick }: AppointmentBlockProps) {
  const cfg = APPOINTMENT_STATUS[appointment.status];
  const top = timeToSlotOffset(appointment.time_slot);
  // Estimate duration from time_slot → end_time, fallback 30min
  const durationMin = appointment.end_time
    ? (() => {
        const [sh, sm] = appointment.time_slot.split(':').map(Number);
        const [eh, em] = appointment.end_time.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
      })()
    : 30;
  const height = Math.max(durationToHeight(durationMin), SLOT_HEIGHT / 2);
  const clientName = appointment.client_name ?? 'Inconnu';
  const serviceName = appointment.service ?? '—';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(appointment); }}
      aria-label={`Rendez-vous ${appointment.time_slot?.slice(0, 5) ?? ''} — ${clientName} — ${serviceName} (${APPOINTMENT_STATUS[appointment.status].label})`}
      className={cn(
        'absolute left-1 right-1 rounded-md border-l-2 px-2 py-1 text-left overflow-hidden cursor-pointer transition-opacity hover:opacity-80 z-[2]',
        cfg.bg,
        cfg.border,
        cfg.text,
      )}
      style={{ top, height }}
      title={`${clientName} — ${serviceName}`}
    >
      <p className="text-xs font-semibold truncate leading-tight">{clientName}</p>
      {height >= SLOT_HEIGHT && (
        <p className="text-[10px] truncate opacity-75 leading-tight">{serviceName}</p>
      )}
    </button>
  );
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────

interface DetailDrawerProps {
  appointment: Appointment | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function DetailDrawer({ appointment, onClose, onDelete, isDeleting }: DetailDrawerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!appointment) return null;
  const cfg = APPOINTMENT_STATUS[appointment.status];
  const clientName = appointment.client_name ?? 'Inconnu';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-gray-900 border-l border-gray-800 z-[51] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Detail du RDV</h2>
          <button
            onClick={onClose}
            aria-label="Fermer le detail du rendez-vous"
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', cfg.bg, cfg.border, cfg.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
              {cfg.label}
            </span>
            <span className="text-xs text-gray-500">{SOURCE_LABELS[appointment.source ?? 'manual']}</span>
          </div>

          {/* Date & Time */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={15} className="text-gray-500" />
              <span className="text-sm font-medium">
                {format(parseISO(appointment.appointment_date), 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-xs text-gray-500 ml-[23px]">
                {appointment.time_slot?.slice(0, 5) ?? '—'}{appointment.end_time ? ` — ${appointment.end_time.slice(0, 5)}` : ''}
              </span>
            </div>
          </div>

          {/* Client */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Client</p>
            <div className="flex items-center gap-2 text-gray-200">
              <User size={15} className="text-gray-500 shrink-0" />
              <span className="text-sm font-medium">{clientName}</span>
            </div>
            {appointment.client_phone && (
              <p className="text-xs text-gray-500 ml-[23px]">{appointment.client_phone}</p>
            )}
          </div>

          {/* Service */}
          {appointment.service && (
            <div className="bg-gray-800 rounded-xl p-4 space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Service</p>
              <div className="flex items-center gap-2 text-gray-200">
                <Scissors size={15} className="text-gray-500 shrink-0" />
                <span className="text-sm font-medium">{appointment.service}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
              <div className="flex gap-2 text-gray-300">
                <MessageSquare size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <p className="text-sm">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Delete action */}
        {onDelete && (
          <div className="px-5 py-4 border-t border-gray-800">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={15} />
              Supprimer ce rendez-vous
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Supprimer ce rendez-vous ?"
        description={`Le rendez-vous de ${clientName} sera definitivement supprime. Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isDeleting}
        onConfirm={() => {
          onDelete?.(appointment.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

// ─── Calendar Skeleton ─────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="flex gap-px overflow-x-auto">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 min-w-[120px]">
          <div className="h-12 bg-gray-900 border border-gray-800 rounded-t-lg p-2">
            <div className="skeleton h-3 w-2/3 rounded mb-1" />
            <div className="skeleton h-4 w-1/3 rounded" />
          </div>
          <div className="bg-gray-900/50 border-x border-b border-gray-800 rounded-b-lg" style={{ height: TOTAL_SLOTS * SLOT_HEIGHT }}>
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="mx-1 skeleton rounded-md"
                style={{
                  height: SLOT_HEIGHT * 2,
                  marginTop: j === 0 ? SLOT_HEIGHT : SLOT_HEIGHT * 2,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { businessId, businessName } = useAppStore();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockedSlot | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPrefill, setCreatePrefill] = useState<{ date?: string; time?: string }>({});
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ date: '', allDay: true, timeFrom: '08:00', timeTo: '17:00', reason: '' });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // For month view: build grid from Monday before monthStart to Sunday after monthEnd
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthGridDays: Date[] = [];
  { let d = monthGridStart; while (d <= monthGridEnd) { monthGridDays.push(d); d = addDays(d, 1); } }

  // Fetch range depends on view
  const fetchFrom = view === 'week' ? weekStart : monthGridStart;
  const fetchTo = view === 'week' ? weekEnd : monthGridEnd;

  const { data: appointments, isLoading } = useAppointments(businessId, undefined, {
    dateFrom: format(fetchFrom, 'yyyy-MM-dd'),
    dateTo: format(fetchTo, 'yyyy-MM-dd'),
  });

  const deleteMutation = useDeleteAppointment();
  const { data: blockedSlots } = useBlockedSlots(businessId);
  const createBlock = useCreateBlockedSlot(businessId);
  const deleteBlock = useDeleteBlockedSlot(businessId);

  const today = new Date();
  const isCurrentPeriod = view === 'week'
    ? isSameDay(weekStart, startOfWeek(today, { weekStartsOn: 1 }))
    : isSameMonth(currentDate, today);

  // Time axis labels (07:00 → 20:00 every 30 min)
  const timeLabels = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const totalMins = HOUR_START * 60 + i * 30;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });

  return (
    <DashboardLayout title="Calendrier" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-4">
        {/* Navigation */}
        <div className="space-y-3">
          {/* Nav + view toggle + today */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button
                onClick={() => setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))}
                aria-label={view === 'week' ? 'Semaine precedente' : 'Mois precedent'}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors shrink-0"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))}
                aria-label={view === 'week' ? 'Semaine suivante' : 'Mois suivant'}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors shrink-0"
              >
                <ChevronRight size={16} />
              </button>
              <h2 className="text-white font-semibold text-xs sm:text-sm ml-1 truncate">
                {view === 'week'
                  ? `${format(weekStart, 'd MMM', { locale: fr })} — ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`
                  : format(currentDate, 'MMMM yyyy', { locale: fr })
                }
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {/* View toggle */}
              <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-0.5">
                <button
                  onClick={() => setView('week')}
                  aria-label="Vue semaine"
                  aria-pressed={view === 'week'}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    view === 'week' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300',
                  )}
                  title="Vue semaine"
                >
                  <CalendarDays size={15} />
                </button>
                <button
                  onClick={() => setView('month')}
                  aria-label="Vue mois"
                  aria-pressed={view === 'month'}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    view === 'month' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300',
                  )}
                  title="Vue mois"
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                disabled={isCurrentPeriod}
                className="px-2.5 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <span className="sm:hidden">Auj.</span>
                <span className="hidden sm:inline">Aujourd&apos;hui</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBlockForm({ date: format(new Date(), 'yyyy-MM-dd'), allDay: true, timeFrom: '08:00', timeTo: '17:00', reason: '' }); setShowBlockModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 text-xs sm:text-sm font-medium bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              <Ban size={15} />
              <span className="hidden sm:inline">Bloquer</span>
            </button>
            <button
              onClick={() => { setCreatePrefill({}); setShowCreateModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs sm:text-sm font-medium transition-opacity hover:opacity-90 ml-auto"
              style={{ backgroundColor: '#25D366' }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nouveau</span> RDV
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {(Object.keys(APPOINTMENT_STATUS) as Appointment['status'][]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', APPOINTMENT_STATUS[s].dot)} />
              <span className="text-xs text-gray-500">{APPOINTMENT_STATUS[s].label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Bloque</span>
          </div>
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <CalendarSkeleton />
        ) : view === 'week' ? (
          <div className="overflow-x-auto">
            <div className="flex min-w-[700px]">
              {/* Time axis */}
              <div className="w-14 shrink-0 pt-12">
                {timeLabels.map((label, i) => (
                  <div
                    key={label}
                    className="relative"
                    style={{ height: SLOT_HEIGHT }}
                  >
                    {i % 2 === 0 && (
                      <span className="absolute -top-2 right-2 text-[10px] text-gray-600 select-none">
                        {label}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div role="grid" aria-label="Calendrier semaine" className="flex flex-1 gap-px">
                {weekDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const dayAppointments = (appointments ?? []).filter(
                    (a) => a.appointment_date === dayStr,
                  );
                  const isToday = isSameDay(day, today);

                  return (
                    <div key={dayStr} role="gridcell" aria-label={format(day, 'EEEE d MMMM yyyy', { locale: fr })} className="flex-1 min-w-[100px] flex flex-col">
                      <div
                        className={cn(
                          'h-12 flex flex-col items-center justify-center rounded-t-lg border-x border-t text-center mb-px',
                          isToday
                            ? 'bg-[#25D366]/10 border-[#25D366]/40'
                            : 'bg-gray-900 border-gray-800',
                        )}
                      >
                        <span className={cn('text-[10px] uppercase tracking-wider', isToday ? 'text-[#25D366]' : 'text-gray-500')}>
                          {format(day, 'EEE', { locale: fr })}
                        </span>
                        <span className={cn('text-sm font-bold', isToday ? 'text-[#25D366]' : 'text-gray-200')}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      <div
                        className={cn(
                          'relative flex-1 border-x border-b rounded-b-lg cursor-pointer',
                          isToday ? 'border-[#25D366]/20 bg-[#25D366]/[0.02]' : 'border-gray-800 bg-gray-900/30',
                        )}
                        style={{ height: TOTAL_SLOTS * SLOT_HEIGHT }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const y = e.clientY - rect.top;
                          const slotIndex = Math.floor(y / SLOT_HEIGHT);
                          const hour = HOUR_START + Math.floor(slotIndex / SLOTS_PER_HOUR);
                          const min = (slotIndex % SLOTS_PER_HOUR) * 30;
                          const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                          setCreatePrefill({ date: dayStr, time });
                          setShowCreateModal(true);
                        }}
                      >
                        {timeLabels.map((label, i) => (
                          <div
                            key={label}
                            className={cn('absolute left-0 right-0 border-t', i % 2 === 0 ? 'border-gray-800' : 'border-gray-800/40')}
                            style={{ top: i * SLOT_HEIGHT }}
                          />
                        ))}

                        {(blockedSlots ?? [])
                          .filter((b) => b.date === dayStr)
                          .map((block) => {
                            if (block.all_day) {
                              return (
                                <button
                                  key={block.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}
                                  className="absolute left-0 right-0 bg-red-500/10 border-l-2 border-red-500 z-[1] cursor-pointer hover:bg-red-500/20 transition-colors text-left"
                                  style={{ top: 0, height: TOTAL_SLOTS * SLOT_HEIGHT }}
                                >
                                  <span className="absolute top-2 left-2 text-[10px] text-red-400 font-medium">
                                    {block.source === 'gcal' ? '📅 ' : ''}{block.reason ?? 'Bloque'}
                                  </span>
                                </button>
                              );
                            }
                            if (block.time_from && block.time_to) {
                              const top = timeToSlotOffset(block.time_from);
                              const endOffset = timeToSlotOffset(block.time_to);
                              const height = Math.max(endOffset - top, SLOT_HEIGHT / 2);
                              return (
                                <button
                                  key={block.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedBlock(block); }}
                                  className="absolute left-1 right-1 bg-red-500/15 border-l-2 border-red-500 rounded-md z-[1] cursor-pointer hover:bg-red-500/25 transition-colors px-2 py-1 overflow-hidden text-left"
                                  style={{ top, height }}
                                >
                                  <span className="block text-[10px] text-red-400 font-medium truncate">{block.reason ?? 'Bloque'}</span>
                                </button>
                              );
                            }
                            return null;
                          })}

                        {dayAppointments.map((appt) => (
                          <AppointmentBlock key={appt.id} appointment={appt} onClick={setSelectedAppointment} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ─── Month View ─────────────────────────────────────────── */
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-px mb-px">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                  <div key={d} className="bg-gray-900 border border-gray-800 rounded-t-lg py-2 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">{d}</span>
                  </div>
                ))}
              </div>
              {/* Day cells grid */}
              <div role="grid" aria-label="Calendrier mensuel" className="grid grid-cols-7 gap-px">
                {monthGridDays.map((day) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const isToday = isSameDay(day, today);
                  const isOutsideMonth = !isSameMonth(day, currentDate);
                  const dayAppointments = (appointments ?? []).filter((a) => a.appointment_date === dayStr);
                  const dayBlocked = (blockedSlots ?? []).filter((b) => b.date === dayStr);
                  const hasBlocked = dayBlocked.length > 0;

                  // Group appointments by status for dot display
                  const statusCounts: Partial<Record<Appointment['status'], number>> = {};
                  dayAppointments.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1; });

                  return (
                    <div
                      key={dayStr}
                      role="gridcell"
                      aria-label={`${format(day, 'EEEE d MMMM yyyy', { locale: fr })}${dayAppointments.length > 0 ? `, ${dayAppointments.length} rendez-vous` : ''}`}
                      tabIndex={0}
                      onClick={() => {
                        setView('week');
                        setCurrentDate(day);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setView('week');
                          setCurrentDate(day);
                        }
                      }}
                      className={cn(
                        'min-h-[90px] sm:min-h-[110px] border rounded-lg p-1.5 sm:p-2 cursor-pointer transition-colors group',
                        isOutsideMonth ? 'bg-gray-950/50 border-gray-800/50' : 'bg-gray-900/50 border-gray-800',
                        isToday && 'border-[#25D366]/40 bg-[#25D366]/[0.04]',
                        hasBlocked && !isToday && 'border-red-500/20 bg-red-500/[0.03]',
                        'hover:border-gray-700',
                      )}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            'text-xs sm:text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                            isToday ? 'bg-[#25D366] text-black' : isOutsideMonth ? 'text-gray-700' : 'text-gray-300',
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                          <span className="text-[10px] text-gray-500 font-medium">{dayAppointments.length}</span>
                        )}
                      </div>

                      {/* Event pills — show up to 3 */}
                      <div className="space-y-0.5">
                        {dayAppointments.slice(0, 3).map((appt) => {
                          const cfg = APPOINTMENT_STATUS[appt.status];
                          return (
                            <div
                              key={appt.id}
                              className={cn('flex items-center gap-1 rounded px-1 py-0.5 overflow-hidden', cfg.bg)}
                              onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }}
                            >
                              <span className={cn('w-1 h-1 rounded-full shrink-0', cfg.dot)} />
                              <span className={cn('text-[9px] sm:text-[10px] font-medium truncate', cfg.text)}>
                                {appt.time_slot?.slice(0, 5)} {appt.client_name?.split(' ')[0] ?? ''}
                              </span>
                            </div>
                          );
                        })}
                        {dayAppointments.length > 3 && (
                          <p className="text-[9px] text-gray-500 pl-1">+{dayAppointments.length - 3} autres</p>
                        )}
                        {dayBlocked.map((b) => (
                          <div
                            key={b.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedBlock(b); }}
                            className="flex items-center gap-1 rounded px-1 py-0.5 bg-red-500/10 overflow-hidden cursor-pointer hover:bg-red-500/20 transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                            <span className="text-[9px] sm:text-[10px] text-red-400 truncate">
                              {b.source === 'gcal' ? '📅 ' : ''}{b.all_day ? 'Bloqué' : `${b.time_from?.slice(0, 5)}-${b.time_to?.slice(0, 5)}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer — Appointment */}
      <DetailDrawer
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onDelete={(id) => {
          deleteMutation.mutate(id, {
            onSuccess: () => setSelectedAppointment(null),
          });
        }}
        isDeleting={deleteMutation.isPending}
      />

      {/* Detail Drawer — Blocked Slot */}
      {selectedBlock && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]" onClick={() => setSelectedBlock(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-gray-900 border-l border-gray-800 z-[51] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-white font-semibold">Creneau bloque</h2>
              <button onClick={() => setSelectedBlock(null)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Source badge */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                  selectedBlock.source === 'gcal'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400',
                )}>
                  {selectedBlock.source === 'gcal' ? '📅 Google Calendar' : 'Manuel'}
                </span>
              </div>

              {/* Reason */}
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Motif</p>
                <p className="text-sm text-gray-200">{selectedBlock.reason ?? 'Aucun motif'}</p>
              </div>

              {/* Date & Time */}
              <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={15} className="text-gray-500" />
                  <span className="text-sm font-medium">
                    {format(parseISO(selectedBlock.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                {selectedBlock.all_day ? (
                  <p className="text-xs text-gray-500 ml-[23px]">Journee entiere</p>
                ) : (
                  <p className="text-xs text-gray-500 ml-[23px]">
                    {selectedBlock.time_from?.slice(0, 5)} — {selectedBlock.time_to?.slice(0, 5)}
                  </p>
                )}
              </div>
            </div>

            {/* Delete */}
            <div className="px-5 py-4 border-t border-gray-800">
              <button
                onClick={() => {
                  deleteBlock.mutate(selectedBlock.id, {
                    onSuccess: () => setSelectedBlock(null),
                  });
                }}
                disabled={deleteBlock.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <Trash2 size={15} />
                {deleteBlock.isPending ? 'Suppression...' : 'Supprimer ce blocage'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && businessId && (
        <CreateAppointmentModal
          businessId={businessId}
          onClose={() => setShowCreateModal(false)}
          prefillDate={createPrefill.date}
          prefillTime={createPrefill.time}
        />
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowBlockModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h2 id="calendar-modal-title" className="text-white font-semibold">Bloquer un creneau</h2>
                <button onClick={() => setShowBlockModal(false)} aria-label="Fermer" className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await createBlock.mutateAsync({
                    date: blockForm.date,
                    all_day: blockForm.allDay,
                    time_from: blockForm.allDay ? null : blockForm.timeFrom,
                    time_to: blockForm.allDay ? null : blockForm.timeTo,
                    reason: blockForm.reason || undefined,
                  });
                  setShowBlockModal(false);
                }}
                className="p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={blockForm.date}
                    onChange={(e) => setBlockForm((f) => ({ ...f, date: e.target.value }))}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-white font-medium">Journee entiere</p>
                    <p className="text-xs text-gray-500">Bloquer toute la journee (vacances, fermeture)</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={blockForm.allDay}
                    onClick={() => setBlockForm((f) => ({ ...f, allDay: !f.allDay }))}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200',
                      blockForm.allDay ? 'bg-red-500 border-red-500' : 'bg-gray-700 border-gray-700',
                    )}
                  >
                    <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200', blockForm.allDay ? 'translate-x-5' : 'translate-x-0')} />
                  </button>
                </div>

                {!blockForm.allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">De *</label>
                      <input type="time" value={blockForm.timeFrom} onChange={(e) => setBlockForm((f) => ({ ...f, timeFrom: e.target.value }))} required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">A *</label>
                      <input type="time" value={blockForm.timeTo} onChange={(e) => setBlockForm((f) => ({ ...f, timeTo: e.target.value }))} required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Raison</label>
                  <input
                    type="text"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))}
                    placeholder="Vacances, formation, personnel..."
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                {/* Active blocks list */}
                {(blockedSlots ?? []).filter(b => b.source === 'manual').length > 0 && (
                  <div className="border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-500 mb-2">Blocages actifs</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {(blockedSlots ?? []).filter(b => b.source === 'manual').map((b) => (
                        <div key={b.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-xs text-red-400 font-medium">
                              {format(parseISO(b.date), 'd MMM yyyy', { locale: fr })}
                              {b.all_day ? ' — Journee entiere' : ` ${b.time_from?.slice(0, 5)} - ${b.time_to?.slice(0, 5)}`}
                            </p>
                            {b.reason && <p className="text-[10px] text-gray-500 truncate">{b.reason}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteBlock.mutate(b.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowBlockModal(false)} className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createBlock.isPending}
                    className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {createBlock.isPending ? 'Blocage...' : 'Bloquer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
