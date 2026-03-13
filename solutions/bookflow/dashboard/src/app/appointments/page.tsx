'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Plus,
  Check,
  CheckCheck,
  XCircle,
  UserX,
  Trash2,
  ChevronDown,
  Filter,
  CalendarDays,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { CreateAppointmentModal } from '@/components/CreateAppointmentModal';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/database';

// ─── Status config ─────────────────────────────────────────────────────────────

type Status = Appointment['status'];
type Source = string;

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
  gcal:     { label: 'Google',   bg: 'bg-sky-500/15',   text: 'text-sky-400'   },
  messenger:{ label: 'Messenger',bg: 'bg-violet-500/15',text: 'text-violet-400'},
  instagram:{ label: 'Instagram',bg: 'bg-pink-500/15', text: 'text-pink-400'  },
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
  const cfg = SOURCE_CONFIG[source] ?? SOURCE_CONFIG.manual;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.text)}>
      {cfg.label}
    </span>
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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filters = useMemo(() => ({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [statusFilter, dateFrom, dateTo]);

  const { data: appointments, isLoading } = useAppointments(businessId, undefined, filters);
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const paginated = useMemo(() => (appointments ?? []).slice(0, page * PAGE_SIZE), [appointments, page]);
  const hasMore = (appointments?.length ?? 0) > page * PAGE_SIZE;

  function handleStatusChange(id: string, status: Status) {
    updateMutation.mutate({ id, updates: { status } });
  }

  function handleDelete(id: string, clientName: string) {
    setDeleteTarget({ id, name: clientName });
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
                const clientName = appt.client_name ?? '—';
                const serviceName = appt.service ?? '—';
                const isPending = appt.status === 'pending';
                const isActive = appt.status === 'pending' || appt.status === 'confirmed';

                return (
                  <div
                    key={appt.id}
                    className="grid grid-cols-[1fr_80px_1.5fr_1.5fr_100px_80px_120px] gap-3 items-center px-4 py-3 hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Date */}
                    <span className="text-sm text-gray-200">
                      {format(parseISO(appt.appointment_date), 'd MMM yyyy', { locale: fr })}
                    </span>

                    {/* Time */}
                    <span className="text-sm text-gray-400 font-mono">
                      {appt.time_slot?.slice(0, 5) ?? '—'}
                    </span>

                    {/* Client */}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{clientName}</p>
                      {appt.client_phone && (
                        <p className="text-xs text-gray-600 truncate">{appt.client_phone}</p>
                      )}
                    </div>

                    {/* Service */}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-300 truncate">{serviceName}</p>
                    </div>

                    {/* Status */}
                    <StatusBadge status={appt.status} />

                    {/* Source */}
                    <SourceBadge source={appt.source ?? 'manual'} />

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
                      <button
                        onClick={() => handleDelete(appt.id, clientName)}
                        disabled={deleteMutation.isPending}
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
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
        <CreateAppointmentModal businessId={businessId} onClose={() => setShowCreateModal(false)} />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Supprimer ce rendez-vous ?"
        description={`Le rendez-vous de ${deleteTarget?.name ?? ''} sera definitivement supprime. Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
