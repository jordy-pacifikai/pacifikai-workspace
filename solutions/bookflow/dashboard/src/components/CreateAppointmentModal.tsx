'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/database';

type Source = Appointment['source'];

interface CreateAppointmentModalProps {
  businessId: string;
  onClose: () => void;
  prefillDate?: string; // YYYY-MM-DD
  prefillTime?: string; // HH:MM
}

export function CreateAppointmentModal({
  businessId,
  onClose,
  prefillDate,
  prefillTime,
}: CreateAppointmentModalProps) {
  const { data: services } = useServices(businessId);
  const createMutation = useCreateAppointment();

  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    service: '',
    appointment_date: prefillDate ?? format(new Date(), 'yyyy-MM-dd'),
    time_slot: prefillTime ?? '09:00',
    notes: '',
    source: 'manual' as Source,
  });
  const [error, setError] = useState<string | null>(null);

  const selectedService = services?.find((s) => s.name === form.service);

  function calcEndTime(start: string, duration: number): string {
    const parts = start.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const totalMins = h * 60 + m + duration;
    return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.appointment_date || !form.time_slot || !form.service) {
      setError('Date, heure et service sont requis.');
      return;
    }
    const duration = selectedService?.duration ?? 30;
    const end_time = calcEndTime(form.time_slot, duration);

    try {
      await createMutation.mutateAsync({
        business_id: businessId,
        client_name: form.client_name || null,
        client_phone: form.client_phone || null,
        service: form.service,
        appointment_date: form.appointment_date,
        time_slot: form.time_slot,
        end_time,
        status: 'pending',
        source: form.source,
        notes: form.notes || null,
        reminder_sent: false,
        gcal_event_id: null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  }

  const inputCls =
    'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-colors';
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
            {/* Client name */}
            <div>
              <label className={labelCls}>Nom du client</label>
              <input
                type="text"
                value={form.client_name}
                onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                placeholder="Nom du client..."
                className={inputCls}
              />
            </div>

            {/* Client phone */}
            <div>
              <label className={labelCls}>Téléphone</label>
              <input
                type="tel"
                value={form.client_phone}
                onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))}
                placeholder="+689 87 12 34 56"
                className={inputCls}
              />
            </div>

            {/* Service */}
            <div>
              <label className={labelCls}>Service *</label>
              <select
                value={form.service}
                onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                required
                className={inputCls}
              >
                <option value="">-- Choisir un service --</option>
                {services?.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.duration} min
                    {s.price ? ` · ${s.price.toLocaleString('fr-FR')} XPF` : ''})
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
                  value={form.appointment_date}
                  onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Heure *</label>
                <input
                  type="time"
                  value={form.time_slot}
                  onChange={(e) => setForm((f) => ({ ...f, time_slot: e.target.value }))}
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
