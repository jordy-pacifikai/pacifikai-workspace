'use client';

import { useState } from 'react';
import { Trash2, BanIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowser } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockedSlot = {
  id: string;
  business_id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  created_at: string;
};

type FormState = {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type BlockedSlotsProps = {
  businessId: string;
};

export function BlockedSlots({ businessId }: BlockedSlotsProps) {
  const sb = getSupabaseBrowser();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    reason: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Fetch future blocked slots ──────────────────────────────────────────

  const { data: slots = [], isLoading } = useQuery<BlockedSlot[]>({
    queryKey: ['blocked_slots', businessId],
    queryFn: async () => {
      const { data, error } = await sb
        .from('bookbot_blocked_slots')
        .select('*')
        .eq('business_id', businessId)
        .gte('date', todayISO())
        .order('date')
        .order('start_time');
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(businessId),
  });

  // ─── Insert mutation (via server API) ────────────────────────────────────

  const insertMutation = useMutation({
    mutationFn: async (payload: { date: string; startTime: string; endTime: string; reason: string | null }) => {
      const res = await fetch('/api/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur réseau');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked_slots', businessId] });
      setForm({ date: '', start_time: '09:00', end_time: '17:00', reason: '' });
      setFormError(null);
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Erreur lors de l\'ajout. Veuillez réessayer.');
    },
  });

  // ─── Delete mutation (via server API) ───────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/blocked-slots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, businessId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur réseau');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked_slots', businessId] });
    },
  });

  // ─── Submit handler ──────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.date) {
      setFormError('La date est obligatoire.');
      return;
    }
    if (form.start_time >= form.end_time) {
      setFormError('L\'heure de fin doit etre apres l\'heure de debut.');
      return;
    }

    insertMutation.mutate({
      date: form.date,
      startTime: form.start_time,
      endTime: form.end_time,
      reason: form.reason.trim() || null,
    });
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <BanIcon className="w-4 h-4 text-[#25D366]" />
        <h2 className="text-white font-medium">Absences &amp; conges</h2>
      </div>

      {/* Inline form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex gap-3 flex-wrap items-end">
          {/* Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={form.date}
              min={todayISO()}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#25D366] focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          {/* De */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">De</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#25D366] focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          {/* A */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">A</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#25D366] focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Raison */}
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Raison (optionnel)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="ex: Conges, Formation..."
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#25D366] focus:outline-none transition-colors placeholder:text-gray-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={insertMutation.isPending}
            className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap self-end"
          >
            {insertMutation.isPending ? 'Ajout...' : 'Bloquer'}
          </button>
        </div>

        {/* Form error */}
        {formError && (
          <p className="mt-2 text-xs text-red-400">{formError}</p>
        )}
      </form>

      {/* Slots list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-gray-600 italic">Aucune absence planifiee.</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-3 bg-gray-800 border border-gray-700/50 rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/* Date badge */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-700 text-white text-xs font-mono font-medium">
                  {formatDate(slot.date)}
                </span>
                {/* Time range */}
                <span className="text-sm text-gray-300">
                  {slot.start_time} &ndash; {slot.end_time}
                </span>
                {/* Reason */}
                {slot.reason && (
                  <span className="text-xs text-gray-500 italic">{slot.reason}</span>
                )}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => deleteMutation.mutate(slot.id)}
                disabled={deleteMutation.isPending}
                aria-label="Supprimer ce blocage"
                className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
