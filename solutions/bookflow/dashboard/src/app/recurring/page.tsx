'use client';

import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Pause,
  Play,
  Repeat,
  X,
  CalendarClock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import { useServices } from '@/hooks/useServices';
import {
  useRecurringAppointments,
  useCreateRecurring,
  useUpdateRecurring,
  useDeleteRecurring,
  type RecurringAppointment,
  type RecurringInsert,
} from '@/hooks/useRecurring';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAY_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Hebdomadaire',
  biweekly: 'Bi-mensuel',
  monthly: 'Mensuel',
};

const FREQUENCY_COLORS: Record<string, { bg: string; text: string }> = {
  weekly: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  biweekly: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  monthly: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
};

// ─── Form Modal ─────────────────────────────────────────────────────────────────

interface FormData {
  client_name: string;
  client_phone: string;
  client_email: string;
  service: string;
  day_of_week: string;
  time_slot: string;
  frequency: string;
  start_date: string;
  end_date: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  client_name: '',
  client_phone: '',
  client_email: '',
  service: '',
  day_of_week: '1',
  time_slot: '09:00',
  frequency: 'weekly',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  notes: '',
};

interface RecurringFormModalProps {
  businessId: string;
  recurring?: RecurringAppointment;
  serviceNames: string[];
  onClose: () => void;
}

function RecurringFormModal({ businessId, recurring, serviceNames, onClose }: RecurringFormModalProps) {
  const isEdit = Boolean(recurring);
  const createMutation = useCreateRecurring();
  const updateMutation = useUpdateRecurring();

  const [form, setForm] = useState<FormData>({
    client_name: recurring?.client_name ?? '',
    client_phone: recurring?.client_phone ?? '',
    client_email: recurring?.client_email ?? '',
    service: recurring?.service ?? '',
    day_of_week: String(recurring?.day_of_week ?? 1),
    time_slot: recurring?.time_slot ?? '09:00',
    frequency: recurring?.frequency ?? 'weekly',
    start_date: recurring?.start_date ?? new Date().toISOString().split('T')[0],
    end_date: recurring?.end_date ?? '',
    notes: recurring?.notes ?? '',
  });
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_name.trim()) {
      setError('Le nom du client est requis.');
      return;
    }
    if (!form.service) {
      setError('Veuillez choisir un service.');
      return;
    }

    try {
      if (isEdit && recurring) {
        await updateMutation.mutateAsync({
          id: recurring.id,
          updates: {
            client_name: form.client_name.trim(),
            client_phone: form.client_phone.trim() || null,
            client_email: form.client_email.trim() || null,
            service: form.service,
            day_of_week: parseInt(form.day_of_week, 10),
            time_slot: form.time_slot,
            frequency: form.frequency as 'weekly' | 'biweekly' | 'monthly',
            start_date: form.start_date,
            end_date: form.end_date || null,
            notes: form.notes.trim() || null,
          },
        });
        toast.success('Rendez-vous récurrent modifié');
      } else {
        const payload: RecurringInsert = {
          business_id: businessId,
          client_name: form.client_name.trim(),
          client_phone: form.client_phone.trim() || null,
          client_email: form.client_email.trim() || null,
          service: form.service,
          staff_id: null,
          day_of_week: parseInt(form.day_of_week, 10),
          time_slot: form.time_slot,
          frequency: form.frequency as 'weekly' | 'biweekly' | 'monthly',
          start_date: form.start_date,
          end_date: form.end_date || null,
          paused: false,
          notes: form.notes.trim() || null,
        };
        await createMutation.mutateAsync(payload);
        toast.success('Rendez-vous récurrent créé');
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const inputCls =
    'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-colors';
  const labelCls = 'block text-xs text-gray-400 mb-1.5';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="recurring-modal-title">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl z-10">
            <h2 id="recurring-modal-title" className="text-white font-semibold">
              {isEdit ? 'Modifier le récurrent' : 'Nouveau récurrent'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Client name */}
            <div>
              <label className={labelCls}>Nom du client *</label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) => setField('client_name', e.target.value)}
                placeholder="Ex: Marie Dupont"
                required
                className={inputCls}
              />
            </div>

            {/* Client phone */}
            <div>
              <label className={labelCls}>Téléphone</label>
              <input
                type="tel"
                value={form.client_phone}
                onChange={(e) => setField('client_phone', e.target.value)}
                placeholder="+689 87 12 34 56"
                className={inputCls}
              />
            </div>

            {/* Service */}
            <div>
              <label className={labelCls}>Service *</label>
              <select
                value={form.service}
                onChange={(e) => setField('service', e.target.value)}
                required
                className={inputCls}
              >
                <option value="">Sélectionner un service</option>
                {serviceNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Day + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Jour *</label>
                <select
                  value={form.day_of_week}
                  onChange={(e) => setField('day_of_week', e.target.value)}
                  className={inputCls}
                >
                  {DAY_LABELS.map((label, i) => (
                    <option key={i} value={String(i)}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Heure *</label>
                <input
                  type="time"
                  value={form.time_slot}
                  onChange={(e) => setField('time_slot', e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className={labelCls}>Fréquence *</label>
              <div className="flex gap-2">
                {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => {
                  const active = form.frequency === freq;
                  const colors = FREQUENCY_COLORS[freq];
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setField('frequency', freq)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-center',
                        active
                          ? cn(colors.bg, colors.text, 'border-current')
                          : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600',
                      )}
                    >
                      {FREQUENCY_LABELS[freq]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start + End date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date de début *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setField('start_date', e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Date de fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setField('end_date', e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                rows={2}
                placeholder="Notes internes..."
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
                disabled={isPending}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#25D366' }}
              >
                {isPending ? 'Sauvegarde...' : isEdit ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Recurring Card ─────────────────────────────────────────────────────────────

interface RecurringCardProps {
  item: RecurringAppointment;
  onEdit: (item: RecurringAppointment) => void;
  onDelete: (item: RecurringAppointment) => void;
  onTogglePause: (item: RecurringAppointment) => void;
  isToggling: boolean;
}

function RecurringCard({ item, onEdit, onDelete, onTogglePause, isToggling }: RecurringCardProps) {
  const freqColors = FREQUENCY_COLORS[item.frequency] ?? FREQUENCY_COLORS.weekly;

  return (
    <div
      className={cn(
        'rounded-xl bg-gray-900 border p-5 flex flex-col gap-3 transition-opacity',
        item.paused ? 'border-gray-800/50 opacity-60' : 'border-gray-800',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-gray-800 text-gray-400 shrink-0">
            <Repeat size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{item.client_name}</h3>
            {item.service && (
              <p className="text-gray-500 text-xs mt-0.5 truncate">{item.service}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onTogglePause(item)}
            disabled={isToggling}
            className={cn(
              'p-1.5 rounded-lg transition-colors disabled:opacity-50',
              item.paused
                ? 'text-[#25D366] hover:bg-[#25D366]/10'
                : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10',
            )}
            title={item.paused ? 'Reprendre' : 'Mettre en pause'}
          >
            {item.paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Day + Time */}
        <div className="flex items-center gap-1 text-gray-500">
          <CalendarClock size={13} />
          <span className="text-xs">
            {DAY_SHORT[item.day_of_week]} {item.time_slot}
          </span>
        </div>

        {/* Frequency badge */}
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            freqColors.bg,
            freqColors.text,
          )}
        >
          {FREQUENCY_LABELS[item.frequency] ?? item.frequency}
        </span>

        {/* Status badge */}
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            item.paused
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-[#25D366]/15 text-[#25D366]',
          )}
        >
          {item.paused ? 'En pause' : 'Actif'}
        </span>
      </div>

      {/* Notes preview */}
      {item.notes && (
        <p className="text-gray-600 text-xs line-clamp-1 border-t border-gray-800 pt-2">
          {item.notes}
        </p>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function RecurringPage() {
  const { businessId, businessName } = useAppStore();

  const { data: recurring, isLoading } = useRecurringAppointments(businessId);
  const { data: services } = useServices(businessId);
  const updateMutation = useUpdateRecurring();
  const deleteMutation = useDeleteRecurring();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringAppointment | null>(null);
  const [deletingItem, setDeletingItem] = useState<RecurringAppointment | null>(null);

  const serviceNames = (services ?? [])
    .filter((s) => s.is_active !== false)
    .map((s) => s.name);

  function handleTogglePause(item: RecurringAppointment) {
    updateMutation.mutate(
      { id: item.id, updates: { paused: !item.paused } },
      {
        onSuccess: () => {
          toast.success(item.paused ? 'Rendez-vous repris' : 'Rendez-vous mis en pause');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Erreur');
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id, {
      onSuccess: () => {
        toast.success('Rendez-vous récurrent supprimé');
        setDeletingItem(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      },
    });
  }

  const activeCount = recurring?.filter((r) => !r.paused).length ?? 0;
  const totalCount = recurring?.length ?? 0;

  return (
    <DashboardLayout title="Récurrents" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-semibold text-lg">Rendez-vous récurrents</h1>
            {!isLoading && totalCount > 0 && (
              <p className="text-gray-500 text-sm mt-0.5">
                {activeCount} actif{activeCount !== 1 ? 's' : ''} · {totalCount} au total
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!isLoading && totalCount === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
                <Repeat size={28} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">Aucun rendez-vous récurrent</p>
              <p className="text-gray-600 text-sm mt-1">
                Créez des rendez-vous automatiques pour vos clients réguliers.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#25D366' }}
              >
                <Plus size={16} />
                Ajouter un récurrent
              </button>
            </div>
          )}

          {!isLoading &&
            recurring?.map((item) => (
              <RecurringCard
                key={item.id}
                item={item}
                onEdit={(r) => setEditingItem(r)}
                onDelete={(r) => setDeletingItem(r)}
                onTogglePause={handleTogglePause}
                isToggling={updateMutation.isPending}
              />
            ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && businessId && (
        <RecurringFormModal
          businessId={businessId}
          serviceNames={serviceNames}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingItem && businessId && (
        <RecurringFormModal
          businessId={businessId}
          recurring={editingItem}
          serviceNames={serviceNames}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deletingItem)}
        title="Supprimer le récurrent ?"
        description={`Le rendez-vous récurrent de "${deletingItem?.client_name ?? ''}" sera supprimé définitivement.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </DashboardLayout>
  );
}
