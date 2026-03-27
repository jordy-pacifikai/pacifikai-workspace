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
  Link2,
  ClipboardCheck,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { CreateAppointmentModal } from '@/components/CreateAppointmentModal';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_FILTERS, SOURCE_CONFIG } from '@/lib/appointment-status';
import type { Appointment, AppointmentStatus } from '@/types/database';

const PAGE_SIZE = 20;

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = APPOINTMENT_STATUS[status];
  return (
    <span
      aria-label={`Statut : ${cfg.label}`}
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', cfg.bg, cfg.text, cfg.border)}
    >
      {cfg.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
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

  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  function handleCopyBookingLink() {
    if (!businessId) return;
    const url = `${window.location.origin}/book/${businessId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }

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

  function handleStatusChange(id: string, status: AppointmentStatus) {
    updateMutation.mutate({ id, updates: { status } });
  }

  function handleDelete(id: string, clientName: string) {
    setDeleteTarget({ id, name: clientName });
  }

  function handleCopyConfirmationLink(appointmentId: string) {
    if (!businessId) return;
    const url = `${window.location.origin}/book/${businessId}/confirmation?id=${appointmentId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Lien de confirmation copié');
    }).catch(() => {
      toast.error('Impossible de copier le lien');
    });
  }

  return (
    <DashboardLayout title="Rendez-vous" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-5">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-500 shrink-0" />
            {APPOINTMENT_STATUS_FILTERS.map((f) => (
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
            <label htmlFor="date-from" className="text-xs text-gray-500">Du</label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              aria-label="Filtrer du date"
              className="bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#25D366] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="date-to" className="text-xs text-gray-500">Au</label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              aria-label="Filtrer au date"
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

        {/* ── Mobile card view ── */}
        <div className="md:hidden space-y-3">
          {/* Skeleton mobile */}
          {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse space-y-3">
              <div className="h-3 bg-gray-800 rounded w-1/3" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          ))}

          {/* Empty state mobile */}
          {!isLoading && paginated.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl py-14 flex flex-col items-center text-center px-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.15)' }}
              >
                <CalendarDays size={26} style={{ color: '#25D366' }} />
              </div>
              {statusFilter !== 'all' || dateFrom || dateTo ? (
                <>
                  <p className="text-sm font-medium text-gray-300 mb-1">Aucun rendez-vous trouvé</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Aucun résultat pour ces filtres. Modifiez les critères ou réinitialisez la recherche.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-300 mb-1">Aucun rendez-vous pour le moment</p>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    Partagez votre lien de réservation avec vos clients pour recevoir vos premiers rendez-vous.
                  </p>
                  <button
                    onClick={handleCopyBookingLink}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                    style={
                      linkCopied
                        ? { backgroundColor: 'rgba(37, 211, 102, 0.12)', borderColor: 'rgba(37, 211, 102, 0.3)', color: '#25D366' }
                        : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: '#374151', color: '#d1d5db' }
                    }
                  >
                    {linkCopied ? (
                      <>
                        <ClipboardCheck size={15} />
                        Lien copié !
                      </>
                    ) : (
                      <>
                        <Link2 size={15} />
                        Copier le lien de réservation
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Cards */}
          {!isLoading && paginated.map((appt) => {
            const clientName = appt.client_name ?? '—';
            const serviceName = appt.service ?? '—';
            const isPending = appt.status === 'pending';
            const isActive = appt.status === 'pending' || appt.status === 'confirmed';

            return (
              <div key={appt.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                {/* Date + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    {format(parseISO(appt.appointment_date), 'd MMM yyyy', { locale: fr })} — {appt.time_slot?.slice(0, 5) ?? '—'}
                  </span>
                  <StatusBadge status={appt.status} />
                </div>

                {/* Client */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{clientName}</p>
                  {appt.client_phone && (
                    <p className="text-xs text-gray-500 truncate">{appt.client_phone}</p>
                  )}
                </div>

                {/* Service + Source */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-300 truncate">{serviceName}</p>
                  <SourceBadge source={appt.source ?? 'manual'} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pt-1 border-t border-gray-800">
                  {isPending && (
                    <button
                      onClick={() => handleStatusChange(appt.id, 'confirmed')}
                      disabled={updateMutation.isPending}
                      title="Confirmer"
                      aria-label={`Confirmer le rendez-vous de ${clientName}`}
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
                      aria-label={`Marquer le rendez-vous de ${clientName} comme terminé`}
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
                      aria-label={`Marquer le rendez-vous de ${clientName} comme no-show`}
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
                      aria-label={`Annuler le rendez-vous de ${clientName}`}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyConfirmationLink(appt.id)}
                    title="Renvoyer confirmation (copier lien)"
                    aria-label={`Copier le lien de confirmation pour ${clientName}`}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                  >
                    <Link2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(appt.id, clientName)}
                    disabled={deleteMutation.isPending}
                    title="Supprimer"
                    aria-label={`Supprimer le rendez-vous de ${clientName}`}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 ml-auto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Load more mobile */}
          {hasMore && !isLoading && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 mx-auto text-sm text-gray-400 hover:text-white transition-colors py-2"
            >
              <ChevronDown size={16} />
              Voir plus ({(appointments?.length ?? 0) - page * PAGE_SIZE} restants)
            </button>
          )}
        </div>

        {/* ── Desktop table view ── */}
        <div role="table" aria-label="Liste des rendez-vous" className="hidden md:block rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          {/* Table header */}
          <div role="row" className="grid grid-cols-[1fr_80px_1.5fr_1.5fr_100px_80px_140px] gap-3 px-4 py-3 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span role="columnheader">Date</span>
            <span role="columnheader">Heure</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Service</span>
            <span role="columnheader">Statut</span>
            <span role="columnheader">Source</span>
            <span role="columnheader" className="text-right">Actions</span>
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
            <div className="py-14 flex flex-col items-center text-center px-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.15)' }}
              >
                <CalendarDays size={26} style={{ color: '#25D366' }} />
              </div>
              {statusFilter !== 'all' || dateFrom || dateTo ? (
                <>
                  <p className="text-sm font-medium text-gray-300 mb-1">Aucun rendez-vous trouvé</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Aucun résultat pour ces filtres. Modifiez les critères ou réinitialisez la recherche.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-300 mb-1">Aucun rendez-vous pour le moment</p>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    Partagez votre lien de réservation avec vos clients pour recevoir vos premiers rendez-vous.
                  </p>
                  <button
                    onClick={handleCopyBookingLink}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                    style={
                      linkCopied
                        ? { backgroundColor: 'rgba(37, 211, 102, 0.12)', borderColor: 'rgba(37, 211, 102, 0.3)', color: '#25D366' }
                        : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: '#374151', color: '#d1d5db' }
                    }
                  >
                    {linkCopied ? (
                      <>
                        <ClipboardCheck size={15} />
                        Lien copié !
                      </>
                    ) : (
                      <>
                        <Link2 size={15} />
                        Copier le lien de réservation
                      </>
                    )}
                  </button>
                </>
              )}
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
                    role="row"
                    className="grid grid-cols-[1fr_80px_1.5fr_1.5fr_100px_80px_140px] gap-3 items-center px-4 py-3 hover:bg-gray-800/40 transition-colors"
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
                          aria-label={`Confirmer le rendez-vous de ${clientName}`}
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
                          aria-label={`Marquer le rendez-vous de ${clientName} comme terminé`}
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
                          aria-label={`Marquer le rendez-vous de ${clientName} comme no-show`}
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
                          aria-label={`Annuler le rendez-vous de ${clientName}`}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyConfirmationLink(appt.id)}
                        title="Renvoyer confirmation (copier lien)"
                        aria-label={`Copier le lien de confirmation pour ${clientName}`}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                      >
                        <Link2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(appt.id, clientName)}
                        disabled={deleteMutation.isPending}
                        title="Supprimer"
                        aria-label={`Supprimer le rendez-vous de ${clientName}`}
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
