'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Plus,
  X,
  Check,
  CheckCheck,
  XCircle,
  UserX,
  ChevronDown,
  Filter,
  CalendarDays,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/database';

// ─── Status config ─────────────────────────────────────────────────────────────

type Status = Appointment['status'];
type Source = Appointment['source'];

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: 'En attente', bg: 'bg-yellow-500/15', text: 'text-yellow-400',  border: 'border-yellow-500/40'  },
  confirmed: { label: 'Confirmé',   bg: 'bg-[#25D366]/15',  text: 'text-[#25D366]',   border: 'border-[#25D366]/40'   },
  completed: { label: 'Terminé',    bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/40'    },
  cancelled: { label: 'Annulé',    bg: 'bg-gray-500/15',   text: 'text-gray-400',    border: 'border-gray-500/40'    },
  no_show:   { label: 'No-show',   bg: 'bg-red-500/15',    text: 'text-red-400',     border: 'border-red-500/40'     },
};

const SOURCE_CONFIG: Record<Source, { label: string; bg: string; text: string }> = {
  chatbot:  { label: 'Chatbot',  bg: 'bg-[#25D366]/15', text: 'text-[#25D366]' },
  whatsapp: { label: 'WhatsApp', bg: 'bg-[#25D366]/15', text: 'text-[#25D366]' },
  web:      { label: 'Web',      bg: 'bg-blue-500/15',  text: 'text-blue-400'  },
  app:      { label: 'App',      bg: 'bg-purple-500/15',text: 'text-purple-400'},
  manual:   { label: 'Manuel',   bg: 'bg-gray-500/15',  text: 'text-gray-400'  },
  guest:    { label: 'Invité',   bg: 'bg-orange-500/15',text: 'text-orange-400'},
};

const STATUS_FILTERS: { value: Status | 'all'; label: string }[] = [
  { value: 'all',       label: 'Tous'      },
  { value: 'pending',   label: 'En attente'},
  { value: 'confirmed', label: 'Confirmés' },
  { value: 'completed', label: 'Terminés'  },
  { value: 'cancelled', label: 'Annulés'   },
  { value: 'no_show',   label: 'No-show'   },
];

const PAGE_SIZE = 20;

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cfg.bg, cfg.text, cfg.border)}>
      {cfg.label}
    </span>
  );
}

function SourceBadge({ source }: { source: Source }) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
  );
}

// ─── Creation Modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
  businessId: string;
  onClose: () => void;
}

function CreateModal({ businessId, onClose }: CreateModalProps) {
  const { data: services } = useServices(businessId);
  const { data: clients } = useClients(businessId);
  const createMutation = useCreateAppointment();

  const [form, setForm] = useState({
    client_id: '' as string | null,
    service_id: '' as string | null,
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    notes: '',
    source: 'manual' as Source,
  });
  const [error, setError] = useState<string | null>(null);

  const selectedService = services?.find((s) => s.id === form.service_id);

  function calcEndTime(start: string, duration: number): string {
    const [h, m] = start.split(':').map(Number);
    const totalMins = h * 60 + m + duration;
    return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.start_time || !form.service_id) {
      setError('Date, heure et service sont requis.');
      return;
    }
    const duration = selectedService?.duration ?? 30;
    const end_time = calcEndTime(form.start_time, duration);

    try {
      await createMutation.mutateAsync({
        business_id: businessId,
        client_id: form.client_id || null,
        service_id: form.service_id || null,
        date: form.date,
        start_time: form.start_time + ':00',
        end_time: end_time + ':00',
        duration,
        status: 'pending',
        source: form.source,
        notes: form.notes || null,
        pro_notes: null,
        price: selectedService?.price ?? null,
        guest_name: null,
        guest_phone: null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  }

  const inputCls = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-colors';
  const labelCls = 'block text-xs text-gray-400 mb-1';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Nouveau rendez-vous</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Client */}
            <div>
              <label className={labelCls}>Client</label>
              <select
                value={form.client_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value || null }))}
                className={inputCls}
              >
                <option value="">-- Sans client (invité) --</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <label className={labelCls}>Service *</label>
              <select
                value={form.service_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value || null }))}
                required
                className={inputCls}
              >
                <option value="">-- Choisir un service --</option>
                {services?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} min{s.price ? ` · ${s.price.toLocaleString('fr-FR')} XPF` : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Heure *</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <label className={labelCls}>Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as Source }))}
                className={inputCls}
              >
                <option value="manual">Manuel</option>
                <option value="web">Web</option>
                <option value="app">App</option>
                <option value="chatbot">Chatbot</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Notes pour ce RDV..."
                className={cn(inputCls, 'resize-none')}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60"
                style={{ backgroundColor: '#25D366' }}
              >
                {createMutation.isPending ? 'Création...' : 'Créer le RDV'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { businessId, businessName } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filters = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [statusFilter, dateFrom, dateTo]);

  const { data: appointments, isLoading } = useAppointments(businessId, undefined, filters);
  const updateMutation = useUpdateAppointment();

  const paginated = useMemo(() => (appointments ?? []).slice(0, page * PAGE_SIZE), [appointments, page]);
  const hasMore = (appointments?.length ?? 0) > page * PAGE_SIZE;

  function handleStatusChange(id: string, status: Status) {
    updateMutation.mutate({ id, updates: { status } });
  }

  return (
    <DashboardLayout title="Rendez-vous" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-5">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-500 shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                  statusFilter === f.value
                    ? 'bg-[#25D366] text-white border-[#25D366]'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Create button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <Plus size={16} />
            Nouveau RDV
          </button>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarDays size={14} className="text-gray-500 shrink-0" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#25D366] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#25D366] transition-colors"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_1.5fr_1.5fr_100px_80px_120px] gap-3 px-4 py-3 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>Date</span>
            <span>Heure</span>
            <span>Client</span>
            <span>Service</span>
            <span>Statut</span>
            <span>Source</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Skeleton */}
          {isLoading && (
            <div className="divide-y divide-gray-800">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4">
                  <SkeletonRow />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && paginated.length === 0 && (
            <div className="py-16 text-center">
              <CalendarDays size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aucun rendez-vous trouvé</p>
              <p className="text-gray-600 text-xs mt-1">Modifie les filtres ou crée un nouveau RDV</p>
            </div>
          )}

          {/* Rows */}
          {!isLoading && paginated.length > 0 && (
            <div className="divide-y divide-gray-800">
              {paginated.map((appt) => {
                const clientName = appt.client?.name ?? appt.guest_name ?? '—';
                const serviceName = appt.service?.name ?? '—';
                const isPending = appt.status === 'pending';
                const isActive = appt.status === 'pending' || appt.status === 'confirmed';

                return (
                  <div
                    key={appt.id}
                    className="grid grid-cols-[1fr_80px_1.5fr_1.5fr_100px_80px_120px] gap-3 items-center px-4 py-3 hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Date */}
                    <span className="text-sm text-gray-200">
                      {format(parseISO(appt.date), 'd MMM yyyy', { locale: fr })}
                    </span>

                    {/* Time */}
                    <span className="text-sm text-gray-400 font-mono">
                      {appt.start_time.slice(0, 5)}
                    </span>

                    {/* Client */}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{clientName}</p>
                      {appt.client?.phone && (
                        <p className="text-xs text-gray-600 truncate">{appt.client.phone}</p>
                      )}
                    </div>

                    {/* Service */}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-300 truncate">{serviceName}</p>
                      <p className="text-xs text-gray-600">{appt.duration} min</p>
                    </div>

                    {/* Status */}
                    <StatusBadge status={appt.status} />

                    {/* Source */}
                    <SourceBadge source={appt.source} />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      {isPending && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'confirmed')}
                          disabled={updateMutation.isPending}
                          title="Confirmer"
                          className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors disabled:opacity-50"
                        >
                          <Check size={15} />
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'completed')}
                          disabled={updateMutation.isPending}
                          title="Marquer terminé"
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                        >
                          <CheckCheck size={15} />
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'no_show')}
                          disabled={updateMutation.isPending}
                          title="No-show"
                          className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                        >
                          <UserX size={15} />
                        </button>
                      )}
                      {isActive && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'cancelled')}
                          disabled={updateMutation.isPending}
                          title="Annuler"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load more */}
          {hasMore && !isLoading && (
            <div className="px-4 py-3 border-t border-gray-800 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 mx-auto text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown size={16} />
                Voir plus ({(appointments?.length ?? 0) - page * PAGE_SIZE} restants)
              </button>
            </div>
          )}
        </div>

        {/* Count */}
        {!isLoading && appointments && appointments.length > 0 && (
          <p className="text-xs text-gray-600 text-right">
            {paginated.length} / {appointments.length} rendez-vous
          </p>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && businessId && (
        <CreateModal businessId={businessId} onClose={() => setShowCreateModal(false)} />
      )}
    </DashboardLayout>
  );
}
