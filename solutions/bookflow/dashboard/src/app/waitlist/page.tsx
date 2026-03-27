'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Phone, Clock, X, Bell, CalendarCheck, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/components/ui/Toast';
import { useAppStore } from '@/lib/store';
import { useWaitlist, useAddToWaitlist, useUpdateWaitlistEntry, useRemoveFromWaitlist } from '@/hooks/useWaitlist';
import { useServices } from '@/hooks/useServices';
import { cn } from '@/lib/utils';
import type { WaitlistEntry, WaitlistStatus } from '@/types/database';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

const STATUS_CONFIG: Record<WaitlistStatus, { label: string; color: string; bg: string }> = {
  waiting:   { label: 'En attente',  color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  notified:  { label: 'Notifie',     color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  booked:    { label: 'Reserve',     color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
  expired:   { label: 'Expire',      color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  cancelled: { label: 'Annule',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

// ─── Add modal ───────────────────────────────────────────────────────────────

interface AddModalProps {
  businessId: string;
  onClose: () => void;
}

function AddWaitlistModal({ businessId, onClose }: AddModalProps) {
  const { mutate: addEntry, isPending } = useAddToWaitlist();
  const { data: services } = useServices(businessId);

  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    service: '',
    preferred_days: [] as number[],
    preferred_time_start: '',
    preferred_time_end: '',
    notes: '',
  });

  function toggleDay(dayIndex: number) {
    setForm((f) => ({
      ...f,
      preferred_days: f.preferred_days.includes(dayIndex)
        ? f.preferred_days.filter((d) => d !== dayIndex)
        : [...f.preferred_days, dayIndex].sort(),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addEntry(
      {
        business_id: businessId,
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim() || undefined,
        client_email: form.client_email.trim() || undefined,
        service: form.service || undefined,
        preferred_days: form.preferred_days.length > 0 ? form.preferred_days : undefined,
        preferred_time_start: form.preferred_time_start || undefined,
        preferred_time_end: form.preferred_time_end || undefined,
        notes: form.notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Client ajoute a la liste d\'attente');
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
        },
      },
    );
  }

  const inputClass =
    'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-[#25D366] focus:outline-none rounded-lg px-3 py-2 text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="waitlist-modal-title">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-xl z-10">
          <h2 id="waitlist-modal-title" className="text-white font-semibold text-lg">Ajouter a la liste d&apos;attente</h2>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Nom du client *</label>
            <input
              className={inputClass}
              placeholder="Jean Dupont"
              value={form.client_name}
              onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              required
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Telephone</label>
              <input
                className={inputClass}
                placeholder="+689 87 00 00 00"
                value={form.client_phone}
                onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="jean@email.com"
                value={form.client_email}
                onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))}
              />
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Service souhaite</label>
            <select
              className={cn(inputClass, 'appearance-none')}
              value={form.service}
              onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
            >
              <option value="">— Selectionner un service —</option>
              {(services ?? []).map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Preferred days */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Jours preferes</label>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, index) => {
                const selected = form.preferred_days.includes(index);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      selected
                        ? 'bg-[#25D366]/20 border-[#25D366]/40 text-[#25D366]'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Heure debut</label>
              <input
                type="time"
                className={inputClass}
                value={form.preferred_time_start}
                onChange={(e) => setForm((f) => ({ ...f, preferred_time_start: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Heure fin</label>
              <input
                type="time"
                className={inputClass}
                value={form.preferred_time_end}
                onChange={(e) => setForm((f) => ({ ...f, preferred_time_end: e.target.value }))}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
            <textarea
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Informations supplementaires..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-300 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || !form.client_name.trim()}
              className="flex-1 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Waitlist card ───────────────────────────────────────────────────────────

interface WaitlistCardProps {
  entry: WaitlistEntry;
  onNotify: (entry: WaitlistEntry) => void;
  onMarkBooked: (entry: WaitlistEntry) => void;
  onRemove: (entry: WaitlistEntry) => void;
}

function WaitlistCard({ entry, onNotify, onMarkBooked, onRemove }: WaitlistCardProps) {
  const status = STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.waiting;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Position badge */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: status.bg, color: status.color }}
          >
            {entry.position}
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{entry.client_name}</p>
            {entry.client_phone && (
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                <span className="text-xs text-gray-400 truncate">{entry.client_phone}</span>
              </div>
            )}
          </div>
        </div>
        {/* Status badge */}
        <span
          className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Service */}
      {entry.service && (
        <p className="text-sm text-gray-300">
          <span className="text-gray-500">Service :</span> {entry.service}
        </p>
      )}

      {/* Preferred days */}
      {entry.preferred_days && entry.preferred_days.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.preferred_days.map((dayIndex: number) => (
            <span
              key={dayIndex}
              className="px-2 py-0.5 rounded text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300"
            >
              {DAY_LABELS[dayIndex] ?? `J${dayIndex}`}
            </span>
          ))}
        </div>
      )}

      {/* Preferred time */}
      {(entry.preferred_time_start || entry.preferred_time_end) && (
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {entry.preferred_time_start && entry.preferred_time_end
              ? `${entry.preferred_time_start} - ${entry.preferred_time_end}`
              : entry.preferred_time_start
                ? `A partir de ${entry.preferred_time_start}`
                : `Avant ${entry.preferred_time_end}`}
          </span>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <p className="text-xs text-gray-500 italic leading-relaxed">{entry.notes}</p>
      )}

      {/* Actions */}
      {entry.status === 'waiting' && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onNotify(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
            title="Notifier le client"
          >
            <Bell className="w-3.5 h-3.5" />
            Notifier
          </button>
          <button
            onClick={() => onMarkBooked(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
            title="Marquer comme reserve"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Reserve
          </button>
          <button
            onClick={() => onRemove(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors ml-auto"
            title="Retirer de la liste"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {entry.status === 'notified' && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onMarkBooked(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Marquer reserve
          </button>
          <button
            onClick={() => onRemove(entry)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function WaitlistPage() {
  const { businessId, businessName } = useAppStore();
  const queryClient = useQueryClient();
  const { data: entries, isLoading } = useWaitlist(businessId);
  const { mutate: updateEntry } = useUpdateWaitlistEntry();
  const { mutate: removeEntry, isPending: isRemoving } = useRemoveFromWaitlist();

  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<WaitlistEntry | null>(null);

  // Only show active entries (waiting + notified first, then booked, then rest)
  const activeEntries = (entries ?? []).filter((e) => e.status !== 'cancelled');
  const waitingCount = activeEntries.filter((e) => e.status === 'waiting').length;

  async function handleNotify(entry: WaitlistEntry) {
    try {
      const res = await fetch('/api/waitlist/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Erreur de notification');
        return;
      }
      toast.success(`${entry.client_name} a ete notifie${entry.client_phone ? ' par WhatsApp' : ''}`);
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
    } catch {
      toast.error('Erreur de notification');
    }
  }

  function handleMarkBooked(entry: WaitlistEntry) {
    updateEntry(
      { id: entry.id, updates: { status: 'booked' } },
      {
        onSuccess: () => toast.success(`${entry.client_name} marque comme reserve`),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
      },
    );
  }

  function handleConfirmRemove() {
    if (!confirmRemove) return;
    removeEntry(confirmRemove.id, {
      onSuccess: () => {
        toast.success('Client retire de la liste d\'attente');
        setConfirmRemove(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Erreur');
      },
    });
  }

  return (
    <DashboardLayout title="Liste d'attente" businessName={businessName ?? undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Liste d&apos;attente</h1>
            {!isLoading && (
              <span
                className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#FBBF24' }}
              >
                {waitingCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && activeEntries.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">Aucun client en attente</p>
            <p className="text-gray-600 text-xs mt-1">
              Ajoutez un client a la liste d&apos;attente quand aucun creneau n&apos;est disponible.
            </p>
          </div>
        )}

        {/* Cards grid */}
        {!isLoading && activeEntries.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeEntries.map((entry) => (
              <WaitlistCard
                key={entry.id}
                entry={entry}
                onNotify={handleNotify}
                onMarkBooked={handleMarkBooked}
                onRemove={(e) => setConfirmRemove(e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && businessId && (
        <AddWaitlistModal businessId={businessId} onClose={() => setShowAddModal(false)} />
      )}

      {/* Confirm remove */}
      <ConfirmModal
        open={!!confirmRemove}
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemove(null)}
        title="Retirer de la liste ?"
        description={`${confirmRemove?.client_name ?? 'Ce client'} sera retire de la liste d'attente.`}
        confirmLabel="Retirer"
        variant="danger"
        loading={isRemoving}
      />
    </DashboardLayout>
  );
}
