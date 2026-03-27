'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import {
  useHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
  type Holiday,
  type HolidayInsert,
} from '@/hooks/useHolidays';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Jours fériés PF ─────────────────────────────────────────────────────────

const PF_HOLIDAYS_2026 = [
  { date: '2026-01-01', label: '1er Janvier — Nouvel An' },
  { date: '2026-04-03', label: 'Vendredi Saint' },
  { date: '2026-04-06', label: 'Lundi de Pâques' },
  { date: '2026-05-01', label: 'Fête du Travail' },
  { date: '2026-05-08', label: '8 Mai — Victoire 1945' },
  { date: '2026-05-14', label: 'Ascension' },
  { date: '2026-05-25', label: 'Lundi de Pentecôte' },
  { date: '2026-06-29', label: "Fête de l'Autonomie" },
  { date: '2026-07-14', label: 'Fête Nationale' },
  { date: '2026-08-15', label: 'Assomption' },
  { date: '2026-11-01', label: 'Toussaint' },
  { date: '2026-11-11', label: '11 Novembre — Armistice' },
  { date: '2026-12-25', label: 'Noël' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAY_SHORT_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function formatDateFR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTH_FR[(m ?? 1) - 1]} ${y}`;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Monday = 0 offset
function getMonFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return (day + 6) % 7;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

interface CalendarGridProps {
  year: number;
  month: number;
  holidayDates: Set<string>;
  onDateClick: (date: string) => void;
}

function CalendarGrid({ year, month, holidayDates, onDateClick }: CalendarGridProps) {
  const days = getDaysInMonth(year, month);
  const offset = getMonFirstDayOffset(year, month);
  const today = new Date().toISOString().split('T')[0]!;

  const cells: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...days,
  ];

  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_SHORT_FR.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const iso = date.toISOString().split('T')[0]!;
          const isHoliday = holidayDates.has(iso);
          const isToday = iso === today;

          return (
            <button
              key={iso}
              onClick={() => onDateClick(iso)}
              title={isHoliday ? 'Jour fermé — cliquer pour modifier' : 'Marquer comme fermé'}
              className={cn(
                'aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-150 font-medium',
                isHoliday
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : isToday
                  ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface FormData {
  date: string;
  label: string;
  all_day: boolean;
  start_time: string;
  end_time: string;
  recurring_yearly: boolean;
}

const EMPTY_FORM: FormData = {
  date: '',
  label: 'Fermé',
  all_day: true,
  start_time: '08:00',
  end_time: '17:00',
  recurring_yearly: false,
};

interface HolidayFormModalProps {
  businessId: string;
  holiday?: Holiday;
  prefillDate?: string;
  onClose: () => void;
}

function HolidayFormModal({ businessId, holiday, prefillDate, onClose }: HolidayFormModalProps) {
  const isEdit = Boolean(holiday);
  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();

  const [form, setForm] = useState<FormData>({
    date: holiday?.date ?? prefillDate ?? new Date().toISOString().split('T')[0]!,
    label: holiday?.label ?? 'Fermé',
    all_day: holiday?.all_day ?? true,
    start_time: holiday?.start_time ?? '08:00',
    end_time: holiday?.end_time ?? '17:00',
    recurring_yearly: holiday?.recurring_yearly ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.date) {
      setError('La date est requise.');
      return;
    }
    if (!form.label.trim()) {
      setError('Le libellé est requis.');
      return;
    }
    if (!form.all_day && (!form.start_time || !form.end_time)) {
      setError("Les heures de début et fin sont requises pour une fermeture partielle.");
      return;
    }

    try {
      if (isEdit && holiday) {
        await updateMutation.mutateAsync({
          id: holiday.id,
          updates: {
            date: form.date,
            label: form.label.trim(),
            all_day: form.all_day,
            start_time: form.all_day ? null : form.start_time,
            end_time: form.all_day ? null : form.end_time,
            recurring_yearly: form.recurring_yearly,
          },
        });
        toast.success('Fermeture mise à jour');
      } else {
        const payload: HolidayInsert = {
          business_id: businessId,
          date: form.date,
          label: form.label.trim(),
          all_day: form.all_day,
          start_time: form.all_day ? null : form.start_time,
          end_time: form.all_day ? null : form.end_time,
          recurring_yearly: form.recurring_yearly,
        };
        await createMutation.mutateAsync(payload);
        toast.success('Fermeture ajoutée');
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="holiday-modal-title">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl z-10">
            <h2 id="holiday-modal-title" className="text-white font-semibold">
              {isEdit ? 'Modifier la fermeture' : 'Nouvelle fermeture'}
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

            {/* Date */}
            <div>
              <label className={labelCls}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                required
                className={inputCls}
              />
            </div>

            {/* Label */}
            <div>
              <label className={labelCls}>Libellé *</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setField('label', e.target.value)}
                placeholder="Ex: Fermeture annuelle"
                required
                className={inputCls}
              />
            </div>

            {/* All day toggle */}
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-white font-medium">Journée entière</p>
                <p className="text-xs text-gray-500 mt-0.5">Aucun créneau disponible ce jour</p>
              </div>
              <button
                type="button"
                onClick={() => setField('all_day', !form.all_day)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative shrink-0',
                  form.all_day ? 'bg-[#25D366]' : 'bg-gray-600',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                    form.all_day ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>

            {/* Partial closure hours */}
            {!form.all_day && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Heure début *</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setField('start_time', e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Heure fin *</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setField('end_time', e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Recurring yearly toggle */}
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-white font-medium">Récurrent chaque année</p>
                <p className="text-xs text-gray-500 mt-0.5">Se répète automatiquement</p>
              </div>
              <button
                type="button"
                onClick={() => setField('recurring_yearly', !form.recurring_yearly)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative shrink-0',
                  form.recurring_yearly ? 'bg-[#25D366]' : 'bg-gray-600',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                    form.recurring_yearly ? 'translate-x-5' : 'translate-x-0.5',
                  )}
                />
              </button>
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
                {isPending ? 'Sauvegarde...' : isEdit ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Holiday Row ──────────────────────────────────────────────────────────────

interface HolidayRowProps {
  holiday: Holiday;
  onEdit: (h: Holiday) => void;
  onDelete: (h: Holiday) => void;
}

function HolidayRow({ holiday, onEdit, onDelete }: HolidayRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group">
      {/* Date badge */}
      <div className="shrink-0 w-12 text-center">
        <div className="text-lg font-bold text-red-400 leading-none">
          {holiday.date.split('-')[2]}
        </div>
        <div className="text-[10px] text-gray-500 uppercase mt-0.5">
          {MONTH_FR[(parseInt(holiday.date.split('-')[1] ?? '1', 10) - 1)]?.slice(0, 3)}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-800 shrink-0" />

      {/* Label + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{holiday.label}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {holiday.all_day ? (
            <span className="text-[10px] text-gray-500">Journée entière</span>
          ) : (
            <span className="text-[10px] text-gray-500">
              {holiday.start_time} – {holiday.end_time}
            </span>
          )}
          {holiday.recurring_yearly && (
            <span className="flex items-center gap-0.5 text-[10px] text-blue-400">
              <RefreshCw size={9} />
              Annuel
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(holiday)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          title="Modifier"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(holiday)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HolidaysPage() {
  const { businessId, businessName } = useAppStore();

  const { data: holidays, isLoading } = useHolidays(businessId);
  const createMutation = useCreateHoliday();
  const deleteMutation = useDeleteHoliday();

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Holiday | null>(null);
  const [deletingItem, setDeletingItem] = useState<Holiday | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);
  const [addingPresets, setAddingPresets] = useState(false);

  // Set of holiday ISO dates for fast calendar lookup
  const holidayDates = useMemo(
    () => new Set((holidays ?? []).map((h) => h.date)),
    [holidays],
  );

  function handleCalendarDateClick(date: string) {
    const existing = (holidays ?? []).find((h) => h.date === date);
    if (existing) {
      setEditingItem(existing);
    } else {
      setPrefillDate(date);
      setShowCreateModal(true);
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  async function handleAddPFHolidays() {
    if (!businessId) return;
    setAddingPresets(true);
    let added = 0;
    let skipped = 0;

    for (const h of PF_HOLIDAYS_2026) {
      if (holidayDates.has(h.date)) {
        skipped++;
        continue;
      }
      try {
        await createMutation.mutateAsync({
          business_id: businessId,
          date: h.date,
          label: h.label,
          all_day: true,
          start_time: null,
          end_time: null,
          recurring_yearly: true,
        });
        added++;
      } catch {
        // Skip conflicts (unique constraint)
        skipped++;
      }
    }

    setAddingPresets(false);
    if (added > 0) toast.success(`${added} jour${added > 1 ? 's' : ''} férié${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''}`);
    if (skipped > 0) toast.success(`${skipped} déjà présent${skipped > 1 ? 's' : ''}`);
  }

  function handleDeleteConfirm() {
    if (!deletingItem) return;
    deleteMutation.mutate(deletingItem.id, {
      onSuccess: () => {
        toast.success('Fermeture supprimée');
        setDeletingItem(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      },
    });
  }

  const totalCount = holidays?.length ?? 0;
  const upcomingCount = (holidays ?? []).filter(
    (h) => h.date >= today.toISOString().split('T')[0]!,
  ).length;

  return (
    <DashboardLayout title="Fermetures" businessName={businessName ?? undefined}>
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-white font-semibold text-lg">Jours fériés &amp; Fermetures</h1>
            {!isLoading && totalCount > 0 && (
              <p className="text-gray-500 text-sm mt-0.5">
                {upcomingCount} à venir · {totalCount} au total
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAddPFHolidays}
              disabled={addingPresets || !businessId}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              <CalendarDays size={15} />
              {addingPresets ? 'Ajout...' : 'Fériés PF 2026'}
            </button>
            <button
              onClick={() => { setPrefillDate(undefined); setShowCreateModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>
        </div>

        {/* Calendar + List grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">

          {/* Calendar */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={17} />
              </button>
              <h2 className="text-white font-semibold text-sm">
                {MONTH_FR[calMonth]} {calYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <ChevronRight size={17} />
              </button>
            </div>

            <CalendarGrid
              year={calYear}
              month={calMonth}
              holidayDates={holidayDates}
              onDateClick={handleCalendarDateClick}
            />

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                <span className="text-[10px] text-gray-500">Fermé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#25D366]/10 border border-[#25D366]/30" />
                <span className="text-[10px] text-gray-500">Aujourd'hui</span>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-3">
            {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

            {!isLoading && totalCount === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-gray-900 border border-gray-800 mb-4">
                  <CalendarOff size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">Aucune fermeture configurée</p>
                <p className="text-gray-600 text-sm mt-1 max-w-xs">
                  Ajoutez des jours fériés ou fermetures exceptionnelles pour bloquer les réservations.
                </p>
                <button
                  onClick={() => { setPrefillDate(undefined); setShowCreateModal(true); }}
                  className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <Plus size={16} />
                  Ajouter une fermeture
                </button>
              </div>
            )}

            {!isLoading &&
              (holidays ?? []).map((h) => (
                <HolidayRow
                  key={h.id}
                  holiday={h}
                  onEdit={(item) => setEditingItem(item)}
                  onDelete={(item) => setDeletingItem(item)}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && businessId && (
        <HolidayFormModal
          businessId={businessId}
          prefillDate={prefillDate}
          onClose={() => { setShowCreateModal(false); setPrefillDate(undefined); }}
        />
      )}

      {/* Edit Modal */}
      {editingItem && businessId && (
        <HolidayFormModal
          businessId={businessId}
          holiday={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deletingItem)}
        title="Supprimer la fermeture ?"
        description={`La fermeture du ${deletingItem ? formatDateFR(deletingItem.date) : ''} "${deletingItem?.label ?? ''}" sera supprimée définitivement.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </DashboardLayout>
  );
}
